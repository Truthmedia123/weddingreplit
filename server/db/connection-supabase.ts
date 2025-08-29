import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Database connection metrics
interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  failedConnections: number;
  lastHealthCheck: Date;
  averageResponseTime: number;
}

class SupabaseDatabaseConnection {
  private supabase: any = null;
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
    console.log('🔍 Validating Supabase environment...');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'EXISTS' : 'MISSING');
    console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required");
    }
  }

  /**
   * Create Supabase client
   */
  private createSupabaseClient() {
    return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  }

  /**
   * Connect to database using Supabase client
   */
  async connect(): Promise<void> {
    if (this._isConnected) {
      console.log('✅ Already connected to Supabase');
      return;
    }

    console.log('🚀 Initializing Supabase database connection...');

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`📡 Connection attempt ${attempt}...`);
        
        // Create Supabase client
        this.supabase = this.createSupabaseClient();
        
        // Test connection
        const { data, error } = await this.supabase.auth.getSession();
        
        if (error) {
          throw new Error(`Supabase auth error: ${error.message}`);
        }

        console.log('✅ Supabase client connected successfully');
        
        // Create PostgreSQL client for Drizzle ORM
        const connectionString = process.env.DATABASE_URL;
        if (connectionString) {
          this.client = postgres(connectionString, {
            max: 10,
            idle_timeout: 20,
            connect_timeout: 15,
            ssl: false
          });
          
          this.db = drizzle(this.client, { schema });
          console.log('✅ Drizzle ORM initialized with PostgreSQL');
        }

        this._isConnected = true;
        this.connectionRetries = 0;
        this.metrics.totalConnections++;
        this.metrics.lastHealthCheck = new Date();
        
        // Start health check
        this.startHealthCheck();
        
        console.log('🎉 Supabase database connection established successfully');
        return;
        
      } catch (error) {
        console.error(`❌ Connection attempt ${attempt} failed:`, error instanceof Error ? error.message : error);
        this.metrics.failedConnections++;
        
        if (this.client) {
          try {
            await this.client.end();
            this.client = null;
            console.log('🔌 Database connection closed');
          } catch (closeError) {
            console.error('Error closing connection:', closeError);
          }
        }
        
        if (attempt < this.maxRetries) {
          const delay = this.baseRetryDelay * Math.pow(2, attempt - 1);
          console.log(`⏳ Retrying in ${delay}ms... (${attempt}/${this.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw new Error(`Failed to connect to database after ${this.maxRetries} attempts`);
        }
      }
    }
  }

  /**
   * Get Supabase client
   */
  getSupabaseClient() {
    if (!this._isConnected || !this.supabase) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.supabase;
  }

  /**
   * Get Drizzle database instance
   */
  getDatabase() {
    if (!this._isConnected || !this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Get PostgreSQL client
   */
  getClient() {
    if (!this._isConnected || !this.client) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Get connection status
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
   * Health check for database connection
   */
  async healthCheck(): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      if (!this.supabase) {
        return false;
      }

      // Test Supabase connection
      const { data, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.error('Health check failed:', error.message);
        return false;
      }

      const responseTime = Date.now() - startTime;
      this.metrics.lastHealthCheck = new Date();
      this.updateResponseTime(responseTime);
      
      return true;
      
    } catch (error) {
      console.error('Health check error:', error);
      return false;
    }
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
   * Start periodic health check
   */
  private startHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(async () => {
      const isHealthy = await this.healthCheck();
      if (!isHealthy) {
        console.warn('⚠️  Database health check failed');
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    console.log('🔄 Disconnecting from Supabase...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    if (this.client) {
      try {
        await this.client.end();
        console.log('🔌 PostgreSQL client disconnected');
      } catch (error) {
        console.error('Error disconnecting PostgreSQL client:', error);
      }
      this.client = null;
    }
    
    this.supabase = null;
    this.db = null;
    this._isConnected = false;
    
    console.log('✅ Disconnected from Supabase');
  }

  /**
   * Reconnect to database
   */
  async reconnect(): Promise<void> {
    console.log('🔄 Reconnecting to Supabase...');
    await this.disconnect();
    await this.connect();
  }
}

// Create singleton instance
const supabaseDbConnection = new SupabaseDatabaseConnection();

// Export the database instance
export const getDatabase = () => supabaseDbConnection.getDatabase();
export const getClient = () => supabaseDbConnection.getClient();
export const getSupabaseClient = () => supabaseDbConnection.getSupabaseClient();
export const healthCheck = () => supabaseDbConnection.healthCheck();
export const getMetrics = () => supabaseDbConnection.getMetrics();
export const disconnect = () => supabaseDbConnection.disconnect();
export const isConnected = () => supabaseDbConnection.isConnected;

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down Supabase connections...');
  await disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down Supabase connections...');
  await disconnect();
  process.exit(0);
});

export default supabaseDbConnection;
