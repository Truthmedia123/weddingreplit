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
      <section className="relative min-h-screen flex items-center cultural-pattern">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380" 
            alt="Beautiful Goan beach wedding ceremony" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Celebrate Your 
                <span className="text-red-500"> Big Day</span>,
                <span className="text-teal-400"> Goan Style</span>
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Discover Goa's finest wedding vendors and create memories that last a lifetime. From breathtaking beach venues to traditional Goan cuisine.
              </p>
              
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <CategoryGrid />

      {/* Featured Vendors */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Featured Vendors
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Handpicked professionals who bring Goan wedding dreams to life
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVendors?.slice(0, 6).map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/vendors/all">
              <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                View All Vendors <i className="fas fa-arrow-right ml-2"></i>
              </Button>
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
