import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Vendor } from "@shared/schema";

interface VendorCardProps {
  vendor: Vendor;
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    const message = encodeURIComponent(`Hi! I found your business ${vendor.name} on TheGoanWedding.com and would like to know more about your services.`);
    window.open(`https://wa.me/${vendor.whatsapp}?text=${message}`, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `tel:${vendor.phone}`;
  };

  return (
    <Card className="group cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden">
      <Link href={`/vendor/${vendor.id}`}>
        <div className="relative">
          <img 
            src={vendor.profileImage || "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"} 
            alt={vendor.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" 
          />
          {vendor.featured && (
            <Badge className="absolute top-4 right-4 bg-red-500 text-white">
              Featured
            </Badge>
          )}
          {vendor.verified && (
            <Badge className="absolute top-4 left-4 bg-green-500 text-white">
              <i className="fas fa-check mr-1"></i>Verified
            </Badge>
          )}
        </div>
      </Link>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-1">{vendor.name}</h3>
            <p className="text-gray-500 text-sm capitalize">{vendor.category.replace('-', ' ')}</p>
          </div>
        </div>
        
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <i 
                key={i} 
                className={`fas fa-star ${i < Math.floor(Number(vendor.rating)) ? '' : 'text-gray-300'}`}
              ></i>
            ))}
          </div>
          <span className="ml-2 text-gray-600 text-sm">
            {vendor.rating} ({vendor.reviewCount} reviews)
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{vendor.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-500 text-sm">
            <i className="fas fa-map-marker-alt mr-1"></i>
            <span>{vendor.location}</span>
          </div>
          {vendor.priceRange && (
            <span className="text-sm font-medium text-green-600">{vendor.priceRange}</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleWhatsApp}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl font-medium transition-colors"
          >
            <i className="fab fa-whatsapp mr-2"></i>WhatsApp
          </Button>
          <Button
            onClick={handleCall}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl font-medium transition-colors"
          >
            <i className="fas fa-phone mr-2"></i>Call Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
