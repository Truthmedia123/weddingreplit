/**
 * Database exports
 * 
 * This file provides a unified interface for database access
 * across the application.
 */

// Export the main database instance
export { db, pool } from '../db-config';

// Export secure connection utilities
export { 
  getDatabase, 
  getClient, 
  healthCheck, 
  getMetrics, 
  disconnect, 
  isConnected 
} from './connection';

// Legacy export for backward compatibility
export const getDatabase = () => import('../db-config').then(m => m.db);

// Validation exports (same for both SQLite and PostgreSQL)
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
  invitationValidation,
  rsvpValidation,
  searchValidation,
  rateLimitValidation,
  DatabaseRateLimiter,
  dbRateLimiter
} from './validation';

// Secure storage service
export { secureStorage, SecureStorageService } from './secureStorage';
