/**
 * ⚠️  SECURITY WARNING ⚠️
 * 
 * This is the main server file with all security middleware ENABLED.
 * 
 * Security features enabled:
 * - Rate limiting (general and API-specific)
 * - Input sanitization
 * - CORS restrictions
 * - Content Security Policy (CSP)
 * - Helmet security headers
 * - Health check endpoints
 * - Proper error handling
 * 
 * NEVER disable these security features in production!
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security and middleware imports
import { 
  securityHeaders, 
  corsOptions,
  generalRateLimit,
  apiRateLimit,
  sanitizeInput,
  validateApiKey,
  validateOrigin,
  securityAuditLog
} from "./middleware/security";
import { 
  errorHandler, 
  notFoundHandler 
} from "./middleware/errorHandler";
import { 
  healthCheckHandler, 
  readinessCheckHandler, 
  livenessCheckHandler 
} from "./monitoring/healthCheck";
import { imageOptimizationMiddleware } from "./middleware/imageOptimization";
import { generateSitemap, generateRobotsTxt } from "./seo/sitemap";

// Async handler wrapper for error handling
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const app = express();

// Export app for testing
export { app };

// Trust proxy configuration - only trust specific proxies in production
if (process.env.NODE_ENV === 'production') {
  // Only trust specific proxy IPs in production
  app.set('trust proxy', ['127.0.0.1', '::1']);
} else {
  // In development, trust proxy but with rate limiting disabled for local testing
  app.set('trust proxy', true);
}

// Security middleware - ENABLED
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(generalRateLimit);
app.use(securityAuditLog);
app.use(validateOrigin);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Input sanitization - ENABLED
app.use(sanitizeInput);

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
  // Health check endpoints - ENABLED
  app.get('/health', asyncHandler(healthCheckHandler));
  app.get('/health/ready', readinessCheckHandler);
  app.get('/health/live', livenessCheckHandler);

  // SEO endpoints - ENABLED
  app.get('/sitemap.xml', asyncHandler(generateSitemap));
  app.get('/robots.txt', generateRobotsTxt);

  // Image optimization endpoint - ENABLED
  app.get('/api/images/optimize', asyncHandler(imageOptimizationMiddleware));

  // API routes with stricter rate limiting and security - ENABLED
  app.use('/api', apiRateLimit);
  app.use('/api', validateApiKey); // API key validation for all API routes
  const server = await registerRoutes(app);

  // Serve static files from attached_assets directory
  app.use('/attached_assets', express.static(path.resolve(__dirname, '../attached_assets')));

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

  const port = process.env.PORT || 5002;
  server.listen(port as number, "0.0.0.0", () => {
    log(`🚀 Server running on port ${port}`);
    log(`📊 Health check: http://localhost:${port}/health`);
    log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();
