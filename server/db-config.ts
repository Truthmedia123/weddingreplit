/**
 * 🔒 DATABASE CONFIGURATION
 * 
 * Handles database connection setup for PostgreSQL/Supabase exclusively.
 */

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Validate required environment variable
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required for PostgreSQL connection");
}

console.log('🔄 Using PostgreSQL/Supabase connection');

// Create PostgreSQL connection pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
    ca: process.env.DB_SSL_CA,
    cert: process.env.DB_SSL_CERT,
    key: process.env.DB_SSL_KEY
  } : false,
});

// Create Drizzle database instance
const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

console.log('✅ PostgreSQL database configured successfully');

export { db, pool };

