import { users, vendors, reviews, categories, blogPosts, businessSubmissions, contacts, weddings, rsvps } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like } from "drizzle-orm";
import type { 
  User, InsertUser, 
  Vendor, InsertVendor, 
  Review, InsertReview, 
  Category, InsertCategory,
  BlogPost, InsertBlogPost,
  BusinessSubmission, InsertBusinessSubmission,
  Contact, InsertContact,
  Wedding, InsertWedding,
  Rsvp, InsertRsvp
} from "@shared/schema";

export interface IStorage {
  // Vendors
  getVendors(filters: { category?: string; location?: string; search?: string }): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  getFeaturedVendors(): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;

  // Reviews
  getVendorReviews(vendorId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Blog Posts
  getBlogPosts(published?: boolean): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;

  // Business Submissions
  createBusinessSubmission(submission: InsertBusinessSubmission): Promise<BusinessSubmission>;

  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;

  // Weddings
  getWeddings(): Promise<Wedding[]>;
  getWedding(slug: string): Promise<Wedding | undefined>;
  createWedding(wedding: InsertWedding): Promise<Wedding>;

  // RSVPs
  getWeddingRsvps(weddingId: number): Promise<Rsvp[]>;
  createRsvp(rsvp: InsertRsvp): Promise<Rsvp>;
}

export class MemoryStorage implements IStorage {
  private vendors: Vendor[] = [
    {
      id: 1,
      name: "Paradise Beach Resort",
      category: "venues",
      description: "Stunning beachfront resort perfect for destination weddings with panoramic ocean views and world-class amenities.",
      phone: "+91 832 227 6054",
      email: "events@paradisebeachresort.com",
      whatsapp: "+91 9876543210",
      location: "North Goa",
      address: "Calangute Beach Road, Calangute, North Goa",
      website: "https://paradisebeachresort.com",
      instagram: "paradisebeachresort",
      youtube: "ParadiseBeachResortGoa",
      facebook: "paradisebeachresort",
      profileImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
      coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552",
      gallery: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d", "https://images.unsplash.com/photo-1520637836862-4d197d17c92a"],
      services: ["Beach Weddings", "Reception Halls", "Catering", "Accommodation"],
      priceRange: "₹2,00,000 - ₹5,00,000",
      featured: true,
      verified: true,
      rating: "4.8",
      reviewCount: 45,
      createdAt: new Date()
    },
    {
      id: 2,
      name: "Goa Wedding Photography",
      category: "photography", 
      description: "Award-winning wedding photographers specializing in candid moments and destination weddings across Goa.",
      phone: "+91 832 456 7890",
      email: "info@goaweddingphoto.com",
      whatsapp: "+91 9876543211",
      location: "South Goa",
      address: "Margao, South Goa",
      website: "https://goaweddingphoto.com",
      instagram: "goaweddingphotographer",
      youtube: "GoaWeddingPhotography", 
      facebook: "goaweddingphoto",
      profileImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc",
      coverImage: "https://images.unsplash.com/photo-1520854221256-17451cc331bf",
      gallery: ["https://images.unsplash.com/photo-1511285560929-80b456fea0bc", "https://images.unsplash.com/photo-1520854221256-17451cc331bf"],
      services: ["Wedding Photography", "Pre-wedding Shoots", "Drone Photography", "Albums"],
      priceRange: "₹50,000 - ₹2,00,000",
      featured: true,
      verified: true,
      rating: "4.9",
      reviewCount: 62,
      createdAt: new Date()
    },
    {
      id: 3,
      name: "Spice Garden Catering",
      category: "catering",
      description: "Authentic Goan cuisine and multi-cuisine catering services for weddings with traditional flavors and modern presentation.",
      phone: "+91 832 234 5678",
      email: "orders@spicegardencatering.com",
      whatsapp: "+91 9876543212",
      location: "North Goa",
      address: "Panaji, North Goa",
      website: "https://spicegardencatering.com",
      instagram: "goacateringservices",
      youtube: "GoaCateringOfficial",
      facebook: "spicegardencatering",
      profileImage: "https://images.unsplash.com/photo-1555244162-803834f70033",
      coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
      gallery: ["https://images.unsplash.com/photo-1555244162-803834f70033", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0"],
      services: ["Goan Cuisine", "Multi-cuisine", "Live Counters", "Desserts"],
      priceRange: "₹800 - ₹2,500 per plate",
      featured: false,
      verified: true,
      rating: "4.6",
      reviewCount: 38,
      createdAt: new Date()
    }
  ];

  private reviews: Review[] = [
    {
      id: 1,
      vendorId: 1,
      customerName: "Anita & Rohit",
      customerEmail: "anita.rohit@email.com",
      rating: 5,
      comment: "Absolutely stunning venue! The beach ceremony was magical and the staff was incredibly helpful throughout our wedding.",
      createdAt: new Date()
    },
    {
      id: 2,
      vendorId: 2,
      customerName: "Priya & Raj",
      customerEmail: "priya.raj@email.com",
      rating: 5,
      comment: "Amazing photographers! They captured every moment perfectly. The pre-wedding shoot was fantastic too.",
      createdAt: new Date()
    }
  ];

  private categories: Category[] = [
    { id: 1, name: "Wedding Photography", slug: "photography", description: "Capture your special moments", icon: "fas fa-camera", color: "from-purple-500 to-pink-500", vendorCount: 25 },
    { id: 2, name: "Wedding Venues", slug: "venues", description: "Beautiful venues for your dream wedding", icon: "fas fa-building", color: "from-blue-500 to-teal-500", vendorCount: 15 },
    { id: 3, name: "Catering Services", slug: "catering", description: "Delicious cuisine and catering services", icon: "fas fa-utensils", color: "from-orange-500 to-red-500", vendorCount: 20 },
    { id: 4, name: "Bridal Makeup", slug: "makeup", description: "Professional bridal makeup and beauty services", icon: "fas fa-palette", color: "from-pink-500 to-rose-500", vendorCount: 30 },
    { id: 5, name: "Wedding Planning", slug: "planning", description: "Complete wedding planning and coordination services", icon: "fas fa-clipboard-list", color: "from-green-500 to-emerald-500", vendorCount: 12 },
    { id: 6, name: "Decorations", slug: "decorations", description: "Beautiful decorations and floral arrangements", icon: "fas fa-seedling", color: "from-yellow-500 to-orange-500", vendorCount: 18 }
  ];

  private blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "Top 10 Goan Wedding Trends This Year",
      slug: "top-10-goan-wedding-trends-this-year",
      excerpt: "Discover the latest wedding trends that are making Goan weddings more beautiful and memorable than ever before.",
      content: "Goa has always been a dream destination for weddings, and this year brings exciting new trends that blend traditional charm with modern elegance. From beach ceremonies to Portuguese-inspired decor, couples are finding innovative ways to celebrate their special day in paradise.",
      author: "Priya Sharma",
      published: true,
      featuredImage: "https://images.unsplash.com/photo-1519741497674-611481863552",
      tags: ["weddings", "trends", "goa", "beach weddings"],
      createdAt: new Date()
    },
    {
      id: 2,
      title: "Planning Your Perfect Beach Wedding in Goa",
      slug: "planning-perfect-beach-wedding-goa",
      excerpt: "Everything you need to know about organizing a stunning beach wedding in Goa, from permits to perfect timing.",
      content: "Beach weddings in Goa offer an unparalleled romantic setting with golden sands, azure waters, and breathtaking sunsets. This comprehensive guide covers everything from choosing the perfect beach to obtaining necessary permits and timing your ceremony for maximum impact.",
      author: "Raj Verma",
      published: true,
      featuredImage: "https://images.unsplash.com/photo-1520854221256-17451cc331bf",
      tags: ["beach wedding", "planning", "goa", "destination wedding"],
      createdAt: new Date()
    }
  ];

  private weddings: Wedding[] = [
    {
      id: 1,
      brideName: "Priya Sharma",
      groomName: "Raj Verma", 
      weddingDate: new Date("2024-12-15T16:00:00"),
      venue: "Paradise Beach Resort",
      venueAddress: "Calangute Beach, North Goa",
      ceremonyTime: "4:00 PM",
      receptionTime: "7:00 PM",
      coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552",
      galleryImages: [
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc",
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf",
        "https://images.unsplash.com/photo-1469371670807-013ccf25f16a"
      ],
      story: "Our love story began five years ago when we met at a college festival in Mumbai. What started as a friendship over shared cups of chai turned into something beautiful. From late-night conversations to exploring the streets of Mumbai together, we knew we had found our perfect match. Now, we invite you to celebrate with us as we begin this new chapter of our lives in the beautiful state of Goa.",
      slug: "priya-raj-2024",
      rsvpDeadline: new Date("2024-12-01T23:59:59"),
      maxGuests: 150,
      isPublic: true,
      contactEmail: "priya.raj.wedding@gmail.com",
      contactPhone: "+91 9876543210",
      createdAt: new Date()
    }
  ];

  private rsvps: Rsvp[] = [
    {
      id: 1,
      weddingId: 1,
      guestName: "Amit & Sneha Patel",
      guestEmail: "amit.patel@email.com", 
      guestPhone: "+91 9876543211",
      attendingCeremony: true,
      attendingReception: true,
      numberOfGuests: 2,
      dietaryRestrictions: "Vegetarian",
      message: "So excited to celebrate with you both!",
      createdAt: new Date()
    }
  ];

  private businessSubmissions: BusinessSubmission[] = [];
  private contacts: Contact[] = [];

  async getVendors(filters: { category?: string; location?: string; search?: string }): Promise<Vendor[]> {
    let filteredVendors = [...this.vendors];
    
    if (filters.category && filters.category !== 'all') {
      filteredVendors = filteredVendors.filter(v => v.category === filters.category);
    }
    if (filters.location && filters.location !== 'all') {
      filteredVendors = filteredVendors.filter(v => v.location === filters.location);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredVendors = filteredVendors.filter(v => 
        v.name.toLowerCase().includes(searchLower) || 
        v.description.toLowerCase().includes(searchLower)
      );
    }
    
    return filteredVendors.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return parseFloat(b.rating) - parseFloat(a.rating);
    });
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.find(v => v.id === id);
  }

  async getFeaturedVendors(): Promise<Vendor[]> {
    return this.vendors
      .filter(v => v.featured)
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 6);
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const newVendor: Vendor = {
      ...vendor,
      id: this.vendors.length + 1,
      rating: "0",
      reviewCount: 0,
      createdAt: new Date()
    };
    this.vendors.push(newVendor);
    return newVendor;
  }

  async getVendorReviews(vendorId: number): Promise<Review[]> {
    return this.reviews.filter(r => r.vendorId === vendorId);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const newReview: Review = {
      ...review,
      id: this.reviews.length + 1,
      createdAt: new Date()
    };
    this.reviews.push(newReview);
    return newReview;
  }

  async getCategories(): Promise<Category[]> {
    return this.categories;
  }

  async getCategory(slug: string): Promise<Category | undefined> {
    return this.categories.find(c => c.slug === slug);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: this.categories.length + 1,
      vendorCount: 0
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  async getBlogPosts(published?: boolean): Promise<BlogPost[]> {
    let posts = [...this.blogPosts];
    if (published !== undefined) {
      posts = posts.filter(p => p.published === published);
    }
    return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    return this.blogPosts.find(p => p.slug === slug);
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const newPost: BlogPost = {
      ...post,
      id: this.blogPosts.length + 1,
      createdAt: new Date()
    };
    this.blogPosts.push(newPost);
    return newPost;
  }

  async createBusinessSubmission(submission: InsertBusinessSubmission): Promise<BusinessSubmission> {
    const newSubmission: BusinessSubmission = {
      ...submission,
      id: this.businessSubmissions.length + 1,
      status: "pending",
      createdAt: new Date()
    };
    this.businessSubmissions.push(newSubmission);
    return newSubmission;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const newContact: Contact = {
      ...contact,
      id: this.contacts.length + 1,
      createdAt: new Date()
    };
    this.contacts.push(newContact);
    return newContact;
  }

  async getWeddings(): Promise<Wedding[]> {
    return this.weddings.filter(w => w.isPublic);
  }

  async getWedding(slug: string): Promise<Wedding | undefined> {
    return this.weddings.find(w => w.slug === slug);
  }

  async createWedding(wedding: InsertWedding): Promise<Wedding> {
    const newWedding: Wedding = {
      ...wedding,
      id: this.weddings.length + 1,
      createdAt: new Date()
    };
    this.weddings.push(newWedding);
    return newWedding;
  }

  async getWeddingRsvps(weddingId: number): Promise<Rsvp[]> {
    return this.rsvps.filter(r => r.weddingId === weddingId);
  }

  async createRsvp(rsvp: InsertRsvp): Promise<Rsvp> {
    const newRsvp: Rsvp = {
      ...rsvp,
      id: this.rsvps.length + 1,
      createdAt: new Date()
    };
    this.rsvps.push(newRsvp);
    return newRsvp;
  }
}

export const storage = new MemoryStorage();