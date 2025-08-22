// Completely standalone vendor test without shared imports
import { db } from '../db-config';
import { vendors } from '@shared/schema-postgres';
import { eq } from 'drizzle-orm';
import { setupTestDatabase, teardownTestDatabase } from './utils/test-utils';

describe('Vendor Standalone Tests (PostgreSQL)', () => {
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

  it('should create and retrieve a vendor', async () => {
    const testVendor = {
      name: 'Standalone Test Vendor',
      email: 'standalone@test.com',
      phone: '+91-98765-43210',
      category: 'Photography',
      location: 'Mumbai, Maharashtra',
      description: 'Standalone test vendor description.',
      whatsapp: '+91-98765-43210',
      featured: false,
      verified: false,
      rating: 0,
      reviewCount: 0,
    };

    // Create vendor
    const [createdVendor] = await db.insert(vendors).values(testVendor).returning();
    
    expect(createdVendor.name).toBe(testVendor.name);
    expect(createdVendor.email).toBe(testVendor.email);

    // Retrieve vendor
    const retrievedVendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, createdVendor.id));

    expect(retrievedVendor).toHaveLength(1);
    expect(retrievedVendor[0].name).toBe(testVendor.name);
  });

  it('should update vendor data', async () => {
    // Create vendor
    const [vendor] = await db.insert(vendors).values({
      name: 'Original Name',
      email: 'original@test.com',
      phone: '+91-98765-43211',
      category: 'Photography',
      location: 'Mumbai, Maharashtra',
      description: 'Original description.',
      whatsapp: '+91-98765-43211',
      featured: false,
      verified: false,
      rating: 0,
      reviewCount: 0,
    }).returning();

    // Update vendor
    const [updatedVendor] = await db
      .update(vendors)
      .set({
        name: 'Updated Name',
        description: 'Updated description.',
        featured: true,
      })
      .where(eq(vendors.id, vendor.id))
      .returning();

    expect(updatedVendor.name).toBe('Updated Name');
    expect(updatedVendor.description).toBe('Updated description.');
    expect(updatedVendor.featured).toBe(true);
  });

  it('should delete vendor data', async () => {
    // Create vendor
    const [vendor] = await db.insert(vendors).values({
      name: 'To Delete',
      email: 'delete@test.com',
      phone: '+91-98765-43212',
      category: 'Photography',
      location: 'Mumbai, Maharashtra',
      description: 'This vendor will be deleted.',
      whatsapp: '+91-98765-43212',
      featured: false,
      verified: false,
      rating: 0,
      reviewCount: 0,
    }).returning();

    // Delete vendor
    await db.delete(vendors).where(eq(vendors.id, vendor.id));

    // Verify deletion
    const deletedVendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendor.id));

    expect(deletedVendor).toHaveLength(0);
  });
});