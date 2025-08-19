import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Smartphone, Monitor, Printer } from 'lucide-react';

interface PreviewControlsProps {
  viewMode: 'edit' | 'preview';
  onViewModeChange: (mode: 'edit' | 'preview') => void;
  previewSize: 'mobile' | 'desktop' | 'print';
  onPreviewSizeChange: (size: 'mobile' | 'desktop' | 'print') => void;
}

export default function PreviewControls({ 
  viewMode, 
  onViewModeChange, 
  previewSize, 
  onPreviewSizeChange 
}: PreviewControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Preview Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* View Mode Toggle */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            View Mode
          </label>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'edit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('edit')}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('preview')}
              className="flex-1"
            >
              <EyeOff className="w-4 h-4 mr-1" />
              Final
            </Button>
          </div>
        </div>

        {/* Preview Size */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Preview Size
          </label>
          <div className="space-y-2">
            <Button
              variant={previewSize === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPreviewSizeChange('mobile')}
              className="w-full justify-start"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile (400x600)
            </Button>
            <Button
              variant={previewSize === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPreviewSizeChange('desktop')}
              className="w-full justify-start"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Desktop (800x1200)
            </Button>
            <Button
              variant={previewSize === 'print' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPreviewSizeChange('print')}
              className="w-full justify-start"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print (1200x1800)
            </Button>
          </div>
        </div>

        {/* Preview Info */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <p className="font-medium mb-1">Preview Tips:</p>
          <ul className="space-y-1">
            <li>• Edit mode shows form fields</li>
            <li>• Final mode shows clean preview</li>
            <li>• Use zoom controls for detail view</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}