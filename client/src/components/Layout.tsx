import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import FloatingButtons from "./FloatingButtons";


interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { wishlistCount } = useWishlist();

  const navigation = [
    { name: "Categories", href: "/categories" },
    { name: "Venues", href: "/vendors/venues" },
    { name: "Blog", href: "/blog" },
    { name: "Invitations", href: "/generate-invitation" },
    { name: "Create RSVP", href: "/create-rsvp" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/vendors/all?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-yellow-500/20 nav-mobile">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                  <span style={{ color: "var(--goan-coral)" }}>TheGoan</span>
                  <span style={{ color: "var(--goan-sea-blue)" }}>Wedding</span>
                </h1>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-baseline space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      location.startsWith(item.href)
                        ? "text-red-500"
                        : "text-slate-700 hover:text-red-500"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  />
                  <button
                    type="submit"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <i className="fas fa-search text-sm"></i>
                  </button>
                </div>
              </form>
              
              {/* Wishlist Button */}
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2 hover:bg-red-50 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              
              <Link href="/list-business">
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105"
                >
                  List Your Business
                </Button>
              </Link>
            </div>
            
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <i className="fas fa-bars text-xl text-slate-700"></i>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    <div className="flex justify-between items-center pb-4">
                      <h3 className="text-lg font-semibold">Menu</h3>
                    </div>
                    
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="pb-4">
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Search vendors..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                        />
                        <button
                          type="submit"
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <i className="fas fa-search text-sm"></i>
                        </button>
                      </div>
                    </form>
                    
                    {/* Mobile Wishlist */}
                    <Link href="/wishlist" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                          <span className="font-medium">My Wishlist</span>
                        </div>
                        {wishlistCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {wishlistCount}
                          </Badge>
                        )}
                      </div>
                    </Link>
                    
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="text-lg font-medium text-slate-700 hover:text-red-500 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                    <Link href="/list-business" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-red-500 hover:bg-red-600 text-white mt-4">
                        List Your Business
                      </Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                <span style={{ color: "var(--goan-coral)" }}>TheGoan</span>
                <span style={{ color: "var(--goan-sea-blue)" }}>Wedding</span>
              </h3>
              <p className="text-gray-300 mb-6">
                Goa's premier wedding vendor directory, connecting couples with the finest professionals for their special day.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-red-500 transition-colors">
                  <i className="fab fa-facebook text-xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-red-500 transition-colors">
                  <i className="fab fa-instagram text-xl"></i>
                </a>

              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Popular Categories</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/vendors/photographers" className="hover:text-red-500 transition-colors">Wedding Photographers</Link></li>
                <li><Link href="/vendors/venues" className="hover:text-red-500 transition-colors">Beach Venues</Link></li>
                <li><Link href="/vendors/caterers" className="hover:text-red-500 transition-colors">Goan Caterers</Link></li>
                <li><Link href="/vendors/makeup-artists" className="hover:text-red-500 transition-colors">Makeup Artists</Link></li>
                <li><Link href="/vendors/wedding-planners" className="hover:text-red-500 transition-colors">Wedding Planners</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/about" className="hover:text-red-500 transition-colors">About Us</Link></li>
                <li><Link href="/list-business" className="hover:text-red-500 transition-colors">List Your Business</Link></li>
                <li><Link href="/blog" className="hover:text-red-500 transition-colors">Blog</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-red-500 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-conditions" className="hover:text-red-500 transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/cookie-policy" className="hover:text-red-500 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center">
                  <i className="fas fa-envelope mr-3 text-red-500"></i>
                  <span>info@thegoanwedding.com</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-3 text-red-500"></i>
                  <span>Goa, India</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-300">
            <p>&copy; 2025 TheGoanWedding.com. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <FloatingButtons />
    </div>
  );
}
