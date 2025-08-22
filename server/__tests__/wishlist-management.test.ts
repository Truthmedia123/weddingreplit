// Basic vendor management tests using PostgreSQL
// This test file demonstrates PostgreSQL usage without SQLite dependencies

import { db } from '../db-config';
import { vendors, categories } from '@shared/schema-postgres';
import { eq, and, inArray } from 'drizzle-orm';
import { setupTestDatabase, teardownTestDatabase } from './utils/test-utils';

describe('Vendor Management Tests (PostgreSQL)', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    // Clear vendors before each test
    await db.delete(vendors);
  });

  describe('Vendor CRUD Operations', () => {
    it('should create a new vendor', async () => {
      const newVendor = {
        name: 'Test Photography Studio',
        email: 'test@photography.com',
        phone: '+91-98765-43210',
        category: 'Photography',
        location: 'Mumbai, Maharashtra',
        description: 'Professional wedding photography services.',
        whatsapp: '+91-98765-43210',
        featured: false,
        verified: false,
        rating: 0,
        reviewCount: 0,
      };

      const result = await db.insert(vendors).values(newVendor).returning();
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe(newVendor.name);
      expect(result[0].email).toBe(newVendor.email);
      expect(result[0].category).toBe(newVendor.category);
    });

    it('should retrieve vendors by category', async () => {
      // Insert test vendors
      await db.insert(vendors).values([
        {
          name: 'Photography Studio A',
          email: 'photoa@test.com',
          phone: '+91-98765-43211',
          category: 'Photography',
          location: 'Mumbai, Maharashtra',
          description: 'Professional photography services.',
          whatsapp: '+91-98765-43211',
          featured: false,
          verified: false,
          rating: 0,
          reviewCount: 0,
        },
        {
          name: 'Catering Service B',
          email: 'cateringb@test.com',
          phone: '+91-98765-43212',
          category: 'Catering',
          location: 'Goa, India',
          description: 'Premium catering services.',
          whatsapp: '+91-98765-43212',
          featured: false,
          verified: false,
          rating: 0,
          reviewCount: 0,
        }
      ]);

      const photographyVendors = await db
        .select()
        .from(vendors)
        .where(eq(vendors.category, 'Photography'));

      expect(photographyVendors).toHaveLength(1);
      expect(photographyVendors[0].category).toBe('Photography');
    });

    it('should update vendor information', async () => {
      // Insert a vendor
      const [vendor] = await db.insert(vendors).values({
        name: 'Original Name',
        email: 'original@test.com',
        phone: '+91-98765-43213',
        category: 'Photography',
        location: 'Mumbai, Maharashtra',
        description: 'Original description.',
        whatsapp: '+91-98765-43213',
        featured: false,
        verified: false,
        rating: 0,
        reviewCount: 0,
      }).returning();

      // Update the vendor
      const updatedVendor = await db
        .update(vendors)
        .set({
          name: 'Updated Name',
          description: 'Updated description.',
          featured: true,
        })
        .where(eq(vendors.id, vendor.id))
        .returning();

      expect(updatedVendor).toHaveLength(1);
      expect(updatedVendor[0].name).toBe('Updated Name');
      expect(updatedVendor[0].description).toBe('Updated description.');
      expect(updatedVendor[0].featured).toBe(true);
    });

    it('should delete a vendor', async () => {
      // Insert a vendor
      const [vendor] = await db.insert(vendors).values({
        name: 'To Delete',
        email: 'delete@test.com',
        phone: '+91-98765-43214',
        category: 'Photography',
        location: 'Mumbai, Maharashtra',
        description: 'This vendor will be deleted.',
        whatsapp: '+91-98765-43214',
        featured: false,
        verified: false,
        rating: 0,
        reviewCount: 0,
      }).returning();

      // Delete the vendor
      await db.delete(vendors).where(eq(vendors.id, vendor.id));

      // Verify deletion
      const deletedVendor = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, vendor.id));

      expect(deletedVendor).toHaveLength(0);
    });
  });

  describe('Vendor Search and Filtering', () => {
    beforeEach(async () => {
      // Insert test vendors
      await db.insert(vendors).values([
        {
          name: 'Elite Photography',
          email: 'elite@photo.com',
          phone: '+91-98765-43215',
          category: 'Photography',
          location: 'Mumbai, Maharashtra',
          description: 'Elite photography services.',
          whatsapp: '+91-98765-43215',
          featured: true,
          verified: true,
          rating: 4.8,
          reviewCount: 50,
        },
        {
          name: 'Basic Photography',
          email: 'basic@photo.com',
          phone: '+91-98765-43216',
          category: 'Photography',
          location: 'Pune, Maharashtra',
          description: 'Basic photography services.',
          whatsapp: '+91-98765-43216',
          featured: false,
          verified: false,
          rating: 3.5,
          reviewCount: 10,
        },
        {
          name: 'Premium Catering',
          email: 'premium@catering.com',
          phone: '+91-98765-43217',
          category: 'Catering',
          location: 'Goa, India',
          description: 'Premium catering services.',
          whatsapp: '+91-98765-43217',
          featured: true,
          verified: true,
          rating: 4.9,
          reviewCount: 75,
        }
      ]);
    });

    it('should filter featured vendors', async () => {
      const featuredVendors = await db
        .select()
        .from(vendors)
        .where(eq(vendors.featured, true));

      expect(featuredVendors).toHaveLength(2);
      expect(featuredVendors.every(v => v.featured)).toBe(true);
    });

    it('should filter verified vendors', async () => {
      const verifiedVendors = await db
        .select()
        .from(vendors)
        .where(eq(vendors.verified, true));

      expect(verifiedVendors).toHaveLength(2);
      expect(verifiedVendors.every(v => v.verified)).toBe(true);
    });

    it('should filter vendors by multiple criteria', async () => {
      const highRatedPhotography = await db
        .select()
        .from(vendors)
        .where(
          and(
            eq(vendors.category, 'Photography'),
            eq(vendors.featured, true)
          )
        );

      expect(highRatedPhotography).toHaveLength(1);
      expect(highRatedPhotography[0].category).toBe('Photography');
      expect(highRatedPhotography[0].featured).toBe(true);
    });
  });
});