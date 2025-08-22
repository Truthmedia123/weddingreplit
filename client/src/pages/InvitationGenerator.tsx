import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  FileText,
  Image as ImageIcon,
  Share,
  Edit,
  Move,
  RotateCcw,
  ChevronRight
} from 'lucide-react';
import { goanRomanceTemplate } from '../../../content-templates/index';

interface TextLayer {
  key: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: string;
  fontStyle?: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize template data with sample content
  useEffect(() => {
    if (templateId === 'goan-romance') {
      const initialData: TemplateData = {
        headerQuote: 'Two hearts become one',
        verse: 'Ecclesiastes 4:12',
        parentsLeft: 'Mr. Antonio Fernandes.\n& Mrs. Conceico Maria Feira.',
        parentsRight: 'Mr. Francisco Almeida Santos\n& Mrs. Rosario Isabel Rodrigues',
        inviteText: 'Request the honour of your presence',
        coupleNames: 'Gabriella\n&\nArmando',
        eventDetails: 'an Saturday, the 25th of October 2025\nat Se Cathedral, Old Goa\nat 4:00 pm',
        reception: 'followed at Reception at Casa Portuguesco,',
        addressLeft: 'H. No. 245, Fontainhas\nPanaio Goa\n9834367500',
        addressRight: 'H. No.10610, Primeiro\nSanta Cruz - Gom\n9824463734',
        blessing: 'Your Blessing is the only Precious Gift our heart desires'
      };

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

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!');
    }).catch(() => {
      alert('Share link: ' + shareUrl);
    });
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
          textAlign: layer.align as 'left' | 'center' | 'right',
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
          backgroundPosition: 'center'
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-600">
            Home {'>'} Invitation Cards {'>'} Wedding Cards {'>'} {goanRomanceTemplate.name}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Navigation */}
        <div className="flex justify-center mb-6">
          <Button variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
            Page 1
          </Button>
        </div>

        {/* Canvas Area - Centered */}
        <div className="flex justify-center mb-8">
          <div className="overflow-auto max-h-[600px]">
            {renderCanvas()}
          </div>
        </div>

        {/* Bottom Toolbar */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Button 
                variant={isEditing ? "default" : "outline"} 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              
              <Button variant="outline" size="sm">
                <Move className="w-4 h-4 mr-2" />
                Size
              </Button>
              
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Undo
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
                <ImageIcon className="w-4 h-4 mr-2" />
                PNG
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}