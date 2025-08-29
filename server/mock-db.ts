/**
 * Mock Database for Development
 * This provides a simple in-memory database that matches the PostgreSQL schema
 * Replace with real PostgreSQL when ready
 */

import type { 
  Vendor,
  Category,
  BlogPost,
  Wedding,
  Rsvp
} from "@shared/schema";

// Mock data storage
const mockData = {
  vendors: [] as Vendor[],
  categories: [] as Category[],
  blogPosts: [] as BlogPost[],
  weddings: [] as Wedding[],
  rsvps: [] as Rsvp[]
};

// Mock database operations
export const mockDb = {
  // Vendors
  vendors: {
    findMany: (filters?: any) => {
      let results = mockData.vendors;
      
      if (filters?.where) {
        const { category, location, name } = filters.where;
        if (category) results = results.filter(v => v.category === category);
        if (location) results = results.filter(v => v.location === location);
        if (name?.like) {
          const searchTerm = name.like.replace(/%/g, '');
          results = results.filter(v => 
            v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      }
      
      return Promise.resolve(results);
    },
    
    findUnique: (id: string) => {
      const vendor = mockData.vendors.find(v => v.id === parseInt(id));
      return Promise.resolve(vendor || null);
    },
    
    create: (data: any) => {
      const vendor: any = {
        id: mockData.vendors.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      };
      mockData.vendors.push(vendor);
      return Promise.resolve(vendor);
    }
  },

  // Categories
  categories: {
    findMany: () => {
      return Promise.resolve(mockData.categories);
    },
    
    findUnique: (id: string) => {
      const category = mockData.categories.find(c => c.id === parseInt(id));
      return Promise.resolve(category || null);
    },
    
    create: (data: any) => {
      const category: any = {
        id: mockData.categories.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      };
      mockData.categories.push(category);
      return Promise.resolve(category);
    }
  },

  // Blog Posts
  blogPosts: {
    findMany: () => {
      return Promise.resolve(mockData.blogPosts);
    },
    
    findUnique: (id: string) => {
      const post = mockData.blogPosts.find(p => p.id === parseInt(id));
      return Promise.resolve(post || null);
    },
    
    create: (data: any) => {
      const post: any = {
        id: mockData.blogPosts.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      };
      mockData.blogPosts.push(post);
      return Promise.resolve(post);
    }
  },

  // Weddings
  weddings: {
    findMany: () => {
      return Promise.resolve(mockData.weddings);
    },
    
    findUnique: (id: string) => {
      const wedding = mockData.weddings.find(w => w.id === parseInt(id));
      return Promise.resolve(wedding || null);
    },
    
    create: (data: any) => {
      const wedding: any = {
        id: mockData.weddings.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      };
      mockData.weddings.push(wedding);
      return Promise.resolve(wedding);
    }
  },

  // RSVPs
  rsvps: {
    findMany: () => {
      return Promise.resolve(mockData.rsvps);
    },
    
    findUnique: (id: string) => {
      const rsvp = mockData.rsvps.find(r => r.id === parseInt(id));
      return Promise.resolve(rsvp || null);
    },
    
    create: (data: any) => {
      const rsvp: any = {
        id: mockData.rsvps.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      };
      mockData.rsvps.push(rsvp);
      return Promise.resolve(rsvp);
    }
  }
};

// Initialize mock data
export async function initializeMockData() {
  console.log('✅ Mock database initialized');
}


