# TheGoanWedding.com Project Documentation

## Overview
A premium wedding vendor directory website for Goa featuring vendor listings, reviews, blog content, business submission forms, and an elegant RSVP wedding tool. Built with React frontend, Node.js backend, and PostgreSQL database.

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