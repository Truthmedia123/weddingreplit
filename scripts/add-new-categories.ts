import { db } from '../server/db';
import { categories } from '../shared/schema';

const newCategories = [
  {
    name: "Bachelor/Bachelorette Party Planners",
    slug: "bachelor-bachelorette-party-planners",
    description: "Professional party planners for unforgettable bachelor and bachelorette celebrations",
    icon: "PartyPopper",
    color: "from-purple-500 to-pink-500",
    vendorCount: 0
  },
  {
    name: "Bands, DJs & Live Music",
    slug: "bands-djs-live-music",
    description: "Live entertainment including bands, DJs, and musical performances",
    icon: "Music",
    color: "from-blue-500 to-purple-500",
    vendorCount: 0
  },
  {
    name: "Bartending & Bar Setup Services",
    slug: "bartending-bar-setup-services",
    description: "Professional bartending and complete bar setup services",
    icon: "Wine",
    color: "from-emerald-500 to-teal-500",
    vendorCount: 0
  },
  {
    name: "Bridal Makeup & Hair Artists",
    slug: "bridal-makeup-hair-artists",
    description: "Expert bridal makeup artists and hair stylists for your special day",
    icon: "Sparkles",
    color: "from-pink-500 to-rose-500",
    vendorCount: 0
  },
  {
    name: "Cake Designers & Confectioners",
    slug: "cake-designers-confectioners",
    description: "Custom wedding cake designers and confectionery specialists",
    icon: "Cake",
    color: "from-yellow-500 to-orange-500",
    vendorCount: 0
  },
  {
    name: "Car & Transport Rentals",
    slug: "car-transport-rentals",
    description: "Wedding transportation and car rental services",
    icon: "Car",
    color: "from-gray-500 to-blue-500",
    vendorCount: 0
  },
  {
    name: "Caterers",
    slug: "caterers",
    description: "Professional catering services for weddings and events",
    icon: "ChefHat",
    color: "from-orange-500 to-red-500",
    vendorCount: 0
  },
  {
    name: "Childcare & Kids Entertainment",
    slug: "childcare-kids-entertainment",
    description: "Professional childcare and entertainment services for young guests",
    icon: "Baby",
    color: "from-cyan-400 to-blue-400",
    vendorCount: 0
  },
  {
    name: "Custom Jewellery Designers",
    slug: "custom-jewellery-designers",
    description: "Bespoke wedding jewelry and custom design services",
    icon: "Gem",
    color: "from-yellow-500 to-amber-500",
    vendorCount: 0
  },
  {
    name: "Decorators & Florists",
    slug: "decorators-florists",
    description: "Wedding decorators and floral arrangement specialists",
    icon: "Flower",
    color: "from-green-500 to-emerald-500",
    vendorCount: 0
  },
  {
    name: "Drone Photography/Videography",
    slug: "drone-photography-videography",
    description: "Aerial drone photography and videography services",
    icon: "Zap",
    color: "from-sky-500 to-blue-500",
    vendorCount: 0
  },
  {
    name: "Eco-friendly Wedding Solutions",
    slug: "eco-friendly-wedding-solutions",
    description: "Sustainable and environmentally conscious wedding planning",
    icon: "Leaf",
    color: "from-green-400 to-emerald-400",
    vendorCount: 0
  },
  {
    name: "Emcees/MCs",
    slug: "emcees-mcs",
    description: "Professional wedding hosts and masters of ceremony",
    icon: "Mic",
    color: "from-indigo-500 to-blue-500",
    vendorCount: 0
  },
  {
    name: "Event Insurance Providers",
    slug: "event-insurance-providers",
    description: "Wedding and event insurance coverage providers",
    icon: "Shield",
    color: "from-slate-500 to-gray-500",
    vendorCount: 0
  },
  {
    name: "Fireworks & Special Effects",
    slug: "fireworks-special-effects",
    description: "Spectacular fireworks displays and special effects",
    icon: "Sparkle",
    color: "from-red-500 to-orange-500",
    vendorCount: 0
  },
  {
    name: "Food Trucks & Specialty Food Stalls",
    slug: "food-trucks-specialty-food-stalls",
    description: "Mobile food trucks and specialty cuisine stalls",
    icon: "Truck",
    color: "from-orange-400 to-red-400",
    vendorCount: 0
  },
  {
    name: "Guest Hospitality & Concierge Services",
    slug: "guest-hospitality-concierge-services",
    description: "Premium guest services and hospitality management",
    icon: "Users",
    color: "from-blue-400 to-indigo-400",
    vendorCount: 0
  },
  {
    name: "Invitations & Printers",
    slug: "invitations-printers",
    description: "Wedding invitation design and printing services",
    icon: "FileText",
    color: "from-indigo-400 to-purple-400",
    vendorCount: 0
  },
  {
    name: "Legal & Documentation Services",
    slug: "legal-documentation-services",
    description: "Marriage documentation and legal services",
    icon: "Scale",
    color: "from-gray-600 to-slate-600",
    vendorCount: 0
  },
  {
    name: "Luxury Car, Vintage Car & Bike Rentals",
    slug: "luxury-vintage-car-bike-rentals",
    description: "Premium luxury, vintage car and bike rental services",
    icon: "Crown",
    color: "from-amber-500 to-yellow-500",
    vendorCount: 0
  },
  {
    name: "Mehendi Artists",
    slug: "mehendi-artists",
    description: "Traditional henna and mehendi artists",
    icon: "Palmtree",
    color: "from-orange-400 to-yellow-400",
    vendorCount: 0
  },
  {
    name: "Mobile Restroom/Vanity Van Rentals",
    slug: "mobile-restroom-vanity-van-rentals",
    description: "Luxury mobile restroom and vanity van rental services",
    icon: "Home",
    color: "from-teal-400 to-cyan-400",
    vendorCount: 0
  },
  {
    name: "On-site Medical/Emergency Services",
    slug: "onsite-medical-emergency-services",
    description: "Professional medical and emergency response services",
    icon: "Heart",
    color: "from-red-400 to-pink-400",
    vendorCount: 0
  },
  {
    name: "Pet Care & Pet Wedding Attire",
    slug: "pet-care-wedding-attire",
    description: "Pet care services and wedding attire for furry family members",
    icon: "Dog",
    color: "from-amber-400 to-orange-400",
    vendorCount: 0
  },
  {
    name: "Pop-up Bars & Mobile Coffee Carts",
    slug: "popup-bars-mobile-coffee-carts",
    description: "Mobile bar setups and specialty coffee cart services",
    icon: "Coffee",
    color: "from-brown-500 to-amber-500",
    vendorCount: 0
  },
  {
    name: "Pre-marital Counselling",
    slug: "pre-marital-counselling",
    description: "Professional pre-marriage counseling and relationship guidance",
    icon: "MessageCircle",
    color: "from-purple-400 to-pink-400",
    vendorCount: 0
  },
  {
    name: "Pre-wedding Shoot Locations & Services",
    slug: "pre-wedding-shoot-locations-services",
    description: "Scenic locations and services for pre-wedding photography",
    icon: "MapPin",
    color: "from-green-500 to-teal-500",
    vendorCount: 0
  },
  {
    name: "Proposal Planners",
    slug: "proposal-planners",
    description: "Romantic proposal planning and coordination services",
    icon: "HeartHandshake",
    color: "from-rose-500 to-pink-500",
    vendorCount: 0
  },
  {
    name: "Return Gifts & Wedding Favors",
    slug: "return-gifts-wedding-favors",
    description: "Unique return gifts and wedding favor solutions",
    icon: "Gift",
    color: "from-red-400 to-pink-400",
    vendorCount: 0
  },
  {
    name: "Sangeet/Choreography Instructors",
    slug: "sangeet-choreography-instructors",
    description: "Professional dance choreographers for sangeet ceremonies",
    icon: "Music2",
    color: "from-pink-500 to-purple-500",
    vendorCount: 0
  },
  {
    name: "Security Services",
    slug: "security-services",
    description: "Professional security services for wedding events",
    icon: "ShieldCheck",
    color: "from-slate-600 to-gray-600",
    vendorCount: 0
  },
  {
    name: "Spa & Wellness Retreats",
    slug: "spa-wellness-retreats",
    description: "Bridal spa treatments and wellness retreat services",
    icon: "Waves",
    color: "from-cyan-300 to-blue-300",
    vendorCount: 0
  },
  {
    name: "Sound & Lighting Providers",
    slug: "sound-lighting-providers",
    description: "Professional audio-visual and lighting equipment providers",
    icon: "Lightbulb",
    color: "from-yellow-400 to-orange-400",
    vendorCount: 0
  },
  {
    name: "Sustainable/Zero Waste Wedding Consultants",
    slug: "sustainable-zero-waste-wedding-consultants",
    description: "Zero waste and sustainable wedding planning consultants",
    icon: "Recycle",
    color: "from-emerald-400 to-green-400",
    vendorCount: 0
  },
  {
    name: "Tailors & Boutiques",
    slug: "tailors-boutiques",
    description: "Wedding attire tailors and bridal boutiques",
    icon: "Scissors",
    color: "from-pink-600 to-red-600",
    vendorCount: 0
  },
  {
    name: "Traditional Goan Folk Performers",
    slug: "traditional-goan-folk-performers",
    description: "Authentic Goan folk music and dance performers",
    icon: "Drama",
    color: "from-amber-500 to-orange-500",
    vendorCount: 0
  },
  {
    name: "Travel Agents (Guest Logistics)",
    slug: "travel-agents-guest-logistics",
    description: "Travel coordination and guest logistics management",
    icon: "Plane",
    color: "from-sky-400 to-blue-400",
    vendorCount: 0
  },
  {
    name: "Venues (Hotels, Resorts, Beach Shacks, Heritage Homes)",
    slug: "venues-hotels-resorts-beach-heritage",
    description: "Wedding venues including hotels, resorts, beaches and heritage properties",
    icon: "Building",
    color: "from-blue-500 to-teal-500",
    vendorCount: 0
  },
  {
    name: "Videographers & Photographers",
    slug: "videographers-photographers",
    description: "Professional wedding photography and videography services",
    icon: "Camera",
    color: "from-purple-500 to-blue-500",
    vendorCount: 0
  },
  {
    name: "Wedding Choirs",
    slug: "wedding-choirs",
    description: "Professional wedding choirs and vocal performances",
    icon: "Music3",
    color: "from-blue-600 to-indigo-600",
    vendorCount: 0
  },
  {
    name: "Wedding Content Creators (Reels, Social Media)",
    slug: "wedding-content-creators-social-media",
    description: "Social media content creators specializing in wedding reels and posts",
    icon: "Smartphone",
    color: "from-violet-500 to-purple-500",
    vendorCount: 0
  },
  {
    name: "Wedding Planners",
    slug: "wedding-planners",
    description: "Full-service wedding planning and coordination professionals",
    icon: "Calendar",
    color: "from-green-500 to-blue-500",
    vendorCount: 0
  },
  {
    name: "Wedding Websites & RSVP Management",
    slug: "wedding-websites-rsvp-management",
    description: "Wedding website creation and RSVP management systems",
    icon: "Globe",
    color: "from-indigo-500 to-purple-500",
    vendorCount: 0
  }
];

async function addCategories() {
  try {
    console.log('Adding new wedding categories...');
    
    // Insert all categories
    const insertedCategories = await db.insert(categories).values(newCategories).returning();
    
    console.log(`Successfully added ${insertedCategories.length} categories:`);
    insertedCategories.forEach(category => {
      console.log(`- ${category.name} (ID: ${category.id})`);
    });
    
    console.log('\nCategories setup complete!');
  } catch (error) {
    console.error('Error adding categories:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

addCategories();