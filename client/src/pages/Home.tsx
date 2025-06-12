import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import VendorCard from "@/components/VendorCard";
import TestimonialSlider from "@/components/TestimonialSlider";
import type { Vendor, BlogPost } from "@shared/schema";

export default function Home() {
  const { data: featuredVendors } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors/featured"],
  });

  const { data: blogPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background with parallax effect */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380" 
            alt="Beautiful Goan beach wedding ceremony" 
            className="w-full h-full object-cover scale-110" 
          />
          <div className="absolute inset-0 hero-overlay"></div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-element absolute top-20 left-10 w-4 h-4 bg-yellow-400 rounded-full opacity-60"></div>
          <div className="floating-element absolute top-40 right-20 w-6 h-6 bg-teal-400 rounded-full opacity-40"></div>
          <div className="floating-element absolute bottom-40 left-20 w-3 h-3 bg-red-400 rounded-full opacity-50"></div>
          <div className="floating-element absolute bottom-60 right-40 w-5 h-5 bg-yellow-300 rounded-full opacity-30"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-fade-in-up">
              {/* Elegant subtitle */}
              <p className="wedding-script text-2xl md:text-3xl text-yellow-300 mb-4 opacity-90">
                Where Dreams Come True
              </p>
              
              {/* Main heading with ornaments */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                <span className="block mb-2">Celebrate Your</span>
                <span className="goan-text-gradient ornament wedding-script text-6xl md:text-8xl lg:text-9xl">
                  Perfect Day
                </span>
                <span className="block text-4xl md:text-5xl lg:text-6xl mt-4 text-teal-300">
                  Goan Style
                </span>
              </h1>
              
              {/* Enhanced description */}
              <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed max-w-4xl mx-auto">
                Discover Goa's most exquisite wedding vendors and create unforgettable memories. 
                From stunning beach ceremonies to authentic Portuguese-Goan celebrations.
              </p>
              
              {/* Enhanced search bar */}
              <div className="max-w-4xl mx-auto">
                <SearchBar className="elegant-card" />
              </div>

              {/* Trust indicators */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">500+</div>
                  <div className="text-sm text-gray-300">Verified Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">1000+</div>
                  <div className="text-sm text-gray-300">Happy Couples</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">15+</div>
                  <div className="text-sm text-gray-300">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">5★</div>
                  <div className="text-sm text-gray-300">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <CategoryGrid />

      {/* Featured Vendors */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="wedding-script text-2xl text-teal-600 mb-4">
              Premium Selection
            </p>
            <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
              Featured Vendors
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-red-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Meet our carefully selected partners who have consistently delivered exceptional experiences. 
              These verified professionals are the heart of unforgettable Goan weddings.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featuredVendors?.slice(0, 6).map((vendor, index) => (
              <div 
                key={vendor.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <VendorCard vendor={vendor} />
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/vendors/all">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 hover:from-teal-600 hover:via-teal-700 hover:to-teal-800 text-white px-10 py-5 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl">
                <span>Discover All Vendors</span>
                <i className="fas fa-star ml-2 text-yellow-300"></i>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSlider />

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-red-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Planning Your Dream Wedding?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Join thousands of couples who have found their perfect wedding vendors in Goa. Start your journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vendors/all">
              <Button className="bg-white text-red-500 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                <i className="fas fa-search mr-2"></i>Find Vendors Now
              </Button>
            </Link>
            <Link href="/list-business">
              <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-500 px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105">
                <i className="fas fa-plus mr-2"></i>List Your Business
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Wedding Inspiration & Tips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the latest wedding trends, planning tips, and Goan traditions to make your special day unforgettable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts?.slice(0, 3).map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="group cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden">
                  <img 
                    src={post.featuredImage || "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"} 
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <CardContent className="p-6">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3 inline-block uppercase">
                      {post.category}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-red-500 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{new Date(post.createdAt!).toLocaleDateString()}</span>
                      <span>5 min read</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/blog">
              <Button className="bg-slate-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                Read More Articles <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
