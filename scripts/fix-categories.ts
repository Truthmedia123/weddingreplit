import { db } from "../server/db";
import { vendors, categories } from "../shared/schema";
import { eq } from "drizzle-orm";

async function fixCategories() {
  console.log("Fixing categories and vendor data...");

  // Clear existing categories
  await db.delete(categories);

  // Insert all 33 comprehensive categories as mentioned in replit.md
  const categoryData = [
    {
      name: "Wedding Photographers",
      slug: "photographers",
      description: "Capture your special moments with professional wedding photographers",
      icon: "fas fa-camera",
      color: "from-red-500 to-red-600"
    },
    {
      name: "Wedding Venues",
      slug: "venues",
      description: "Beautiful venues for your dream wedding ceremony",
      icon: "fas fa-map-marker-alt",
      color: "from-teal-500 to-teal-600"
    },
    {
      name: "Caterers",
      slug: "caterers",
      description: "Delicious Goan cuisine for your wedding celebration",
      icon: "fas fa-utensils",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      name: "Wedding Planners",
      slug: "wedding-planners",
      description: "Expert planners to make your wedding stress-free",
      icon: "fas fa-calendar-alt",
      color: "from-purple-500 to-purple-600"
    },
    {
      name: "Makeup Artists",
      slug: "makeup-artists",
      description: "Professional bridal makeup and styling services",
      icon: "fas fa-palette",
      color: "from-pink-500 to-rose-500"
    },
    {
      name: "Bands & DJs",
      slug: "bands-djs",
      description: "Live music and DJ services for your celebration",
      icon: "fas fa-music",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      name: "Decor & Florists",
      slug: "decor-florists",
      description: "Beautiful floral arrangements and wedding decorations",
      icon: "fas fa-seedling",
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "Bridal Wear",
      slug: "bridal-wear",
      description: "Stunning bridal outfits and accessories",
      icon: "fas fa-tshirt",
      color: "from-rose-500 to-pink-500"
    },
    {
      name: "Groom's Wear",
      slug: "grooms-wear",
      description: "Elegant attire for the groom and groomsmen",
      icon: "fas fa-vest",
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Jewelry",
      slug: "jewelry",
      description: "Traditional and contemporary wedding jewelry",
      icon: "fas fa-gem",
      color: "from-amber-500 to-yellow-500"
    },
    {
      name: "Transportation",
      slug: "transportation",
      description: "Wedding cars, boats, and luxury transport services",
      icon: "fas fa-car",
      color: "from-gray-500 to-gray-600"
    },
    {
      name: "Accommodation",
      slug: "accommodation",
      description: "Hotels and resorts for wedding guests",
      icon: "fas fa-bed",
      color: "from-blue-400 to-blue-500"
    },
    {
      name: "Mehendi Artists",
      slug: "mehendi-artists",
      description: "Traditional henna art for bridal ceremonies",
      icon: "fas fa-hand-sparkles",
      color: "from-orange-500 to-red-500"
    },
    {
      name: "Wedding Cakes & Traditional Bakers",
      slug: "cakes-traditional-bakers",
      description: "Custom wedding cakes and traditional Goan sweets",
      icon: "fas fa-birthday-cake",
      color: "from-pink-400 to-rose-400"
    },
    {
      name: "Invitations & Stationery",
      slug: "invitations-stationery",
      description: "Beautiful wedding invitations and paper goods",
      icon: "fas fa-envelope",
      color: "from-purple-400 to-purple-500"
    },
    {
      name: "Wedding Favors & Gifts",
      slug: "wedding-favors-gifts",
      description: "Memorable gifts and favors for your guests",
      icon: "fas fa-gift",
      color: "from-green-400 to-green-500"
    },
    {
      name: "Fireworks & Special Effects",
      slug: "fireworks-special-effects",
      description: "Spectacular fireworks and lighting effects",
      icon: "fas fa-sparkles",
      color: "from-yellow-400 to-orange-400"
    },
    {
      name: "Wedding Security",
      slug: "wedding-security",
      description: "Professional security services for your event",
      icon: "fas fa-shield-alt",
      color: "from-gray-600 to-gray-700"
    },
    {
      name: "Bar Services",
      slug: "bar-services",
      description: "Professional bartenders and beverage services",
      icon: "fas fa-cocktail",
      color: "from-blue-600 to-indigo-600"
    },
    {
      name: "Wedding Choreographers",
      slug: "wedding-choreographers",
      description: "Dance choreography for your special performances",
      icon: "fas fa-dancing",
      color: "from-pink-600 to-rose-600"
    },
    {
      name: "Live Entertainment",
      slug: "live-entertainment",
      description: "Live performers, dancers, and entertainers",
      icon: "fas fa-masks-theater",
      color: "from-purple-600 to-indigo-600"
    },
    {
      name: "Wedding Officiants",
      slug: "wedding-officiants",
      description: "Priests, pastors, and ceremony officiants",
      icon: "fas fa-praying-hands",
      color: "from-amber-600 to-yellow-600"
    },
    {
      name: "Wedding Stylists",
      slug: "wedding-stylists",
      description: "Professional styling for bride and groom",
      icon: "fas fa-cut",
      color: "from-rose-600 to-pink-600"
    },
    {
      name: "Photobooth & 360° Booth Rentals",
      slug: "photobooth-360-booth-rentals",
      description: "Interactive photo experiences for your guests",
      icon: "fas fa-camera-retro",
      color: "from-cyan-500 to-blue-500"
    },
    {
      name: "Wedding Tent & Canopy Rentals",
      slug: "wedding-tent-canopy-rentals",
      description: "Elegant tents and canopies for outdoor ceremonies",
      icon: "fas fa-campground",
      color: "from-green-600 to-emerald-600"
    },
    {
      name: "Audio Visual Services",
      slug: "audio-visual-services",
      description: "Sound systems, lighting, and AV equipment",
      icon: "fas fa-volume-up",
      color: "from-indigo-600 to-purple-600"
    },
    {
      name: "Wedding Insurance",
      slug: "wedding-insurance",
      description: "Protect your special day with wedding insurance",
      icon: "fas fa-umbrella",
      color: "from-blue-700 to-indigo-700"
    },
    {
      name: "Honeymoon Planners",
      slug: "honeymoon-planners",
      description: "Plan your perfect post-wedding getaway",
      icon: "fas fa-heart",
      color: "from-red-600 to-rose-600"
    },
    {
      name: "Wedding Videographers",
      slug: "wedding-videographers",
      description: "Cinematic wedding films and video services",
      icon: "fas fa-video",
      color: "from-red-700 to-red-800"
    },
    {
      name: "Bridal Salon & Spa",
      slug: "bridal-salon-spa",
      description: "Complete bridal beauty and wellness services",
      icon: "fas fa-spa",
      color: "from-pink-700 to-rose-700"
    },
    {
      name: "Kids Entertainment & Nannies",
      slug: "kids-entertainment-nannies",
      description: "Keep little guests entertained during celebrations",
      icon: "fas fa-child",
      color: "from-yellow-600 to-orange-600"
    },
    {
      name: "Wedding Coordination Services",
      slug: "wedding-coordination-services",
      description: "Day-of coordination and event management",
      icon: "fas fa-tasks",
      color: "from-teal-600 to-cyan-600"
    },
    {
      name: "Religious Ceremony Supplies",
      slug: "religious-ceremony-supplies",
      description: "Sacred items and supplies for religious ceremonies",
      icon: "fas fa-cross",
      color: "from-amber-700 to-yellow-700"
    }
  ];

  await db.insert(categories).values(categoryData);
  console.log("All 33 categories inserted");

  // Update vendor counts for each category
  const allVendors = await db.select().from(vendors);
  
  for (const category of categoryData) {
    const vendorCount = allVendors.filter(vendor => vendor.category === category.slug).length;
    await db.update(categories)
      .set({ vendorCount })
      .where(eq(categories.slug, category.slug));
  }

  console.log("Vendor counts updated for all categories");
  console.log("Categories and vendors fixed successfully!");
}

fixCategories().catch(console.error);