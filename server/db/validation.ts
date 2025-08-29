/**
 * 🔒 DATABASE INPUT VALIDATION UTILITIES
 * 
 * This module provides comprehensive input validation for database operations:
 * - SQL injection prevention
 * - Data type validation
 * - Length and format validation
 * - XSS protection
 * - Rate limiting validation
 */

import { z } from 'zod';
import { sql } from 'drizzle-orm';

// Base validation schemas
export const baseValidationSchemas = {
  // ID validation (UUID or numeric)
  id: z.union([
    z.string().uuid(),
    z.number().int().positive()
  ]),
  
  // Email validation
  email: z.string().email().max(255),
  
  // Phone validation
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/).max(20),
  
  // URL validation
  url: z.string().url().max(500),
  
  // Name validation
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s\-'\.]+$/),
  
  // Description validation
  description: z.string().max(1000),
  
  // Price validation
  price: z.union([
    z.string().regex(/^(\d+(\.\d{1,2})?|Free)$/),
    z.number().min(0).max(999999.99)
  ]),
  
  // Date validation
  date: z.union([
    z.string().datetime(),
    z.date()
  ]),
  
  // Boolean validation
  boolean: z.boolean(),
  
  // Array validation
  array: z.array(z.any()).max(100), // Limit array size
  
  // JSON validation
  json: z.record(z.any()).refine((data) => JSON.stringify(data).length <= 10000, {
    message: "JSON data too large (max 10KB)"
  }),
};

// Specific validation schemas for different entities
export const vendorValidation = {
  create: z.object({
    name: baseValidationSchemas.name,
    email: baseValidationSchemas.email,
    phone: baseValidationSchemas.phone,
    whatsapp: baseValidationSchemas.phone,
    website: baseValidationSchemas.url.optional(),
    description: baseValidationSchemas.description,
    category: z.string().max(100),
    location: z.string().max(200),
    priceRange: z.enum(['budget', 'moderate', 'premium', 'luxury']),
    rating: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    services: baseValidationSchemas.array.optional(),
    gallery: baseValidationSchemas.array.optional(),
    featured: baseValidationSchemas.boolean.optional(),
  }),
  
  update: z.object({
    name: baseValidationSchemas.name.optional(),
    email: baseValidationSchemas.email.optional(),
    phone: baseValidationSchemas.phone.optional(),
    whatsapp: baseValidationSchemas.phone.optional(),
    website: baseValidationSchemas.url.optional(),
    description: baseValidationSchemas.description.optional(),
    category: z.string().max(100).optional(),
    location: z.string().max(200).optional(),
    priceRange: z.enum(['budget', 'moderate', 'premium', 'luxury']).optional(),
    rating: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    services: baseValidationSchemas.array.optional(),
    gallery: baseValidationSchemas.array.optional(),
    featured: baseValidationSchemas.boolean.optional(),
  }),
  
  id: z.object({
    id: baseValidationSchemas.id
  })
};



export const rsvpValidation = {
  create: z.object({
    weddingId: baseValidationSchemas.id,
    name: baseValidationSchemas.name,
    email: baseValidationSchemas.email.optional(),
    phone: baseValidationSchemas.phone.optional(),
    response: z.enum(['attending', 'not_attending', 'maybe']),
    guests: z.number().int().min(0).max(10).optional(),
    dietaryRestrictions: z.string().max(500).optional(),
    message: z.string().max(1000).optional(),
  }),
  
  update: z.object({
    name: baseValidationSchemas.name.optional(),
    email: baseValidationSchemas.email.optional(),
    phone: baseValidationSchemas.phone.optional(),
    response: z.enum(['attending', 'not_attending', 'maybe']).optional(),
    guests: z.number().int().min(0).max(10).optional(),
    dietaryRestrictions: z.string().max(500).optional(),
    message: z.string().max(1000).optional(),
  }),
  
  id: z.object({
    id: baseValidationSchemas.id
  })
};

// Search and filter validation
export const searchValidation = {
  query: z.object({
    q: z.string().max(100).optional(),
    category: z.string().max(50).optional(),
    location: z.string().max(100).optional(),
    priceRange: z.enum(['budget', 'moderate', 'premium', 'luxury']).optional(),
    rating: z.number().min(0).max(5).optional(),
    page: z.number().int().min(1).max(1000).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    sortBy: z.enum(['name', 'rating', 'price', 'created_at']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
};

// Rate limiting validation
export const rateLimitValidation = {
  request: z.object({
    ip: z.string().ip(),
    endpoint: z.string().max(100),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    timestamp: z.number().int().positive(),
  })
};

/**
 * Sanitize input to prevent SQL injection and XSS
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      // Remove SQL injection patterns
      .replace(/['";\\]/g, '')
      // Remove XSS patterns
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      // Remove dangerous characters
      .replace(/[<>]/g, '')
      // Trim whitespace
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * Validate and sanitize database input
 */
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: any,
  options: { sanitize?: boolean } = { sanitize: true }
): T {
  // Sanitize input if requested
  const sanitizedData = options.sanitize ? sanitizeInput(data) : data;
  
  // Validate against schema
  return schema.parse(sanitizedData);
}

/**
 * Create safe SQL query with parameterized values
 */
export function createSafeQuery(
  template: string,
  params: Record<string, any>
): { query: string; values: any[] } {
  const values: any[] = [];
  let paramIndex = 1;
  
  // Replace named parameters with positional parameters
  const query = template.replace(/\$\{(\w+)\}/g, (match, paramName) => {
    if (paramName in params) {
      values.push(params[paramName]);
      return `$${paramIndex++}`;
    }
    throw new Error(`Missing parameter: ${paramName}`);
  });
  
  return { query, values };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page?: number, limit?: number) {
  const validatedPage = Math.max(1, page || 1);
  const validatedLimit = Math.min(100, Math.max(1, limit || 10));
  const offset = (validatedPage - 1) * validatedLimit;
  
  return {
    page: validatedPage,
    limit: validatedLimit,
    offset
  };
}

/**
 * Create safe ORDER BY clause
 */
export function createSafeOrderBy(
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  allowedColumns: string[] = []
): string {
  const validSortBy = allowedColumns.includes(sortBy || '') ? sortBy : 'created_at';
  const validSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';
  
  return `${validSortBy} ${validSortOrder}`;
}

/**
 * Validate database operation rate limits
 */
export class DatabaseRateLimiter {
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly windowMs = 60000; // 1 minute
  private readonly maxRequests = 100; // Max requests per window
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requestCounts.get(identifier);
    
    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.requestCounts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }
    
    if (record.count >= this.maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  getRemainingRequests(identifier: string): number {
    const record = this.requestCounts.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - record.count);
  }
  
  reset(identifier: string): void {
    this.requestCounts.delete(identifier);
  }
}

// Export singleton rate limiter
export const dbRateLimiter = new DatabaseRateLimiter();

/**
 * Validate database connection before operations
 */
export async function validateDatabaseConnection(): Promise<boolean> {
  try {
    const enhancedDbConnection = await import('./connection-improved');
    const client = enhancedDbConnection.default.getClient();
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection validation failed:', error);
    return false;
  }
}

/**
 * Create a safe database operation wrapper
 */
export function createSafeDbOperation<T>(
  operation: () => Promise<T>,
  options: {
    validateConnection?: boolean;
    rateLimit?: boolean;
    identifier?: string;
    retries?: number;
  } = {}
): () => Promise<T> {
  return async () => {
    const {
      validateConnection = true,
      rateLimit = true,
      identifier = 'default',
      retries = 2
    } = options;
    
    // Validate database connection
    if (validateConnection) {
      const isConnected = await validateDatabaseConnection();
      if (!isConnected) {
        throw new Error('Database connection not available');
      }
    }
    
    // Check rate limits
    if (rateLimit && !dbRateLimiter.isAllowed(identifier)) {
      throw new Error('Database rate limit exceeded');
    }
    
    // Execute operation with retries
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.error(`Database operation failed (attempt ${attempt}/${retries}):`, error);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    throw lastError || new Error('Database operation failed');
  };
}
