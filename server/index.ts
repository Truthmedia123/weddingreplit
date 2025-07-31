import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { 
  securityHeaders, 
  generalRateLimit, 
  apiRateLimit, 
  sanitizeInput,
  corsOptions 
} from "./middleware/security";
import { 
  errorHandler, 
  notFoundHandler, 
  asyncHandler 
} from "./middleware/errorHandler";
// import { 
//   healthCheckHandler, 
//   readinessCheckHandler, 
//   livenessCheckHandler 
// } from "./monitoring/healthCheck";
// import { imageOptimizationMiddleware } from "./middleware/imageOptimization";
// import { generateSitemap, generateRobotsTxt } from "./seo/sitemap";
import path from "path";

const app = express();

// Security middleware (temporarily simplified for debugging)
// app.use(securityHeaders);
app.use(cors(corsOptions));
// app.use(generalRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Input sanitization (temporarily disabled for debugging)
// app.use(sanitizeInput);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Health check endpoints (temporarily disabled for debugging)
  // app.get('/health', asyncHandler(healthCheckHandler));
  // app.get('/health/ready', readinessCheckHandler);
  // app.get('/health/live', livenessCheckHandler);

  // SEO endpoints (temporarily disabled)
  // app.get('/sitemap.xml', asyncHandler(generateSitemap));
  // app.get('/robots.txt', generateRobotsTxt);

  // Image optimization endpoint (temporarily disabled)
  // app.get('/api/images/optimize', asyncHandler(imageOptimizationMiddleware));

  // API routes with stricter rate limiting (temporarily disabled)
  // app.use('/api', apiRateLimit);
  const server = await registerRoutes(app);

  // Serve static files from attached_assets directory
  app.use('/attached_assets', express.static(path.resolve(import.meta.dirname, '../attached_assets')));

  // 404 handler for API routes
  app.use('/api/*', notFoundHandler);

  // Setup Vite in development or serve static files in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Global error handler
  app.use(errorHandler);

  // Graceful shutdown handling
  const gracefulShutdown = (signal: string) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  const port = process.env.PORT || 5005;
  server.listen(port, () => {
    log(`🚀 Server running on port ${port}`);
    log(`📊 Health check: http://localhost:${port}/health`);
    log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();
