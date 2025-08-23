CREATE TABLE "blog_posts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"image_url" text,
	"featured_image" text,
	"author" text NOT NULL,
	"tags" text[],
	"published" boolean DEFAULT false,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "business_submissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"whatsapp" text NOT NULL,
	"location" text NOT NULL,
	"address" text,
	"website" text,
	"instagram" text,
	"youtube" text,
	"facebook" text,
	"profile_image" text,
	"cover_image" text,
	"gallery" text[],
	"services" text[],
	"price_range" text,
	"status" text DEFAULT 'pending',
	"reviewed_by" text,
	"review_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text NOT NULL,
	"color" text NOT NULL,
	"vendor_count" integer DEFAULT 0,
	"featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'unread',
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"images" text[],
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"wedding_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"response" text NOT NULL,
	"guests" integer DEFAULT 1,
	"dietary_restrictions" text,
	"message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"whatsapp" text NOT NULL,
	"location" text NOT NULL,
	"address" text,
	"website" text,
	"instagram" text,
	"youtube" text,
	"facebook" text,
	"profile_image" text,
	"cover_image" text,
	"gallery" text[],
	"services" text[],
	"price_range" text,
	"featured" boolean DEFAULT false,
	"verified" boolean DEFAULT false,
	"rating" numeric(3, 2) DEFAULT '0.0',
	"review_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weddings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"couple_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"wedding_date" timestamp NOT NULL,
	"venue" text NOT NULL,
	"venue_address" text,
	"nuptials_time" text,
	"reception_time" text,
	"cover_image" text,
	"story" text,
	"slug" text,
	"is_public" boolean DEFAULT true,
	"guest_count" integer,
	"budget" text,
	"theme" text,
	"special_requests" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "weddings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_posts_published_idx" ON "blog_posts" USING btree ("published");--> statement-breakpoint
CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "business_submissions_status_idx" ON "business_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "business_submissions_category_idx" ON "business_submissions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "business_submissions_created_at_idx" ON "business_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_featured_idx" ON "categories" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "contacts_status_idx" ON "contacts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reviews_vendor_idx" ON "reviews" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "reviews_rating_idx" ON "reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rsvps_wedding_idx" ON "rsvps" USING btree ("wedding_id");--> statement-breakpoint
CREATE INDEX "rsvps_response_idx" ON "rsvps" USING btree ("response");--> statement-breakpoint
CREATE INDEX "rsvps_created_at_idx" ON "rsvps" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "vendors_category_idx" ON "vendors" USING btree ("category");--> statement-breakpoint
CREATE INDEX "vendors_location_idx" ON "vendors" USING btree ("location");--> statement-breakpoint
CREATE INDEX "vendors_featured_idx" ON "vendors" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "vendors_verified_idx" ON "vendors" USING btree ("verified");--> statement-breakpoint
CREATE INDEX "vendors_rating_idx" ON "vendors" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "vendors_name_search_idx" ON "vendors" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "vendors_email_unique_idx" ON "vendors" USING btree ("email");--> statement-breakpoint
CREATE INDEX "weddings_status_idx" ON "weddings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "weddings_date_idx" ON "weddings" USING btree ("wedding_date");--> statement-breakpoint
CREATE INDEX "weddings_created_at_idx" ON "weddings" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "weddings_slug_idx" ON "weddings" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "weddings_is_public_idx" ON "weddings" USING btree ("is_public");