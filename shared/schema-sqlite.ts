import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vendors = sqliteTable("vendors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  gallery: text("gallery"), // JSON string
  services: text("services"), // JSON string
  priceRange: text("price_range"),
  featured: integer("featured", { mode: "boolean" }).default(false),
  verified: integer("verified", { mode: "boolean" }).default(false),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  image: text("image"),
  vendorCount: integer("vendor_count").default(0),
});

export const blogPosts = sqliteTable("blog_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  featuredImage: text("featured_image"),
  author: text("author").notNull(),
  tags: text("tags"),
  published: integer("published", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const weddings = sqliteTable("weddings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  brideName: text("bride_name").notNull(),
  groomName: text("groom_name").notNull(),
  weddingDate: text("wedding_date").notNull(),
  venue: text("venue").notNull(),
  venueAddress: text("venue_address").notNull(),
  ceremonyTime: text("ceremony_time").notNull(),
  receptionTime: text("reception_time"),
  coverImage: text("cover_image"),
  story: text("story"),
  slug: text("slug").notNull(),
  rsvpDeadline: text("rsvp_deadline"),
  maxGuests: integer("max_guests").default(100),
  isPublic: integer("is_public", { mode: "boolean" }).default(true),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  contactPhone2: text("contact_phone2"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const rsvps = sqliteTable("rsvps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  weddingId: integer("wedding_id").notNull().references(() => weddings.id),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone"),
  attendingCeremony: integer("attending_ceremony", { mode: "boolean" }).default(true),
  attendingReception: integer("attending_reception", { mode: "boolean" }).default(true),
  numberOfGuests: integer("number_of_guests").default(1),
  dietaryRestrictions: text("dietary_restrictions"),
  message: text("message"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});



// Relations
export const vendorsRelations = relations(vendors, ({ many }) => ({
  reviews: many(rsvps), // Simplified for now
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

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  vendorCount: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type Wedding = typeof weddings.$inferSelect;
export type InsertWedding = z.infer<typeof insertWeddingSchema>;
export type Rsvp = typeof rsvps.$inferSelect;
export type InsertRsvp = z.infer<typeof insertRsvpSchema>;

