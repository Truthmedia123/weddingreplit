import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';

// Initialize Sentry for error monitoring
export function initializeSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: undefined }),
      ],
    });
    console.log('✅ Sentry error monitoring initialized');
  }
}

// Request handler middleware
export const sentryRequestHandler = () => Sentry.Handlers.requestHandler();

// Error handler middleware
export const sentryErrorHandler = () => Sentry.Handlers.errorHandler();

// Custom error logging middleware
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error occurred:', errorInfo);
  }

  // Log to Sentry in production
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: {
        component: 'server',
        url: req.url,
        method: req.method,
      },
      extra: errorInfo,
    });
  }

  next(error);
};

// Production error handler
export const productionErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse = {
    message: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown',
  };

  // Set status code
  const statusCode = (error as any).statusCode || (error as any).status || 500;
  
  res.status(statusCode).json({
    error: errorResponse,
    success: false,
  });
};

// Health check error monitoring
export const monitorHealthCheck = (endpoint: string, error?: Error) => {
  if (error) {
    console.error(`❌ Health check failed for ${endpoint}:`, error.message);
    
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          component: 'health-check',
          endpoint,
        },
      });
    }
  }
};

// Performance monitoring
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`🐌 Slow request: ${req.method} ${req.url} took ${duration}ms`);
      
      if (process.env.SENTRY_DSN) {
        Sentry.addBreadcrumb({
          message: 'Slow request detected',
          category: 'performance',
          data: {
            url: req.url,
            method: req.method,
            duration,
            statusCode: res.statusCode,
          },
          level: 'warning',
        });
      }
    }
  });
  
  next();
};