import { useEffect } from 'react';

// Implement lazy loading for images
export function useLazyLoading() {
  useEffect(() => {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('blur-sm');
            img.classList.add('transition-all', 'duration-300');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // Observe all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach((img) => imageObserver.observe(img));

    return () => imageObserver.disconnect();
  }, []);
}

// Preload critical resources
export function useResourcePreloading() {
  useEffect(() => {
    // Preload critical fonts
    const fontPreloads = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    ];

    fontPreloads.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    });

    // Preload critical images
    const criticalImages = [
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1000',
    ];

    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);
}

// Analytics tracking without cookies
export function useAnalytics() {
  useEffect(() => {
    // Simple analytics without personal data
    const trackPageView = () => {
      const data = {
        page: window.location.pathname,
        referrer: document.referrer,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        sessionId: sessionStorage.getItem('session_id') || 
          (() => {
            const id = Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('session_id', id);
            return id;
          })()
      };

      // Send to analytics endpoint (mock for now)
      console.log('Analytics:', data);
    };

    trackPageView();

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('Page hidden');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
}

// Performance monitoring
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor core web vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });

    // Monitor largest contentful paint
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('LCP:', entry.startTime);
      }
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP monitoring not supported');
    }

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
    };
  }, []);
}

// Combined performance optimization hook
export function usePerformanceOptimizations() {
  useLazyLoading();
  useResourcePreloading();
  useAnalytics();
  usePerformanceMonitoring();
}

// Component that applies all optimizations
export default function PerformanceOptimizations() {
  usePerformanceOptimizations();
  return null;
}