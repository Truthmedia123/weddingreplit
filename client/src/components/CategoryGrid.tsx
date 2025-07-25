import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";
import { 
  Camera, 
  MapPin, 
  ChefHat,
  Calendar, 
  Sparkles,
  Music, 
  Flower2, 
  Shirt,
  Gem,
  Car,
  Video,
  Paintbrush,
  CakeSlice,
  Mail,
  Heart,
  Shield,
  Crown,
  Gift,
  Lightbulb,
  Tent,
  PartyPopper,
  Music2,
  Wine,
  Cake,
  Baby,
  Flower,
  Zap,
  Leaf,
  Mic,
  Star,
  Truck,
  Users,
  FileText,
  Scale,
  TreePalm,
  Home,
  Dog,
  Coffee,
  MessageCircle,
  HeartHandshake,
  Radio,
  ShieldCheck,
  Waves,
  Recycle,
  Scissors,
  Theater,
  Plane,
  Building,
  Smartphone,
  Globe,
  Building2,
  TreePine,
  Volume2,
  Church,
  PawPrint,
  User
} from "lucide-react";

interface CategoryGridProps {
  showAll?: boolean;
  maxCategories?: number;
  searchFilter?: string;
}

// Function to get Lucide icon by icon name
function getCategoryIcon(iconName: string) {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    Camera,
    MapPin,
    ChefHat,
    Calendar,
    Sparkles,
    Music,
    Flower2,
    Shirt,
    Gem,
    Car,
    Video,
    Paintbrush,
    CakeSlice,
    Mail,
    Heart,
    Shield,
    Crown,
    Gift,
    Lightbulb,
    Tent,
    PartyPopper,
    Music2,
    Wine,
    Cake,
    Baby,
    Zap,
    Leaf,
    Mic,
    Star,
    Truck,
    Users,
    FileText,
    Scale,
    TreePalm,
    Home,
    Dog,
    Coffee,
    MessageCircle,
    HeartHandshake,
    Radio,
    ShieldCheck,
    Waves,
    Recycle,
    Scissors,
    Theater,
    Plane,
    Building,
    Building2,
    TreePine,
    Volume2,
    Church,
    PawPrint,
    User,
    Smartphone,
    Globe,
    // Add aliases for missing icons
    'PaintBrush2': Paintbrush,
    'Ring': Crown, // Use crown as substitute for ring
    'Flower': Flower2
  };
  

  
  // Debug: log if icon is not found
  if (!iconMap[iconName]) {
    console.warn(`Icon not found: ${iconName}`);
  }
  
  return iconMap[iconName] || Camera;
}

export default function CategoryGrid({ showAll = false, maxCategories = 8, searchFilter = "" }: CategoryGridProps) {
  const { data: allCategories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

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
                <div className="bg-gray-200 rounded-xl h-32"></div>
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

        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {categories.map((category) => (
            <Link key={category.slug} href={`/vendors/${category.slug}`}>
              <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-white/80 backdrop-blur-sm border-0 overflow-hidden">
                <CardContent className="p-4 md:p-8 text-center relative">
                  {/* Hover background effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Icon container */}
                  <div className="relative mb-3 md:mb-6">
                    <div className={`bg-gradient-to-br ${category.color} w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                      {(() => {
                        const IconComponent = getCategoryIcon(category.icon);
                        return IconComponent ? <IconComponent className="text-white w-6 h-6 md:w-8 md:h-8" /> : <Camera className="text-white w-6 h-6 md:w-8 md:h-8" />;
                      })()}
                    </div>
                    {/* Floating effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.color} w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl mx-auto opacity-20 blur-xl group-hover:blur-2xl transition-all duration-500`}></div>
                  </div>
                  
                  <h3 className="font-bold text-sm md:text-lg text-slate-800 mb-2 md:mb-3 group-hover:text-red-600 transition-colors duration-300 leading-tight">
                    {category.name}
                  </h3>
                  
                  <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-4 leading-relaxed">
                    {category.vendorCount || 0} Professional Vendors
                  </p>
                  
                  {/* Decorative line */}
                  <div className="w-0 h-0.5 bg-gradient-to-r from-red-500 to-teal-500 mx-auto group-hover:w-8 md:group-hover:w-16 transition-all duration-500 rounded-full"></div>
                  
                  {/* Arrow indicator */}
                  <div className="mt-2 md:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-red-500 text-xs md:text-sm">→</div>
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
                <div>→</div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
