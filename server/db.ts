import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema-postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create PostgreSQL connection with proper configuration
const client = postgres(process.env.DATABASE_URL, {
  max: 20, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 10, // Connection timeout
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  prepare: false, // Disable prepared statements for better compatibility
});

export const db = drizzle(client, { schema });
export const pool = client;