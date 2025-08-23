import { useEffect, useCallback } from 'react';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  category: 'navigation' | 'resource' | 'paint' | 'layout' | 'custom';
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;
    
    // Initialize performance monitoring
    this.setupPerformanceMonitoring();
    
    // Setup error tracking
    this.setupErrorTracking();
    
    // Setup user interaction tracking
    this.setupInteractionTracking();
    
    this.isInitialized = true;
  }

  private setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      // Monitor navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.trackPerformance({
              name: 'page_load',
              value: navEntry.loadEventEnd - navEntry.loadEventStart,
              category: 'navigation'
            });
          }
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });

      // Monitor paint timing
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'paint') {
            this.trackPerformance({
              name: entry.name,
              value: entry.startTime,
              category: 'paint'
            });
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.trackPerformance({
              name: 'resource_load',
              value: resourceEntry.duration,
              category: 'resource'
            });
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  private setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.track('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.track('unhandled_promise_rejection', {
        reason: event.reason
      });
    });
  }

  private setupInteractionTracking() {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        this.track('click', {
          element: target.tagName.toLowerCase(),
          text: target.textContent?.trim().substring(0, 50),
          href: (target as HTMLAnchorElement).href
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.track('form_submit', {
        form_id: form.id || 'unknown',
        form_action: form.action
      });
    });
  }

  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now()
    };

    this.events.push(analyticsEvent);
    
    // In a real app, you'd send this to your analytics service
    console.log('Analytics Event:', analyticsEvent);
    
    // Example: Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', event, properties);
    }
  }

  trackPerformance(metric: PerformanceMetric) {
    this.track('performance', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_category: metric.category
    });
  }

  trackPageView(page: string) {
    this.track('page_view', { page });
  }

  trackUserAction(action: string, properties?: Record<string, any>) {
    this.track('user_action', { action, ...properties });
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }
}

// Global analytics instance
export const analytics = new Analytics();

// React hooks for analytics
export const useAnalytics = () => {
  const track = useCallback((event: string, properties?: Record<string, any>) => {
    analytics.track(event, properties);
  }, []);

  const trackPageView = useCallback((page: string) => {
    analytics.trackPageView(page);
  }, []);

  const trackUserAction = useCallback((action: string, properties?: Record<string, any>) => {
    analytics.trackUserAction(action, properties);
  }, []);

  return { track, trackPageView, trackUserAction };
};

// Hook for tracking component performance
export const usePerformanceTracking = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      analytics.trackPerformance({
        name: `${componentName}_render`,
        value: duration,
        category: 'custom'
      });
    };
  }, [componentName]);
};

// Hook for tracking page views
export const usePageViewTracking = (page: string) => {
  useEffect(() => {
    analytics.trackPageView(page);
  }, [page]);
};

// Component for automatic analytics initialization
export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    analytics.init();
  }, []);

  return <>{children}</>;
};
