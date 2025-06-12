import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  {
    name: "Photographers",
    slug: "photographers",
    icon: "fas fa-camera",
    color: "from-red-500 to-red-600",
    count: "120+"
  },
  {
    name: "Venues",
    slug: "venues", 
    icon: "fas fa-map-marker-alt",
    color: "from-teal-500 to-teal-600",
    count: "85+"
  },
  {
    name: "Caterers",
    slug: "caterers",
    icon: "fas fa-utensils",
    color: "from-yellow-500 to-yellow-600",
    count: "95+"
  },
  {
    name: "Bands & DJs",
    slug: "bands-djs",
    icon: "fas fa-music",
    color: "from-purple-500 to-purple-600",
    count: "45+"
  },
  {
    name: "Makeup Artists",
    slug: "makeup-artists",
    icon: "fas fa-cut",
    color: "from-pink-500 to-rose-500",
    count: "60+"
  },
  {
    name: "Decor & Florists",
    slug: "decor-florists",
    icon: "fas fa-seedling",
    color: "from-green-500 to-emerald-500",
    count: "70+"
  }
];

export default function CategoryGrid() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 shell-pattern opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <p className="wedding-script text-2xl text-red-500 mb-4">
            Our Services
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
            Wedding Categories
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-teal-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our handpicked collection of Goa's most talented wedding professionals. 
            Each category features verified vendors who specialize in creating magical moments.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link key={category.slug} href={`/vendors/${category.slug}`}>
              <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-white/80 backdrop-blur-sm border-0 overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  {/* Hover background effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Icon container */}
                  <div className="relative mb-6">
                    <div className={`bg-gradient-to-br ${category.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                      <i className={`${category.icon} text-white text-2xl`}></i>
                    </div>
                    {/* Floating effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.color} w-20 h-20 rounded-2xl mx-auto opacity-20 blur-xl group-hover:blur-2xl transition-all duration-500`}></div>
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-800 mb-3 group-hover:text-red-600 transition-colors duration-300">
                    {category.name}
                  </h3>
                  
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    {category.count} Professional Vendors
                  </p>
                  
                  {/* Decorative line */}
                  <div className="w-0 h-0.5 bg-gradient-to-r from-red-500 to-teal-500 mx-auto group-hover:w-16 transition-all duration-500 rounded-full"></div>
                  
                  {/* Arrow indicator */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <i className="fas fa-arrow-right text-red-500"></i>
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
