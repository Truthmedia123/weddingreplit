import { db } from "./db";
import { categories, vendors, blogPosts, weddings, reviews } from "@shared/schema";

const categoriesData = [
  { name: "Photographers", slug: "photographers", description: "Capture your special moments with professional wedding photographers", icon: "Camera", color: "from-purple-500 to-pink-500" },
  { name: "Videographers", slug: "videographers", description: "Professional wedding videography services", icon: "Video", color: "from-red-500 to-orange-500" },
  { name: "Wedding Planners", slug: "wedding-planners", description: "Professional wedding planning services", icon: "ClipboardList", color: "from-green-500 to-blue-500" },
  { name: "Venues", slug: "venues", description: "Beautiful wedding venues across Goa", icon: "Building", color: "from-blue-500 to-teal-500" },
  { name: "Caterers", slug: "caterers", description: "Delicious catering services for your wedding", icon: "Utensils", color: "from-orange-500 to-red-500" },
  { name: "Decorators", slug: "decorators", description: "Beautiful decorations and floral arrangements", icon: "Flower", color: "from-green-500 to-emerald-500" },
  { name: "Music & Entertainment", slug: "music-entertainment", description: "Live music bands and entertainment for your wedding", icon: "Music", color: "from-blue-500 to-purple-500" },
  { name: "Transportation", slug: "transportation", description: "Wedding car rentals and transportation services", icon: "Car", color: "from-gray-500 to-blue-500" },
];

const vendorsData = [
  {
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
  },
  {
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
  },
  {
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
  },
];

const blogPostsData = [
  {
    title: "Top 10 Goan Wedding Trends This Year",
    slug: "top-10-goan-wedding-trends-this-year",
    excerpt: "Discover the latest wedding trends that are making Goan weddings more beautiful and memorable than ever before.",
    content: "Goa has always been a dream destination for weddings, and this year brings exciting new trends that blend traditional charm with modern elegance. From beach ceremonies to Portuguese-inspired decor, couples are finding innovative ways to celebrate their special day in paradise.",
    author: "Priya Sharma",
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1519741497674-611481863552",
    tags: "weddings,trends,goa,beach weddings",
  },
  {
    title: "Planning Your Perfect Beach Wedding in Goa",
    slug: "planning-perfect-beach-wedding-goa",
    excerpt: "Everything you need to know about organizing a stunning beach wedding in Goa, from permits to perfect timing.",
    content: "Beach weddings in Goa offer an unparalleled romantic setting with golden sands, azure waters, and breathtaking sunsets. This comprehensive guide covers everything from choosing the perfect beach to obtaining necessary permits and timing your ceremony for maximum impact.",
    author: "Raj Verma",
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1520854221256-17451cc331bf",
    tags: "beach wedding,planning,goa,destination wedding",
  },
];

const weddingsData = [
  {
    brideName: "Priya Sharma",
    groomName: "Raj Verma",
    weddingDate: new Date("2024-12-15T16:00:00"),
    venue: "Paradise Beach Resort",
    venueAddress: "Calangute Beach, North Goa",
    ceremonyTime: "4:00 PM",
    receptionTime: "7:00 PM",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552",
    story: "Our love story began five years ago when we met at a college festival in Mumbai. What started as a friendship over shared cups of chai turned into something beautiful. From late-night conversations to exploring the streets of Mumbai together, we knew we had found our perfect match. Now, we invite you to celebrate with us as we begin this new chapter of our lives in the beautiful state of Goa.",
    slug: "priya-raj-2024",
    rsvpDeadline: new Date("2024-12-01T23:59:59"),
    maxGuests: 150,
    isPublic: true,
    contactEmail: "priya.raj.wedding@gmail.com",
    contactPhone: "+91 9876543210",
  },
];

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Clear existing data
    await db.delete(reviews);
    await db.delete(vendors);
    await db.delete(categories);
    await db.delete(blogPosts);
    await db.delete(weddings);

    // Insert categories
    console.log("📂 Inserting categories...");
    await db.insert(categories).values(categoriesData);

    // Insert vendors
    console.log("🏢 Inserting vendors...");
    await db.insert(vendors).values(vendorsData);

    // Insert blog posts
    console.log("📝 Inserting blog posts...");
    await db.insert(blogPosts).values(blogPostsData);

    // Insert weddings
    console.log("💒 Inserting weddings...");
    await db.insert(weddings).values(weddingsData);

    // Add sample reviews
    console.log("⭐ Inserting reviews...");
    const reviewsData = [
      {
        vendorId: 1,
        customerName: "Anita & Rohit",
        customerEmail: "anita.rohit@email.com",
        rating: 5,
        comment: "Absolutely stunning venue! The beach ceremony was magical and the staff was incredibly helpful throughout our wedding.",
        images: [],
      },
      {
        vendorId: 2,
        customerName: "Priya & Raj",
        customerEmail: "priya.raj@email.com",
        rating: 5,
        comment: "Amazing photographers! They captured every moment perfectly. The pre-wedding shoot was fantastic too.",
        images: [],
      },
    ];
    await db.insert(reviews).values(reviewsData);

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}