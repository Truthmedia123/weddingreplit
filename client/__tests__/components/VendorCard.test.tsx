import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import VendorCard from '../../src/components/VendorCard';
import { createMockVendor } from '../utils/test-utils';

// Mock the hooks and external dependencies
jest.mock('@/hooks/use-wishlist', () => ({
  useWishlist: () => ({
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    isInWishlist: jest.fn(() => false),
  }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the OptimizedImage component
jest.mock('@/components/OptimizedImage', () => {
  return function MockOptimizedImage({ src, alt, className }: any) {
    return <img src={src} alt={alt} className={className} data-testid="optimized-image" />;
  };
});

// Mock navigator.share and navigator.clipboard
Object.assign(navigator, {
  share: jest.fn(),
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('VendorCard Component - Comprehensive Snapshot Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('✅ Basic Vendor Card Snapshots', () => {
    it('renders basic vendor card with all standard fields', () => {
      const mockVendor = createMockVendor({
        name: 'Elite Photography Studio',
        category: 'Photography',
        location: 'Mumbai',
        rating: 4.8,
        reviewCount: 150,
        description: 'Professional wedding photography with artistic flair and modern techniques',
        priceRange: '₹1,00,000 - ₹2,00,000',
        featured: false,
        verified: true,
      });

      const { container } = render(<VendorCard vendor={mockVendor} />);
      expect(container.firstChild).toMatchSnapshot('basic-vendor-card');
    });

    it('renders minimal vendor card with required fields only', () => {
      const minimalVendor = createMockVendor({
        name: 'Minimal Vendor',
        category: 'Catering',
        location: 'Delhi',
        rating: 4.0,
        reviewCount: 10,
        description: 'Basic catering services',
        phone: undefined,
        whatsapp: undefined,
        email: undefined,
        website: undefined,
        instagram: undefined,
        priceRange: undefined,
        featured: false,
        verified: false,
      });

      const { container } = render(<VendorCard vendor={minimalVendor} />);
      expect(container.firstChild).toMatchSnapshot('minimal-vendor-card');
    });

    it('renders vendor card with long text content', () => {
      const longContentVendor = createMockVendor({
        name: 'Very Long Business Name That Might Wrap to Multiple Lines in the Card Layout',
        category: 'Wedding Planning & Coordination Services',
        location: 'Panaji, North Goa, Goa',
        description: 'We are a comprehensive wedding planning service that specializes in creating unforgettable experiences for couples. Our team of experienced professionals handles everything from venue selection to catering coordination, decoration setup, photography arrangements, and guest management. We pride ourselves on attention to detail and ensuring every aspect of your special day is perfect.',
        priceRange: '₹5,00,000 - ₹15,00,000 (Full Wedding Package)',
        services: 'Complete Wedding Planning, Venue Booking, Catering Coordination, Decoration Setup, Photography & Videography Arrangement, Guest Management, Transportation, Accommodation Booking',
      });

      const { container } = render(<VendorCard vendor={longContentVendor} />);
      expect(container.firstChild).toMatchSnapshot('long-content-vendor-card');
    });
  });

  describe('✅ Featured and Verified Status Snapshots', () => {
    it('renders featured vendor card with featured badge', () => {
      const featuredVendor = createMockVendor({
        name: 'Featured Photography Studio',
        category: 'Photography',
        featured: true,
        verified: false,
        rating: 4.9,
        reviewCount: 200,
      });

      const { container } = render(<VendorCard vendor={featuredVendor} />);
      expect(container.firstChild).toMatchSnapshot('featured-vendor-card');
    });

    it('renders verified vendor card with verified badge', () => {
      const verifiedVendor = createMockVendor({
        name: 'Verified Catering Service',
        category: 'Catering',
        featured: false,
        verified: true,
        rating: 4.7,
        reviewCount: 85,
      });

      const { container } = render(<VendorCard vendor={verifiedVendor} />);
      expect(container.firstChild).toMatchSnapshot('verified-vendor-card');
    });

    it('renders premium vendor card with both featured and verified badges', () => {
      const premiumVendor = createMockVendor({
        name: 'Premium Wedding Planners',
        category: 'Wedding Planning',
        featured: true,
        verified: true,
        rating: 5.0,
        reviewCount: 300,
        priceRange: '₹10,00,000+',
      });

      const { container } = render(<VendorCard vendor={premiumVendor} />);
      expect(container.firstChild).toMatchSnapshot('premium-vendor-card');
    });

    it('renders basic vendor card without any badges', () => {
      const basicVendor = createMockVendor({
        name: 'Basic Decoration Service',
        category: 'Decoration',
        featured: false,
        verified: false,
        rating: 3.8,
        reviewCount: 15,
      });

      const { container } = render(<VendorCard vendor={basicVendor} />);
      expect(container.firstChild).toMatchSnapshot('basic-no-badges-vendor-card');
    });
  });

  describe('✅ Different Categories Snapshots', () => {
    it('renders photography vendor card', () => {
      const photographyVendor = createMockVendor({
        name: 'Artistic Photography',
        category: 'Photography',
        description: 'Candid wedding photography with modern techniques',
        services: 'Wedding Photography, Pre-wedding Shoots, Drone Photography',
        priceRange: '₹75,000 - ₹1,25,000',
      });

      const { container } = render(<VendorCard vendor={photographyVendor} />);
      expect(container.firstChild).toMatchSnapshot('photography-vendor-card');
    });

    it('renders catering vendor card', () => {
      const cateringVendor = createMockVendor({
        name: 'Royal Catering Services',
        category: 'Catering',
        description: 'Premium wedding catering with authentic Indian cuisine',
        services: 'Wedding Catering, Menu Planning, Live Counters',
        priceRange: '₹800 - ₹1,500 per plate',
      });

      const { container } = render(<VendorCard vendor={cateringVendor} />);
      expect(container.firstChild).toMatchSnapshot('catering-vendor-card');
    });

    it('renders decoration vendor card', () => {
      const decorationVendor = createMockVendor({
        name: 'Dream Decorators',
        category: 'Decoration',
        description: 'Creative wedding decoration and event styling',
        services: 'Wedding Decoration, Floral Arrangements, Stage Setup',
        priceRange: '₹50,000 - ₹1,50,000',
      });

      const { container } = render(<VendorCard vendor={decorationVendor} />);
      expect(container.firstChild).toMatchSnapshot('decoration-vendor-card');
    });

    it('renders music and DJ vendor card', () => {
      const musicVendor = createMockVendor({
        name: 'Melody Music & DJ',
        category: 'Music & DJ',
        description: 'Professional DJ services and live music for weddings',
        services: 'DJ Services, Live Music, Sound System, Lighting',
        priceRange: '₹25,000 - ₹75,000',
      });

      const { container } = render(<VendorCard vendor={musicVendor} />);
      expect(container.firstChild).toMatchSnapshot('music-dj-vendor-card');
    });

    it('renders wedding planning vendor card', () => {
      const planningVendor = createMockVendor({
        name: 'Perfect Wedding Planners',
        category: 'Wedding Planning',
        description: 'Complete wedding planning and coordination services',
        services: 'Full Wedding Planning, Venue Booking, Vendor Coordination',
        priceRange: '₹2,00,000 - ₹5,00,000',
      });

      const { container } = render(<VendorCard vendor={planningVendor} />);
      expect(container.firstChild).toMatchSnapshot('wedding-planning-vendor-card');
    });
  });

  describe('✅ Rating and Review Variations Snapshots', () => {
    it('renders vendor card with perfect rating', () => {
      const perfectRatingVendor = createMockVendor({
        name: 'Perfect Service Provider',
        rating: 5.0,
        reviewCount: 100,
      });

      const { container } = render(<VendorCard vendor={perfectRatingVendor} />);
      expect(container.firstChild).toMatchSnapshot('perfect-rating-vendor-card');
    });

    it('renders vendor card with low rating', () => {
      const lowRatingVendor = createMockVendor({
        name: 'Budget Service Provider',
        rating: 3.2,
        reviewCount: 8,
      });

      const { container } = render(<VendorCard vendor={lowRatingVendor} />);
      expect(container.firstChild).toMatchSnapshot('low-rating-vendor-card');
    });

    it('renders vendor card with high review count', () => {
      const highReviewVendor = createMockVendor({
        name: 'Popular Service Provider',
        rating: 4.6,
        reviewCount: 1250,
      });

      const { container } = render(<VendorCard vendor={highReviewVendor} />);
      expect(container.firstChild).toMatchSnapshot('high-review-count-vendor-card');
    });

    it('renders vendor card with single review', () => {
      const singleReviewVendor = createMockVendor({
        name: 'New Service Provider',
        rating: 4.0,
        reviewCount: 1,
      });

      const { container } = render(<VendorCard vendor={singleReviewVendor} />);
      expect(container.firstChild).toMatchSnapshot('single-review-vendor-card');
    });
  });

  describe('✅ Contact Options Variations Snapshots', () => {
    it('renders vendor card with all contact options', () => {
      const fullContactVendor = createMockVendor({
        name: 'Full Contact Vendor',
        phone: '+91-9876543210',
        whatsapp: '+91-9876543210',
        email: 'contact@fullcontact.com',
        website: 'https://fullcontact.com',
        instagram: '@fullcontact',
      });

      const { container } = render(<VendorCard vendor={fullContactVendor} />);
      expect(container.firstChild).toMatchSnapshot('full-contact-vendor-card');
    });

    it('renders vendor card with phone only', () => {
      const phoneOnlyVendor = createMockVendor({
        name: 'Phone Only Vendor',
        phone: '+91-9876543210',
        whatsapp: undefined,
        email: undefined,
        website: undefined,
        instagram: undefined,
      });

      const { container } = render(<VendorCard vendor={phoneOnlyVendor} />);
      expect(container.firstChild).toMatchSnapshot('phone-only-vendor-card');
    });

    it('renders vendor card with WhatsApp only', () => {
      const whatsappOnlyVendor = createMockVendor({
        name: 'WhatsApp Only Vendor',
        phone: undefined,
        whatsapp: '+91-9876543210',
        email: undefined,
        website: undefined,
        instagram: undefined,
      });

      const { container } = render(<VendorCard vendor={whatsappOnlyVendor} />);
      expect(container.firstChild).toMatchSnapshot('whatsapp-only-vendor-card');
    });

    it('renders vendor card with email only', () => {
      const emailOnlyVendor = createMockVendor({
        name: 'Email Only Vendor',
        phone: undefined,
        whatsapp: undefined,
        email: 'contact@emailonly.com',
        website: undefined,
        instagram: undefined,
      });

      const { container } = render(<VendorCard vendor={emailOnlyVendor} />);
      expect(container.firstChild).toMatchSnapshot('email-only-vendor-card');
    });

    it('renders vendor card with no contact options', () => {
      const noContactVendor = createMockVendor({
        name: 'No Contact Vendor',
        phone: undefined,
        whatsapp: undefined,
        email: undefined,
        website: undefined,
        instagram: undefined,
      });

      const { container } = render(<VendorCard vendor={noContactVendor} />);
      expect(container.firstChild).toMatchSnapshot('no-contact-vendor-card');
    });
  });

  describe('✅ Price Range Variations Snapshots', () => {
    it('renders vendor card with budget price range', () => {
      const budgetVendor = createMockVendor({
        name: 'Budget Friendly Service',
        priceRange: '₹10,000 - ₹25,000',
        category: 'Photography',
      });

      const { container } = render(<VendorCard vendor={budgetVendor} />);
      expect(container.firstChild).toMatchSnapshot('budget-price-vendor-card');
    });

    it('renders vendor card with premium price range', () => {
      const premiumVendor = createMockVendor({
        name: 'Premium Luxury Service',
        priceRange: '₹5,00,000 - ₹10,00,000',
        category: 'Wedding Planning',
      });

      const { container } = render(<VendorCard vendor={premiumVendor} />);
      expect(container.firstChild).toMatchSnapshot('premium-price-vendor-card');
    });

    it('renders vendor card with per-plate pricing', () => {
      const perPlateVendor = createMockVendor({
        name: 'Catering Per Plate',
        priceRange: '₹500 - ₹1,200 per plate',
        category: 'Catering',
      });

      const { container } = render(<VendorCard vendor={perPlateVendor} />);
      expect(container.firstChild).toMatchSnapshot('per-plate-price-vendor-card');
    });

    it('renders vendor card with no price range', () => {
      const noPriceVendor = createMockVendor({
        name: 'No Price Listed',
        priceRange: undefined,
      });

      const { container } = render(<VendorCard vendor={noPriceVendor} />);
      expect(container.firstChild).toMatchSnapshot('no-price-vendor-card');
    });
  });

  describe('✅ Location Variations Snapshots', () => {
    it('renders vendor card with different Goa locations', () => {
      const locations = [
        'Panaji, North Goa',
        'Margao, South Goa',
        'Calangute, North Goa',
        'Palolem, South Goa',
        'Anjuna, North Goa',
      ];

      locations.forEach((location, index) => {
        const locationVendor = createMockVendor({
          name: `${location} Vendor`,
          location: location,
        });

        const { container } = render(<VendorCard vendor={locationVendor} />);
        expect(container.firstChild).toMatchSnapshot(`location-${index}-vendor-card`);
      });
    });
  });

  describe('✅ Wishlist State Snapshots', () => {
    it('renders vendor card with item in wishlist', () => {
      // Mock the wishlist hook to return true for isInWishlist
      const mockUseWishlist = require('@/hooks/use-wishlist').useWishlist;
      mockUseWishlist.mockReturnValue({
        addToWishlist: jest.fn(),
        removeFromWishlist: jest.fn(),
        isInWishlist: jest.fn(() => true),
      });

      const wishlistVendor = createMockVendor({
        name: 'Wishlisted Vendor',
      });

      const { container } = render(<VendorCard vendor={wishlistVendor} />);
      expect(container.firstChild).toMatchSnapshot('wishlisted-vendor-card');
    });

    it('renders vendor card with item not in wishlist', () => {
      // Mock the wishlist hook to return false for isInWishlist
      const mockUseWishlist = require('@/hooks/use-wishlist').useWishlist;
      mockUseWishlist.mockReturnValue({
        addToWishlist: jest.fn(),
        removeFromWishlist: jest.fn(),
        isInWishlist: jest.fn(() => false),
      });

      const notWishlistedVendor = createMockVendor({
        name: 'Not Wishlisted Vendor',
      });

      const { container } = render(<VendorCard vendor={notWishlistedVendor} />);
      expect(container.firstChild).toMatchSnapshot('not-wishlisted-vendor-card');
    });
  });

  describe('✅ Edge Cases and Special Characters Snapshots', () => {
    it('renders vendor card with special characters in name', () => {
      const specialCharVendor = createMockVendor({
        name: 'Café & Restaurant "The Royal" - Premium Services',
        description: 'Special characters: àáâãäåæçèéêë & symbols: @#$%^&*()!',
        location: 'Panaji - North Goa',
      });

      const { container } = render(<VendorCard vendor={specialCharVendor} />);
      expect(container.firstChild).toMatchSnapshot('special-characters-vendor-card');
    });

    it('renders vendor card with Unicode characters', () => {
      const unicodeVendor = createMockVendor({
        name: 'मराठी Wedding Services 中文 🎉',
        description: 'Unicode support: हिंदी, मराठी, 中文, العربية, 🎊🎉🎈',
        location: 'गोवा, India',
      });

      const { container } = render(<VendorCard vendor={unicodeVendor} />);
      expect(container.firstChild).toMatchSnapshot('unicode-vendor-card');
    });

    it('renders vendor card with very long single word', () => {
      const longWordVendor = createMockVendor({
        name: 'Supercalifragilisticexpialidocious',
        description: 'Antidisestablishmentarianism services for your wedding',
        location: 'Pneumonoultramicroscopicsilicovolcanoconiosisville',
      });

      const { container } = render(<VendorCard vendor={longWordVendor} />);
      expect(container.firstChild).toMatchSnapshot('long-word-vendor-card');
    });

    it('renders vendor card with empty strings', () => {
      const emptyStringVendor = createMockVendor({
        name: 'Empty Fields Vendor',
        description: '',
        services: '',
        website: '',
        instagram: '',
      });

      const { container } = render(<VendorCard vendor={emptyStringVendor} />);
      expect(container.firstChild).toMatchSnapshot('empty-strings-vendor-card');
    });
  });

  describe('✅ Responsive Design Snapshots', () => {
    it('renders vendor card with different viewport considerations', () => {
      // Note: These snapshots capture the component structure
      // Actual responsive behavior would be tested with different viewport sizes
      
      const responsiveVendor = createMockVendor({
        name: 'Responsive Design Test Vendor',
        description: 'This vendor card should adapt to different screen sizes and maintain proper layout',
        services: 'Mobile-first design, Tablet optimization, Desktop enhancement',
      });

      const { container } = render(<VendorCard vendor={responsiveVendor} />);
      expect(container.firstChild).toMatchSnapshot('responsive-vendor-card');
    });
  });

  describe('✅ Accessibility Snapshots', () => {
    it('renders vendor card with accessibility attributes', () => {
      const accessibleVendor = createMockVendor({
        name: 'Accessibility Focused Vendor',
        description: 'This vendor card includes proper accessibility attributes and semantic HTML',
      });

      const { container } = render(<VendorCard vendor={accessibleVendor} />);
      expect(container.firstChild).toMatchSnapshot('accessible-vendor-card');
    });
  });

  describe('✅ Functional Tests (Non-Snapshot)', () => {
    it('renders vendor information correctly', () => {
      const mockVendor = createMockVendor({
        name: 'Test Photography Studio',
        category: 'Photography',
        location: 'Mumbai',
        rating: 4.5,
      });

      render(<VendorCard vendor={mockVendor} />);

      expect(screen.getByText('Test Photography Studio')).toBeInTheDocument();
      expect(screen.getByText('photography')).toBeInTheDocument();
      expect(screen.getByText('Mumbai')).toBeInTheDocument();
    });

    it('displays featured badge for featured vendors', () => {
      const featuredVendor = createMockVendor({
        name: 'Featured Vendor',
        featured: true,
      });

      render(<VendorCard vendor={featuredVendor} />);

      expect(screen.getByText('Featured')).toBeInTheDocument();
    });

    it('handles missing optional fields gracefully', () => {
      const minimalVendor = createMockVendor({
        name: 'Minimal Vendor',
        website: undefined,
        instagram: undefined,
        phone: undefined,
        whatsapp: undefined,
        email: undefined,
      });

      render(<VendorCard vendor={minimalVendor} />);

      expect(screen.getByText('Minimal Vendor')).toBeInTheDocument();
      // Should not crash when optional fields are missing
    });

    it('handles wishlist interactions', async () => {
      const mockAddToWishlist = jest.fn();
      const mockUseWishlist = require('@/hooks/use-wishlist').useWishlist;
      mockUseWishlist.mockReturnValue({
        addToWishlist: mockAddToWishlist,
        removeFromWishlist: jest.fn(),
        isInWishlist: jest.fn(() => false),
      });

      const vendor = createMockVendor();
      render(<VendorCard vendor={vendor} />);

      const wishlistButton = screen.getByRole('button', { name: /heart/i });
      fireEvent.click(wishlistButton);

      expect(mockAddToWishlist).toHaveBeenCalledWith(vendor);
    });

    it('handles share functionality', async () => {
      const mockShare = jest.fn();
      (navigator.share as jest.Mock) = mockShare;

      const vendor = createMockVendor();
      render(<VendorCard vendor={vendor} />);

      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);

      expect(mockShare).toHaveBeenCalledWith({
        title: vendor.name,
        text: `Check out ${vendor.name} on TheGoanWedding.com`,
        url: `${window.location.origin}/vendor/${vendor.id}`,
      });
    });
  });
});