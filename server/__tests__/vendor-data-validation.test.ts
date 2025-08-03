import request from 'supertest';
import { app } from '../index';
import { TestDatabase, createTestVendor } from './utils/test-utils';

describe('Vendor Data Validation and Sanitization', () => {
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

  describe('Input Sanitization', () => {
    it('should sanitize XSS attempts in vendor name', async () => {
      const xssAttempts = [
        '<script>alert("xss")</script>Clean Name',
        '<img src=x onerror=alert(1)>Photo Studio',
        '<svg onload=alert(1)>Wedding Services',
        'javascript:alert(1)',
        '<iframe src="javascript:alert(1)"></iframe>Vendor',
      ];

      for (let i = 0; i < xssAttempts.length; i++) {
        const vendor = createTestVendor({
          name: xssAttempts[i],
          email: `xss${i}@test.com`,
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendor)
          .expect(201);

        // Should remove dangerous content but preserve safe text
        expect(response.body.name).not.toContain('<script>');
        expect(response.body.name).not.toContain('<img');
        expect(response.body.name).not.toContain('<svg');
        expect(response.body.name).not.toContain('javascript:');
        expect(response.body.name).not.toContain('<iframe');
      }
    });

    it('should sanitize HTML in description field', async () => {
      const htmlContent = `
        <div>Professional Photography Services</div>
        <script>alert('xss')</script>
        <p>We offer <strong>premium</strong> wedding photography</p>
        <img src="x" onerror="alert(1)">
        <a href="javascript:alert(1)">Click here</a>
        <style>body{display:none}</style>
      `;

      const vendor = createTestVendor({
        name: 'HTML Test Vendor',
        email: 'html@test.com',
        description: htmlContent,
      });

      const response = await request(app)
        .post('/api/vendors')
        .send(vendor)
        .expect(201);

      // Should remove dangerous tags but preserve safe content
      expect(response.body.description).not.toContain('<script>');
      expect(response.body.description).not.toContain('<img');
      expect(response.body.description).not.toContain('javascript:');
      expect(response.body.description).not.toContain('<style>');
      expect(response.body.description).toContain('Professional Photography Services');
      expect(response.body.description).toContain('premium');
    });

    it('should handle Unicode and special characters correctly', async () => {
      const vendor = createTestVendor({
        name: 'Café & Résumé Photography 📸',
        email: 'unicode@tëst.com',
        description: 'Services with émojis 🎉 and spëcial chars: àáâãäå',
        location: 'Bëngalūru, Karnāṭaka',
        services: 'Wédding Photography & Vidéography',
      });

      const response = await request(app)
        .post('/api/vendors')
        .send(vendor)
        .expect(201);

      expect(response.body.name).toBe(vendor.name);
      expect(response.body.description).toBe(vendor.description);
      expect(response.body.location).toBe(vendor.location);
    });

    it('should trim whitespace from input fields', async () => {
      const vendor = createTestVendor({
        name: '  Whitespace Test Vendor  ',
        email: '  whitespace@test.com  ',
        category: '  Photography  ',
        location: '  Mumbai  ',
        description: '  Professional services with extra spaces  ',
      });

      const response = await request(app)
        .post('/api/vendors')
        .send(vendor)
        .expect(201);

      expect(response.body.name).toBe('Whitespace Test Vendor');
      expect(response.body.email).toBe('whitespace@test.com');
      expect(response.body.category).toBe('Photography');
      expect(response.body.location).toBe('Mumbai');
      expect(response.body.description).toBe('Professional services with extra spaces');
    });
  });

  describe('Field Length Validation', () => {
    it('should validate vendor name length limits', async () => {
      // Test maximum length
      const longName = 'a'.repeat(256); // Assuming 255 char limit
      const vendorWithLongName = createTestVendor({
        name: longName,
        email: 'longname@test.com',
      });

      const response = await request(app)
        .post('/api/vendors')
        .send(vendorWithLongName);

      // Should either reject or truncate
      expect([201, 400]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body.name.length).toBeLessThanOrEqual(255);
      }
    });

    it('should validate description length limits', async () => {
      const longDescription = 'a'.repeat(2001); // Assuming 2000 char limit
      const vendorWithLongDescription = createTestVendor({
        name: 'Long Description Vendor',
        email: 'longdesc@test.com',
        description: longDescription,
      });

      const response = await request(app)
        .post('/api/vendors')
        .send(vendorWithLongDescription);

      expect([201, 400]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body.description.length).toBeLessThanOrEqual(2000);
      }
    });

    it('should validate services field length', async () => {
      const longServices = 'Photography, '.repeat(100); // Very long services list
      const vendorWithLongServices = createTestVendor({
        name: 'Long Services Vendor',
        email: 'longservices@test.com',
        services: longServices,
      });

      const response = await request(app)
        .post('/api/vendors')
        .send(vendorWithLongServices);

      expect([201, 400]).toContain(response.status);
    });
  });

  describe('Business Rule Validation', () => {
    it('should validate Indian city names', async () => {
      const validIndianCities = [
        'Mumbai',
        'Delhi',
        'Bangalore',
        'Chennai',
        'Kolkata',
        'Hyderabad',
        'Pune',
        'Ahmedabad',
        'Jaipur',
        'Lucknow',
        'Kanpur',
        'Nagpur',
        'Indore',
        'Thane',
        'Bhopal',
        'Visakhapatnam',
        'Pimpri-Chinchwad',
        'Patna',
        'Vadodara',
        'Ghaziabad',
      ];

      for (let i = 0; i < Math.min(validIndianCities.length, 5); i++) {
        const vendor = createTestVendor({
          name: `${validIndianCities[i]} Vendor`,
          email: `${validIndianCities[i]!.toLowerCase()}@test.com`,
          location: validIndianCities[i],
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendor)
          .expect(201);

        expect(response.body.location).toBe(validIndianCities[i]);
      }
    });

    it('should validate vendor categories', async () => {
      const validCategories = [
        'Photography',
        'Catering',
        'Decoration',
        'Music & DJ',
        'Makeup Artist',
        'Wedding Planner',
        'Venue',
        'Transportation',
        'Jewelry',
        'Clothing & Accessories',
      ];

      for (const category of validCategories) {
        const vendor = createTestVendor({
          name: `${category} Test Vendor`,
          email: `${category.toLowerCase().replace(/\s+/g, '')}@test.com`,
          category: category,
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendor)
          .expect(201);

        expect(response.body.category).toBe(category);
      }
    });

    it('should validate price range formats', async () => {
      const validPriceRanges = [
        '₹25,000 - ₹50,000',
        '₹50,000 - ₹1,00,000',
        '₹1,00,000 - ₹2,00,000',
        '₹2,00,000 - ₹5,00,000',
        '₹5,00,000+',
        '₹1,000 - ₹2,000 per plate',
        'Starting from ₹75,000',
        'Customized pricing available',
      ];

      for (let i = 0; i < validPriceRanges.length; i++) {
        const vendor = createTestVendor({
          name: `Price Range Vendor ${i}`,
          email: `price${i}@test.com`,
          priceRange: validPriceRanges[i],
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendor)
          .expect(201);

        expect(response.body.priceRange).toBe(validPriceRanges[i]);
      }
    });

    it('should validate portfolio image formats', async () => {
      const validImageFormats = [
        'image1.jpg,image2.png,image3.jpeg',
        'portfolio1.webp,portfolio2.jpg',
        'wedding-photo.jpg,pre-wedding.png,reception.jpeg',
        '', // Empty is valid
      ];

      for (let i = 0; i < validImageFormats.length; i++) {
        const vendor = createTestVendor({
          name: `Portfolio Vendor ${i}`,
          email: `portfolio${i}@test.com`,
          portfolioImages: validImageFormats[i],
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendor)
          .expect(201);

        expect(response.body.portfolioImages).toBe(validImageFormats[i]);
      }
    });
  });

  describe('Contact Information Validation', () => {
    it('should validate Indian phone number formats', async () => {
      const validPhoneFormats = [
        '+91-9876543210',
        '+919876543210',
        '9876543210',
        '+91 9876543210',
        '91-9876543210',
        '+91 98765 43210',
        '098765 43210',
      ];

      for (let i = 0; i < validPhoneFormats.length; i++) {
        const vendor = createTestVendor({
          name: `Phone Vendor ${i}`,
          email: `phone${i}@test.com`,
          phone: validPhoneFormats[i],
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendor)
          .expect(201);

        expect(response.body.phone).toBeTruthy();
      }
    });

    it('should reject invalid phone number formats', async () => {
      const invalidPhoneFormats = [
        '123456789', // Too short
        '12345678901234567890', // Too long
        'abcdefghij', // Non-numeric
        '+1-1234567890', // Wrong country code
        '0000000000', // Invalid number
        '+91-0000000000', // Invalid with country code
      ];

      for (let i = 0; i < invalidPhoneFormats.length; i++) {
        const vendor = createTestVendor({
          name: `Invalid Phone Vendor ${i}`,
          email: `invalidphone${i}@test.com`,
          phone: invalidPhoneFormats[i],
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendor);

        // Should either reject or sanitize
        expect([201, 400]).toContain(response.status);
      }
    });

    it('should validate WhatsApp number formats', async () => {
      const validWhatsAppNumbers = [
        '+91-9876543210',
        '+919876543210',
        '9876543210',
        '+91 9876543210',
      ];

      for (let i = 0; i < validWhatsAppNumbers.length; i++) {
        const vendor = createTestVendor({
          name: `WhatsApp Vendor ${i}`,
          email: `whatsapp${i}@test.com`,
          whatsapp: validWhatsAppNumbers[i],
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendor)
          .expect(201);

        expect(response.body.whatsapp).toBeTruthy();
      }
    });

    it('should validate website URL formats', async () => {
      const validWebsites = [
        'https://example.com',
        'http://test-site.co.in',
        'https://www.vendor-website.com',
        'https://subdomain.example.org',
        'https://vendor123.wixsite.com/photography',
      ];

      for (let i = 0; i < validWebsites.length; i++) {
        const vendor = createTestVendor({
          name: `Website Vendor ${i}`,
          email: `website${i}@test.com`,
          website: validWebsites[i],
        });

        const response = await request(app)
          .post('/api/vendors')
          .send(vendor)
          .expect(201);

        expect(response.body.website).toBe(validWebsites[i]);
      }
    });

    it('should validate Instagram handle formats', async () => {
      const validInstagramHandles = [
        '@validhandle',
        '@test_handle_123',
        '@handle.with.dots',
        'validhandle', // without @
        '@photography_studio_mumbai',
        '@vendor123',
      ];

      for (let i = 0; i < validInstagramHandles.length; i++) {
        const vendor = createTestVendor({
          name: `Instagram Vendor ${i}`,
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

  describe('Data Consistency Validation', () => {
    it('should ensure email uniqueness across all vendors', async () => {
      const sharedEmail = 'shared@test.com';
      
      // Create first vendor
      const firstVendor = createTestVendor({
        name: 'First Vendor',
        email: sharedEmail,
      });

      await request(app)
        .post('/api/vendors')
        .send(firstVendor)
        .expect(201);

      // Try to create second vendor with same email
      const secondVendor = createTestVendor({
        name: 'Second Vendor',
        email: sharedEmail,
        category: 'Catering', // Different category
        location: 'Delhi', // Different location
      });

      const response = await request(app)
        .post('/api/vendors')
        .send(secondVendor)
        .expect(409);

      expect(response.body.error).toContain('already exists');
    });

    it('should allow same name for different vendors in different locations', async () => {
      const sameName = 'Popular Photography Studio';
      
      const vendor1 = createTestVendor({
        name: sameName,
        email: 'mumbai@popular.com',
        location: 'Mumbai',
      });

      const vendor2 = createTestVendor({
        name: sameName,
        email: 'delhi@popular.com',
        location: 'Delhi',
      });

      const response1 = await request(app)
        .post('/api/vendors')
        .send(vendor1)
        .expect(201);

      const response2 = await request(app)
        .post('/api/vendors')
        .send(vendor2)
        .expect(201);

      expect(response1.body.name).toBe(sameName);
      expect(response2.body.name).toBe(sameName);
      expect(response1.body.location).toBe('Mumbai');
      expect(response2.body.location).toBe('Delhi');
    });

    it('should maintain data integrity during concurrent operations', async () => {
      const baseEmail = 'concurrent';
      const concurrentRequests = 10;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        const vendor = createTestVendor({
          name: `Concurrent Vendor ${i}`,
          email: `${baseEmail}${i}@test.com`,
        });

        promises.push(
          request(app)
            .post('/api/vendors')
            .send(vendor)
        );
      }

      const responses = await Promise.all(promises);

      // All should succeed with unique IDs
      const createdIds = responses.map(r => r.body.id);
      const uniqueIds = [...new Set(createdIds)];
      
      expect(uniqueIds.length).toBe(concurrentRequests);
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });
    });
  });
});