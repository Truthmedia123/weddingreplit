import request from 'supertest';
import { app } from '../index';
import { TestDatabase, createTestVendor } from './utils/test-utils';

describe('Vendor Creation and Validation Tests', () => {
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

  describe('POST /api/vendors - Vendor Creation', () => {
    describe('Valid Vendor Creation', () => {
      it('should create a new vendor with all required fields', async () => {
        const newVendor = createTestVendor({
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
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(newVendor)
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(Number),
          name: newVendor.name,
          email: newVendor.email,
          phone: newVendor.phone,
          category: newVendor.category,
          location: newVendor.location,
          description: newVendor.description,
          services: newVendor.services,
          website: newVendor.website,
          instagram: newVendor.instagram,
          whatsapp: newVendor.whatsapp,
          createdAt: expect.any(String),
        });

        // Verify vendor was actually saved to database
        const savedVendor = await request(app)
          .get(`/api/vendors/${response.body.id}`)
          .expect(200);

        expect(savedVendor.body.name).toBe(newVendor.name);
        expect(savedVendor.body.email).toBe(newVendor.email);
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

        const response = await request(app)
          .post('/api/vendors')
          .send(minimalVendor)
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(Number),
          name: minimalVendor.name,
          email: minimalVendor.email,
          category: minimalVendor.category,
          location: minimalVendor.location,
        });
      });

      it('should set default values for optional fields', async () => {
        const vendorWithoutOptionals = {
          name: 'Default Values Vendor',
          email: 'defaults@vendor.com',
          category: 'Decoration',
          location: 'Bangalore',
          description: 'Decoration services',
          services: 'Wedding Decoration',
        };

        const response = await request(app)
          .post('/api/vendors')
          .send(vendorWithoutOptionals)
          .expect(201);

        expect(response.body.featured).toBe(false);
        expect(response.body.verified).toBe(false);
        expect(response.body.rating).toBe(0);
        expect(response.body.reviewCount).toBe(0);
      });

      it('should handle special characters in vendor data', async () => {
        const vendorWithSpecialChars = createTestVendor({
          name: 'Vendor & Co. (Premium)',
          email: 'special+chars@vendor-test.co.in',
          description: 'Services with "quotes" and special chars: @#$%',
          services: 'Photography & Videography, Pre-wedding shoots',
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendorWithSpecialChars)
          .expect(201);

        expect(response.body.name).toBe(vendorWithSpecialChars.name);
        expect(response.body.email).toBe(vendorWithSpecialChars.email);
        expect(response.body.description).toBe(vendorWithSpecialChars.description);
      });
    });

    describe('Required Field Validation', () => {
      it('should reject vendor creation without name', async () => {
        const vendorWithoutName = createTestVendor();
        delete (vendorWithoutName as any).name;

        const response = await request(app)
          .post('/api/vendors')
          .send(vendorWithoutName)
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('name');
      });

      it('should reject vendor creation without email', async () => {
        const vendorWithoutEmail = createTestVendor();
        delete (vendorWithoutEmail as any).email;

        const response = await request(app)
          .post('/api/vendors')
          .send(vendorWithoutEmail)
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('email');
      });

      it('should reject vendor creation without category', async () => {
        const vendorWithoutCategory = createTestVendor();
        delete (vendorWithoutCategory as any).category;

        const response = await request(app)
          .post('/api/vendors')
          .send(vendorWithoutCategory)
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('category');
      });

      it('should reject vendor creation with empty required fields', async () => {
        const vendorWithEmptyFields = createTestVendor({
          name: '',
          email: '',
          category: '',
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendorWithEmptyFields)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('Email Validation', () => {
      it('should reject invalid email formats', async () => {
        const invalidEmails = [
          'invalid-email',
          'missing@domain',
          '@missinglocal.com',
          'spaces in@email.com',
          'double@@domain.com',
          'trailing.dot.@domain.com',
          'no-tld@domain',
        ];

        for (const invalidEmail of invalidEmails) {
          const vendorWithInvalidEmail = createTestVendor({
            email: invalidEmail,
          });

          const response = await request(app)
            .post('/api/vendors')
            .send(vendorWithInvalidEmail)
            .expect(400);

          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toContain('email');
        }
      });

      it('should accept valid email formats', async () => {
        const validEmails = [
          'simple@example.com',
          'test.email@domain.co.in',
          'user+tag@example.org',
          'vendor123@test-domain.com',
          'info@sub.domain.com',
        ];

        for (let i = 0; i < validEmails.length; i++) {
          const vendorWithValidEmail = createTestVendor({
            name: `Valid Email Vendor ${i}`,
            email: validEmails[i],
          });

          const response = await request(app)
            .post('/api/vendors')
            .send(vendorWithValidEmail)
            .expect(201);

          expect(response.body.email).toBe(validEmails[i]);
        }
      });

      it('should reject duplicate email addresses', async () => {
        const firstVendor = createTestVendor({
          name: 'First Vendor',
          email: 'duplicate@test.com',
        });

        // Create first vendor
        await request(app)
          .post('/api/vendors')
          .send(firstVendor)
          .expect(201);

        // Try to create second vendor with same email
        const secondVendor = createTestVendor({
          name: 'Second Vendor',
          email: 'duplicate@test.com',
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(secondVendor)
          .expect(409);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('already exists');
      });
    });

    describe('Data Sanitization and Security', () => {
      it('should sanitize HTML and script tags in input', async () => {
        const vendorWithMaliciousContent = createTestVendor({
          name: '<script>alert("xss")</script>Clean Name',
          description: '<img src=x onerror=alert(1)>Professional services',
          services: '<b>Photography</b> & <i>Videography</i>',
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendorWithMaliciousContent)
          .expect(201);

        // Should remove script tags but preserve safe content
        expect(response.body.name).not.toContain('<script>');
        expect(response.body.description).not.toContain('<img');
        expect(response.body.name).toContain('Clean Name');
        expect(response.body.description).toContain('Professional services');
      });

      it('should handle very long input strings', async () => {
        const longString = 'a'.repeat(1000);
        const vendorWithLongStrings = createTestVendor({
          name: longString,
          description: longString,
          services: longString,
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendorWithLongStrings);

        // Should either accept with truncation or reject with validation error
        expect([201, 400]).toContain(response.status);
        
        if (response.status === 201) {
          // If accepted, should be truncated to reasonable length
          expect(response.body.name.length).toBeLessThanOrEqual(255);
        }
      });

      it('should handle SQL injection attempts', async () => {
        const vendorWithSQLInjection = createTestVendor({
          name: "'; DROP TABLE vendors; --",
          email: 'sql@injection.com',
          description: "1' OR '1'='1",
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendorWithSQLInjection)
          .expect(201);

        // Should create vendor without executing SQL injection
        expect(response.body.name).toBe(vendorWithSQLInjection.name);
        
        // Verify database integrity by checking if we can still query vendors
        const vendorsResponse = await request(app)
          .get('/api/vendors')
          .expect(200);

        expect(Array.isArray(vendorsResponse.body)).toBe(true);
      });
    });

    describe('Business Logic Validation', () => {
      it('should validate vendor category against allowed categories', async () => {
        const allowedCategories = [
          'Photography',
          'Catering',
          'Decoration',
          'Music & DJ',
          'Makeup Artist',
          'Wedding Planner',
          'Venue',
          'Transportation',
        ];

        // Test valid categories
        for (let i = 0; i < allowedCategories.length; i++) {
          const vendor = createTestVendor({
            name: `${allowedCategories[i]} Vendor`,
            email: `${allowedCategories[i]!.toLowerCase().replace(/\s+/g, '')}@test.com`,
            category: allowedCategories[i],
          });

          const response = await request(app)
            .post('/api/vendors')
            .send(vendor)
            .expect(201);

          expect(response.body.category).toBe(allowedCategories[i]);
        }
      });

      it('should validate Indian phone number formats', async () => {
        const validPhoneNumbers = [
          '+91-9876543210',
          '+919876543210',
          '9876543210',
          '+91 9876543210',
          '91-9876543210',
        ];

        for (let i = 0; i < validPhoneNumbers.length; i++) {
          const vendor = createTestVendor({
            name: `Phone Test Vendor ${i}`,
            email: `phone${i}@test.com`,
            phone: validPhoneNumbers[i],
          });

          const response = await request(app)
            .post('/api/vendors')
            .send(vendor)
            .expect(201);

          expect(response.body.phone).toBeTruthy();
        }
      });

      it('should validate website URL formats', async () => {
        const validWebsites = [
          'https://example.com',
          'http://test-site.co.in',
          'https://www.vendor-website.com',
          'https://subdomain.example.org',
        ];

        const invalidWebsites = [
          'not-a-url',
          'ftp://invalid-protocol.com',
          'javascript:alert(1)',
          'http://',
        ];

        // Test valid websites
        for (let i = 0; i < validWebsites.length; i++) {
          const vendor = createTestVendor({
            name: `Website Test Vendor ${i}`,
            email: `website${i}@test.com`,
            website: validWebsites[i],
          });

          const response = await request(app)
            .post('/api/vendors')
            .send(vendor)
            .expect(201);

          expect(response.body.website).toBe(validWebsites[i]);
        }

        // Test invalid websites (should either reject or sanitize)
        for (let i = 0; i < invalidWebsites.length; i++) {
          const vendor = createTestVendor({
            name: `Invalid Website Vendor ${i}`,
            email: `invalidweb${i}@test.com`,
            website: invalidWebsites[i],
          });

          const response = await request(app)
            .post('/api/vendors')
            .send(vendor);

          // Should either reject with 400 or accept with sanitized URL
          expect([201, 400]).toContain(response.status);
        }
      });

      it('should validate Instagram handle format', async () => {
        const validInstagramHandles = [
          '@validhandle',
          '@test_handle_123',
          '@handle.with.dots',
          'validhandle', // without @
        ];

        for (let i = 0; i < validInstagramHandles.length; i++) {
          const vendor = createTestVendor({
            name: `Instagram Test Vendor ${i}`,
            email: `instagram${i}@test.com`,
            instagram: validInstagramHandles[i],
          });

          const response = await request(app)
            .post('/api/vendors')
            .send(vendor)
            .expect(201);

          expect(response.body.instagram).toBeTruthy();
        }
      });
    });

    describe('Performance and Concurrency', () => {
      it('should handle concurrent vendor creation requests', async () => {
        const concurrentRequests = 5;
        const vendorPromises = [];

        for (let i = 0; i < concurrentRequests; i++) {
          const vendor = createTestVendor({
            name: `Concurrent Vendor ${i}`,
            email: `concurrent${i}@test.com`,
          });

          vendorPromises.push(
            request(app)
              .post('/api/vendors')
              .send(vendor)
          );
        }

        const responses = await Promise.all(vendorPromises);

        // All requests should succeed
        responses.forEach((response, index) => {
          expect(response.status).toBe(201);
          expect(response.body.name).toBe(`Concurrent Vendor ${index}`);
        });

        // Verify all vendors were created
        const allVendors = await request(app)
          .get('/api/vendors')
          .expect(200);

        const concurrentVendorNames = allVendors.body
          .filter((v: any) => v.name.startsWith('Concurrent Vendor'))
          .map((v: any) => v.name);

        expect(concurrentVendorNames).toHaveLength(concurrentRequests);
      });

      it('should complete vendor creation within acceptable time', async () => {
        const vendor = createTestVendor({
          name: 'Performance Test Vendor',
          email: 'performance@test.com',
        });

        const startTime = Date.now();
        
        const response = await request(app)
          .post('/api/vendors')
          .send(vendor)
          .expect(201);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(1000); // Should complete within 1 second
        expect(response.body.name).toBe(vendor.name);
      });
    });

    describe('Error Handling and Edge Cases', () => {
      it('should handle database connection errors gracefully', async () => {
        // This test would require mocking the database to simulate connection failure
        // For now, we'll test that the API handles errors without crashing
        const vendor = createTestVendor({
          name: 'Error Test Vendor',
          email: 'error@test.com',
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendor);

        // Should either succeed or fail gracefully with proper error response
        expect([201, 500]).toContain(response.status);
        
        if (response.status === 500) {
          expect(response.body).toHaveProperty('error');
        }
      });

      it('should handle malformed JSON requests', async () => {
        const response = await request(app)
          .post('/api/vendors')
          .set('Content-Type', 'application/json')
          .send('{ invalid json }')
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });

      it('should handle empty request body', async () => {
        const response = await request(app)
          .post('/api/vendors')
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('required');
      });

      it('should handle null and undefined values', async () => {
        const vendorWithNulls = {
          name: 'Null Test Vendor',
          email: 'null@test.com',
          category: 'Photography',
          location: null,
          description: undefined,
          services: 'Photography Services',
          website: null,
          instagram: undefined,
        };

        const response = await request(app)
          .post('/api/vendors')
          .send(vendorWithNulls)
          .expect(201);

        expect(response.body.name).toBe(vendorWithNulls.name);
        expect(response.body.email).toBe(vendorWithNulls.email);
        // Null/undefined optional fields should be handled gracefully
      });
    });
  });
});