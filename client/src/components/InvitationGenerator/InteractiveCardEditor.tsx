import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Download, 
  Eye, 
  Edit3, 
  Move, 
  Type, 
  Palette,
  Plus,
  Trash2,
  Copy,
  Share2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Settings
} from 'lucide-react';
import type { EnhancedTemplate } from './TemplateGallery/TemplateManager';
import type { InvitationFormData } from '@shared/invitation-types';

interface CardElement {
  id: string;
  type: 'text' | 'image' | 'decoration' | 'qr-code';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  rotation: number;
  opacity: number;
  zIndex: number;
  isEditable: boolean;
  isSelected: boolean;
}

interface InvitationPage {
  id: string;
  title: string;
  type: 'main' | 'rsvp' | 'reception' | 'mehendi' | 'sangeet' | 'haldi';
  background: string;
  elements: CardElement[];
  sampleData: {
    coupleNames: string;
    date: string;
    venue: string;
    time: string;
    parents: string;
    specialMessage: string;
  };
}

interface InteractiveCardEditorProps {
  selectedTemplate: EnhancedTemplate;
  onBack: () => void;
  onComplete: (data: InvitationFormData) => void;
}

export default function InteractiveCardEditor({ 
  selectedTemplate, 
  onBack, 
  onComplete 
}: InteractiveCardEditorProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [zoom, setZoom] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Initialize invitation pages with sample data
  const [invitationPages, setInvitationPages] = useState<InvitationPage[]>([
    {
      id: 'main-invitation',
      title: 'Main Invitation',
      type: 'main',
      background: selectedTemplate.previewUrl,
      sampleData: {
        coupleNames: 'Priya & Rahul',
        date: 'Saturday, 15th March 2025',
        venue: 'Taj Exotica Resort & Spa, Goa',
        time: '6:00 PM onwards',
        parents: 'Mr. & Mrs. Sharma\nMr. & Mrs. Patel',
        specialMessage: 'Together with their families, we joyfully invite you to celebrate our special day.'
      },
      elements: [
        {
          id: 'couple-names',
          type: 'text',
          content: 'Priya & Rahul',
          x: 50,
          y: 30,
          width: 80,
          height: 15,
          fontSize: 32,
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
          color: '#8B4513',
          textAlign: 'center',
          rotation: 0,
          opacity: 1,
          zIndex: 10,
          isEditable: true,
          isSelected: false
        },
        {
          id: 'special-message',
          type: 'text',
          content: 'Together with their families, we joyfully invite you to celebrate our special day.',
          x: 50,
          y: 45,
          width: 70,
          height: 10,
          fontSize: 16,
          fontFamily: 'Lato',
          fontWeight: 'normal',
          color: '#666666',
          textAlign: 'center',
          rotation: 0,
          opacity: 1,
          zIndex: 9,
          isEditable: true,
          isSelected: false
        },
        {
          id: 'date',
          type: 'text',
          content: 'Saturday, 15th March 2025',
          x: 50,
          y: 60,
          width: 60,
          height: 8,
          fontSize: 18,
          fontFamily: 'Lato',
          fontWeight: 'semibold',
          color: '#8B4513',
          textAlign: 'center',
          rotation: 0,
          opacity: 1,
          zIndex: 8,
          isEditable: true,
          isSelected: false
        },
        {
          id: 'venue',
          type: 'text',
          content: 'Taj Exotica Resort & Spa, Goa',
          x: 50,
          y: 70,
          width: 65,
          height: 8,
          fontSize: 16,
          fontFamily: 'Lato',
          fontWeight: 'normal',
          color: '#666666',
          textAlign: 'center',
          rotation: 0,
          opacity: 1,
          zIndex: 7,
          isEditable: true,
          isSelected: false
        },
        {
          id: 'time',
          type: 'text',
          content: '6:00 PM onwards',
          x: 50,
          y: 80,
          width: 50,
          height: 6,
          fontSize: 14,
          fontFamily: 'Lato',
          fontWeight: 'normal',
          color: '#666666',
          textAlign: 'center',
          rotation: 0,
          opacity: 1,
          zIndex: 6,
          isEditable: true,
          isSelected: false
        },
        {
          id: 'parents',
          type: 'text',
          content: 'Mr. & Mrs. Sharma\nMr. & Mrs. Patel',
          x: 50,
          y: 90,
          width: 60,
          height: 8,
          fontSize: 14,
          fontFamily: 'Lato',
          fontWeight: 'normal',
          color: '#8B4513',
          textAlign: 'center',
          rotation: 0,
          opacity: 1,
          zIndex: 5,
          isEditable: true,
          isSelected: false
        }
      ]
    },
    {
      id: 'rsvp-card',
      title: 'RSVP Card',
      type: 'rsvp',
      background: selectedTemplate.previewUrl,
      sampleData: {
        coupleNames: 'Priya & Rahul',
        date: 'Please RSVP by 1st March 2025',
        venue: 'Contact: +91 98765 43210',
        time: 'Email: rsvp@priyarahul.com',
        parents: '',
        specialMessage: 'Kindly confirm your attendance'
      },
      elements: [
        {
          id: 'rsvp-title',
          type: 'text',
          content: 'RSVP',
          x: 50,
          y: 25,
          width: 30,
          height: 10,
          fontSize: 24,
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
          color: '#8B4513',
          textAlign: 'center',
          rotation: 0,
          opacity: 1,
          zIndex: 10,
          isEditable: true,
          isSelected: false
        },
        {
          id: 'rsvp-message',
          type: 'text',
          content: 'Kindly confirm your attendance',
          x: 50,
          y: 40,
          width: 70,
          height: 8,
          fontSize: 16,
          fontFamily: 'Lato',
          fontWeight: 'normal',
          color: '#666666',
          textAlign: 'center',
          rotation: 0,
          opacity: 1,
          zIndex: 9,
          isEditable: true,
          isSelected: false
        },
        {
          id: 'rsvp-deadline',
          type: 'text',
          content: 'Please RSVP by 1st March 2025',
          x: 50,
          y: 55,
          width: 65,
          height: 8,
          fontSize: 14,
          fontFamily: 'Lato',
          fontWeight: 'semibold',
          color: '#8B4513',
          textAlign: 'center',
          rotation: 0,
          opacity: 1,
          zIndex: 8,
          isEditable: true,
          isSelected: false
        },
        {
          id: 'contact-info',
          type: 'text',
          content: 'Contact: +91 98765 43210\nEmail: rsvp@priyarahul.com',
          x: 50,
          y: 70,
          width: 60,
          height: 12,
          fontSize: 14,
          fontFamily: 'Lato',
          fontWeight: 'normal',
          color: '#666666',
          textAlign: 'center',
          rotation: 0,
          opacity: 1,
          zIndex: 7,
          isEditable: true,
          isSelected: false
        }
      ]
    }
  ]);

  const currentPage = invitationPages[currentPageIndex];

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('invitation-suite-draft', JSON.stringify(invitationPages));
      setLastSaved(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [invitationPages]);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('invitation-suite-draft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setInvitationPages(parsedDraft);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to load saved draft:', error);
      }
    }
  }, []);

  const handleElementClick = (elementId: string) => {
    if (viewMode === 'edit') {
      setSelectedElementId(elementId);
      setIsEditing(true);
    }
  };

  const handleElementUpdate = (elementId: string, updates: Partial<CardElement>) => {
    setInvitationPages(prev => prev.map(page => ({
      ...page,
      elements: page.elements.map(element => 
        element.id === elementId 
          ? { ...element, ...updates, isSelected: false }
          : { ...element, isSelected: false }
      )
    })));
    setIsEditing(false);
    setSelectedElementId(null);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (viewMode !== 'edit') return;
    
    e.preventDefault();
    setIsDragging(true);
    setSelectedElementId(elementId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const element = currentPage.elements.find(el => el.id === elementId);
      if (element) {
        setDragOffset({
          x: e.clientX - rect.left - (element.x * 400 / 100),
          y: e.clientY - rect.top - (element.y * 600 / 100)
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElementId) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left - dragOffset.x) / 400) * 100;
      const y = ((e.clientY - rect.top - dragOffset.y) / 600) * 100;
      
      handleElementUpdate(selectedElementId, {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const selectedElement = currentPage.elements.find(el => el.id === selectedElementId);

  const handleSaveDraft = () => {
    localStorage.setItem('invitation-suite-draft', JSON.stringify(invitationPages));
    setLastSaved(new Date());
  };

  const handleDownload = async () => {
    try {
      // Show loading state
      const downloadButton = document.querySelector('[data-download-button]') as HTMLButtonElement;
      if (downloadButton) {
        downloadButton.disabled = true;
        downloadButton.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Generating...';
      }

      // Get current page data
      const currentPage = invitationPages[currentPageIndex];
      
      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size (A4 ratio)
      canvas.width = 600;
      canvas.height = 800;

      // Load background image
      const backgroundImg = new Image();
      backgroundImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        backgroundImg.onload = resolve;
        backgroundImg.onerror = reject;
        backgroundImg.src = currentPage.background;
      });

      // Draw background
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

      // Draw text elements
      currentPage.elements.forEach(element => {
        if (element.type === 'text') {
          ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
          ctx.fillStyle = element.color;
          ctx.textAlign = element.textAlign;
          ctx.globalAlpha = element.opacity;
          
          // Calculate position
          const x = (element.x / 100) * canvas.width;
          const y = (element.y / 100) * canvas.height;
          
          ctx.fillText(element.content, x, y);
        }
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${selectedTemplate.name}-${currentPage.title}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');

      // Reset button state
      if (downloadButton) {
        downloadButton.disabled = false;
        downloadButton.innerHTML = '<Download className="w-4 h-4" /> Download';
      }

    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
      
      // Reset button state
      const downloadButton = document.querySelector('[data-download-button]') as HTMLButtonElement;
      if (downloadButton) {
        downloadButton.disabled = false;
        downloadButton.innerHTML = '<Download className="w-4 h-4" /> Download';
      }
    }
  };

  const handlePublish = () => {
    // TODO: Implement publishing functionality
    alert('Publishing functionality coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Templates
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Interactive Card Editor
                </h1>
                <p className="text-sm text-gray-600">
                  Template: <span className="font-semibold text-blue-600">{selectedTemplate.name}</span>
                  {lastSaved && (
                    <span className="ml-4 text-green-600">
                      ✓ Saved at {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                className="flex items-center gap-2"
              >
                {viewMode === 'edit' ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {viewMode === 'edit' ? 'Preview' : 'Edit'}
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2"
                data-download-button
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Page Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
              disabled={currentPageIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex gap-1">
              {invitationPages.map((page, index) => (
                <Button
                  key={page.id}
                  variant={currentPageIndex === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPageIndex(index)}
                  className="min-w-[100px]"
                >
                  {page.title}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPageIndex(Math.min(invitationPages.length - 1, currentPageIndex + 1))}
              disabled={currentPageIndex === invitationPages.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            >
              -
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            >
              +
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Card Canvas */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{currentPage.title}</h2>
                <Badge variant="secondary">{currentPage.type.toUpperCase()}</Badge>
              </div>
              
              <div className="flex justify-center">
                <div
                  ref={canvasRef}
                  className="relative bg-white shadow-2xl cursor-crosshair"
                  style={{
                    width: 400 * zoom,
                    height: 600 * zoom,
                    backgroundImage: `url(${currentPage.background})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid #e5e7eb'
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {currentPage.elements.map((element) => (
                    <div
                      key={element.id}
                      className={`absolute cursor-move select-none ${
                        element.isSelected || selectedElementId === element.id
                          ? 'ring-2 ring-blue-500 ring-opacity-50' 
                          : ''
                      }`}
                      style={{
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        width: `${element.width}%`,
                        height: `${element.height}%`,
                        fontSize: element.fontSize * zoom,
                        fontFamily: element.fontFamily,
                        color: element.color,
                        fontWeight: element.fontWeight,
                        textAlign: element.textAlign,
                        transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
                        transformOrigin: 'center',
                        opacity: element.opacity,
                        zIndex: element.zIndex,
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.2'
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element.id)}
                      onClick={() => handleElementClick(element.id)}
                    >
                      {element.content}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Editing Panel */}
          <div className="space-y-4">
            {viewMode === 'edit' && selectedElement && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Edit Element
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Content</label>
                      <Textarea
                        value={selectedElement.content}
                        onChange={(e) => handleElementUpdate(selectedElement.id, { content: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium">Font Size</label>
                        <Input
                          type="number"
                          value={selectedElement.fontSize}
                          onChange={(e) => handleElementUpdate(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Color</label>
                        <Input
                          type="color"
                          value={selectedElement.color}
                          onChange={(e) => handleElementUpdate(selectedElement.id, { color: e.target.value })}
                          className="mt-1 h-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Font Family</label>
                      <select
                        value={selectedElement.fontFamily}
                        onChange={(e) => handleElementUpdate(selectedElement.id, { fontFamily: e.target.value })}
                        className="w-full mt-1 p-2 border rounded"
                      >
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Lato">Lato</option>
                        <option value="Dancing Script">Dancing Script</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="serif">Serif</option>
                        <option value="sans-serif">Sans Serif</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Alignment</label>
                      <select
                        value={selectedElement.textAlign}
                        onChange={(e) => handleElementUpdate(selectedElement.id, { textAlign: e.target.value as any })}
                        className="w-full mt-1 p-2 border rounded"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Opacity</label>
                      <Input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedElement.opacity}
                        onChange={(e) => handleElementUpdate(selectedElement.id, { opacity: parseFloat(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {/* TODO: Add new page */}}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Page
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {/* TODO: Duplicate page */}}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate Page
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {/* TODO: Delete page */}}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Page
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Export Options</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {/* TODO: Share */}}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Page {currentPageIndex + 1} of {invitationPages.length}
            </span>
            <span className="text-sm text-gray-600">
              {currentPage.elements.length} elements
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handlePublish}>
              <Share2 className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
