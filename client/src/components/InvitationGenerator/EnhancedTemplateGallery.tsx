import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Crown, 
  Heart,
  Eye,
  Edit3,
  Download,
  Share2,
  Sparkles,
  Palette,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';
import type { EnhancedTemplate } from './TemplateGallery/TemplateManager';

interface EnhancedTemplateGalleryProps {
  onTemplateSelect: (template: EnhancedTemplate) => void;
  onPreview: (template: EnhancedTemplate) => void;
}

const invitationCategories = [
  { id: 'all', name: 'All Templates', icon: Grid, count: 24 },
  { id: 'main', name: 'Main Invitation', icon: Calendar, count: 8 },
  { id: 'rsvp', name: 'RSVP Cards', icon: Users, count: 6 },
  { id: 'reception', name: 'Reception', icon: MapPin, count: 4 },
  { id: 'mehendi', name: 'Mehendi', icon: Palette, count: 3 },
  { id: 'sangeet', name: 'Sangeet', icon: Sparkles, count: 2 },
  { id: 'haldi', name: 'Haldi', icon: Heart, count: 1 }
];

const premiumTemplates: EnhancedTemplate[] = [
  {
    id: 'goan-beach-luxury',
    name: 'Goan Beach Luxury',
    category: 'goan-beach',
    style: 'Premium Beach Elegance',
    description: 'Luxurious beach wedding invitation with golden accents and tropical motifs',
    previewUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    templateData: {
      layout: 'portrait',
      elements: {
        coupleNames: { x: 200, y: 150, fontSize: 28, fontFamily: 'Playfair Display' },
        ceremonyDetails: { x: 200, y: 250, fontSize: 16, fontFamily: 'Lato' },
        receptionDetails: { x: 200, y: 300, fontSize: 16, fontFamily: 'Lato' },
        contactInfo: { x: 200, y: 350, fontSize: 14, fontFamily: 'Lato' },
        qrCode: { x: 200, y: 450, size: 60 }
      },
      colorSchemes: [
        { name: 'Luxury Gold', primary: '#D4AF37', secondary: '#FFFFFF', accent: '#000000', background: '#F8F8F8' }
      ],
      typography: {
        fonts: [
          { name: 'Playfair Display', family: 'Playfair Display', weights: [400, 600, 700], category: 'serif' }
        ]
      }
    },
    features: ['Premium Design', 'Gold Foiling', 'Beach Motifs', 'Luxury Paper'],
    colors: ['Gold', 'White', 'Black'],
    price: '₹1,299',
    popular: true,
    premium: true,
    isActive: true
  },
  {
    id: 'portuguese-heritage-premium',
    name: 'Portuguese Heritage Premium',
    category: 'christian',
    style: 'Colonial Luxury',
    description: 'Premium Portuguese colonial design with azulejo patterns and heritage elements',
    previewUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    templateData: {
      layout: 'portrait',
      elements: {
        coupleNames: { x: 200, y: 150, fontSize: 28, fontFamily: 'Playfair Display' },
        ceremonyDetails: { x: 200, y: 250, fontSize: 16, fontFamily: 'Lato' },
        receptionDetails: { x: 200, y: 300, fontSize: 16, fontFamily: 'Lato' },
        contactInfo: { x: 200, y: 350, fontSize: 14, fontFamily: 'Lato' },
        qrCode: { x: 200, y: 450, size: 60 }
      },
      colorSchemes: [
        { name: 'Heritage Blue', primary: '#1E3A8A', secondary: '#FFFFFF', accent: '#D4AF37', background: '#F5F5DC' }
      ],
      typography: {
        fonts: [
          { name: 'Playfair Display', family: 'Playfair Display', weights: [400, 600, 700], category: 'serif' }
        ]
      }
    },
    features: ['Azulejo Patterns', 'Heritage Design', 'Premium Paper', 'Bilingual'],
    colors: ['Navy Blue', 'White', 'Gold'],
    price: '₹999',
    popular: false,
    premium: true,
    isActive: true
  },
  {
    id: 'hindu-mandala-premium',
    name: 'Hindu Mandala Premium',
    category: 'hindu',
    style: 'Sacred Luxury',
    description: 'Premium mandala design with traditional Hindu motifs and sacred geometry',
    previewUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    templateData: {
      layout: 'portrait',
      elements: {
        coupleNames: { x: 200, y: 150, fontSize: 28, fontFamily: 'Playfair Display' },
        ceremonyDetails: { x: 200, y: 250, fontSize: 16, fontFamily: 'Lato' },
        receptionDetails: { x: 200, y: 300, fontSize: 16, fontFamily: 'Lato' },
        contactInfo: { x: 200, y: 350, fontSize: 14, fontFamily: 'Lato' },
        qrCode: { x: 200, y: 450, size: 60 }
      },
      colorSchemes: [
        { name: 'Sacred Red', primary: '#DC2626', secondary: '#FFD700', accent: '#7C3AED', background: '#FFFFFF' }
      ],
      typography: {
        fonts: [
          { name: 'Playfair Display', family: 'Playfair Display', weights: [400, 600, 700], category: 'serif' }
        ]
      }
    },
    features: ['Sacred Geometry', 'Traditional Motifs', 'Premium Paper', 'Cultural Elements'],
    colors: ['Crimson', 'Gold', 'Purple'],
    price: '₹899',
    popular: true,
    premium: true,
    isActive: true
  }
];

const freeTemplates: EnhancedTemplate[] = [
  {
    id: 'goan-beach-bliss',
    name: 'Goan Beach Bliss',
    category: 'goan-beach',
    style: 'Tropical Paradise',
    description: 'Stunning beach wedding invitation with golden sunset, palm trees, and ocean waves',
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
    description: 'Elegant design inspired by Portuguese colonial architecture with azulejo tile patterns',
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
    premium: false,
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

export default function EnhancedTemplateGallery({ onTemplateSelect, onPreview }: EnhancedTemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allTemplates = [...freeTemplates, ...premiumTemplates];
  
  const filteredTemplates = allTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Wedding Invitation Templates
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our collection of beautifully designed wedding invitation templates. 
              From traditional to modern, we have the perfect design for your special day.
            </p>
          </div>

          {/* Search */}
          <div className="flex justify-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Category Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {invitationCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <category.icon className="w-4 h-4" />
              {category.name}
              <Badge variant="secondary" className="ml-1">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative">
                <img
                  src={template.previewUrl}
                  alt={template.name}
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => onTemplateSelect(template)}
                    className="bg-white text-gray-800 hover:bg-gray-100"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPreview(template)}
                    className="bg-white/90 text-white border-white hover:bg-white hover:text-gray-800"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>

              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm text-gray-800">{template.name}</h3>
                  <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
