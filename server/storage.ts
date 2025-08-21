import { vendors, categories, blogPosts, weddings, rsvps } from "@shared/schema-postgres";
import { invitationTemplates, generatedInvitations, invitationAnalytics } from "@shared/schema-postgres";
import { db } from "./db";
import { eq, and, desc, like, or, count } from "drizzle-orm";
import type { 
  Vendor, InsertVendor, 
  Category, InsertCategory,
  BlogPost, InsertBlogPost,
  Wedding, InsertWedding,
  Rsvp, InsertRsvp,
  InvitationTemplate, InsertInvitationTemplate,
  GeneratedInvitation, InsertGeneratedInvitation,
  InvitationAnalytics, InsertInvitationAnalytics
} from "@shared/schema-postgres";
import type { CulturalTheme } from "@shared/invitation-types";

export interface IStorage {
  // Vendors
  getVendors(filters: { category?: string; location?: string; search?: string }): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  getFeaturedVendors(): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, updateData: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<void>;
  getVendorByEmail(email: string): Promise<Vendor | undefined>;

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

  // Reviews (placeholder methods)
  getVendorReviews(vendorId: number): Promise<any[]>;
  createReview(reviewData: any): Promise<any>;

  // Business Submissions (placeholder methods)
  createBusinessSubmission(submissionData: any): Promise<any>;

  // Contact (placeholder methods)
  createContact(contactData: any): Promise<any>;

  // Enhanced Wedding Invitation Generator - Templates
  getInvitationTemplates(filters: { 
    category?: string; 
    culturalTheme?: string; 
    search?: string; 
    limit?: number; 
    offset?: number; 
  }): Promise<InvitationTemplate[]>;
  getInvitationTemplate(id: string): Promise<InvitationTemplate | undefined>;
  getTemplateCategories(): Promise<{ id: string; name: string; count: number }[]>;
  getCulturalThemes(): Promise<CulturalTheme[]>;
  trackTemplateEvent(eventData: InsertInvitationAnalytics): Promise<void>;
  createGeneratedInvitation(data: InsertGeneratedInvitation): Promise<GeneratedInvitation>;
  getGeneratedInvitation(id: string): Promise<GeneratedInvitation | undefined>;
  getGeneratedInvitationByToken(token: string): Promise<GeneratedInvitation | undefined>;
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

  async updateVendor(id: number, updateData: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const result = await db.update(vendors)
      .set(updateData)
      .where(eq(vendors.id, id))
      .returning();
    return result[0] || undefined;
  }

  async deleteVendor(id: number): Promise<void> {
    await db.delete(vendors).where(eq(vendors.id, id));
  }

  async getVendorByEmail(email: string): Promise<Vendor | undefined> {
    const result = await db.select().from(vendors).where(eq(vendors.email, email));
    return result[0] || undefined;
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

  // Reviews (placeholder implementations)
  async getVendorReviews(vendorId: number): Promise<any[]> {
    // Placeholder implementation - return empty array for now
    console.log(`Getting reviews for vendor ${vendorId}`);
    return [];
  }

  async createReview(reviewData: any): Promise<any> {
    // Placeholder implementation - return the data with an ID
    console.log('Creating review:', reviewData);
    return { id: Date.now(), ...reviewData, createdAt: new Date().toISOString() };
  }

  // Business Submissions (placeholder implementation)
  async createBusinessSubmission(submissionData: any): Promise<any> {
    // Placeholder implementation - return the data with an ID
    console.log('Creating business submission:', submissionData);
    return { id: Date.now(), ...submissionData, createdAt: new Date().toISOString(), status: 'pending' };
  }

  // Contact (placeholder implementation)
  async createContact(contactData: any): Promise<any> {
    // Placeholder implementation - return the data with an ID
    console.log('Creating contact:', contactData);
    return { id: Date.now(), ...contactData, createdAt: new Date().toISOString() };
  }

  // Enhanced Wedding Invitation Generator - Templates
  async getInvitationTemplates(filters: { 
    category?: string; 
    culturalTheme?: string; 
    search?: string; 
    limit?: number; 
    offset?: number; 
  }): Promise<InvitationTemplate[]> {
    // Use mock database for now - replace with real DB when PostgreSQL is set up
    const { mockDb, initializeMockData } = await import('./mock-db');
    await initializeMockData();
    
    const whereClause: any = {};
    if (filters.category) whereClause.category = filters.category;
    if (filters.culturalTheme) whereClause.culturalTheme = filters.culturalTheme;
    if (filters.search) whereClause.name = { like: `%${filters.search}%` };
    
    return await mockDb.invitationTemplates.findMany({ where: whereClause });
  }

  async getInvitationTemplate(id: string): Promise<InvitationTemplate | undefined> {
    const { mockDb } = await import('./mock-db');
    return await mockDb.invitationTemplates.findUnique(id);
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

  async trackTemplateEvent(eventData: InsertInvitationAnalytics): Promise<void> {
    await db.insert(invitationAnalytics).values(eventData);
  }

  async createGeneratedInvitation(data: InsertGeneratedInvitation): Promise<GeneratedInvitation> {
    const result = await db.insert(generatedInvitations).values(data).returning();
    return result[0];
  }

  async getGeneratedInvitation(id: string): Promise<GeneratedInvitation | undefined> {
    const result = await db.select().from(generatedInvitations)
      .where(eq(generatedInvitations.id, id));
    return result[0] || undefined;
  }

  async getGeneratedInvitationByToken(token: string): Promise<GeneratedInvitation | undefined> {
    const result = await db.select().from(generatedInvitations)
      .where(eq(generatedInvitations.downloadToken, token));
    return result[0] || undefined;
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