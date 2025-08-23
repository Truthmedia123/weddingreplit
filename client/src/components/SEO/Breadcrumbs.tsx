/**
 * 🍞 Breadcrumb Navigation Component
 * 
 * This component provides SEO-friendly breadcrumb navigation including:
 * - Structured data for breadcrumbs
 * - Keyboard navigation support
 * - Mobile-responsive design
 * - Accessibility features
 */

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  url?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
  showHome = true,
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />
}) => {
  // Add home breadcrumb if requested
  const breadcrumbItems = showHome 
    ? [{ name: 'Home', url: '/', current: false }, ...items]
    : items;

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url ? `https://thegoanwedding.com${item.url}` : undefined
    }))
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Breadcrumb Navigation */}
      <nav 
        aria-label="Breadcrumb" 
        className={`${className}`}
        role="navigation"
      >
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {item.current || !item.url ? (
                <span 
                  className="font-medium text-gray-900 truncate max-w-xs"
                  aria-current={item.current ? "page" : undefined}
                >
                  {index === 0 && showHome ? (
                    <Home className="w-4 h-4" aria-label="Home" />
                  ) : (
                    item.name
                  )}
                </span>
              ) : (
                <a
                  href={item.url}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200 truncate max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  onClick={(e) => {
                    // Prevent default if using a router
                    // You can integrate with your router here
                    // e.preventDefault();
                    // navigate(item.url);
                  }}
                >
                  {index === 0 && showHome ? (
                    <Home className="w-4 h-4" aria-label="Home" />
                  ) : (
                    item.name
                  )}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

// Hook for generating breadcrumbs automatically
export const useBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  segments.forEach((segment, index) => {
    const url = `/${  segments.slice(0, index + 1).join('/')}`;
    const isLast = index === segments.length - 1;
    
    // Convert URL segment to readable name
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({
      name,
      url: isLast ? undefined : url,
      current: isLast
    });
  });

  return breadcrumbs;
};

// Breadcrumb wrapper with automatic generation
interface AutoBreadcrumbsProps {
  pathname: string;
  customItems?: BreadcrumbItem[];
  className?: string;
}

export const AutoBreadcrumbs: React.FC<AutoBreadcrumbsProps> = ({
  pathname,
  customItems,
  className
}) => {
  const autoBreadcrumbs = useBreadcrumbs(pathname);
  const items = customItems || autoBreadcrumbs;

  // Don't show breadcrumbs on homepage
  if (pathname === '/' || items.length === 0) {
    return null;
  }

  return <Breadcrumbs items={items} className={className} />;
};

export default Breadcrumbs;

