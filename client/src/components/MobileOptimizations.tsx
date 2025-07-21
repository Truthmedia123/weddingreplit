import { useEffect } from 'react';

// Touch and gesture optimizations for mobile devices
export function useMobileOptimizations() {
  useEffect(() => {
    // Prevent zoom on double tap for better UX
    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Add touch event listeners
    document.addEventListener('touchend', preventZoom, { passive: false });

    // Optimize scroll performance
    const optimizeScroll = () => {
      document.body.style.overscrollBehavior = 'contain';
      document.body.style.touchAction = 'pan-y';
    };

    optimizeScroll();

    return () => {
      document.removeEventListener('touchend', preventZoom);
    };
  }, []);
}

// PWA-like mobile experience
export function MobileOptimizations() {
  useMobileOptimizations();
  
  return null; // This component doesn't render anything
}