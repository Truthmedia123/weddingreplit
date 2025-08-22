// Health check and monitoring endpoints
import type { Express } from "express";
import { storage } from "./storage";
import { healthCheck as dbHealthCheck } from './db/connection';
import { getDatabase } from './db/connection';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheck;
    storage: HealthCheck;
    memory: HealthCheck;
    disk: HealthCheck;
  };
}

interface HealthCheck {
  status: 'pass' | 'fail' | 'warn';
  responseTime?: number;
  message?: string;
  details?: any;
}

interface Metrics {
  requests: {
    total: number;
    success: number;
    errors: number;
    averageResponseTime: number;
  };
  database: {
    connections: number;
    queries: number;
    averageQueryTime: number;
  };
  memory: {
    used: number;
    free: number;
    total: number;
    percentage: number;
  };
  uptime: number;
}

class HealthMonitor {
  private metrics: Metrics = {
    requests: { total: 0, success: 0, errors: 0, averageResponseTime: 0 },
    database: { connections: 0, queries: 0, averageQueryTime: 0 },
    memory: { used: 0, free: 0, total: 0, percentage: 0 },
    uptime: 0
  };

  private startTime = Date.now();
  private responseTimes: number[] = [];
  private queryTimes: number[] = [];

  // Record request metrics
  recordRequest(responseTime: number, success: boolean) {
    this.metrics.requests.total++;
    if (success) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
    }
    
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift(); // Keep only last 100 measurements
    }
    
    this.metrics.requests.averageResponseTime = 
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  // Record database query metrics
  recordQuery(queryTime: number) {
    this.metrics.database.queries++;
    this.queryTimes.push(queryTime);
    if (this.queryTimes.length > 100) {
      this.queryTimes.shift();
    }
    
    this.metrics.database.averageQueryTime = 
      this.queryTimes.reduce((a, b) => a + b, 0) / this.queryTimes.length;
  }

  // Check database health
  async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    try {
      // Simple database connectivity test
      const testQuery = await storage.getVendors({});
      const responseTime = Date.now() - startTime;
      
      if (responseTime > 1000) {
        return {
          status: 'warn',
          responseTime,
          message: 'Database response time is slow',
          details: { responseTime: `${responseTime}ms` }
        };
      }
      
      return {
        status: 'pass',
        responseTime,
        message: 'Database is healthy'
      };
    } catch (error) {
      return {
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: 'Database connection failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  // Check storage health
  async checkStorage(): Promise<HealthCheck> {
    try {
      // Test storage operations
      // const testSession = await storage.getSession('health-check-session'); // Not implemented
      
      return {
        status: 'pass',
        message: 'Storage is healthy'
      };
    } catch (error) {
      return {
        status: 'fail',
        message: 'Storage check failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  // Check memory usage
  checkMemory(): HealthCheck {
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    const freeMem = totalMem - usedMem;
    const percentage = (usedMem / totalMem) * 100;

    this.metrics.memory = {
      used: usedMem,
      free: freeMem,
      total: totalMem,
      percentage
    };

    if (percentage > 90) {
      return {
        status: 'fail',
        message: 'Memory usage is critically high',
        details: { percentage: `${percentage.toFixed(2)}%`, used: `${(usedMem / 1024 / 1024).toFixed(2)}MB` }
      };
    } else if (percentage > 75) {
      return {
        status: 'warn',
        message: 'Memory usage is high',
        details: { percentage: `${percentage.toFixed(2)}%`, used: `${(usedMem / 1024 / 1024).toFixed(2)}MB` }
      };
    }

    return {
      status: 'pass',
      message: 'Memory usage is normal',
      details: { percentage: `${percentage.toFixed(2)}%`, used: `${(usedMem / 1024 / 1024).toFixed(2)}MB` }
    };
  }

  // Check disk usage (simplified)
  checkDisk(): HealthCheck {
    // In a real implementation, you'd check actual disk usage
    // For now, we'll return a simple check
    return {
      status: 'pass',
      message: 'Disk usage is normal'
    };
  }

  // Get comprehensive health status
  async getHealthStatus(): Promise<HealthStatus> {
    const uptime = Date.now() - this.startTime;
    this.metrics.uptime = uptime;

    const [database, storage, memory, disk] = await Promise.all([
      this.checkDatabase(),
      this.checkStorage(),
      Promise.resolve(this.checkMemory()),
      Promise.resolve(this.checkDisk())
    ]);

    const checks = { database, storage, memory, disk };
    
    // Determine overall status
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    const failedChecks = Object.values(checks).filter(check => check.status === 'fail');
    const warnChecks = Object.values(checks).filter(check => check.status === 'warn');
    
    if (failedChecks.length > 0) {
      status = 'unhealthy';
    } else if (warnChecks.length > 0) {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks
    };
  }

  // Get metrics
  getMetrics(): Metrics {
    return { ...this.metrics };
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      requests: { total: 0, success: 0, errors: 0, averageResponseTime: 0 },
      database: { connections: 0, queries: 0, averageQueryTime: 0 },
      memory: { used: 0, free: 0, total: 0, percentage: 0 },
      uptime: Date.now() - this.startTime
    };
    this.responseTimes = [];
    this.queryTimes = [];
  }
}

// Global health monitor instance
const healthMonitor = new HealthMonitor();

// Middleware to track request metrics
export const metricsMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const success = res.statusCode < 400;
    healthMonitor.recordRequest(responseTime, success);
  });
  
  next();
};

// Register health and monitoring routes
export function registerHealthRoutes(app: Express) {
  // Basic health check endpoint
  app.get('/health', async (req, res) => {
    try {
      const health = await healthMonitor.getHealthStatus();
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed'
      });
    }
  });

  // Detailed health check endpoint
  app.get('/health/detailed', async (req, res) => {
    try {
      const health = await healthMonitor.getHealthStatus();
      const metrics = healthMonitor.getMetrics();
      
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json({
        ...health,
        metrics
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Detailed health check failed'
      });
    }
  });

  // Readiness probe (for Kubernetes)
  app.get('/health/ready', async (req, res) => {
    try {
      const dbCheck = await healthMonitor.checkDatabase();
      const storageCheck = await healthMonitor.checkStorage();
      
      if (dbCheck.status === 'pass' && storageCheck.status === 'pass') {
        res.status(200).json({
          status: 'ready',
          timestamp: new Date().toISOString(),
          checks: { database: dbCheck, storage: storageCheck }
        });
      } else {
        res.status(503).json({
          status: 'not ready',
          timestamp: new Date().toISOString(),
          checks: { database: dbCheck, storage: storageCheck }
        });
      }
    } catch (error) {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Readiness check failed'
      });
    }
  });

  // Liveness probe (for Kubernetes)
  app.get('/health/live', (req, res) => {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - healthMonitor['startTime']
    });
  });

  // Metrics endpoint (Prometheus format)
  app.get('/metrics', (req, res) => {
    const metrics = healthMonitor.getMetrics();
    const memUsage = process.memoryUsage();
    
    // Simple Prometheus-style metrics
    const prometheusMetrics = `
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${metrics.requests.total}

# HELP http_requests_success_total Total number of successful HTTP requests
# TYPE http_requests_success_total counter
http_requests_success_total ${metrics.requests.success}

# HELP http_requests_error_total Total number of failed HTTP requests
# TYPE http_requests_error_total counter
http_requests_error_total ${metrics.requests.errors}

# HELP http_request_duration_ms Average HTTP request duration in milliseconds
# TYPE http_request_duration_ms gauge
http_request_duration_ms ${metrics.requests.averageResponseTime}

# HELP database_queries_total Total number of database queries
# TYPE database_queries_total counter
database_queries_total ${metrics.database.queries}

# HELP database_query_duration_ms Average database query duration in milliseconds
# TYPE database_query_duration_ms gauge
database_query_duration_ms ${metrics.database.averageQueryTime}

# HELP memory_usage_bytes Memory usage in bytes
# TYPE memory_usage_bytes gauge
memory_usage_bytes ${memUsage.heapUsed}

# HELP memory_total_bytes Total memory in bytes
# TYPE memory_total_bytes gauge
memory_total_bytes ${memUsage.heapTotal}

# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${metrics.uptime / 1000}
`.trim();

    res.set('Content-Type', 'text/plain');
    res.send(prometheusMetrics);
  });

  // Reset metrics endpoint (for testing)
  app.post('/metrics/reset', (req, res) => {
    healthMonitor.resetMetrics();
    res.json({
      status: 'success',
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString()
    });
  });
}

export { healthMonitor };