import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  location: text("location").notNull(),
  address: text("address"),
  website: text("website"),
  instagram: text("instagram"),
  youtube: text("youtube"),
  facebook: text("facebook"),
  profileImage: text("profile_image"),
  coverImage: text("cover_image"),
  gallery: text("gallery").array(),
  services: text("services").array(),
  priceRange: text("price_range"),
  featured: boolean("featured").default(false),
  verified: boolean("verified").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  images: text("images").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  vendorCount: integer("vendor_count").default(0),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  featuredImage: text("featured_image"),
  author: text("author").notNull(),
  tags: text("tags"),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const businessSubmissions = pgTable("business_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  location: text("location").notNull(),
  address: text("address"),
  website: text("website"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  services: text("services").array(),
  priceRange: text("price_range"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weddings = pgTable("weddings", {
  id: serial("id").primaryKey(),
  brideName: text("bride_name").notNull(),
  groomName: text("groom_name").notNull(),
  weddingDate: timestamp("wedding_date").notNull(),
  venue: text("venue").notNull(),
  venueAddress: text("venue_address").notNull(),
  nuptialsTime: text("nuptials_time").notNull(),
  receptionTime: text("reception_time"),
  coverImage: text("cover_image"),
  story: text("story"),
  slug: text("slug").notNull(),
  rsvpDeadline: timestamp("rsvp_deadline"),
  maxGuests: integer("max_guests").default(100),
  isPublic: boolean("is_public").default(true),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  contactPhone2: text("contact_phone2"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rsvps = pgTable("rsvps", {
  id: serial("id").primaryKey(),
  weddingId: integer("wedding_id").notNull().references(() => weddings.id),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone"),
  attendingCeremony: boolean("attending_ceremony").default(true),
  attendingReception: boolean("attending_reception").default(true),
  numberOfGuests: integer("number_of_guests").default(1),
  dietaryRestrictions: text("dietary_restrictions"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});




// Relations
export const vendorsRelations = relations(vendors, ({ many }) => ({
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  vendor: one(vendors, {
    fields: [reviews.vendorId],
    references: [vendors.id],
  }),
}));

export const weddingsRelations = relations(weddings, ({ many }) => ({
  rsvps: many(rsvps),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
  wedding: one(weddings, {
    fields: [rsvps.weddingId],
    references: [weddings.id],
  }),
}));



// Insert schemas
export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  vendorCount: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessSubmissionSchema = createInsertSchema(businessSubmissions).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertWeddingSchema = createInsertSchema(weddings).omit({
  id: true,
  createdAt: true,
});

export const insertRsvpSchema = createInsertSchema(rsvps).omit({
  id: true,
  createdAt: true,
});




// Types
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BusinessSubmission = typeof businessSubmissions.$inferSelect;
export type InsertBusinessSubmission = z.infer<typeof insertBusinessSubmissionSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Wedding = typeof weddings.$inferSelect;
export type InsertWedding = z.infer<typeof insertWeddingSchema>;
export type Rsvp = typeof rsvps.$inferSelect;
export type InsertRsvp = z.infer<typeof insertRsvpSchema>;


