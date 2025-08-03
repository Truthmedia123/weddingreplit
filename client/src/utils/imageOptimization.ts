/**
 * Utility functions for image optimization and lazy loading
 */

/**
 * Generates an optimized image URL using the image optimization API
 * @param originalUrl - The original image URL
 * @param options - Optimization options
 * @returns Optimized image URL for production, original URL for development
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string => {
  // In development, return original URL
  if (process.env.NODE_ENV === 'development') {
    return originalUrl;
  }

  // In production, use the optimization API
  const params = new URLSearchParams();
  params.set('src', originalUrl);
  
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);

  return `/api/images/optimize?${params.toString()}`;
};

/**
 * Default image optimization settings for different use cases
 */
export const imageOptimizationPresets = {
  hero: { width: 2000, height: 800, quality: 85, format: 'webp' as const },
  card: { width: 800, height: 400, quality: 80, format: 'webp' as const },
  thumbnail: { width: 300, height: 300, quality: 75, format: 'webp' as const },
  gallery: { width: 800, height: 600, quality: 85, format: 'webp' as const },
  profile: { width: 800, height: 500, quality: 80, format: 'webp' as const },
  cover: { width: 2000, height: 800, quality: 85, format: 'webp' as const },
  small: { width: 100, height: 80, quality: 70, format: 'webp' as const },
};