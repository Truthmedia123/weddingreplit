import Database from 'better-sqlite3';

const db = new Database('wedding.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    website TEXT,
    instagram TEXT,
    youtube TEXT,
    facebook TEXT,
    profile_image TEXT,
    cover_image TEXT,
    gallery TEXT,
    services TEXT,
    price_range TEXT,
    featured INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    vendor_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    featured_image TEXT,
    author TEXT NOT NULL,
    tags TEXT,
    published INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS weddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bride_name TEXT NOT NULL,
    groom_name TEXT NOT NULL,
    wedding_date TEXT NOT NULL,
    venue TEXT NOT NULL,
    venue_address TEXT NOT NULL,
    ceremony_time TEXT NOT NULL,
    reception_time TEXT,
    cover_image TEXT,
    story TEXT,
    slug TEXT NOT NULL,
    rsvp_deadline TEXT,
    max_guests INTEGER DEFAULT 100,
    is_public INTEGER DEFAULT 1,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    contact_phone2 TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wedding_id INTEGER NOT NULL REFERENCES weddings(id),
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    attending_ceremony INTEGER DEFAULT 1,
    attending_reception INTEGER DEFAULT 1,
    number_of_guests INTEGER DEFAULT 1,
    dietary_restrictions TEXT,
    message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert sample categories
const categories = [
  { name: 'Wedding Photographers', slug: 'photographers', icon: 'Camera', color: '#FF6B6B' },
  { name: 'Wedding Venues', slug: 'venues', icon: 'MapPin', color: '#4ECDC4' },
  { name: 'Catering Services', slug: 'catering', icon: 'ChefHat', color: '#45B7D1' },
  { name: 'Wedding Decorators', slug: 'decorators', icon: 'Palette', color: '#96CEB4' },
  { name: 'Bridal Makeup', slug: 'makeup', icon: 'Sparkles', color: '#FFEAA7' }
];

const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (name, slug, icon, color) 
  VALUES (?, ?, ?, ?)
`);

categories.forEach(cat => {
  insertCategory.run(cat.name, cat.slug, cat.icon, cat.color);
});

// Insert sample vendors
const vendors = [
  {
    name: 'Goa Wedding Photography',
    category: 'Wedding Photographers',
    description: 'Professional wedding photography services in Goa',
    phone: '+91 9876543210',
    email: 'info@goaweddingphoto.com',
    whatsapp: '+91 9876543210',
    location: 'North Goa'
  },
  {
    name: 'Paradise Beach Resort',
    category: 'Wedding Venues',
    description: 'Beautiful beachfront wedding venue',
    phone: '+91 9876543211',
    email: 'bookings@paradisebeach.com',
    whatsapp: '+91 9876543211',
    location: 'South Goa'
  }
];

const insertVendor = db.prepare(`
  INSERT OR IGNORE INTO vendors (name, category, description, phone, email, whatsapp, location) 
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

vendors.forEach(vendor => {
  insertVendor.run(
    vendor.name, 
    vendor.category, 
    vendor.description, 
    vendor.phone, 
    vendor.email, 
    vendor.whatsapp, 
    vendor.location
  );
});

// Insert sample blog posts
const blogPosts = [
  {
    title: 'Planning Your Dream Goan Wedding',
    slug: 'planning-goan-wedding',
    excerpt: 'Everything you need to know about planning a wedding in Goa',
    content: 'Goa offers the perfect backdrop for your dream wedding...',
    author: 'Wedding Expert',
    published: 1
  }
];

const insertBlogPost = db.prepare(`
  INSERT OR IGNORE INTO blog_posts (title, slug, excerpt, content, author, published) 
  VALUES (?, ?, ?, ?, ?, ?)
`);

blogPosts.forEach(post => {
  insertBlogPost.run(post.title, post.slug, post.excerpt, post.content, post.author, post.published);
});

console.log('SQLite database initialized successfully!');
db.close();