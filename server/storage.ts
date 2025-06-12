import { 
  vendors, 
  reviews, 
  categories, 
  blogPosts, 
  businessSubmissions, 
  contacts,
  weddings,
  rsvps,
  type Vendor, 
  type InsertVendor,
  type Review,
  type InsertReview,
  type Category,
  type InsertCategory,
  type BlogPost,
  type InsertBlogPost,
  type BusinessSubmission,
  type InsertBusinessSubmission,
  type Contact,
  type InsertContact,
  type Wedding,
  type InsertWedding,
  type Rsvp,
  type InsertRsvp
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, desc, sql } from "drizzle-orm";

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
}

export class DatabaseStorage implements IStorage {
  async getVendors(filters: { category?: string; location?: string; search?: string }): Promise<Vendor[]> {
    let query = db.select().from(vendors);
    
    const conditions = [];
    
    if (filters.category && filters.category !== 'all') {
      conditions.push(eq(vendors.category, filters.category));
    }
    
    if (filters.location) {
      conditions.push(like(vendors.location, `%${filters.location}%`));
    }
    
    if (filters.search) {
      conditions.push(
        sql`(${vendors.name} ILIKE ${`%${filters.search}%`} OR ${vendors.description} ILIKE ${`%${filters.search}%`})`
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(vendors.featured), desc(vendors.rating));
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async getFeaturedVendors(): Promise<Vendor[]> {
    return db.select().from(vendors)
      .where(eq(vendors.featured, true))
      .orderBy(desc(vendors.rating))
      .limit(6);
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db
      .insert(vendors)
      .values(vendor)
      .returning();
    return newVendor;
  }

  async getVendorReviews(vendorId: number): Promise<Review[]> {
    return db.select().from(reviews)
      .where(eq(reviews.vendorId, vendorId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    
    // Update vendor rating and review count
    const vendorReviews = await this.getVendorReviews(review.vendorId);
    const avgRating = vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length;
    
    await db.update(vendors)
      .set({ 
        rating: avgRating.toFixed(2),
        reviewCount: vendorReviews.length 
      })
      .where(eq(vendors.id, review.vendorId));
    
    return newReview;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async getBlogPosts(published?: boolean): Promise<BlogPost[]> {
    let query = db.select().from(blogPosts);
    
    if (published !== undefined) {
      query = query.where(eq(blogPosts.published, published));
    }
    
    return query.orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db
      .insert(blogPosts)
      .values(post)
      .returning();
    return newPost;
  }

  async createBusinessSubmission(submission: InsertBusinessSubmission): Promise<BusinessSubmission> {
    const [newSubmission] = await db
      .insert(businessSubmissions)
      .values(submission)
      .returning();
    return newSubmission;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async getWeddings(): Promise<Wedding[]> {
    return await db.select().from(weddings).where(eq(weddings.isPublic, true)).orderBy(desc(weddings.weddingDate));
  }

  async getWedding(slug: string): Promise<Wedding | undefined> {
    const [wedding] = await db.select().from(weddings).where(eq(weddings.slug, slug));
    return wedding || undefined;
  }

  async createWedding(wedding: InsertWedding): Promise<Wedding> {
    const [newWedding] = await db
      .insert(weddings)
      .values(wedding)
      .returning();
    return newWedding;
  }

  async getWeddingRsvps(weddingId: number): Promise<Rsvp[]> {
    return await db.select().from(rsvps).where(eq(rsvps.weddingId, weddingId)).orderBy(desc(rsvps.createdAt));
  }

  async createRsvp(rsvp: InsertRsvp): Promise<Rsvp> {
    const [newRsvp] = await db
      .insert(rsvps)
      .values(rsvp)
      .returning();
    return newRsvp;
  }
}

export const storage = new DatabaseStorage();