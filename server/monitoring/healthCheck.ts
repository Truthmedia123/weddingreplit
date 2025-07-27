import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../db-postgres';
import { storage } from '../storage';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    storage: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    memory: {
      status: 'up' | 'down';
      usage: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
      };
      percentage: number;
    };
    disk: {
      status: 'up' | 'down';
      available?: number;
      used?: number;
      percentage?: number;
    };
  };
}

// Memory usage threshold (80%)
const MEMORY_THRESHOLD = 0.8;

// Check memory usage
function checkMemoryHealth(): HealthStatus['checks']['memory'] {
  const memUsage = process.memoryUsage();
  const totalMemory = require('os').totalmem();
  const percentage = memUsage.rss / totalMemory;

  return {
    status: percentage > MEMORY_THRESHOLD ? 'down' : 'up',
    usage: {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
    },
    percentage: Math.round(percentage * 100) / 100,
  };
}

// Check disk usage
async function checkDiskHealth(): Promise<HealthStatus['checks']['disk']> {
  try {
    const fs = require('fs').promises;
    const stats = await fs.statfs(process.cwd());
    
    const total = stats.blocks * stats.bsize;
    const free = stats.bavail * stats.bsize;
    const used = total - free;
    const percentage = used / total;

    return {
      status: percentage > 0.9 ? 'down' : 'up', // 90% threshold
      available: Math.round(free / 1024 / 1024 / 1024), // GB
      used: Math.round(used / 1024 / 1024 / 1024), // GB
      percentage: Math.round(percentage * 100) / 100,
    };
  } catch (error) {
    return {
      status: 'down',
    };
  }
}

// Check database connectivity
async function checkDatabaseConnectivity(): Promise<HealthStatus['checks']['database']> {
  const startTime = Date.now();
  
  try {
    const isHealthy = await checkDatabaseHealth();
    const responseTime = Date.now() - startTime;

    return {
      status: isHealthy ? 'up' : 'down',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Check storage layer
async function checkStorageHealth(): Promise<HealthStatus['checks']['storage']> {
  const startTime = Date.now();
  
  try {
    // Try to fetch categories as a simple storage test
    await storage.getCategories();
    const responseTime = Date.now() - startTime;

    return {
      status: 'up',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Main health check endpoint
export async function healthCheckHandler(req: Request, res: Response): Promise<void> {
  try {
    const [database, storageCheck, memory, disk] = await Promise.all([
      checkDatabaseConnectivity(),
      checkStorageHealth(),
      Promise.resolve(checkMemoryHealth()),
      checkDiskHealth(),
    ]);

    const checks = { database, storage: storageCheck, memory, disk };
    
    // Determine overall status
    const hasDownServices = Object.values(checks).some(check => check.status === 'down');
    const hasDegradedServices = Object.values(checks).some(check => 
      check.status === 'up' && 
      ('responseTime' in check && check.responseTime && check.responseTime > 1000)
    );

    let status: HealthStatus['status'] = 'healthy';
    if (hasDownServices) {
      status = 'unhealthy';
    } else if (hasDegradedServices) {
      status = 'degraded';
    }

    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
    };

    // Set appropriate HTTP status code
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
    
    res.status(httpStatus).json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Readiness check (simpler check for load balancers)
export function readinessCheckHandler(req: Request, res: Response): void {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
}

// Liveness check (basic process check)
export function livenessCheckHandler(req: Request, res: Response): void {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
}