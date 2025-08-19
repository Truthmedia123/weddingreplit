import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { EnhancedTemplate } from './TemplateManager';

interface TemplatePreviewProps {
  template: EnhancedTemplate | null;
  onClose: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onClose
}) => {
  const [zoom, setZoom] = React.useState(1);

  if (!template) return null;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">{template.name}</h2>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 2}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetZoom}
            >
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-0 overflow-auto">
          <div className="flex items-center justify-center p-8 bg-gray-100">
            <div
              className="relative border border-gray-300 shadow-lg bg-white"
              style={{
                width: template.templateData?.layout === 'landscape' ? 600 : 400,
                height: template.templateData?.layout === 'landscape' ? 400 : 600,
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-in-out'
              }}
            >
              {/* Template Preview Content */}
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  {template.category} • {template.style}
                </div>
                <div className="text-2xl font-bold mb-2 text-gray-800">
                  Sample Couple
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Wedding Invitation Preview
                </div>
                <div className="text-lg font-semibold mb-2 text-gray-800">
                  February 15, 2025
                </div>
                <div className="text-sm text-gray-600">
                  Beautiful Venue, Goa
                </div>
              </div>

              {/* Template-specific styling */}
              {template.category === 'goan-beach' && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-orange-300 opacity-20"></div>
              )}
              {template.category === 'christian' && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-10"></div>
              )}
              {template.category === 'hindu' && (
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-orange-500 opacity-15"></div>
              )}
            </div>
          </div>
        </CardContent>

        {/* Template Details */}
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Features</h4>
              <div className="flex flex-wrap gap-1">
                {template.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Colors</h4>
              <div className="flex gap-2">
                {template.colors.slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Layout</h4>
              <div className="text-sm text-gray-600">
                {template.templateData?.layout === 'landscape' ? 'Landscape' : 'Portrait'}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TemplatePreview;
