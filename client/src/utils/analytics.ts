// Google Analytics 4 Integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_TRACKING_ID = process.env.GOOGLE_ANALYTICS_ID || '';

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return;

  // Create script tag for gtag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });

  console.log('✅ Google Analytics initialized');
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return;

  window.gtag('config', GA_TRACKING_ID, {
    page_title: title || document.title,
    page_location: url,
  });
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
};

// Track vendor interactions
export const trackVendorView = (vendorId: number, vendorName: string, category: string) => {
  trackEvent('view_vendor', 'vendor_interaction', `${vendorName} (${category})`, vendorId);
};

export const trackVendorContact = (vendorId: number, vendorName: string, contactMethod: string) => {
  trackEvent('contact_vendor', 'vendor_interaction', `${vendorName} via ${contactMethod}`, vendorId);
};

// Track wedding interactions
export const trackWeddingView = (weddingId: number, coupleName: string) => {
  trackEvent('view_wedding', 'wedding_interaction', coupleName, weddingId);
};

export const trackRSVPSubmission = (weddingId: number, coupleName: string) => {
  trackEvent('submit_rsvp', 'wedding_interaction', coupleName, weddingId);
};

// Track invitation generation
export const trackInvitationGeneration = (success: boolean) => {
  trackEvent(success ? 'generate_invitation_success' : 'generate_invitation_error', 'invitation', success ? 'Success' : 'Error');
};

// Track search behavior
export const trackSearch = (query: string, category?: string, resultsCount?: number) => {
  trackEvent('search', 'user_behavior', `${query}${category ? ` in ${category}` : ''}`, resultsCount);
};

// Track user engagement
export const trackTimeOnPage = (pageName: string, timeInSeconds: number) => {
  trackEvent('time_on_page', 'engagement', pageName, Math.round(timeInSeconds));
};

// Track business submissions
export const trackBusinessSubmission = (category: string) => {
  trackEvent('submit_business', 'business_interaction', category);
};

// Track contact form submissions
export const trackContactSubmission = (formType: string) => {
  trackEvent('submit_contact', 'contact_interaction', formType);
};

// Enhanced ecommerce tracking (for future premium features)
export const trackPurchase = (transactionId: string, value: number, currency: string = 'INR') => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return;

  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value,
    currency,
  });
};

// Track user demographics (with consent)
export const trackUserDemographics = (location?: string, interests?: string[]) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return;

  window.gtag('event', 'user_demographics', {
    custom_parameter_location: location,
    custom_parameter_interests: interests?.join(','),
  });
};

// Privacy-compliant tracking
export const setAnalyticsConsent = (granted: boolean) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return;

  window.gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: granted ? 'granted' : 'denied',
  });
};