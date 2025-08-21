# 🔒 Database Security Implementation

## Overview

This document outlines the comprehensive database security implementation for the wedding invitation application. All database operations now use secure, production-ready patterns with multiple layers of protection.

## Security Features Implemented

### 1. Connection Pooling
- **Configuration**: Configurable pool size (default: 20 connections)
- **Idle Timeout**: Automatic cleanup of idle connections (20s)
- **Connection Lifetime**: Maximum connection lifetime (1 hour)
- **SSL Support**: Production SSL configuration with certificate validation

### 2. Prepared Statements
- **SQL Injection Prevention**: All queries use parameterized statements
- **Drizzle ORM**: Leverages Drizzle's built-in prepared statement support
- **Raw Queries**: Custom query builder with parameter validation

### 3. Input Validation & Sanitization
- **Zod Schemas**: Type-safe validation for all database inputs
- **XSS Protection**: Automatic removal of dangerous HTML/JavaScript
- **SQL Injection Prevention**: Sanitization of user inputs
- **Data Type Validation**: Strict type checking for all fields

### 4. Rate Limiting
- **Database-Level**: Per-operation rate limiting
- **Configurable Limits**: Adjustable request limits per time window
- **Identifier-Based**: Rate limiting by operation type and user

### 5. Error Handling
- **Graceful Degradation**: Connection retry logic with exponential backoff
- **Error Classification**: Different handling for connection vs. data integrity errors
- **Logging**: Comprehensive error logging with context

### 6. Health Monitoring
- **Connection Health**: Real-time database connection monitoring
- **Performance Metrics**: Response time tracking and alerting
- **Health Endpoints**: `/health`, `/health/ready`, `/health/live`

## File Structure

```
server/db/
├── connection.ts      # Secure database connection management
├── validation.ts      # Input validation and sanitization
├── secureStorage.ts   # Secure storage service
└── index.ts          # Module exports
```

## Usage Examples

### Basic Database Operations

```typescript
import { secureStorage, getDatabase } from './db';

// Create a vendor with validation
const vendor = await secureStorage.createVendor({
  name: "Wedding Photography Pro",
  email: "contact@weddingphoto.com",
  description: "Professional wedding photography services",
  categoryId: "photo-1",
  location: "Mumbai, India",
  priceRange: "premium"
});

// Search vendors with pagination and filtering
const results = await secureStorage.searchVendors({
  q: "photography",
  location: "Mumbai",
  priceRange: "premium",
  page: 1,
  limit: 10
});
```

### Direct Database Access

```typescript
import { getDatabase, createSafeDbOperation } from './db';

// Safe database operation with retry logic
const result = await createSafeDbOperation(async () => {
  const db = await getDatabase();
  return await db.select().from(schema.vendors);
}, { 
  identifier: 'get-vendors',
  retries: 3 
})();
```

### Health Monitoring

```typescript
import { dbHealthCheck, getDbMetrics } from './db';

// Check database health
const health = await dbHealthCheck();
console.log('Database Status:', health.status);
console.log('Response Time:', health.responseTime);

// Get connection metrics
const metrics = getDbMetrics();
console.log('Active Connections:', metrics.activeConnections);
console.log('Average Response Time:', metrics.averageResponseTime);
```

## Environment Configuration

### Required Environment Variables

```bash
# Database Connection
DATABASE_URL="postgresql://user:password@host:port/database"

# Connection Pooling
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=20
DB_CONNECT_TIMEOUT=10
DB_MAX_LIFETIME=3600

# Query Timeouts
DB_STATEMENT_TIMEOUT=30000
DB_QUERY_TIMEOUT=30000

# SSL Configuration (Production)
DB_SSL_CA=""
DB_SSL_CERT=""
DB_SSL_KEY=""
```

### Security Best Practices

1. **Environment Variables**: Never commit `.env` files to version control
2. **SSL in Production**: Always use SSL connections in production
3. **Connection Limits**: Set appropriate connection pool limits
4. **Timeouts**: Configure reasonable query and connection timeouts
5. **Regular Updates**: Keep database drivers and ORM updated

## Validation Schemas

### Vendor Validation

```typescript
const vendorSchema = {
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s\-'\.]+$/),
  email: z.string().email().max(255),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/).max(20),
  description: z.string().max(1000),
  categoryId: z.union([z.string().uuid(), z.number().int().positive()]),
  location: z.string().max(200),
  priceRange: z.enum(['budget', 'moderate', 'premium', 'luxury'])
};
```

### Invitation Validation

```typescript
const invitationSchema = {
  templateId: z.union([z.string().uuid(), z.number().int().positive()]),
  formData: z.record(z.any()).max(10000),
  downloadToken: z.string().min(32).max(64),
  expiresAt: z.union([z.string().datetime(), z.date()])
};
```

## Rate Limiting Configuration

### Default Limits

- **General Operations**: 100 requests per minute
- **Search Operations**: 50 requests per minute
- **Write Operations**: 20 requests per minute
- **Analytics Operations**: 10 requests per minute

### Custom Rate Limiting

```typescript
import { dbRateLimiter } from './db';

// Check if operation is allowed
if (!dbRateLimiter.isAllowed('create-vendor')) {
  throw new Error('Rate limit exceeded');
}

// Get remaining requests
const remaining = dbRateLimiter.getRemainingRequests('create-vendor');
```

## Error Handling

### Connection Errors

```typescript
try {
  const db = await getDatabase();
  // Database operations
} catch (error) {
  if (error.code === '57P01') {
    // Admin shutdown - retry after delay
  } else if (error.code === '23505') {
    // Unique violation - don't retry
  } else {
    // Other errors - log and handle appropriately
  }
}
```

### Validation Errors

```typescript
try {
  const validatedData = validateAndSanitize(vendorSchema, inputData);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
    console.error('Validation failed:', error.errors);
  }
}
```

## Monitoring and Alerting

### Health Check Endpoints

- `GET /health` - Comprehensive health check
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe

### Metrics Available

- Connection pool status
- Average response times
- Error rates
- Rate limiting statistics
- Query performance metrics

## Migration Guide

### From Legacy Database Usage

**Before:**
```typescript
import { db } from './db';

const vendors = await db.select().from(schema.vendors);
```

**After:**
```typescript
import { secureStorage } from './db';

const vendors = await secureStorage.searchVendors({});
```

### Backward Compatibility

Legacy `db` and `pool` exports are still available but deprecated. They will be removed in a future version.

## Security Checklist

- [x] Connection pooling implemented
- [x] Prepared statements enabled
- [x] Input validation and sanitization
- [x] Rate limiting at database level
- [x] Comprehensive error handling
- [x] Health monitoring and metrics
- [x] SSL configuration for production
- [x] Environment variable security
- [x] Query timeout configuration
- [x] Connection retry logic

## Troubleshooting

### Common Issues

1. **Connection Timeouts**: Increase `DB_CONNECT_TIMEOUT`
2. **Pool Exhaustion**: Increase `DB_MAX_CONNECTIONS`
3. **Query Timeouts**: Increase `DB_STATEMENT_TIMEOUT`
4. **Rate Limiting**: Adjust rate limits or implement caching

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment.

## Support

For database security issues or questions, refer to:
- Database connection logs
- Health check endpoints
- Error monitoring dashboards
- Security documentation
