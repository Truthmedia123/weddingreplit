# TheGoanWedding.com Project Documentation

## Overview
TheGoanWedding.com is a premium online directory for wedding vendors in Goa. Its primary purpose is to connect couples planning their weddings with local service providers. Key capabilities include vendor listings with reviews, a comprehensive blog for wedding inspiration, business submission forms for vendors, and an elegant RSVP tool for wedding guests. The platform aims to be a public directory, sourcing vendor information from the internet, and is designed to be AdSense-compatible, relying exclusively on email for communication. The project envisions significant market potential as a central hub for wedding planning in Goa.

## User Preferences
- Wedify-inspired elegant design aesthetic
- Goan cultural elements with coral, sea blue, and gold colors
- Mobile-friendly interface prioritized
- Social media integration for vendor portfolios
- Simplified location filtering (North/South Goa only)
- Clean homepage without search overlay
- All communication should be email-only for both user and vendor interactions.
- Avoid all WhatsApp and phone contact methods.
- No founder attribution.
- The project should not include dark mode functionality.
- Remove "All Wedding Categories" header text from categories page.
- Remove decorative ornamental elements from hero section text.
- Remove category display badges from blog posts on homepage and blog page.
- Remove "View Full Profile" buttons from vendor cards.
- Remove "About" link from navigation header.
- Change "ceremony time" to "nuptials time" in RSVP forms.
- Convert all timing displays to 12-hour format in RSVP system.
- Remove "whose coming" section from guest RSVP page.
- Fix couple name display in track RSVP page (should not show "& 's Wedding").
- Wedding invitation templates and generation functionality should not be present.

## System Architecture

### UI/UX Decisions
The design embraces a Wedify-inspired elegant aesthetic incorporating Goan cultural elements with coral, sea blue, and gold colors. The interface is mobile-first and fully responsive. Category icons use modern Lucide React icons, displayed with gradient backgrounds. The homepage features a clean design without a search overlay, and navigation prioritizes "Categories." Wishlist functionality is implemented using local storage, along with an enhanced search bar featuring autocomplete and popular searches, and advanced filtering options.

### Technical Implementations
The frontend is built with React and TypeScript, utilizing Wouter for client-side routing and TanStack Query for efficient data fetching and caching. Shadcn/UI components are used with Tailwind CSS for a consistent and responsive UI. The backend is an Express.js server, using Drizzle ORM to interact with a PostgreSQL database. The application provides RESTful API endpoints and implements a database storage layer following an interface pattern.

### Feature Specifications
- **Vendor Directory**: Comprehensive listings with 43 categories, reviews, and social media links (Instagram, YouTube). Includes WhatsApp, phone, and email contact options.
- **RSVP Tool**: An elegant wedding RSVP system enabling couples to create personalized wedding pages, manage guest lists, and track responses. Supports image uploads (base64, 5MB limit) for cover images and QR code generation for RSVP integration. Timing displays are in 12-hour format.
- **Blog System**: Content management for wedding-related articles.
- **Business Listings**: Vendors can submit their businesses for listing or request removals via forms.
- **Contact System**: Email-only inquiry and communication management.
- **Search & Filtering**: Enhanced search with autocomplete and advanced filtering by price, rating, and verification.
- **Wishlist**: Zero-login wishlist functionality using local storage.
- **Legal Pages**: Comprehensive AdSense-compatible Privacy Policy, Terms & Conditions, and Cookie Policy pages.

### System Design Choices
- **Database**: PostgreSQL for robust data persistence.
- **ORM**: Drizzle ORM for type-safe database operations.
- **Data Fetching**: React Query for efficient client-side data management.
- **Component Library**: Shadcn/UI for standardized UI components.
- **Backend Framework**: Express.js for scalable API development.
- **Language**: TypeScript for full-stack type safety.
- **Port Configuration**: Backend runs on port 5000 with 0.0.0.0 binding for Replit environment compatibility.
- **CSP & Rate Limiting**: Lenient CSP and rate limiting in development, configured for Replit's environment.

## External Dependencies
- **PostgreSQL**: Primary database for all application data.
- **Instagram API**: For integrating vendor profiles.
- **YouTube API**: For integrating vendor profiles.
- **Google AdSense**: For monetization purposes.
- **Lucide React**: Icon library for UI elements.
- **PDF-lib**: For PDF generation capabilities (if re-enabled).