import { vendors, categories, blogPosts, weddings, rsvps } from "@shared/schema-sqlite";
import { db } from "./db";
import { eq, and, desc, like, or } from "drizzle-orm";
import type { 
  Vendor, InsertVendor, 
  Category, InsertCategory,
  BlogPost, InsertBlogPost,
  Wedding, InsertWedding,
  Rsvp, InsertRsvp
} from "@shared/schema-sqlite";

export interface IStorage {
  // Vendors
  getVendors(filters: { category?: string; location?: string; search?: string }): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  getFeaturedVendors(): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Blog Posts
  getBlogPosts(published?: boolean): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;

  // Weddings
  getWeddings(): Promise<Wedding[]>;
  getWedding(slug: string): Promise<Wedding | undefined>;
  createWedding(wedding: InsertWedding): Promise<Wedding>;

  // RSVPs
  getWeddingRsvps(weddingId: number): Promise<Rsvp[]>;
  createRsvp(rsvp: InsertRsvp): Promise<Rsvp>;


}

export class DatabaseStorage implements IStorage {
  // Vendors
  async getVendors(filters: { category?: string; location?: string; search?: string }): Promise<Vendor[]> {
    let query = db.select().from(vendors);
    
    const conditions: any[] = [];
    
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
    
    return await query;
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const result = await db.select().from(vendors).where(eq(vendors.id, id));
    return result[0] || undefined;
  }

  async getFeaturedVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).where(eq(vendors.featured, true));
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const result = await db.insert(vendors).values(vendor).returning();
    return result[0];
  }

  // Reviews - Not implemented in SQLite schema yet

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug));
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  // Blog Posts
  async getBlogPosts(published?: boolean): Promise<BlogPost[]> {
    let query = db.select().from(blogPosts);
    
    if (published !== undefined) {
      query = query.where(eq(blogPosts.published, published)) as any;
    }
    
    return await query.orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return result[0] || undefined;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(post).returning();
    return result[0];
  }

  // Business Submissions - Not implemented in SQLite schema yet
  // Contacts - Not implemented in SQLite schema yet

  // Weddings
  async getWeddings(): Promise<Wedding[]> {
    return await db.select().from(weddings).orderBy(desc(weddings.createdAt));
  }

  async getWedding(slug: string): Promise<Wedding | undefined> {
    const result = await db.select().from(weddings).where(eq(weddings.slug, slug));
    return result[0] || undefined;
  }

  async createWedding(wedding: InsertWedding): Promise<Wedding> {
    // Generate a unique slug from the couple names
    const slug = `${wedding.brideName.toLowerCase()}-${wedding.groomName.toLowerCase()}-${Date.now()}`.replace(/[^a-z0-9-]/g, '-');
    const weddingWithSlug = { ...wedding, slug };
    const result = await db.insert(weddings).values(weddingWithSlug).returning();
    return result[0];
  }

  // RSVPs
  async getWeddingRsvps(weddingId: number): Promise<Rsvp[]> {
    return await db.select().from(rsvps).where(eq(rsvps.weddingId, weddingId)).orderBy(desc(rsvps.createdAt));
  }

  async createRsvp(rsvp: InsertRsvp): Promise<Rsvp> {
    const result = await db.insert(rsvps).values(rsvp).returning();
    return result[0];
  }

  async getWeddingBySlug(slug: string): Promise<Wedding | undefined> {
    return this.getWedding(slug);
  }

  async getAllWeddings(): Promise<Wedding[]> {
    return this.getWeddings();
  }

  async getRsvpsByWeddingId(weddingId: number): Promise<Rsvp[]> {
    return this.getWeddingRsvps(weddingId);
  }

  async getRsvpByEmail(weddingId: number, email: string): Promise<Rsvp | undefined> {
    const result = await db.select().from(rsvps)
      .where(and(eq(rsvps.weddingId, weddingId), eq(rsvps.guestEmail, email)));
    return result[0] || undefined;
  }

  async updateRsvp(rsvpId: number, updateData: any): Promise<Rsvp | undefined> {
    const result = await db.update(rsvps)
      .set(updateData)
      .where(eq(rsvps.id, rsvpId))
      .returning();
    return result[0] || undefined;
  }


}

export const storage: IStorage = new DatabaseStorage();