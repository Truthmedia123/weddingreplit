#!/usr/bin/env node

/**
 * Seed Supabase Database Script
 * 
 * This script seeds the Supabase database with initial data
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as pgSchema from "@shared/schema-postgres";

async function seedSupabase() {
  console.log("🌱 Seeding Supabase Database...\n");

  const postgresUrl = process.env.DATABASE_URL;
  
  if (!postgresUrl) {
    console.log("❌ DATABASE_URL not found in environment variables");
    return;
  }

  try {
    const pgClient = postgres(postgresUrl);
    const pgDb = drizzle(pgClient, { schema: pgSchema });

    console.log("✅ Connected to Supabase\n");

    // Seed some sample categories
    console.log("\n📋 Seeding categories...");
    
    const categories = [
      {
        name: "Photography",
        slug: "photography",
        description: "Professional wedding photographers",
        icon: "camera",
        color: "#FF6B6B",
        vendorCount: 0
      },
      {
        name: "Catering",
        slug: "catering",
        description: "Wedding catering services",
        icon: "utensils",
        color: "#4ECDC4",
        vendorCount: 0
      },
      {
        name: "Venues",
        slug: "venues",
        description: "Wedding venues and locations",
        icon: "map-pin",
        color: "#45B7D1",
        vendorCount: 0
      },
      {
        name: "Decoration",
        slug: "decoration",
        description: "Wedding decoration services",
        icon: "flower",
        color: "#96CEB4",
        vendorCount: 0
      }
    ];

    for (const category of categories) {
      try {
        await pgDb.insert(pgSchema.categories).values(category);
        console.log(`✅ Added category: ${category.name}`);
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`⏭️  Category already exists: ${category.name}`);
        } else {
          console.log(`❌ Error adding category ${category.name}:`, error.message);
        }
      }
    }

    await pgClient.end();
    
    console.log("\n🎉 Supabase database seeded successfully!");
    console.log("💡 Your application is ready to use with Supabase!");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
}

seedSupabase();
