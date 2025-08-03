import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Common test data factories
export const createMockVendor = (overrides = {}) => ({
  id: 1,
  name: 'Test Vendor',
  email: 'test@vendor.com',
  phone: '+91-9876543210',
  category: 'Photography',
  location: 'Mumbai',
  description: 'Professional wedding photography services',
  services: 'Wedding Photography, Pre-wedding Shoots',
  website: 'https://testvendor.com',
  instagram: '@testvendor',
  whatsapp: '+91-9876543210',
  featured: false,
  verified: true,
  rating: 4.5,
  reviewCount: 25,
  priceRange: '₹50,000 - ₹1,00,000',
  availability: 'Available',
  portfolioImages: ['image1.jpg', 'image2.jpg'],
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockWishlist = (overrides = {}) => ({
  id: 1,
  sessionId: 'test-session-123',
  vendors: [createMockVendor()],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockBlogPost = (overrides = {}) => ({
  id: 1,
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  excerpt: 'This is a test blog post excerpt',
  content: 'This is the full content of the test blog post',
  author: 'Test Author',
  featuredImage: 'featured-image.jpg',
  imageUrl: 'blog-image.jpg',
  tags: 'wedding, photography, tips',
  published: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockBusinessSubmission = (overrides = {}) => ({
  id: 1,
  businessName: 'Test Business',
  ownerName: 'Test Owner',
  email: 'owner@testbusiness.com',
  phone: '+91-9876543210',
  category: 'Photography',
  location: 'Mumbai',
  description: 'Professional wedding services',
  services: 'Photography, Videography',
  website: 'https://testbusiness.com',
  instagram: '@testbusiness',
  experience: '5 years',
  portfolio: 'https://portfolio.com',
  status: 'pending',
  submittedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Mock API responses
export const mockApiResponse = <T>(data: T, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

// Common test assertions
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveAccessibleName = (element: HTMLElement, name: string) => {
  expect(element).toHaveAccessibleName(name);
};

// Async test helpers
export const waitForLoadingToFinish = async () => {
  const { waitForElementToBeRemoved } = await import('@testing-library/react');
  try {
    await waitForElementToBeRemoved(() => document.querySelector('[data-testid="loading"]'));
  } catch {
    // Loading element might not exist, which is fine
  }
};