import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import VendorCard from "@/components/VendorCard";
import type { Vendor } from "@shared/schema";

export default function VendorCategory() {
  const { category } = useParams();
  const [location] = useLocation();
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    setSearch(urlParams.get('search') || '');
    setSelectedLocation(urlParams.get('location') || '');
  }, [location]);

  const { data: vendors, isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors", category, search, selectedLocation],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);
      if (selectedLocation) params.append('location', selectedLocation);
      
      const response = await fetch(`/api/vendors?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch vendors');
      return response.json();
    },
  });

  const sortedVendors = vendors?.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return Number(b.rating) - Number(a.rating);
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      case 'name':
        return a.name.localeCompare(b.name);
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

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <Input
                type="text"
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                <SelectItem value="North Goa">North Goa</SelectItem>
                <SelectItem value="South Goa">South Goa</SelectItem>
                <SelectItem value="Panaji">Panaji</SelectItem>
                <SelectItem value="Margao">Margao</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={() => {
                setSearch("");
                setSelectedLocation("");
                setSortBy("rating");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
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
          ) : sortedVendors?.length ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-gray-600">
                  Showing {sortedVendors.length} vendor{sortedVendors.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedVendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No vendors found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search filters</p>
              <Button 
                onClick={() => {
                  setSearch("");
                  setSelectedLocation("");
                }}
                className="bg-red-500 hover:bg-red-600"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
