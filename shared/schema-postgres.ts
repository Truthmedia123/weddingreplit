import { pgTable, text, serial, bigserial, integer, boolean, timestamp, decimal, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Vendors table with proper indexing
export const vendors = pgTable("vendors", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
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
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Indexes for performance
  categoryIdx: index("vendors_category_idx").on(table.category),
  locationIdx: index("vendors_location_idx").on(table.location),
  featuredIdx: index("vendors_featured_idx").on(table.featured),
  verifiedIdx: index("vendors_verified_idx").on(table.verified),
  ratingIdx: index("vendors_rating_idx").on(table.rating),
  nameSearchIdx: index("vendors_name_search_idx").on(table.name),
  emailUniqueIdx: uniqueIndex("vendors_email_unique_idx").on(table.email),
}));

export const reviews = pgTable("reviews", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id, { onDelete: "cascade" }).notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  images: text("images").array(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  vendorIdx: index("reviews_vendor_idx").on(table.vendorId),
  ratingIdx: index("reviews_rating_idx").on(table.rating),
  createdAtIdx: index("reviews_created_at_idx").on(table.createdAt),
}));

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  vendorCount: integer("vendor_count").default(0),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex("categories_slug_idx").on(table.slug),
  featuredIdx: index("categories_featured_idx").on(table.featured),
}));

export const blogPosts = pgTable("blog_posts", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  featuredImage: text("featured_image"),
  author: text("author").notNull(),
  tags: text("tags").array(),
  published: boolean("published").default(false),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex("blog_posts_slug_idx").on(table.slug),
  publishedIdx: index("blog_posts_published_idx").on(table.published),
  createdAtIdx: index("blog_posts_created_at_idx").on(table.createdAt),
}));

export const businessSubmissions = pgTable("business_submissions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
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
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  reviewedBy: text("reviewed_by"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("business_submissions_status_idx").on(table.status),
  categoryIdx: index("business_submissions_category_idx").on(table.category),
  createdAtIdx: index("business_submissions_created_at_idx").on(table.createdAt),
}));

export const contacts = pgTable("contacts", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("unread"), // 'unread', 'read', 'replied'
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  statusIdx: index("contacts_status_idx").on(table.status),
  createdAtIdx: index("contacts_created_at_idx").on(table.createdAt),
}));

export const weddings = pgTable("weddings", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  coupleName: text("couple_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  weddingDate: timestamp("wedding_date").notNull(),
  venue: text("venue").notNull(),
  venueAddress: text("venue_address"),
  nuptialsTime: text("nuptials_time"),
  receptionTime: text("reception_time"),
  coverImage: text("cover_image"),
  story: text("story"),
  slug: text("slug").unique(),
  isPublic: boolean("is_public").default(true),
  guestCount: integer("guest_count"),
  budget: text("budget"),
  theme: text("theme"),
  specialRequests: text("special_requests"),
  status: text("status").default("active"), // 'active', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("weddings_status_idx").on(table.status),
  weddingDateIdx: index("weddings_date_idx").on(table.weddingDate),
  createdAtIdx: index("weddings_created_at_idx").on(table.createdAt),
  slugIdx: uniqueIndex("weddings_slug_idx").on(table.slug),
  isPublicIdx: index("weddings_is_public_idx").on(table.isPublic),
}));

export const rsvps = pgTable("rsvps", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  weddingId: integer("wedding_id").references(() => weddings.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  response: text("response").notNull(), // 'attending', 'not_attending', 'maybe'
  guests: integer("guests").default(1),
  dietaryRestrictions: text("dietary_restrictions"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  weddingIdx: index("rsvps_wedding_idx").on(table.weddingId),
  responseIdx: index("rsvps_response_idx").on(table.response),
  createdAtIdx: index("rsvps_created_at_idx").on(table.createdAt),
}));



// Insert schemas with enhanced validation
export const insertVendorSchema = createInsertSchema(vendors, {
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  whatsapp: z.string().min(10, "WhatsApp number must be at least 10 digits"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  rating: z.string().regex(/^\d+(\.\d{1,2})?$/, "Rating must be a decimal with up to 2 places").optional(),
}).omit({
  id: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews, {
  rating: z.coerce.number().min(1).max(5),
}).omit({
  id: true,
  verified: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  vendorCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessSubmissionSchema = createInsertSchema(businessSubmissions, {
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  whatsapp: z.string().min(10, "WhatsApp number must be at least 10 digits"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
}).omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewNotes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts, {
  email: z.string().email("Invalid email format"),
}).omit({
  id: true,
  status: true,
  respondedAt: true,
  createdAt: true,
});

export const insertWeddingSchema = createInsertSchema(weddings, {
  contactEmail: z.string().email("Invalid email format"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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



// Relations - All defined at the end after tables are initialized
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

