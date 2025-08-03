import { db } from '../../db';
import { vendors, rsvps, weddings, blogPosts } from '@shared/schema-sqlite';

// Database test utilities
export class TestDatabase {
  static async seed() {
    // Seed test data for consistent testing
    await this.seedVendors();
    await this.seedWeddings();
    await this.seedBlogPosts();
    await this.seedBusinessSubmissions();
  }

  static async cleanup() {
    // Clean up all test data
    await db.delete(rsvps);
    // await db.delete(businessSubmissions); // Not implemented yet
    await db.delete(blogPosts);
    await db.delete(vendors);
    await db.delete(weddings);
  }

  static async reset() {
    await this.cleanup();
    await this.seed();
  }

  private static async seedVendors() {
    const testVendors = [
      {
        name: 'Test Photography Studio',
        email: 'test@photography.com',
        phone: '+91-9876543210',
        category: 'Photography',
        location: 'Mumbai',
        description: 'Professional wedding photography',
        services: 'Wedding Photography, Pre-wedding Shoots',
        website: 'https://testphoto.com',
        instagram: '@testphoto',
        whatsapp: '+91-9876543210',
        featured: true,
        verified: true,
        rating: 4.8,
        reviewCount: 50,
        priceRange: '₹75,000 - ₹1,50,000',
        availability: 'Available',
        portfolioImages: 'image1.jpg,image2.jpg',
      },
      {
        name: 'Elite Catering Services',
        email: 'info@elitecatering.com',
        phone: '+91-9876543211',
        category: 'Catering',
        location: 'Delhi',
        description: 'Premium wedding catering services',
        services: 'Wedding Catering, Menu Planning',
        website: 'https://elitecatering.com',
        instagram: '@elitecatering',
        whatsapp: '+91-9876543211',
        featured: false,
        verified: true,
        rating: 4.5,
        reviewCount: 30,
        priceRange: '₹1,000 - ₹2,000 per plate',
        availability: 'Available',
        portfolioImages: 'food1.jpg,food2.jpg',
      },
    ];

    await db.insert(vendors).values(testVendors);
  }

  private static async seedWeddings() {
    const testWeddings = [
      {
        slug: 'test-wedding-2024',
        brideName: 'Priya',
        groomName: 'Rahul',
        weddingDate: '2024-12-15',
        venue: 'Grand Palace Hotel',
        venueAddress: 'Mumbai, Maharashtra',
        nuptialsTime: '18:00',
        receptionTime: '20:00',
        maxGuests: 200,
        contactEmail: 'priya.rahul@wedding.com',
        contactPhone: '+91-9876543212',
        rsvpDeadline: '2024-12-01',
      },
    ];

    await db.insert(weddings).values(testWeddings);
  }

  private static async seedBlogPosts() {
    const testBlogPosts = [
      {
        title: 'Top 10 Wedding Photography Tips',
        slug: 'wedding-photography-tips',
        excerpt: 'Essential tips for capturing perfect wedding moments',
        content: 'Detailed content about wedding photography techniques...',
        author: 'Photography Expert',
        featuredImage: 'photography-tips.jpg',
        imageUrl: 'blog-photography.jpg',
        tags: 'photography,wedding,tips',
        published: true,
      },
      {
        title: 'Planning Your Dream Wedding Menu',
        slug: 'dream-wedding-menu',
        excerpt: 'How to create the perfect wedding menu for your guests',
        content: 'Comprehensive guide to wedding menu planning...',
        author: 'Catering Specialist',
        featuredImage: 'wedding-menu.jpg',
        imageUrl: 'blog-catering.jpg',
        tags: 'catering,menu,planning',
        published: true,
      },
    ];

    await db.insert(blogPosts).values(testBlogPosts);
  }

  private static async seedBusinessSubmissions() {
    // Business submissions not implemented yet
    // const testSubmissions = [...];
    // await db.insert(businessSubmissions).values(testSubmissions);
  }
}

// Test data factories
export const createTestVendor = (overrides = {}) => ({
  name: 'Test Vendor',
  email: 'test@vendor.com',
  phone: '+91-9876543210',
  category: 'Photography',
  location: 'Mumbai',
  description: 'Test vendor description',
  services: 'Test services',
  website: 'https://testvendor.com',
  instagram: '@testvendor',
  whatsapp: '+91-9876543210',
  featured: false,
  verified: true,
  rating: 4.0,
  reviewCount: 10,
  priceRange: '₹50,000 - ₹1,00,000',
  availability: 'Available',
  portfolioImages: 'test1.jpg,test2.jpg',
  ...overrides,
});

export const createTestWedding = (overrides = {}) => ({
  slug: 'test-wedding',
  brideName: 'Test Bride',
  groomName: 'Test Groom',
  weddingDate: '2024-12-31',
  venue: 'Test Venue',
  venueAddress: 'Test Address',
  nuptialsTime: '16:00',
  receptionTime: '19:00',
  maxGuests: 100,
  contactEmail: 'test@wedding.com',
  contactPhone: '+91-9876543210',
  rsvpDeadline: '2024-12-25',
  ...overrides,
});

export const createTestBlogPost = (overrides = {}) => ({
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  excerpt: 'Test excerpt',
  content: 'Test content',
  author: 'Test Author',
  featuredImage: 'test-featured.jpg',
  imageUrl: 'test-image.jpg',
  tags: 'test,blog',
  published: true,
  ...overrides,
});

export const createTestBusinessSubmission = (overrides = {}) => ({
  businessName: 'Test Business',
  ownerName: 'Test Owner',
  email: 'test@business.com',
  phone: '+91-9876543210',
  category: 'Photography',
  location: 'Mumbai',
  description: 'Test business description',
  services: 'Test services',
  website: 'https://testbusiness.com',
  instagram: '@testbusiness',
  experience: '2 years',
  portfolio: 'https://portfolio.test.com',
  status: 'pending',
  ...overrides,
});

// API test helpers
export const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ...overrides,
});

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

// Performance testing utilities
export const measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = Date.now();
  await fn();
  return Date.now() - start;
};

export const createLoadTestScenario = (concurrentRequests: number, testFunction: () => Promise<any>) => {
  return Promise.all(
    Array.from({ length: concurrentRequests }, () => testFunction())
  );
};