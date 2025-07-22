import { db } from "../server/db";
import { vendors, categories, blogPosts, reviews } from "../shared/schema";

async function seed() {
  console.log("Starting database seeding...");

  // Clear existing data
  await db.delete(reviews);
  await db.delete(vendors);
  await db.delete(categories);
  await db.delete(blogPosts);

  // Insert categories with redesigned Lucide icons
  const categoryData = [
    {
      name: "Wedding Photographers",
      slug: "photographers",
      description: "Capture your special moments with professional wedding photographers",
      icon: "Camera",
      color: "from-rose-500 to-pink-600"
    },
    {
      name: "Wedding Venues",
      slug: "venues", 
      description: "Beautiful venues for your dream wedding ceremony",
      icon: "MapPin",
      color: "from-emerald-500 to-teal-600"
    },
    {
      name: "Caterers & Food Services",
      slug: "caterers",
      description: "Delicious Goan cuisine for your wedding celebration",
      icon: "ChefHat",
      color: "from-orange-500 to-red-500"
    },
    {
      name: "Wedding Planners",
      slug: "wedding-planners",
      description: "Expert planners to make your wedding stress-free",
      icon: "Calendar",
      color: "from-purple-500 to-violet-600"
    },
    {
      name: "Makeup & Beauty Artists",
      slug: "makeup-artists",
      description: "Professional bridal makeup and styling services",
      icon: "Sparkles",
      color: "from-pink-500 to-rose-500"
    },
    {
      name: "Live Music & DJs",
      slug: "bands-djs",
      description: "Live music and DJ services for your celebration",
      icon: "Music",
      color: "from-indigo-500 to-purple-600"
    },
    {
      name: "Decor & Florists",
      slug: "decor-florists", 
      description: "Beautiful floral arrangements and wedding decorations",
      icon: "Flower2",
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "Bridal Fashion",
      slug: "bridal-wear",
      description: "Stunning bridal outfits and accessories",
      icon: "Shirt",
      color: "from-fuchsia-500 to-pink-500"
    },
    {
      name: "Wedding Jewelry",
      slug: "jewelry",
      description: "Exquisite jewelry for brides and grooms",
      icon: "Gem",
      color: "from-yellow-500 to-amber-500"
    },
    {
      name: "Transportation & Cars",
      slug: "transportation",
      description: "Luxury cars and transport services for weddings",
      icon: "Car",
      color: "from-slate-500 to-gray-600"
    },
    {
      name: "Wedding Videography",
      slug: "videographers",
      description: "Professional wedding videography and cinematography",
      icon: "Video",
      color: "from-cyan-500 to-blue-600"
    },
    {
      name: "Mehendi Artists",
      slug: "mehendi-artists",
      description: "Traditional and contemporary mehendi designs",
      icon: "Paintbrush",
      color: "from-amber-600 to-orange-600"
    },
    {
      name: "Wedding Cakes & Desserts",
      slug: "cakes-desserts",
      description: "Custom wedding cakes and sweet treats",
      icon: "CakeSlice",
      color: "from-pink-400 to-rose-400"
    },
    {
      name: "Wedding Invitations",
      slug: "invitations",
      description: "Beautiful wedding cards and invitation designs",
      icon: "Mail",
      color: "from-blue-500 to-indigo-500"
    },
    {
      name: "Honeymoon Planners",
      slug: "honeymoon-planners",
      description: "Plan your perfect romantic getaway",
      icon: "Heart",
      color: "from-red-500 to-rose-500"
    },
    {
      name: "Wedding Security",
      slug: "security",
      description: "Professional security services for wedding events",
      icon: "Shield",
      color: "from-gray-600 to-slate-700"
    },
    {
      name: "Priests & Officiants",
      slug: "priests-officiants",
      description: "Wedding ceremonies and religious services",
      icon: "Crown",
      color: "from-yellow-600 to-orange-500"
    },
    {
      name: "Wedding Gifts & Favors",
      slug: "gifts-favors",
      description: "Unique wedding gifts and guest favors",
      icon: "Gift",
      color: "from-teal-500 to-cyan-500"
    },
    {
      name: "Sound & Lighting",
      slug: "sound-lighting",
      description: "Professional audio and lighting equipment",
      icon: "Lightbulb",
      color: "from-yellow-500 to-amber-600"
    },
    {
      name: "Wedding Tents & Canopies",
      slug: "tents-canopies",
      description: "Elegant tent rentals and outdoor setups",
      icon: "Tent",
      color: "from-green-600 to-teal-600"
    }
  ];

  await db.insert(categories).values(categoryData);
  console.log("Categories inserted");

  // Insert sample vendors
  const vendorData = [
    {
      name: "Coastal Dreams Photography",
      slug: "coastal-dreams-photography",
      category: "photographers",
      description: "Specializing in beach weddings and capturing the natural beauty of Goan ceremonies. Our team has over 10 years of experience in wedding photography across North and South Goa.",
      phone: "+91 9876543210",
      email: "info@coastaldreams.com",
      whatsapp: "919876543210",
      location: "North Goa",
      address: "Calangute Beach Road, Calangute, Goa 403516",
      website: "https://coastaldreams.com",
      instagram: "https://instagram.com/coastaldreams",
      facebook: "https://facebook.com/coastaldreams",
      profileImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
      gallery: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      services: ["Wedding Photography", "Pre-wedding Shoots", "Candid Photography", "Traditional Ceremonies"],
      priceRange: "₹75,000 - ₹1,50,000",
      featured: true,
      verified: true,
      rating: "4.8",
      reviewCount: 45
    },
    {
      name: "Paradise Beach Resort",
      slug: "paradise-beach-resort",
      category: "venues",
      description: "Luxury beachfront resort offering stunning wedding venues with panoramic ocean views. Perfect for destination weddings with accommodation for guests.",
      phone: "+91 9876543211",
      email: "weddings@paradisebeach.com",
      whatsapp: "919876543211",
      location: "South Goa",
      address: "Colva Beach, Salcete, Goa 403708",
      website: "https://paradisebeach.com",
      instagram: "https://instagram.com/paradisebeach",
      profileImage: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      coverImage: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
      gallery: [
        "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      services: ["Beach Weddings", "Reception Halls", "Guest Accommodation", "Catering Services"],
      priceRange: "₹2,00,000 - ₹5,00,000",
      featured: true,
      verified: true,
      rating: "4.9",
      reviewCount: 32
    },
    {
      name: "Spice Route Catering",
      slug: "spice-route-catering",
      category: "caterers",
      description: "Authentic Goan cuisine specialists serving traditional dishes with a modern twist. From fish curry rice to bebinca, we bring the flavors of Goa to your celebration.",
      phone: "+91 9876543212",
      email: "bookings@spiceroute.com",
      whatsapp: "919876543212",
      location: "Panaji",
      address: "18th June Road, Panaji, Goa 403001",
      profileImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      services: ["Goan Cuisine", "Vegetarian Menus", "Live Cooking Stations", "Dessert Counters"],
      priceRange: "₹800 - ₹1,500 per person",
      featured: true,
      verified: true,
      rating: "4.7",
      reviewCount: 28
    },
    {
      name: "Elegant Events Goa",
      slug: "elegant-events-goa",
      category: "wedding-planners",
      description: "Full-service wedding planning company specializing in destination weddings in Goa. We handle everything from venue selection to coordination on your special day.",
      phone: "+91 9876543213",
      email: "hello@elegantevents.com",
      whatsapp: "919876543213",
      location: "North Goa",
      address: "Mapusa Market Road, Mapusa, Goa 403507",
      profileImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      services: ["Complete Wedding Planning", "Vendor Coordination", "Day-of Coordination", "Destination Wedding Packages"],
      priceRange: "₹1,00,000 - ₹3,00,000",
      featured: false,
      verified: true,
      rating: "4.6",
      reviewCount: 22
    },
    {
      name: "Radiant Bridal Studio",
      slug: "radiant-bridal-studio",
      category: "makeup-artists",
      description: "Professional bridal makeup and hairstyling services. Our team specializes in both traditional Indian and contemporary bridal looks using premium cosmetics.",
      phone: "+91 9876543214",
      email: "appointments@radiantbridal.com",
      whatsapp: "919876543214",
      location: "Margao",
      address: "Lourdes Complex, Margao, Goa 403601",
      profileImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      services: ["Bridal Makeup", "Hair Styling", "Pre-wedding Shoots", "Family Makeup"],
      priceRange: "₹15,000 - ₹35,000",
      featured: false,
      verified: true,
      rating: "4.5",
      reviewCount: 18
    },
    {
      name: "Sunset Beats",
      slug: "sunset-beats",
      category: "bands-djs",
      description: "Popular DJ and live band services for weddings and events. We play a mix of Bollywood, international hits, and traditional Goan music to keep the celebration alive.",
      phone: "+91 9876543215",
      email: "bookings@sunsetbeats.com",
      whatsapp: "919876543215",
      location: "Anjuna",
      address: "Anjuna Beach Road, Anjuna, Goa 403509",
      profileImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      services: ["DJ Services", "Live Band", "Sound System", "Lighting"],
      priceRange: "₹25,000 - ₹75,000",
      featured: false,
      verified: true,
      rating: "4.4",
      reviewCount: 15
    }
  ];

  await db.insert(vendors).values(vendorData);
  console.log("Vendors inserted");

  // Insert blog posts
  const blogPostData = [
    {
      title: "Top 10 Goan Wedding Trends This Year",
      slug: "top-10-goan-wedding-trends-this-year",
      excerpt: "Discover the latest wedding trends that are defining Goan celebrations this year, from sustainable practices to cultural fusion ceremonies.",
      content: "Full content about wedding trends...",
      author: "Maria D'Souza",
      featuredImage: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      tags: "trends,2024,goan-weddings,beach-weddings",
      published: true
    },
    {
      title: "Planning Your Perfect Beach Wedding in Goa",
      slug: "planning-perfect-beach-wedding-goa",
      excerpt: "A comprehensive guide to planning an unforgettable beach wedding in Goa, including venue selection, permits, and weather considerations.",
      content: "Full content about beach wedding planning...",
      author: "Joaquim Fernandes",
      featuredImage: "https://images.unsplash.com/photo-1520637736862-4d197d17c90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      tags: "beach-wedding,planning,venues,permits",
      published: true
    },
    {
      title: "Traditional Goan Wedding Customs and Rituals",
      slug: "traditional-goan-wedding-customs-rituals",
      excerpt: "Explore the rich cultural heritage of Goan weddings, from Portuguese influences to Hindu traditions that make these celebrations unique.",
      content: "Full content about traditions...",
      author: "Priya Kamat",
      featuredImage: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      tags: "traditions,culture,customs,heritage",
      published: true
    }
  ];

  await db.insert(blogPosts).values(blogPostData);
  console.log("Blog posts inserted");

  // Insert sample reviews
  const reviewData = [
    {
      vendorId: 1,
      customerName: "Priya & Arjun",
      customerEmail: "priya.arjun@email.com",
      rating: 5,
      comment: "Coastal Dreams Photography exceeded our expectations! They captured every emotion beautifully and the beach shots were absolutely stunning. Highly recommended!"
    },
    {
      vendorId: 1,
      customerName: "Maria & Carlos",
      customerEmail: "maria.carlos@email.com",
      rating: 5,
      comment: "Professional team with great attention to detail. The photos came out amazing and they were very accommodating throughout the entire process."
    },
    {
      vendorId: 2,
      customerName: "Rohan & Kavya",
      customerEmail: "rohan.kavya@email.com",
      rating: 5,
      comment: "Paradise Beach Resort provided the perfect setting for our wedding. The staff was incredibly helpful and the venue was breathtaking."
    }
  ];

  // await db.insert(reviews).values(reviewData);
  // console.log("Reviews inserted");

  console.log("Database seeding completed successfully!");
}

seed().catch(console.error);