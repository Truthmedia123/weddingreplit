import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';
import { storage } from '../storage';

// Mock the storage module
jest.mock('../storage', () => ({
  storage: {
    getVendors: jest.fn(),
    getVendor: jest.fn(),
    getFeaturedVendors: jest.fn(),
    getCategories: jest.fn(),
    getCategory: jest.fn(),
    getBlogPosts: jest.fn(),
    getBlogPost: jest.fn(),
    createBusinessSubmission: jest.fn(),
    createContact: jest.fn(),
    getWeddings: jest.fn(),
    createWedding: jest.fn(),
    getWedding: jest.fn(),
    getWeddingRsvps: jest.fn(),
    createRsvp: jest.fn(),
  },
}));

describe('API Routes', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('GET /api/vendors', () => {
    it('should return vendors list', async () => {
      const mockVendors = [
        {
          id: 1,
          name: 'Test Vendor',
          category: 'photographers',
          description: 'Test description',
          phone: '1234567890',
          email: 'test@example.com',
          whatsapp: '1234567890',
          location: 'Goa',
        },
      ];

      (storage.getVendors as jest.Mock).mockResolvedValue(mockVendors);

      const response = await request(app)
        .get('/api/vendors')
        .expect(200);

      expect(response.body).toEqual(mockVendors);
      expect(storage.getVendors).toHaveBeenCalledWith({
        category: undefined,
        location: undefined,
        search: undefined,
      });
    });

    it('should handle vendor filtering', async () => {
      const mockVendors = [];
      (storage.getVendors as jest.Mock).mockResolvedValue(mockVendors);

      await request(app)
        .get('/api/vendors?category=photographers&location=Goa&search=wedding')
        .expect(200);

      expect(storage.getVendors).toHaveBeenCalledWith({
        category: 'photographers',
        location: 'Goa',
        search: 'wedding',
      });
    });

    it('should handle storage errors', async () => {
      (storage.getVendors as jest.Mock).mockRejectedValue(new Error('Database error'));

      await request(app)
        .get('/api/vendors')
        .expect(500);
    });
  });

  describe('GET /api/vendors/:id', () => {
    it('should return a specific vendor', async () => {
      const mockVendor = {
        id: 1,
        name: 'Test Vendor',
        category: 'photographers',
        description: 'Test description',
        phone: '1234567890',
        email: 'test@example.com',
        whatsapp: '1234567890',
        location: 'Goa',
      };

      (storage.getVendor as jest.Mock).mockResolvedValue(mockVendor);

      const response = await request(app)
        .get('/api/vendors/1')
        .expect(200);

      expect(response.body).toEqual(mockVendor);
      expect(storage.getVendor).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent vendor', async () => {
      (storage.getVendor as jest.Mock).mockResolvedValue(undefined);

      await request(app)
        .get('/api/vendors/999')
        .expect(404);
    });
  });

  describe('GET /api/categories', () => {
    it('should return categories list', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'Photographers',
          slug: 'photographers',
          description: 'Wedding photographers',
          icon: '📸',
          color: '#FF6B6B',
          vendorCount: 10,
        },
      ];

      (storage.getCategories as jest.Mock).mockResolvedValue(mockCategories);

      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body).toEqual(mockCategories);
    });
  });

  describe('POST /api/business-submissions', () => {
    it('should create a business submission', async () => {
      const submissionData = {
        name: 'Test Business',
        category: 'photographers',
        description: 'Test description',
        phone: '1234567890',
        email: 'test@example.com',
        whatsapp: '1234567890',
        location: 'Goa',
      };

      const mockSubmission = { id: 1, ...submissionData };
      (storage.createBusinessSubmission as jest.Mock).mockResolvedValue(mockSubmission);

      const response = await request(app)
        .post('/api/business-submissions')
        .send(submissionData)
        .expect(201);

      expect(response.body).toEqual(mockSubmission);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'Test Business',
        // Missing required fields
      };

      await request(app)
        .post('/api/business-submissions')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /api/contact', () => {
    it('should create a contact message', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      };

      const mockContact = { id: 1, ...contactData };
      (storage.createContact as jest.Mock).mockResolvedValue(mockContact);

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(201);

      expect(response.body).toEqual(mockContact);
    });
  });
});