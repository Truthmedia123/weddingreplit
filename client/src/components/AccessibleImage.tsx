import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface AccessibleImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt: string; // Make alt required
  fallbackSrc?: string;
  aspectRatio?: 'square' | '4/3' | '16/9' | '3/2' | '2/3';
  priority?: boolean;
}

export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  src,
  alt,
  fallbackSrc = '/placeholder-image.jpg',
  aspectRatio,
  priority = false,
  className,
  onError,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setIsLoading(false);
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
    onError?.(e);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const aspectRatioClasses = {
    'square': 'aspect-square',
    '4/3': 'aspect-4/3',
    '16/9': 'aspect-video',
    '3/2': 'aspect-3/2',
    '2/3': 'aspect-2/3',
  };

  return (
    <div className={cn(
      'relative overflow-hidden',
      aspectRatio && aspectRatioClasses[aspectRatio],
      className
    )}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          hasError && 'filter grayscale'
        )}
        {...props}
      />
      
      {hasError && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-sm"
          aria-hidden="true"
        >
          Image unavailable
        </div>
      )}
    </div>
  );
};