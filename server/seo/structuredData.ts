// Structured data (JSON-LD) for SEO
export interface VendorStructuredData {
  id: number;
  name: string;
  category: string;
  description: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
}

export function generateVendorJsonLd(vendor: VendorStructuredData) {
  const baseUrl = process.env.SITE_URL || 'https://thegoanwedding.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/vendors/${vendor.id}`,
    "name": vendor.name,
    "description": vendor.description,
    "url": `${baseUrl}/vendors/${vendor.id}`,
    "telephone": vendor.phone,
    "email": vendor.email,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": vendor.location,
      "addressRegion": "Goa",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "15.2993",
      "longitude": "74.1240"
    },
    "priceRange": vendor.priceRange || "$$",
    "aggregateRating": vendor.rating ? {
      "@type": "AggregateRating",
      "ratingValue": vendor.rating,
      "reviewCount": vendor.reviewCount || 0,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "serviceArea": {
      "@type": "State",
      "name": "Goa"
    },
    "areaServed": "Goa",
    "knowsAbout": [
      "Wedding Planning",
      "Goan Weddings",
      vendor.category
    ],
    "sameAs": vendor.website ? [vendor.website] : undefined
  };
}

export function generateWebsiteJsonLd() {
  const baseUrl = process.env.SITE_URL || 'https://thegoanwedding.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": process.env.SITE_NAME || "The Goan Wedding",
    "description": process.env.SITE_DESCRIPTION || "Premium wedding vendor directory for Goan weddings",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": process.env.SITE_NAME || "The Goan Wedding",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    }
  };
}

export function generateBreadcrumbJsonLd(items: Array<{name: string, url: string}>) {
  const baseUrl = process.env.SITE_URL || 'https://thegoanwedding.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${baseUrl}${item.url}`
    }))
  };
}

export function generateEventJsonLd(wedding: any) {
  const baseUrl = process.env.SITE_URL || 'https://thegoanwedding.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": `${wedding.brideName} & ${wedding.groomName} Wedding`,
    "description": `Wedding celebration of ${wedding.brideName} and ${wedding.groomName}`,
    "startDate": wedding.weddingDate,
    "location": {
      "@type": "Place",
      "name": wedding.venue,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": wedding.venueAddress || "Goa",
        "addressRegion": "Goa",
        "addressCountry": "IN"
      }
    },
    "organizer": {
      "@type": "Person",
      "name": `${wedding.brideName} & ${wedding.groomName}`
    },
    "url": `${baseUrl}/couples/${wedding.slug}`,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
  };
}