import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MapPin, 
  Filter, 
  X, 
  IndianRupee, 
  Star, 
  Users, 
  Calendar,
  Clock,
  Award,
  Shield,
  Heart,
  Zap,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vendor, Category } from '@shared/schema';

export interface AdvancedSearchFilters {
  search: string;
  location: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  verified: boolean;
  featured: boolean;
  available: boolean;
  sortBy: 'rating' | 'price' | 'reviews' | 'name' | 'distance' | 'popularity';
  sortOrder: 'asc' | 'desc';
  services: string[];
  priceRange: string;
  experience: string;
  availability: string;
}

interface AdvancedVendorSearchProps {
  onSearch?: (filters: AdvancedSearchFilters) => void;
  onFiltersChange?: (filters: AdvancedSearchFilters) => void;
  className?: string;
  showAdvancedFilters?: boolean;
  placeholder?: string;
}

const priceRanges = [
  { value: '0-50000', label: 'Under ₹50,000', min: 0, max: 50000 },
  { value: '50000-100000', label: '₹50,000 - ₹1,00,000', min: 50000, max: 100000 },
  { value: '100000-250000', label: '₹1,00,000 - ₹2,50,000', min: 100000, max: 250000 },
  { value: '250000-500000', label: '₹2,50,000 - ₹5,00,000', min: 250000, max: 500000 },
  { value: '500000+', label: 'Above ₹5,00,000', min: 500000, max: 1000000 }
];

const locations = [
  'All Locations',
  'North Goa',
  'South Goa',
  'Panaji',
  'Margao',
  'Calangute',
  'Baga',
  'Anjuna',
  'Vagator',
  'Candolim',
  'Sinquerim',
  'Colva',
  'Benaulim',
  'Varca',
  'Cavelossim',
  'Majorda',
  'Palolem',
  'Agonda'
];

const experienceLevels = [
  { value: 'all', label: 'All Experience Levels' },
  { value: 'beginner', label: '1-3 years' },
  { value: 'intermediate', label: '3-7 years' },
  { value: 'expert', label: '7+ years' }
];

const availabilityOptions = [
  { value: 'all', label: 'All Availability' },
  { value: 'available', label: 'Available Now' },
  { value: 'next-month', label: 'Next Month' },
  { value: 'next-quarter', label: 'Next Quarter' }
];

const popularServices = [
  'Wedding Photography',
  'Wedding Videography',
  'Wedding Catering',
  'Wedding Decoration',
  'Wedding Venue',
  'Wedding DJ',
  'Wedding Makeup',
  'Wedding Planning',
  'Wedding Transportation',
  'Wedding Entertainment'
];

export default function AdvancedVendorSearch({ 
  onSearch, 
  onFiltersChange, 
  className = "",
  showAdvancedFilters = false,
  placeholder = "Search for vendors, services, or locations..."
}: AdvancedVendorSearchProps) {
  const [, setLocation] = useLocation();
  const [showFilters, setShowFilters] = useState(showAdvancedFilters);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    search: '',
    location: '',
    category: '',
    minPrice: 0,
    maxPrice: 1000000,
    minRating: 0,
    verified: false,
    featured: false,
    available: false,
    sortBy: 'rating',
    sortOrder: 'desc',
    services: [],
    priceRange: '',
    experience: 'all',
    availability: 'all'
  });

  // Fetch vendors and categories for suggestions
  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Generate search suggestions
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

    // Add popular searches
    popularServices.forEach(service => {
      if (service.toLowerCase().includes(searchTerm) && !newSuggestions.includes(service)) {
        newSuggestions.push(service);
      }
    });

    setSuggestions(newSuggestions.slice(0, 8));
    setShowSuggestions(newSuggestions.length > 0);
  }, [filters.search, vendors, categories]);

  // Debounced search
  const debouncedSearch = useCallback(
    useMemo(() => {
      let timeoutId: NodeJS.Timeout;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (searchTerm.length >= 2) {
            setIsSearching(true);
            // Trigger search after 300ms delay
            setTimeout(() => setIsSearching(false), 500);
          }
        }, 300);
      };
    }, []),
    []
  );

  const updateFilter = (key: keyof AdvancedSearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Trigger debounced search for text inputs
    if (key === 'search') {
      debouncedSearch(value);
    }
    
    onFiltersChange?.(newFilters);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowSuggestions(false);
    setIsSearching(true);
    
    if (onSearch) {
      onSearch(filters);
    } else {
      // Navigate to vendors page with search params
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.location) params.set('location', filters.location);
      if (filters.category) params.set('category', filters.category);
      if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice < 1000000) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.minRating > 0) params.set('minRating', filters.minRating.toString());
      if (filters.verified) params.set('verified', 'true');
      if (filters.featured) params.set('featured', 'true');
      if (filters.available) params.set('available', 'true');
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
      
      const queryString = params.toString();
      setLocation(`/vendors/all${queryString ? `?${queryString}` : ''}`);
    }
    
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    updateFilter('search', suggestion);
    setShowSuggestions(false);
    handleSearch();
  };

  const handlePriceRangeChange = (value: string) => {
    const range = priceRanges.find(r => r.value === value);
    if (range) {
      updateFilter('minPrice', range.min);
      updateFilter('maxPrice', range.max);
      updateFilter('priceRange', value);
    }
  };

  const toggleService = (service: string) => {
    const newServices = filters.services.includes(service)
      ? filters.services.filter(s => s !== service)
      : [...filters.services, service];
    updateFilter('services', newServices);
  };

  const resetFilters = () => {
    const defaultFilters: AdvancedSearchFilters = {
      search: '',
      location: '',
      category: '',
      minPrice: 0,
      maxPrice: 1000000,
      minRating: 0,
      verified: false,
      featured: false,
      available: false,
      sortBy: 'rating',
      sortOrder: 'desc',
      services: [],
      priceRange: '',
      experience: 'all',
      availability: 'all'
    };
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.location) count++;
    if (filters.category) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 1000000) count++;
    if (filters.minRating > 0) count++;
    if (filters.verified) count++;
    if (filters.featured) count++;
    if (filters.available) count++;
    if (filters.services.length > 0) count++;
    if (filters.experience !== 'all') count++;
    if (filters.availability !== 'all') count++;
    return count;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Search Bar */}
      <div className="relative">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={placeholder}
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 pr-12 h-12 text-lg border-2 border-gray-200 focus:border-primary rounded-xl"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {isSearching && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              )}
              <Button
                type="submit"
                size="sm"
                className="h-8 px-4 bg-primary hover:bg-primary/90"
              >
                Search
              </Button>
            </div>
          </div>
        </form>

        {/* Search Suggestions */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span>{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>

        {filters.verified && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Verified
            <button
              onClick={() => updateFilter('verified', false)}
              className="ml-1 hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {filters.featured && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            Featured
            <button
              onClick={() => updateFilter('featured', false)}
              className="ml-1 hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {filters.available && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Available
            <button
              onClick={() => updateFilter('available', false)}
              className="ml-1 hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <Select 
                  value={filters.location} 
                  onValueChange={(value) => updateFilter('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location === 'All Locations' ? '' : location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => updateFilter('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories?.map(category => (
                      <SelectItem key={category.slug} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <IndianRupee className="w-4 h-4" />
                Price Range
              </label>
              <Select 
                value={filters.priceRange} 
                onValueChange={handlePriceRangeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Prices</SelectItem>
                  {priceRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>₹{filters.minPrice.toLocaleString()}</span>
                  <span>₹{filters.maxPrice.toLocaleString()}</span>
                </div>
                <Slider
                  value={[filters.minPrice, filters.maxPrice]}
                  onValueChange={([min, max]) => {
                    updateFilter('minPrice', min);
                    updateFilter('maxPrice', max);
                  }}
                  max={1000000}
                  step={10000}
                  className="w-full"
                />
              </div>
            </div>

            {/* Rating and Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Minimum Rating
                </label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[filters.minRating]}
                    onValueChange={([rating]) => updateFilter('minRating', rating)}
                    max={5}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium min-w-[3rem]">
                    {filters.minRating}+
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Experience Level
                </label>
                <Select 
                  value={filters.experience} 
                  onValueChange={(value) => updateFilter('experience', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Availability and Sorting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Availability
                </label>
                <Select 
                  value={filters.availability} 
                  onValueChange={(value) => updateFilter('availability', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Sort By
                </label>
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value) => updateFilter('sortBy', value as AdvancedSearchFilters['sortBy'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                    <SelectItem value="price">Price (Low to High)</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Additional Filters</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={filters.verified}
                    onCheckedChange={(checked) => updateFilter('verified', checked)}
                  />
                  <label htmlFor="verified" className="text-sm flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Verified Only
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={filters.featured}
                    onCheckedChange={(checked) => updateFilter('featured', checked)}
                  />
                  <label htmlFor="featured" className="text-sm flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Featured Only
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="available"
                    checked={filters.available}
                    onCheckedChange={(checked) => updateFilter('available', checked)}
                  />
                  <label htmlFor="available" className="text-sm flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Available Now
                  </label>
                </div>
              </div>
            </div>

            {/* Popular Services */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Popular Services</label>
              <div className="flex flex-wrap gap-2">
                {popularServices.map(service => (
                  <Button
                    key={service}
                    variant={filters.services.includes(service) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleService(service)}
                    className="text-xs"
                  >
                    {service}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSearch} className="flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
