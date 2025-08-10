import React from 'react';
import { getOptimizedImageUrl, imageOptimizationPresets } from '@/utils/imageOptimization';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  preset?: keyof typeof imageOptimizationPresets;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Optimized Image component with lazy loading and automatic optimization
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  preset,
  width,
  height,
  quality,
  format,
  loading = 'lazy',
  decoding = 'async',
  ...props
}) => {
  // Use preset if provided, otherwise use custom options
  const optimizationOptions = preset 
    ? imageOptimizationPresets[preset]
    : { width, height, quality, format };

  const optimizedSrc = getOptimizedImageUrl(src, optimizationOptions);

  // For local images, try to use optimized versions
  if (src.startsWith('/images/')) {
    const baseName = src.replace('/images/', '').replace(/\.[^/.]+$/, '');
    
    return (
      <picture>
        <source 
          srcSet={`/images/optimized/${baseName}.avif`} 
          type="image/avif" 
        />
        <source 
          srcSet={`/images/optimized/${baseName}.webp`} 
          type="image/webp" 
        />
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          {...props}
          onError={(e) => {
            // Fallback to original if optimized versions fail
            e.currentTarget.src = src;
          }}
        />
      </picture>
    );
  }

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      {...props}
    />
  );
};

export default OptimizedImage;