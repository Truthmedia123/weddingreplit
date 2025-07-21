import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Filter, X } from "lucide-react";
import AdvancedFilters, { FilterState } from "./AdvancedFilters";
import type { Vendor, Category } from "@shared/schema";

interface EnhancedSearchBarProps {
  onSearch?: (filters: FilterState) => void;
  className?: string;
}

const popularSearches = [
  "Beach Wedding Venues",
  "Candid Photography", 
  "Goan Catering",
  "Bridal Makeup",
  "Wedding DJ",
  "Floral Decorations",
  "Pre-wedding Shoot",
  "Destination Wedding Planners"
];

export default function EnhancedSearchBar({ onSearch, className = "" }: EnhancedSearchBarProps) {
  const [, setLocation] = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  
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

  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Generate autocomplete suggestions
  useEffect(() => {
    if (!filters.search || filters.search.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchTerm = filters.search.toLowerCase();
    const newSuggestions: string[] = [];

    // Add vendor names
    vendors?.forEach(vendor => {
      if (vendor.name.toLowerCase().includes(searchTerm)) {
        newSuggestions.push(vendor.name);
      }
    });

    // Add category names
    categories?.forEach(category => {
      if (category.name.toLowerCase().includes(searchTerm)) {
        newSuggestions.push(category.name);
      }
    });

    // Add service suggestions
    vendors?.forEach(vendor => {
      vendor.services?.forEach(service => {
        if (service.toLowerCase().includes(searchTerm) && !newSuggestions.includes(service)) {
          newSuggestions.push(service);
        }
      });
    });

    // Add popular searches that match
    popularSearches.forEach(search => {
      if (search.toLowerCase().includes(searchTerm) && !newSuggestions.includes(search)) {
        newSuggestions.push(search);
      }
    });

    setSuggestions(newSuggestions.slice(0, 8));
    setShowSuggestions(newSuggestions.length > 0);
  }, [filters.search, vendors, categories]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch(filters);
    } else {
      // Navigate to vendors page with search params
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.location) params.set('location', filters.location);
      if (filters.category) params.set('category', filters.category);
      
      const queryString = params.toString();
      setLocation(`/vendors/all${queryString ? `?${queryString}` : ''}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFilters(prev => ({ ...prev, search: suggestion }));
    setShowSuggestions(false);
    searchRef.current?.focus();
  };

  const handlePopularSearchClick = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setShowSuggestions(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.category) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 1000000) count++;
    if (filters.minRating > 0) count++;
    if (filters.verified) count++;
    if (filters.featured) count++;
    return count;
  };

  return (
    <>
      <div className={`bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-2xl border border-white/20 ${className}`}>
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Find Your Perfect Vendors</h2>
          <p className="text-gray-600">Search from 500+ verified wedding professionals in Goa</p>
        </div>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {/* Enhanced Search Input */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
              <Input
                ref={searchRef}
                type="text"
                placeholder="Search photographers, venues, caterers..."
                value={filters.search}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, search: e.target.value }));
                }}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors text-sm"
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                    >
                      <Search className="inline w-3 h-3 mr-2 text-gray-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Location Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5 z-10" />
              <Select 
                value={filters.location} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger className="pl-10 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations in Goa</SelectItem>
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
          </div>
          
          {/* Popular Searches */}
          {!filters.search && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Popular Searches:</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.slice(0, 6).map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors text-xs"
                    onClick={() => handlePopularSearchClick(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white py-3 px-6 rounded-xl font-bold text-base transition-all transform hover:scale-[1.02] shadow-xl hover:shadow-2xl"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Vendors
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="py-3 px-4 rounded-xl border-2 hover:bg-gray-50 transition-all"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </div>
          
          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              {filters.location && (
                <Badge variant="secondary" className="text-xs">
                  📍 {filters.location}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, location: '' }))}
                  />
                </Badge>
              )}
              {filters.minRating > 0 && (
                <Badge variant="secondary" className="text-xs">
                  ⭐ {filters.minRating}+ rating
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, minRating: 0 }))}
                  />
                </Badge>
              )}
              {filters.verified && (
                <Badge variant="secondary" className="text-xs">
                  ✅ Verified only
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, verified: false }))}
                  />
                </Badge>
              )}
            </div>
          )}
        </form>
      </div>
      
      <AdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </>
  );
}