import type { Category, Vendor, BlogPost } from "@shared/schema";

// Fallback data in case JSON files fail to load
const fallbackCategories: Category[] = [
  {
    id: 1,
    name: "Photography & Videography",
    slug: "photography-videography",
    description: "Professional wedding photography and videography",
    icon: "Camera",
    color: "from-indigo-500 to-purple-500",
    vendorCount: 78
  },
  {
    id: 2,
    name: "Wedding Planners & Coordinators",
    slug: "wedding-planners-coordinators",
    description: "Professional wedding planning and coordination",
    icon: "Calendar",
    color: "from-rose-500 to-pink-500",
    vendorCount: 52
  },
  {
    id: 3,
    name: "Catering & Food Services",
    slug: "catering-food-services",
    description: "Professional catering and food services",
    icon: "ChefHat",
    color: "from-orange-500 to-red-500",
    vendorCount: 89
  },
  {
    id: 4,
    name: "Makeup & Beauty Artists",
    slug: "makeup-beauty-artists",
    description: "Professional makeup and beauty services",
    icon: "Sparkles",
    color: "from-pink-500 to-rose-500",
    vendorCount: 67
  },
  {
    id: 5,
    name: "Floral Design & Decorations",
    slug: "floral-design-decorations",
    description: "Wedding flowers and decorative arrangements",
    icon: "Flower2",
    color: "from-green-500 to-emerald-500",
    vendorCount: 56
  },
  {
    id: 6,
    name: "Bands, DJs & Sound Systems",
    slug: "bands-djs-sound-systems",
    description: "Music and entertainment for your wedding",
    icon: "Music",
    color: "from-red-500 to-orange-500",
    vendorCount: 45
  },
  {
    id: 7,
    name: "Bridal Jewelry & Accessories",
    slug: "bridal-jewelry-accessories",
    description: "Wedding jewelry and bridal accessories",
    icon: "Gem",
    color: "from-purple-500 to-indigo-500",
    vendorCount: 42
  },
  {
    id: 8,
    name: "Rental & Equipment Services",
    slug: "rental-equipment-services",
    description: "Wedding equipment and furniture rentals",
    icon: "Recycle",
    color: "from-slate-500 to-gray-500",
    vendorCount: 41
  },
  {
    id: 9,
    name: "Bridal Fashion & Attire",
    slug: "bridal-fashion-attire",
    description: "Wedding dresses, suits, and bridal fashion",
    icon: "Shirt",
    color: "from-pink-500 to-rose-500",
    vendorCount: 67
  },
  {
    id: 10,
    name: "Wedding Venues & Locations",
    slug: "wedding-venues-locations",
    description: "Beautiful venues for your special day",
    icon: "Home",
    color: "from-green-500 to-emerald-500",
    vendorCount: 89
  }
];

const fallbackVendors: Vendor[] = [
  {
    id: 1,
    name: "Goan Beach Photography",
    category: "Photography & Videography",
    description: "Specializing in stunning beach wedding photography with authentic Goan charm",
    location: "Calangute, Goa",
    rating: "4.9",
    reviewCount: 127,
    priceRange: "₹50,000 - ₹2,00,000",
    featured: true,
    verified: true,
    phone: "+91 98765 43210",
    email: "info@goanbeachphoto.com",
    whatsapp: "+91 98765 43210",
    address: "Calangute Beach Road, Goa",
    website: "https://goanbeachphoto.com",
    instagram: "@goanbeachphoto",
    youtube: "@goanbeachphoto",
    facebook: "@goanbeachphoto",
    profileImage: null,
    coverImage: null,
    gallery: [],
    services: ["Wedding Photography", "Videography", "Engagement Shoots"],
    createdAt: new Date()
  },
  {
    id: 2,
    name: "Spice Route Catering",
    category: "Catering & Food Services",
    description: "Authentic Goan cuisine and international dishes for your perfect wedding feast",
    location: "Panaji, Goa",
    rating: "4.8",
    reviewCount: 89,
    priceRange: "₹800 - ₹2,500 per person",
    featured: true,
    verified: true,
    phone: "+91 98765 43211",
    email: "bookings@spiceroutegoa.com",
    whatsapp: "+91 98765 43211",
    address: "Panaji, Goa",
    website: "https://spiceroutegoa.com",
    instagram: "@spiceroutegoa",
    youtube: "@spiceroutegoa",
    facebook: "@spiceroutegoa",
    profileImage: null,
    coverImage: null,
    gallery: [],
    services: ["Wedding Catering", "Corporate Events", "Private Parties"],
    createdAt: new Date()
  },
  {
    id: 3,
    name: "Tropical Blooms Goa",
    category: "Floral Design & Decorations",
    description: "Exquisite floral arrangements using tropical flowers and traditional Goan elements",
    location: "Margao, Goa",
    rating: "4.7",
    reviewCount: 156,
    priceRange: "₹25,000 - ₹1,50,000",
    featured: true,
    verified: true,
    phone: "+91 98765 43212",
    email: "hello@tropicalbloomsgoa.com",
    whatsapp: "+91 98765 43212",
    address: "Margao, Goa",
    website: "https://tropicalbloomsgoa.com",
    instagram: "@tropicalbloomsgoa",
    youtube: "@tropicalbloomsgoa",
    facebook: "@tropicalbloomsgoa",
    profileImage: null,
    coverImage: null,
    gallery: [],
    services: ["Wedding Flowers", "Bridal Bouquets", "Venue Decoration"],
    createdAt: new Date()
  }
];

const fallbackBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Planning Your Perfect Goan Beach Wedding",
    slug: "planning-perfect-goan-beach-wedding",
    excerpt: "Everything you need to know about organizing a stunning beach wedding in Goa",
    content: "Planning a beach wedding in Goa...",
    imageUrl: null,
    featuredImage: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80",
    author: "Wedding Planner",
    tags: null,
    published: true,
    updatedAt: null,
    createdAt: new Date()
  },
  {
    id: 2,
    title: "Traditional Goan Wedding Customs",
    slug: "traditional-goan-wedding-customs",
    excerpt: "Discover the rich traditions and customs of Goan weddings",
    content: "Goan weddings are known for...",
    imageUrl: null,
    featuredImage: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80",
    author: "Wedding Expert",
    tags: null,
    published: true,
    updatedAt: null,
    createdAt: new Date()
  }
];

// Data fetching functions with fallbacks
export async function fetchCategories(): Promise<{categories: Category[]}> {
  try {
    const response = await fetch('/data/categories.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Categories loaded from JSON:', data.categories?.length);
    return data;
  } catch (error) {
    console.warn('⚠️ Failed to load categories from JSON, using fallback:', error);
    return { categories: fallbackCategories };
  }
}

export async function fetchFeaturedVendors(): Promise<{vendors: Vendor[]}> {
  try {
    const response = await fetch('/data/featured-vendors.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Featured vendors loaded from JSON:', data.vendors?.length);
    return data;
  } catch (error) {
    console.warn('⚠️ Failed to load featured vendors from JSON, using fallback:', error);
    return { vendors: fallbackVendors };
  }
}

export async function fetchBlogPosts(): Promise<{posts: BlogPost[]}> {
  try {
    const response = await fetch('/data/blog-posts.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Blog posts loaded from JSON:', data.posts?.length);
    return data;
  } catch (error) {
    console.warn('⚠️ Failed to load blog posts from JSON, using fallback:', error);
    return { posts: fallbackBlogPosts };
  }
}