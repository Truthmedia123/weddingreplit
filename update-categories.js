import Database from 'better-sqlite3';

const db = new Database('wedding.db');

// Clear existing categories
db.prepare('DELETE FROM categories').run();

// New comprehensive categories with proper Lucide React icons
const newCategories = [
  { name: 'Bachelor/Bachelorette Party Planners', slug: 'bachelor-bachelorette-planners', icon: 'PartyPopper', color: 'from-purple-500 to-pink-500' },
  { name: 'Bands, DJs & Live Music', slug: 'bands-djs-music', icon: 'Music', color: 'from-blue-500 to-purple-500' },
  { name: 'Bartending & Bar Setup Services', slug: 'bartending-bar-setup', icon: 'Wine', color: 'from-amber-500 to-orange-500' },
  { name: 'Bridal Makeup & Hair Artists', slug: 'bridal-makeup-hair', icon: 'Sparkles', color: 'from-pink-500 to-rose-500' },
  { name: 'Cake Designers & Confectioners', slug: 'cake-designers', icon: 'Cake', color: 'from-yellow-500 to-pink-500' },
  { name: 'Car & Transport Rentals', slug: 'car-transport-rentals', icon: 'Car', color: 'from-gray-500 to-blue-500' },
  { name: 'Caterers', slug: 'caterers', icon: 'ChefHat', color: 'from-green-500 to-teal-500' },
  { name: 'Childcare & Kids Entertainment', slug: 'childcare-kids-entertainment', icon: 'Baby', color: 'from-cyan-500 to-blue-500' },
  { name: 'Custom Jewellery Designers', slug: 'custom-jewellery', icon: 'Gem', color: 'from-yellow-500 to-amber-500' },
  { name: 'Decorators & Florists', slug: 'decorators-florists', icon: 'Flower2', color: 'from-green-500 to-emerald-500' },
  { name: 'Drone Photography/Videography', slug: 'drone-photography', icon: 'Zap', color: 'from-indigo-500 to-purple-500' },
  { name: 'Eco-friendly Wedding Solutions', slug: 'eco-friendly-solutions', icon: 'Leaf', color: 'from-green-600 to-lime-500' },
  { name: 'Emcees/MCs', slug: 'emcees-mcs', icon: 'Mic', color: 'from-red-500 to-pink-500' },
  { name: 'Event Insurance Providers', slug: 'event-insurance', icon: 'Shield', color: 'from-blue-600 to-indigo-500' },
  { name: 'Fireworks & Special Effects', slug: 'fireworks-effects', icon: 'Star', color: 'from-yellow-500 to-red-500' },
  { name: 'Food Trucks & Specialty Food Stalls', slug: 'food-trucks', icon: 'Truck', color: 'from-orange-500 to-red-500' },
  { name: 'Guest Hospitality & Concierge Services', slug: 'guest-hospitality', icon: 'Users', color: 'from-teal-500 to-cyan-500' },
  { name: 'Invitations & Printers', slug: 'invitations-printers', icon: 'Mail', color: 'from-purple-500 to-indigo-500' },
  { name: 'Legal & Documentation Services', slug: 'legal-documentation', icon: 'FileText', color: 'from-gray-600 to-slate-500' },
  { name: 'Luxury Car, Vintage Car & Bike Rentals', slug: 'luxury-car-rentals', icon: 'Car', color: 'from-gold-500 to-yellow-500' },
  { name: 'Mehendi Artists', slug: 'mehendi-artists', icon: 'Paintbrush', color: 'from-orange-500 to-amber-500' },
  { name: 'Mobile Restroom/Vanity Van Rentals', slug: 'mobile-restroom-rentals', icon: 'Home', color: 'from-blue-500 to-teal-500' },
  { name: 'On-site Medical/Emergency Services', slug: 'medical-emergency', icon: 'Heart', color: 'from-red-500 to-rose-500' },
  { name: 'Pet Care & Pet Wedding Attire', slug: 'pet-care-attire', icon: 'Dog', color: 'from-brown-500 to-amber-500' },
  { name: 'Pop-up Bars & Mobile Coffee Carts', slug: 'popup-bars-coffee', icon: 'Coffee', color: 'from-brown-600 to-orange-500' },
  { name: 'Pre-marital Counselling', slug: 'premarital-counselling', icon: 'Heart', color: 'from-pink-500 to-purple-500' },
  { name: 'Pre-wedding Shoot Locations & Services', slug: 'prewedding-shoot', icon: 'Camera', color: 'from-indigo-500 to-blue-500' },
  { name: 'Proposal Planners', slug: 'proposal-planners', icon: 'Gift', color: 'from-rose-500 to-pink-500' },
  { name: 'Return Gifts & Wedding Favors', slug: 'return-gifts-favors', icon: 'Gift', color: 'from-purple-500 to-pink-500' },
  { name: 'Sangeet/Choreography Instructors', slug: 'sangeet-choreography', icon: 'Music2', color: 'from-yellow-500 to-orange-500' },
  { name: 'Security Services', slug: 'security-services', icon: 'ShieldCheck', color: 'from-gray-600 to-blue-600' },
  { name: 'Spa & Wellness Retreats', slug: 'spa-wellness', icon: 'Sparkles', color: 'from-teal-500 to-green-500' },
  { name: 'Sound & Lighting Providers', slug: 'sound-lighting', icon: 'Volume2', color: 'from-yellow-500 to-red-500' },
  { name: 'Sustainable/Zero Waste Wedding Consultants', slug: 'sustainable-consultants', icon: 'Recycle', color: 'from-green-600 to-emerald-500' },
  { name: 'Tailors & Boutiques', slug: 'tailors-boutiques', icon: 'Shirt', color: 'from-indigo-500 to-purple-500' },
  { name: 'Traditional Goan Folk Performers', slug: 'goan-folk-performers', icon: 'Music', color: 'from-orange-500 to-red-500' },
  { name: 'Travel Agents (Guest Logistics)', slug: 'travel-agents', icon: 'Plane', color: 'from-sky-500 to-blue-500' },
  { name: 'Venues (Hotels, Resorts, Beach Shacks, Heritage Homes)', slug: 'venues', icon: 'Building', color: 'from-teal-500 to-cyan-500' },
  { name: 'Videographers & Photographers', slug: 'videographers-photographers', icon: 'Video', color: 'from-purple-500 to-indigo-500' },
  { name: 'Wedding Choirs', slug: 'wedding-choirs', icon: 'Users', color: 'from-blue-500 to-purple-500' },
  { name: 'Wedding Content Creators (Reels, Social Media)', slug: 'content-creators', icon: 'Smartphone', color: 'from-pink-500 to-purple-500' },
  { name: 'Wedding Planners', slug: 'wedding-planners', icon: 'Calendar', color: 'from-rose-500 to-red-500' },
  { name: 'Wedding Websites & RSVP Management', slug: 'wedding-websites-rsvp', icon: 'Globe', color: 'from-blue-500 to-indigo-500' }
];

// Insert new categories
const insertCategory = db.prepare(`
  INSERT INTO categories (name, slug, icon, color) 
  VALUES (?, ?, ?, ?)
`);

newCategories.forEach(cat => {
  insertCategory.run(cat.name, cat.slug, cat.icon, cat.color);
});

console.log(`Successfully added ${newCategories.length} new categories!`);
db.close();