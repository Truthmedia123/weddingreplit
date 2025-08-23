import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReviewSchema, insertBusinessSubmissionSchema, insertContactSchema } from "@shared/schema";
import { z } from "zod";

import { registerHealthRoutes, metricsMiddleware } from "./health";
import { PerformanceMonitor, createPerformanceMiddleware } from "./monitoring/performance";
import { generateSitemap, generateRobotsTxt } from "./seo/sitemap";
// import { generateVendorJsonLd, generateWebsiteJsonLd } from "./seo/structuredData";
// import { generateVendorMetaTags, generateCategoryMetaTags } from "./seo/metaTags";

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
  app.get("/api/monitoring/performance", (_req, res) => {
    try {
      const stats = performanceMonitor.getStats();
      return res.json(stats);
    } catch (_error) {
      return res.status(500).json({ error: "Failed to get performance stats" });
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
      return res.json(vendors);
    } catch (_error) {
      return res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.get("/api/vendors/featured", async (_req, res) => {
    try {
      const vendors = await storage.getFeaturedVendors();
      return res.json(vendors);
    } catch (_error) {
      return res.status(500).json({ message: "Failed to fetch featured vendors" });
    }
  });

  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vendor = await storage.getVendor(id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      return res.json(vendor);
    } catch (_error) {
      return res.status(500).json({ message: "Failed to fetch vendor" });
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
      return res.status(201).json(newVendor);
    } catch (_error) {
      console.error('Error creating vendor:', _error);
      return res.status(500).json({ error: 'Failed to create vendor' });
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
      return res.json(updatedVendor);
    } catch (_error) {
      console.error('Error updating vendor:', _error);
      return res.status(500).json({ error: 'Failed to update vendor' });
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
      return res.json({ message: 'Vendor deleted successfully' });
    } catch (_error) {
      console.error('Error deleting vendor:', _error);
      return res.status(500).json({ error: 'Failed to delete vendor' });
    }
  });

  // Reviews
  app.get("/api/vendors/:id/reviews", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const reviews = await storage.getVendorReviews(vendorId);
      return res.json(reviews);
    } catch (_error) {
      return res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/vendors/:id/reviews", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const reviewData = insertReviewSchema.parse({ ...req.body, vendorId });
      const review = await storage.createReview(reviewData);
      return res.status(201).json(review);
    } catch (_error) {
      if (_error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: _error.errors });
      }
      return res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      return res.json(categories);
    } catch (_error) {
      return res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      return res.json(category);
    } catch (_error) {
      return res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Blog Posts
  app.get("/api/blog", async (_req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      return res.json(posts);
    } catch (_error) {
      console.error("Blog posts API error:", _error);
      return res.status(500).json({ message: "Failed to fetch blog posts", error: (_error as Error)?.message || "Unknown error" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      return res.json(post);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Business Submissions
  app.post("/api/business-submissions", async (req, res) => {
    try {
      const submissionData = insertBusinessSubmissionSchema.parse(req.body);
      const submission = await storage.createBusinessSubmission(submissionData);
      return res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create business submission" });
    }
  });

  // Contact
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      return res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to send contact message" });
    }
  });

  // Wedding routes
  app.get("/api/weddings", async (_req, res) => {
    try {
      const weddings = await storage.getWeddings();
      return res.json(weddings);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch weddings" });
    }
  });

  app.post("/api/weddings", async (req, res) => {
    try {
      console.log("Wedding creation request body:", req.body);
      
      // Manual validation and transformation for PostgreSQL compatibility
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
      return res.status(201).json(wedding);
    } catch (error) {
      console.error("Wedding creation error:", error);
      return res.status(500).json({ message: "Failed to create wedding", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/weddings/:slug", async (req, res) => {
    try {
      const wedding = await storage.getWedding(req.params.slug);
      if (!wedding) {
        return res.status(404).json({ error: "Wedding not found" });
      }
      return res.json(wedding);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch wedding" });
    }
  });



  app.get("/api/weddings/:id/rsvps", async (req, res) => {
    try {
      const rsvps = await storage.getWeddingRsvps(parseInt(req.params.id));
      return res.json(rsvps);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch RSVPs" });
    }
  });

  app.post("/api/weddings/:id/rsvps", async (req, res) => {
    try {
      const rsvpData = { ...req.body, weddingId: parseInt(req.params.id) };
      const rsvp = await storage.createRsvp(rsvpData);
      return res.json(rsvp);
    } catch (error) {
      return res.status(500).json({ error: "Failed to submit RSVP" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
