#!/usr/bin/env node

/**
 * Test Supabase Connection Script
 * 
 * This script tests the Supabase PostgreSQL connection
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as pgSchema from "@shared/schema-postgres";

async function testSupabaseConnection() {
  console.log("🔍 Testing Supabase Connection...\n");

  const postgresUrl = process.env.DATABASE_URL;
  
  if (!postgresUrl) {
    console.log("❌ DATABASE_URL not found in environment variables");
    console.log("💡 Please create a .env file with your Supabase connection details");
    console.log("📝 See create-env-file.md for instructions");
    return;
  }

  console.log("✅ DATABASE_URL found");
  console.log(`🔗 Connection: ${postgresUrl.replace(/:[^:@]*@/, ':****@')}\n`);

  try {
    // Test connection
    const pgClient = postgres(postgresUrl);
    console.log("🔄 Testing connection...");
    
    await pgClient`SELECT 1`;
    console.log("✅ Connection successful!\n");

    // Check existing tables
    console.log("📊 Checking existing tables...");
    const tables = await pgClient`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log("📋 No tables found - ready for migration");
    } else {
      console.log(`📋 Found ${tables.length} existing tables:`);
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }

    // Check if we can create tables
    console.log("\n🔧 Testing table creation...");
    const testTable = await pgClient`
      CREATE TABLE IF NOT EXISTS test_connection (
        id SERIAL PRIMARY KEY,
        message TEXT DEFAULT 'Connection test successful'
      )
    `;
    console.log("✅ Table creation test successful");

    // Clean up test table
    await pgClient`DROP TABLE IF EXISTS test_connection`;
    console.log("🧹 Cleaned up test table");

    await pgClient.end();
    
    console.log("\n🎉 Supabase connection is ready for migration!");
    console.log("💡 Run: npm run db:migrate-postgres");

  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check your DATABASE_URL format");
    console.log("2. Verify your Supabase project is active");
    console.log("3. Ensure your database password is correct");
    console.log("4. Check if your IP is allowed in Supabase");
  }
}

testSupabaseConnection();
