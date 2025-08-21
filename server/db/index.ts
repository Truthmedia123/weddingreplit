/**
 * 🔒 SECURE DATABASE MODULE INDEX
 * 
 * This module exports all secure database utilities and services.
 * Use these exports for all database operations in the application.
 */

// Secure connection exports
export { 
  getDatabase, 
  getClient, 
  healthCheck as dbHealthCheck, 
  getMetrics as getDbMetrics, 
  disconnect as disconnectDb, 
  isConnected as isDbConnected 
} from './connection';

// Validation exports
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

// Legacy exports (deprecated)
export { db, pool } from '../db';
