import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

export default function CategoryGrid() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

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
                <div className="bg-gray-200 rounded-xl h-32"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 shell-pattern opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12 md:mb-20">
          <p className="wedding-script text-xl md:text-2xl text-red-500 mb-3 md:mb-4">
            Our Services
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-slate-800 dark:text-slate-100 mb-4 md:mb-6 section-title-mobile px-4 sm:px-0">
            Wedding Categories
          </h2>
          <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-red-500 to-teal-500 mx-auto mb-4 md:mb-6 rounded-full"></div>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed section-subtitle-mobile px-4 sm:px-0">
            Discover our handpicked collection of Goa's most talented wedding professionals. 
            Each category features verified vendors who specialize in creating magical moments.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {categories.map((category) => (
            <Link key={category.slug} href={`/vendors/${category.slug}`}>
              <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 overflow-hidden">
                <CardContent className="p-4 md:p-8 text-center relative">
                  {/* Hover background effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Icon container */}
                  <div className="relative mb-3 md:mb-6">
                    <div className={`bg-gradient-to-br ${category.color} w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                      <i className={`${category.icon} text-white text-lg md:text-2xl`}></i>
                    </div>
                    {/* Floating effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.color} w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl mx-auto opacity-20 blur-xl group-hover:blur-2xl transition-all duration-500`}></div>
                  </div>
                  
                  <h3 className="font-bold text-sm md:text-lg text-slate-800 dark:text-slate-100 mb-2 md:mb-3 group-hover:text-red-600 transition-colors duration-300 leading-tight">
                    {category.name}
                  </h3>
                  
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-4 leading-relaxed">
                    {category.vendorCount || 0} Professional Vendors
                  </p>
                  
                  {/* Decorative line */}
                  <div className="w-0 h-0.5 bg-gradient-to-r from-red-500 to-teal-500 mx-auto group-hover:w-8 md:group-hover:w-16 transition-all duration-500 rounded-full"></div>
                  
                  {/* Arrow indicator */}
                  <div className="mt-2 md:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <i className="fas fa-arrow-right text-red-500 text-xs md:text-sm"></i>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        {/* Call to action */}
        <div className="text-center mt-16">
          <Link href="/vendors/all">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl">
              <span>Explore All Vendors</span>
              <i className="fas fa-chevron-right"></i>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
