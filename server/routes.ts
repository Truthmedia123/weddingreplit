import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReviewSchema, insertBusinessSubmissionSchema, insertContactSchema } from "@shared/schema";
import { z } from "zod";
import { generateInvitation, getInvitation } from "./simpleInvitationGenerator";
import type { InvitationData } from "./simpleInvitationGenerator";
import { registerHealthRoutes, metricsMiddleware } from "./health";
import { PerformanceMonitor, createPerformanceMiddleware } from "./monitoring/performance";
import { generateSitemap, generateRobotsTxt } from "./seo/sitemap";
import { generateVendorJsonLd, generateWebsiteJsonLd } from "./seo/structuredData";
import { generateVendorMetaTags, generateCategoryMetaTags } from "./seo/metaTags";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize performance monitoring
  const performanceMonitor = new PerformanceMonitor();
  const performanceMiddleware = createPerformanceMiddleware(performanceMonitor);
  
  // Store performance monitor in app for access in middleware
  app.set('performanceMonitor', performanceMonitor);
  
  // Apply performance tracking middleware globally
  app.use(performanceMiddleware.requestTracker);
  app.use(metricsMiddleware);

  // Register health check endpoints
  registerHealthRoutes(app);
  
  // SEO endpoints
  app.get("/sitemap.xml", generateSitemap);
  app.get("/robots.txt", generateRobotsTxt);
  
  // Performance monitoring endpoint
  app.get("/api/monitoring/performance", (req, res) => {
    try {
      const stats = performanceMonitor.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get performance stats" });
    }
  });

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

  app.get("/api/vendors/featured", async (_req, res) => {
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

  // Vendor CRUD operations
  app.post("/api/vendors", async (req, res) => {
    try {
      const vendorData = req.body;
      
      // Basic validation
      if (!vendorData.name || !vendorData.email || !vendorData.category) {
        return res.status(400).json({ error: 'Missing required fields: name, email, category' });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(vendorData.email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check for duplicate email
      const existingVendor = await storage.getVendorByEmail(vendorData.email);
      if (existingVendor) {
        return res.status(409).json({ error: 'Vendor with this email already exists' });
      }

      const newVendor = await storage.createVendor(vendorData);
      res.status(201).json(newVendor);
    } catch (error) {
      console.error('Error creating vendor:', error);
      res.status(500).json({ error: 'Failed to create vendor' });
    }
  });

  app.put("/api/vendors/:id", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const updateData = req.body;

      // Check if vendor exists
      const existingVendor = await storage.getVendor(vendorId);
      if (!existingVendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      // Email validation if email is being updated
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check for duplicate email (excluding current vendor)
        const duplicateVendor = await storage.getVendorByEmail(updateData.email);
        if (duplicateVendor && duplicateVendor.id !== vendorId) {
          return res.status(409).json({ error: 'Another vendor with this email already exists' });
        }
      }

      const updatedVendor = await storage.updateVendor(vendorId, updateData);
      res.json(updatedVendor);
    } catch (error) {
      console.error('Error updating vendor:', error);
      res.status(500).json({ error: 'Failed to update vendor' });
    }
  });

  app.delete("/api/vendors/:id", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);

      // Check if vendor exists
      const existingVendor = await storage.getVendor(vendorId);
      if (!existingVendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      await storage.deleteVendor(vendorId);
      res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      res.status(500).json({ error: 'Failed to delete vendor' });
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
  app.get("/api/categories", async (_req, res) => {
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
  app.get("/api/blog", async (_req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      res.json(posts);
    } catch (error) {
      console.error("Blog posts API error:", error);
      res.status(500).json({ message: "Failed to fetch blog posts", error: (error as Error)?.message || "Unknown error" });
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
  app.get("/api/weddings", async (_req, res) => {
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
      
      // Manual validation and transformation for SQLite compatibility
      const { weddingDate, rsvpDeadline, ...rest } = req.body;
      const weddingData = {
        ...rest,
        weddingDate: weddingDate ? new Date(weddingDate).toISOString() : null,
        rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline).toISOString() : null,
        maxGuests: rest.maxGuests || 100,
        isPublic: rest.isPublic !== false,
      };
      
      console.log("Processed wedding data:", weddingData);
      const wedding = await storage.createWedding(weddingData);
      res.status(201).json(wedding);
    } catch (error) {
      console.error("Wedding creation error:", error);
      res.status(500).json({ message: "Failed to create wedding", error: error instanceof Error ? error.message : String(error) });
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

  // Wedding Invitation Generator
  app.post("/api/invitation/generate", async (req, res) => {
    try {
      const invitationSchema = z.object({
        bibleVerse: z.string().min(1, "Bible verse is required"),
        bibleReference: z.string().min(1, "Bible reference is required"),
        groomName: z.string().min(1, "Groom's name is required"),
        groomFatherName: z.string().min(1, "Groom's father's name is required"),
        groomMotherName: z.string().min(1, "Groom's mother's name is required"),
        brideName: z.string().min(1, "Bride's name is required"),
        brideFatherName: z.string().min(1, "Bride's father's name is required"),
        brideMotherName: z.string().min(1, "Bride's mother's name is required"),
        ceremonyVenue: z.string().min(1, "Ceremony venue is required"),
        ceremonyDay: z.string().min(1, "Ceremony day is required"),
        ceremonyDate: z.string().min(1, "Ceremony date is required"),
        nuptialsTime: z.string().min(1, "Nuptials time is required"),
        receptionVenue: z.string().min(1, "Reception venue is required"),
        receptionTime: z.string().min(1, "Reception time is required"),
        address1: z.string().min(1, "Address 1 is required"),
        location1: z.string().min(1, "Location 1 is required"),
        contact1: z.string().min(1, "Contact 1 is required"),
        address2: z.string().min(1, "Address 2 is required"),
        location2: z.string().min(1, "Location 2 is required"),
        contact2: z.string().min(1, "Contact 2 is required"),
        qrCodeImage: z.string().optional().default(""), // Optional base64 encoded QR code
      });

      console.log("Received invitation data:", JSON.stringify(req.body, null, 2));
      
      const validatedData = invitationSchema.parse(req.body);
      console.log("Validated invitation data successfully");
      
      const result = await generateInvitation(validatedData as InvitationData);

      res.json({
        downloadToken: result.token,
        filename: result.filename,
        downloadUrl: `/api/invitation/download/${result.token}`,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.code === 'too_small' ? 'empty or too short' : 'invalid'
        }));
        return res.status(400).json({ 
          message: "Invalid invitation data", 
          errors: formattedErrors,
          details: error.errors 
        });
      }
      console.error("Error generating invitation:", error);
      res.status(500).json({ message: "Failed to generate invitation", error: (error as Error).message });
    }
  });

  app.get("/api/invitation/download/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const result = getInvitation(token);

      if (!result) {
        return res.status(410).json({ message: "Invitation not found or expired" });
      }

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      res.send(result.buffer);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Failed to download invitation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
