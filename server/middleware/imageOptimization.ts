import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { createHash } from 'crypto';

interface ImageQuery {
  src: string;
  w?: string;
  h?: string;
  q?: string;
  f?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
}

const CACHE_DIR = path.join(process.cwd(), '.cache', 'images');
const MAX_AGE = 31536000; // 1 year in seconds

// Ensure cache directory exists
async function ensureCacheDir(): Promise<void> {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

// Generate cache key
function generateCacheKey(query: ImageQuery): string {
  const { src, w, h, q, f, fit } = query;
  const key = `${src}-${w || 'auto'}-${h || 'auto'}-${q || '80'}-${f || 'webp'}-${fit || 'cover'}`;
  return createHash('md5').update(key).digest('hex');
}

// Get cached image path
function getCachedImagePath(cacheKey: string, format: string): string {
  return path.join(CACHE_DIR, `${cacheKey}.${format}`);
}

// Check if cached image exists and is fresh
async function getCachedImage(cacheKey: string, format: string): Promise<Buffer | null> {
  try {
    const cachedPath = getCachedImagePath(cacheKey, format);
    const stats = await fs.stat(cachedPath);
    
    // Check if cache is still fresh (24 hours)
    const isStale = Date.now() - stats.mtime.getTime() > 24 * 60 * 60 * 1000;
    if (isStale) {
      await fs.unlink(cachedPath);
      return null;
    }
    
    return await fs.readFile(cachedPath);
  } catch {
    return null;
  }
}

// Save optimized image to cache
async function saveCachedImage(
  cacheKey: string, 
  format: string, 
  buffer: Buffer
): Promise<void> {
  try {
    const cachedPath = getCachedImagePath(cacheKey, format);
    await fs.writeFile(cachedPath, buffer);
  } catch (error) {
    console.error('Failed to save cached image:', error);
  }
}

// Optimize image with Sharp
async function optimizeImage(
  inputPath: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill';
  }
): Promise<Buffer> {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    fit = 'cover'
  } = options;

  let pipeline = sharp(inputPath);

  // Resize if dimensions provided
  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: fit as keyof sharp.FitEnum,
      withoutEnlargement: true,
    });
  }

  // Apply format and quality
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, progressive: true });
      break;
    case 'png':
      pipeline = pipeline.png({ quality });
      break;
  }

  return pipeline.toBuffer();
}

// Image optimization middleware
export async function imageOptimizationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as ImageQuery;
    const { src, w, h, q, f = 'webp', fit = 'cover' } = query;

    if (!src) {
      return res.status(400).json({ error: 'Source image required' });
    }

    // Ensure cache directory exists
    await ensureCacheDir();

    // Generate cache key
    const cacheKey = generateCacheKey(query);

    // Check for cached version
    const cachedImage = await getCachedImage(cacheKey, f);
    if (cachedImage) {
      res.set({
        'Content-Type': `image/${f}`,
        'Cache-Control': `public, max-age=${MAX_AGE}`,
        'ETag': cacheKey,
      });
      return res.send(cachedImage);
    }

    // Resolve source image path
    const sourcePath = path.join(process.cwd(), 'public', src);
    
    // Check if source exists
    try {
      await fs.access(sourcePath);
    } catch {
      return res.status(404).json({ error: 'Source image not found' });
    }

    // Optimize image
    const optimizedBuffer = await optimizeImage(sourcePath, {
      width: w ? parseInt(w) : undefined,
      height: h ? parseInt(h) : undefined,
      quality: q ? parseInt(q) : 80,
      format: f,
      fit,
    });

    // Cache optimized image
    await saveCachedImage(cacheKey, f, optimizedBuffer);

    // Send optimized image
    res.set({
      'Content-Type': `image/${f}`,
      'Cache-Control': `public, max-age=${MAX_AGE}`,
      'ETag': cacheKey,
    });
    
    res.send(optimizedBuffer);
  } catch (error) {
    console.error('Image optimization error:', error);
    next(error);
  }
}

// Clean up old cached images
export async function cleanupImageCache(): Promise<void> {
  try {
    const files = await fs.readdir(CACHE_DIR);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    for (const file of files) {
      const filePath = path.join(CACHE_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
}

// Schedule cache cleanup (run daily)
setInterval(cleanupImageCache, 24 * 60 * 60 * 1000);