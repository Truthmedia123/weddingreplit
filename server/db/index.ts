/**
 * Database exports
 * 
 * This file provides a unified interface for database access
 * across the application.
 */

import { sql } from 'drizzle-orm';

// Export the main database instance
export { db, pool } from '../db-config';

// Export secure connection utilities
export { 
  getClient, 
  healthCheck, 
  getMetrics, 
  disconnect, 
  isConnected 
} from './connection';

// Database initialization function
export const initializeDatabase = async () => {
  try {
    const { db } = await import('../db-config');
    // Test the connection
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Legacy export for backward compatibility
export const getDatabase = () => import('../db-config').then(m => m.db);

// Validation exports for PostgreSQL
export {
  validateAndSanitize,
  sanitizeInput,
  createSafeQuery,
  validatePagination,
  createSafeOrderBy,
  createSafeDbOperation,
  validateDatabaseConnection,
  baseValidationSchemas,
  vendorValidation,

  rsvpValidation,
  searchValidation,
  rateLimitValidation,
  DatabaseRateLimiter,
  dbRateLimiter
} from './validation';

// Secure storage service
export { secureStorage, SecureStorageService } from './secureStorage';
