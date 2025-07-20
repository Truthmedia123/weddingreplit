# TheGoanWedding.com Project Documentation

## Overview
A premium wedding vendor directory website for Goa operating as a public directory with vendor information sourced from the internet. Features vendor listings, reviews, blog content, business submission forms, and an elegant RSVP wedding tool. Vendors can request listing additions or removals. Built with React frontend, Node.js backend, and PostgreSQL database. AdSense-compatible with email-only communication.

## Recent Changes
- **2024-06-24**: Resolved database connection issues by implementing stable in-memory storage
- **2024-06-24**: All API endpoints now working correctly (vendors, blog, categories, RSVP)
- **2024-06-24**: Installed Replit CLI for enhanced development capabilities
- **2024-12-25**: Implemented complete wedding RSVP tool with couples pages and guest management
- **2024-12-25**: Added Instagram and YouTube integration for all vendor profiles
- **2024-12-25**: Simplified location filters to North/South Goa only
- **2024-12-25**: Removed search box from homepage hero section
- **2024-12-25**: Enhanced mobile responsiveness across all components
- **2024-12-25**: Upgraded design with Wedify-inspired aesthetics
- **2025-01-05**: Successfully migrated from Replit Agent to Replit environment
- **2025-01-05**: Implemented comprehensive light/dark mode toggle system
- **2025-01-05**: Updated all components with dark mode support and proper theme switching
- **2025-01-05**: Enhanced RSVP system with dynamic page creation and QR code generation
- **2025-01-05**: Added RSVP tracking dashboard for couples to monitor guest responses
- **2025-01-05**: Updated vendor categories to match weddingsdegoa.com with 31 comprehensive categories
- **2025-01-05**: Fixed RSVP creation backend issues - wedding page creation now fully functional
- **2025-01-05**: Successfully completed migration from Replit Agent to Replit environment
- **2025-01-05**: Verified all 31 vendor categories match weddingsdegoa.com competitor structure
- **2025-01-05**: Integrated PostgreSQL database with full data persistence
- **2025-01-05**: Migrated from in-memory storage to DatabaseStorage with Drizzle ORM
- **2025-01-05**: Seeded database with comprehensive vendor, category, and blog data
- **2025-01-05**: Added new unique categories: Photobooth & 360° Booth Rentals, Kids Entertainment & Nannies
- **2025-01-05**: Renamed "Cakes and Confectionery" to "Cakes & Traditional Bakers" for uniqueness
- **2025-01-05**: Updated 19 category names to avoid copy-paste appearance from competitors
- **2025-01-05**: Enhanced CategoryGrid to show limited categories on homepage with "View All" button
- **2025-01-05**: Created dedicated /categories page showing all 33 vendor categories
- **2025-01-05**: Added comprehensive search functionality with magnifying glass icon in header
- **2025-01-05**: Implemented search bar for both desktop and mobile navigation
- **2025-01-05**: Updated navigation to prioritize "Categories" over generic "Vendors" link
- **2025-01-06**: Removed all WhatsApp and phone contact methods, keeping only email communication
- **2025-01-06**: Created comprehensive AdSense-compatible Privacy Policy page
- **2025-01-06**: Created detailed Terms & Conditions page for public directory service
- **2025-01-06**: Created Cookie Policy page with Google AdSense compliance
- **2025-01-06**: Updated all vendor contact forms to use email-only communication
- **2025-01-06**: Updated floating contact button to show email instead of WhatsApp/phone
- **2025-01-06**: Removed phone/WhatsApp fields from business listing submission form
- **2025-07-06**: Successfully migrated project from Replit Agent to Replit environment
- **2025-07-06**: Set up PostgreSQL database with proper schema and sample data
- **2025-07-06**: Removed dark mode system completely at user request (ThemeProvider, ThemeToggle, CSS variables)
- **2025-07-06**: All core functionality verified working with database integration
- **2025-07-06**: Added all 33 wedding vendor categories to database (was only showing 8)
- **2025-07-06**: Fixed blog posts API and database schema compatibility issues
- **2025-07-06**: Completely removed all dark mode classes from all components (CategoryGrid, Categories page, CreateRSVP, TrackRSVP)
- **2025-07-06**: Fixed RSVP creation functionality - added missing database columns and updated schema
- **2025-07-06**: RSVP system now fully operational with wedding page creation and guest management
- **2025-07-06**: Successfully completed project migration from Replit Agent to Replit environment
- **2025-07-06**: Completely removed all dark mode classes from entire codebase as requested
- **2025-07-06**: Removed founder attribution and updated copyright year to 2025
- **2025-07-15**: Enhanced RSVP privacy - guest list details are now hidden in tracking dashboard
- **2025-07-15**: Added image upload functionality to RSVP creation (replaces cover image URL field)
- **2025-07-15**: RSVP system now supports base64 image storage with 5MB limit and validation
- **2025-07-18**: Successfully migrated project from Replit Agent to Replit environment
- **2025-07-18**: Created PostgreSQL database and seeded with wedding vendor categories
- **2025-07-18**: Fixed category icon display issues by replacing Font Awesome with Lucide React icons
- **2025-07-18**: Removed "All Wedding Categories" header text from categories page as requested
- **2025-07-18**: All core functionality verified working with proper database integration
- **2025-07-18**: Successfully completed migration from Replit Agent to Replit environment
- **2025-07-18**: Created PostgreSQL database and seeded with category icons and data
- **2025-07-18**: Fixed category icons display by ensuring Font Awesome icons are properly loaded
- **2025-07-18**: Updated Categories page to remove "All Wedding Categories" heading and description
- **2025-07-18**: Verified all API endpoints working correctly (categories, vendors, blog, RSVP system)
- **2025-07-20**: Added WhatsApp and call functionality to vendor contact system
- **2025-07-20**: Enhanced VendorProfile and VendorCard with WhatsApp, phone, and email contact options
- **2025-07-20**: WhatsApp integration includes pre-filled message "Hi! We got your contact info from TheGoanWedding.com"
- **2025-07-20**: Call functionality opens phone dialer directly when "Call Now" is clicked
- **2025-07-20**: Reverted design system changes per user request, keeping original styling

## Project Architecture

### Database Schema
- **vendors**: Complete vendor information with social media integration (Instagram, YouTube, Facebook)
- **reviews**: Customer reviews and ratings system
- **categories**: Wedding service categories
- **blog_posts**: Content management for wedding blog
- **business_submissions**: Vendor listing applications
- **contacts**: Contact form submissions
- **weddings**: Couples wedding information and details
- **rsvps**: Guest RSVP management system

### Frontend Structure
- React with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Shadcn/UI components with Tailwind CSS
- Mobile-first responsive design

### Backend Structure
- Express.js server
- Drizzle ORM with PostgreSQL
- RESTful API endpoints
- Database storage layer with interface pattern

## Key Features Implemented
1. **Vendor Directory**: Complete vendor listings with categories, reviews, and social media
2. **RSVP Tool**: Wedding invitation pages with guest management system
3. **Blog System**: Content management for wedding-related articles
4. **Business Listings**: Vendor application and submission system
5. **Contact System**: Inquiry and communication management
6. **Social Media Integration**: Instagram and YouTube content display
7. **Mobile Optimization**: Responsive design for all devices
8. **Dark Mode**: Comprehensive light/dark theme toggle with localStorage persistence
9. **Enhanced RSVP System**: Dynamic RSVP page creation with QR codes and guest tracking

## User Preferences
- Wedify-inspired elegant design aesthetic
- Goan cultural elements with coral, sea blue, and gold colors
- Mobile-friendly interface prioritized
- Social media integration for vendor portfolios
- Simplified location filtering (North/South Goa only)
- Clean homepage without search overlay

## Technical Decisions
- PostgreSQL database for production-ready data persistence
- Drizzle ORM for type-safe database operations
- React Query for efficient data fetching and caching
- Shadcn/UI for consistent component library
- Express.js for robust backend API
- TypeScript for type safety across full stack

## Current Status
- All core functionality implemented and operational
- In-memory storage providing stable data persistence
- API endpoints returning data successfully (200 status codes)
- Wedding RSVP tool fully functional with demo data
- Mobile responsiveness optimized across all device sizes
- Social media integration active for vendor profiles
- Replit CLI installed for deployment capabilities
- Application ready for production deployment