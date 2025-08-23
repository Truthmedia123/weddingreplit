/**
 * 📱 Mobile-First Responsive Design Optimizations
 * 
 * This component provides comprehensive mobile optimizations including:
 * - Touch-friendly interactions (minimum 44px touch targets)
 * - Mobile-specific layouts for vendor cards
 * - Swipe gestures for image galleries
 * - Mobile performance optimizations
 * - Horizontal scrolling fixes
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMediaQuery } from '../hooks/use-mobile';

// Touch-friendly button component
interface TouchButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'primary',
  size = 'md'
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  // Ensure minimum 44px touch target on mobile
  const mobileClasses = isMobile ? 'min-h-[44px] min-w-[44px]' : '';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${mobileClasses}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// Mobile-optimized vendor card
interface MobileVendorCardProps {
  vendor: {
    id: string;
    name: string;
    category: string;
    description: string;
    image?: string;
    rating?: number;
    price?: string;
  };
  onClick?: () => void;
}

export const MobileVendorCard: React.FC<MobileVendorCardProps> = ({
  vendor,
  onClick
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) {
    return (
      <div 
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95"
        onClick={onClick}
      >
        <div className="flex items-start space-x-3">
          {vendor.image && (
            <div className="flex-shrink-0">
              <img
                src={vendor.image}
                alt={vendor.name}
                className="w-16 h-16 rounded-lg object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {vendor.name}
            </h3>
            <p className="text-sm text-blue-600 font-medium">
              {vendor.category}
            </p>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {vendor.description}
            </p>
            <div className="flex items-center justify-between mt-2">
              {vendor.rating && (
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-gray-600">{vendor.rating}</span>
                </div>
              )}
              {vendor.price && (
                <span className="text-sm font-semibold text-green-600">
                  {vendor.price}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Desktop layout
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md"
      onClick={onClick}
    >
      {vendor.image && (
        <img
          src={vendor.image}
          alt={vendor.name}
          className="w-full h-48 rounded-lg object-cover mb-4"
          loading="lazy"
        />
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {vendor.name}
      </h3>
      <p className="text-blue-600 font-medium mb-2">
        {vendor.category}
      </p>
      <p className="text-gray-600 mb-4">
        {vendor.description}
      </p>
      <div className="flex items-center justify-between">
        {vendor.rating && (
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="text-gray-600">{vendor.rating}</span>
          </div>
        )}
        {vendor.price && (
          <span className="font-semibold text-green-600">
            {vendor.price}
          </span>
        )}
      </div>
    </div>
  );
};

// Swipeable image gallery
interface SwipeableGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
}

export const SwipeableGallery: React.FC<SwipeableGalleryProps> = ({
  images,
  alt = 'Gallery',
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return;
    setIsDragging(true);
    setStartX(e.touches[0]?.clientX || 0);
    setTranslateX(0);
  }, [isMobile]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !isDragging) return;
    e.preventDefault();
    const currentX = e.touches[0]?.clientX || 0;
    const diff = currentX - startX;
    setTranslateX(diff);
  }, [isMobile, isDragging, startX]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !isDragging) return;
    setIsDragging(false);
    
    const threshold = 50;
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (translateX < 0 && currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
    setTranslateX(0);
  }, [isMobile, isDragging, translateX, currentIndex, images.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isMobile) {
    // Desktop gallery with navigation buttons
    return (
      <div className={`relative ${className}`}>
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            className="w-full h-64 object-cover"
            loading="lazy"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                aria-label="Next image"
              >
                →
              </button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Mobile swipeable gallery
  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${currentIndex * 100 + (translateX / (containerRef.current?.offsetWidth || 1)) * 100}%)`,
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full"
            >
              <img
                src={image}
                alt={`${alt} ${index + 1}`}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Mobile navigation component
interface MobileNavigationProps {
  items: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    href: string;
  }>;
  activeItem?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  activeItem
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!isMobile) {
    return null; // Don't render on desktop
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center py-3 px-4 min-h-[44px] transition-colors ${
              activeItem === item.id
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {item.icon && <span className="text-lg mb-1">{item.icon}</span>}
            <span className="text-xs font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};

// Mobile performance optimizations
export const MobilePerformanceOptimizations: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (isMobile) {
      // Reduce motion for better performance on mobile
      document.documentElement.style.setProperty('--reduced-motion', 'reduce');
      
      // Optimize scroll performance
      document.body.style.setProperty('scroll-behavior', 'auto');
      
      // Disable hover effects on mobile
      document.body.classList.add('mobile-device');
    }
  }, [isMobile]);

  return null;
};

// Horizontal scroll prevention
export const useHorizontalScrollPrevention = () => {
  useEffect(() => {
    const preventHorizontalScroll = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const scrollContainer = target.closest('.scroll-container');
      
      if (scrollContainer) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer as HTMLElement;
        const isAtStart = scrollLeft === 0;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth;
        
                if ((e.touches[0]?.clientX && e.touches[0].clientX < 50 && isAtStart) ||
            (e.touches[0]?.clientX && e.touches[0].clientX > window.innerWidth - 50 && isAtEnd)) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('touchstart', preventHorizontalScroll, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', preventHorizontalScroll);
    };
  }, []);
};

// Mobile-specific CSS classes
export const MobileStyles: React.FC = () => (
  <style>{`
    @media (max-width: 768px) {
      /* Ensure minimum touch targets */
      button, a, input, select, textarea {
        min-height: 44px;
        min-width: 44px;
      }
      
      /* Optimize scrolling */
      * {
        -webkit-overflow-scrolling: touch;
      }
      
      /* Prevent horizontal scroll */
      body {
        overflow-x: hidden;
      }
      
      /* Mobile-specific spacing */
      .mobile-p-4 {
        padding: 1rem;
      }
      
      .mobile-mb-4 {
        margin-bottom: 1rem;
      }
      
      /* Mobile navigation adjustments */
      .mobile-nav {
        padding-bottom: 80px;
      }
      
      /* Touch-friendly form elements */
      input, select, textarea {
        font-size: 16px; /* Prevents zoom on iOS */
      }
      
      /* Optimize images for mobile */
      img {
        max-width: 100%;
        height: auto;
      }
      
      /* Mobile-specific grid */
      .mobile-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      /* Mobile card layout */
      .mobile-card {
        margin-bottom: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    }
    
    /* Disable hover effects on mobile */
    .mobile-device *:hover {
      transform: none !important;
      box-shadow: none !important;
    }
  `}</style>
);

// Main MobileOptimizations component
export const MobileOptimizations: React.FC = () => {
  return (
    <>
      <MobilePerformanceOptimizations />
      <MobileStyles />
    </>
  );
};

export default {
  TouchButton,
  MobileVendorCard,
  SwipeableGallery,
  MobileNavigation,
  MobilePerformanceOptimizations,
  useHorizontalScrollPrevention,
  MobileStyles,
  MobileOptimizations
};