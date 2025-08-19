import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Crown, Edit, Eye } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  style: string;
  description: string;
  features: string[];
  price: string;
  popular?: boolean;
  premium?: boolean;
  colors: string[];
}

interface TemplateGalleryProps {
  templates: Template[];
  onTemplateSelect: (template: Template) => void;
  onLiveEdit: (template: Template) => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates,
  onTemplateSelect,
  onLiveEdit
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="w-full">
      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="rounded-full px-4 py-2 text-sm transition-all duration-200"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id}
            className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden bg-white border-0 rounded-2xl"
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            <div className="relative h-72 bg-gradient-to-br from-gray-100 to-gray-200">
              {/* Template Preview Placeholder */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-6xl opacity-50">💌</div>
              </div>
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {template.popular && (
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Popular
                  </Badge>
                )}
                {template.premium && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg">
                    <Crown className="w-3 h-3 mr-1 fill-current" />
                    Premium
                  </Badge>
                )}
              </div>

              {/* Price */}
              <div className="absolute top-3 right-3">
                <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 font-bold shadow-lg">
                  {template.price}
                </Badge>
              </div>

              {/* Hover Actions */}
              {hoveredTemplate === template.id && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-all duration-300">
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      className="bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLiveEdit(template);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Live Edit
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline" 
                      className="bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white border-white/50 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTemplateSelect(template);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800 leading-tight">{template.name}</h3>
                <Badge variant="outline" className="text-xs ml-2 shrink-0">{template.category}</Badge>
              </div>
              
              <p className="text-gray-600 mb-3 text-sm leading-relaxed">{template.description}</p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-1 mb-3">
                {template.features.slice(0, 2).map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                    {feature}
                  </Badge>
                ))}
                {template.features.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                    +{template.features.length - 2} more
                  </Badge>
                )}
              </div>

              {/* Colors and Style */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {template.colors.slice(0, 3).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-500">{template.style}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TemplateGallery;