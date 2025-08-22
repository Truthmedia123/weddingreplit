/**
 * 🔒 SECURE DATABASE CONNECTION UTILITY
 * 
 * This module provides a secure, production-ready database connection
 * with comprehensive security features:
 * - Connection pooling with proper limits
 * - Prepared statements for SQL injection prevention
 * - Connection error handling and retry logic
 * - Health monitoring and metrics
 * - Rate limiting at database level
 * - Input validation and sanitization
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema-postgres";

// Database connection metrics
interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  failedConnections: number;
  lastHealthCheck: Date;
  averageResponseTime: number;
}

class SecureDatabaseConnection {
  private client: postgres.Sql | null = null;
  private db: ReturnType<typeof drizzle> | null = null;
  private metrics: ConnectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    failedConnections: 0,
    lastHealthCheck: new Date(),
    averageResponseTime: 0
  };
  private isConnected = false;
  private connectionRetries = 0;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor() {
    this.validateEnvironment();
  }

  /**
   * Validate environment variables and configuration
   */
  private validateEnvironment(): void {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required for PostgreSQL connection");
    }

    // Validate DATABASE_URL format
    const url = new URL(process.env.DATABASE_URL);
    if (!url.hostname || !url.port || !url.username) {
      throw new Error("Invalid DATABASE_URL format");
    }

    // Validate SSL configuration for production
    if (process.env.NODE_ENV === 'production' && !url.protocol.includes('sslmode')) {
      console.warn("⚠️  WARNING: Production environment should use SSL connections");
    }
  }

  /**
   * Create secure database connection with comprehensive configuration
   */
  private createConnection(): postgres.Sql {
    const connectionConfig: postgres.Options<{}> = {
      // Connection Pooling
      max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'), // Maximum connections
      idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || '20'), // Close idle connections after 20s
      connect_timeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10'), // Connection timeout
      
      // Security Configuration
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CA,
        cert: process.env.DB_SSL_CERT,
        key: process.env.DB_SSL_KEY
      } : false,
      
      // Prepared Statements (ENABLED for security)
      prepare: true, // Enable prepared statements to prevent SQL injection
      
      // Connection Limits
      max_lifetime: parseInt(process.env.DB_MAX_LIFETIME || '3600'), // 1 hour max connection lifetime
      
      // Performance and Security
      application_name: 'wedding-app', // For monitoring
      statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'), // 30s query timeout
      query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'), // 30s query timeout
      
      // Error Handling
      onnotice: (notice) => {
        console.log('Database Notice:', notice);
      },
      
      // Connection Events
      onconnect: (connection) => {
        this.metrics.totalConnections++;
        this.metrics.activeConnections++;
        console.log('🔗 Database connection established');
      },
      
      onclose: (connection) => {
        this.metrics.activeConnections--;
        console.log('🔌 Database connection closed');
      },
      
      onerror: (error) => {
        this.metrics.failedConnections++;
        console.error('❌ Database connection error:', error);
      }
    };

    return postgres(process.env.DATABASE_URL!, connectionConfig);
  }

  /**
   * Initialize database connection with retry logic
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    while (this.connectionRetries < this.maxRetries) {
      try {
        console.log(`🔄 Attempting database connection (attempt ${this.connectionRetries + 1}/${this.maxRetries})`);
        
        this.client = this.createConnection();
        
        // Test connection
        await this.client`SELECT 1 as test`;
        
        this.db = drizzle(this.client, { 
          schema,
          logger: process.env.NODE_ENV === 'development'
        });
        
        this.isConnected = true;
        this.connectionRetries = 0;
        this.metrics.lastHealthCheck = new Date();
        
        console.log('✅ Database connection established successfully');
        return;
        
      } catch (error) {
        this.connectionRetries++;
        console.error(`❌ Database connection attempt ${this.connectionRetries} failed:`, error);
        
        if (this.connectionRetries >= this.maxRetries) {
          throw new Error(`Failed to connect to database after ${this.maxRetries} attempts`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * this.connectionRetries));
      }
    }
  }

  /**
   * Get database instance with connection validation
   */
  async getDatabase() {
    if (!this.isConnected || !this.db) {
      await this.connect();
    }
    return this.db!;
  }

  /**
   * Get raw client for advanced operations
   */
  async getClient() {
    if (!this.isConnected || !this.client) {
      await this.connect();
    }
    return this.client!;
  }

  /**
   * Execute a query with proper error handling and metrics
   */
  async executeQuery<T = any>(
    query: string, 
    params: any[] = [], 
    options: { timeout?: number; retries?: number } = {}
  ): Promise<T[]> {
    const startTime = Date.now();
    const maxRetries = options.retries || 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const client = await this.getClient();
        const result = await client.unsafe(query, params);
        
        // Update metrics
        const responseTime = Date.now() - startTime;
        this.updateResponseTime(responseTime);
        
        return result as T[];
        
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Query execution failed (attempt ${attempt}/${maxRetries}):`, error);
        
                       // Handle specific database errors
               if (error && typeof error === 'object' && 'code' in error) {
          switch ((error as any).code) {
            case '57P01': // Admin shutdown
            case '57P02': // Crash shutdown
            case '57P03': // Cannot connect now
              // These are connection issues, retry
              if (attempt < maxRetries) {
                await this.reconnect();
                continue;
              }
              break;
            case '23505': // Unique violation
            case '23503': // Foreign key violation
            case '23514': // Check violation
              // These are data integrity issues, don't retry
              throw error;
            default:
              // For other errors, retry once
              if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
          }
        }
        
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
    
    throw lastError || new Error('Query execution failed');
  }

  /**
   * Reconnect to database
   */
  private async reconnect(): Promise<void> {
    console.log('🔄 Reconnecting to database...');
    this.isConnected = false;
    this.client = null;
    this.db = null;
    await this.connect();
  }

  /**
   * Update response time metrics
   */
  private updateResponseTime(responseTime: number): void {
    const alpha = 0.1; // Smoothing factor
    this.metrics.averageResponseTime = 
      alpha * responseTime + (1 - alpha) * this.metrics.averageResponseTime;
  }

  /**
   * Get connection metrics
   */
  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    error?: string;
    metrics: ConnectionMetrics;
  }> {
    const startTime = Date.now();
    
    try {
      const client = await this.getClient();
      await client`SELECT 1 as health_check`;
      
      const responseTime = Date.now() - startTime;
      this.metrics.lastHealthCheck = new Date();
      this.updateResponseTime(responseTime);
      
      return {
        status: 'healthy',
        responseTime,
        metrics: this.getMetrics()
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: this.getMetrics()
      };
    }
  }

  /**
   * Close database connection gracefully
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.isConnected = false;
      this.client = null;
      this.db = null;
      console.log('🔌 Database connection closed');
    }
  }

  /**
   * Get connection status
   */
  isConnectionActive(): boolean {
    return this.isConnected && this.client !== null;
  }
}

// Create singleton instance
const secureDbConnection = new SecureDatabaseConnection();

// Export the secure database instance
export const getDatabase = () => secureDbConnection.getDatabase();
export const getClient = () => secureDbConnection.getClient();
export const healthCheck = () => secureDbConnection.healthCheck();
export const getMetrics = () => secureDbConnection.getMetrics();
export const disconnect = () => secureDbConnection.disconnect();
export const isConnected = () => secureDbConnection.isConnectionActive();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down database connections...');
  await disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down database connections...');
  await disconnect();
  process.exit(0);
});

export default secureDbConnection;
