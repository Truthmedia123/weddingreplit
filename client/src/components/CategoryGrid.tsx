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
    <section className="py-20 bg-slate-50 shell-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Popular Wedding Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our curated selection of the finest wedding vendors in Goa
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link key={category.slug} href={`/vendors/${category.slug}`}>
              <Card className="group cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className={`bg-gradient-to-br ${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <i className={`${category.icon} text-white text-2xl`}></i>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} Vendors</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
