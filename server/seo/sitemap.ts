import { Request, Response } from 'express';
import { storage } from '../storage';

export async function generateSitemap(req: Request, res: Response) {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://thegoanwedding.com';
    
    // Get dynamic content
    const [vendors, categories, blogPosts, weddings] = await Promise.all([
      storage.getVendors({}),
      storage.getCategories(),
      storage.getBlogPosts(true), // Only published posts
      storage.getWeddings(),
    ]);

    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/categories', priority: '0.9', changefreq: 'weekly' },
      { url: '/blog', priority: '0.8', changefreq: 'daily' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/list-business', priority: '0.8', changefreq: 'monthly' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/terms-conditions', priority: '0.3', changefreq: 'yearly' },
      { url: '/cookie-policy', priority: '0.3', changefreq: 'yearly' },
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`;
    });

    // Add category pages
    categories.forEach(category => {
      sitemap += `
  <url>
    <loc>${baseUrl}/vendors/${category.slug}</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`;
    });

    // Add vendor pages
    vendors.forEach(vendor => {
      sitemap += `
  <url>
    <loc>${baseUrl}/vendor/${vendor.id}</loc>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
    <lastmod>${vendor.updatedAt ? new Date(vendor.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
  </url>`;
    });

    // Add blog posts
    blogPosts.forEach(post => {
      sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
    <lastmod>${post.updatedAt ? new Date(post.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
  </url>`;
    });

    // Add public wedding pages
    weddings.filter(w => w.isPublic).forEach(wedding => {
      sitemap += `
  <url>
    <loc>${baseUrl}/couples/${wedding.slug}</loc>
    <priority>0.5</priority>
    <changefreq>monthly</changefreq>
    <lastmod>${wedding.updatedAt ? new Date(wedding.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

export function generateRobotsTxt(req: Request, res: Response) {
  const baseUrl = process.env.FRONTEND_URL || 'https://thegoanwedding.com';
  
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*ref=*

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1

# Specific bot instructions
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /`;

  res.set('Content-Type', 'text/plain');
  res.send(robotsTxt);
}