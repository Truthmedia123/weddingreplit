import { vendors, reviews, categories, blogPosts, businessSubmissions, contacts, weddings, rsvps } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, or, ilike } from "drizzle-orm";
import type { 
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
      category: "photographers", 
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
      category: "caterers",
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
    { id: 1, name: "Photographers", slug: "photographers", description: "Capture your special moments with professional wedding photographers", icon: "fas fa-camera", color: "from-purple-500 to-pink-500", vendorCount: 74 },
    { id: 2, name: "Salons and Makeup Artists", slug: "salons-makeup-artists", description: "Professional bridal makeup and beauty services", icon: "fas fa-palette", color: "from-pink-500 to-rose-500", vendorCount: 87 },
    { id: 3, name: "Cakes and Confectionery", slug: "cakes-confectionery", description: "Delicious wedding cakes and sweet treats", icon: "fas fa-birthday-cake", color: "from-yellow-500 to-orange-500", vendorCount: 65 },
    { id: 4, name: "Bands", slug: "bands", description: "Live music bands for your wedding celebration", icon: "fas fa-music", color: "from-blue-500 to-purple-500", vendorCount: 64 },
    { id: 5, name: "Bridal Accessories", slug: "bridal-accessories", description: "Beautiful accessories and jewelry for the bride", icon: "fas fa-gem", color: "from-pink-400 to-red-400", vendorCount: 54 },
    { id: 6, name: "Emcee", slug: "emcee", description: "Professional wedding hosts and masters of ceremony", icon: "fas fa-microphone", color: "from-indigo-500 to-blue-500", vendorCount: 49 },
    { id: 7, name: "Caterers", slug: "caterers", description: "Delicious catering services for your wedding", icon: "fas fa-utensils", color: "from-orange-500 to-red-500", vendorCount: 45 },
    { id: 8, name: "Decorators", slug: "decorators", description: "Beautiful decorations and floral arrangements", icon: "fas fa-seedling", color: "from-green-500 to-emerald-500", vendorCount: 42 },
    { id: 9, name: "Venues", slug: "venues", description: "Beautiful wedding venues across Goa", icon: "fas fa-building", color: "from-blue-500 to-teal-500", vendorCount: 40 },
    { id: 10, name: "Designers", slug: "designers", description: "Fashion designers and wedding attire", icon: "fas fa-tshirt", color: "from-purple-400 to-pink-400", vendorCount: 34 },
    { id: 11, name: "Wedding Planners", slug: "wedding-planners", description: "Professional wedding planning services", icon: "fas fa-clipboard-list", color: "from-green-500 to-blue-500", vendorCount: 31 },
    { id: 12, name: "Car Rentals", slug: "car-rentals", description: "Wedding car rentals and transportation services", icon: "fas fa-car", color: "from-gray-500 to-blue-500", vendorCount: 30 },
    { id: 13, name: "Gifts and Favours", slug: "gifts-favours", description: "Wedding gifts and party favors", icon: "fas fa-gift", color: "from-red-400 to-pink-400", vendorCount: 28 },
    { id: 14, name: "Professional Services", slug: "professional-services", description: "Other professional wedding services", icon: "fas fa-briefcase", color: "from-gray-600 to-blue-600", vendorCount: 28 },
    { id: 15, name: "Videographers", slug: "videographers", description: "Professional wedding videography services", icon: "fas fa-video", color: "from-red-500 to-orange-500", vendorCount: 27 },
    { id: 16, name: "Entertainers & One Man Band", slug: "entertainers-one-man-band", description: "Wedding entertainers and solo performers", icon: "fas fa-guitar", color: "from-yellow-600 to-red-600", vendorCount: 25 },
    { id: 17, name: "Bar Services", slug: "bar-services", description: "Cocktails and bar services for your wedding", icon: "fas fa-cocktail", color: "from-blue-400 to-green-400", vendorCount: 23 },
    { id: 18, name: "Mehendi Artists", slug: "mehendi-artists", description: "Traditional henna and mehendi artists", icon: "fas fa-hand-sparkles", color: "from-orange-400 to-yellow-400", vendorCount: 18 },
    { id: 19, name: "Jewellery", slug: "jewellery", description: "Wedding jewelry and precious accessories", icon: "fas fa-ring", color: "from-yellow-500 to-amber-500", vendorCount: 16 },
    { id: 20, name: "DJ", slug: "dj", description: "Professional wedding DJs and music services", icon: "fas fa-headphones", color: "from-purple-600 to-blue-600", vendorCount: 16 },
    { id: 21, name: "Designers and Printers", slug: "designers-printers", description: "Wedding card designers and printers", icon: "fas fa-print", color: "from-indigo-400 to-purple-400", vendorCount: 15 },
    { id: 22, name: "Tailors and Boutiques", slug: "tailors-boutiques", description: "Wedding attire tailors and boutiques", icon: "fas fa-cut", color: "from-pink-600 to-red-600", vendorCount: 14 },
    { id: 23, name: "Choirs", slug: "choirs", description: "Wedding choirs and vocal performances", icon: "fas fa-users", color: "from-blue-600 to-indigo-600", vendorCount: 11 },
    { id: 24, name: "Stays and Hotels", slug: "stays-hotels", description: "Wedding accommodation and guest stays", icon: "fas fa-bed", color: "from-teal-500 to-green-500", vendorCount: 10 },
    { id: 25, name: "Florist", slug: "florist", description: "Beautiful wedding flowers and arrangements", icon: "fas fa-leaf", color: "from-green-400 to-teal-400", vendorCount: 8 },
    { id: 26, name: "Sound and Lighting", slug: "sound-lighting", description: "Professional sound and lighting services", icon: "fas fa-lightbulb", color: "from-yellow-400 to-orange-400", vendorCount: 8 },
    { id: 27, name: "Roce Bands & Wedding Traditions", slug: "roce-bands-traditions", description: "Traditional Goan wedding ceremonies and bands", icon: "fas fa-drum", color: "from-amber-500 to-orange-500", vendorCount: 8 },
    { id: 28, name: "Choreographers", slug: "choreographers", description: "Wedding dance choreographers and instructors", icon: "fas fa-running", color: "from-pink-500 to-purple-500", vendorCount: 7 },
    { id: 29, name: "Resorts", slug: "resorts", description: "Wedding resorts and destination venues", icon: "fas fa-umbrella-beach", color: "from-cyan-500 to-blue-500", vendorCount: 6 },
    { id: 30, name: "Salons and Spa", slug: "salons-spa", description: "Bridal spa and wellness services", icon: "fas fa-spa", color: "from-green-300 to-blue-300", vendorCount: 3 },
    { id: 31, name: "Restaurants", slug: "restaurants", description: "Wedding dinner venues and restaurants", icon: "fas fa-utensils", color: "from-red-400 to-orange-400", vendorCount: 1 }
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

export class DatabaseStorage implements IStorage {
  async getVendors(filters: { category?: string; location?: string; search?: string }): Promise<Vendor[]> {
    let query = db.select().from(vendors);
    
    if (filters.category) {
      query = query.where(eq(vendors.category, filters.category));
    }
    if (filters.location) {
      query = query.where(eq(vendors.location, filters.location));
    }
    if (filters.search) {
      query = query.where(
        or(
          ilike(vendors.name, `%${filters.search}%`),
          ilike(vendors.description, `%${filters.search}%`)
        )
      );
    }
    
    return await query;
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async getFeaturedVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).where(eq(vendors.featured, true));
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async getVendorReviews(vendorId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.vendorId, vendorId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async getBlogPosts(published?: boolean): Promise<BlogPost[]> {
    if (published !== undefined) {
      return await db.select().from(blogPosts).where(eq(blogPosts.published, published)).orderBy(desc(blogPosts.createdAt));
    }
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async createBusinessSubmission(submission: InsertBusinessSubmission): Promise<BusinessSubmission> {
    const [newSubmission] = await db.insert(businessSubmissions).values(submission).returning();
    return newSubmission;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async getWeddings(): Promise<Wedding[]> {
    return await db.select().from(weddings);
  }

  async getWedding(slug: string): Promise<Wedding | undefined> {
    const [wedding] = await db.select().from(weddings).where(eq(weddings.slug, slug));
    return wedding || undefined;
  }

  async createWedding(wedding: InsertWedding): Promise<Wedding> {
    const [newWedding] = await db.insert(weddings).values(wedding).returning();
    return newWedding;
  }

  async getWeddingRsvps(weddingId: number): Promise<Rsvp[]> {
    return await db.select().from(rsvps).where(eq(rsvps.weddingId, weddingId));
  }

  async createRsvp(rsvp: InsertRsvp): Promise<Rsvp> {
    const [newRsvp] = await db.insert(rsvps).values(rsvp).returning();
    return newRsvp;
  }
}

export const storage = new DatabaseStorage();