/**
 * 📝 SEO-Optimized Heading Structure Component
 * 
 * This component provides proper heading hierarchy for SEO including:
 * - Semantic heading structure (H1, H2, H3, etc.)
 * - Keyword optimization
 * - Accessibility compliance
 * - Schema.org markup for content structure
 */

import React from 'react';

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
  seoKeywords?: string[];
  priority?: 'primary' | 'secondary' | 'tertiary';
}

export const SEOHeading: React.FC<HeadingProps> = ({
  level,
  children,
  className = '',
  id,
  seoKeywords = [],
  priority = 'secondary'
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  // Generate SEO-optimized classes based on heading level and priority
  const getHeadingClasses = () => {
    const baseClasses = 'font-semibold text-gray-900 leading-tight';
    
    const sizeClasses = {
      1: priority === 'primary' 
        ? 'text-4xl md:text-5xl lg:text-6xl' 
        : 'text-3xl md:text-4xl lg:text-5xl',
      2: 'text-2xl md:text-3xl lg:text-4xl',
      3: 'text-xl md:text-2xl lg:text-3xl',
      4: 'text-lg md:text-xl lg:text-2xl',
      5: 'text-base md:text-lg lg:text-xl',
      6: 'text-sm md:text-base lg:text-lg'
    };
    
    const priorityClasses = {
      primary: 'text-blue-900',
      secondary: 'text-gray-900',
      tertiary: 'text-gray-700'
    };
    
    return `${baseClasses} ${sizeClasses[level]} ${priorityClasses[priority]} ${className}`;
  };

  // Generate ID from children text if not provided
  const generateId = () => {
    if (id) return id;
    if (typeof children === 'string') {
      return children
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    }
    return undefined;
  };

  const headingId = generateId();

  return (
    <Tag 
      className={getHeadingClasses()}
      id={headingId}
      itemProp={level === 1 ? "name" : level === 2 ? "headline" : undefined}
    >
      {children}
    </Tag>
  );
};

// Page title component (H1) with enhanced SEO
interface PageTitleProps {
  title: string;
  subtitle?: string;
  keywords?: string[];
  breadcrumbs?: Array<{ name: string; url?: string }>;
  className?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  keywords = [],
  breadcrumbs = [],
  className = ''
}) => {
  // Generate structured data for the page title
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": subtitle,
    "keywords": keywords.join(', '),
    ...(breadcrumbs.length > 0 && {
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url ? `https://thegoanwedding.com${crumb.url}` : undefined
        }))
      }
    })
  };

  return (
    <header className={`mb-8 ${className}`} itemScope itemType="https://schema.org/WebPage">
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Main Page Title (H1) */}
      <SEOHeading 
        level={1} 
        priority="primary"
        seoKeywords={keywords}
        className="mb-4"
      >
        {title}
      </SEOHeading>
      
      {/* Subtitle */}
      {subtitle && (
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl" itemProp="description">
          {subtitle}
        </p>
      )}
    </header>
  );
};

// Section heading component with proper hierarchy
interface SectionHeadingProps {
  title: string;
  level: 2 | 3 | 4 | 5 | 6;
  description?: string;
  className?: string;
  anchor?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  level,
  description,
  className = '',
  anchor = true
}) => {
  const headingId = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

  return (
    <section className={`mb-6 ${className}`}>
      <SEOHeading 
        level={level}
        id={anchor ? headingId : undefined}
        className="mb-2"
      >
        {title}
        {anchor && (
          <a 
            href={`#${headingId}`}
            className="ml-2 text-blue-500 opacity-0 hover:opacity-100 transition-opacity duration-200"
            aria-label={`Link to ${title} section`}
          >
            #
          </a>
        )}
      </SEOHeading>
      
      {description && (
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      )}
    </section>
  );
};

// Vendor/Business heading with structured data
interface BusinessHeadingProps {
  name: string;
  category: string;
  location: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  className?: string;
}

export const BusinessHeading: React.FC<BusinessHeadingProps> = ({
  name,
  category,
  location,
  description,
  rating,
  reviewCount,
  priceRange,
  className = ''
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location,
      "addressRegion": "Goa",
      "addressCountry": "IN"
    },
    "serviceType": category,
    "areaServed": "Goa, India",
    ...(priceRange && { priceRange }),
    ...(rating && reviewCount && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating,
        reviewCount,
        "bestRating": 5,
        "worstRating": 1
      }
    })
  };

  return (
    <header className={`mb-8 ${className}`} itemScope itemType="https://schema.org/LocalBusiness">
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Business Name (H1) */}
      <SEOHeading 
        level={1} 
        priority="primary"
        className="mb-2"
        seoKeywords={[name, category, location, 'wedding', 'goa']}
      >
        <span itemProp="name">{name}</span>
      </SEOHeading>
      
      {/* Category and Location */}
      <div className="flex items-center gap-2 mb-4 text-blue-600">
        <span itemProp="serviceType" className="font-medium">{category}</span>
        <span className="text-gray-400">•</span>
        <span itemProp="address" className="font-medium">{location}</span>
      </div>
      
      {/* Rating Display */}
      {rating && reviewCount && (
        <div className="flex items-center gap-2 mb-4" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-lg ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-gray-600">
            <span itemProp="ratingValue">{rating}</span> 
            (<span itemProp="reviewCount">{reviewCount}</span> reviews)
          </span>
          <meta itemProp="bestRating" content="5" />
          <meta itemProp="worstRating" content="1" />
        </div>
      )}
      
      {/* Description */}
      {description && (
        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl" itemProp="description">
          {description}
        </p>
      )}
    </header>
  );
};

// Table of Contents component for long-form content
interface TableOfContentsProps {
  headings: Array<{
    id: string;
    title: string;
    level: number;
  }>;
  className?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  className = ''
}) => {
  if (headings.length === 0) return null;

  return (
    <nav className={`bg-gray-50 rounded-lg p-6 ${className}`} aria-label="Table of Contents">
      <SEOHeading level={2} className="mb-4">
        Table of Contents
      </SEOHeading>
      
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id} className={`ml-${(heading.level - 2) * 4}`}>
            <a
              href={`#${heading.id}`}
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm"
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default {
  SEOHeading,
  PageTitle,
  SectionHeading,
  BusinessHeading,
  TableOfContents
};

