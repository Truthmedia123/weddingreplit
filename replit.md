# TheGoanWedding.com Project Documentation

## Overview
A premium wedding vendor directory website for Goa featuring vendor listings, reviews, blog content, business submission forms, and an elegant RSVP wedding tool. Built with React frontend, Node.js backend, and PostgreSQL database.

## Recent Changes
- **2024-12-25**: Fixed database query issues causing 500 errors in API endpoints
- **2024-12-25**: Implemented complete wedding RSVP tool with couples pages and guest management
- **2024-12-25**: Added Instagram and YouTube integration for all vendor profiles
- **2024-12-25**: Simplified location filters to North/South Goa only
- **2024-12-25**: Removed search box from homepage hero section
- **2024-12-25**: Enhanced mobile responsiveness across all components
- **2024-12-25**: Upgraded design with Wedify-inspired aesthetics

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
- Database schema fully established with sample data
- API endpoints working correctly after query fixes
- Wedding RSVP tool fully functional with demo data
- Mobile responsiveness optimized
- Social media integration active for vendor profiles