import { TestDatabase, createTestVendor } from './utils/test-utils';
import { storage } from '../storage';

describe('Vendor Creation - Basic Storage Tests', () => {
  beforeAll(async () => {
    await TestDatabase.reset();
  });

  afterEach(async () => {
    await TestDatabase.cleanup();
    await TestDatabase.seed();
  });

  afterAll(async () => {
    await TestDatabase.cleanup();
  });

  describe('Storage Layer Vendor Creation', () => {
    it('should create a vendor with valid data', async () => {
      const newVendor = createTestVendor({
        name: 'Test Photography Studio',
        email: 'test@photography.com',
        phone: '+91-9876543210',
        category: 'Photography',
        location: 'Mumbai',
        description: 'Professional wedding photography services',
        services: 'Wedding Photography, Pre-wedding Shoots',
      });

      const createdVendor = await storage.createVendor(newVendor);

      expect(createdVendor).toMatchObject({
        id: expect.any(Number),
        name: newVendor.name,
        email: newVendor.email,
        phone: newVendor.phone,
        category: newVendor.category,
        location: newVendor.location,
        description: newVendor.description,
        services: newVendor.services,
        createdAt: expect.any(String),
      });

      // Verify vendor was saved
      const retrievedVendor = await storage.getVendor(createdVendor.id);
      expect(retrievedVendor).toBeTruthy();
      expect(retrievedVendor?.name).toBe(newVendor.name);
      expect(retrievedVendor?.email).toBe(newVendor.email);
    });

    it('should retrieve vendor by email', async () => {
      const testEmail = 'unique@test.com';
      const newVendor = createTestVendor({
        name: 'Email Test Vendor',
        email: testEmail,
      });

      const createdVendor = await storage.createVendor(newVendor);
      const retrievedVendor = await storage.getVendorByEmail(testEmail);

      expect(retrievedVendor).toBeTruthy();
      expect(retrievedVendor?.id).toBe(createdVendor.id);
      expect(retrievedVendor?.email).toBe(testEmail);
    });

    it('should update vendor information', async () => {
      const newVendor = createTestVendor({
        name: 'Original Name',
        email: 'original@test.com',
        description: 'Original description',
      });

      const createdVendor = await storage.createVendor(newVendor);
      
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      const updatedVendor = await storage.updateVendor(createdVendor.id, updateData);

      expect(updatedVendor).toBeTruthy();
      expect(updatedVendor?.name).toBe(updateData.name);
      expect(updatedVendor?.description).toBe(updateData.description);
      expect(updatedVendor?.email).toBe(newVendor.email); // Should remain unchanged
    });

    it('should delete vendor', async () => {
      const newVendor = createTestVendor({
        name: 'Vendor to Delete',
        email: 'delete@test.com',
      });

      const createdVendor = await storage.createVendor(newVendor);
      
      // Verify vendor exists
      const beforeDelete = await storage.getVendor(createdVendor.id);
      expect(beforeDelete).toBeTruthy();

      // Delete vendor
      await storage.deleteVendor(createdVendor.id);

      // Verify vendor is deleted
      const afterDelete = await storage.getVendor(createdVendor.id);
      expect(afterDelete).toBeNull();
    });

    it('should handle vendor filtering', async () => {
      // Create test vendors with different categories and locations
      const vendors = [
        createTestVendor({
          name: 'Mumbai Photography',
          email: 'mumbai@photo.com',
          category: 'Photography',
          location: 'Mumbai',
        }),
        createTestVendor({
          name: 'Delhi Catering',
          email: 'delhi@catering.com',
          category: 'Catering',
          location: 'Delhi',
        }),
        createTestVendor({
          name: 'Mumbai Catering',
          email: 'mumbai@catering.com',
          category: 'Catering',
          location: 'Mumbai',
        }),
      ];

      // Create all vendors
      for (const vendor of vendors) {
        await storage.createVendor(vendor);
      }

      // Test category filtering
      const photographyVendors = await storage.getVendors({ category: 'Photography' });
      expect(photographyVendors.length).toBeGreaterThanOrEqual(1);
      expect(photographyVendors.every(v => v.category === 'Photography')).toBe(true);

      // Test location filtering
      const mumbaiVendors = await storage.getVendors({ location: 'Mumbai' });
      expect(mumbaiVendors.length).toBeGreaterThanOrEqual(2);
      expect(mumbaiVendors.every(v => v.location === 'Mumbai')).toBe(true);

      // Test combined filtering
      const mumbaiCatering = await storage.getVendors({ 
        category: 'Catering', 
        location: 'Mumbai' 
      });
      expect(mumbaiCatering.length).toBeGreaterThanOrEqual(1);
      expect(mumbaiCatering.every(v => 
        v.category === 'Catering' && v.location === 'Mumbai'
      )).toBe(true);
    });

    it('should handle search functionality', async () => {
      const searchableVendor = createTestVendor({
        name: 'Premium Wedding Photography',
        email: 'premium@search.com',
        description: 'Professional wedding photography with drone shots',
        services: 'Wedding Photography, Drone Photography, Album Design',
      });

      await storage.createVendor(searchableVendor);

      // Test name search
      const nameResults = await storage.getVendors({ search: 'Premium' });
      expect(nameResults.length).toBeGreaterThanOrEqual(1);
      expect(nameResults.some(v => v.name.includes('Premium'))).toBe(true);

      // Test description search
      const descResults = await storage.getVendors({ search: 'drone' });
      expect(descResults.length).toBeGreaterThanOrEqual(1);
      expect(descResults.some(v => 
        v.description?.toLowerCase().includes('drone')
      )).toBe(true);

      // Test services search
      const serviceResults = await storage.getVendors({ search: 'Album' });
      expect(serviceResults.length).toBeGreaterThanOrEqual(1);
      expect(serviceResults.some(v => 
        v.services?.toLowerCase().includes('album')
      )).toBe(true);
    });

    it('should handle featured vendors', async () => {
      const featuredVendor = createTestVendor({
        name: 'Featured Photography Studio',
        email: 'featured@test.com',
        featured: true,
      });

      const regularVendor = createTestVendor({
        name: 'Regular Photography Studio',
        email: 'regular@test.com',
        featured: false,
      });

      await storage.createVendor(featuredVendor);
      await storage.createVendor(regularVendor);

      const featuredVendors = await storage.getFeaturedVendors();
      
      expect(featuredVendors.length).toBeGreaterThanOrEqual(1);
      expect(featuredVendors.every(v => v.featured === true)).toBe(true);
      expect(featuredVendors.some(v => v.name === 'Featured Photography Studio')).toBe(true);
    });

    it('should handle concurrent vendor operations', async () => {
      const concurrentVendors = Array.from({ length: 5 }, (_, i) => 
        createTestVendor({
          name: `Concurrent Vendor ${i}`,
          email: `concurrent${i}@test.com`,
        })
      );

      // Create all vendors concurrently
      const createPromises = concurrentVendors.map(vendor => 
        storage.createVendor(vendor)
      );

      const createdVendors = await Promise.all(createPromises);

      // Verify all vendors were created with unique IDs
      const ids = createdVendors.map(v => v.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds.length).toBe(5);

      // Verify all vendors can be retrieved
      const retrievePromises = createdVendors.map(vendor => 
        storage.getVendor(vendor.id)
      );

      const retrievedVendors = await Promise.all(retrievePromises);
      
      retrievedVendors.forEach((vendor, index) => {
        expect(vendor).toBeTruthy();
        expect(vendor?.name).toBe(`Concurrent Vendor ${index}`);
      });
    });

    it('should return undefined for non-existent vendor', async () => {
      const nonExistentVendor = await storage.getVendor(99999);
      expect(nonExistentVendor).toBeNull();
    });

    it('should return undefined for non-existent email', async () => {
      const nonExistentVendor = await storage.getVendorByEmail('nonexistent@test.com');
      expect(nonExistentVendor).toBeNull();
    });

    it('should return undefined when updating non-existent vendor', async () => {
      const result = await storage.updateVendor(99999, { name: 'Updated Name' });
      expect(result).toBeNull();
    });

    it('should handle empty search results', async () => {
      const results = await storage.getVendors({ search: 'nonexistentterm12345' });
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should handle empty category filter results', async () => {
      const results = await storage.getVendors({ category: 'NonExistentCategory' });
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should handle empty location filter results', async () => {
      const results = await storage.getVendors({ location: 'NonExistentLocation' });
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });
});