import "dotenv/config";

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
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { registerRoutes } from "./routes";
import supabaseDbConnection from "./db/connection-supabase";
import { initializeStorage } from "./storage";
import { redisCache } from "./cache/redis";

// Debug environment variables
console.log('🔍 Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('PORT:', process.env.PORT);

const app = express();
const PORT = process.env.PORT || 5002;

// Export app for testing
export { app };

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://thegoanwedding.com', 'https://www.thegoanwedding.com']
    : ['http://localhost:3000', 'http://localhost:5002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Trust proxy configuration
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



// Performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await supabaseDbConnection.healthCheck();
    const redisHealth = await redisCache.healthCheck();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      redis: redisHealth,
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
      },
    };

    res.json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Initialize application
async function initializeApp() {
  try {
    console.log('🚀 Initializing Wedding Directory Platform...');
    
    // Initialize database
    await supabaseDbConnection.connect();
    console.log('✅ Database initialized');
    
    // Initialize storage with Redis
    await initializeStorage();
    console.log('✅ Storage layer initialized');
    
    // Register API routes
    await registerRoutes(app);
    console.log('✅ API routes registered');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🎉 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    // Don't exit during tests
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await supabaseDbConnection.disconnect();
  await redisCache.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await supabaseDbConnection.disconnect();
  await redisCache.disconnect();
  process.exit(0);
});

// Always register routes for testing, but only start server in non-test environments
if (process.env.NODE_ENV === 'test') {
  // For tests, just register routes without starting the server
  registerRoutes(app).catch(console.error);
} else {
  // For production/development, start the full application
  initializeApp();
}
