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
 * Uses PostgreSQL/Supabase exclusively for all environments.
 * 
 * NEVER commit .env files with real credentials to version control!
 * Always use .env.example for templates and keep real credentials local only.
 * 
 * If credentials have been exposed:
 * 1. Immediately rotate your database passwords
 * 2. Update your Supabase project settings
 * 3. Check for unauthorized access
 */

// Import the Supabase database connection
import supabaseDbConnection from './db/connection-supabase';

export const getDatabase = () => supabaseDbConnection.getDatabase();
export const getClient = () => supabaseDbConnection.getClient();
export const getSupabaseClient = () => supabaseDbConnection.getSupabaseClient();
export const dbHealthCheck = () => supabaseDbConnection.healthCheck();
export const getDbMetrics = () => supabaseDbConnection.getMetrics();
export const disconnectDb = () => supabaseDbConnection.disconnect();
export const isDbConnected = () => supabaseDbConnection.isConnected;

// Export validation utilities
export * from './db/validation';

// Import database configuration
export { db, pool } from './db-config';

// Validate environment configuration
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required for PostgreSQL connection");
}

console.log('🔄 Database configured for PostgreSQL/Supabase');