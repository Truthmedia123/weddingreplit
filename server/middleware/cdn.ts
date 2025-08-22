/**
 * 🌐 CDN Integration Middleware
 * 
 * This module provides comprehensive CDN integration for static assets
 * including caching strategies, fallback mechanisms, and performance optimization.
 */

import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

// CDN Configuration
interface CDNConfig {
  enabled: boolean;
  baseUrl?: string;
  images: boolean;
  assets: boolean;
  cacheControl: {
    images: string;
    assets: string;
    fonts: string;
    css: string;
    js: string;
  };
  fallback: {
    enabled: boolean;
    localPath: string;
  };
  optimization: {
    webp: boolean;
    avif: boolean;
    responsive: boolean;
  };
}

const DEFAULT_CDN_CONFIG: CDNConfig = {
  enabled: process.env.NODE_ENV === 'production',
  baseUrl: process.env.CDN_BASE_URL || '',
  images: true,
  assets: true,
  cacheControl: {
    images: 'public, max-age=31536000, immutable', // 1 year
    assets: 'public, max-age=31536000, immutable', // 1 year
    fonts: 'public, max-age=31536000, immutable', // 1 year
    css: 'public, max-age=86400, stale-while-revalidate=604800', // 1 day + 1 week stale
    js: 'public, max-age=86400, stale-while-revalidate=604800', // 1 day + 1 week stale
  },
  fallback: {
    enabled: true,
    localPath: 'client/public',
  },
  optimization: {
    webp: true,
    avif: true,
    responsive: true,
  },
};

/**
 * Generate CDN URL for static assets
 */
export function generateCDNUrl(filePath: string, config: CDNConfig = DEFAULT_CDN_CONFIG): string {
  if (!config.enabled || !config.baseUrl) {
    return filePath;
  }

  // Remove leading slash
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  
  // Generate hash for cache busting
  const hash = generateFileHash(filePath);
  const ext = path.extname(filePath);
  const nameWithoutExt = path.basename(filePath, ext);
  
  // Add hash to filename
  const hashedFilename = `${nameWithoutExt}.${hash}${ext}`;
  const cdnPath = path.dirname(cleanPath) === '.' ? hashedFilename : path.join(path.dirname(cleanPath), hashedFilename);
  
  return `${config.baseUrl}/${cdnPath}`;
}

/**
 * Generate hash for file cache busting
 */
function generateFileHash(filePath: string): string {
  try {
    // In production, this would be based on file content
    // For now, use a simple hash based on filename and modification time
    const stats = await fs.stat(filePath);
    const content = `${filePath}-${stats.mtime.getTime()}`;
    return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
  } catch {
    // Fallback to timestamp-based hash
    return Date.now().toString(36);
  }
}

/**
 * CDN middleware for serving static assets
 */
export function cdnMiddleware(config: CDNConfig = DEFAULT_CDN_CONFIG) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!config.enabled) {
      return next();
    }

    const filePath = req.path;
    
    // Check if this is a static asset
    if (isStaticAsset(filePath)) {
      try {
        // Try to serve from CDN first
        const cdnUrl = generateCDNUrl(filePath, config);
        
        if (cdnUrl !== filePath) {
          // Set appropriate cache headers
          setCacheHeaders(res, filePath, config);
          
          // Redirect to CDN
          res.redirect(301, cdnUrl);
          return;
        }
      } catch (error) {
        console.warn(`CDN redirect failed for ${filePath}:`, error);
      }
    }
    
    next();
  };
}

/**
 * Check if path is a static asset
 */
function isStaticAsset(filePath: string): boolean {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif', '.woff', '.woff2', '.ttf', '.eot'];
  const ext = path.extname(filePath).toLowerCase();
  
  return staticExtensions.includes(ext) || 
         filePath.startsWith('/images/') || 
         filePath.startsWith('/assets/') ||
         filePath.startsWith('/fonts/');
}

/**
 * Set appropriate cache headers based on file type
 */
function setCacheHeaders(res: Response, filePath: string, config: CDNConfig): void {
  const ext = path.extname(filePath).toLowerCase();
  
  let cacheControl: string;
  
  switch (ext) {
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.gif':
    case '.svg':
    case '.webp':
    case '.avif':
      cacheControl = config.cacheControl.images;
      break;
    case '.woff':
    case '.woff2':
    case '.ttf':
    case '.eot':
      cacheControl = config.cacheControl.fonts;
      break;
    case '.css':
      cacheControl = config.cacheControl.css;
      break;
    case '.js':
      cacheControl = config.cacheControl.js;
      break;
    default:
      cacheControl = config.cacheControl.assets;
  }
  
  res.set('Cache-Control', cacheControl);
  res.set('Vary', 'Accept-Encoding');
}

/**
 * Fallback middleware for serving local assets when CDN is unavailable
 */
export function cdnFallbackMiddleware(config: CDNConfig = DEFAULT_CDN_CONFIG) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!config.enabled || !config.fallback.enabled) {
      return next();
    }

    const filePath = req.path;
    
    if (isStaticAsset(filePath)) {
      try {
        // Check if file exists locally
        const localPath = path.join(config.fallback.localPath, filePath);
        await fs.access(localPath);
        
        // Set cache headers
        setCacheHeaders(res, filePath, config);
        
        // Serve local file
        res.sendFile(localPath);
        return;
      } catch (error) {
        // File doesn't exist locally, continue to next middleware
        console.warn(`Local fallback not found for ${filePath}:`, error);
      }
    }
    
    next();
  };
}

/**
 * Image optimization middleware
 */
export function imageOptimizationMiddleware(config: CDNConfig = DEFAULT_CDN_CONFIG) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!config.enabled || !config.optimization.webp) {
      return next();
    }

    const filePath = req.path;
    const ext = path.extname(filePath).toLowerCase();
    
    // Check if this is an image request
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const acceptHeader = req.get('Accept') || '';
      
      // Check if browser supports WebP
      if (acceptHeader.includes('image/webp')) {
        const webpPath = filePath.replace(ext, '.webp');
        const cdnUrl = generateCDNUrl(webpPath, config);
        
        if (cdnUrl !== webpPath) {
          res.redirect(301, cdnUrl);
          return;
        }
      }
      
      // Check if browser supports AVIF
      if (config.optimization.avif && acceptHeader.includes('image/avif')) {
        const avifPath = filePath.replace(ext, '.avif');
        const cdnUrl = generateCDNUrl(avifPath, config);
        
        if (cdnUrl !== avifPath) {
          res.redirect(301, cdnUrl);
          return;
        }
      }
    }
    
    next();
  };
}

/**
 * Responsive image middleware
 */
export function responsiveImageMiddleware(config: CDNConfig = DEFAULT_CDN_CONFIG) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!config.enabled || !config.optimization.responsive) {
      return next();
    }

    const filePath = req.path;
    const ext = path.extname(filePath).toLowerCase();
    
    // Check if this is an image request
    if (['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) {
      const width = req.query.w || req.query.width;
      const height = req.query.h || req.query.height;
      
      if (width || height) {
        // Generate responsive image URL
        const responsivePath = generateResponsiveImagePath(filePath, width, height);
        const cdnUrl = generateCDNUrl(responsivePath, config);
        
        if (cdnUrl !== responsivePath) {
          res.redirect(301, cdnUrl);
          return;
        }
      }
    }
    
    next();
  };
}

/**
 * Generate responsive image path
 */
function generateResponsiveImagePath(originalPath: string, width?: any, height?: any): string {
  const ext = path.extname(originalPath);
  const nameWithoutExt = path.basename(originalPath, ext);
  const dir = path.dirname(originalPath);
  
  let responsiveName = nameWithoutExt;
  
  if (width) {
    responsiveName += `-w${width}`;
  }
  
  if (height) {
    responsiveName += `-h${height}`;
  }
  
  return path.join(dir, `${responsiveName}${ext}`);
}

/**
 * CDN health check
 */
export async function checkCDNHealth(config: CDNConfig = DEFAULT_CDN_CONFIG): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  error?: string;
}> {
  if (!config.enabled || !config.baseUrl) {
    return {
      status: 'healthy',
      responseTime: 0,
    };
  }

  const startTime = Date.now();
  
  try {
    const response = await fetch(`${config.baseUrl}/health`, {
      method: 'HEAD',
      // timeout: 5000, // Not supported in fetch
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        status: responseTime > 2000 ? 'degraded' : 'healthy',
        responseTime,
      };
    } else {
      return {
        status: 'unhealthy',
        responseTime,
        error: `CDN returned status ${response.status}`,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Complete CDN setup
 */
export function setupCDN(app: any, config: CDNConfig = DEFAULT_CDN_CONFIG) {
  if (config.enabled) {
    // Add CDN middleware
    app.use(cdnMiddleware(config));
    
    // Add image optimization
    app.use(imageOptimizationMiddleware(config));
    
    // Add responsive images
    app.use(responsiveImageMiddleware(config));
    
    // Add fallback middleware (should be last)
    app.use(cdnFallbackMiddleware(config));
    
    console.log('✅ CDN integration configured');
  } else {
    console.log('ℹ️  CDN integration disabled (development mode)');
  }
}

export default {
  generateCDNUrl,
  cdnMiddleware,
  cdnFallbackMiddleware,
  imageOptimizationMiddleware,
  responsiveImageMiddleware,
  checkCDNHealth,
  setupCDN,
};
