// Completely standalone vendor test without shared imports
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { eq } from 'drizzle-orm';

// Define the vendors table schema directly in the test
const vendors = sqliteTable('vendors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  category: text('category').notNull(),
  location: text('location').notNull(),
  description: text('description'),
  services: text('services'),
  website: text('website'),
  instagram: text('instagram'),
  whatsapp: text('whatsapp'),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  verified: integer('verified', { mode: 'boolean' }).default(false),
  rating: real('rating').default(0),
  reviewCount: integer('review_count').default(0),
  priceRange: text('price_range'),
  availability: text('availability'),
  portfolioImages: text('portfolio_images'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

describe('Vendor CRUD - Standalone Database Tests', () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;

  beforeAll(() => {
    // Create in-memory database for testing
    sqlite = new Database(':memory:');
    db = drizzle(sqlite);

    // Create vendors table
    sqlite.exec(`
      CREATE TABLE vendors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT,
        services TEXT,
        website TEXT,
        instagram TEXT,
        whatsapp TEXT,
        featured INTEGER DEFAULT 0,
        verified INTEGER DEFAULT 0,
        rating REAL DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        price_range TEXT,
        availability TEXT,
        portfolio_images TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });

  afterAll(() => {
    sqlite.close();
  });

  afterEach(() => {
    // Clean up after each test
    sqlite.exec('DELETE FROM vendors');
  });

  describe('✅ Vendor Creation Tests', () => {
    it('should create a vendor with all fields', async () => {
      const vendorData = {
        name: 'Premium Photography Studio',
        email: 'premium@photography.com',
        phone: '+91-9876543210',
        category: 'Photography',
        location: 'Mumbai',
        description: 'Professional wedding photography services',
        services: 'Wedding Photography, Pre-wedding Shoots, Portrait Sessions',
        website: 'https://premiumphotography.com',
        instagram: '@premiumphotography',
        whatsapp: '+91-9876543210',
        featured: true,
        verified: true,
        rating: 4.8,
        reviewCount: 50,
        priceRange: '₹75,000 - ₹1,50,000',
        availability: 'Available',
        portfolioImages: 'image1.jpg,image2.jpg,image3.jpg',
      };

      const [createdVendor] = await db.insert(vendors).values(vendorData).returning();

      expect(createdVendor).toMatchObject({
        id: expect.any(Number),
        name: vendorData.name,
        email: vendorData.email,
        phone: vendorData.phone,
        category: vendorData.category,
        location: vendorData.location,
        description: vendorData.description,
        services: vendorData.services,
        website: vendorData.website,
        instagram: vendorData.instagram,
        whatsapp: vendorData.whatsapp,
        featured: vendorData.featured,
        verified: vendorData.verified,
        rating: vendorData.rating,
        reviewCount: vendorData.reviewCount,
        priceRange: vendorData.priceRange,
        availability: vendorData.availability,
        portfolioImages: vendorData.portfolioImages,
        createdAt: expect.any(String),
      });

      expect(createdVendor.id).toBeGreaterThan(0);
    });

    it('should create vendor with minimal required fields', async () => {
      const minimalVendor = {
        name: 'Minimal Vendor',
        email: 'minimal@vendor.com',
        category: 'Catering',
        location: 'Delhi',
        description: 'Basic catering services',
        services: 'Wedding Catering',
      };

      const [createdVendor] = await db.insert(vendors).values(minimalVendor).returning();

      expect(createdVendor).toMatchObject({
        id: expect.any(Number),
        name: minimalVendor.name,
        email: minimalVendor.email,
        category: minimalVendor.category,
        location: minimalVendor.location,
        description: minimalVendor.description,
        services: minimalVendor.services,
      });

      // Check default values
      expect(createdVendor.featured).toBe(false);
      expect(createdVendor.verified).toBe(false);
      expect(createdVendor.rating).toBe(0);
      expect(createdVendor.reviewCount).toBe(0);
    });

    it('should enforce unique email constraint', async () => {
      const vendor1 = {
        name: 'First Vendor',
        email: 'duplicate@test.com',
        category: 'Photography',
        location: 'Mumbai',
        description: 'First vendor',
        services: 'Photography',
      };

      const vendor2 = {
        name: 'Second Vendor',
        email: 'duplicate@test.com', // Same email
        category: 'Catering',
        location: 'Delhi',
        description: 'Second vendor',
        services: 'Catering',
      };

      // First insert should succeed
      await db.insert(vendors).values(vendor1);

      // Second insert should fail due to unique constraint
      await expect(
        db.insert(vendors).values(vendor2)
      ).rejects.toThrow();
    });
  });

  describe('✅ Vendor Retrieval Tests', () => {
    beforeEach(async () => {
      // Seed test data
      const testVendors = [
        {
          name: 'Mumbai Photography',
          email: 'mumbai@photo.com',
          category: 'Photography',
          location: 'Mumbai',
          description: 'Mumbai based photography',
          services: 'Wedding Photography',
          featured: true,
          rating: 4.5,
        },
        {
          name: 'Delhi Catering',
          email: 'delhi@catering.com',
          category: 'Catering',
          location: 'Delhi',
          description: 'Delhi catering services',
          services: 'Wedding Catering',
          featured: false,
          rating: 4.2,
        },
        {
          name: 'Bangalore Decoration',
          email: 'bangalore@decoration.com',
          category: 'Decoration',
          location: 'Bangalore',
          description: 'Decoration services in Bangalore',
          services: 'Wedding Decoration',
          featured: true,
          rating: 4.7,
        },
      ];

      await db.insert(vendors).values(testVendors);
    });

    it('should retrieve vendor by id', async () => {
      const allVendors = await db.select().from(vendors);
      const firstVendor = allVendors[0];

      const retrievedVendor = await db.select().from(vendors).where(eq(vendors.id, firstVendor!.id));

      expect(retrievedVendor).toHaveLength(1);
      expect(retrievedVendor[0]).toMatchObject({
        id: firstVendor!.id,
        name: firstVendor!.name,
        email: firstVendor!.email,
      });
    });

    it('should filter vendors by category', async () => {
      const photographyVendors = await db.select().from(vendors).where(eq(vendors.category, 'Photography'));

      expect(photographyVendors).toHaveLength(1);
      expect(photographyVendors[0]?.name).toBe('Mumbai Photography');
    });

    it('should filter vendors by location', async () => {
      const mumbaiVendors = await db.select().from(vendors).where(eq(vendors.location, 'Mumbai'));

      expect(mumbaiVendors).toHaveLength(1);
      expect(mumbaiVendors[0]?.name).toBe('Mumbai Photography');
    });

    it('should filter featured vendors', async () => {
      const featuredVendors = await db.select().from(vendors).where(eq(vendors.featured, true));

      expect(featuredVendors).toHaveLength(2);
      const names = featuredVendors.map(v => v.name);
      expect(names).toContain('Mumbai Photography');
      expect(names).toContain('Bangalore Decoration');
    });

    it('should retrieve all vendors', async () => {
      const allVendors = await db.select().from(vendors);
      expect(allVendors).toHaveLength(3);
    });
  });

  describe('✅ Vendor Update Tests', () => {
    it('should update vendor information', async () => {
      const originalVendor = {
        name: 'Original Name',
        email: 'original@test.com',
        category: 'Photography',
        location: 'Mumbai',
        description: 'Original description',
        services: 'Original services',
        rating: 4.0,
      };

      const [createdVendor] = await db.insert(vendors).values(originalVendor).returning();
      
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
        rating: 4.5,
      };

      const [updatedVendor] = await db.update(vendors)
        .set(updateData)
        .where(eq(vendors.id, createdVendor.id))
        .returning();

      expect(updatedVendor.name).toBe(updateData.name);
      expect(updatedVendor.description).toBe(updateData.description);
      expect(updatedVendor.rating).toBe(updateData.rating);
      expect(updatedVendor.email).toBe(originalVendor.email); // Should remain unchanged
    });

    it('should handle partial updates', async () => {
      const vendor = {
        name: 'Partial Update Vendor',
        email: 'partial@test.com',
        category: 'Catering',
        location: 'Chennai',
        description: 'Original description',
        services: 'Catering services',
      };

      const [createdVendor] = await db.insert(vendors).values(vendor).returning();
      
      // Update only the rating
      const [updatedVendor] = await db.update(vendors)
        .set({ rating: 4.8 })
        .where(eq(vendors.id, createdVendor.id))
        .returning();

      expect(updatedVendor.rating).toBe(4.8);
      expect(updatedVendor.name).toBe(vendor.name); // Should remain unchanged
      expect(updatedVendor.description).toBe(vendor.description); // Should remain unchanged
    });
  });

  describe('✅ Vendor Deletion Tests', () => {
    it('should delete vendor', async () => {
      const vendor = {
        name: 'Vendor to Delete',
        email: 'delete@test.com',
        category: 'Music & DJ',
        location: 'Hyderabad',
        description: 'To be deleted',
        services: 'DJ services',
      };

      const [createdVendor] = await db.insert(vendors).values(vendor).returning();
      
      // Verify vendor exists
      const beforeDelete = await db.select().from(vendors).where(eq(vendors.id, createdVendor.id));
      expect(beforeDelete).toHaveLength(1);

      // Delete vendor
      await db.delete(vendors).where(eq(vendors.id, createdVendor.id));

      // Verify vendor is deleted
      const afterDelete = await db.select().from(vendors).where(eq(vendors.id, createdVendor.id));
      expect(afterDelete).toHaveLength(0);
    });

    it('should handle deletion of non-existent vendor gracefully', async () => {
      // Try to delete a vendor that doesn't exist
      const result = await db.delete(vendors).where(eq(vendors.id, 99999));
      
      // Should not throw an error, just return empty result
      expect(result).toBeDefined();
    });
  });

  describe('✅ Performance Tests', () => {
    it('should handle bulk operations efficiently', async () => {
      const bulkVendors = Array.from({ length: 50 }, (_, i) => ({
        name: `Bulk Vendor ${i}`,
        email: `bulk${i}@test.com`,
        category: 'Photography',
        location: 'Mumbai',
        description: `Bulk vendor ${i}`,
        services: 'Photography Services',
      }));

      const startTime = Date.now();
      await db.insert(vendors).values(bulkVendors);
      const endTime = Date.now();

      const insertTime = endTime - startTime;
      expect(insertTime).toBeLessThan(1000); // Should complete within 1 second

      // Verify all vendors were inserted
      const allVendors = await db.select().from(vendors);
      expect(allVendors).toHaveLength(50);
    });

    it('should handle concurrent operations', async () => {
      const concurrentOperations = Array.from({ length: 10 }, (_, i) => 
        db.insert(vendors).values({
          name: `Concurrent Vendor ${i}`,
          email: `concurrent${i}@test.com`,
          category: 'Photography',
          location: 'Mumbai',
          description: `Concurrent vendor ${i}`,
          services: 'Photography Services',
        })
      );

      const startTime = Date.now();
      await Promise.all(concurrentOperations);
      const endTime = Date.now();

      const operationTime = endTime - startTime;
      expect(operationTime).toBeLessThan(2000); // Should complete within 2 seconds

      // Verify all vendors were created
      const allVendors = await db.select().from(vendors);
      expect(allVendors).toHaveLength(10);
    });
  });

  describe('✅ Data Validation Tests', () => {
    it('should handle special characters in vendor data', async () => {
      const vendorWithSpecialChars = {
        name: 'Vendor & Co. (Premium)',
        email: 'special+chars@vendor-test.co.in',
        category: 'Photography',
        location: 'Mumbai',
        description: 'Services with "quotes" and special chars: @#$%',
        services: 'Photography & Videography, Pre-wedding shoots',
      };

      const [createdVendor] = await db.insert(vendors).values(vendorWithSpecialChars).returning();

      expect(createdVendor.name).toBe(vendorWithSpecialChars.name);
      expect(createdVendor.email).toBe(vendorWithSpecialChars.email);
      expect(createdVendor.description).toBe(vendorWithSpecialChars.description);
    });

    it('should handle Unicode characters', async () => {
      const unicodeVendor = {
        name: 'Café & Résumé Photography 📸',
        email: 'unicode@tëst.com',
        category: 'Photography',
        location: 'Bëngalūru, Karnāṭaka',
        description: 'Services with émojis 🎉 and spëcial chars: àáâãäå',
        services: 'Wédding Photography & Vidéography',
      };

      const [createdVendor] = await db.insert(vendors).values(unicodeVendor).returning();

      expect(createdVendor.name).toBe(unicodeVendor.name);
      expect(createdVendor.description).toBe(unicodeVendor.description);
      expect(createdVendor.location).toBe(unicodeVendor.location);
    });

    it('should handle null values for optional fields', async () => {
      const vendorWithNulls = {
        name: 'Null Fields Vendor',
        email: 'nulls@test.com',
        category: 'Catering',
        location: 'Pune',
        description: 'Basic vendor',
        services: 'Catering',
        phone: null,
        website: null,
        instagram: null,
        whatsapp: null,
        portfolioImages: null,
      };

      const [createdVendor] = await db.insert(vendors).values(vendorWithNulls).returning();

      expect(createdVendor.name).toBe(vendorWithNulls.name);
      expect(createdVendor.phone).toBeNull();
      expect(createdVendor.website).toBeNull();
      expect(createdVendor.instagram).toBeNull();
    });
  });
});