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