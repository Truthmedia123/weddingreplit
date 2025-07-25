import { db } from "./db";
import { categories, blogPosts, vendors, invitationTemplates } from "@shared/schema";

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Seed categories
    const categoryData = [
      {
        name: "Wedding Venues",
        slug: "wedding-venues",
        description: "Beautiful locations for your special day",
        icon: "MapPin",
        color: "from-rose-500 to-pink-500"
      },
      {
        name: "Wedding Photographers",
        slug: "wedding-photographers", 
        description: "Capture your precious moments",
        icon: "Camera",
        color: "from-blue-500 to-indigo-500"
      },
      {
        name: "Wedding Caterers",
        slug: "wedding-caterers",
        description: "Delicious cuisine for your celebration",
        icon: "ChefHat",
        color: "from-green-500 to-emerald-500"
      },
      {
        name: "Wedding Decorators",
        slug: "wedding-decorators",
        description: "Transform your venue into a dream",
        icon: "Sparkles",
        color: "from-purple-500 to-violet-500"
      },
      {
        name: "Bridal Wear",
        slug: "bridal-wear",
        description: "Stunning outfits for the bride",
        icon: "Crown",
        color: "from-pink-500 to-rose-500"
      },
      {
        name: "Groom Wear",
        slug: "groom-wear",
        description: "Elegant attire for the groom",
        icon: "User",
        color: "from-gray-500 to-slate-500"
      },
      {
        name: "Wedding Music & DJ",
        slug: "wedding-music-dj",
        description: "Perfect soundtrack for your day",
        icon: "Music",
        color: "from-yellow-500 to-orange-500"
      },
      {
        name: "Wedding Makeup Artists",
        slug: "wedding-makeup-artists",
        description: "Look your absolute best",
        icon: "Palette",
        color: "from-teal-500 to-cyan-500"
      },
      {
        name: "Wedding Transportation",
        slug: "wedding-transportation",
        description: "Arrive in style",
        icon: "Car",
        color: "from-red-500 to-pink-500"
      },
      {
        name: "Wedding Flowers",
        slug: "wedding-flowers",
        description: "Beautiful floral arrangements",
        icon: "Flower",
        color: "from-green-400 to-lime-500"
      },
      {
        name: "Wedding Cakes",
        slug: "wedding-cakes",
        description: "Sweet endings to your celebration",
        icon: "Cake",
        color: "from-orange-500 to-yellow-500"
      },
      {
        name: "Honeymoon Planning",
        slug: "honeymoon-planning",
        description: "Perfect romantic getaways",
        icon: "Heart",
        color: "from-pink-400 to-rose-500"
      },
      {
        name: "Wedding Jewelry",
        slug: "wedding-jewelry",
        description: "Elegant accessories and jewelry",
        icon: "Gem",
        color: "from-amber-500 to-yellow-600"
      },
      {
        name: "Wedding Videography",
        slug: "wedding-videography",
        description: "Cinematic wedding films",
        icon: "Video",
        color: "from-indigo-500 to-purple-500"
      },
      {
        name: "Wedding Planners",
        slug: "wedding-planners",
        description: "Professional wedding coordination",
        icon: "Calendar",
        color: "from-emerald-500 to-teal-500"
      },
      {
        name: "Pre-Wedding Shoots",
        slug: "pre-wedding-shoots",
        description: "Romantic pre-wedding photography",
        icon: "Heart",
        color: "from-rose-400 to-pink-600"
      },
      {
        name: "Wedding Invitations",
        slug: "wedding-invitations",
        description: "Beautiful invitation designs",
        icon: "Mail",
        color: "from-violet-500 to-purple-600"
      },
      {
        name: "Mehendi Artists",
        slug: "mehendi-artists",
        description: "Intricate henna designs",
        icon: "Brush",
        color: "from-orange-400 to-red-500"
      },
      {
        name: "Wedding Gifts",
        slug: "wedding-gifts",
        description: "Memorable wedding presents",
        icon: "Gift",
        color: "from-cyan-500 to-blue-600"
      },
      {
        name: "Wedding Security",
        slug: "wedding-security",
        description: "Safe and secure celebrations",
        icon: "Shield",
        color: "from-slate-500 to-gray-600"
      }
    ];

    console.log("📦 Seeding categories...");
    for (const category of categoryData) {
      await db.insert(categories).values(category).onConflictDoNothing();
    }

    // Seed blog posts
    const blogData = [
      {
        title: "10 Best Wedding Venues in Goa",
        slug: "best-wedding-venues-goa",
        excerpt: "Discover the most stunning wedding venues in Goa, from beachfront resorts to heritage properties.",
        content: "Goa offers some of the most beautiful wedding venues in India. From stunning beach resorts to charming heritage properties, here are the top 10 venues that will make your special day unforgettable...",
        imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552",
        featuredImage: "https://images.unsplash.com/photo-1519741497674-611481863552",
        author: "Wedding Team",
        tags: "venues, goa, wedding",
        published: true
      },
      {
        title: "Traditional Goan Wedding Customs",
        slug: "traditional-goan-wedding-customs",
        excerpt: "Learn about the rich traditions and customs that make Goan weddings unique and memorable.",
        content: "Goan weddings are a beautiful blend of Portuguese and Indian traditions. From the exchange of rings to the ceremonial coconut breaking, each ritual has deep cultural significance...",
        imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a",
        featuredImage: "https://images.unsplash.com/photo-1583939003579-730e3918a45a",
        author: "Cultural Expert",
        tags: "traditions, culture, goan",
        published: true
      },
      {
        title: "Beach Wedding Planning Guide",
        slug: "beach-wedding-planning-guide", 
        excerpt: "Everything you need to know about planning the perfect beach wedding in Goa.",
        content: "Beach weddings are magical, but they require special planning. From tide schedules to weather considerations, here's your complete guide to planning a beach wedding in Goa...",
        imageUrl: "https://images.unsplash.com/photo-1520637736862-4d197d17c92a",
        featuredImage: "https://images.unsplash.com/photo-1520637736862-4d197d17c92a",
        author: "Wedding Planner",
        tags: "beach, planning, guide",
        published: true
      },
      {
        title: "Goan Wedding Photography Trends",
        slug: "goan-wedding-photography-trends",
        excerpt: "Latest photography trends for capturing your perfect Goan wedding moments.",
        content: "Wedding photography has evolved dramatically. From drone shots over Goan beaches to candid storytelling, discover the latest trends that will make your wedding album extraordinary...",
        imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc",
        featuredImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc",
        author: "Photography Expert",
        tags: "photography, trends, goa",
        published: true
      },
      {
        title: "Authentic Goan Wedding Cuisine",
        slug: "authentic-goan-wedding-cuisine",
        excerpt: "Explore the delicious traditional dishes that make Goan wedding feasts unforgettable.",
        content: "Goan cuisine is a delightful fusion of Portuguese and Indian flavors. From seafood delicacies to traditional sweets, discover the authentic dishes that should be part of your wedding menu...",
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
        featuredImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
        author: "Culinary Expert",
        tags: "cuisine, food, traditional",
        published: true
      }
    ];

    console.log("📰 Seeding blog posts...");
    for (const post of blogData) {
      await db.insert(blogPosts).values(post).onConflictDoNothing();
    }

    // Seed sample vendors
    const vendorData = [
      {
        name: "Paradise Beach Resort",
        category: "wedding-venues",
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
        reviewCount: 45
      },
      {
        name: "Goa Wedding Photography",
        category: "wedding-photographers", 
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
        reviewCount: 62
      },
      {
        name: "Spice Garden Catering",
        category: "wedding-caterers",
        description: "Authentic Goan cuisine and multi-cuisine catering services for weddings with traditional flavors and modern presentation.",
        phone: "+91 832 234 5678",
        email: "orders@spicegardencatering.com",
        whatsapp: "+91 9876543212",
        location: "North Goa",
        address: "Panaji, North Goa",
        website: "https://spicegardencatering.com",
        instagram: "spicegardencatering",
        youtube: "SpiceGardenCatering",
        facebook: "spicegardencatering",
        profileImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
        coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
        gallery: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0"],
        services: ["Goan Cuisine", "Multi-cuisine", "Live Counters", "Dessert Stations"],
        priceRange: "₹800 - ₹2,500 per person",
        featured: true,
        verified: true,
        rating: "4.7",
        reviewCount: 38
      }
    ];

    console.log("🏪 Seeding vendors...");
    for (const vendor of vendorData) {
      await db.insert(vendors).values(vendor).onConflictDoNothing();
    }

    // Seed invitation templates
    const templateData = [
      {
        name: "Save The Date Classic",
        slug: "save-the-date-classic",
        category: "save-the-date",
        description: "Elegant classic save the date design",
        previewImage: "/templates/save-the-date-classic.png",
        pdfFilename: "save-the-date-classic.pdf",
        fieldMapping: {
          "bride_name": { "x": 150, "y": 200, "fontSize": 16 },
          "groom_name": { "x": 150, "y": 220, "fontSize": 16 },
          "wedding_date": { "x": 150, "y": 260, "fontSize": 14 },
          "venue": { "x": 150, "y": 300, "fontSize": 12 }
        },
        isActive: true
      },
      {
        name: "Simple Invitation",
        slug: "simple-invitation",
        category: "wedding-invitation",
        description: "Clean and simple wedding invitation",
        previewImage: "/templates/simple-invitation.png",
        pdfFilename: "simple-invitation.pdf",
        fieldMapping: {
          "bride_name": { "x": 200, "y": 250, "fontSize": 18 },
          "groom_name": { "x": 200, "y": 270, "fontSize": 18 },
          "wedding_date": { "x": 200, "y": 320, "fontSize": 14 },
          "venue": { "x": 200, "y": 350, "fontSize": 12 }
        },
        isActive: true
      }
    ];

    console.log("📄 Seeding invitation templates...");
    for (const template of templateData) {
      await db.insert(invitationTemplates).values(template).onConflictDoNothing();
    }

    console.log("✅ Database seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}