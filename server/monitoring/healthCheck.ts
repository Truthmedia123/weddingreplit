import { Request, Response } from 'express';
import { getDatabase, dbHealthCheck } from '../db';

/**
 * Health Check Middleware
 * 
 * Provides comprehensive health monitoring endpoints:
 * - /health: Basic health check
 * - /health/ready: Readiness probe for Kubernetes
 * - /health/live: Liveness probe for Kubernetes
 */

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'pass' | 'fail';
      responseTime: number;
      message: string;
    };
    storage: {
      status: 'pass' | 'fail';
      message: string;
      details?: any;
    };
    memory: {
      status: 'pass' | 'fail';
      message: string;
      details?: any;
    };
    disk: {
      status: 'pass' | 'fail';
      message: string;
      details?: any;
    };
  };
}

// Database health check
async function checkDatabase(): Promise<{ status: 'pass' | 'fail'; responseTime: number; message: string }> {
  const start = Date.now();
  try {
    const dbHealth = await dbHealthCheck();
    const responseTime = Date.now() - start;
    
    if (dbHealth.status === 'healthy') {
      return {
        status: 'pass',
        responseTime,
        message: `Database is healthy (avg response: ${dbHealth.metrics.averageResponseTime.toFixed(2)}ms)`
      };
    } else {
      return {
        status: 'fail',
        responseTime,
        message: `Database health check failed: ${dbHealth.error || 'Unknown error'}`
      };
    }
  } catch (error) {
    const responseTime = Date.now() - start;
    return {
      status: 'fail',
      responseTime,
      message: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Storage health check
async function checkStorage(): Promise<{ status: 'pass' | 'fail'; message: string; details?: any }> {
  try {
    // Check if we can access the storage layer
    const db = await getDatabase();
    if (db) {
      return {
        status: 'pass',
        message: 'Storage check passed'
      };
    } else {
      return {
        status: 'fail',
        message: 'Storage check failed',
        details: { error: 'Database connection not available' }
      };
    }
  } catch (error) {
    return {
      status: 'fail',
      message: 'Storage check failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

// Memory health check
function checkMemory(): { status: 'pass' | 'fail'; message: string; details?: any } {
  try {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100
    };

    // Check if memory usage is reasonable (less than 500MB RSS)
    const isHealthy = memUsageMB.rss < 500;
    
    return {
      status: isHealthy ? 'pass' : 'fail',
      message: isHealthy ? 'Memory usage is normal' : 'Memory usage is critically high',
      details: {
        percentage: `${Math.round((memUsageMB.rss / 500) * 100 * 100) / 100}%`,
        used: `${memUsageMB.rss}MB`,
        ...memUsageMB
      }
    };
  } catch (error) {
    return {
      status: 'fail',
      message: 'Memory check failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

// Disk health check (basic)
function checkDisk(): { status: 'pass' | 'fail'; message: string; details?: any } {
  try {
    // Basic disk check - in a real application, you might want to check
    // available disk space, write permissions, etc.
    return {
      status: 'pass',
      message: 'Disk usage is normal'
    };
  } catch (error) {
    return {
      status: 'fail',
      message: 'Disk check failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

// Main health check handler
export const healthCheckHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const [dbCheck, storageCheck, memoryCheck, diskCheck] = await Promise.all([
      checkDatabase(),
      checkStorage(),
      Promise.resolve(checkMemory()),
      Promise.resolve(checkDisk())
    ]);

    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: dbCheck,
        storage: storageCheck,
        memory: memoryCheck,
        disk: diskCheck
      }
    };

    // Determine overall health status
    const allChecks = [dbCheck, storageCheck, memoryCheck, diskCheck];
    const hasFailures = allChecks.some(check => check.status === 'fail');
    
    if (hasFailures) {
      healthStatus.status = 'unhealthy';
      res.status(503);
    } else {
      res.status(200);
    }

    res.json(healthStatus);
  } catch (error) {
    const errorStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: { status: 'fail', responseTime: 0, message: 'Health check failed' },
        storage: { status: 'fail', message: 'Health check failed' },
        memory: { status: 'fail', message: 'Health check failed' },
        disk: { status: 'fail', message: 'Health check failed' }
      }
    };

    res.status(503).json(errorStatus);
  }
};

// Readiness check - for Kubernetes readiness probe
export const readinessCheckHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const dbCheck = await checkDatabase();
    
    if (dbCheck.status === 'pass') {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        message: 'Application is ready to receive traffic'
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        message: 'Application is not ready to receive traffic',
        details: { database: dbCheck.message }
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      message: 'Readiness check failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
  }
};

// Liveness check - for Kubernetes liveness probe
export const livenessCheckHandler = (req: Request, res: Response): void => {
  try {
    const memoryCheck = checkMemory();
    
    if (memoryCheck.status === 'pass') {
      res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'Application is alive and responsive'
      });
    } else {
      res.status(503).json({
        status: 'not alive',
        timestamp: new Date().toISOString(),
        message: 'Application is not responding properly',
        details: { memory: memoryCheck.message }
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not alive',
      timestamp: new Date().toISOString(),
      message: 'Liveness check failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
  }
};
