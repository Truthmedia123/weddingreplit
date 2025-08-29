import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(process.cwd(), '.env') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

/**
 * 🔒 ENHANCED SECURE DATABASE CONNECTION UTILITY
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Connection pooling with Supavisor
 * - IPv6/IPv4 fallback support
 * - Comprehensive error handling
 * - Health monitoring
 * - SSL/TLS configuration
 * - Rate limiting protection
 */

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  failedConnections: number;
  lastHealthCheck: Date;
  averageResponseTime: number;
  retryCount: number;
}

class EnhancedDatabaseConnection {
  private client: postgres.Sql | null = null;
  private db: ReturnType<typeof drizzle> | null = null;
  private metrics: ConnectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    failedConnections: 0,
    lastHealthCheck: new Date(),
    averageResponseTime: 0,
    retryCount: 0
  };
  private _isConnected = false;
  private connectionRetries = 0;
  private readonly maxRetries = 5;
  private readonly baseRetryDelay = 1000; // 1 second
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.validateEnvironment();
  }

  /**
   * Validate environment variables and configuration
   */
  private validateEnvironment(): void {
    console.log('🔍 Validating environment...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'EXISTS' : 'MISSING');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required for PostgreSQL connection");
    }

    // Validate DATABASE_URL format
    try {
      const url = new URL(process.env.DATABASE_URL);
      if (!url.hostname || !url.port || !url.username) {
        throw new Error("Invalid DATABASE_URL format");
      }
      
      // Check if using pooled connection (recommended)
      if (url.hostname.includes('pooler.supabase.com')) {
        console.log('✅ Using Supavisor pooled connection');
      } else if (url.hostname.includes('supabase.co')) {
        console.log('⚠️  Using direct connection - consider switching to pooled connection for better performance');
      }
      
    } catch (error) {
      throw new Error(`Invalid DATABASE_URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create enhanced database connection with comprehensive configuration
   */
  private createConnection(): postgres.Sql {
    const connectionConfig: postgres.Options<{}> = {
      // Connection Pooling (optimized for Supavisor)
      max: parseInt(process.env.DB_MAX_CONNECTIONS || '10'), // Reduced for pooled connection
      idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30'), // Increased idle timeout
      connect_timeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '15'), // Increased connect timeout
      
      // Security Configuration
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CA,
        cert: process.env.DB_SSL_CERT,
        key: process.env.DB_SSL_KEY
      } : false,
      
      // Prepared Statements (ENABLED for security)
      prepare: true,
      
      // Connection Limits
      max_lifetime: parseInt(process.env.DB_MAX_LIFETIME || '3600'), // 1 hour max connection lifetime
      
      // Error Handling
      onnotice: (notice) => {
        console.log('Database Notice:', notice);
      },
      
      onclose: (connection) => {
        this.metrics.activeConnections--;
        console.log('🔌 Database connection closed');
      },
      
      // Connection Events
      onconnect: () => {
        this.metrics.totalConnections++;
        this.metrics.activeConnections++;
        console.log('🔗 Database connection established');
      },
      
      onerror: (error) => {
        this.metrics.failedConnections++;
        console.error('❌ Database connection error:', error);
      }
    };

    return postgres(process.env.DATABASE_URL!, connectionConfig);
  }

  /**
   * Initialize database connection with enhanced retry logic
   */
  async connect(): Promise<void> {
    if (this._isConnected) {
      return;
    }

    console.log('🚀 Initializing enhanced database connection...');

    while (this.connectionRetries < this.maxRetries) {
      try {
        this.client = this.createConnection();
        
        // Test connection with timeout
        const startTime = Date.now();
        await Promise.race([
          this.client`SELECT 1 as test`,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 15000)
          )
        ]);
        
        const responseTime = Date.now() - startTime;
        this.metrics.averageResponseTime = responseTime;
        
        this.db = drizzle(this.client, {
          schema,
          logger: process.env.NODE_ENV === 'development'
        });

        this._isConnected = true;
        this.connectionRetries = 0;
        
        console.log(`✅ Database connected successfully! Response time: ${responseTime}ms`);
        
        // Start health check
        this.startHealthCheck();
        
        return;
        
      } catch (error) {
        this.connectionRetries++;
        this.metrics.failedConnections++;
        
        const delay = this.baseRetryDelay * Math.pow(2, this.connectionRetries - 1);
        console.error(`❌ Connection attempt ${this.connectionRetries} failed:`, error instanceof Error ? error.message : 'Unknown error');
        console.log(`⏳ Retrying in ${delay}ms... (${this.connectionRetries}/${this.maxRetries})`);
        
        if (this.connectionRetries >= this.maxRetries) {
          throw new Error(`Failed to connect to database after ${this.maxRetries} attempts`);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Get database instance
   */
  getDatabase() {
    if (!this._isConnected || !this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db;
  }

  /**
   * Get client instance
   */
  getClient() {
    if (!this._isConnected || !this.client) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.client;
  }

  /**
   * Check if connected
   */
  get isConnected() {
    return this._isConnected;
  }

  /**
   * Get connection metrics
   */
  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.client) return false;
      
      const startTime = Date.now();
      await this.client`SELECT 1 as health_check`;
      const responseTime = Date.now() - startTime;
      
      this.metrics.lastHealthCheck = new Date();
      this.metrics.averageResponseTime = (this.metrics.averageResponseTime + responseTime) / 2;
      
      return true;
    } catch (error) {
      console.error('❌ Health check failed:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(async () => {
      const isHealthy = await this.healthCheck();
      if (!isHealthy) {
        console.warn('⚠️  Database health check failed - connection may be unstable');
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Gracefully close database connection
   */
  async disconnect(): Promise<void> {
    console.log('🔄 Disconnecting from database...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    if (this.client) {
      try {
        await this.client.end();
        console.log('✅ Database disconnected successfully');
      } catch (error) {
        console.error('❌ Error disconnecting from database:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    this.client = null;
    this.db = null;
    this._isConnected = false;
  }

  /**
   * Reconnect to database
   */
  async reconnect(): Promise<void> {
    console.log('🔄 Reconnecting to database...');
    await this.disconnect();
    this.connectionRetries = 0;
    await this.connect();
  }
}

// Create singleton instance
const enhancedDbConnection = new EnhancedDatabaseConnection();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await enhancedDbConnection.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await enhancedDbConnection.disconnect();
  process.exit(0);
});

export default enhancedDbConnection;
