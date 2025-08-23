import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import VendorCard from './VendorCard';
import { VendorCardSkeleton } from './ui/Skeleton';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useAnalytics } from './Performance/Analytics';
import { useToastActions } from './ui/Toast';
import type { Vendor } from '@shared/schema';

interface VendorGridProps {
  category?: string;
  searchQuery?: string;
  filters?: {
    priceRange?: string;
    location?: string;
    rating?: number;
  };
  limit?: number;
  showSkeleton?: boolean;
}

const VendorGrid: React.FC<VendorGridProps> = ({
  category,
  searchQuery,
  filters,
  limit = 12,
  showSkeleton = false,
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { trackUserAction } = useAnalytics();
  const { error: showError } = useToastActions();

  // Fetch vendors with React Query
  const {
    data: vendors = [],
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useQuery({
    queryKey: ['vendors', category, searchQuery, filters, limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (searchQuery) params.append('search', searchQuery);
        if (filters?.priceRange) params.append('priceRange', filters.priceRange);
        if (filters?.location) params.append('location', filters.location);
        if (filters?.rating) params.append('rating', filters.rating.toString());
        params.append('limit', limit.toString());

        const response = await fetch(`/api/vendors?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch vendors');
        }
        
        const data = await response.json();
        trackUserAction('vendors_loaded', { 
          category, 
          count: data.length,
          has_filters: !!filters 
        });
        
        return data;
      } catch (err) {
        showError('Failed to load vendors', 'Please try again later.');
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle loading more vendors
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasNextPage) return;
    
    setIsLoadingMore(true);
    try {
      await fetchNextPage();
      trackUserAction('vendors_load_more', { category });
    } catch (err) {
      showError('Failed to load more vendors', 'Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Show skeleton loading
  if (showSkeleton || isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: limit }).map((_, index) => (
          <VendorCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load vendors</h3>
        <p className="text-gray-600 mb-4">We couldn't load the vendors. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show empty state
  if (vendors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No vendors found</h3>
        <p className="text-gray-600">
          {searchQuery 
            ? `No vendors match "${searchQuery}"`
            : category 
            ? `No vendors found in ${category}`
            : 'No vendors available at the moment'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vendor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vendors.map((vendor: Vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="text-center pt-8">
          <button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage || isLoadingMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center space-x-2"
          >
            {isFetchingNextPage || isLoadingMore ? (
              <>
                <LoadingSpinner size="sm" variant="white" />
                <span>Loading...</span>
              </>
            ) : (
              <span>Load More Vendors</span>
            )}
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="text-center text-sm text-gray-500">
        Showing {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
        {searchQuery && ` for "${searchQuery}"`}
        {category && ` in ${category}`}
      </div>
    </div>
  );
};

export default VendorGrid;
