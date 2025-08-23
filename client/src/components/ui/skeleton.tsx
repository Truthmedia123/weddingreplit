import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'h-4',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={index === lines - 1 ? { width: '60%' } : style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Predefined skeleton components
export const VendorCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
    <div className="flex items-center space-x-3">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton width="70%" />
        <Skeleton width="50%" />
      </div>
    </div>
    <Skeleton lines={2} />
    <div className="flex justify-between items-center">
      <Skeleton width="30%" />
      <Skeleton width="20%" />
    </div>
  </div>
);

export const CategoryCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 text-center space-y-3">
    <Skeleton variant="circular" width={64} height={64} className="mx-auto" />
    <Skeleton width="60%" className="mx-auto" />
    <Skeleton width="40%" className="mx-auto" />
  </div>
);

export const BlogPostSkeleton: React.FC = () => (
  <article className="bg-white rounded-lg shadow-md overflow-hidden">
    <Skeleton height={200} className="w-full" />
    <div className="p-6 space-y-3">
      <Skeleton width="80%" />
      <Skeleton lines={3} />
      <div className="flex space-x-2">
        <Skeleton width="20%" />
        <Skeleton width="15%" />
      </div>
    </div>
  </article>
);
