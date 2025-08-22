/**
 * 📊 Core Web Vitals Optimization Component
 * 
 * This component optimizes for Google's Core Web Vitals including:
 * - LCP (Largest Contentful Paint) optimization
 * - CLS (Cumulative Layout Shift) prevention
 * - FID (First Input Delay) reduction
 * - Performance monitoring and reporting
 */

import React, { useEffect, useRef, useState } from 'react';

// Web Vitals metrics interface
interface WebVitalsMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

// Performance optimization hook
export const useWebVitals = () => {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if Performance Observer is supported
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      setIsSupported(true);
      initializeWebVitals();
    }
  }, []);

  const initializeWebVitals = () => {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        renderTime: number;
        loadTime: number;
      };
      
      if (lastEntry) {
        const lcp = lastEntry.renderTime || lastEntry.loadTime;
        setMetrics(prev => ({ ...prev, lcp }));
        
        // Report to analytics if needed
        if (process.env.NODE_ENV === 'production') {
          reportWebVital('LCP', lcp);
        }
      }
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP monitoring not supported');
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime;
        setMetrics(prev => ({ ...prev, fid }));
        
        if (process.env.NODE_ENV === 'production') {
          reportWebVital('FID', fid);
        }
      });
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID monitoring not supported');
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    let clsEntries: any[] = [];
    
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsEntries.push(entry);
          clsValue += entry.value;
        }
      });
      
      setMetrics(prev => ({ ...prev, cls: clsValue }));
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS monitoring not supported');
    }

    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          const fcp = entry.startTime;
          setMetrics(prev => ({ ...prev, fcp }));
          
          if (process.env.NODE_ENV === 'production') {
            reportWebVital('FCP', fcp);
          }
        }
      });
    });

    try {
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('FCP monitoring not supported');
    }

    // Time to First Byte (TTFB)
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const navigation = navigationEntries[0] as PerformanceNavigationTiming;
      const ttfb = navigation.responseStart - navigation.requestStart;
      setMetrics(prev => ({ ...prev, ttfb }));
      
      if (process.env.NODE_ENV === 'production') {
        reportWebVital('TTFB', ttfb);
      }
    }
  };

  const reportWebVital = (name: string, value: number) => {
    // Send to analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(value),
        non_interaction: true,
      });
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, value, url: window.location.href })
    }).catch(console.error);
  };

  return { metrics, isSupported };
};

// Image component optimized for CLS prevention
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  placeholder?: string;
  sizes?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'blur',
  sizes = '100vw'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Calculate aspect ratio for maintaining layout
  const aspectRatio = (height / width) * 100;

  useEffect(() => {
    // Preload priority images
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    }
  }, [src, priority]);

  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc: string) => {
    const breakpoints = [320, 640, 768, 1024, 1280, 1920];
    return breakpoints
      .map(bp => `${baseSrc}?w=${bp} ${bp}w`)
      .join(', ');
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ paddingBottom: `${aspectRatio}%` }}
    >
      {/* Placeholder to prevent CLS */}
      <div 
        className="absolute inset-0 bg-gray-200 animate-pulse"
        style={{ display: isLoaded ? 'none' : 'block' }}
      />
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={src}
        srcSet={generateSrcSet(src)}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          // Prevent image from being larger than its container
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <span className="text-sm">Image not available</span>
        </div>
      )}
    </div>
  );
};

// Resource hints component for preloading critical resources
export const ResourceHints: React.FC = () => {
  useEffect(() => {
    // Preconnect to external domains
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://images.unsplash.com',
      'https://cdn.jsdelivr.net'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      if (domain.includes('gstatic')) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });

    // DNS prefetch for domains we might use later
    const dnsPrefetchDomains = [
      'https://www.google-analytics.com',
      'https://connect.facebook.net',
      'https://platform.twitter.com'
    ];

    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

    // Preload critical CSS and fonts
    const criticalResources = [
      { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2' },
      { href: '/css/critical.css', as: 'style' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) {
        link.type = resource.type;
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }, []);

  return null;
};

// Intersection Observer hook for lazy loading optimization
export const useIntersectionObserver = (
  threshold = 0.1,
  rootMargin = '50px'
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin]);

  return { elementRef, isIntersecting };
};

// Performance monitoring dashboard (development only)
export const PerformanceDashboard: React.FC = () => {
  const { metrics, isSupported } = useWebVitals();

  if (process.env.NODE_ENV !== 'development' || !isSupported) {
    return null;
  }

  const getScoreColor = (metric: string, value: number) => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-gray-600';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-xs">
      <h3 className="font-semibold text-sm mb-2">Core Web Vitals</h3>
      <div className="space-y-1 text-xs">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="uppercase">{key}:</span>
            <span className={getScoreColor(key, value!)}>
              {value?.toFixed(1)}
              {key === 'cls' ? '' : 'ms'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  useWebVitals,
  OptimizedImage,
  ResourceHints,
  useIntersectionObserver,
  PerformanceDashboard
};

