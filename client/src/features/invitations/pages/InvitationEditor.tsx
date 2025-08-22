import React, { useState, useEffect, useRef } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  FileText,
  Image as ImageIcon,
  Share,
  Edit,
  Move,
  RotateCcw,
  ChevronRight,
  Check
} from 'lucide-react';
import { InviteCanvas } from '../components/InviteCanvas';
import { Sidebar } from '../components/Sidebar';
import { getTemplateById } from '../templates';
import { TemplateConfig } from '../types';

interface HistoryEntry {
  data: Record<string, string>;
  timestamp: number;
}

export const InvitationEditor: React.FC = () => {
  const [, params] = useRoute('/invitation/:templateId');
  const templateId = params?.templateId;
  const navigate = (path: string) => window.location.href = path;
  const canvasRef = useRef<HTMLDivElement>(null);

  const [template, setTemplate] = useState<TemplateConfig | null>(null);
  const [data, setData] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const previewWidth = 420; // Desktop preview width like WedMeGood

  // Load template and initialize data
  useEffect(() => {
    if (!templateId) {
      navigate('/');
      return;
    }

    const foundTemplate = getTemplateById(templateId);
    if (!foundTemplate) {
      navigate('/');
      return;
    }

    setTemplate(foundTemplate);

    // Initialize data from defaultText
    const initialData: Record<string, string> = {};
    foundTemplate.layers.forEach(layer => {
      initialData[layer.key] = layer.defaultText || '';
    });

    // Load saved draft if available
    const savedDraft = localStorage.getItem(`invitation-draft-${templateId}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setData({ ...initialData, ...parsed.data });
        setLastSaved(new Date(parsed.timestamp));
      } catch (error) {
        console.error('Error loading saved draft:', error);
        setData(initialData);
      }
    } else {
      setData(initialData);
    }

    setIsLoading(false);
  }, [templateId, navigate]);

  // Add to history when data changes
  const addToHistory = (newData: Record<string, string>) => {
    const newEntry: HistoryEntry = {
      data: { ...newData },
      timestamp: Date.now()
    };

    // Remove any entries after current index
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newEntry);

    // Keep only last 20 entries
    if (updatedHistory.length > 20) {
      updatedHistory.shift();
    }

    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const handleDataChange = (key: string, value: string) => {
    const newData = { ...data, [key]: value };
    setData(newData);
    addToHistory(newData);
  };

  const handleSaveDraft = () => {
    if (!templateId) return;

    const draftData = {
      data,
      timestamp: Date.now()
    };

    localStorage.setItem(`invitation-draft-${templateId}`, JSON.stringify(draftData));
    setLastSaved(new Date());
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setData(history[newIndex].data);
    }
  };

  const handleDownloadPNG = async () => {
    if (!canvasRef.current || !template) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${template.name || 'invitation'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Error generating PNG. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!canvasRef.current || !template) return;

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

      pdf.save(`${template.name || 'invitation'}.pdf`);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{template.name}</h1>
              <p className="text-muted-foreground">Live invitation editor</p>
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
            Home {'>'} Invitation Cards {'>'} Wedding Cards {'>'} {template.name}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Preview Area */}
        <div className="flex-1 flex flex-col">
          {/* Page Navigation */}
          <div className="flex justify-center py-4">
            <Button variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
              Page 1
            </Button>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex justify-center items-center p-6">
            <div ref={canvasRef}>
              <InviteCanvas
                template={template}
                data={data}
                previewWidth={previewWidth}
              />
            </div>
          </div>

          {/* Bottom Toolbar */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant={isEditing ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                
                <Button variant="outline" size="sm" disabled>
                  <Move className="w-4 h-4 mr-2" />
                  Size
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Undo
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                  {lastSaved ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </>
                  )}
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

        {/* Sidebar */}
        <Sidebar
          layers={template.layers}
          data={data}
          onDataChange={handleDataChange}
          isVisible={isEditing}
        />
      </div>
    </div>
  );
};
