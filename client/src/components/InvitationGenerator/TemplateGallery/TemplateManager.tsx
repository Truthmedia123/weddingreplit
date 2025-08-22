import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Star, Crown, Palette, Sparkles } from 'lucide-react';
import TemplateCard from './TemplateCard';
import TemplatePreview from './TemplatePreview';

export interface EnhancedTemplate {
  id: string;
  name: string;
  category: 'goan-beach' | 'christian' | 'hindu' | 'muslim' | 'modern' | 'vintage';
  style: string;
  description: string;
  previewUrl: string;
  templateData: {
    layout: 'portrait' | 'landscape' | 'square';
    elements: {
      coupleNames: { x: number; y: number; fontSize: number; fontFamily: string };
      ceremonyDetails: { x: number; y: number; fontSize: number; fontFamily: string };
      receptionDetails: { x: number; y: number; fontSize: number; fontFamily: string };
      contactInfo: { x: number; y: number; fontSize: number; fontFamily: string };
      qrCode: { x: number; y: number; size: number };
      scriptureText?: { x: number; y: number; fontSize: number; fontFamily: string };
      bibleReference?: { x: number; y: number; fontSize: number; fontFamily: string };
      hostNames?: { x: number; y: number; fontSize: number; fontFamily: string };
      invitationMessage?: { x: number; y: number; fontSize: number; fontFamily: string };
      closingMessage?: { x: number; y: number; fontSize: number; fontFamily: string };
    };
    colorSchemes: Array<{
      name: string;
      primary: string;
      secondary: string;
      accent: string;
      background: string;
    }>;
    typography: {
      fonts: Array<{
        name: string;
        family: string;
        weights: number[];
        category: 'script' | 'serif' | 'sans-serif' | 'display';
      }>;
    };
  };
  features: string[];
  colors: string[];
  price: string;
  popular?: boolean;
  premium?: boolean;
  isActive: boolean;
}

interface TemplateManagerProps {
  templates: EnhancedTemplate[];
  selectedTemplate: EnhancedTemplate | null;
  onTemplateSelect: (template: EnhancedTemplate) => void;
  onTemplatePreview: (template: EnhancedTemplate) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onTemplatePreview,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'popularity' | 'price'>('name');

  const categories = [
    { id: 'all', name: 'All Templates', icon: Sparkles },
    { id: 'goan-beach', name: 'Goan Beach', icon: Palette },
    { id: 'christian', name: 'Christian', icon: Star },
    { id: 'hindu', name: 'Hindu', icon: Crown },
    { id: 'muslim', name: 'Muslim', icon: Star },
    { id: 'modern', name: 'Modern', icon: Sparkles },
    { id: 'vintage', name: 'Vintage', icon: Crown },
  ];

  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates.filter(template => template.isActive);

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.features.some(feature => 
          feature.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return 0;
        case 'price':
          const priceA = a.price === 'Free' ? 0 : parseInt(a.price.replace('₹', ''));
          const priceB = b.price === 'Free' ? 0 : parseInt(b.price.replace('₹', ''));
          return priceA - priceB;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [templates, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="popularity">Sort by Popularity</option>
            <option value="price">Sort by Price</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate?.id === template.id}
                onSelect={() => onTemplateSelect(template)}
                onPreview={() => onTemplatePreview(template)}
              />
            ))}
          </div>

          {filteredAndSortedTemplates.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Selected Template Details */}
      {selectedTemplate && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedTemplate.name}
              {selectedTemplate.popular && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
              {selectedTemplate.premium && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Available Colors</h4>
                <div className="flex gap-2">
                  {selectedTemplate.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => onTemplatePreview(selectedTemplate)}
                  variant="outline"
                  className="flex-1"
                >
                  Preview Template
                </Button>
                <Button 
                  onClick={() => onTemplateSelect(selectedTemplate)}
                  className="flex-1"
                >
                  Use This Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateManager;
