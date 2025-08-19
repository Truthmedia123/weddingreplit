import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FontSelectorProps } from './types';

const FONT_OPTIONS = [
  {
    id: 'elegant-script',
    name: 'Elegant Script',
    family: 'Playfair Display',
    category: 'script',
    preview: 'Beautiful flowing script',
    description: 'Classic wedding invitation font with elegant curves'
  },
  {
    id: 'modern-sans',
    name: 'Modern Sans',
    family: 'Inter',
    category: 'sans-serif',
    preview: 'Clean modern sans-serif',
    description: 'Contemporary and clean for modern weddings'
  },
  {
    id: 'traditional-serif',
    name: 'Traditional Serif',
    family: 'Crimson Text',
    category: 'serif',
    preview: 'Traditional serif font',
    description: 'Timeless and formal serif typeface'
  },
  {
    id: 'decorative-display',
    name: 'Decorative Display',
    family: 'Dancing Script',
    category: 'display',
    preview: 'Decorative display font',
    description: 'Ornate and decorative for special occasions'
  }
];

const FontSelector: React.FC<FontSelectorProps> = ({
  selectedFont,
  onFontChange,
  disabled = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Typography Selection
        </CardTitle>
        <p className="text-sm text-gray-600">
          Choose the font style for your invitation text
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FONT_OPTIONS.map((font) => (
            <div
              key={font.id}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedFont === font.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onFontChange(font.id)}
            >
              {/* Selected Indicator */}
              {selectedFont === font.id && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Selected
                  </Badge>
                </div>
              )}

              {/* Font Preview */}
              <div className="mb-3">
                <div
                  className="text-2xl font-medium mb-2"
                  style={{ fontFamily: font.family }}
                >
                  {font.preview}
                </div>
                <div className="text-sm text-gray-600">
                  {font.description}
                </div>
              </div>

              {/* Font Details */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{font.name}</h4>
                  <p className="text-xs text-gray-500 capitalize">
                    {font.category} • {font.family}
                  </p>
                </div>

                {/* Font Category Badge */}
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    font.category === 'script'
                      ? 'border-pink-200 text-pink-700'
                      : font.category === 'serif'
                      ? 'border-blue-200 text-blue-700'
                      : font.category === 'sans-serif'
                      ? 'border-green-200 text-green-700'
                      : 'border-purple-200 text-purple-700'
                  }`}
                >
                  {font.category}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Font Size Slider */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="fontSize" className="text-sm font-medium">
              Font Size
            </Label>
            <span className="text-sm text-gray-600">Medium</span>
          </div>
          <input
            type="range"
            id="fontSize"
            min="0.8"
            max="1.4"
            step="0.1"
            defaultValue="1"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            💡 Typography Tips
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Script fonts work well for couple names and romantic text</li>
            <li>• Sans-serif fonts are great for modern, clean designs</li>
            <li>• Serif fonts provide a traditional, formal appearance</li>
            <li>• Consider readability when choosing font size</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FontSelector;