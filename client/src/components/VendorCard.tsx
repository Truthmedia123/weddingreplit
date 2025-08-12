import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, Phone, Mail } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";
import InlineSVGImage from "@/components/InlineSVGImage";
import type { Vendor } from "@shared/schema";

interface VendorCardProps {
  vendor: Vendor;
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const handleEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `mailto:${vendor.email}`;
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const message = encodeURIComponent("Hi! We got your contact info from TheGoanWedding.com and would like to inquire about your services.");
    window.open(`https://wa.me/${vendor.whatsapp.replace(/[^\d]/g, '')}?text=${message}`, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `tel:${vendor.phone}`;
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(vendor.id)) {
      removeFromWishlist(vendor.id);
      toast({
        title: "Removed from wishlist",
        description: `${vendor.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(vendor);
      toast({
        title: "Added to wishlist",
        description: `${vendor.name} has been saved to your wishlist.`,
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor.name,
          text: `Check out ${vendor.name} on TheGoanWedding.com`,
          url: `${window.location.origin}/vendor/${vendor.id}`,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(`${window.location.origin}/vendor/${vendor.id}`);
      toast({
        title: "Link copied",
        description: "Vendor link has been copied to clipboard.",
      });
    }
  };

  return (
    <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden bg-white border-0 rounded-2xl">
      <Link href={`/vendor/${vendor.id}`}>
        <div className="relative overflow-hidden">
          <InlineSVGImage
            type={vendor.category.toLowerCase().includes('photo') ? 'photography' : 
                 vendor.category.toLowerCase().includes('catering') ? 'catering' :
                 vendor.category.toLowerCase().includes('floral') ? 'flowers' : 'default'}
            className="w-full h-72 group-hover:scale-110 transition-transform duration-700"
            alt={vendor.name}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Badges and Actions */}
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <div className="flex gap-2">
              {vendor.verified && (
                <Badge className="bg-green-500/90 backdrop-blur-sm text-white border-0 shadow-lg">
                  <i className="fas fa-shield-check mr-1"></i>Verified
                </Badge>
              )}
              {vendor.featured && (
                <Badge className="bg-red-500/90 backdrop-blur-sm text-white border-0 shadow-lg">
                  <i className="fas fa-star mr-1"></i>Featured
                </Badge>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleWishlist}
                className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
              >
                <Heart 
                  className={`h-4 w-4 ${isInWishlist(vendor.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleShare}
                className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
              >
                <Share2 className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
          
          {/* Rating overlay */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
            <div className="flex items-center gap-1">
              <i className="fas fa-star text-yellow-500 text-sm"></i>
              <span className="text-sm font-semibold text-slate-800">{vendor.rating}</span>
              <span className="text-xs text-gray-500">({vendor.reviewCount})</span>
            </div>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-red-600 transition-colors duration-300">
              {vendor.name}
            </h3>
            {vendor.priceRange && (
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {vendor.priceRange}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm capitalize font-medium">
            {vendor.category.replace('-', ' ')}
          </p>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
          {vendor.description}
        </p>
        
        <div className="flex items-center mb-6 text-gray-500 text-sm">
          <i className="fas fa-map-marker-alt mr-2 text-red-500"></i>
          <span>{vendor.location}</span>
        </div>
        
        {/* Enhanced Contact Options */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {vendor.phone && (
              <Button
                onClick={handleCall}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg text-xs flex items-center justify-center"
              >
                <Phone className="w-3 h-3" />
              </Button>
            )}
            
            {vendor.whatsapp && (
              <Button
                onClick={handleWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg text-xs flex items-center justify-center"
              >
                <i className="fab fa-whatsapp text-sm"></i>
              </Button>
            )}
            
            {vendor.email && (
              <Button
                onClick={handleEmail}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg text-xs flex items-center justify-center"
              >
                <Mail className="w-3 h-3" />
              </Button>
            )}
          </div>
          

        </div>

      </CardContent>
    </Card>
  );
}
