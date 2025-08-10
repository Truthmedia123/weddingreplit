import React, { useState } from 'react';
import { getOptimizedImageUrl, imageOptimizationPresets } from '@/utils/imageOptimization';
import PlaceholderImage from './PlaceholderImage';

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
  className = '',
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Use preset if provided, otherwise use custom options
  const optimizationOptions = preset 
    ? imageOptimizationPresets[preset]
    : { width, height, quality, format };

  const optimizedSrc = getOptimizedImageUrl(src, optimizationOptions);

  // Handle image error
  const handleImageError = () => {
    console.warn(`Failed to load image: ${src}`);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // If image failed to load, show placeholder
  if (imageError) {
    const presetDimensions = preset ? imageOptimizationPresets[preset] : {};
    return (
      <PlaceholderImage
        width={width || presetDimensions.width || 800}
        height={height || presetDimensions.height || 600}
        text={alt}
        className={className}
        alt={alt}
        gradient="from-teal-400 via-blue-500 to-purple-600"
      />
    );
  }

  // For local images, try to use optimized versions
  if (src.startsWith('/images/')) {
    const baseName = src.replace('/images/', '').replace(/\.[^/.]+$/, '');
    
    return (
      <div className="relative">
        {!imageLoaded && (
          <div className={`absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ${className}`} />
        )}
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
            className={className}
            onError={handleImageError}
            onLoad={handleImageLoad}
            {...props}
          />
        </picture>
      </div>
    );
  }

  return (
    <div className="relative">
      {!imageLoaded && (
        <div className={`absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ${className}`} />
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;