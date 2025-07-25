import { vendors, reviews, categories, blogPosts, businessSubmissions, contacts, weddings, rsvps, invitationTokens, invitationTemplates } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, or, ilike } from "drizzle-orm";
import type { 
  Vendor, InsertVendor, 
  Review, InsertReview, 
  Category, InsertCategory,
  BlogPost, InsertBlogPost,
  BusinessSubmission, InsertBusinessSubmission,
  Contact, InsertContact,
  Wedding, InsertWedding,
  Rsvp, InsertRsvp,
  InvitationToken, InsertInvitationToken,
  InvitationTemplate, InsertInvitationTemplate
} from "@shared/schema";

export interface IStorage {
  // Vendors
  getVendors(filters: { category?: string; location?: string; search?: string }): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  getFeaturedVendors(): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;

  // Reviews
  getVendorReviews(vendorId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Blog Posts
  getBlogPosts(published?: boolean): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;

  // Business Submissions
  createBusinessSubmission(submission: InsertBusinessSubmission): Promise<BusinessSubmission>;

  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;

  // Weddings
  getWeddings(): Promise<Wedding[]>;
  getWedding(slug: string): Promise<Wedding | undefined>;
  createWedding(wedding: InsertWedding): Promise<Wedding>;

  // RSVPs
  getWeddingRsvps(weddingId: number): Promise<Rsvp[]>;
  createRsvp(rsvp: InsertRsvp): Promise<Rsvp>;

  // Invitation Tokens
  createInvitationToken(token: InsertInvitationToken): Promise<InvitationToken>;
  getInvitationToken(token: string): Promise<InvitationToken | undefined>;
  markTokenAsUsed(token: string): Promise<void>;
  cleanupExpiredTokens(): Promise<void>;

  // Invitation Templates
  getInvitationTemplates(): Promise<InvitationTemplate[]>;
  createInvitationTemplate(template: InsertInvitationTemplate): Promise<InvitationTemplate>;
}

export class DatabaseStorage implements IStorage {
  // Vendors
  async getVendors(filters: { category?: string; location?: string; search?: string }): Promise<Vendor[]> {
    let query = db.select().from(vendors).as('vendors_query');
    
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
          ilike(vendors.name, `%${filters.search}%`),
          ilike(vendors.description, `%${filters.search}%`),
          ilike(vendors.services, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query;
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const result = await db.select().from(vendors).where(eq(vendors.id, id));
    return result[0];
  }

  async getFeaturedVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).where(eq(vendors.featured, true));
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const result = await db.insert(vendors).values(vendor).returning();
    return result[0];
  }

  // Reviews
  async getVendorReviews(vendorId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.vendorId, vendorId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

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
    let query = db.select().from(blogPosts).as('blog_posts_query');
    
    if (published !== undefined) {
      query = query.where(eq(blogPosts.published, published));
    }
    
    return await query.orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return result[0];
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(post).returning();
    return result[0];
  }

  // Business Submissions
  async createBusinessSubmission(submission: InsertBusinessSubmission): Promise<BusinessSubmission> {
    const result = await db.insert(businessSubmissions).values(submission).returning();
    return result[0];
  }

  // Contacts
  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values(contact).returning();
    return result[0];
  }

  // Weddings
  async getWeddings(): Promise<Wedding[]> {
    return await db.select().from(weddings).orderBy(desc(weddings.createdAt));
  }

  async getWedding(slug: string): Promise<Wedding | undefined> {
    const result = await db.select().from(weddings).where(eq(weddings.slug, slug));
    return result[0];
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

  // Invitation Tokens
  async createInvitationToken(token: InsertInvitationToken): Promise<InvitationToken> {
    const result = await db.insert(invitationTokens).values(token).returning();
    return result[0];
  }

  async getInvitationToken(token: string): Promise<InvitationToken | undefined> {
    const result = await db.select().from(invitationTokens).where(eq(invitationTokens.token, token));
    return result[0];
  }

  async markTokenAsUsed(token: string): Promise<void> {
    await db.update(invitationTokens).set({ used: true }).where(eq(invitationTokens.token, token));
  }

  async cleanupExpiredTokens(): Promise<void> {
    await db.delete(invitationTokens).where(sql`${invitationTokens.expiresAt} < NOW()`);
  }

  // Invitation Templates
  async getInvitationTemplates(): Promise<InvitationTemplate[]> {
    return await db.select().from(invitationTemplates).where(eq(invitationTemplates.isActive, true));
  }

  async createInvitationTemplate(template: InsertInvitationTemplate): Promise<InvitationTemplate> {
    const result = await db.insert(invitationTemplates).values(template).returning();
    return result[0];
  }
}

export const storage: IStorage = new DatabaseStorage();