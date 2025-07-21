import { useEffect, useRef, useCallback } from 'react';

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
  threshold?: number;
}

export default function InfiniteScroll({ 
  hasMore, 
  isLoading, 
  onLoadMore, 
  children,
  threshold = 200 
}: InfiniteScrollProps) {
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleObserver, option);
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [handleObserver, threshold]);

  return (
    <>
      {children}
      {hasMore && (
        <div ref={loaderRef} className="py-8 flex justify-center">
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
              <span>Loading more vendors...</span>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Scroll to load more</div>
          )}
        </div>
      )}
    </>
  );
}