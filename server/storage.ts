import { vendors, categories, blogPosts, weddings, rsvps } from "@shared/schema";
import { db } from "./db";
import { eq, and, like, or } from "drizzle-orm";
import type { 
  Vendor, InsertVendor, 
  Category, InsertCategory,
  BlogPost, InsertBlogPost,
  Wedding, InsertWedding,
  Rsvp, InsertRsvp
} from "@shared/schema";
import { redisCache } from "./cache/redis";
import { sql } from "drizzle-orm";

export interface IStorage {
  // Vendors
  getVendors(_filters: { category?: string; location?: string; search?: string }): Promise<Vendor[]>;
  getVendor(_id: number): Promise<Vendor | undefined>;
  getFeaturedVendors(): Promise<Vendor[]>;
  createVendor(_vendor: InsertVendor): Promise<Vendor>;
  updateVendor(_id: number, _updateData: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(_id: number): Promise<void>;
  getVendorByEmail(_email: string): Promise<Vendor | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(_slug: string): Promise<Category | undefined>;
  createCategory(_category: InsertCategory): Promise<Category>;

  // Blog Posts
  getBlogPosts(_published?: boolean): Promise<BlogPost[]>;
  getBlogPost(_slug: string): Promise<BlogPost | undefined>;
  createBlogPost(_post: InsertBlogPost): Promise<BlogPost>;

  // Weddings
  getWeddings(): Promise<Wedding[]>;
  getWedding(_slug: string): Promise<Wedding | undefined>;
  createWedding(_wedding: InsertWedding): Promise<Wedding>;

  // RSVPs
  getWeddingRsvps(_weddingId: number): Promise<Rsvp[]>;
  createRsvp(_rsvp: InsertRsvp): Promise<Rsvp>;

  // Reviews (placeholder methods)
  getVendorReviews(_vendorId: number): Promise<any[]>;
  createReview(_reviewData: any): Promise<any>;

  // Business Submissions (placeholder methods)
  createBusinessSubmission(_submissionData: any): Promise<any>;

  // Contact (placeholder methods)
  createContact(_contactData: any): Promise<any>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalVendors: number;
    totalCategories: number;
    totalBlogPosts: number;
    totalWeddings: number;
    totalRsvps: number;
    invitations: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getVendors(filters: { category?: string; location?: string; search?: string }): Promise<Vendor[]> {
    // Try to get from cache first
          const cachedVendors = await redisCache.getVendors(filters);
    if (cachedVendors) {
      console.log('📦 Cache HIT: Vendors retrieved from Redis');
      return cachedVendors;
    }

    console.log('📦 Cache MISS: Fetching vendors from database');
    
    let query = db.select().from(vendors);
    const conditions = [];

    if (filters.category) {
      conditions.push(eq(vendors.category, filters.category));
    }

    if (filters.location) {
      conditions.push(eq(vendors.location, filters.location));
    }

    if (filters.search) {
      conditions.push(
        or(
          like(vendors.name, `%${filters.search}%`),
          like(vendors.description, `%${filters.search}%`),
          like(vendors.services, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query;
    
    // Cache the result
    await redisCache.setVendors(filters, result);
    
    return result;
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    // Try to get from cache first
    const cachedVendor = await redisCache.getVendor(id);
    if (cachedVendor) {
      console.log('📦 Cache HIT: Vendor retrieved from Redis');
      return cachedVendor;
    }

    console.log('📦 Cache MISS: Fetching vendor from database');
    
    const result = await db.select().from(vendors).where(eq(vendors.id, id));
    const vendor = result[0] || undefined;
    
    // Cache the result if found
    if (vendor) {
      await redisCache.setVendor(id, vendor);
    }
    
    return vendor;
  }

  async getFeaturedVendors(): Promise<Vendor[]> {
    // Try to get from cache first
    const cachedVendors = await redisCache.getFeaturedVendors();
    if (cachedVendors) {
      console.log('📦 Cache HIT: Featured vendors retrieved from Redis');
      return cachedVendors;
    }

    console.log('📦 Cache MISS: Fetching featured vendors from database');
    
    const result = await db.select().from(vendors).where(eq(vendors.featured, true));
    
    // Cache the result
    await redisCache.setFeaturedVendors(result);
    
    return result;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const result = await db.insert(vendors).values(vendor).returning();
    const newVendor = result[0]!;
    
    // Invalidate relevant caches
    await redisCache.invalidateAllVendors();
    
    return newVendor;
  }

  async updateVendor(id: number, updateData: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const result = await db.update(vendors)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    
    const updatedVendor = result[0] || undefined;
    
    if (updatedVendor) {
      // Invalidate relevant caches
      await redisCache.invalidateVendor(id);
    }
    
    return updatedVendor;
  }

  async deleteVendor(id: number): Promise<void> {
    await db.delete(vendors).where(eq(vendors.id, id));
    
    // Invalidate relevant caches
    await redisCache.invalidateVendor(id);
  }

  async getVendorByEmail(_email: string): Promise<Vendor | undefined> {
    const result = await db.select().from(vendors).where(eq(vendors.email, _email));
    return result[0] || undefined;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(_slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, _slug));
    return result[0] || undefined;
  }

  async createCategory(_category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(_category).returning();
    return result[0]!;
  }

  async getBlogPosts(_published: boolean = true): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).where(eq(blogPosts.published, _published));
  }

  async getBlogPost(_slug: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, _slug));
    return result[0] || undefined;
  }

  async createBlogPost(_post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(_post).returning();
    return result[0]!;
  }

  async getWeddings(): Promise<Wedding[]> {
    return await db.select().from(weddings);
  }

  async getWedding(_slug: string): Promise<Wedding | undefined> {
    // Note: weddings table doesn't have a slug field, so we'll use id for now
    // This should be updated when slug field is added to the schema
    const result = await db.select().from(weddings).where(eq(weddings.id, parseInt(_slug) || 0));
    return result[0] || undefined;
  }

  async createWedding(_wedding: InsertWedding): Promise<Wedding> {
    const result = await db.insert(weddings).values(_wedding).returning();
    return result[0]!;
  }

  async getWeddingRsvps(_weddingId: number): Promise<Rsvp[]> {
    return await db.select().from(rsvps).where(eq(rsvps.weddingId, _weddingId));
  }

  async createRsvp(_rsvp: InsertRsvp): Promise<Rsvp> {
    const result = await db.insert(rsvps).values(_rsvp).returning();
    return result[0]!;
  }

  // Placeholder methods for future implementation
  async getVendorReviews(_vendorId: number): Promise<any[]> {
    // TODO: Implement when reviews table is added
    return [];
  }

  async createReview(_reviewData: any): Promise<any> {
    // TODO: Implement when reviews table is added
    return _reviewData;
  }

  async createBusinessSubmission(_submissionData: any): Promise<any> {
    // TODO: Implement when business_submissions table is added
    return _submissionData;
  }

  async createContact(_contactData: any): Promise<any> {
    // TODO: Implement when contacts table is added
    return _contactData;
  }

  async getDashboardStats(): Promise<{
    totalVendors: number;
    totalCategories: number;
    totalBlogPosts: number;
    totalWeddings: number;
    totalRsvps: number;
    invitations: number;
  }> {
    // Try to get from cache first
    const cachedStats = await redisCache.get<{
      totalVendors: number;
      totalCategories: number;
      totalBlogPosts: number;
      totalWeddings: number;
      totalRsvps: number;
      invitations: number;
    }>('dashboard-stats');
    if (cachedStats) {
      return cachedStats;
    }

    const [vendorCount, categoryCount, blogCount, weddingCount, rsvpCount] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(vendors),
      db.select({ count: sql`count(*)` }).from(categories),
      db.select({ count: sql`count(*)` }).from(blogPosts),
      db.select({ count: sql`count(*)` }).from(weddings),
      db.select({ count: sql`count(*)` }).from(rsvps),
    ]);

    const stats = {
      totalVendors: Number(vendorCount[0]?.count || 0),
      totalCategories: Number(categoryCount[0]?.count || 0),
      totalBlogPosts: Number(blogCount[0]?.count || 0),
      totalWeddings: Number(weddingCount[0]?.count || 0),
      totalRsvps: Number(rsvpCount[0]?.count || 0),
      invitations: 0, // Set to 0 since invitation feature was removed
    };

    // Cache the stats for 5 minutes
    await redisCache.set('dashboard-stats', stats, { ttl: 300 });

    return stats;
  }
}

// Initialize Redis connection
export async function initializeStorage() {
  try {
    await redisCache.connect();
    console.log('✅ Storage layer initialized with Redis caching');
  } catch (error) {
    console.error('❌ Failed to initialize Redis cache:', error);
    console.log('⚠️  Continuing without Redis cache');
  }
}

export const storage = new DatabaseStorage();