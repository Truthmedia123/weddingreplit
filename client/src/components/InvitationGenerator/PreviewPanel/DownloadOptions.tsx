import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share2, Smartphone, Monitor, Printer, FileImage, FileText } from 'lucide-react';
import type { InvitationFormData } from '@shared/invitation-types';
import type { EnhancedTemplate } from '../TemplateGallery/TemplateManager';

interface DownloadOptionsProps {
  template: EnhancedTemplate;
  formData: InvitationFormData;
  onDownload: (format: string, resolution: string) => void;
  onShare: () => void;
}

const downloadFormats = [
  {
    id: 'social',
    name: 'Social Media',
    icon: Smartphone,
    size: '1080x1080',
    description: 'Perfect for Instagram, Facebook',
    formats: ['PNG', 'JPG']
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: Monitor,
    size: '800x1200',
    description: 'Optimized for messaging',
    formats: ['PNG', 'JPG']
  },
  {
    id: 'print',
    name: 'Print Ready',
    icon: Printer,
    size: '300 DPI',
    description: 'High quality for printing',
    formats: ['PNG', 'PDF']
  }
];

export default function DownloadOptions({ template, formData, onDownload, onShare }: DownloadOptionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const handleDownload = async (formatId: string, fileFormat: string) => {
    setIsGenerating(true);
    setSelectedFormat(`${formatId}-${fileFormat}`);
    
    try {
      await onDownload(formatId, fileFormat);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsGenerating(false);
      setSelectedFormat(null);
    }
  };

  const handleBatchDownload = async () => {
    setIsGenerating(true);
    
    try {
      // Download all formats
      for (const format of downloadFormats) {
        for (const fileFormat of format.formats) {
          await onDownload(format.id, fileFormat);
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Batch download failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Download Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Batch Download */}
        <Button
          onClick={handleBatchDownload}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {isGenerating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Download All Formats
        </Button>

        {/* Individual Format Downloads */}
        <div className="space-y-3">
          {downloadFormats.map((format) => {
            const Icon = format.icon;
            return (
              <div key={format.id} className="border rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{format.name}</h4>
                    <p className="text-xs text-gray-500">{format.size} • {format.description}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {format.formats.map((fileFormat) => (
                    <Button
                      key={fileFormat}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(format.id, fileFormat)}
                      disabled={isGenerating}
                      className="flex-1"
                    >
                      {isGenerating && selectedFormat === `${format.id}-${fileFormat}` ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1" />
                      ) : fileFormat === 'PDF' ? (
                        <FileText className="w-3 h-3 mr-1" />
                      ) : (
                        <FileImage className="w-3 h-3 mr-1" />
                      )}
                      {fileFormat}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Share Option */}
        <div className="border-t pt-4">
          <Button
            variant="outline"
            onClick={onShare}
            className="w-full"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Invitation
          </Button>
        </div>

        {/* Download Info */}
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <p className="font-medium mb-1">Download Info:</p>
          <ul className="space-y-1">
            <li>• Files expire after 24 hours</li>
            <li>• High quality images included</li>
            <li>• PDF format ready for printing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}