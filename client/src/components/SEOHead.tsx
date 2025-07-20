interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  schemaData?: any;
}

export default function SEOHead({ 
  title = "TheGoanWedding.com | Premium Wedding Vendors in Goa",
  description = "Discover Goa's finest wedding vendors, venues, photographers, and services. Create your perfect beach wedding with authentic Goan style. Verified vendors, real reviews.",
  keywords = "Goa wedding vendors, beach wedding Goa, wedding venues Goa, wedding photography Goa, Goan wedding traditions, destination wedding India",
  ogImage = "/og-image.jpg",
  ogUrl,
  schemaData
}: SEOHeadProps) {
  
  const currentUrl = ogUrl || (typeof window !== 'undefined' ? window.location.href : '');
  
  // Set document title and meta tags
  if (typeof document !== 'undefined') {
    document.title = title;
    
    // Update or create meta tags
    const updateMeta = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('robots', 'index, follow');
    updateMeta('author', 'TheGoanWedding.com');
    updateMeta('viewport', 'width=device-width, initial-scale=1.0');
    
    // Open Graph tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:url', currentUrl, true);
    updateMeta('og:type', 'website', true);
    updateMeta('og:site_name', 'TheGoanWedding.com', true);
    
    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);
    
    // Structured data
    if (schemaData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schemaData);
    }
  }
  
  return null;
}