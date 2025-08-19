import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Smartphone, 
  Monitor, 
  Tablet,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { FormData } from '../FormWizard/EnhancedFormWizard';

interface LivePreviewProps {
  templateId: string;
  formData: FormData;
  isPreview?: boolean;
  onDownload?: () => void;
}

type ViewMode = 'mobile' | 'tablet' | 'desktop';

const VIEW_MODES: Record<ViewMode, { width: number; height: number; label: string; icon: any }> = {
  mobile: { width: 375, height: 667, label: 'Mobile', icon: Smartphone },
  tablet: { width: 768, height: 1024, label: 'Tablet', icon: Tablet },
  desktop: { width: 800, height: 1200, label: 'Desktop', icon: Monitor }
};

const LivePreview: React.FC<LivePreviewProps> = ({
  templateId,
  formData,
  isPreview = false,
  onDownload
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');
  const [isRendering, setIsRendering] = useState(false);
  const [renderTime, setRenderTime] = useState<number>(0);

  // Debounce form data changes to prevent excessive re-renders
  const debouncedFormData = useDebounce(formData, 300);

  // Get current view dimensions
  const currentView = VIEW_MODES[viewMode];
  const canvasWidth = currentView.width * zoom;
  const canvasHeight = currentView.height * zoom;

  // Memoize template data to prevent unnecessary re-renders
  const templateData = useMemo(() => {
    // This would come from your template system
    return {
      layout: 'portrait' as const,
      elements: {
        coupleNames: { x: 400, y: 300, fontSize: 48, fontFamily: formData.selectedFont },
        ceremonyDetails: { x: 400, y: 500, fontSize: 24, fontFamily: 'serif' },
        receptionDetails: { x: 400, y: 700, fontSize: 24, fontFamily: 'serif' },
        contactInfo: { x: 400, y: 900, fontSize: 18, fontFamily: 'sans-serif' },
        qrCode: { x: 400, y: 1100, size: 80 }
      },
      colorSchemes: [
        {
          name: 'classic-gold',
          primary: '#D4AF37',
          secondary: '#8B4513',
          accent: '#FFD700',
          background: '#FEF9F3'
        }
      ]
    };
  }, [formData.selectedFont]);

  // Render invitation to canvas
  const renderInvitation = useCallback(async () => {
    if (!canvasRef.current || !debouncedFormData) return;

    setIsRendering(true);
    const startTime = performance.now();
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      // Set canvas dimensions
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Get color scheme
      const colorScheme = templateData.colorSchemes.find(
        scheme => scheme.name === debouncedFormData.selectedColorScheme
      ) || templateData.colorSchemes[0];

      // Draw background
      ctx.fillStyle = colorScheme.background;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Load and draw template background
      try {
        const templateImage = new Image();
        templateImage.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          templateImage.onload = resolve;
          templateImage.onerror = reject;
          templateImage.src = `/attached_assets/templates/${templateId}-background.png`;
        });

        // Scale image to fit canvas while maintaining aspect ratio
        const aspectRatio = templateImage.width / templateImage.height;
        let drawWidth = canvasWidth;
        let drawHeight = canvasHeight;
        
        if (aspectRatio > canvasWidth / canvasHeight) {
          drawHeight = canvasWidth / aspectRatio;
        } else {
          drawWidth = canvasHeight * aspectRatio;
        }
        
        const x = (canvasWidth - drawWidth) / 2;
        const y = (canvasHeight - drawHeight) / 2;
        
        ctx.drawImage(templateImage, x, y, drawWidth, drawHeight);
      } catch (error) {
        console.warn('Template background not found, using fallback design');
        // Draw fallback decorative border
        ctx.strokeStyle = colorScheme.primary;
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, canvasWidth - 40, canvasHeight - 40);
      }

      // Draw couple names
      const coupleNamesElement = templateData.elements.coupleNames;
      ctx.font = `${coupleNamesElement.fontSize * zoom}px ${coupleNamesElement.fontFamily}`;
      ctx.fillStyle = colorScheme.primary;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const coupleText = `${debouncedFormData.groomName} & ${debouncedFormData.brideName}`;
      ctx.fillText(coupleText, coupleNamesElement.x * zoom, coupleNamesElement.y * zoom);

      // Draw ceremony details
      const ceremonyElement = templateData.elements.ceremonyDetails;
      ctx.font = `${ceremonyElement.fontSize * zoom}px ${ceremonyElement.fontFamily}`;
      ctx.fillStyle = colorScheme.secondary;
      ctx.textAlign = 'center';
      
      const ceremonyText = [
        `Ceremony: ${debouncedFormData.ceremonyVenue}`,
        `${debouncedFormData.ceremonyDate} at ${debouncedFormData.ceremonyTime}`
      ];
      
      ceremonyText.forEach((line, index) => {
        ctx.fillText(
          line, 
          ceremonyElement.x * zoom, 
          (ceremonyElement.y + index * 40) * zoom
        );
      });

      // Draw reception details
      const receptionElement = templateData.elements.receptionDetails;
      ctx.font = `${receptionElement.fontSize * zoom}px ${receptionElement.fontFamily}`;
      
      const receptionText = [
        `Reception: ${debouncedFormData.receptionVenue}`,
        `${debouncedFormData.receptionDate} at ${debouncedFormData.receptionTime}`
      ];
      
      receptionText.forEach((line, index) => {
        ctx.fillText(
          line, 
          receptionElement.x * zoom, 
          (receptionElement.y + index * 40) * zoom
        );
      });

      // Draw contact info
      const contactElement = templateData.elements.contactInfo;
      ctx.font = `${contactElement.fontSize * zoom}px ${contactElement.fontFamily}`;
      ctx.fillStyle = colorScheme.secondary;
      
      const contactText = [
        `Contact: ${debouncedFormData.contact1}`,
        debouncedFormData.address1
      ];
      
      contactText.forEach((line, index) => {
        ctx.fillText(
          line, 
          contactElement.x * zoom, 
          (contactElement.y + index * 30) * zoom
        );
      });

      // Draw QR code if enabled
      if (debouncedFormData.qrCodeEnabled) {
        const qrElement = templateData.elements.qrCode;
        const qrSize = qrElement.size * zoom;
        
        // Generate QR code URL (this would be your RSVP URL)
        const rsvpUrl = `https://yourdomain.com/rsvp/${templateId}`;
        
        // For now, draw a placeholder QR code
        ctx.fillStyle = '#000';
        ctx.fillRect(
          (qrElement.x - qrSize/2) * zoom, 
          (qrElement.y - qrSize/2) * zoom, 
          qrSize, 
          qrSize
        );
        
        // Add QR code label
        ctx.font = `${12 * zoom}px sans-serif`;
        ctx.fillStyle = colorScheme.secondary;
        ctx.fillText(
          'Scan for RSVP', 
          qrElement.x * zoom, 
          (qrElement.y + qrSize/2 + 20) * zoom
        );
      }

      setRenderTime(performance.now() - startTime);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render invitation');
      console.error('Render error:', err);
    } finally {
      setIsRendering(false);
    }
  }, [debouncedFormData, templateData, templateId, canvasWidth, canvasHeight, zoom]);

  // Re-render when dependencies change
  useEffect(() => {
    renderInvitation();
  }, [renderInvitation]);

  // Handle zoom changes
  const handleZoomChange = useCallback((value: number[]) => {
    setZoom(value[0]);
  }, []);

  // Reset zoom
  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  // Download canvas as image
  const downloadImage = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `wedding-invitation-${templateId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [templateId]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isRendering ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Monitor className="h-5 w-5" />
            )}
            Live Preview
            {renderTime > 0 && (
              <Badge variant="outline" className="text-xs">
                {renderTime.toFixed(0)}ms
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* View Mode Selector */}
            <div className="flex border rounded-lg">
              {Object.entries(VIEW_MODES).map(([mode, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode(mode as ViewMode)}
                    className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">{config.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Zoom Controls */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Zoom:</span>
          <Slider
            value={[zoom]}
            onValueChange={handleZoomChange}
            min={0.5}
            max={2}
            step={0.1}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 w-12">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="sm" onClick={resetZoom}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Canvas Container */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          <div 
            className="flex items-center justify-center"
            style={{ 
              width: canvasWidth, 
              height: canvasHeight,
              maxWidth: '100%',
              maxHeight: '600px'
            }}
          >
            {error ? (
              <div className="text-center p-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Render Error</h3>
                <p className="text-gray-600">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={renderInvitation}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className="border border-gray-300 shadow-lg"
                style={{
                  width: canvasWidth,
                  height: canvasHeight,
                  maxWidth: '100%',
                  maxHeight: '600px'
                }}
              />
            )}
          </div>
          
          {/* Loading Overlay */}
          {isRendering && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Rendering preview...</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isPreview && (
          <div className="flex gap-2">
            <Button onClick={downloadImage} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Preview
            </Button>
            {onDownload && (
              <Button onClick={onDownload} variant="outline" className="flex-1">
                Generate Final
              </Button>
            )}
          </div>
        )}

        {/* Preview Info */}
        <div className="text-xs text-gray-500 text-center">
          <p>Preview size: {currentView.width} × {currentView.height}px</p>
          <p>Template: {templateId} • Font: {formData.selectedFont}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LivePreview;