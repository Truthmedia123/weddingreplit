/**
 * Development Server
 * Simple server for local development that uses mock data
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { setupVite, serveStatic, log } from "./vite";

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security and middleware imports (simplified for development)
import { 
  corsOptions,
  sanitizeInput
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
import { generateSitemap, generateRobotsTxt } from "./seo/sitemap";

// Mock storage for development
import { mockDb, initializeMockData } from "./mock-db";

// Async handler wrapper for error handling
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const app = express();

// Export app for testing
export { app };

// Development configuration
app.set('trust proxy', true);

// Basic middleware for development
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(sanitizeInput);

// Request logging for development
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
        logLine = `${logLine.slice(0, 79)  }…`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize mock data
  await initializeMockData();

  // Health check endpoints - ENABLED
  app.get('/health', asyncHandler(healthCheckHandler));
  app.get('/health/ready', readinessCheckHandler);
  app.get('/health/live', livenessCheckHandler);

  // SEO endpoints - ENABLED
  app.get('/sitemap.xml', asyncHandler(generateSitemap));
  app.get('/robots.txt', asyncHandler(generateRobotsTxt));

  // Simple API routes for development
  app.get("/api/vendors", async (req, res) => {
    try {
      // Return mock vendor data
      const mockVendors = [
        {
          id: 1,
          name: "Goa Wedding Photography",
          email: "contact@goaweddingphoto.com",
          phone: "+91-98765-43210",
          category: "photography",
          location: "Panaji, Goa",
          description: "Professional wedding photography services in Goa",
          services: "Wedding Photography, Pre-wedding, Engagement",
          website: "https://goaweddingphoto.com",
          rating: 4.8,
          reviewCount: 45,
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: "Beachside Catering",
          email: "info@beachsidecatering.com",
          phone: "+91-98765-43211",
          category: "catering",
          location: "Calangute, Goa",
          description: "Fresh seafood and Goan cuisine for your special day",
          services: "Wedding Catering, Seafood, Goan Cuisine",
          website: "https://beachsidecatering.com",
          rating: 4.6,
          reviewCount: 32,
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      res.json(mockVendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.get("/api/vendors/featured", async (_req, res) => {
    try {
      const mockVendors = [
        {
          id: 1,
          name: "Goa Wedding Photography",
          email: "contact@goaweddingphoto.com",
          phone: "+91-98765-43210",
          category: "photography",
          location: "Panaji, Goa",
          description: "Professional wedding photography services in Goa",
          services: "Wedding Photography, Pre-wedding, Engagement",
          website: "https://goaweddingphoto.com",
          rating: 4.8,
          reviewCount: 45,
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      res.json(mockVendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured vendors" });
    }
  });



  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  const port = parseInt(process.env.PORT || '5002');
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Development server running on http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🗺️  Sitemap: http://localhost:${port}/sitemap.xml`);
    console.log(`🤖 Robots: http://localhost:${port}/robots.txt`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Database: Mock (in-memory)`);
    console.log(`📝 API: http://localhost:${port}/api/vendors`);
  });

  // Static file serving
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  return server;
})();
