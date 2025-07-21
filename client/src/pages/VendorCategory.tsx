import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Search, MapPin } from "lucide-react";
import VendorCard from "@/components/VendorCard";
import AdvancedFilters, { FilterState } from "@/components/AdvancedFilters";
import type { Vendor } from "@shared/schema";

export default function VendorCategory() {
  const { category } = useParams();
  const [location] = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    location: '',
    category: '',
    minPrice: 0,
    maxPrice: 1000000,
    minRating: 0,
    verified: false,
    featured: false,
    sortBy: 'rating'
  });

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    setFilters(prev => ({
      ...prev,
      search: urlParams.get('search') || '',
      location: urlParams.get('location') || '',
      category: category && category !== 'all' ? category : ''
    }));
  }, [location, category]);

  const { data: vendors, isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors", category, filters.search, filters.location],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (filters.search) params.append('search', filters.search);
      if (filters.location && filters.location !== 'all') params.append('location', filters.location);
      
      const response = await fetch(`/api/vendors?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch vendors');
      return response.json();
    },
  });

  // Apply filters and sorting
  const filteredAndSortedVendors = vendors?.filter(vendor => {
    // Price range filter
    if (filters.minPrice > 0 || filters.maxPrice < 1000000) {
      const priceValue = vendor.priceRange ? 
        parseInt(vendor.priceRange.replace(/[^\d]/g, '')) || 0 : 0;
      if (priceValue < filters.minPrice || priceValue > filters.maxPrice) {
        return false;
      }
    }
    
    // Rating filter
    if (filters.minRating > 0 && Number(vendor.rating) < filters.minRating) {
      return false;
    }
    
    // Verified filter
    if (filters.verified && !vendor.verified) {
      return false;
    }
    
    // Featured filter
    if (filters.featured && !vendor.featured) {
      return false;
    }
    
    return true;
  })?.sort((a, b) => {
    switch (filters.sortBy) {
      case 'rating':
        return Number(b.rating) - Number(a.rating);
      case 'reviews':
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        const aPrice = parseInt(a.priceRange?.replace(/[^\d]/g, '') || '0');
        const bPrice = parseInt(b.priceRange?.replace(/[^\d]/g, '') || '0');
        return aPrice - bPrice;
      default:
        return 0;
    }
  });

  const categoryTitle = category === 'all' 
    ? 'All Vendors' 
    : category?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Vendors';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-red-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{categoryTitle}</h1>
          <p className="text-xl opacity-90">
            Find the perfect {categoryTitle.toLowerCase()} for your special day in Goa
          </p>
        </div>
      </section>

      {/* Enhanced Filters */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search vendors..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <Select 
                  value={filters.location} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="North Goa">North Goa</SelectItem>
                    <SelectItem value="South Goa">South Goa</SelectItem>
                    <SelectItem value="Panaji">Panaji</SelectItem>
                    <SelectItem value="Margao">Margao</SelectItem>
                    <SelectItem value="Calangute">Calangute</SelectItem>
                    <SelectItem value="Baga">Baga</SelectItem>
                    <SelectItem value="Anjuna">Anjuna</SelectItem>
                    <SelectItem value="Colva">Colva</SelectItem>
                    <SelectItem value="Palolem">Palolem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Select 
                value={filters.sortBy} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as FilterState['sortBy'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="price">Price (Low to High)</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowFilters(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                More Filters
                {(filters.minPrice > 0 || filters.maxPrice < 1000000 || filters.minRating > 0 || filters.verified || filters.featured) && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                    {[
                      filters.minPrice > 0 || filters.maxPrice < 1000000 ? 1 : 0,
                      filters.minRating > 0 ? 1 : 0,
                      filters.verified ? 1 : 0,
                      filters.featured ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </Button>
              
              <Button 
                onClick={() => setFilters({
                  search: '',
                  location: '',
                  category: '',
                  minPrice: 0,
                  maxPrice: 1000000,
                  minRating: 0,
                  verified: false,
                  featured: false,
                  sortBy: 'rating'
                })}
                variant="outline"
              >
                Clear All
              </Button>
            </div>
          </div>
          
          {/* Results summary */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAndSortedVendors?.length || 0} vendors
            {filters.search && ` for "${filters.search}"`}
            {filters.location && filters.location !== 'all' && ` in ${filters.location}`}
          </div>
        </div>
      </section>

      {/* Vendors Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-64 rounded-t-lg"></div>
                  <div className="bg-white p-6 rounded-b-lg">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedVendors?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No vendors found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search filters</p>
              <Button 
                onClick={() => setFilters({
                  search: '',
                  location: '',
                  category: '',
                  minPrice: 0,
                  maxPrice: 1000000,
                  minRating: 0,
                  verified: false,
                  featured: false,
                  sortBy: 'rating'
                })}
                className="bg-red-500 hover:bg-red-600"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
      
      <AdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </div>
  );
}
