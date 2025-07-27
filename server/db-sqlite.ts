import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

const sqlite = new Database('wedding.db');
export const db = drizzle({ client: sqlite, schema });
export const pool = null; // Not used in SQLite