#!/usr/bin/env node

/**
 * Simple Database Merge Script
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
    
    // Use raw queries to avoid schema issues
    const vendors = await sqliteDb.run('SELECT COUNT(*) as count FROM vendors');
    const categories = await sqliteDb.run('SELECT COUNT(*) as count FROM categories');
    const blogPosts = await sqliteDb.run('SELECT COUNT(*) as count FROM blog_posts');
    
    console.log("📊 SQLite Database Status:");
    console.log(`  Vendors: ${vendors[0]?.count || 0} records`);
    console.log(`  Categories: ${categories[0]?.count || 0} records`);
    console.log(`  Blog Posts: ${blogPosts[0]?.count || 0} records`);
    console.log(`  Status: ✅ ACTIVE\n`);
  } catch (error) {
    console.log("❌ SQLite Database Error:", error.message);
  }

  // Check PostgreSQL
  if (postgresUrl) {
    try {
      const pgClient = postgres(postgresUrl);
      
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

    // Migrate categories using raw queries
    const categories = await sqliteDb.execute({ 
      sql: 'SELECT name, slug, description, icon, color, vendor_count FROM categories' 
    });
    
    if (categories.length > 0) {
      console.log(`📋 Migrating ${categories.length} categories...`);
      for (const category of categories) {
        await pgDb.insert(pgSchema.categories).values({
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          color: category.color,
          vendorCount: category.vendor_count || 0,
        });
      }
      console.log("✅ Categories migrated successfully");
    }

    // Migrate vendors using raw queries
    const vendors = await sqliteDb.execute({ 
      sql: 'SELECT name, category, description, phone, email, whatsapp, location, address, website, instagram, youtube, facebook, profile_image, cover_image, gallery, services, price_range, featured, verified, rating, review_count FROM vendors' 
    });
    
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
          profileImage: vendor.profile_image,
          coverImage: vendor.cover_image,
          gallery: vendor.gallery ? JSON.parse(vendor.gallery) : [],
          services: vendor.services ? JSON.parse(vendor.services) : [],
          priceRange: vendor.price_range,
          featured: Boolean(vendor.featured),
          verified: Boolean(vendor.verified),
          rating: vendor.rating?.toString() || "0",
          reviewCount: vendor.review_count || 0,
        });
      }
      console.log("✅ Vendors migrated successfully");
    }

    // Migrate blog posts using raw queries
    const blogPosts = await sqliteDb.execute({ 
      sql: 'SELECT title, slug, excerpt, content, image_url, featured_image, author, tags, published FROM blog_posts' 
    });
    
    if (blogPosts.length > 0) {
      console.log(`📋 Migrating ${blogPosts.length} blog posts...`);
      for (const post of blogPosts) {
        await pgDb.insert(pgSchema.blogPosts).values({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          imageUrl: post.image_url,
          featuredImage: post.featured_image,
          author: post.author,
          tags: post.tags ? [post.tags] : [],
          published: Boolean(post.published),
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
