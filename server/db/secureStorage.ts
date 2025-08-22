/**
 * 🔒 SECURE STORAGE SERVICE
 * 
 * This module provides secure database operations with:
 * - Input validation and sanitization
 * - Prepared statements
 * - Rate limiting
 * - Error handling
 * - Connection management
 */

import { eq, and, desc, like, or, count, sql } from "drizzle-orm";
import { 
  getDatabase, 
  createSafeDbOperation,
  validateAndSanitize,
  vendorValidation,
  invitationValidation,
  rsvpValidation,
  searchValidation,
  validatePagination,
  createSafeOrderBy,
  dbRateLimiter
} from './index';
import * as schema from "@shared/schema-postgres";
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

export class SecureStorageService {
  /**
   * VENDOR OPERATIONS
   */
  
  async createVendor(data: any): Promise<Vendor> {
    const validatedData = validateAndSanitize(vendorValidation.create, data);
    
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      const [vendor] = await db.insert(schema.vendors).values(validatedData).returning();
      return vendor;
    }, { identifier: 'create-vendor' })();
  }
  
  async updateVendor(id: string | number, data: any): Promise<Vendor | null> {
    const validatedId = validateAndSanitize(vendorValidation.id, { id });
    const validatedData = validateAndSanitize(vendorValidation.update, data);
    
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      const [vendor] = await db
        .update(schema.vendors)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(schema.vendors.id, Number(validatedId.id)))
        .returning();
      return vendor || null;
    }, { identifier: 'update-vendor' })();
  }
  
  async getVendor(id: string | number): Promise<Vendor | null> {
    const validatedId = validateAndSanitize(vendorValidation.id, { id });
    
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      const [vendor] = await db
        .select()
        .from(schema.vendors)
        .where(eq(schema.vendors.id, Number(validatedId.id)));
      return vendor || null;
    }, { identifier: 'get-vendor' })();
  }
  
  async deleteVendor(id: string | number): Promise<boolean> {
    const validatedId = validateAndSanitize(vendorValidation.id, { id });
    
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      const [vendor] = await db
        .delete(schema.vendors)
        .where(eq(schema.vendors.id, Number(validatedId.id)))
        .returning();
      return !!vendor;
    }, { identifier: 'delete-vendor' })();
  }
  
  async searchVendors(query: any): Promise<{ vendors: Vendor[]; total: number; page: number; limit: number }> {
    const validatedQuery = validateAndSanitize(searchValidation.query, query);
    const { page, limit, offset } = validatePagination(validatedQuery.page, validatedQuery.limit);
    
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      
      // Build where conditions
      const conditions = [];
      if (validatedQuery.q) {
        conditions.push(
          or(
            like(schema.vendors.name, `%${validatedQuery.q}%`),
            like(schema.vendors.description, `%${validatedQuery.q}%`)
          )
        );
      }
      if (validatedQuery.category) {
        conditions.push(eq(schema.vendors.category, validatedQuery.category));
      }
      if (validatedQuery.location) {
        conditions.push(like(schema.vendors.location, `%${validatedQuery.location}%`));
      }
      if (validatedQuery.priceRange) {
        conditions.push(eq(schema.vendors.priceRange, validatedQuery.priceRange));
      }
      if (validatedQuery.rating) {
        conditions.push(sql`${schema.vendors.rating} >= ${validatedQuery.rating}`);
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const orderBy = createSafeOrderBy(
        validatedQuery.sortBy, 
        validatedQuery.sortOrder, 
        ['name', 'rating', 'price', 'created_at']
      );
      
      // Get total count
      const [{ total }] = await db
        .select({ total: count() })
        .from(schema.vendors)
        .where(whereClause);
      
      // Get vendors
      const vendors = await db
        .select()
        .from(schema.vendors)
        .where(whereClause)
        .orderBy(sql`${orderBy}`)
        .limit(limit)
        .offset(offset);
      
      return { vendors, total: Number(total), page, limit };
    }, { identifier: 'search-vendors' })();
  }
  
  /**
   * INVITATION OPERATIONS
   */
  
  async createInvitation(data: any): Promise<GeneratedInvitation> {
    const validatedData = validateAndSanitize(invitationValidation.create, data);
    
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      const [invitation] = await db
        .insert(schema.generatedInvitations)
        .values({
          id: crypto.randomUUID(),
          ...validatedData
        })
        .returning();
      return invitation;
    }, { identifier: 'create-invitation' })();
  }
  
  async getInvitationByToken(token: string): Promise<GeneratedInvitation | null> {
    const validatedToken = validateAndSanitize(invitationValidation.token, { downloadToken: token });
    
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      const [invitation] = await db
        .select()
        .from(schema.generatedInvitations)
        .where(eq(schema.generatedInvitations.downloadToken, validatedToken.downloadToken));
      return invitation || null;
    }, { identifier: 'get-invitation' })();
  }
  
  async updateInvitationDownloadCount(id: string): Promise<void> {
    const validatedId = validateAndSanitize(invitationValidation.id, { id });
    
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      await db
        .update(schema.generatedInvitations)
        .set({ 
          downloadCount: sql`${schema.generatedInvitations.downloadCount} + 1`,
          lastAccessedAt: new Date()
        })
        .where(eq(schema.generatedInvitations.id, String(validatedId.id)));
    }, { identifier: 'update-invitation' })();
  }
  
  async getInvitationTemplates(category?: string): Promise<InvitationTemplate[]> {
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      const query = db
        .select()
        .from(schema.invitationTemplates)
        .where(eq(schema.invitationTemplates.isActive, true));
      
      if (category) {
        return await query.where(eq(schema.invitationTemplates.category, category)).orderBy(desc(schema.invitationTemplates.popular));
      }
      
      return await query.orderBy(desc(schema.invitationTemplates.popular));
    }, { identifier: 'get-templates' })();
  }
  
  /**
   * RSVP OPERATIONS
   */
  
  async createRSVP(data: any): Promise<Rsvp> {
    const validatedData = validateAndSanitize(rsvpValidation.create, data);
    
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      const [rsvp] = await db
        .insert(schema.rsvps)
        .values({
          ...validatedData,
          weddingId: Number(validatedData.weddingId)
        })
        .returning();
      return rsvp;
    }, { identifier: 'create-rsvp' })();
  }
  
  async updateRSVP(id: string | number, data: any): Promise<Rsvp | null> {
    const validatedId = validateAndSanitize(rsvpValidation.id, { id });
    const validatedData = validateAndSanitize(rsvpValidation.update, data);
    
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      const [rsvp] = await db
        .update(schema.rsvps)
        .set(validatedData)
        .where(eq(schema.rsvps.id, Number(validatedId.id)))
        .returning();
      return rsvp || null;
    }, { identifier: 'update-rsvp' })();
  }
  
  async getRSVPsByWedding(weddingId: string | number): Promise<Rsvp[]> {
    const validatedId = validateAndSanitize(rsvpValidation.id, { id: weddingId });
    
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      return await db
        .select()
        .from(schema.rsvps)
        .where(eq(schema.rsvps.weddingId, Number(validatedId.id)))
        .orderBy(desc(schema.rsvps.createdAt));
    }, { identifier: 'get-rsvps' })();
  }
  
  /**
   * CATEGORY OPERATIONS
   */
  
  async getCategories(): Promise<Category[]> {
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      return await db
        .select()
        .from(schema.categories)
        .orderBy(schema.categories.name);
    }, { identifier: 'get-categories' })();
  }
  
  async getCategory(id: string | number): Promise<Category | null> {
    const validatedId = validateAndSanitize(vendorValidation.id, { id });
    
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      const [category] = await db
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.id, Number(validatedId.id)));
      return category || null;
    }, { identifier: 'get-category' })();
  }
  
  /**
   * ANALYTICS OPERATIONS
   */
  
  async trackInvitationAnalytics(data: any): Promise<InvitationAnalytics> {
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      const [analytics] = await db
        .insert(schema.invitationAnalytics)
        .values({
          id: crypto.randomUUID(),
          ...data
        })
        .returning();
      return analytics;
    }, { identifier: 'track-analytics' })();
  }
  
  /**
   * UTILITY OPERATIONS
   */
  
  async getDatabaseStats(): Promise<{
    vendors: number;
    categories: number;
    invitations: number;
    rsvps: number;
  }> {
    return createSafeDbOperation(async () => {
      const db = await getDatabase();
      
      const [vendorCount] = await db.select({ count: count() }).from(schema.vendors);
      const [categoryCount] = await db.select({ count: count() }).from(schema.categories);
      const [invitationCount] = await db.select({ count: count() }).from(schema.generatedInvitations);
      const [rsvpCount] = await db.select({ count: count() }).from(schema.rsvps);
      
      return {
        vendors: Number(vendorCount?.count ?? 0),
        categories: Number(categoryCount?.count ?? 0),
        invitations: Number(invitationCount?.count ?? 0),
        rsvps: Number(rsvpCount?.count ?? 0)
      };
    }, { identifier: 'get-stats' })();
  }
  
  /**
   * RATE LIMITING UTILITIES
   */
  
  isRateLimited(identifier: string): boolean {
    return !dbRateLimiter.isAllowed(identifier);
  }
  
  getRemainingRequests(identifier: string): number {
    return dbRateLimiter.getRemainingRequests(identifier);
  }
  
  resetRateLimit(identifier: string): void {
    dbRateLimiter.reset(identifier);
  }
}

// Export singleton instance
export const secureStorage = new SecureStorageService();
export default secureStorage;
