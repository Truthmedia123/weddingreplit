import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Sparkles, Search } from 'lucide-react';
import TemplateCard from './TemplateCard';
import { EnhancedTemplate } from './TemplateManager';

interface TemplateSelectorProps {
  onTemplateSelect: (template: EnhancedTemplate) => void;
  onAnalyticsEvent?: (eventType: string, templateId?: string, metadata?: any) => void;
}

interface TemplateFilters {
  category?: string;
  culturalTheme?: string;
  search?: string;
}

export default function TemplateSelector({ onTemplateSelect, onAnalyticsEvent }: TemplateSelectorProps) {
  const [filters, setFilters] = useState<TemplateFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Mock templates data for now
  const mockTemplates: EnhancedTemplate[] = [
    {
      id: 'goan-beach-bliss',
      name: 'Goan Beach Bliss',
      category: 'goan-beach',
      style: 'Tropical Paradise',
      description: 'Stunning beach wedding invitation with golden sunset, palm trees, and ocean waves perfect for Goan ceremonies',
      previewUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
      templateData: {
        layout: 'portrait',
        elements: {
          coupleNames: { x: 200, y: 150, fontSize: 24, fontFamily: 'serif' },
          ceremonyDetails: { x: 200, y: 250, fontSize: 16, fontFamily: 'sans-serif' },
          receptionDetails: { x: 200, y: 300, fontSize: 16, fontFamily: 'sans-serif' },
          contactInfo: { x: 200, y: 350, fontSize: 14, fontFamily: 'sans-serif' },
          qrCode: { x: 200, y: 450, size: 60 }
        },
        colorSchemes: [
          { name: 'Sunset', primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFD700', background: '#FFFFFF' }
        ],
        typography: {
          fonts: [
            { name: 'Serif', family: 'serif', weights: [400, 600, 700], category: 'serif' }
          ]
        }
      },
      features: ['Beach Sunset Theme', 'Palm Tree Silhouettes', 'Ocean Wave Borders', 'Tropical Typography'],
      colors: ['Coral', 'Turquoise', 'Gold'],
      price: 'Free',
      popular: true,
      premium: false,
      isActive: true
    },
    {
      id: 'portuguese-heritage',
      name: 'Portuguese Heritage',
      category: 'christian',
      style: 'Colonial Elegance',
      description: 'Elegant design inspired by Portuguese colonial architecture with azulejo tile patterns and traditional motifs',
      previewUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
      templateData: {
        layout: 'portrait',
        elements: {
          coupleNames: { x: 200, y: 150, fontSize: 24, fontFamily: 'serif' },
          ceremonyDetails: { x: 200, y: 250, fontSize: 16, fontFamily: 'sans-serif' },
          receptionDetails: { x: 200, y: 300, fontSize: 16, fontFamily: 'sans-serif' },
          contactInfo: { x: 200, y: 350, fontSize: 14, fontFamily: 'sans-serif' },
          qrCode: { x: 200, y: 450, size: 60 }
        },
        colorSchemes: [
          { name: 'Heritage', primary: '#4169E1', secondary: '#FFFFFF', accent: '#FFD700', background: '#F5F5DC' }
        ],
        typography: {
          fonts: [
            { name: 'Serif', family: 'serif', weights: [400, 600, 700], category: 'serif' }
          ]
        }
      },
      features: ['Azulejo Tile Patterns', 'Colonial Architecture', 'Bilingual Support', 'Heritage Colors'],
      colors: ['Royal Blue', 'White', 'Gold'],
      price: '₹399',
      popular: false,
      premium: true,
      isActive: true
    },
    {
      id: 'hindu-elegant-mandala',
      name: 'Hindu Elegant Mandala',
      category: 'hindu',
      style: 'Sacred Geometry',
      description: 'Beautiful mandala design with traditional Hindu motifs and sacred geometry patterns',
      previewUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
      templateData: {
        layout: 'portrait',
        elements: {
          coupleNames: { x: 200, y: 150, fontSize: 24, fontFamily: 'serif' },
          ceremonyDetails: { x: 200, y: 250, fontSize: 16, fontFamily: 'sans-serif' },
          receptionDetails: { x: 200, y: 300, fontSize: 16, fontFamily: 'sans-serif' },
          contactInfo: { x: 200, y: 350, fontSize: 14, fontFamily: 'sans-serif' },
          qrCode: { x: 200, y: 450, size: 60 }
        },
        colorSchemes: [
          { name: 'Sacred', primary: '#DC143C', secondary: '#FFD700', accent: '#483D8B', background: '#FFFFFF' }
        ],
        typography: {
          fonts: [
            { name: 'Serif', family: 'serif', weights: [400, 600, 700], category: 'serif' }
          ]
        }
      },
      features: ['Sacred Geometry', 'Traditional Motifs', 'Mandala Patterns', 'Cultural Elements'],
      colors: ['Crimson', 'Gold', 'Deep Purple'],
      price: '₹299',
      popular: true,
      premium: false,
      isActive: true
    }
  ];

  const isLoading = false;
  const error = null;
  const templatesData = { templates: mockTemplates, categories: [], culturalThemes: [] };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCategoryFilter = (category: string) => {
    const newCategory = filters.category === category ? undefined : category;
    setFilters(prev => ({ ...prev, category: newCategory }));
    onAnalyticsEvent?.('filter_category', undefined, { category: newCategory });
  };

  const handleCulturalThemeFilter = (theme: string) => {
    const newTheme = filters.culturalTheme === theme ? undefined : theme;
    setFilters(prev => ({ ...prev, culturalTheme: newTheme }));
    onAnalyticsEvent?.('filter_cultural_theme', undefined, { culturalTheme: newTheme });
  };

  const handleTemplateSelect = (template?: EnhancedTemplate) => {
    if (!template) {
      console.warn('handleTemplateSelect called without a template');
      return;
    }
    onAnalyticsEvent?.('template_select', template.id);
    onTemplateSelect(template);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Templates</h2>
            <p className="text-gray-600">Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  const templates = templatesData?.templates || [];
  const categories = templatesData?.categories || [];
  const culturalThemes = templatesData?.culturalThemes || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-pink-500" />
            <h1 className="text-4xl font-bold text-gray-800">Choose Your Wedding Invitation</h1>
            <Sparkles className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select from our beautiful collection of Goan wedding invitation templates. 
            Each design can be fully customized with your details.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full border-gray-300 focus:border-pink-300 focus:ring-pink-200"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <Button
            variant={!filters.category ? "default" : "outline"}
            onClick={() => handleCategoryFilter('')}
            className="rounded-full px-4 py-2 text-sm hover:bg-pink-100 hover:border-pink-300 transition-all duration-200"
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={filters.category === category.id ? "default" : "outline"}
              onClick={() => handleCategoryFilter(category.id)}
              className="rounded-full px-4 py-2 text-sm hover:bg-pink-100 hover:border-pink-300 transition-all duration-200"
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>

        {/* Cultural Theme Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button
            variant={!filters.culturalTheme ? "default" : "outline"}
            onClick={() => handleCulturalThemeFilter('')}
            className="rounded-full px-4 py-2 text-sm hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
          >
            All Themes
          </Button>
          {culturalThemes.map((theme) => (
            <Button
              key={theme.id}
              variant={filters.culturalTheme === theme.id ? "default" : "outline"}
              onClick={() => handleCulturalThemeFilter(theme.id)}
              className="rounded-full px-4 py-2 text-sm hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
            >
              {theme.displayName}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading beautiful templates...</p>
          </div>
        )}

        {/* Template Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleTemplateSelect}
                onPreview={handleTemplateSelect}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && templates.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
            <Button
              onClick={() => {
                setFilters({});
                setSearchTerm('');
              }}
              variant="outline"
              className="rounded-full"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Need a custom design? Our designers can create something unique for you.
          </p>
          <Button variant="outline" className="rounded-full px-8 py-3">
            Request Custom Design
          </Button>
        </div>
      </div>
    </div>
  );
}