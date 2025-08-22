import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  FileText,
  Image as ImageIcon,
  Plus,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { goanRomanceTemplate } from '../../../content-templates/index';

interface TextLayer {
  key: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
  fontStyle?: 'italic' | 'normal';
  defaultText: string;
}

interface TemplateData {
  [key: string]: string;
}

export default function InvitationGenerator() {
  console.log('InvitationGenerator component rendered');
  
  // Get templateId from URL path
  const path = window.location.pathname;
  const templateId = path.includes('/generate-invitation/') 
    ? path.split('/generate-invitation/')[1] 
    : null;
  
  console.log('Path:', path);
  console.log('TemplateId:', templateId);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [templateData, setTemplateData] = useState<TemplateData>({});
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize template data
  useEffect(() => {
    if (templateId === 'goan-romance') {
      const initialData: TemplateData = {};
      goanRomanceTemplate.layers.forEach(layer => {
        initialData[layer.key] = layer.defaultText;
      });

      // Load saved draft if available
      const savedDraft = localStorage.getItem(`invitation-draft-${templateId}`);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setTemplateData({ ...initialData, ...parsed.templateData });
        } catch (error) {
          console.error('Error loading saved draft:', error);
          setTemplateData(initialData);
        }
      } else {
        setTemplateData(initialData);
      }
    }
    setIsLoading(false);
  }, [templateId]);

  const handleFieldChange = (key: string, value: string) => {
    setTemplateData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveDraft = () => {
    if (!templateId) return;

    const draftData = {
      templateId,
      templateData,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(`invitation-draft-${templateId}`, JSON.stringify(draftData));
    alert('Draft saved successfully!');
  };

  const handleDownloadPNG = async () => {
    if (!canvasRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${goanRomanceTemplate.name || 'invitation'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Error generating PNG. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!canvasRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${goanRomanceTemplate.name || 'invitation'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const renderTextLayer = (layer: TextLayer) => {
    const value = templateData[layer.key] || '';
    
    return (
      <div
        key={layer.key}
        className="absolute select-none"
        style={{
          left: layer.x,
          top: layer.y,
          fontSize: layer.fontSize,
          fontFamily: layer.fontFamily,
          color: layer.color,
          textAlign: layer.align,
          fontStyle: layer.fontStyle || 'normal',
          transform: 'translate(-50%, -50%)',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.2',
          maxWidth: '80%'
        }}
      >
        {value}
      </div>
    );
  };

  const renderCanvas = () => {
    if (templateId !== 'goan-romance') {
      return (
        <div className="text-center p-8">
          <p className="text-lg text-gray-600">Template not found or not supported</p>
          <Button onClick={() => window.location.href = '/'} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      );
    }

    return (
      <div
        ref={canvasRef}
        className="relative bg-white shadow-2xl mx-auto border border-gray-200"
        style={{
          width: goanRomanceTemplate.width,
          height: goanRomanceTemplate.height,
          backgroundImage: `url(${goanRomanceTemplate.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        {goanRomanceTemplate.layers.map(layer => renderTextLayer(layer))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation editor...</p>
        </div>
      </div>
    );
  }

  if (templateId !== 'goan-romance') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Template not found</p>
          <Button onClick={() => window.location.href = '/'} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{goanRomanceTemplate.name}</h1>
              <p className="text-muted-foreground">Live invitation editor with text overlay</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Live Editor</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Live Preview</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(1)}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-8">
                <div className="overflow-auto max-h-[600px]">
                  {renderCanvas()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editing Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Edit Text</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Edit the text content for your invitation
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {goanRomanceTemplate.layers.map((layer) => {
                  const value = templateData[layer.key] || '';
                  const InputComponent = layer.key === 'coupleNames' || layer.key === 'eventDetails' ? Textarea : Input;

                  return (
                    <div key={layer.key} className="space-y-2">
                      <Label htmlFor={layer.key} className="text-sm font-medium">
                        {layer.key.charAt(0).toUpperCase() + layer.key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Label>
                      <InputComponent
                        id={layer.key}
                        value={value}
                        onChange={(e) => handleFieldChange(layer.key, e.target.value)}
                        placeholder={`Enter ${layer.key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                        className="w-full"
                        rows={layer.key === 'coupleNames' || layer.key === 'eventDetails' ? 3 : undefined}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleSaveDraft} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={handleDownloadPNG}>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    PNG
                  </Button>
                  <Button variant="outline" onClick={handleDownloadPDF}>
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}