import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Filter, MapPin, IndianRupee, Star, Users } from 'lucide-react';

export interface FilterState {
  search: string;
  location: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  verified: boolean;
  featured: boolean;
  sortBy: 'rating' | 'price' | 'reviews' | 'name';
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
}

const priceRanges = [
  { value: '0-50000', label: 'Under ₹50,000' },
  { value: '50000-100000', label: '₹50,000 - ₹1,00,000' },
  { value: '100000-250000', label: '₹1,00,000 - ₹2,50,000' },
  { value: '250000-500000', label: '₹2,50,000 - ₹5,00,000' },
  { value: '500000+', label: 'Above ₹5,00,000' }
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

export default function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onClose 
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      search: '',
      location: '',
      category: '',
      minPrice: 0,
      maxPrice: 1000000,
      minRating: 0,
      verified: false,
      featured: false,
      sortBy: 'rating'
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.location) count++;
    if (localFilters.category) count++;
    if (localFilters.minPrice > 0 || localFilters.maxPrice < 1000000) count++;
    if (localFilters.minRating > 0) count++;
    if (localFilters.verified) count++;
    if (localFilters.featured) count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-red-500" />
            <CardTitle>Advanced Filters</CardTitle>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">{getActiveFiltersCount()} active</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search</label>
            <Input
              placeholder="Search vendors, services, or keywords..."
              value={localFilters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>

          {/* Location & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Location in Goa
              </label>
              <Select 
                value={localFilters.location} 
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
              <label className="text-sm font-medium text-gray-700">Sort by</label>
              <Select 
                value={localFilters.sortBy} 
                onValueChange={(value) => updateFilter('sortBy', value as FilterState['sortBy'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="price">Price (Low to High)</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <IndianRupee className="w-4 h-4" />
              Budget Range
            </label>
            <div className="px-3">
              <Slider
                min={0}
                max={1000000}
                step={25000}
                value={[localFilters.minPrice, localFilters.maxPrice]}
                onValueChange={([min, max]) => {
                  updateFilter('minPrice', min);
                  updateFilter('maxPrice', max);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>₹{localFilters.minPrice.toLocaleString()}</span>
                <span>₹{localFilters.maxPrice.toLocaleString()}+</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Star className="w-4 h-4" />
              Minimum Rating
            </label>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5].map(rating => (
                <Button
                  key={rating}
                  variant={localFilters.minRating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('minRating', rating)}
                  className="flex items-center gap-1"
                >
                  <Star className="w-3 h-3" />
                  {rating === 0 ? 'Any' : `${rating}+`}
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Filters */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Additional Filters</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={localFilters.verified ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('verified', !localFilters.verified)}
                className="flex items-center gap-1"
              >
                <Users className="w-3 h-3" />
                Verified Only
              </Button>
              <Button
                variant={localFilters.featured ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('featured', !localFilters.featured)}
                className="flex items-center gap-1"
              >
                <Star className="w-3 h-3" />
                Featured Only
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={resetFilters} variant="outline" className="flex-1">
              Reset All
            </Button>
            <Button onClick={applyFilters} className="flex-1 bg-red-500 hover:bg-red-600">
              Apply Filters ({getActiveFiltersCount()})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}