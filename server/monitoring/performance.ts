// Performance monitoring and observability utilities
import { Request, Response, NextFunction } from 'express';
import { performance, PerformanceObserver } from 'perf_hooks';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: number;
  userAgent?: string;
  ip?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private requestMetrics: RequestMetrics[] = [];
  private observer: PerformanceObserver;
  private readonly maxMetrics = 1000; // Keep last 1000 metrics

  constructor() {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.addMetric({
          name: entry.name,
          duration: entry.duration,
          timestamp: entry.startTime,
          metadata: {
            entryType: entry.entryType,
            detail: (entry as any).detail
          }
        });
      });
    });

    this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
  }

  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift(); // Remove oldest metric
    }
  }

  private addRequestMetric(metric: RequestMetrics) {
    this.requestMetrics.push(metric);
    if (this.requestMetrics.length > this.maxMetrics) {
      this.requestMetrics.shift(); // Remove oldest metric
    }
  }

  // Middleware to track request performance
  requestTracker() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = performance.now();
      const startMark = `request-start-${Date.now()}-${Math.random()}`;
      performance.mark(startMark);

      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = function(this: Response, ...args: any[]) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        const endMark = `request-end-${Date.now()}-${Math.random()}`;
        performance.mark(endMark);
        performance.measure(`${req.method} ${req.path}`, startMark, endMark);

        // Record request metrics
        const monitor = req.app.get('performanceMonitor') as PerformanceMonitor;
        if (monitor) {
          monitor.addRequestMetric({
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            timestamp: startTime,
            userAgent: req.get('User-Agent'),
            ip: req.ip
          });
        }

        // Log slow requests
        if (duration > 1000) { // Log requests slower than 1 second
          console.warn(`Slow request detected: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`);
        }

        originalEnd.apply(this, args);
      };

      next();
    };
  }

  // Method to measure custom operations
  measureOperation<T>(name: string, operation: () => T | Promise<T>, metadata?: Record<string, any>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const startMark = `${name}-start-${Date.now()}-${Math.random()}`;
      const endMark = `${name}-end-${Date.now()}-${Math.random()}`;
      
      performance.mark(startMark);
      const startTime = performance.now();

      try {
        const result = await operation();
        const endTime = performance.now();
        performance.mark(endMark);
        performance.measure(name, startMark, endMark);

        this.addMetric({
          name,
          duration: endTime - startTime,
          timestamp: startTime,
          metadata
        });

        resolve(result);
      } catch (error) {
        const endTime = performance.now();
        performance.mark(endMark);
        performance.measure(`${name}-error`, startMark, endMark);

        this.addMetric({
          name: `${name}-error`,
          duration: endTime - startTime,
          timestamp: startTime,
          metadata: { ...metadata, error: (error as Error).message }
        });

        reject(error);
      }
    });
  }

  // Get performance statistics
  getStats() {
    const now = Date.now();
    const last5Minutes = now - 5 * 60 * 1000;
    const last1Hour = now - 60 * 60 * 1000;

    const recentMetrics = this.metrics.filter(m => m.timestamp > last5Minutes);
    const hourlyMetrics = this.metrics.filter(m => m.timestamp > last1Hour);
    const recentRequests = this.requestMetrics.filter(m => m.timestamp > last5Minutes);
    const hourlyRequests = this.requestMetrics.filter(m => m.timestamp > last1Hour);

    return {
      summary: {
        totalMetrics: this.metrics.length,
        totalRequests: this.requestMetrics.length,
        recentMetrics: recentMetrics.length,
        recentRequests: recentRequests.length
      },
      performance: {
        last5Minutes: this.calculateStats(recentMetrics),
        lastHour: this.calculateStats(hourlyMetrics)
      },
      requests: {
        last5Minutes: this.calculateRequestStats(recentRequests),
        lastHour: this.calculateRequestStats(hourlyRequests)
      },
      slowestOperations: this.getSlowestOperations(10),
      errorRate: this.calculateErrorRate(recentRequests)
    };
  }

  private calculateStats(metrics: PerformanceMetric[]) {
    if (metrics.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p95: 0, p99: 0 };
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count: metrics.length,
      avg: sum / metrics.length,
      min: durations[0],
      max: durations[durations.length - 1],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)]
    };
  }

  private calculateRequestStats(requests: RequestMetrics[]) {
    if (requests.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p95: 0, p99: 0, statusCodes: {} };
    }

    const durations = requests.map(r => r.duration).sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);

    // Count status codes
    const statusCodes: Record<number, number> = {};
    requests.forEach(r => {
      statusCodes[r.statusCode] = (statusCodes[r.statusCode] || 0) + 1;
    });

    return {
      count: requests.length,
      avg: sum / requests.length,
      min: durations[0],
      max: durations[durations.length - 1],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
      statusCodes
    };
  }

  private getSlowestOperations(limit: number) {
    return this.metrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
      .map(m => ({
        name: m.name,
        duration: m.duration,
        timestamp: new Date(m.timestamp).toISOString(),
        metadata: m.metadata
      }));
  }

  private calculateErrorRate(requests: RequestMetrics[]) {
    if (requests.length === 0) return 0;
    
    const errorRequests = requests.filter(r => r.statusCode >= 400);
    return (errorRequests.length / requests.length) * 100;
  }

  // Clean up old metrics
  cleanup() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // Keep 24 hours
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.requestMetrics = this.requestMetrics.filter(m => m.timestamp > cutoff);
  }

  // Stop monitoring
  stop() {
    this.observer.disconnect();
  }
}

// Database operation monitoring
export class DatabaseMonitor {
  private performanceMonitor: PerformanceMonitor;

  constructor(performanceMonitor: PerformanceMonitor) {
    this.performanceMonitor = performanceMonitor;
  }

  async monitorQuery<T>(queryName: string, query: () => T | Promise<T>, metadata?: Record<string, any>): Promise<T> {
    return this.performanceMonitor.measureOperation(
      `db-${queryName}`,
      query,
      { type: 'database', ...metadata }
    );
  }
}

// API endpoint monitoring
export const createPerformanceMiddleware = (monitor: PerformanceMonitor) => {
  return {
    requestTracker: monitor.requestTracker(),
    
    // Endpoint-specific monitoring
    monitorEndpoint: (endpointName: string) => {
      return async (req: Request, res: Response, next: NextFunction) => {
        const operation = async () => {
          return new Promise<void>((resolve) => {
            const originalSend = res.send;
            res.send = function(this: Response, body: any) {
              resolve();
              return originalSend.call(this, body);
            };
            next();
          });
        };

        await monitor.measureOperation(
          `endpoint-${endpointName}`,
          operation,
          {
            method: req.method,
            path: req.path,
            query: req.query,
            userAgent: req.get('User-Agent')
          }
        );
      };
    }
  };
};

export { PerformanceMonitor };