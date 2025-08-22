import { db } from '../db-config';
import { vendors } from '@shared/schema-postgres';
import { eq } from 'drizzle-orm';
import { setupTestDatabase, teardownTestDatabase } from './utils/test-utils';

describe('Vendor Storage Tests (PostgreSQL)', () => {
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

  it('should store and retrieve vendor data', async () => {
    const testVendor = {
      name: 'Test Vendor',
      email: 'test@vendor.com',
      phone: '+91-98765-43210',
      category: 'Photography',
      location: 'Mumbai, Maharashtra',
      description: 'Test vendor description.',
      whatsapp: '+91-98765-43210',
      featured: false,
      verified: false,
      rating: 0,
      reviewCount: 0,
    };

    // Insert vendor
    const [insertedVendor] = await db.insert(vendors).values(testVendor).returning();
    
    expect(insertedVendor.name).toBe(testVendor.name);
    expect(insertedVendor.email).toBe(testVendor.email);

    // Retrieve vendor
    const retrievedVendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, insertedVendor.id));

    expect(retrievedVendor).toHaveLength(1);
    expect(retrievedVendor[0].name).toBe(testVendor.name);
  });

  it('should handle multiple vendors', async () => {
    const testVendors = [
      {
        name: 'Vendor 1',
        email: 'vendor1@test.com',
        phone: '+91-98765-43211',
        category: 'Photography',
        location: 'Mumbai, Maharashtra',
        description: 'Vendor 1 description.',
        whatsapp: '+91-98765-43211',
        featured: false,
        verified: false,
        rating: 0,
        reviewCount: 0,
      },
      {
        name: 'Vendor 2',
        email: 'vendor2@test.com',
        phone: '+91-98765-43212',
        category: 'Catering',
        location: 'Goa, India',
        description: 'Vendor 2 description.',
        whatsapp: '+91-98765-43212',
        featured: false,
        verified: false,
        rating: 0,
        reviewCount: 0,
      }
    ];

    // Insert multiple vendors
    const insertedVendors = await db.insert(vendors).values(testVendors).returning();
    
    expect(insertedVendors).toHaveLength(2);

    // Retrieve all vendors
    const allVendors = await db.select().from(vendors);
    expect(allVendors).toHaveLength(2);
  });
});