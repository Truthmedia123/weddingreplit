import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Eye, 
  Edit3, 
  Type,
  Palette,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { invitationTemplates, TemplateConfig } from '../../../content-templates';

// Default template data for Goan Romance
const defaultGoanRomanceData = {
  scriptureText: 'Two hearts become one',
  coupleNames: 'Gabriella & Armando',
  parentsMessage: 'Together with their families, we joyfully invite you',
  invitationWord: 'to celebrate',
  date: 'Saturday, 25th October 2025',
  venueLabel: 'at Se Cathedral, Old Goa',
  venueName: 'Taj Exotica Resort & Spa, Goa',
  time: '6:00 PM onwards',
  blessingMessage: 'Your Blessing is the only Precious Gift our heart desires',
  parentsNames: 'Mr. Antonio Fernandes & Mrs. Conceico Maria Feira\nMr. Francisco Almeida Santos & Mrs. Rosario Isabel Rodrigues'
};

interface LiveInvitationEditorProps {
  selectedTemplate: TemplateConfig;
  onBack: () => void;
  onComplete: (data: any) => void;
}

interface TemplateData {
  scriptureText: string;
  coupleNames: string;
  parentsMessage: string;
  invitationWord: string;
  date: string;
  venueLabel: string;
  venueName: string;
  time: string;
  blessingMessage: string;
  parentsNames: string;
}

export default function LiveInvitationEditor({ 
  selectedTemplate, 
  onBack, 
  onComplete 
}: LiveInvitationEditorProps) {
  const [templateData, setTemplateData] = useState<TemplateData>(defaultGoanRomanceData);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Reset template data when template changes
  useEffect(() => {
    if (selectedTemplate.id === 'goan-romance') {
      setTemplateData(defaultGoanRomanceData);
    }
  }, [selectedTemplate.id]);

  const handleFieldChange = (fieldId: keyof TemplateData, value: string) => {
    setTemplateData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSave = () => {
    setLastSaved(new Date());
    // Here you would typically save to backend
    console.log('Saving template data:', templateData);
  };

  const handleComplete = () => {
    onComplete(templateData);
  };

  const renderTextField = (fieldId: keyof TemplateData, field: any) => {
    const value = templateData[fieldId];
    const element = selectedTemplate.schema.elements[fieldId];
    
    if (!element) return null;

    const InputComponent = field.type === 'textarea' ? Textarea : Input;

    return (
      <div key={fieldId} className="space-y-2">
        <Label htmlFor={fieldId} className="text-sm font-medium flex items-center gap-2">
          <Type className="w-4 h-4" />
          {field.name}
          {field.required && <span className="text-red-500">*</span>}
        </Label>
        <InputComponent
          id={fieldId}
          value={value}
          onChange={(e) => handleFieldChange(fieldId, e.target.value)}
          placeholder={field.placeholder}
          className="w-full"
          rows={field.type === 'textarea' ? 3 : undefined}
        />
        {field.validation && (
          <div className="text-xs text-muted-foreground">
            {field.validation.map((rule: any, index: number) => (
              <div key={index} className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {rule.message}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPreview = () => {
    // Only render Goan Romance template layers
    if (selectedTemplate.id !== 'goan-romance') {
      return <div>Template not supported</div>;
    }

    const elements = selectedTemplate.schema.elements;
    
    return (
      <div
        ref={canvasRef}
        className="relative bg-white shadow-2xl mx-auto"
        style={{
          width: 400,
          height: 600,
          backgroundImage: `url(${selectedTemplate.preview})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid #e5e7eb'
        }}
      >
        {Object.entries(elements).map(([key, element]: [string, any]) => {
          const value = templateData[key as keyof TemplateData];
          if (!value || !element) return null;

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
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
            <Button
              variant={viewMode === 'edit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('edit')}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview Canvas */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                {renderPreview()}
              </CardContent>
            </Card>
          </div>

          {/* Editing Panel */}
          {viewMode === 'edit' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Edit Text Elements
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Update the text content for your invitation. Changes appear in real-time.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedTemplate.id === 'goan-romance' && 
                    selectedTemplate.schema.fields.map((field: any) => 
                      renderTextField(field.id as keyof TemplateData, field)
                    )
                  }
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button onClick={handleSave} variant="outline">
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                      </Button>
                      {lastSaved && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4" />
                          Last saved: {lastSaved.toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button onClick={handleComplete}>
                        Complete Design
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}