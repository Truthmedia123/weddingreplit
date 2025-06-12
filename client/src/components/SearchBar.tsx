import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchBarProps {
  onSearch?: (search: string, location: string) => void;
  className?: string;
}

export default function SearchBar({ onSearch, className = "" }: SearchBarProps) {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSearch) {
      onSearch(search, selectedLocation);
    } else {
      // Navigate to vendors page with search params
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedLocation) params.set('location', selectedLocation);
      
      const queryString = params.toString();
      setLocation(`/vendors/all${queryString ? `?${queryString}` : ''}`);
    }
  };

  return (
    <div className={`bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl ${className}`}>
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600"></i>
          <Input
            type="text"
            placeholder="What are you looking for?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <i className="fas fa-map-marker-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600 z-10"></i>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
              <SelectValue placeholder="All Locations in Goa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Locations in Goa</SelectItem>
              <SelectItem value="North Goa">North Goa</SelectItem>
              <SelectItem value="South Goa">South Goa</SelectItem>
              <SelectItem value="Panaji">Panaji</SelectItem>
              <SelectItem value="Margao">Margao</SelectItem>
              <SelectItem value="Calangute">Calangute</SelectItem>
              <SelectItem value="Baga">Baga</SelectItem>
              <SelectItem value="Anjuna">Anjuna</SelectItem>
              <SelectItem value="Candolim">Candolim</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          type="submit"
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
        >
          <i className="fas fa-search mr-2"></i>Search Vendors
        </Button>
      </form>
    </div>
  );
}
