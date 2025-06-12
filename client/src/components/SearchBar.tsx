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
    <div className={`bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20 ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Find Your Perfect Vendors</h2>
        <p className="text-gray-600">Search from 500+ verified wedding professionals</p>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-3 md:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-red-500"></i>
            <Input
              type="text"
              placeholder="Search photographers, venues, caterers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 text-base md:text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            />
          </div>
          
          <div className="relative">
            <i className="fas fa-map-marker-alt absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-teal-500 z-10"></i>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 text-base md:text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                <SelectValue placeholder="Select Location in Goa" />
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
                <SelectItem value="Candolim">Candolim</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-xl hover:shadow-2xl"
        >
          <i className="fas fa-search mr-3"></i>
          Search Wedding Vendors
          <i className="fas fa-heart ml-3 text-pink-300"></i>
        </Button>
      </form>
    </div>
  );
}
