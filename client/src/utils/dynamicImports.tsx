/**
 * 🚀 Dynamic Import Utilities
 * 
 * This module provides utilities for lazy loading heavy components
 * and implementing advanced code splitting strategies.
 */

import { lazy, ComponentType } from 'react';

// Loading component for dynamic imports
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Error boundary for dynamic imports
export const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center p-8 text-red-600">
    <div className="text-center">
      <div className="text-lg font-semibold mb-2">Failed to load component</div>
      <div className="text-sm text-gray-600">{error.message}</div>
    </div>
  </div>
);

// Dynamic import wrapper with error handling
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: ComponentType = LoadingSpinner
) {
  return lazy(() => 
    importFn().catch(error => {
      console.error('Failed to load component:', error);
      return { default: ErrorFallback as T };
    })
  );
}

// Heavy UI Components - Lazy loaded
export const LazyVendorProfile = createLazyComponent(() => 
  import('@/pages/VendorProfile')
);

export const LazyBlogPost = createLazyComponent(() => 
  import('@/pages/BlogPost')
);

export const LazyCouples = createLazyComponent(() => 
  import('@/pages/Couples')
);

// Heavy UI Components with preloading
export const LazyChart = createLazyComponent(() => 
  import('@/components/ui/chart')
);

export const LazyPDFViewer = createLazyComponent(() => 
  import('@/components/PDFViewer')
);

export const LazyQRCodeGenerator = createLazyComponent(() => 
  import('@/components/QRCodeGenerator')
);

// Utility functions for preloading
export const preloadComponent = (importFn: () => Promise<any>) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = importFn.toString();
  document.head.appendChild(link);
};

// Preload critical components on user interaction
export const preloadOnHover = (importFn: () => Promise<any>) => {
  return {
    onMouseEnter: () => preloadComponent(importFn),
    onFocus: () => preloadComponent(importFn),
  };
};

// Preload on route change
export const preloadRoute = (importFn: () => Promise<any>) => {
  // Preload when user starts navigating
  const preload = () => {
    setTimeout(() => preloadComponent(importFn), 100);
  };
  
  // Listen for route changes
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', preload);
  }
  
  return preload;
};

// Conditional loading based on user preferences
export const createConditionalLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  condition: () => boolean,
  fallback: ComponentType = LoadingSpinner
) => {
  return lazy(async () => {
    if (condition()) {
      return importFn();
    }
    return { default: fallback as T };
  });
};

// Lazy load based on network conditions
export const createNetworkAwareLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: ComponentType = LoadingSpinner
) => {
  return createConditionalLazyComponent(
    importFn,
    () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        return connection.effectiveType === '4g' || connection.saveData === false;
      }
      return true; // Default to loading if connection info not available
    },
    fallback
  );
};

// Lazy load based on device capabilities
export const createDeviceAwareLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: ComponentType = LoadingSpinner
) => {
  return createConditionalLazyComponent(
    importFn,
    () => {
      // Check for device memory
      if ('deviceMemory' in navigator) {
        return (navigator as any).deviceMemory >= 4; // 4GB or more
      }
      return true; // Default to loading if device memory not available
    },
    fallback
  );
};

// Export all lazy components
export const lazyComponents = {
  VendorProfile: LazyVendorProfile,
  BlogPost: LazyBlogPost,
  Couples: LazyCouples,
  Chart: LazyChart,
  PDFViewer: LazyPDFViewer,
  QRCodeGenerator: LazyQRCodeGenerator,
};
