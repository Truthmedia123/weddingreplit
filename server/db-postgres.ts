import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema-postgres";
import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import * as sqliteSchema from "@shared/schema-sqlite";

// Connection with proper pooling and security
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// For development, we'll use SQLite if PostgreSQL is not configured
let client: any;
let db: any;

if (connectionString && connectionString !== 'postgresql://username:password@host:port/dbname') {
  // Configure postgres client with security and performance settings
  client = postgres(connectionString, {
    max: 20, // Maximum connections in pool
    idle_timeout: 20, // Close idle connections after 20s
    connect_timeout: 10, // Connection timeout
    ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
    prepare: false, // Disable prepared statements for better compatibility
  });
  
  db = drizzle(client, { schema });
} else {
  console.warn('⚠️  PostgreSQL not configured, falling back to SQLite for development');
  // Fall back to SQLite for development
  const sqlite = new Database('wedding.db');
  db = drizzleSqlite(sqlite, { schema: sqliteSchema });
  client = null;
}

export { db };

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (client) {
      await client`SELECT 1`;
    } else {
      // For SQLite, just check if we can query
      await db.execute({ sql: 'SELECT 1' });
    }
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.end();
  }
}