import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReviewSchema, insertBusinessSubmissionSchema, insertContactSchema, insertWeddingSchema, insertRsvpSchema, insertInvitationTokenSchema } from "@shared/schema";
import { z } from "zod";
import { generateInvitationPDF, downloadInvitation, ensureTempDir } from "./invitationService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Vendors
  app.get("/api/vendors", async (req, res) => {
    try {
      const { category, location, search } = req.query;
      const vendors = await storage.getVendors({
        category: category as string,
        location: location as string,
        search: search as string,
      });
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.get("/api/vendors/featured", async (req, res) => {
    try {
      const vendors = await storage.getFeaturedVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured vendors" });
    }
  });

  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vendor = await storage.getVendor(id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });

  // Reviews
  app.get("/api/vendors/:id/reviews", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const reviews = await storage.getVendorReviews(vendorId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/vendors/:id/reviews", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const reviewData = insertReviewSchema.parse({ ...req.body, vendorId });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Blog Posts
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      res.json(posts);
    } catch (error) {
      console.error("Blog posts API error:", error);
      res.status(500).json({ message: "Failed to fetch blog posts", error: error.message });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Business Submissions
  app.post("/api/business-submissions", async (req, res) => {
    try {
      const submissionData = insertBusinessSubmissionSchema.parse(req.body);
      const submission = await storage.createBusinessSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create business submission" });
    }
  });

  // Contact
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send contact message" });
    }
  });

  // Wedding routes
  app.get("/api/weddings", async (req, res) => {
    try {
      const weddings = await storage.getWeddings();
      res.json(weddings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weddings" });
    }
  });

  app.post("/api/weddings", async (req, res) => {
    try {
      console.log("Wedding creation request body:", req.body);
      
      // Manual validation and transformation
      const { weddingDate, rsvpDeadline, ...rest } = req.body;
      const weddingData = {
        ...rest,
        weddingDate: new Date(weddingDate),
        rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline) : null,
        maxGuests: rest.maxGuests || 100,
        isPublic: rest.isPublic !== false,
      };
      
      console.log("Processed wedding data:", weddingData);
      const wedding = await storage.createWedding(weddingData);
      res.status(201).json(wedding);
    } catch (error) {
      console.error("Wedding creation error:", error);
      res.status(500).json({ message: "Failed to create wedding", error: error.message });
    }
  });

  app.get("/api/weddings/:slug", async (req, res) => {
    try {
      const wedding = await storage.getWedding(req.params.slug);
      if (!wedding) {
        return res.status(404).json({ error: "Wedding not found" });
      }
      res.json(wedding);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wedding" });
    }
  });

  app.post("/api/weddings", async (req, res) => {
    try {
      const wedding = await storage.createWedding(req.body);
      res.json(wedding);
    } catch (error) {
      res.status(500).json({ error: "Failed to create wedding" });
    }
  });

  app.get("/api/weddings/:id/rsvps", async (req, res) => {
    try {
      const rsvps = await storage.getWeddingRsvps(parseInt(req.params.id));
      res.json(rsvps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch RSVPs" });
    }
  });

  app.post("/api/weddings/:id/rsvps", async (req, res) => {
    try {
      const rsvpData = { ...req.body, weddingId: parseInt(req.params.id) };
      const rsvp = await storage.createRsvp(rsvpData);
      res.json(rsvp);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit RSVP" });
    }
  });

  // Wedding Invitation Generator Routes
  app.get("/api/invitation/templates", async (req, res) => {
    try {
      const templates = await storage.getInvitationTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post("/api/invitation/generate", async (req, res) => {
    try {
      const invitationSchema = z.object({
        templateId: z.string(),
        brideName: z.string().min(1),
        groomName: z.string().min(1),
        weddingDate: z.string().min(1),
        venue: z.string().min(1),
        time: z.string().optional(),
        familyMessage: z.string().optional(),
        coupleMessage: z.string().optional(),
      });

      const validatedData = invitationSchema.parse(req.body);

      // Generate invitation PDF with self-destructing download
      const result = await generateInvitationPDF(validatedData.templateId, {
        brideName: validatedData.brideName,
        groomName: validatedData.groomName,
        weddingDate: validatedData.weddingDate,
        venue: validatedData.venue,
        time: validatedData.time,
        familyMessage: validatedData.familyMessage,
        coupleMessage: validatedData.coupleMessage,
      });

      res.json({
        downloadToken: result.downloadToken,
        expiresIn: result.expiresIn,
        downloadUrl: `/api/invitation/download/${result.downloadToken}`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error generating invitation:", error);
      res.status(500).json({ message: "Failed to generate invitation" });
    }
  });

  app.get("/api/invitation/download/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const result = await downloadInvitation(token);
      
      if (!result.success) {
        return res.status(410).json({ message: result.error });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.send(result.data);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Failed to download invitation" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
