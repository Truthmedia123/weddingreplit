// SEO Meta Tags and Social Media Sharing
export interface MetaTagsData {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
  siteName?: string;
  locale?: string;
}

export function generateMetaTags(data: MetaTagsData) {
  const baseUrl = process.env.SITE_URL || 'https://thegoanwedding.com';
  const siteName = process.env.SITE_NAME || 'The Goan Wedding';
  const twitterHandle = process.env.TWITTER_HANDLE || '@thegoanwedding';
  const facebookAppId = process.env.FACEBOOK_APP_ID;

  const fullUrl = data.url.startsWith('http') ? data.url : `${baseUrl}${data.url}`;
  const imageUrl = data.image ? (data.image.startsWith('http') ? data.image : `${baseUrl}${data.image}`) : `${baseUrl}/og-image.jpg`;

  return {
    // Basic Meta Tags
    title: data.title,
    description: data.description,
    canonical: fullUrl,
    
    // Open Graph (Facebook, LinkedIn, etc.)
    openGraph: {
      type: data.type || 'website',
      title: data.title,
      description: data.description,
      url: fullUrl,
      siteName: data.siteName || siteName,
      locale: data.locale || 'en_US',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: data.title,
        }
      ],
      ...(facebookAppId && { appId: facebookAppId })
    },
    
    // Twitter Cards
    twitter: {
      card: 'summary_large_image',
      site: twitterHandle,
      creator: twitterHandle,
      title: data.title,
      description: data.description,
      image: imageUrl,
    },
    
    // Additional SEO tags
    additionalMetaTags: [
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        name: 'robots',
        content: 'index, follow'
      },
      {
        name: 'author',
        content: siteName
      },
      {
        name: 'keywords',
        content: 'goan wedding, wedding vendors, wedding planning, goa weddings, wedding directory'
      },
      {
        property: 'og:locale',
        content: data.locale || 'en_US'
      }
    ]
  };
}

export function generateVendorMetaTags(vendor: any) {
  return generateMetaTags({
    title: `${vendor.name} - ${vendor.category} in ${vendor.location}`,
    description: `${vendor.description.substring(0, 160)}...`,
    url: `/vendors/${vendor.id}`,
    image: vendor.profileImage || vendor.coverImage,
    type: 'business.business'
  });
}

export function generateCategoryMetaTags(category: any) {
  return generateMetaTags({
    title: `${category.name} in Goa - Wedding Vendors Directory`,
    description: `Find the best ${category.name.toLowerCase()} for your Goan wedding. Browse verified vendors with reviews and pricing.`,
    url: `/categories/${category.slug}`,
    type: 'website'
  });
}

export function generateWeddingMetaTags(wedding: any) {
  return generateMetaTags({
    title: `${wedding.brideName} & ${wedding.groomName} Wedding`,
    description: `Join ${wedding.brideName} and ${wedding.groomName} for their wedding celebration in ${wedding.venue || 'Goa'}.`,
    url: `/couples/${wedding.slug}`,
    image: wedding.coverImage,
    type: 'article'
  });
}

export function generateBlogMetaTags(post: any) {
  return generateMetaTags({
    title: post.title,
    description: post.excerpt,
    url: `/blog/${post.slug}`,
    image: post.featuredImage,
    type: 'article'
  });
}