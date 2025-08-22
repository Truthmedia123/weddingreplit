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
  { id: 'all', name: 'All Templates', icon: Grid, count: 1 },
  { id: 'christian', name: 'Christian', icon: Calendar, count: 1 },
  { id: 'main', name: 'Main Invitation', icon: Calendar, count: 1 },
  { id: 'rsvp', name: 'RSVP Cards', icon: Users, count: 0 },
  { id: 'reception', name: 'Reception', icon: MapPin, count: 0 },
  { id: 'mehendi', name: 'Mehendi', icon: Palette, count: 0 },
  { id: 'sangeet', name: 'Sangeet', icon: Sparkles, count: 0 },
  { id: 'haldi', name: 'Haldi', icon: Heart, count: 0 }
];

const premiumTemplates: EnhancedTemplate[] = [];

const freeTemplates: EnhancedTemplate[] = [
  {
    id: 'goan-romance',
    name: 'Goan Romance',
    category: 'christian',
    style: 'Traditional Elegance',
    description: 'Classic Goan wedding invitation with vibrant floral borders and traditional typography perfect for romantic ceremonies',
    previewUrl: '/templates/template-goan-romance.jpg',
    templateData: {
      layout: 'portrait',
      elements: {
        coupleNames: { x: 200, y: 150, fontSize: 28, fontFamily: 'Dancing Script' },
        ceremonyDetails: { x: 200, y: 250, fontSize: 16, fontFamily: 'Playfair Display' },
        receptionDetails: { x: 200, y: 300, fontSize: 16, fontFamily: 'Playfair Display' },
        contactInfo: { x: 200, y: 350, fontSize: 14, fontFamily: 'Playfair Display' },
        qrCode: { x: 200, y: 450, size: 60 }
      },
      colorSchemes: [
        { name: 'Romance', primary: '#DC143C', secondary: '#228B22', accent: '#FFD700', background: '#F5F5DC' }
      ],
      typography: {
        fonts: [
          { name: 'Script', family: 'Dancing Script', weights: [400, 600, 700], category: 'script' },
          { name: 'Serif', family: 'Playfair Display', weights: [400, 600, 700], category: 'serif' }
        ]
      }
    },
    features: ['Floral Border Design', 'Traditional Typography', 'Script Fonts', 'Cultural Elements', 'Romantic Theme'],
    colors: ['Crimson Red', 'Forest Green', 'Gold', 'Cream'],
    price: 'Free',
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
