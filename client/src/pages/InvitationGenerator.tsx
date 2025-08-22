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
import { invitationTemplates, TemplateConfig } from '../../../content-templates';

interface TemplateData {
  [key: string]: string;
}

interface PageData {
  id: string;
  templateData: TemplateData;
}

export default function InvitationGenerator() {
  // Get templateId from URL path
  const path = window.location.pathname;
  const templateId = path.split('/generate-invitation/')[1];
  const navigate = (path: string) => window.location.href = path;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState<TemplateConfig | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize template and pages
  useEffect(() => {
    console.log('InvitationGenerator mounted, templateId:', templateId);
    console.log('Available templates:', invitationTemplates.map(t => t.id));
    
    if (!templateId) {
      console.log('No templateId found, navigating to home');
      navigate('/');
      return;
    }

    const foundTemplate = invitationTemplates.find(t => t.id === templateId);
    console.log('Found template:', foundTemplate);
    
    if (!foundTemplate) {
      console.log('Template not found, navigating to home');
      navigate('/');
      return;
    }

    setTemplate(foundTemplate);
    
    // Initialize template data for all layers
    const initialTemplateData: TemplateData = {};
    foundTemplate.schema.fields.forEach(field => {
      initialTemplateData[field.id] = field.placeholder || '';
    });

    // Load saved draft or create new page
    const savedDraft = localStorage.getItem(`invitation-draft-${templateId}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setPages(parsed.pages || [{ id: 'page-1', templateData: parsed.templateData || initialTemplateData }]);
      } catch (error) {
        console.error('Error loading saved draft:', error);
        setPages([{ id: 'page-1', templateData: initialTemplateData }]);
      }
    } else {
      setPages([{ id: 'page-1', templateData: initialTemplateData }]);
    }

    setIsLoading(false);
  }, [templateId, navigate]);

  const currentPage = pages[currentPageIndex];
  const currentTemplateData = currentPage?.templateData || {};

  const handleFieldChange = (fieldId: string, value: string) => {
    if (!currentPage) return;

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      templateData: {
        ...currentPage.templateData,
        [fieldId]: value
      }
    };
    setPages(updatedPages);
  };

  const handleSaveDraft = () => {
    if (!templateId) return;

    const draftData = {
      templateId,
      pages,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(`invitation-draft-${templateId}`, JSON.stringify(draftData));
    alert('Draft saved successfully!');
  };

  const handleDownloadPNG = async () => {
    if (!canvasRef.current) return;

    try {
      // Use html2canvas if available, otherwise fallback to basic canvas
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${template?.name || 'invitation'}.png`;
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

      pdf.save(`${template?.name || 'invitation'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const addPage = () => {
    if (!template) return;

    const newPageData: TemplateData = {};
    template.schema.fields.forEach(field => {
      newPageData[field.id] = field.placeholder || '';
    });

    const newPage: PageData = {
      id: `page-${pages.length + 1}`,
      templateData: newPageData
    };

    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const removePage = (pageIndex: number) => {
    if (pages.length <= 1) return;

    const updatedPages = pages.filter((_, index) => index !== pageIndex);
    setPages(updatedPages);
    
    if (currentPageIndex >= updatedPages.length) {
      setCurrentPageIndex(updatedPages.length - 1);
    }
  };

  const renderTextLayer = (key: string, element: any) => {
    const value = currentTemplateData[key] || '';
    
    return (
      <div
        key={key}
        className="absolute select-none"
        style={{
          left: `${element.x}%`,
          top: `${element.y}%`,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          color: element.color || '#8B4513',
          textAlign: element.textAlign as 'left' | 'center' | 'right',
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
    if (!template || !currentPage) return null;

    const elements = template.schema.elements;
    const isPortrait = template.schema.layout === 'portrait';
    
    return (
      <div
        ref={canvasRef}
        className="relative bg-white shadow-2xl mx-auto border border-gray-200"
        style={{
          width: isPortrait ? 400 : 600,
          height: isPortrait ? 600 : 400,
          backgroundImage: `url(${template.preview})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        {Object.entries(elements).map(([key, element]: [string, any]) => 
          renderTextLayer(key, element)
        )}
        
        {/* Add "&" symbol between bride and groom names if they exist */}
        {currentTemplateData.brideName && currentTemplateData.groomName && (
          <div
            className="absolute select-none"
            style={{
              left: '50%',
              top: '48.5%',
              fontSize: 20,
              fontFamily: 'Dancing Script',
              color: '#8B4513',
              textAlign: 'center' as const,
              transform: 'translate(-50%, -50%)'
            }}
          >
            &
          </div>
        )}
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

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Template not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
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
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{template.name}</h1>
              <p className="text-muted-foreground">{template.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{template.style}</Badge>
          </div>
        </div>

        {/* Page Tabs */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
            {pages.map((page, index) => (
              <div key={page.id} className="flex items-center gap-1">
                <Button
                  variant={currentPageIndex === index ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPageIndex(index)}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Page {index + 1}
                </Button>
                {pages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePage(index)}
                    className="p-1 h-6 w-6"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addPage}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Page
            </Button>
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
                  Click on any field to edit the text content
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.schema.fields.map((field) => {
                  const value = currentTemplateData[field.id] || '';
                  const InputComponent = field.type === 'textarea' ? Textarea : Input;

                  return (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="text-sm font-medium">
                        {field.name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <InputComponent
                        id={field.id}
                        value={value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full"
                        rows={field.type === 'textarea' ? 3 : undefined}
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