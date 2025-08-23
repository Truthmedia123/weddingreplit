import { db } from '../../db';
import { vendors, categories, blogPosts, weddings, rsvps } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Test data
export const testVendors = [
  {
    name: 'Elite Photography Studio',
    email: 'contact@elitephotography.com',
    phone: '+91-98765-43210',
    category: 'Photography',
    location: 'Mumbai, Maharashtra',
    description: 'Professional wedding photography services with over 10 years of experience.',
    services: ['Wedding Photography', 'Engagement Shoots', 'Portrait Photography'],
    website: 'https://elitephotography.com',
    instagram: '@elitephotography',
    whatsapp: '+91-98765-43210',
    featured: true,
    verified: true,
    rating: "4.8",
    reviewCount: 45,
    priceRange: '$$$',
    gallery: ['gallery1.jpg', 'gallery2.jpg'],
    address: '123 Photography Lane, Mumbai',
    youtube: '@elitephotography',
    facebook: '@elitephotography',
    profileImage: 'profile1.jpg',
    coverImage: 'cover1.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Royal Catering Services',
    email: 'info@royalcatering.com',
    phone: '+91-98765-43211',
    category: 'Catering',
    location: 'Goa, India',
    description: 'Premium catering services for weddings and special events.',
    services: ['Wedding Catering', 'Corporate Events', 'Private Parties'],
    website: 'https://royalcatering.com',
    instagram: '@royalcatering',
    whatsapp: '+91-98765-43211',
    featured: false,
    verified: true,
    rating: "4.6",
    reviewCount: 32,
    priceRange: '$$',
    gallery: ['food1.jpg', 'food2.jpg'],
    address: '456 Catering Street, Goa',
    youtube: '@royalcatering',
    facebook: '@royalcatering',
    profileImage: 'profile2.jpg',
    coverImage: 'cover2.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const testCategories = [
  {
    name: 'Photography',
    slug: 'photography',
    description: 'Professional photography services for your special day',
    icon: 'camera',
    color: 'blue',
    featured: false,
    vendorCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Catering',
    slug: 'catering',
    description: 'Delicious catering services for weddings and events',
    icon: 'utensils',
    color: 'green',
    featured: false,
    vendorCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const testWeddings = [
  {
    coupleName: 'John & Jane Doe',
    contactEmail: 'john.jane@example.com',
    contactPhone: '+91-9876543210',
    weddingDate: new Date('2025-06-15'),
    venue: 'Grand Hotel, Mumbai',
    venueAddress: '123 Grand Street, Mumbai',
    nuptialsTime: '4:00 PM',
    receptionTime: '7:00 PM',
    guestCount: 150,
    budget: 'moderate',
    theme: 'elegant',
    specialRequests: 'Vegetarian catering required',
    isPublic: true,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    coupleName: 'Mike & Sarah Smith',
    contactEmail: 'mike.sarah@example.com',
    contactPhone: '+91-9876543211',
    weddingDate: new Date('2025-08-20'),
    venue: 'Beach Resort, Goa',
    venueAddress: '456 Beach Road, Goa',
    nuptialsTime: '5:00 PM',
    receptionTime: '8:00 PM',
    guestCount: 80,
    budget: 'premium',
    theme: 'beach',
    specialRequests: 'Outdoor ceremony preferred',
    isPublic: true,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const testBlogPosts = [
  {
    title: 'Top 10 Wedding Photography Tips',
    slug: 'top-10-wedding-photography-tips',
    excerpt: 'Essential tips for capturing your perfect wedding day',
    content: 'Here are the top 10 tips for wedding photography...',
    author: 'Wedding Expert',
    featuredImage: 'photography-tips.jpg',
    imageUrl: 'photography-tips.jpg',
    tags: ['Photography', 'Wedding Tips', 'Planning'],
    published: true,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: 'Choosing the Perfect Wedding Caterer',
    slug: 'choosing-perfect-wedding-caterer',
    excerpt: 'How to select the right catering service for your wedding',
    content: 'Selecting the right caterer is crucial for your wedding...',
    author: 'Catering Specialist',
    featuredImage: 'catering-guide.jpg',
    imageUrl: 'catering-guide.jpg',
    tags: ['Catering', 'Wedding Planning', 'Food'],
    published: true,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const testRSVPs = [
  {
    weddingId: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+91-9876543212',
    response: 'attending',
    guests: 2,
    dietaryRestrictions: 'Vegetarian',
    message: 'Looking forward to the celebration!',
    createdAt: new Date(),
  },
  {
    weddingId: 1,
    name: 'Bob Wilson',
    email: 'bob@example.com',
    phone: '+91-9876543213',
    response: 'not_attending',
    guests: 0,
    dietaryRestrictions: '',
    message: 'Sorry, unable to attend due to prior commitments.',
    createdAt: new Date(),
  },
];

// Database setup and teardown
export const setupTestDatabase = async () => {
  // Clear existing data
  await db.delete(rsvps);
  await db.delete(weddings);
  await db.delete(blogPosts);
  await db.delete(vendors);
  await db.delete(categories);

  // Insert test data
  await db.insert(categories).values(testCategories);
  await db.insert(vendors).values(testVendors);
  await db.insert(weddings).values(testWeddings);
  await db.insert(blogPosts).values(testBlogPosts);
  await db.insert(rsvps).values(testRSVPs);
};

export const teardownTestDatabase = async () => {
  // Clear all test data
  await db.delete(rsvps);
  await db.delete(weddings);
  await db.delete(blogPosts);
  await db.delete(vendors);
  await db.delete(categories);
};

// Helper functions
export const getTestVendor = async (id: number) => {
  const result = await db.select().from(vendors).where(eq(vendors.id, id));
  return result[0];
};

export const createTestVendor = (vendorData: any = {}) => {
  const defaultVendor = {
    name: 'Test Vendor',
    email: 'test@example.com',
    phone: '+91-9876543210',
    category: 'Photography',
    location: 'Mumbai',
    description: 'Professional photography services',
    services: ['Wedding Photography', 'Portrait Photography'],
    website: 'https://testvendor.com',
    instagram: '@testvendor',
    whatsapp: '+91-9876543210',
    address: '123 Test Street, Mumbai',
    youtube: '@testvendor',
    facebook: '@testvendor',
    profileImage: 'profile.jpg',
    coverImage: 'cover.jpg',
    gallery: ['gallery1.jpg', 'gallery2.jpg'],
    featured: false,
    verified: false,
    rating: "0.0",
    reviewCount: 0,
    priceRange: '$$',
  };
  
  return { ...defaultVendor, ...vendorData };
};

export const createTestVendorInDB = async (vendorData: any = {}) => {
  const [vendor] = await db.insert(vendors).values(vendorData).returning();
  return vendor;
};

// Export TestDatabase for backward compatibility
// Move function declarations before the object
export const getTestCategory = async (id: number) => {
  return await db.select().from(categories).where(eq(categories.id, id)).limit(1).then(rows => rows[0]);
};

export const getTestWedding = async (id: number) => {
  return await db.select().from(weddings).where(eq(weddings.id, id)).limit(1).then(rows => rows[0]);
};

export const getTestBlogPost = async (id: number) => {
  return await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1).then(rows => rows[0]);
};

export const getTestRSVP = async (id: number) => {
  return await db.select().from(rsvps).where(eq(rsvps.id, id)).limit(1).then(rows => rows[0]);
};

export const TestDatabase = {
  setup: setupTestDatabase,
  teardown: teardownTestDatabase,
  reset: setupTestDatabase,
  cleanup: teardownTestDatabase,
  seed: setupTestDatabase,
  getVendor: getTestVendor,
  getCategory: getTestCategory,
  getWedding: getTestWedding,
  getBlogPost: getTestBlogPost,
  getRSVP: getTestRSVP,
};

