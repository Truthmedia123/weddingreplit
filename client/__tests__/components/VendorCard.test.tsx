/**
 * 🧪 VendorCard Component Tests
 * 
 * Basic tests for the VendorCard component
 */

import React from 'react';
import { render } from '../utils/test-utils';
import { screen } from '@testing-library/react';
import VendorCard from '../../src/components/VendorCard';
import { mockVendor } from '../utils/test-utils';

// Mock the hooks and components
jest.mock('../../src/hooks/use-wishlist', () => ({
  useWishlist: () => ({
    isInWishlist: jest.fn(() => false),
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
  }),
}));

jest.mock('../../src/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock('../../src/components/InlineSVGImage', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="inline-svg" />
  ),
}));

describe('VendorCard', () => {
  it('renders vendor information correctly', () => {
    render(<VendorCard vendor={mockVendor} />);
    
    expect(screen.getByText(mockVendor.name)).toBeInTheDocument();
    expect(screen.getByText(mockVendor.description)).toBeInTheDocument();
    expect(screen.getByText(mockVendor.location)).toBeInTheDocument();
  });

  it('renders vendor image', () => {
    render(<VendorCard vendor={mockVendor} />);
    
    const image = screen.getByAltText(mockVendor.name);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', mockVendor.name);
  });

  it('displays rating information', () => {
    render(<VendorCard vendor={mockVendor} />);
    
    expect(screen.getByText(mockVendor.rating)).toBeInTheDocument();
  });

  it('shows verified badge when vendor is verified', () => {
    const verifiedVendor = { ...mockVendor, verified: true };
    render(<VendorCard vendor={verifiedVendor} />);
    
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('shows featured badge when vendor is featured', () => {
    const featuredVendor = { ...mockVendor, featured: true };
    render(<VendorCard vendor={featuredVendor} />);
    
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('renders vendor link correctly', () => {
    render(<VendorCard vendor={mockVendor} />);
    
    // The Link component from wouter renders as a div with href attribute
    // We need to find the div that has the href attribute
    const linkContainer = document.querySelector('[href]');
    expect(linkContainer).toHaveAttribute('href', `/vendor/${mockVendor.id}`);
  });

  it('displays vendor category', () => {
    render(<VendorCard vendor={mockVendor} />);
    
    expect(screen.getByText(mockVendor.category)).toBeInTheDocument();
  });

  it('shows price range when available', () => {
    render(<VendorCard vendor={mockVendor} />);
    
    expect(screen.getByText(mockVendor.priceRange)).toBeInTheDocument();
  });

  it('displays review count', () => {
    render(<VendorCard vendor={mockVendor} />);
    
    // The component shows review count in parentheses, not as "X reviews"
    expect(screen.getByText(`(${mockVendor.reviewCount})`)).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    render(<VendorCard vendor={mockVendor} />);
    
    expect(screen.getByText('Test Vendor')).toBeInTheDocument();
  });
});