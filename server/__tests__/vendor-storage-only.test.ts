// Simple storage-only test that doesn't depend on routes
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { vendors } from '../../../shared/schema-sqlite';
import { eq } from 'drizzle-orm';

describe('Vendor Storage - Direct Database Tests', () => {
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
        featured BOOLEAN DEFAULT FALSE,
        verified BOOLEAN DEFAULT FALSE,
        rating REAL DEFAULT 0,
        reviewCount INTEGER DEFAULT 0,
        priceRange TEXT,
        availability TEXT,
        portfolioImages TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
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

  describe('Basic CRUD Operations', () => {
    it('should create a vendor', async () => {
      const vendorData = {
        name: 'Test Photography Studio',
        email: 'test@photography.com',
        phone: '+91-9876543210',
        category: 'Photography',
        location: 'Mumbai',
        description: 'Professional wedding photography services',
        services: 'Wedding Photography, Pre-wedding Shoots',
        website: 'https://testphoto.com',
        instagram: '@testphoto',
        whatsapp: '+91-9876543210',
        featured: false,
        verified: true,
        rating: 4.5,
        reviewCount: 25,
        priceRange: '₹75,000 - ₹1,50,000',
        availability: 'Available',
        portfolioImages: 'image1.jpg,image2.jpg',
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
    });

    it('should retrieve a vendor by id', async () => {
      const vendorData = {
        name: 'Retrieve Test Vendor',
        email: 'retrieve@test.com',
        category: 'Photography',
        location: 'Delhi',
        description: 'Test description',
        services: 'Test services',
      };

      const [createdVendor] = await db.insert(vendors).values(vendorData).returning();
      
      const retrievedVendor = await db.query.vendors.findFirst({
        where: eq(vendors.id, createdVendor.id)
      });

      expect(retrievedVendor).toBeTruthy();
      expect(retrievedVendor?.name).toBe(vendorData.name);
      expect(retrievedVendor?.email).toBe(vendorData.email);
    });

    it('should update a vendor', async () => {
      const vendorData = {
        name: 'Update Test Vendor',
        email: 'update@test.com',
        category: 'Photography',
        location: 'Bangalore',
        description: 'Original description',
        services: 'Original services',
      };

      const [createdVendor] = await db.insert(vendors).values(vendorData).returning();
      
      const updateData = {
        name: 'Updated Vendor Name',
        description: 'Updated description',
      };

      const [updatedVendor] = await db.update(vendors)
        .set(updateData)
        .where(eq(vendors.id, createdVendor.id))
        .returning();

      expect(updatedVendor.name).toBe(updateData.name);
      expect(updatedVendor.description).toBe(updateData.description);
      expect(updatedVendor.email).toBe(vendorData.email); // Should remain unchanged
    });

    it('should delete a vendor', async () => {
      const vendorData = {
        name: 'Delete Test Vendor',
        email: 'delete@test.com',
        category: 'Catering',
        location: 'Chennai',
        description: 'To be deleted',
        services: 'Test services',
      };

      const [createdVendor] = await db.insert(vendors).values(vendorData).returning();
      
      // Verify vendor exists
      const beforeDelete = await db.query.vendors.findFirst({
        where: eq(vendors.id, createdVendor.id)
      });
      expect(beforeDelete).toBeTruthy();

      // Delete vendor
      await db.delete(vendors).where(eq(vendors.id, createdVendor.id));

      // Verify vendor is deleted
      const afterDelete = await db.query.vendors.findFirst({
        where: eq(vendors.id, createdVendor.id)
      });
      expect(afterDelete).toBeUndefined();
    });
  });

  describe('Query Operations', () => {
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
        },
        {
          name: 'Delhi Catering',
          email: 'delhi@catering.com',
          category: 'Catering',
          location: 'Delhi',
          description: 'Delhi catering services',
          services: 'Wedding Catering',
          featured: false,
        },
        {
          name: 'Bangalore Decoration',
          email: 'bangalore@decoration.com',
          category: 'Decoration',
          location: 'Bangalore',
          description: 'Decoration services in Bangalore',
          services: 'Wedding Decoration',
          featured: true,
        },
      ];

      await db.insert(vendors).values(testVendors);
    });

    it('should filter vendors by category', async () => {
      const photographyVendors = await db.query.vendors.findMany({
        where: eq(vendors.category, 'Photography')
      });

      expect(photographyVendors.length).toBe(1);
      expect(photographyVendors[0]?.name).toBe('Mumbai Photography');
    });

    it('should filter vendors by location', async () => {
      const mumbaiVendors = await db.query.vendors.findMany({
        where: eq(vendors.location, 'Mumbai')
      });

      expect(mumbaiVendors.length).toBe(1);
      expect(mumbaiVendors[0]?.name).toBe('Mumbai Photography');
    });

    it('should filter featured vendors', async () => {
      const featuredVendors = await db.query.vendors.findMany({
        where: eq(vendors.featured, true)
      });

      expect(featuredVendors.length).toBe(2);
      const names = featuredVendors.map(v => v.name);
      expect(names).toContain('Mumbai Photography');
      expect(names).toContain('Bangalore Decoration');
    });

    it('should retrieve all vendors', async () => {
      const allVendors = await db.query.vendors.findMany();
      expect(allVendors.length).toBe(3);
    });
  });

  describe('Data Validation', () => {
    it('should enforce unique email constraint', async () => {
      const vendorData1 = {
        name: 'First Vendor',
        email: 'duplicate@test.com',
        category: 'Photography',
        location: 'Mumbai',
        description: 'First vendor',
        services: 'Photography',
      };

      const vendorData2 = {
        name: 'Second Vendor',
        email: 'duplicate@test.com', // Same email
        category: 'Catering',
        location: 'Delhi',
        description: 'Second vendor',
        services: 'Catering',
      };

      // First insert should succeed
      await db.insert(vendors).values(vendorData1);

      // Second insert should fail due to unique constraint
      await expect(
        db.insert(vendors).values(vendorData2)
      ).rejects.toThrow();
    });

    it('should handle required fields', async () => {
      const incompleteVendor = {
        name: 'Incomplete Vendor',
        // Missing required fields like email, category, location
      };

      await expect(
        db.insert(vendors).values(incompleteVendor as any)
      ).rejects.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should handle bulk inserts efficiently', async () => {
      const bulkVendors = Array.from({ length: 100 }, (_, i) => ({
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
      const allVendors = await db.query.vendors.findMany();
      expect(allVendors.length).toBe(100);
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
      const allVendors = await db.query.vendors.findMany();
      expect(allVendors.length).toBe(10);
    });
  });
});