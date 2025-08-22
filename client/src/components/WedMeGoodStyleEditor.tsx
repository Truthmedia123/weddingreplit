import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  Download, 
  Share2, 
  Undo2, 
  Maximize2,
  X,
  Type,
  Eye,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { invitationTemplates, TemplateConfig } from '../../../content-templates';

interface WedMeGoodStyleEditorProps {
  selectedTemplate: TemplateConfig;
  onBack: () => void;
  onComplete: (data: any) => void;
}

interface TemplateData {
  [key: string]: string;
}

interface EditingState {
  isEditing: boolean;
  activeField: string | null;
  history: TemplateData[];
  historyIndex: number;
}

export default function WedMeGoodStyleEditor({ 
  selectedTemplate, 
  onBack, 
  onComplete 
}: WedMeGoodStyleEditorProps) {
  const [templateData, setTemplateData] = useState<TemplateData>({});
  const [editingState, setEditingState] = useState<EditingState>({
    isEditing: false,
    activeField: null,
    history: [],
    historyIndex: -1
  });
  const [templateSize, setTemplateSize] = useState<'portrait' | 'landscape'>('portrait');
  const [currentPage, setCurrentPage] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize template data with default values
  useEffect(() => {
    const defaultData: TemplateData = {};
    selectedTemplate.schema.fields.forEach(field => {
      defaultData[field.id] = field.placeholder || '';
    });
    setTemplateData(defaultData);
    setEditingState(prev => ({
      ...prev,
      history: [defaultData],
      historyIndex: 0
    }));
  }, [selectedTemplate]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingState.isEditing && editingState.activeField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingState.isEditing, editingState.activeField]);

  const handleFieldChange = (fieldId: string, value: string) => {
    const newData = { ...templateData, [fieldId]: value };
    setTemplateData(newData);
    
    // Add to history
    const newHistory = editingState.history.slice(0, editingState.historyIndex + 1);
    newHistory.push(newData);
    setEditingState(prev => ({
      ...prev,
      history: newHistory,
      historyIndex: newHistory.length - 1
    }));
  };

  const handleUndo = () => {
    if (editingState.historyIndex > 0) {
      const newIndex = editingState.historyIndex - 1;
      setTemplateData(editingState.history[newIndex]);
      setEditingState(prev => ({
        ...prev,
        historyIndex: newIndex
      }));
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem(`invitation-draft-${selectedTemplate.id}`, JSON.stringify({
      templateData,
      timestamp: new Date().toISOString()
    }));
    // Show success feedback
    alert('Draft saved successfully!');
  };

  const handleDownloadPNG = () => {
    if (canvasRef.current) {
      // Use html2canvas or similar to capture the canvas as PNG
      console.log('Downloading PNG...');
      // Implementation would go here
    }
  };

  const handleDownloadPDF = () => {
    console.log('Downloading PDF...');
    // Implementation would go here
  };

  const handleShareLink = () => {
    const shareData = {
      templateId: selectedTemplate.id,
      templateData,
      timestamp: new Date().toISOString()
    };
    const shareUrl = `${window.location.origin}/share/${btoa(JSON.stringify(shareData))}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  const startEditing = (fieldId: string) => {
    setEditingState(prev => ({
      ...prev,
      isEditing: true,
      activeField: fieldId
    }));
  };

  const stopEditing = () => {
    setEditingState(prev => ({
      ...prev,
      isEditing: false,
      activeField: null
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      stopEditing();
    }
  };

  const renderTextElement = (key: string, element: any) => {
    const value = templateData[key] || '';
    const isActive = editingState.isEditing && editingState.activeField === key;

    // Special handling for bride and groom names with "&" symbol
    let displayValue = value || element.placeholder || 'Click to edit';
    
    // Add "&" symbol between bride and groom names
    if (key === 'brideName' && value) {
      displayValue = value;
    } else if (key === 'groomName' && value) {
      displayValue = value;
    }

    return (
      <div
        key={key}
        className={`absolute select-none cursor-pointer transition-all duration-200 ${
          isActive ? 'ring-2 ring-blue-500 ring-opacity-50' : 'hover:ring-1 hover:ring-gray-300'
        }`}
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
          maxWidth: '80%',
          minWidth: '20px',
          padding: '2px 4px',
          borderRadius: '2px'
        }}
        onClick={() => startEditing(key)}
      >
        {isActive ? (
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={stopEditing}
            className="bg-white border-blue-500 text-sm"
            style={{
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              color: element.color || '#8B4513',
              textAlign: element.textAlign as 'left' | 'center' | 'right',
              minWidth: '100px'
            }}
          />
        ) : (
          <span>{displayValue}</span>
        )}
      </div>
    );
  };

  const renderTemplatePreview = () => {
    const elements = selectedTemplate.schema.elements;
    const isPortrait = templateSize === 'portrait';
    
    return (
      <div
        ref={canvasRef}
        className="relative bg-white shadow-2xl mx-auto border border-gray-200"
        style={{
          width: isPortrait ? 400 : 600,
          height: isPortrait ? 600 : 400,
          backgroundImage: `url(${selectedTemplate.preview})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {Object.entries(elements).map(([key, element]: [string, any]) => 
          renderTextElement(key, element)
        )}
        
        {/* Add "&" symbol between bride and groom names */}
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
      </div>
    );
  };

  const canUndo = editingState.historyIndex > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedTemplate.name}</h1>
              <p className="text-muted-foreground">{selectedTemplate.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedTemplate.style}</Badge>
          </div>
        </div>

        {/* Page Tabs */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
            <Button
              variant={currentPage === 0 ? "default" : "ghost"}
              size="sm"
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Page 1
            </Button>
            {/* Add more pages here if needed */}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {renderTemplatePreview()}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-2">
            <Button
              variant={editingState.isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setEditingState(prev => ({ ...prev, isEditing: !prev.isEditing }))}
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTemplateSize(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
              className="flex items-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              Size
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
              className="flex items-center gap-2"
            >
              <Undo2 className="w-4 h-4" />
              Undo
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadPNG}
              className="flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              Download PNG
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download PDF
            </Button>
            
            <Button
              variant="outline"
              onClick={handleShareLink}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </Button>
          </div>
          
          <Button
            onClick={() => onComplete(templateData)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
          >
            Publish Invitation
          </Button>
        </div>

        {/* Instructions */}
        {editingState.isEditing && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Click on any text element to edit. Press Enter to save or Escape to cancel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
