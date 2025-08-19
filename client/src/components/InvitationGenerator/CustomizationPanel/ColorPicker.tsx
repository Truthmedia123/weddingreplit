import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ColorPickerProps } from './types';

const COLOR_SCHEMES = [
  {
    id: 'classic-gold',
    name: 'Classic Gold',
    colors: {
      primary: '#D4AF37',
      secondary: '#8B4513',
      accent: '#FFD700',
      background: '#FEF9F3'
    },
    description: 'Traditional gold and brown for elegant weddings'
  },
  {
    id: 'romantic-rose',
    name: 'Romantic Rose',
    colors: {
      primary: '#E91E63',
      secondary: '#9C27B0',
      accent: '#FF69B4',
      background: '#FFF5F7'
    },
    description: 'Soft pink and purple for romantic celebrations'
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    colors: {
      primary: '#2196F3',
      secondary: '#00BCD4',
      accent: '#4CAF50',
      background: '#F5F9FF'
    },
    description: 'Blue and teal inspired by Goan beaches'
  },
  {
    id: 'sunset-coral',
    name: 'Sunset Coral',
    colors: {
      primary: '#FF6B6B',
      secondary: '#FF8E53',
      accent: '#FFD93D',
      background: '#FFF8F0'
    },
    description: 'Warm coral and orange for tropical vibes'
  },
  {
    id: 'elegant-silver',
    name: 'Elegant Silver',
    colors: {
      primary: '#607D8B',
      secondary: '#9E9E9E',
      accent: '#E0E0E0',
      background: '#FAFAFA'
    },
    description: 'Sophisticated silver and gray tones'
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    colors: {
      primary: '#4CAF50',
      secondary: '#8BC34A',
      accent: '#CDDC39',
      background: '#F1F8E9'
    },
    description: 'Fresh green tones for outdoor weddings'
  }
];

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColorScheme,
  onColorChange,
  disabled = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Color Scheme
        </CardTitle>
        <p className="text-sm text-gray-600">
          Choose the color palette for your invitation
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COLOR_SCHEMES.map((scheme) => (
            <div
              key={scheme.id}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedColorScheme === scheme.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onColorChange(scheme.id)}
            >
              {/* Selected Indicator */}
              {selectedColorScheme === scheme.id && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Selected
                  </Badge>
                </div>
              )}

              {/* Color Preview */}
              <div className="mb-3">
                <div className="flex gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: scheme.colors.primary }}
                    title="Primary Color"
                  />
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: scheme.colors.secondary }}
                    title="Secondary Color"
                  />
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: scheme.colors.accent }}
                    title="Accent Color"
                  />
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: scheme.colors.background }}
                    title="Background Color"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {scheme.description}
                </div>
              </div>

              {/* Scheme Details */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{scheme.name}</h4>
                  <p className="text-xs text-gray-500">
                    {Object.keys(scheme.colors).length} colors
                  </p>
                </div>

                {/* Color Names */}
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {scheme.colors.primary}
                  </div>
                  <div className="text-xs text-gray-500">
                    {scheme.colors.secondary}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Color Option */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Custom Colors</h4>
              <p className="text-sm text-gray-600">
                Create your own color scheme
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Coming Soon
            </Badge>
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            🎨 Color Tips
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Gold and silver work well for formal weddings</li>
            <li>• Pastel colors are perfect for spring and summer weddings</li>
            <li>• Consider your venue and theme when choosing colors</li>
            <li>• Ensure good contrast for readability</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorPicker;