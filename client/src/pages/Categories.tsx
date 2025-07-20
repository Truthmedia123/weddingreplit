import { useState } from "react";
import CategoryGrid from "@/components/CategoryGrid";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const seoData = {
    title: "Wedding Vendor Categories in Goa | Complete Directory - TheGoanWedding.com",
    description: "Browse all wedding vendor categories in Goa. Find photographers, venues, caterers, decorators, and more. 33+ categories with verified professionals for your perfect wedding.",
    keywords: "Goa wedding categories, wedding vendors Goa, wedding services Goa, photographers Goa, wedding venues Goa, caterers Goa, wedding planners Goa",
    ogUrl: "https://thegoanwedding.com/categories",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Wedding Vendor Categories - Goa",
      "description": "Complete directory of wedding vendor categories in Goa",
      "url": "https://thegoanwedding.com/categories",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": categories.map((category, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": category.name,
          "description": category.description,
          "url": `https://thegoanwedding.com/vendors/${category.slug}`
        }))
      }
    }
  };

  return (
    <>
      <SEOHead {...seoData} />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <header className="text-center mb-12">
            <p className="wedding-script text-xl md:text-2xl mb-4" style={{ color: 'var(--goan-coral)' }}>
              Complete Collection
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
              Wedding Vendor Categories
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r mx-auto mb-6 rounded-full" 
                 style={{ background: 'linear-gradient(to right, var(--goan-coral), var(--goan-ocean-blue))' }}>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Discover Goa's most talented wedding professionals across 33+ specialized categories. 
              Each features verified vendors who create magical moments for your special day.
            </p>
            
            {/* Search functionality */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-full border-2 focus:ring-2"
                  style={{ borderColor: 'var(--goan-coral)', focusRingColor: 'var(--goan-ocean-blue)' }}
                  aria-label="Search wedding vendor categories"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i className="fas fa-search"></i>
                </div>
              </div>
              {searchTerm && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing {filteredCategories.length} of {categories.length} categories
                </p>
              )}
            </div>
          </header>
          
          <CategoryGrid showAll={true} searchFilter={searchTerm} />
          
          {/* Additional SEO content */}
          <section className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
              Why Choose Verified Wedding Vendors in Goa?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="hover-lift">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" 
                     style={{ backgroundColor: 'var(--goan-coral)' }}>
                  <i className="fas fa-shield-check text-white text-xl"></i>
                </div>
                <h3 className="font-semibold text-lg mb-2">Verified Professionals</h3>
                <p className="text-gray-600">All our vendors are thoroughly verified with authentic reviews and portfolios.</p>
              </div>
              <div className="hover-lift">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" 
                     style={{ backgroundColor: 'var(--goan-ocean-blue)' }}>
                  <i className="fas fa-map-marker-alt text-white text-xl"></i>
                </div>
                <h3 className="font-semibold text-lg mb-2">Local Goan Expertise</h3>
                <p className="text-gray-600">Specialists who understand Goan culture, traditions, and the best venues.</p>
              </div>
              <div className="hover-lift">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" 
                     style={{ backgroundColor: 'var(--goan-palm-green)' }}>
                  <i className="fas fa-star text-white text-xl"></i>
                </div>
                <h3 className="font-semibold text-lg mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600">Only the finest professionals who consistently deliver exceptional results.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}