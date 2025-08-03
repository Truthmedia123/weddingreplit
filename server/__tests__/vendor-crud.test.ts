import request from 'supertest';
import { app } from '../index';
import { TestDatabase, createTestVendor } from './utils/test-utils';

describe('Vendor CRUD Operations', () => {
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

  describe('GET /api/vendors', () => {
    it('should return list of vendors', async () => {
      const response = await request(app)
        .get('/api/vendors')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter vendors by category', async () => {
      const response = await request(app)
        .get('/api/vendors?category=Photography')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((vendor: any) => {
        expect(vendor.category).toBe('Photography');
      });
    });

    it('should filter vendors by location', async () => {
      const response = await request(app)
        .get('/api/vendors?location=Mumbai')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((vendor: any) => {
        expect(vendor.location).toBe('Mumbai');
      });
    });
  });

  describe('GET /api/vendors/:id', () => {
    it('should return vendor by id', async () => {
      // First get a vendor ID from the seeded data
      const vendorsResponse = await request(app).get('/api/vendors');
      const vendorId = vendorsResponse.body[0].id;

      const response = await request(app)
        .get(`/api/vendors/${vendorId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', vendorId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
    });

    it('should return 404 for non-existent vendor', async () => {
      const response = await request(app)
        .get('/api/vendors/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/vendors', () => {
    it('should create a new vendor with valid data', async () => {
      const newVendor = createTestVendor({
        name: 'New Test Vendor',
        email: 'new@testvendor.com',
      });

      const response = await request(app)
        .post('/api/vendors')
        .send(newVendor)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newVendor.name);
      expect(response.body.email).toBe(newVendor.email);
    });

    it('should reject vendor creation with invalid email', async () => {
      const invalidVendor = createTestVendor({
        email: 'invalid-email',
      });

      const response = await request(app)
        .post('/api/vendors')
        .send(invalidVendor)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject vendor creation with missing required fields', async () => {
      const incompleteVendor = {
        name: 'Incomplete Vendor',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/vendors')
        .send(incompleteVendor)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/vendors/:id', () => {
    it('should update vendor information', async () => {
      // Get an existing vendor
      const vendorsResponse = await request(app).get('/api/vendors');
      const vendor = vendorsResponse.body[0];

      const updateData = {
        name: 'Updated Vendor Name',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/vendors/${vendor.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent vendor update', async () => {
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put('/api/vendors/99999')
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/vendors/:id', () => {
    it('should delete vendor', async () => {
      // Create a vendor to delete
      const newVendor = createTestVendor({
        name: 'Vendor to Delete',
        email: 'delete@testvendor.com',
      });

      const createResponse = await request(app)
        .post('/api/vendors')
        .send(newVendor);

      const vendorId = createResponse.body.id;

      // Delete the vendor
      await request(app)
        .delete(`/api/vendors/${vendorId}`)
        .expect(200);

      // Verify vendor is deleted
      await request(app)
        .get(`/api/vendors/${vendorId}`)
        .expect(404);
    });

    it('should return 404 for non-existent vendor deletion', async () => {
      const response = await request(app)
        .delete('/api/vendors/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});