#!/usr/bin/env node

/**
 * Database Merge Script
 * 
 * This script helps merge SQLite data with PostgreSQL
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import postgres from "postgres";
import Database from "better-sqlite3";
import * as pgSchema from "@shared/schema-postgres";
import * as sqliteSchema from "@shared/schema-sqlite";
import { sql } from "drizzle-orm";

async function checkDatabaseStatus() {
  console.log("🔍 Checking Database Status...\n");

  // Check environment
  const postgresUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  console.log(`Environment Variables:`);
  console.log(`  DATABASE_URL: ${postgresUrl ? "SET" : "NOT SET"}`);
  console.log(`  NODE_ENV: ${process.env.NODE_ENV || "development"}\n`);

  // Check SQLite
  try {
    const sqliteDb = drizzleSqlite(new Database("wedding.db"), { schema: sqliteSchema });
    const vendors = await sqliteDb.select().from(sqliteSchema.vendors);
    const categories = await sqliteDb.select().from(sqliteSchema.categories);
    const blogPosts = await sqliteDb.select().from(sqliteSchema.blogPosts);
    
    console.log("📊 SQLite Database Status:");
    console.log(`  Vendors: ${vendors.length} records`);
    console.log(`  Categories: ${categories.length} records`);
    console.log(`  Blog Posts: ${blogPosts.length} records`);
    console.log(`  Status: ✅ ACTIVE\n`);
  } catch (error) {
    console.log("❌ SQLite Database Error:", error.message);
  }

  // Check PostgreSQL
  if (postgresUrl) {
    try {
      const pgClient = postgres(postgresUrl);
      const pgDb = drizzle(pgClient, { schema: pgSchema });
      
      // Test connection
      await pgClient`SELECT 1`;
      console.log("✅ PostgreSQL Connection: SUCCESS");
      
      // Check if tables exist
      const tables = await pgClient`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      console.log(`📊 PostgreSQL Tables: ${tables.length} found`);
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
      
      await pgClient.end();
    } catch (error) {
      console.log("❌ PostgreSQL Connection Error:", error.message);
    }
  } else {
    console.log("❌ PostgreSQL: NOT CONFIGURED");
  }
}

async function mergeDatabases() {
  console.log("🔄 Starting Database Merge...\n");

  const postgresUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!postgresUrl) {
    console.log("❌ DATABASE_URL not set. Please configure PostgreSQL first.");
    console.log("💡 Run: npm run db:setup");
    return;
  }

  try {
    // Connect to databases
    const pgClient = postgres(postgresUrl);
    const pgDb = drizzle(pgClient, { schema: pgSchema });
    const sqliteDb = drizzleSqlite(new Database("wedding.db"), { schema: sqliteSchema });

    console.log("📦 Migrating data from SQLite to PostgreSQL...\n");

    // Migrate categories
    const categories = await sqliteDb.select().from(sqliteSchema.categories);
    if (categories.length > 0) {
      console.log(`📋 Migrating ${categories.length} categories...`);
      for (const category of categories) {
        await pgDb.insert(pgSchema.categories).values({
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          color: category.color,
          vendorCount: category.vendorCount || 0,
        });
      }
      console.log("✅ Categories migrated successfully");
    }

    // Migrate vendors
    const vendors = await sqliteDb.select().from(sqliteSchema.vendors);
    if (vendors.length > 0) {
      console.log(`📋 Migrating ${vendors.length} vendors...`);
      for (const vendor of vendors) {
        await pgDb.insert(pgSchema.vendors).values({
          name: vendor.name,
          category: vendor.category,
          description: vendor.description,
          phone: vendor.phone,
          email: vendor.email,
          whatsapp: vendor.whatsapp,
          location: vendor.location,
          address: vendor.address,
          website: vendor.website,
          instagram: vendor.instagram,
          youtube: vendor.youtube,
          facebook: vendor.facebook,
          profileImage: vendor.profileImage,
          coverImage: vendor.coverImage,
          gallery: vendor.gallery,
          services: vendor.services,
          priceRange: vendor.priceRange,
          featured: vendor.featured || false,
          verified: vendor.verified || false,
          rating: vendor.rating || "0",
          reviewCount: vendor.reviewCount || 0,
        });
      }
      console.log("✅ Vendors migrated successfully");
    }

    // Migrate blog posts
    const blogPosts = await sqliteDb.select().from(sqliteSchema.blogPosts);
    if (blogPosts.length > 0) {
      console.log(`📋 Migrating ${blogPosts.length} blog posts...`);
      for (const post of blogPosts) {
        await pgDb.insert(pgSchema.blogPosts).values({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          imageUrl: post.imageUrl,
          featuredImage: post.featuredImage,
          author: post.author,
          tags: post.tags ? [post.tags] : [],
          published: post.published || false,
        });
      }
      console.log("✅ Blog posts migrated successfully");
    }

    console.log("\n🎉 Database merge completed successfully!");
    console.log("💡 You can now restart the application to use PostgreSQL");

    await pgClient.end();
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

// Main execution
const command = process.argv[2];

if (command === "merge") {
  mergeDatabases();
} else {
  checkDatabaseStatus();
}
