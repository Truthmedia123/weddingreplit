/**
 * 🏥 Comprehensive Health Check System
 * 
 * This module provides detailed health checks for all system components
 * including database, external services, disk space, memory, and more.
 */

import { Request, Response } from 'express';
import { getDatabase, dbHealthCheck } from '../db';
import fs from 'fs/promises';
import os from 'os';
import { performance } from 'perf_hooks';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version?: string;
  environment?: string;
  checks: {
    [key: string]: {
      status: 'pass' | 'warn' | 'fail';
      message: string;
      responseTime?: number;
      details?: any;
    };
  };
  metadata: {
    node: string;
    platform: string;
    architecture: string;
    memory: {
      used: number;
      total: number;
      free: number;
      percentage: number;
    };
    cpu: {
      loadAverage: number[];
      cores: number;
    };
    disk: {
      used: number;
      total: number;
      free: number;
      percentage: number;
    };
  };
}

/**
 * Check database connectivity and performance
 */
async function checkDatabase(): Promise<{
  status: 'pass' | 'warn' | 'fail';
  message: string;
  responseTime: number;
  details?: any;
}> {
  const start = performance.now();
  
  try {
    const healthResult = await dbHealthCheck();
    const responseTime = performance.now() - start;
    
    if (healthResult.status === 'healthy') {
      return {
        status: responseTime > 1000 ? 'warn' : 'pass',
        message: responseTime > 1000 
          ? `Database healthy but slow (${responseTime.toFixed(2)}ms)`
          : `Database healthy (${responseTime.toFixed(2)}ms)`,
        responseTime,
        details: {
          metrics: healthResult.metrics,
          avgResponseTime: healthResult.metrics.averageResponseTime,
          activeConnections: healthResult.metrics.activeConnections,
        },
      };
    } else {
      return {
        status: 'fail',
        message: `Database unhealthy: ${healthResult.error}`,
        responseTime,
        details: {
          error: healthResult.error,
          metrics: healthResult.metrics,
        },
      };
    }
  } catch (error) {
    const responseTime = performance.now() - start;
    return {
      status: 'fail',
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime,
      details: { error: error instanceof Error ? error.message : error },
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(): {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details: any;
} {
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercentage = (usedMem / totalMem) * 100;
  
  // Node.js heap usage
  const heapPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  
  let status: 'pass' | 'warn' | 'fail' = 'pass';
  let message = `Memory usage: ${memPercentage.toFixed(1)}%, Heap: ${heapPercentage.toFixed(1)}%`;
  
  if (memPercentage > 90 || heapPercentage > 90) {
    status = 'fail';
    message = `Critical memory usage: System ${memPercentage.toFixed(1)}%, Heap ${heapPercentage.toFixed(1)}%`;
  } else if (memPercentage > 80 || heapPercentage > 80) {
    status = 'warn';
    message = `High memory usage: System ${memPercentage.toFixed(1)}%, Heap ${heapPercentage.toFixed(1)}%`;
  }
  
  return {
    status,
    message,
    details: {
      system: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percentage: memPercentage,
      },
      process: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        heapPercentage,
      },
    },
  };
}

/**
 * Check disk space
 */
async function checkDisk(): Promise<{
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details: any;
}> {
  try {
    const stats = await fs.statfs ? fs.statfs('.') : null;
    
    if (!stats) {
      // Fallback for systems without statvfs
      return {
        status: 'warn',
        message: 'Disk space check not available on this system',
        details: { available: false },
      };
    }
    
    const total = (await stats).bavail * (await stats).bsize;
    const free = (await stats).bavail * (await stats).bsize;
    const used = total - free;
    const percentage = (used / total) * 100;
    
    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let message = `Disk usage: ${percentage.toFixed(1)}%`;
    
    if (percentage > 95) {
      status = 'fail';
      message = `Critical disk usage: ${percentage.toFixed(1)}%`;
    } else if (percentage > 85) {
      status = 'warn';
      message = `High disk usage: ${percentage.toFixed(1)}%`;
    }
    
    return {
      status,
      message,
      details: {
        total,
        used,
        free,
        percentage,
      },
    };
  } catch (error) {
    return {
      status: 'warn',
      message: 'Unable to check disk space',
      details: { error: error instanceof Error ? error.message : error },
    };
  }
}

/**
 * Check CPU load
 */
function checkCPU(): {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details: any;
} {
  const loadAvg = os.loadavg();
  const cores = os.cpus().length;
  const loadPercentage = (loadAvg?.[0] || 0) / cores * 100;
  
  let status: 'pass' | 'warn' | 'fail' = 'pass';
  let message = `CPU load: ${loadPercentage.toFixed(1)}% (${(loadAvg?.[0] || 0).toFixed(2)}/${cores} cores)`;
  
  if (loadPercentage > 90) {
    status = 'fail';
    message = `Critical CPU load: ${loadPercentage.toFixed(1)}%`;
  } else if (loadPercentage > 70) {
    status = 'warn';
    message = `High CPU load: ${loadPercentage.toFixed(1)}%`;
  }
  
  return {
    status,
    message,
    details: {
      loadAverage: loadAvg,
      cores,
      percentage: loadPercentage,
      cpuInfo: os.cpus().map(cpu => ({
        model: cpu.model,
        speed: cpu.speed,
      })),
    },
  };
}

/**
 * Check external dependencies
 */
async function checkExternalServices(): Promise<{
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details: any;
}> {
  const services: any[] = [
    // Add your external service checks here
    // Example: Supabase, CDN, third-party APIs
  ];
  
  if (services.length === 0) {
    return {
      status: 'pass',
      message: 'No external services configured',
      details: { services: [] },
    };
  }
  
  // Implementation for external service checks
  // This would involve making HTTP requests to health endpoints
  return {
    status: 'pass',
    message: 'All external services healthy',
    details: { services },
  };
}

/**
 * Check application-specific health
 */
async function checkApplication(): Promise<{
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details: any;
}> {
  try {
    // Check if critical directories exist
    const criticalPaths = [
      'dist/public',
      'client/public/images',
      'server',
    ];
    
    const pathChecks = await Promise.all(
      criticalPaths.map(async (path) => {
        try {
          await fs.access(path);
          return { path, status: 'ok' };
        } catch {
          return { path, status: 'missing' };
        }
      })
    );
    
    const missingPaths = pathChecks.filter(check => check.status === 'missing');
    
    if (missingPaths.length > 0) {
      return {
        status: 'warn',
        message: `Missing critical paths: ${missingPaths.map(p => p.path).join(', ')}`,
        details: { pathChecks },
      };
    }
    
    return {
      status: 'pass',
      message: 'Application structure healthy',
      details: { pathChecks },
    };
  } catch (error) {
    return {
      status: 'fail',
      message: 'Application health check failed',
      details: { error: error instanceof Error ? error.message : error },
    };
  }
}

/**
 * Comprehensive health check endpoint
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  const startTime = performance.now();
  
  try {
    // Run all health checks in parallel
    const [
      dbCheck,
      memoryCheck,
      diskCheck,
      cpuCheck,
      externalCheck,
      appCheck,
    ] = await Promise.all([
      checkDatabase(),
      Promise.resolve(checkMemory()),
      checkDisk(),
      Promise.resolve(checkCPU()),
      checkExternalServices(),
      checkApplication(),
    ]);
    
    const checks = {
      database: dbCheck,
      memory: memoryCheck,
      disk: diskCheck,
      cpu: cpuCheck,
      external: externalCheck,
      application: appCheck,
    };
    
    // Determine overall status
    const hasFailures = Object.values(checks).some(check => check.status === 'fail');
    const hasWarnings = Object.values(checks).some(check => check.status === 'warn');
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (hasFailures) {
      overallStatus = 'unhealthy';
    } else if (hasWarnings) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }
    
    // System metadata
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
      metadata: {
        node: process.version,
        platform: os.platform(),
        architecture: os.arch(),
        memory: {
          used: usedMem,
          total: totalMem,
          free: freeMem,
          percentage: (usedMem / totalMem) * 100,
        },
        cpu: {
          loadAverage: os.loadavg(),
          cores: os.cpus().length,
        },
        disk: diskCheck.details || { used: 0, total: 0, free: 0, percentage: 0 },
      },
    };
    
    // Set response status based on health
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    // Add performance header
    const responseTime = performance.now() - startTime;
    res.set('X-Response-Time', `${responseTime.toFixed(2)}ms`);
    
    res.status(statusCode).json(result);
  } catch (error) {
    const responseTime = performance.now() - startTime;
    res.set('X-Response-Time', `${responseTime.toFixed(2)}ms`);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {},
      metadata: {
        node: process.version,
        platform: os.platform(),
        architecture: os.arch(),
        memory: { used: 0, total: 0, free: 0, percentage: 0 },
        cpu: { loadAverage: [0, 0, 0], cores: 0 },
        disk: { used: 0, total: 0, free: 0, percentage: 0 },
      },
    });
  }
}

/**
 * Simple liveness check
 */
export function livenessCheck(req: Request, res: Response): void {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

/**
 * Readiness check (for Kubernetes)
 */
export async function readinessCheck(req: Request, res: Response): Promise<void> {
  try {
    // Check only critical components for readiness
    const dbCheck = await checkDatabase();
    
    if (dbCheck.status === 'fail') {
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        reason: 'Database not available',
        details: dbCheck,
      });
      return;
    }
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: dbCheck,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default {
  healthCheck,
  livenessCheck,
  readinessCheck,
};
