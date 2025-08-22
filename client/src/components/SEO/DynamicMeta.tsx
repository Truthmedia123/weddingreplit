/**
 * 🔍 Dynamic Meta Tags Component
 * 
 * This component provides comprehensive SEO meta tag management including:
 * - Dynamic page titles and descriptions
 * - Open Graph and Twitter Card meta tags
 * - Structured data (JSON-LD) for different content types
 * - Canonical URLs and breadcrumbs
 */

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product' | 'local_business';
  structuredData?: object;
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
}

interface DynamicMetaProps {
  config: MetaConfig;
  vendor?: {
    id: string;
    name: string;
    category: string;
    description: string;
    image?: string;
    rating?: number;
    reviewCount?: number;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    priceRange?: string;
  };
  category?: {
    name: string;
    description: string;
    vendorCount?: number;
  };
}

export const DynamicMeta: React.FC<DynamicMetaProps> = ({
  config,
  vendor,
  category
}) => {
  // Generate dynamic title
  const generateTitle = (): string => {
    if (config.title) return config.title;
    
    if (vendor) {
      return `${vendor.name} - ${vendor.category} in Goa | TheGoanWedding.com`;
    }
    
    if (category) {
      return `${category.name} in Goa - Wedding Vendors | TheGoanWedding.com`;
    }
    
    return 'TheGoanWedding.com - Premium Wedding Vendor Directory | Celebrate Your Big Day, Goan Style';
  };

  // Generate dynamic description
  const generateDescription = (): string => {
    if (config.description) return config.description;
    
    if (vendor) {
      return `${vendor.description} Professional ${vendor.category} services in Goa for your dream wedding. Contact ${vendor.name} for exceptional wedding experiences.`;
    }
    
    if (category) {
      return `Find the best ${category.name.toLowerCase()} for your Goan wedding. ${category.vendorCount || 'Many'} verified professionals ready to make your special day perfect.`;
    }
    
    return 'Discover the finest wedding vendors in Goa. From photographers to caterers, venues to decorators - find everything for your perfect Goan wedding celebration.';
  };

  // Generate keywords
  const generateKeywords = (): string => {
    const baseKeywords = ['goan wedding', 'wedding vendors goa', 'destination wedding goa', 'beach wedding goa'];
    
    if (config.keywords) {
      return [...baseKeywords, ...config.keywords].join(', ');
    }
    
    if (vendor) {
      const vendorKeywords = [
        `${vendor.category.toLowerCase()} goa`,
        `wedding ${vendor.category.toLowerCase()} goa`,
        vendor.name.toLowerCase(),
        `${vendor.category.toLowerCase()} services goa`
      ];
      return [...baseKeywords, ...vendorKeywords].join(', ');
    }
    
    if (category) {
      const categoryKeywords = [
        `${category.name.toLowerCase()} goa`,
        `wedding ${category.name.toLowerCase()} goa`,
        `goan ${category.name.toLowerCase()}`
      ];
      return [...baseKeywords, ...categoryKeywords].join(', ');
    }
    
    return baseKeywords.join(', ');
  };

  // Generate structured data
  const generateStructuredData = (): object => {
    if (config.structuredData) return config.structuredData;
    
    if (vendor) {
      return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": vendor.name,
        "description": vendor.description,
        "image": vendor.image || "https://thegoanwedding.com/images/vendor-placeholder.jpg",
        "telephone": vendor.phone,
        "email": vendor.email,
        "url": vendor.website || `https://thegoanwedding.com/vendors/${vendor.id}`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": vendor.address || "Goa",
          "addressRegion": "Goa",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "15.2993",
          "longitude": "74.1240"
        },
        "priceRange": vendor.priceRange || "$$",
        "serviceType": vendor.category,
        "areaServed": "Goa, India",
        ...(vendor.rating && vendor.reviewCount && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": vendor.rating.toString(),
            "reviewCount": vendor.reviewCount.toString(),
            "bestRating": "5",
            "worstRating": "1"
          }
        })
      };
    }
    
    if (category) {
      return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${category.name} in Goa`,
        "description": category.description,
        "url": `https://thegoanwedding.com/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`,
        "about": {
          "@type": "Service",
          "serviceType": category.name,
          "areaServed": "Goa, India"
        },
        "mainEntity": {
          "@type": "ItemList",
          "name": `${category.name} Vendors in Goa`,
          "numberOfItems": category.vendorCount || 0
        }
      };
    }
    
    return {};
  };

  // Generate breadcrumb structured data
  const generateBreadcrumbStructuredData = () => {
    if (!config.breadcrumbs || config.breadcrumbs.length === 0) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": config.breadcrumbs.map((breadcrumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": breadcrumb.name,
        "item": breadcrumb.url
      }))
    };
  };

  const title = generateTitle();
  const description = generateDescription();
  const keywords = generateKeywords();
  const structuredData = generateStructuredData();
  const breadcrumbData = generateBreadcrumbStructuredData();
  const imageUrl = config.image || vendor?.image || "https://thegoanwedding.com/images/hero.jpg";
  const canonicalUrl = config.canonical || (vendor ? `https://thegoanwedding.com/vendors/${vendor.id}` : 'https://thegoanwedding.com');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={config.type || 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="TheGoanWedding.com" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description.substring(0, 200)} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@thegoanwedding" />
      <meta name="twitter:creator" content="@thegoanwedding" />

      {/* Additional SEO Meta Tags */}
      <meta name="author" content="TheGoanWedding.com" />
      <meta name="generator" content="TheGoanWedding.com" />
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Geo Meta Tags */}
      <meta name="geo.region" content="IN-GA" />
      <meta name="geo.placename" content="Goa, India" />
      <meta name="geo.position" content="15.2993;74.1240" />
      <meta name="ICBM" content="15.2993, 74.1240" />

      {/* Structured Data */}
      {Object.keys(structuredData).length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Breadcrumb Structured Data */}
      {breadcrumbData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      )}
    </Helmet>
  );
};

// SEO Hook for easy integration
export const useSEO = (config: MetaConfig) => {
  useEffect(() => {
    // Update page title immediately
    if (config.title) {
      document.title = config.title;
    }
    
    // Add focus management for accessibility
    const mainContent = document.querySelector('main, #main, [role="main"]');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
    }
  }, [config.title]);
};

// SEO Wrapper Component
interface SEOWrapperProps {
  children: React.ReactNode;
  meta: MetaConfig;
  vendor?: DynamicMetaProps['vendor'];
  category?: DynamicMetaProps['category'];
}

export const SEOWrapper: React.FC<SEOWrapperProps> = ({
  children,
  meta,
  vendor,
  category
}) => {
  useSEO(meta);
  
  return (
    <>
      <DynamicMeta config={meta} vendor={vendor} category={category} />
      {children}
    </>
  );
};

export default DynamicMeta;

