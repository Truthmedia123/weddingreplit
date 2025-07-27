import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const defaultSEO = {
  title: 'TheGoanWedding - Premier Wedding Vendor Directory in Goa',
  description: 'Discover the finest wedding vendors in Goa. From photographers to venues, caterers to decorators - find everything you need for your perfect Goan wedding.',
  keywords: 'goa wedding, wedding vendors goa, goan wedding, beach wedding goa, wedding photographers goa, wedding venues goa',
  image: '/og-image.jpg',
  url: 'https://thegoanwedding.com',
  type: 'website' as const,
};

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
}: SEOProps) {
  const seo = {
    title: title ? `${title} | TheGoanWedding` : defaultSEO.title,
    description: description || defaultSEO.description,
    keywords: keywords || defaultSEO.keywords,
    image: image || defaultSEO.image,
    url: url || defaultSEO.url,
    type,
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <meta name="author" content={author || 'TheGoanWedding'} />
      <link rel="canonical" href={seo.url} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={seo.type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content="TheGoanWedding" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:site" content="@thegoanwedding" />
      <meta name="twitter:creator" content="@thegoanwedding" />

      {/* Article specific tags */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        </>
      )}

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Geo tags for local SEO */}
      <meta name="geo.region" content="IN-GA" />
      <meta name="geo.placename" content="Goa, India" />
      <meta name="geo.position" content="15.2993;74.1240" />
      <meta name="ICBM" content="15.2993, 74.1240" />

      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "TheGoanWedding",
          "description": seo.description,
          "url": seo.url,
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${seo.url}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          },
          "sameAs": [
            "https://facebook.com/thegoanwedding",
            "https://instagram.com/thegoanwedding",
            "https://twitter.com/thegoanwedding"
          ]
        })}
      </script>
    </Helmet>
  );
}