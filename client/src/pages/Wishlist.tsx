import { useWishlist } from "@/hooks/use-wishlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2, Share2, Phone, Mail, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist, getWishlistByCategory } = useWishlist();
  const { toast } = useToast();

  const groupedWishlist = getWishlistByCategory();

  const handleRemove = (vendorId: number, vendorName: string) => {
    removeFromWishlist(vendorId);
    toast({
      title: "Removed from wishlist",
      description: `${vendorName} has been removed from your wishlist.`,
    });
  };

  const handleClearAll = () => {
    clearWishlist();
    toast({
      title: "Wishlist cleared",
      description: "All vendors have been removed from your wishlist.",
    });
  };

  const handleShare = async (vendor: any) => {
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
      await navigator.clipboard.writeText(`${window.location.origin}/vendor/${vendor.id}`);
      toast({
        title: "Link copied",
        description: "Vendor link has been copied to clipboard.",
      });
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <section className="py-16 bg-gradient-to-r from-red-500 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8" />
              <h1 className="text-4xl md:text-5xl font-bold">Your Wishlist</h1>
            </div>
            <p className="text-xl opacity-90">
              Save your favorite vendors for easy comparison and planning
            </p>
          </div>
        </section>

        {/* Empty State */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-3xl p-12 shadow-xl">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start exploring our vendors and save your favorites to compare them later.
              </p>
              <Link href="/vendors/all">
                <Button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold text-lg">
                  Browse Vendors
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-red-500 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 fill-current" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">Your Wishlist</h1>
                <p className="text-xl opacity-90 mt-2">
                  {wishlist.length} saved vendor{wishlist.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {wishlist.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Wishlist Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {Object.entries(groupedWishlist).map(([category, items]) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 capitalize">
                {category.replace('-', ' ')} ({items.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Card key={item.vendor.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.vendor.profileImage || "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300"}
                        alt={item.vendor.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                      
                      {/* Actions overlay */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShare(item.vendor)}
                          className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                        >
                          <Share2 className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemove(item.vendor.id, item.vendor.name)}
                          className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                        >
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </Button>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {item.vendor.verified && (
                          <Badge className="bg-green-500/90 backdrop-blur-sm text-white border-0 shadow-lg">
                            <i className="fas fa-shield-check mr-1"></i>Verified
                          </Badge>
                        )}
                        {item.vendor.featured && (
                          <Badge className="bg-red-500/90 backdrop-blur-sm text-white border-0 shadow-lg">
                            <i className="fas fa-star mr-1"></i>Featured
                          </Badge>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                        <div className="flex items-center gap-1">
                          <i className="fas fa-star text-yellow-500 text-sm"></i>
                          <span className="text-sm font-semibold text-slate-800">{item.vendor.rating}</span>
                          <span className="text-xs text-gray-500">({item.vendor.reviewCount})</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                          {item.vendor.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-gray-500 text-sm capitalize">
                            {item.vendor.category.replace('-', ' ')}
                          </p>
                          {item.vendor.priceRange && (
                            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              {item.vendor.priceRange}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {item.vendor.description}
                      </p>

                      <div className="flex items-center mb-4 text-gray-500 text-sm">
                        <i className="fas fa-map-marker-alt mr-2 text-red-500"></i>
                        <span>{item.vendor.location}</span>
                      </div>

                      <div className="flex items-center mb-6 text-gray-400 text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          {item.vendor.phone && (
                            <Button
                              onClick={() => window.location.href = `tel:${item.vendor.phone}`}
                              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg text-xs flex items-center justify-center"
                            >
                              <Phone className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {item.vendor.whatsapp && (
                            <Button
                              onClick={() => {
                                const message = encodeURIComponent("Hi! We got your contact info from TheGoanWedding.com and would like to inquire about your services.");
                                window.open(`https://wa.me/${item.vendor.whatsapp.replace(/[^\d]/g, '')}?text=${message}`, '_blank');
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white py-2 px-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg text-xs flex items-center justify-center"
                            >
                              <i className="fab fa-whatsapp text-sm"></i>
                            </Button>
                          )}
                          
                          {item.vendor.email && (
                            <Button
                              onClick={() => window.location.href = `mailto:${item.vendor.email}`}
                              className="bg-red-500 hover:bg-red-600 text-white py-2 px-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg text-xs flex items-center justify-center"
                            >
                              <Mail className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        

                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}