import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import postgres from "postgres";
import Database from "better-sqlite3";
import * as pgSchema from "@shared/schema-postgres";
import * as sqliteSchema from "@shared/schema-sqlite";
import { sql } from "drizzle-orm";

async function migrateToPostgres() {
  console.log("🚀 Starting migration from SQLite to PostgreSQL...");

  // Connect to databases
  const postgresUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!postgresUrl) {
    throw new Error("DATABASE_URL or POSTGRES_URL environment variable is required");
  }

  const pgClient = postgres(postgresUrl);
  const pgDb = drizzle(pgClient, { schema: pgSchema });

  const sqliteDb = drizzleSqlite(new Database("wedding.db"), { schema: sqliteSchema });

  try {
    // Create PostgreSQL tables
    console.log("📋 Creating PostgreSQL tables...");
    
    // Drop existing tables if they exist (be careful in production!)
    await pgDb.execute(sql`DROP TABLE IF EXISTS rsvps CASCADE`);
    await pgDb.execute(sql`DROP TABLE IF EXISTS weddings CASCADE`);
    await pgDb.execute(sql`DROP TABLE IF EXISTS contacts CASCADE`);
    await pgDb.execute(sql`DROP TABLE IF EXISTS business_submissions CASCADE`);
    await pgDb.execute(sql`DROP TABLE IF EXISTS blog_posts CASCADE`);
    await pgDb.execute(sql`DROP TABLE IF EXISTS reviews CASCADE`);
    await pgDb.execute(sql`DROP TABLE IF EXISTS vendors CASCADE`);
    await pgDb.execute(sql`DROP TABLE IF EXISTS categories CASCADE`);

    // Create tables with proper structure
    await pgDb.execute(sql`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        vendor_count INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pgDb.execute(sql`
      CREATE TABLE vendors (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        location TEXT NOT NULL,
        address TEXT,
        website TEXT,
        instagram TEXT,
        youtube TEXT,
        facebook TEXT,
        profile_image TEXT,
        cover_image TEXT,
        gallery TEXT[],
        services TEXT[],
        price_range TEXT,
        featured BOOLEAN DEFAULT false,
        verified BOOLEAN DEFAULT false,
        rating DECIMAL(3,2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pgDb.execute(sql`
      CREATE TABLE reviews (
        id BIGSERIAL PRIMARY KEY,
        vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        images TEXT[],
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pgDb.execute(sql`
      CREATE TABLE blog_posts (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        featured_image TEXT,
        author TEXT NOT NULL,
        tags TEXT[],
        published BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pgDb.execute(sql`
      CREATE TABLE business_submissions (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        location TEXT NOT NULL,
        address TEXT,
        website TEXT,
        instagram TEXT,
        facebook TEXT,
        services TEXT[],
        price_range TEXT,
        status TEXT DEFAULT 'pending',
        reviewed_by TEXT,
        review_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pgDb.execute(sql`
      CREATE TABLE contacts (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        responded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pgDb.execute(sql`
      CREATE TABLE weddings (
        id BIGSERIAL PRIMARY KEY,
        bride_name TEXT NOT NULL,
        groom_name TEXT NOT NULL,
        wedding_date TIMESTAMP NOT NULL,
        venue TEXT NOT NULL,
        venue_address TEXT NOT NULL,
        nuptials_time TEXT NOT NULL,
        reception_time TEXT,
        cover_image TEXT,
        story TEXT,
        slug TEXT NOT NULL UNIQUE,
        rsvp_deadline TIMESTAMP,
        max_guests INTEGER DEFAULT 100,
        is_public BOOLEAN DEFAULT true,
        contact_email TEXT NOT NULL,
        contact_phone TEXT,
        contact_phone2 TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pgDb.execute(sql`
      CREATE TABLE rsvps (
        id BIGSERIAL PRIMARY KEY,
        wedding_id INTEGER REFERENCES weddings(id) ON DELETE CASCADE,
        guest_name TEXT NOT NULL,
        guest_email TEXT NOT NULL,
        guest_phone TEXT,
        attending_ceremony BOOLEAN DEFAULT true,
        attending_reception BOOLEAN DEFAULT true,
        number_of_guests INTEGER DEFAULT 1,
        dietary_restrictions TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    console.log("🔍 Creating indexes...");
    await pgDb.execute(sql`CREATE INDEX vendors_category_idx ON vendors(category)`);
    await pgDb.execute(sql`CREATE INDEX vendors_location_idx ON vendors(location)`);
    await pgDb.execute(sql`CREATE INDEX vendors_featured_idx ON vendors(featured)`);
    await pgDb.execute(sql`CREATE INDEX vendors_rating_idx ON vendors(rating)`);
    await pgDb.execute(sql`CREATE UNIQUE INDEX vendors_email_unique_idx ON vendors(email)`);
    await pgDb.execute(sql`CREATE INDEX reviews_vendor_idx ON reviews(vendor_id)`);
    await pgDb.execute(sql`CREATE INDEX categories_slug_idx ON categories(slug)`);
    await pgDb.execute(sql`CREATE INDEX blog_posts_published_idx ON blog_posts(published)`);
    await pgDb.execute(sql`CREATE INDEX weddings_slug_idx ON weddings(slug)`);
    await pgDb.execute(sql`CREATE INDEX rsvps_wedding_idx ON rsvps(wedding_id)`);

    // Migrate data
    console.log("📦 Migrating data...");

    // Migrate categories
    const categories = await sqliteDb.select().from(sqliteSchema.categories);
    if (categories.length > 0) {
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
      console.log(`✅ Migrated ${categories.length} categories`);
    }

    // Migrate vendors
    const vendors = await sqliteDb.select().from(sqliteSchema.vendors);
    if (vendors.length > 0) {
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
      console.log(`✅ Migrated ${vendors.length} vendors`);
    }

    // Migrate blog posts
    const blogPosts = await sqliteDb.select().from(sqliteSchema.blogPosts);
    if (blogPosts.length > 0) {
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
      console.log(`✅ Migrated ${blogPosts.length} blog posts`);
    }

    // Migrate weddings
    const weddings = await sqliteDb.select().from(sqliteSchema.weddings);
    if (weddings.length > 0) {
      for (const wedding of weddings) {
        await pgDb.insert(pgSchema.weddings).values({
          brideName: wedding.brideName,
          groomName: wedding.groomName,
          weddingDate: wedding.weddingDate,
          venue: wedding.venue,
          venueAddress: wedding.venueAddress,
          nuptialsTime: wedding.nuptialsTime,
          receptionTime: wedding.receptionTime,
          coverImage: wedding.coverImage,
          story: wedding.story,
          slug: wedding.slug,
          rsvpDeadline: wedding.rsvpDeadline,
          maxGuests: wedding.maxGuests || 100,
          isPublic: wedding.isPublic !== false,
          contactEmail: wedding.contactEmail,
          contactPhone: wedding.contactPhone,
          contactPhone2: wedding.contactPhone2,
        });
      }
      console.log(`✅ Migrated ${weddings.length} weddings`);
    }

    console.log("🎉 Migration completed successfully!");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pgClient.end();
  }
}

// Run migration
if (require.main === module) {
  migrateToPostgres().catch(console.error);
}

export { migrateToPostgres };