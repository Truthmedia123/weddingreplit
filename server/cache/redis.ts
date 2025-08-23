import { createClient, RedisClientType } from 'redis';
import { performance } from 'perf_hooks';

/**
 * 🚀 Redis Caching Service
 * 
 * High-performance caching layer for vendor listings, search results,
 * and frequently accessed data to achieve <2s load times.
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  compress?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  avgResponseTime: number;
  totalRequests: number;
}

class RedisCacheService {
  private client: RedisClientType;
  private isConnected = false;
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    responseTimes: [] as number[]
  };

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 10000,
        // lazyConnect: true, // Removed due to type incompatibility
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis connection failed after 10 retries');
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('✅ Redis connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      console.log('🚀 Redis ready for operations');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      console.log('🔌 Redis connection ended');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        console.error('Failed to connect to Redis:', error);
        // Continue without Redis in development
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️  Continuing without Redis cache in development');
        } else {
          throw error;
        }
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
    }
  }

  private generateKey(key: string, prefix?: string): string {
    const cachePrefix = prefix || 'wedding';
    return `${cachePrefix}:${key}`;
  }

  private async measurePerformance<T>(operation: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;
      this.stats.responseTimes.push(duration);
      
      // Keep only last 1000 response times for stats
      if (this.stats.responseTimes.length > 1000) {
        this.stats.responseTimes = this.stats.responseTimes.slice(-1000);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.stats.responseTimes.push(duration);
      throw error;
    }
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    if (!this.isConnected) return null;

    this.stats.totalRequests++;
    const cacheKey = this.generateKey(key, options.prefix);

    try {
      const result = await this.measurePerformance(async () => {
        const data = await this.client.get(cacheKey);
        return data;
      });

      if (result) {
        this.stats.hits++;
        return JSON.parse(result) as T;
      } else {
        this.stats.misses++;
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    if (!this.isConnected) return;

    const cacheKey = this.generateKey(key, options.prefix);
    const ttl = options.ttl || 300; // Default 5 minutes

    try {
      await this.measurePerformance(async () => {
        const serializedValue = JSON.stringify(value);
        await this.client.setEx(cacheKey, ttl, serializedValue);
      });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string, options: CacheOptions = {}): Promise<void> {
    if (!this.isConnected) return;

    const cacheKey = this.generateKey(key, options.prefix);

    try {
      await this.measurePerformance(async () => {
        await this.client.del(cacheKey);
      });
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async deletePattern(pattern: string, options: CacheOptions = {}): Promise<void> {
    if (!this.isConnected) return;

    const cachePattern = this.generateKey(pattern, options.prefix);

    try {
      await this.measurePerformance(async () => {
        const keys = await this.client.keys(cachePattern);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      });
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isConnected) return false;

    const cacheKey = this.generateKey(key, options.prefix);

    try {
      const result = await this.measurePerformance(async () => {
        return await this.client.exists(cacheKey);
      });
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async increment(key: string, options: CacheOptions = {}): Promise<number> {
    if (!this.isConnected) return 0;

    const cacheKey = this.generateKey(key, options.prefix);

    try {
      return await this.measurePerformance(async () => {
        return await this.client.incr(cacheKey);
      });
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  async expire(key: string, ttl: number, options: CacheOptions = {}): Promise<void> {
    if (!this.isConnected) return;

    const cacheKey = this.generateKey(key, options.prefix);

    try {
      await this.measurePerformance(async () => {
        await this.client.expire(cacheKey, ttl);
      });
    } catch (error) {
      console.error('Cache expire error:', error);
    }
  }

  // Vendor-specific caching methods
  async getVendors(filters: { category?: string; location?: string; search?: string }): Promise<any[] | null> {
    const cacheKey = `vendors:${JSON.stringify(filters)}`;
    return this.get<any[]>(cacheKey, { ttl: 300, prefix: 'vendors' }); // 5 minutes
  }

  async setVendors(filters: { category?: string; location?: string; search?: string }, vendors: any[]): Promise<void> {
    const cacheKey = `vendors:${JSON.stringify(filters)}`;
    await this.set(cacheKey, vendors, { ttl: 300, prefix: 'vendors' });
  }

  async getFeaturedVendors(): Promise<any[] | null> {
    return this.get<any[]>('featured', { ttl: 600, prefix: 'vendors' }); // 10 minutes
  }

  async setFeaturedVendors(vendors: any[]): Promise<void> {
    await this.set('featured', vendors, { ttl: 600, prefix: 'vendors' });
  }

  async getVendor(id: number): Promise<any | null> {
    return this.get<any>(`vendor:${id}`, { ttl: 1800, prefix: 'vendors' }); // 30 minutes
  }

  async setVendor(id: number, vendor: any): Promise<void> {
    await this.set(`vendor:${id}`, vendor, { ttl: 1800, prefix: 'vendors' });
  }

  async invalidateVendor(id: number): Promise<void> {
    await this.delete(`vendor:${id}`, { prefix: 'vendors' });
    // Also invalidate vendor lists that might contain this vendor
    await this.deletePattern('vendors:*', { prefix: 'vendors' });
  }

  async invalidateAllVendors(): Promise<void> {
    await this.deletePattern('*', { prefix: 'vendors' });
  }

  // Search-specific caching methods
  async getSearchResults(query: string, filters: any): Promise<any[] | null> {
    const cacheKey = `search:${query}:${JSON.stringify(filters)}`;
    return this.get<any[]>(cacheKey, { ttl: 1800, prefix: 'search' }); // 30 minutes
  }

  async setSearchResults(query: string, filters: any, results: any[]): Promise<void> {
    const cacheKey = `search:${query}:${JSON.stringify(filters)}`;
    await this.set(cacheKey, results, { ttl: 1800, prefix: 'search' });
  }

  // Cache statistics
  getStats(): CacheStats {
    const avgResponseTime = this.stats.responseTimes.length > 0
      ? this.stats.responseTimes.reduce((a, b) => a + b, 0) / this.stats.responseTimes.length
      : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.totalRequests > 0 ? (this.stats.hits / this.stats.totalRequests) * 100 : 0,
      avgResponseTime,
      totalRequests: this.stats.totalRequests
    };
  }

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    if (!this.isConnected) {
      return {
        status: 'unhealthy',
        details: { error: 'Redis not connected' }
      };
    }

    try {
      const start = performance.now();
      await this.client.ping();
      const responseTime = performance.now() - start;

      return {
        status: 'healthy',
        details: {
          responseTime,
          stats: this.getStats(),
          memory: await this.getMemoryInfo()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async getMemoryInfo(): Promise<any> {
    try {
      const info = await this.client.info('memory');
      const lines = info.split('\r\n');
      const memoryInfo: any = {};

      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          if (typeof key === 'string') {
            memoryInfo[key] = value;
          }
        }
      });

      return {
        usedMemory: memoryInfo['used_memory_human'],
        peakMemory: memoryInfo['used_memory_peak_human'],
        totalMemory: memoryInfo['total_system_memory_human']
      };
    } catch (error) {
      return { error: 'Failed to get memory info' };
    }
  }
}

// Singleton instance
export const redisCache = new RedisCacheService();

// Export for use in other modules
export default redisCache;
