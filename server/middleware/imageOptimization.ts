/**
 * 🖼️ Image Optimization Middleware
 * 
 * This middleware provides comprehensive image optimization including:
 * - WebP/AVIF format conversion
 * - Responsive image generation
 * - Lazy loading headers
 * - Caching optimization
 * - User upload compression
 */

import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { createHash } from 'crypto';

// Supported image formats
// const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'];
// const MODERN_FORMATS = ['webp', 'avif'];

// Responsive breakpoints
const RESPONSIVE_BREAKPOINTS = [320, 640, 768, 1024, 1280, 1920];

// Image optimization configuration
interface ImageOptimizationConfig {
  quality: number;
  progressive: boolean;
  mozjpeg: boolean;
  webp: {
    quality: number;
    effort: number;
  };
  avif: {
    quality: number;
    effort: number;
  };
  resize: {
    width?: number;
    height?: number;
    fit: keyof sharp.FitEnum;
    withoutEnlargement: boolean;
  };
}

const DEFAULT_CONFIG: ImageOptimizationConfig = {
  quality: 85,
  progressive: true,
  mozjpeg: true,
  webp: {
    quality: 80,
    effort: 4,
  },
  avif: {
    quality: 75,
    effort: 4,
  },
  resize: {
    fit: 'inside',
    withoutEnlargement: true,
  },
};

// Cache configuration
const CACHE_CONFIG = {
  maxAge: 31536000, // 1 year
  immutable: true,
  public: true,
};

/**
 * Generate a cache key for an image optimization request
 */
function generateCacheKey(
  imagePath: string,
  format: string,
  width?: number,
  height?: number,
  quality?: number
): string {
  const data = `${imagePath}-${format}-${width || 'auto'}-${height || 'auto'}-${quality || 'default'}`;
  return createHash('md5').update(data).digest('hex');
}

/**
 * Get the best supported format for the client
 */
function getBestFormat(acceptHeader: string = ''): string {
  const accept = acceptHeader.toLowerCase();
  
  if (accept.includes('image/avif')) {
    return 'avif';
  }
  if (accept.includes('image/webp')) {
    return 'webp';
  }
  return 'jpeg';
}

/**
 * Generate responsive image sizes
 */
// async function generateResponsiveImages(
//   imagePath: string,
//   outputDir: string,
//   format: string = 'webp'
// ): Promise<Array<{ width: number; path: string; size: number }>> {
//   const results = [];
//   
//   try {
//     const image = sharp(imagePath);
//     const metadata = await image.metadata();
//     const originalWidth = metadata.width || 1920;
//     
//     for (const width of RESPONSIVE_BREAKPOINTS) {
//       if (width <= originalWidth) {
//         const filename = `${path.parse(imagePath).name}-${width}w.${format}`;
//         const outputPath = path.join(outputDir, filename);
//         
//         let pipeline = image.clone().resize(width, null, {
//           fit: 'inside',
//           withoutEnlargement: true,
//         });
//         
//         // Apply format-specific optimizations
//         switch (format) {
//           case 'webp':
//             pipeline = pipeline.webp({
//               quality: DEFAULT_CONFIG.webp.quality,
//               effort: DEFAULT_CONFIG.webp.effort,
//             });
//             break;
//           case 'avif':
//             pipeline = pipeline.avif({
//               quality: DEFAULT_CONFIG.avif.quality,
//               effort: DEFAULT_CONFIG.avif.effort,
//             });
//             break;
//           case 'jpeg':
//             pipeline = pipeline.jpeg({
//               quality: DEFAULT_CONFIG.quality,
//               progressive: DEFAULT_CONFIG.progressive,
//               mozjpeg: DEFAULT_CONFIG.mozjpeg,
//             });
//             break;
//           case 'png':
//             pipeline = pipeline.png({
//               quality: DEFAULT_CONFIG.quality,
//               progressive: DEFAULT_CONFIG.progressive,
//             });
//             break;
//         }
//         
//         const info = await pipeline.toFile(outputPath);
//         
//         results.push({
//           width,
//           path: outputPath,
//           size: info.size,
//         });
//       }
//     }
//     
//     return results;
//   } catch (error) {
//     console.error('Error generating responsive images:', error);
//     return [];
//   }
// }

/**
 * Optimize single image
 */
async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: Partial<ImageOptimizationConfig> = {}
): Promise<{ size: number; format: string }> {
  const config = { ...DEFAULT_CONFIG, ...options };
  
  try {
    let pipeline = sharp(inputPath);
    
    // Apply resize if specified
    if (config.resize.width || config.resize.height) {
      pipeline = pipeline.resize(
        config.resize.width,
        config.resize.height,
        config.resize
      );
    }
    
    // Determine output format from file extension
    const ext = path.extname(outputPath).toLowerCase().slice(1);
    
    switch (ext) {
      case 'webp':
        pipeline = pipeline.webp(config.webp);
        break;
      case 'avif':
        pipeline = pipeline.avif(config.avif);
        break;
      case 'jpg':
      case 'jpeg':
        pipeline = pipeline.jpeg({
          quality: config.quality,
          progressive: config.progressive,
          mozjpeg: config.mozjpeg,
        });
        break;
      case 'png':
        pipeline = pipeline.png({
          quality: config.quality,
          progressive: config.progressive,
        });
        break;
      default:
        throw new Error(`Unsupported format: ${ext}`);
    }
    
    const info = await pipeline.toFile(outputPath);
    
    return {
      size: info.size,
      format: ext,
    };
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw error;
  }
}

/**
 * Image optimization middleware
 */
export function imageOptimizationMiddleware(options: {
  cacheDir?: string;
  enableResponsive?: boolean;
  enableModernFormats?: boolean;
} = {}) {
  const {
    cacheDir = 'dist/public/images/optimized',
    // enableResponsive = true,
    enableModernFormats = true,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only process image requests
    if (!req.path.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i)) {
      return next();
    }

    try {
      const imagePath = path.join(process.cwd(), 'client/public', req.path);
      
      // Check if original image exists
      try {
        await fs.access(imagePath);
      } catch {
        return next(); // Image doesn't exist, let other middleware handle
      }

      // Parse query parameters
      const width = req.query.w ? parseInt(req.query.w as string) : undefined;
      const height = req.query.h ? parseInt(req.query.h as string) : undefined;
      const quality = req.query.q ? parseInt(req.query.q as string) : undefined;
      const format = req.query.f as string || (enableModernFormats ? getBestFormat(req.headers.accept) : 'jpeg');

      // Generate cache key
      const cacheKey = generateCacheKey(imagePath, format, width, height, quality);
      const cachedImagePath = path.join(cacheDir, `${cacheKey}.${format}`);

      // Ensure cache directory exists
      await fs.mkdir(path.dirname(cachedImagePath), { recursive: true });

      // Check if cached version exists
      let shouldRegenerate = true;
      try {
        const cachedStat = await fs.stat(cachedImagePath);
        const originalStat = await fs.stat(imagePath);
        
        // Use cached version if it's newer than original
        if (cachedStat.mtime > originalStat.mtime) {
          shouldRegenerate = false;
        }
      } catch {
        // Cached version doesn't exist
      }

      // Generate optimized image if needed
      if (shouldRegenerate) {
        await optimizeImage(imagePath, cachedImagePath, {
          resize: { 
            width: width || undefined, 
            height: height || undefined, 
            fit: 'inside', 
            withoutEnlargement: true 
          },
          quality,
        });
      }

      // Set caching headers
      res.set({
        'Cache-Control': `public, max-age=${CACHE_CONFIG.maxAge}, immutable`,
        'ETag': cacheKey,
        'Vary': 'Accept',
        'Content-Type': `image/${format}`,
      });

      // Check if client has cached version
      if (req.headers['if-none-match'] === cacheKey) {
        return res.status(304).end();
      }

      // Serve optimized image
      const optimizedImage = await fs.readFile(cachedImagePath);
      res.end(optimizedImage);

    } catch (error) {
      console.error('Image optimization error:', error);
      next(); // Fallback to serving original image
    }
  };
}

/**
 * Compress user uploaded images
 */
export async function compressUploadedImage(
  file: any, // Express.Multer.File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    formats?: string[];
  } = {}
): Promise<{
  original: Buffer;
  optimized: { [format: string]: Buffer };
  metadata: sharp.Metadata;
}> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    formats = ['webp', 'jpeg'],
  } = options;

  try {
    const image = sharp(file.buffer);
    const metadata = await image.metadata();
    
    // Base pipeline with resize
    const basePipeline = image.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });

    const optimized: { [format: string]: Buffer } = {};

    // Generate optimized versions in different formats
    for (const format of formats) {
      let pipeline = basePipeline.clone();
      
      switch (format) {
        case 'webp':
          pipeline = pipeline.webp({ quality, effort: 4 });
          break;
        case 'avif':
          pipeline = pipeline.avif({ quality: quality - 10, effort: 4 });
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
          break;
        case 'png':
          pipeline = pipeline.png({ quality, progressive: true });
          break;
      }
      
      optimized[format] = await pipeline.toBuffer();
    }

    return {
      original: file.buffer,
      optimized,
      metadata,
    };
  } catch (error) {
    console.error('Error compressing uploaded image:', error);
    throw error;
  }
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  _basePath: string,
  sizes: Array<{ width: number; path: string }>
): string {
  return sizes
    .map(({ width, path }) => `${path} ${width}w`)
    .join(', ');
}

/**
 * Generate picture element with fallbacks
 */
export function generatePictureElement(
  src: string,
  alt: string,
  options: {
    sizes?: string;
    className?: string;
    loading?: 'lazy' | 'eager';
    modernFormats?: string[];
    fallbackFormat?: string;
  } = {}
): string {
  const {
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    className = '',
    loading = 'lazy',
    modernFormats = ['avif', 'webp'],
    fallbackFormat = 'jpeg',
  } = options;

  const baseName = path.parse(src).name;
  const basePath = path.dirname(src);

  let sources = '';
  
  // Generate modern format sources
  for (const format of modernFormats) {
    const srcset = RESPONSIVE_BREAKPOINTS
      .map(width => `${basePath}/${baseName}-${width}w.${format} ${width}w`)
      .join(', ');
    
    sources += `<source type="image/${format}" srcset="${srcset}" sizes="${sizes}">`;
  }

  // Fallback source
  const fallbackSrcset = RESPONSIVE_BREAKPOINTS
    .map(width => `${basePath}/${baseName}-${width}w.${fallbackFormat} ${width}w`)
    .join(', ');

  return `
    <picture class="${className}">
      ${sources}
      <img
        src="${src}"
        srcset="${fallbackSrcset}"
        sizes="${sizes}"
        alt="${alt}"
        loading="${loading}"
        decoding="async"
      >
    </picture>
  `.trim();
}

export default imageOptimizationMiddleware;