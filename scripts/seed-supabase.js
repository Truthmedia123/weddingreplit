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

    // Seed invitation templates
    console.log("📋 Seeding invitation templates...");
    
    const templates = [
      {
        id: "goan-beach-1",
        name: "Goan Beach Paradise",
        category: "goan-beach",
        style: "tropical",
        description: "Beautiful beach-themed invitation perfect for Goan weddings",
        previewUrl: "/images/templates/goan-beach-1.jpg",
        templateData: {
          background: "beach-sunset",
          fonts: ["Playfair Display", "Montserrat"],
          colors: ["#FF6B35", "#F7931E", "#FFFFFF"]
        },
        features: ["QR Code", "Digital RSVP", "Photo Gallery"],
        colors: ["#FF6B35", "#F7931E", "#FFFFFF"],
        price: "Free",
        popular: true,
        premium: false,
        isActive: true
      },
      {
        id: "christian-elegant",
        name: "Christian Elegance",
        category: "christian",
        style: "elegant",
        description: "Elegant Christian wedding invitation with traditional elements",
        previewUrl: "/images/templates/christian-elegant.jpg",
        templateData: {
          background: "floral-white",
          fonts: ["Crimson Text", "Open Sans"],
          colors: ["#2C3E50", "#E74C3C", "#ECF0F1"]
        },
        features: ["QR Code", "Digital RSVP", "Ceremony Details"],
        colors: ["#2C3E50", "#E74C3C", "#ECF0F1"],
        price: "Free",
        popular: true,
        premium: false,
        isActive: true
      },
      {
        id: "hindu-traditional",
        name: "Hindu Traditional",
        category: "hindu",
        style: "traditional",
        description: "Traditional Hindu wedding invitation with cultural elements",
        previewUrl: "/images/templates/hindu-traditional.jpg",
        templateData: {
          background: "mandala-pattern",
          fonts: ["Noto Sans Devanagari", "Roboto"],
          colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"]
        },
        features: ["QR Code", "Digital RSVP", "Ceremony Schedule"],
        colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
        price: "Free",
        popular: true,
        premium: false,
        isActive: true
      },
      {
        id: "muslim-modern",
        name: "Muslim Modern",
        category: "muslim",
        style: "modern",
        description: "Modern Muslim wedding invitation with Islamic calligraphy",
        previewUrl: "/images/templates/muslim-modern.jpg",
        templateData: {
          background: "geometric-pattern",
          fonts: ["Amiri", "Lato"],
          colors: ["#2E86AB", "#A23B72", "#F18F01"]
        },
        features: ["QR Code", "Digital RSVP", "Prayer Times"],
        colors: ["#2E86AB", "#A23B72", "#F18F01"],
        price: "Free",
        popular: true,
        premium: false,
        isActive: true
      },
      {
        id: "modern-minimal",
        name: "Modern Minimalist",
        category: "modern",
        style: "minimalist",
        description: "Clean and modern minimalist wedding invitation",
        previewUrl: "/images/templates/modern-minimal.jpg",
        templateData: {
          background: "clean-white",
          fonts: ["Inter", "Poppins"],
          colors: ["#000000", "#666666", "#FFFFFF"]
        },
        features: ["QR Code", "Digital RSVP", "Minimal Design"],
        colors: ["#000000", "#666666", "#FFFFFF"],
        price: "Free",
        popular: true,
        premium: false,
        isActive: true
      }
    ];

    for (const template of templates) {
      try {
        await pgDb.insert(pgSchema.invitationTemplates).values(template);
        console.log(`✅ Added template: ${template.name}`);
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`⏭️  Template already exists: ${template.name}`);
        } else {
          console.log(`❌ Error adding template ${template.name}:`, error.message);
        }
      }
    }

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
