/**
 * 🔒 SECURE DATABASE CONNECTION
 * 
 * This file provides a secure, production-ready database connection
 * with comprehensive security features:
 * - Connection pooling with proper limits
 * - Prepared statements for SQL injection prevention
 * - Connection error handling and retry logic
 * - Health monitoring and metrics
 * - Rate limiting at database level
 * - Input validation and sanitization
 * 
 * NEVER commit .env files with real credentials to version control!
 * Always use .env.example for templates and keep real credentials local only.
 * 
 * If credentials have been exposed:
 * 1. Immediately rotate your database passwords
 * 2. Update your Supabase project settings
 * 3. Check for unauthorized access
 */

// Import the secure database connection
export { 
  getDatabase, 
  getClient, 
  healthCheck as dbHealthCheck, 
  getMetrics as getDbMetrics, 
  disconnect as disconnectDb, 
  isConnected as isDbConnected 
} from './db/connection';

// Export validation utilities
export * from './db/validation';

// Legacy exports for backward compatibility
// These will be deprecated in favor of the secure connection
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema-postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required. Please check your .env file and ensure it's not committed to version control.");
}

// Create legacy connection (will be removed in future versions)
const client = postgres(process.env.DATABASE_URL, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  prepare: true, // Enable prepared statements for security
});

export const db = drizzle(client, { schema });
export const pool = client;

// Deprecation warning
console.warn('⚠️  DEPRECATION WARNING: Direct db/pool exports are deprecated. Use getDatabase() and getClient() from secure connection instead.');