import { vendors, categories, blogPosts, weddings, rsvps } from "@shared/schema-postgres";
import { db } from "./db";
import { eq, and, desc, like, or } from "drizzle-orm";
import type { 
  Vendor, InsertVendor, 
  Category, InsertCategory,
  BlogPost, InsertBlogPost,
  Wedding, InsertWedding,
  Rsvp, InsertRsvp
} from "@shared/schema-postgres";
import type { CulturalTheme } from "@shared/invitation-types";

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

  // Enhanced Wedding Invitation Generator - Templates (placeholder methods)
  getInvitationTemplates(_filters: { 
    category?: string; 
    culturalTheme?: string; 
    search?: string; 
    limit?: number; 
    offset?: number; 
  }): Promise<any[]>;
  getInvitationTemplate(_id: string): Promise<any | undefined>;
  getTemplateCategories(): Promise<{ id: string; name: string; count: number }[]>;
  getCulturalThemes(): Promise<CulturalTheme[]>;
  trackTemplateEvent(_eventData: any): Promise<void>;
  createGeneratedInvitation(_data: any): Promise<any>;
  getGeneratedInvitation(_id: string): Promise<any | undefined>;
  getGeneratedInvitationByToken(_token: string): Promise<any | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Vendors
  async getVendors(_filters: { category?: string; location?: string; search?: string }): Promise<Vendor[]> {
    let query = db.select().from(vendors);
    
    const conditions: any[] = [];
    
    if (_filters.category) {
      conditions.push(eq(vendors.category, _filters.category));
    }
    
    if (_filters.location) {
      conditions.push(eq(vendors.location, _filters.location));
    }
    
    if (_filters.search) {
      conditions.push(
        or(
          like(vendors.name, `%${_filters.search}%`),
          like(vendors.description, `%${_filters.search}%`),
          like(vendors.services, `%${_filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async getVendor(_id: number): Promise<Vendor | undefined> {
    const result = await db.select().from(vendors).where(eq(vendors.id, _id));
    return result[0] || undefined;
  }

  async getFeaturedVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).where(eq(vendors.featured, true));
  }

  async createVendor(_vendor: InsertVendor): Promise<Vendor> {
    const result = await db.insert(vendors).values(_vendor).returning();
    return result[0]!;
  }

  async updateVendor(_id: number, _updateData: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const result = await db.update(vendors)
      .set(_updateData)
      .where(eq(vendors.id, _id))
      .returning();
    return result[0] || undefined;
  }

  async deleteVendor(_id: number): Promise<void> {
          await db.delete(vendors).where(eq(vendors.id, _id));
  }

  async getVendorByEmail(_email: string): Promise<Vendor | undefined> {
          const result = await db.select().from(vendors).where(eq(vendors.email, _email));
    return result[0] || undefined;
  }

  // Reviews - Not implemented in SQLite schema yet

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(_slug: string): Promise<Category | undefined> {
          const result = await db.select().from(categories).where(eq(categories.slug, _slug));
    return result[0];
  }

  async createCategory(_category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(_category).returning();
    return result[0]!;
  }

  // Blog Posts
  async getBlogPosts(_published?: boolean): Promise<BlogPost[]> {
    let query = db.select().from(blogPosts);
    
    if (_published !== undefined) {
      query = query.where(eq(blogPosts.published, _published)) as any;
    }
    
    return await query.orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(_slug: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, _slug));
    return result[0] || undefined;
  }

  async createBlogPost(_post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(_post).returning();
    return result[0]!;
  }

  // Business Submissions - Not implemented in SQLite schema yet
  // Contacts - Not implemented in SQLite schema yet

  // Weddings
  async getWeddings(): Promise<Wedding[]> {
    return await db.select().from(weddings).orderBy(desc(weddings.createdAt));
  }

  async getWedding(slug: string): Promise<Wedding | undefined> {
    // Note: weddings table doesn't have a slug field, so we'll use id for now
    // This should be updated when slug field is added to the schema
    const result = await db.select().from(weddings).where(eq(weddings.id, parseInt(slug) || 0));
    return result[0] || undefined;
  }

  async createWedding(_wedding: InsertWedding): Promise<Wedding> {
    // Generate a unique slug from the couple names
    const slug = `${_wedding.coupleName.toLowerCase()}-${Date.now()}`.replace(/[^a-z0-9-]/g, '-');
    const weddingWithSlug = { ..._wedding, slug };
    const result = await db.insert(weddings).values(weddingWithSlug).returning();
    return result[0]!;
  }

  // RSVPs
  async getWeddingRsvps(weddingId: number): Promise<Rsvp[]> {
    return await db.select().from(rsvps).where(eq(rsvps.weddingId, weddingId)).orderBy(desc(rsvps.createdAt));
  }

  async createRsvp(_rsvp: InsertRsvp): Promise<Rsvp> {
    const result = await db.insert(rsvps).values(_rsvp).returning();
    return result[0]!;
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
      .where(and(eq(rsvps.weddingId, weddingId), eq(rsvps.email, email)));
    return result[0] || undefined;
  }

  async updateRsvp(rsvpId: number, updateData: any): Promise<Rsvp | undefined> {
    const result = await db.update(rsvps)
      .set(updateData)
      .where(eq(rsvps.id, rsvpId))
      .returning();
    return result[0] || undefined;
  }

  // Reviews (placeholder implementations)
  async getVendorReviews(_vendorId: number): Promise<any[]> {
    // Placeholder implementation - return empty array for now
    console.log(`Getting reviews for vendor ${_vendorId}`);
    return [];
  }

  async createReview(_reviewData: any): Promise<any> {
    // Placeholder implementation - return the data with an ID
    console.log('Creating review:', _reviewData);
    return { id: Date.now(), ..._reviewData, createdAt: new Date().toISOString() };
  }

  // Business Submissions (placeholder implementation)
  async createBusinessSubmission(_submissionData: any): Promise<any> {
    // Placeholder implementation - return the data with an ID
    console.log('Creating business submission:', _submissionData);
    return { id: Date.now(), ..._submissionData, createdAt: new Date().toISOString(), status: 'pending' };
  }

  // Contact (placeholder implementation)
  async createContact(_contactData: any): Promise<any> {
    // Placeholder implementation - return the data with an ID
    console.log('Creating contact:', _contactData);
    return { id: Date.now(), ..._contactData, createdAt: new Date().toISOString() };
  }

  // Enhanced Wedding Invitation Generator - Templates
  async getInvitationTemplates(_filters: { 
    category?: string; 
    culturalTheme?: string; 
    search?: string; 
    limit?: number; 
    offset?: number; 
  }): Promise<any[]> {
    // Use mock database for now - replace with real DB when PostgreSQL is set up
    const { mockDb, initializeMockData } = await import('./mock-db');
    await initializeMockData();
    
    const whereClause: any = {};
    if (_filters.category) whereClause.category = _filters.category;
    if (_filters.culturalTheme) whereClause.culturalTheme = _filters.culturalTheme;
    if (_filters.search) whereClause.name = { like: `%${_filters.search}%` };
    
    return await mockDb.invitationTemplates.findMany({ where: whereClause });
  }

  async getInvitationTemplate(_id: string): Promise<any | undefined> {
    const { mockDb } = await import('./mock-db');
    const template = await mockDb.invitationTemplates.findUnique(_id);
    return template || undefined;
  }

  async getTemplateCategories(): Promise<{ id: string; name: string; count: number }[]> {
    const { mockDb, initializeMockData } = await import('./mock-db');
    await initializeMockData();
    
    const templates = await mockDb.invitationTemplates.findMany();
    const categoryMap = new Map<string, number>();
    
    templates.forEach(template => {
      const count = categoryMap.get(template.category) || 0;
      categoryMap.set(template.category, count + 1);
    });
    
    return Array.from(categoryMap.entries()).map(([id, count]) => ({
      id,
      name: this.formatCategoryName(id),
      count
    }));
  }

  async getCulturalThemes(): Promise<CulturalTheme[]> {
    const { culturalThemes } = await import('./mock-db');
    return culturalThemes;
  }

  async trackTemplateEvent(_eventData: any): Promise<void> {
    // Placeholder implementation - use mock database for now
    console.log('Tracking template event:', _eventData);
  }

  async createGeneratedInvitation(_data: any): Promise<any> {
    // Use mock database for now - replace with real DB when PostgreSQL is set up
    const { mockDb } = await import('./mock-db');
    return await mockDb.generatedInvitations.create(_data);
  }

  async getGeneratedInvitation(_id: string): Promise<any | undefined> {
    // Use mock database for now - replace with real DB when PostgreSQL is set up
    const { mockDb } = await import('./mock-db');
    return await mockDb.generatedInvitations.findUnique(_id);
  }

  async getGeneratedInvitationByToken(_token: string): Promise<any | undefined> {
    // Use mock database for now - replace with real DB when PostgreSQL is set up
    const { mockDb } = await import('./mock-db');
    return await mockDb.generatedInvitations.findByToken(_token);
  }

  private formatCategoryName(category: string): string {
    const categoryNames: Record<string, string> = {
      'goan-beach': 'Goan Beach',
      'christian': 'Christian',
      'hindu': 'Hindu',
      'muslim': 'Muslim',
      'modern': 'Modern',
      'floral': 'Floral'
    };
    return categoryNames[category] || category;
  }
}

export const storage: IStorage = new DatabaseStorage();