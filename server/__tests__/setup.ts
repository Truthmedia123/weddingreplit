// Test setup for server tests
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set default test environment variables if not present
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';
process.env.NODE_ENV = 'test';

// Mock the database connection to prevent actual database calls
jest.mock('../db', () => {
  const mockChain = {
    delete: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: 1, name: 'Test Vendor' }]),
  };
  
  return {
    db: mockChain,
  };
});

// Mock the storage module with more realistic behavior
let mockVendorCounter = 1;
const mockVendorStorage = new Map();

jest.mock('../storage', () => ({
  storage: {
    getVendors: jest.fn().mockImplementation((filters = {}) => {
      const vendors = Array.from(mockVendorStorage.values());
      let filtered = vendors;
      
      if (filters.category) {
        filtered = filtered.filter(v => v.category === filters.category);
      }
      if (filters.location) {
        filtered = filtered.filter(v => v.location.includes(filters.location));
      }
      if (filters.search) {
        filtered = filtered.filter(v => 
          v.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          v.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      return Promise.resolve(filtered);
    }),
    getVendor: jest.fn().mockImplementation((id) => {
      return Promise.resolve(mockVendorStorage.get(id) || null);
    }),
    getVendorByEmail: jest.fn().mockImplementation((email) => {
      const vendor = Array.from(mockVendorStorage.values()).find(v => v.email === email);
      return Promise.resolve(vendor || null);
    }),
    getFeaturedVendors: jest.fn().mockImplementation(() => {
      const vendors = Array.from(mockVendorStorage.values()).filter(v => v.featured);
      return Promise.resolve(vendors);
    }),
    getCategories: jest.fn().mockResolvedValue([]),
    getCategory: jest.fn().mockResolvedValue(null),
    getBlogPosts: jest.fn().mockResolvedValue([]),
    getBlogPost: jest.fn().mockResolvedValue(null),
    createVendor: jest.fn().mockImplementation((data) => {
      const id = mockVendorCounter++;
      const vendor = { 
        id, 
        ...data, 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: data.featured || false,
        verified: data.verified || false,
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
      };
      mockVendorStorage.set(id, vendor);
      return Promise.resolve(vendor);
    }),
    updateVendor: jest.fn().mockImplementation((id, data) => {
      const existing = mockVendorStorage.get(id);
      if (!existing) return Promise.resolve(null);
      
      const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
      mockVendorStorage.set(id, updated);
      return Promise.resolve(updated);
    }),
    deleteVendor: jest.fn().mockImplementation((id) => {
      const deleted = mockVendorStorage.delete(id);
      return Promise.resolve(deleted);
    }),
    createBusinessSubmission: jest.fn().mockResolvedValue({ id: 1 }),
    createContact: jest.fn().mockResolvedValue({ id: 1 }),
    getWeddings: jest.fn().mockResolvedValue([]),
    createWedding: jest.fn().mockResolvedValue({ id: 1 }),
    getWedding: jest.fn().mockResolvedValue(null),
    getWeddingRsvps: jest.fn().mockResolvedValue([]),
    createRsvp: jest.fn().mockResolvedValue({ id: 1 }),
  },
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
