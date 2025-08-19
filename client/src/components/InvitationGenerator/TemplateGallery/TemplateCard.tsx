import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Star, Crown } from 'lucide-react';
import { EnhancedTemplate } from './TemplateManager';
import InvitationPreview from '../../InvitationPreview';

interface TemplateCardProps {
  template: EnhancedTemplate;
  isSelected?: boolean;
  onSelect: (template: EnhancedTemplate) => void;
  onPreview: (template: EnhancedTemplate) => void;
}

export default function TemplateCard({ template, isSelected, onSelect, onPreview }: TemplateCardProps) {
  const handleCardClick = () => {
    onSelect(template);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview(template);
  };

  const isPremium = template.premium || false;
  const isPopular = template.popular || false;

  return (
    <Card 
      className={`group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="w-full h-48 flex items-center justify-center bg-gray-50">
          <InvitationPreview 
            template={template} 
            width={200} 
            height={280} 
          />
        </div>
        
        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-blue-500 text-white">
              Selected
            </Badge>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isPopular && (
            <Badge className="bg-yellow-500 text-white text-xs">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Popular
            </Badge>
          )}
          {isPremium && (
            <Badge className="bg-purple-500 text-white text-xs">
              <Crown className="w-3 h-3 mr-1 fill-current" />
              Premium
            </Badge>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-2 right-2">
          <Badge className="bg-gray-800 text-white text-xs">
            {template.category}
          </Badge>
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black bg-opacity-20">
          <div className="flex gap-2">
            <Button 
              size="sm"
              variant="secondary"
              onClick={handlePreviewClick}
            >
              Preview
            </Button>
            <Button 
              size="sm"
              onClick={handleCardClick}
            >
              Select
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{template.style}</span>
          <span className="text-sm font-medium text-gray-900">{template.price}</span>
        </div>
      </CardContent>
    </Card>
  );
}