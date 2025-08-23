import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";
import { fetchCategories } from "@/services/dataService";

interface CategoryGridProps {
  showAll?: boolean;
  maxCategories?: number;
  searchFilter?: string;
}

export default function CategoryGrid({ showAll = false, maxCategories = 8, searchFilter = "" }: CategoryGridProps) {
  const { data: categoryData, isLoading } = useQuery<{categories: Category[]}>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  });
  
  const allCategories = categoryData?.categories || [];

  let filteredCategories = allCategories;
  
  // Apply search filter if provided
  if (searchFilter.trim()) {
    filteredCategories = allCategories.filter(category => 
      category.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }

  const categories = showAll ? filteredCategories : filteredCategories.slice(0, maxCategories);

  if (isLoading) {
    return (
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mx-auto w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mx-auto w-96"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-48"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 shell-pattern opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Popular <span className="goan-text-gradient">Categories</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the perfect vendors for your dream wedding in Goa
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <Link key={category.slug} href={`/vendors/${category.slug}`}>
              <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 bg-white border-0 overflow-hidden rounded-2xl">
                <CardContent className="p-0 relative">
                  {/* Image Container */}
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <div className={`w-full h-full bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <div className="text-6xl text-white opacity-80">
                        {(() => {
                          const textIcons: {[key: string]: string} = {
                            'PartyPopper': '🎉', 'Music': '♪', 'Wine': '🍷', 'Sparkles': '✨', 'Cake': '🎂',
                            'Car': '🚗', 'ChefHat': '👨‍🍳', 'Baby': '👶', 'Gem': '💎', 'Flower2': '🌸',
                            'Zap': '⚡', 'Leaf': '🍃', 'Mic': '🎤', 'Shield': '🛡️', 'Gift': '🎁',
                            'Music2': '♫', 'Star': '⭐', 'Users': '👥', 'FileText': '📄', 'Heart': '❤️',
                            'Home': '🏠', 'Dog': '🐕', 'Coffee': '☕', 'Camera': '📷'
                          };
                          return textIcons[category.icon] || '📷';
                        })()}
                      </div>
                    </div>
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Floating Animation Elements */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                      <div className="w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white text-sm">→</span>
                      </div>
                    </div>
                    
                    {/* Vendor Count Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      {category.vendorCount || 0} Vendors
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-6 relative">
                    {/* Category Name */}
                    <h3 className="font-bold text-lg md:text-xl text-slate-800 mb-2 group-hover:text-red-600 transition-colors duration-300 leading-tight">
                      {category.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {category.description}
                    </p>
                    
                    {/* Animated Bottom Border */}
                    <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-red-500 to-teal-500 group-hover:w-full transition-all duration-700 ease-out"></div>
                    
                    {/* Hover Effect - View More */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium text-red-600">View Vendors</span>
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 text-xs">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Shimmer Effect on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        {/* Call to action */}
        {!showAll && (
          <div className="text-center mt-16">
            <Link href="/categories">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl">
                <span>View All Categories ({allCategories.length})</span>
                <div className="transform group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
