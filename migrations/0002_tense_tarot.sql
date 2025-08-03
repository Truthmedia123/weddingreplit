CREATE TABLE "rsvps" (
	"id" serial PRIMARY KEY NOT NULL,
	"wedding_id" integer NOT NULL,
	"guest_name" text NOT NULL,
	"guest_email" text NOT NULL,
	"guest_phone" text,
	"attending_ceremony" boolean DEFAULT true,
	"attending_reception" boolean DEFAULT true,
	"number_of_guests" integer DEFAULT 1,
	"dietary_restrictions" text,
	"message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"bride_name" text NOT NULL,
	"groom_name" text NOT NULL,
	"wedding_date" timestamp NOT NULL,
	"venue" text NOT NULL,
	"venue_address" text NOT NULL,
	"nuptials_time" text NOT NULL,
	"reception_time" text,
	"cover_image" text,
	"gallery_images" text[],
	"story" text,
	"slug" text NOT NULL,
	"rsvp_deadline" timestamp,
	"max_guests" integer DEFAULT 100,
	"is_public" boolean DEFAULT true,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE no action ON UPDATE no action;