import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { Vendor, Review } from "@shared/schema";

export default function VendorProfile() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    customerName: "",
    customerEmail: "",
    rating: 5,
    comment: ""
  });

  const { data: vendor, isLoading } = useQuery<Vendor>({
    queryKey: [`/api/vendors/${id}`],
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: [`/api/vendors/${id}/reviews`],
  });

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: typeof reviewForm) => {
      const response = await fetch(`/api/vendors/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) throw new Error('Failed to create review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vendors/${id}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/vendors/${id}`] });
      toast({ title: "Review submitted successfully!" });
      setShowReviewForm(false);
      setReviewForm({ customerName: "", customerEmail: "", rating: 5, comment: "" });
    },
    onError: () => {
      toast({ title: "Failed to submit review", variant: "destructive" });
    },
  });



  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    createReviewMutation.mutate(reviewForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Not Found</h2>
            <p className="text-gray-600">The vendor you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative h-96">
        <img 
          src={vendor.coverImage || vendor.profileImage || "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=800"} 
          alt={vendor.name}
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute bottom-8 left-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            {vendor.featured && <Badge className="bg-red-500">Featured</Badge>}
            {vendor.verified && <Badge className="bg-green-500"><i className="fas fa-check mr-1"></i>Verified</Badge>}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{vendor.name}</h1>
          <p className="text-xl capitalize">{vendor.category.replace('-', ' ')}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {vendor.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{vendor.description}</p>
                
                {vendor.services && vendor.services.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Services Offered:</h3>
                    <div className="flex flex-wrap gap-2">
                      {vendor.services.map((service, index) => (
                        <Badge key={index} variant="secondary">{service}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gallery */}
            {vendor.gallery && vendor.gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <Carousel className="w-full">
                    <CarouselContent>
                      {vendor.gallery.map((image, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                          <img 
                            src={image} 
                            alt={`${vendor.name} gallery ${index + 1}`}
                            className="w-full h-64 object-cover rounded-lg" 
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </CardContent>
              </Card>
            )}

            {/* Social Media Content */}
            {(vendor.instagram || vendor.youtube) && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Media & Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Instagram Integration */}
                    {vendor.instagram && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <i className="fab fa-instagram text-pink-500 text-xl"></i>
                          <h3 className="font-semibold">Instagram</h3>
                        </div>
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border">
                          <p className="text-sm text-gray-600 mb-3">
                            Follow us on Instagram for the latest updates and behind-the-scenes content
                          </p>
                          <a 
                            href={vendor.instagram.startsWith('http') ? vendor.instagram : `https://instagram.com/${vendor.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105"
                          >
                            <i className="fab fa-instagram"></i>
                            View Instagram Profile
                          </a>
                          
                          {/* Instagram embed placeholder */}
                          <div className="mt-4 bg-white rounded-lg p-4 border-2 border-dashed border-gray-200">
                            <div className="text-center text-gray-500">
                              <i className="fab fa-instagram text-3xl mb-2"></i>
                              <p className="text-sm">Latest Instagram posts would appear here</p>
                              <p className="text-xs mt-1">Visit our Instagram profile to see recent content</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* YouTube Integration */}
                    {vendor.youtube && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <i className="fab fa-youtube text-red-500 text-xl"></i>
                          <h3 className="font-semibold">YouTube</h3>
                        </div>
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border">
                          <p className="text-sm text-gray-600 mb-3">
                            Watch our video portfolio and client testimonials
                          </p>
                          <a 
                            href={vendor.youtube.startsWith('http') ? vendor.youtube : `https://youtube.com/${vendor.youtube}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105"
                          >
                            <i className="fab fa-youtube"></i>
                            View YouTube Channel
                          </a>
                          
                          {/* YouTube embed placeholder */}
                          <div className="mt-4 bg-white rounded-lg p-4 border-2 border-dashed border-gray-200">
                            <div className="text-center text-gray-500">
                              <i className="fab fa-youtube text-3xl mb-2"></i>
                              <p className="text-sm">Latest YouTube videos would appear here</p>
                              <p className="text-xs mt-1">Visit our YouTube channel to watch our portfolio</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Reviews & Ratings</CardTitle>
                  <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                    Write a Review
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold mb-4">Write a Review</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          id="name"
                          value={reviewForm.customerName}
                          onChange={(e) => setReviewForm({...reviewForm, customerName: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={reviewForm.customerEmail}
                          onChange={(e) => setReviewForm({...reviewForm, customerEmail: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <Label>Rating</Label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({...reviewForm, rating: star})}
                            className={`text-2xl ${star <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                          >
                            <i className="fas fa-star"></i>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <Label htmlFor="comment">Your Review</Label>
                      <Textarea
                        id="comment"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                        required
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={createReviewMutation.isPending}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {reviews?.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{review.customerName}</h4>
                          <div className="flex text-yellow-500">
                            {[...Array(review.rating)].map((_, i) => (
                              <i key={i} className="fas fa-star text-sm"></i>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt!).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                  
                  {!reviews?.length && (
                    <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i} 
                        className={`fas fa-star ${i < Math.floor(Number(vendor.rating)) ? '' : 'text-gray-300'}`}
                      ></i>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {vendor.rating} ({vendor.reviewCount} reviews)
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <i className="fas fa-map-marker-alt mr-3 text-red-500"></i>
                  <span>{vendor.location}</span>
                </div>

                {vendor.address && (
                  <div className="flex items-start text-gray-600">
                    <i className="fas fa-home mr-3 text-red-500 mt-1"></i>
                    <span>{vendor.address}</span>
                  </div>
                )}

                {vendor.priceRange && (
                  <div className="flex items-center text-gray-600">
                    <i className="fas fa-rupee-sign mr-3 text-red-500"></i>
                    <span>{vendor.priceRange}</span>
                  </div>
                )}

                <div className="space-y-2">
                  {vendor.email && (
                    <Button 
                      onClick={() => window.location.href = `mailto:${vendor.email}`}
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                    >
                      <i className="fas fa-envelope mr-2"></i>Contact via Email
                    </Button>
                  )}
                </div>

                {(vendor.website || vendor.instagram || vendor.youtube || vendor.facebook) && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Follow Us</h4>
                    <div className="flex gap-2">
                      {vendor.website && (
                        <Button 
                          onClick={() => window.open(vendor.website!, '_blank')}
                          size="sm" 
                          variant="outline"
                        >
                          <i className="fas fa-globe"></i>
                        </Button>
                      )}
                      {vendor.instagram && (
                        <Button 
                          onClick={() => window.open(
                            vendor.instagram!.startsWith('http') 
                              ? vendor.instagram! 
                              : `https://instagram.com/${vendor.instagram}`, 
                            '_blank'
                          )}
                          size="sm" 
                          variant="outline"
                          className="text-pink-600 border-pink-300 hover:bg-pink-50"
                        >
                          <i className="fab fa-instagram"></i>
                        </Button>
                      )}
                      {vendor.youtube && (
                        <Button 
                          onClick={() => window.open(
                            vendor.youtube!.startsWith('http') 
                              ? vendor.youtube! 
                              : `https://youtube.com/${vendor.youtube}`, 
                            '_blank'
                          )}
                          size="sm" 
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <i className="fab fa-youtube"></i>
                        </Button>
                      )}
                      {vendor.facebook && (
                        <Button 
                          onClick={() => window.open(vendor.facebook!, '_blank')}
                          size="sm" 
                          variant="outline"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <i className="fab fa-facebook"></i>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
