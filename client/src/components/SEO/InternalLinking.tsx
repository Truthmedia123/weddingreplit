/**
 * 🔗 Internal Linking Strategy Component
 * 
 * This component provides intelligent internal linking for SEO including:
 * - Related content suggestions
 * - Category-based linking
 * - Contextual link recommendations
 * - Anchor text optimization
 */

import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface RelatedLink {
  title: string;
  url: string;
  description?: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  external?: boolean;
}

interface InternalLinkingProps {
  currentPage: {
    type: 'home' | 'category' | 'vendor' | 'blog' | 'wedding';
    category?: string;
    tags?: string[];
    id?: string;
  };
  relatedContent?: RelatedLink[];
  className?: string;
  limit?: number;
}

export const InternalLinking: React.FC<InternalLinkingProps> = ({
  currentPage,
  relatedContent = [],
  className = '',
  limit = 6
}) => {
  // Generate contextual related links based on page type
  const generateContextualLinks = (): RelatedLink[] => {
    const links: RelatedLink[] = [];

    switch (currentPage.type) {
      case 'home':
        links.push(
          { title: 'Wedding Photography in Goa', url: '/categories/photography', description: 'Capture your special moments', priority: 'high' },
          { title: 'Beach Wedding Venues', url: '/categories/venues', description: 'Perfect beachside locations', priority: 'high' },
          { title: 'Wedding Catering Services', url: '/categories/catering', description: 'Delicious Goan cuisine for your wedding', priority: 'medium' },
          { title: 'Wedding Planners in Goa', url: '/categories/planning', description: 'Expert wedding coordination', priority: 'medium' },
          { title: 'Bridal Makeup Artists', url: '/categories/makeup', description: 'Look stunning on your big day', priority: 'medium' },
          { title: 'Wedding Decoration Services', url: '/categories/decoration', description: 'Beautiful wedding setups', priority: 'low' }
        );
        break;

      case 'category':
        if (currentPage.category === 'photography') {
          links.push(
            { title: 'Wedding Venues in Goa', url: '/categories/venues', description: 'Perfect locations for photo shoots', priority: 'high' },
            { title: 'Bridal Makeup Artists', url: '/categories/makeup', description: 'Get camera-ready', priority: 'medium' },
            { title: 'Wedding Planning Guide', url: '/blog/wedding-planning-guide', description: 'Tips for planning your perfect day', priority: 'medium' }
          );
        } else if (currentPage.category === 'venues') {
          links.push(
            { title: 'Wedding Photography', url: '/categories/photography', description: 'Capture your venue beautifully', priority: 'high' },
            { title: 'Wedding Catering', url: '/categories/catering', description: 'Delicious food for your guests', priority: 'high' },
            { title: 'Wedding Decoration', url: '/categories/decoration', description: 'Transform your venue', priority: 'medium' }
          );
        } else if (currentPage.category === 'catering') {
          links.push(
            { title: 'Wedding Venues', url: '/categories/venues', description: 'Find the perfect location', priority: 'high' },
            { title: 'Wedding Planning Services', url: '/categories/planning', description: 'Coordinate your catering needs', priority: 'medium' },
            { title: 'Goan Wedding Traditions', url: '/blog/goan-wedding-traditions', description: 'Traditional Goan wedding foods', priority: 'medium' }
          );
        }
        break;

      case 'vendor':
        links.push(
          { title: `More ${currentPage.category} Services`, url: `/categories/${currentPage.category}`, description: `Explore other ${currentPage.category} options`, priority: 'high' },
          { title: 'Customer Reviews', url: `/vendor/${currentPage.id}/reviews`, description: 'See what couples are saying', priority: 'medium' },
          { title: 'Wedding Planning Tips', url: '/blog/planning-tips', description: 'Expert advice for your wedding', priority: 'low' }
        );
        break;

      case 'blog':
        links.push(
          { title: 'Wedding Vendor Directory', url: '/categories', description: 'Find all wedding services', priority: 'high' },
          { title: 'Featured Vendors', url: '/featured', description: 'Top-rated wedding professionals', priority: 'medium' },
          { title: 'Real Weddings', url: '/couples', description: 'Get inspired by real Goan weddings', priority: 'medium' }
        );
        break;

      case 'wedding':
        links.push(
          { title: 'Wedding Inspiration Gallery', url: '/gallery', description: 'More beautiful wedding ideas', priority: 'high' },
          { title: 'Plan Your Wedding', url: '/categories', description: 'Find vendors for your dream wedding', priority: 'high' },
          { title: 'Wedding Planning Checklist', url: '/blog/planning-checklist', description: 'Step-by-step wedding planning', priority: 'medium' }
        );
        break;
    }

    return links;
  };

  // Combine contextual and provided related content
  const allLinks = [...(relatedContent || []), ...generateContextualLinks()]
    .filter((link, index, self) => 
      // Remove duplicates based on URL
      index === self.findIndex(l => l.url === link.url)
    )
    .sort((a, b) => {
      // Sort by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority || 'low'] - priorityOrder[a.priority || 'low']);
    })
    .slice(0, limit);

  if (allLinks.length === 0) {
    return null;
  }

  return (
    <section className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Related Services & Information
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 group"
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  {link.title}
                </h3>
                {link.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {link.description}
                  </p>
                )}
                {link.category && (
                  <span className="inline-block text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full mt-2">
                    {link.category}
                  </span>
                )}
              </div>
              <div className="ml-2 flex-shrink-0">
                {link.external ? (
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

// Related vendors component for specific categories
interface RelatedVendorsProps {
  currentVendorId?: string;
  category: string;
  location?: string;
  limit?: number;
  className?: string;
}

export const RelatedVendors: React.FC<RelatedVendorsProps> = ({
  currentVendorId,
  category,
  location = 'Goa',
  limit = 4,
  className = ''
}) => {
  // This would be populated with actual vendor data from your API
  const relatedVendors: RelatedLink[] = [
    {
      title: `Top ${category} Services in ${location}`,
      url: `/categories/${category.toLowerCase()}`,
      description: `Discover the best ${category.toLowerCase()} professionals in ${location}`,
      priority: 'high'
    },
    {
      title: `${category} Packages & Pricing`,
      url: `/categories/${category.toLowerCase()}/pricing`,
      description: `Compare pricing for ${category.toLowerCase()} services`,
      priority: 'medium'
    },
    {
      title: `${category} Portfolio Gallery`,
      url: `/categories/${category.toLowerCase()}/gallery`,
      description: `View stunning ${category.toLowerCase()} work`,
      priority: 'medium'
    },
    {
      title: `How to Choose a ${category} Professional`,
      url: `/blog/choosing-${category.toLowerCase()}-guide`,
      description: `Expert tips for selecting the right ${category.toLowerCase()} service`,
      priority: 'low'
    }
  ];

  return (
    <InternalLinking
      currentPage={{ type: 'vendor', category: category.toLowerCase(), id: currentVendorId }}
      relatedContent={relatedVendors}
      className={className}
      limit={limit}
    />
  );
};

// SEO-optimized link component with proper anchor text
interface SEOLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  external?: boolean;
  nofollow?: boolean;
}

export const SEOLink: React.FC<SEOLinkProps> = ({
  href,
  children,
  className = '',
  title,
  external = false,
  nofollow = false
}) => {
  const relValue = [
    ...(external ? ['noopener', 'noreferrer'] : []),
    ...(nofollow ? ['nofollow'] : [])
  ].join(' ');

  return (
    <a
      href={href}
      className={`text-blue-600 hover:text-blue-800 transition-colors duration-200 ${className}`}
      title={title}
      target={external ? '_blank' : undefined}
      rel={relValue || undefined}
    >
      {children}
    </a>
  );
};

export default InternalLinking;

