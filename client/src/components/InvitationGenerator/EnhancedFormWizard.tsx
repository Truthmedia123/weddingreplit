import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

// Form Wizard Components
import StepIndicator from './FormWizard/StepIndicator';
import CoupleDetailsStep from './FormWizard/CoupleDetailsStep';
import CeremonyDetailsStep from './FormWizard/CeremonyDetailsStep';
import ReceptionDetailsStep from './FormWizard/ReceptionDetailsStep';
import ContactDetailsStep from './FormWizard/ContactDetailsStep';

// Preview Components
import LivePreview from './PreviewPanel/LivePreview';
import PreviewControls from './PreviewPanel/PreviewControls';
import DownloadOptions from './PreviewPanel/DownloadOptions';

// Customization Components
import FontSelector from './CustomizationPanel/FontSelector';
import ColorPicker from './CustomizationPanel/ColorPicker';
import QRCodeManager from './CustomizationPanel/QRCodeManager';

import type { InvitationFormData, CulturalTheme } from '@shared/invitation-types';
import type { EnhancedTemplate } from './TemplateGallery/TemplateManager';
import { invitationFormDataSchema } from '@shared/invitation-validation';

interface EnhancedFormWizardProps {
  selectedTemplate: EnhancedTemplate;
  culturalThemes: CulturalTheme[];
  onComplete: (data: InvitationFormData) => void;
  onBack: () => void;
}

const steps = [
  { id: 1, title: 'Couple Details', description: 'Names and family' },
  { id: 2, title: 'Ceremony', description: 'Wedding details' },
  { id: 3, title: 'Reception', description: 'Celebration info' },
  { id: 4, title: 'Contact', description: 'RSVP and contact' }
];

export default function EnhancedFormWizard({ selectedTemplate, culturalThemes, onComplete, onBack }: EnhancedFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [previewSize, setPreviewSize] = useState<'mobile' | 'desktop' | 'print'>('mobile');

  // Initialize form with default values
  const methods = useForm<InvitationFormData>({
    resolver: zodResolver(invitationFormDataSchema),
    defaultValues: {
      coupleDetails: {
        groomName: '',
        groomFatherName: '',
        groomMotherName: '',
        brideName: '',
        brideFatherName: '',
        brideMotherName: '',
        culturalTradition: selectedTemplate.category,
        languagePreferences: ['English']
      },
      ceremonyDetails: {
        type: 'religious',
        venue: '',
        address: '',
        date: '',
        time: '',
        duration: '',
        dresscode: '',
        specialInstructions: ''
      },
      receptionDetails: {
        venue: '',
        address: '',
        date: '',
        time: '',
        menuType: '',
        entertainmentDetails: ''
      },
      contactInfo: {
        primaryContact: {
          name: '',
          phone: '',
          email: '',
          relation: ''
        },
        rsvpDetails: {
          enabled: true,
          method: 'phone',
          url: '',
          instructions: ''
        },
        additionalInfo: ''
      },
      customization: {
        selectedTemplate: selectedTemplate.id,
        colorScheme: selectedTemplate.templateData.colorSchemes[0],
        typography: selectedTemplate.templateData.typography,
        qrCodes: [],
        customElements: []
      }
    },
    mode: 'onChange'
  });

  const { watch, getValues, setValue } = methods;
  const formData = watch();

  // Ensure formData has the correct structure
  const safeFormData: InvitationFormData = {
    coupleDetails: formData.coupleDetails || {
      groomName: '',
      groomFatherName: '',
      groomMotherName: '',
      brideName: '',
      brideFatherName: '',
      brideMotherName: '',
      culturalTradition: selectedTemplate.category,
      languagePreferences: ['English']
    },
    ceremonyDetails: formData.ceremonyDetails || {
      type: 'religious',
      venue: '',
      address: '',
      date: '',
      time: '',
      duration: '',
      dresscode: '',
      specialInstructions: ''
    },
    receptionDetails: formData.receptionDetails || {
      venue: '',
      address: '',
      date: '',
      time: '',
      menuType: '',
      entertainmentDetails: ''
    },
    contactInfo: formData.contactInfo || {
      primaryContact: {
        name: '',
        phone: '',
        email: '',
        relation: ''
      },
      rsvpDetails: {
        enabled: true,
        method: 'phone',
        url: '',
        instructions: ''
      },
      additionalInfo: ''
    },
    customization: formData.customization || {
      selectedTemplate: selectedTemplate.id,
      colorScheme: selectedTemplate.templateData.colorSchemes[0],
      typography: selectedTemplate.templateData.typography,
      qrCodes: [],
      customElements: []
    }
  };

  // Auto-save functionality
  useEffect(() => {
    const subscription = watch(() => {
      const currentData = getValues();
      localStorage.setItem('invitation-form-data', JSON.stringify(currentData));
      setLastSaved(new Date());
    });

    const autoSaveInterval = setInterval(() => {
      const currentData = getValues();
      localStorage.setItem('invitation-form-data', JSON.stringify(currentData));
      setLastSaved(new Date());
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(autoSaveInterval);
    };
  }, [watch, getValues]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('invitation-form-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        methods.reset(parsedData);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to load saved form data:', error);
      }
    }
  }, [methods]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      const finalData = getValues();
      onComplete(finalData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handleDownload = async (format: string, resolution: string) => {
    console.log('Downloading:', format, resolution);
    // TODO: Implement actual download functionality
    alert(`Downloading ${format} in ${resolution} format...`);
  };

  const handleShare = () => {
    console.log('Sharing invitation');
    // TODO: Implement share functionality
    alert('Share functionality coming soon!');
  };

  const updateCustomization = (updates: Partial<InvitationFormData['customization']>) => {
    setValue('customization', {
      ...formData.customization,
      ...updates
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CoupleDetailsStep
            data={safeFormData}
            onChange={(updates) => {
              Object.keys(updates).forEach(key => {
                setValue(key as keyof InvitationFormData, updates[key as keyof InvitationFormData]);
              });
            }}
            errors={{}}
          />
        );
      case 2:
        return (
          <CeremonyDetailsStep
            data={safeFormData}
            onChange={(updates) => {
              Object.keys(updates).forEach(key => {
                setValue(key as keyof InvitationFormData, updates[key as keyof InvitationFormData]);
              });
            }}
            errors={{}}
          />
        );
      case 3:
        return (
          <ReceptionDetailsStep
            data={safeFormData}
            onChange={(updates) => {
              Object.keys(updates).forEach(key => {
                setValue(key as keyof InvitationFormData, updates[key as keyof InvitationFormData]);
              });
            }}
            errors={{}}
          />
        );
      case 4:
        return (
          <ContactDetailsStep
            data={safeFormData}
            onChange={(updates) => {
              Object.keys(updates).forEach(key => {
                setValue(key as keyof InvitationFormData, updates[key as keyof InvitationFormData]);
              });
            }}
            errors={{}}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
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
                    Create Your Wedding Invitation
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
              
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="lg:hidden"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Step Indicator */}
          <StepIndicator
            currentStep={currentStep}
            steps={steps.map((step, index) => ({
              id: step.id,
              title: step.title,
              description: step.description
            }))}
            onStepClick={handleStepClick}
            isAllStepsValid={true}
          />

          <div className="grid lg:grid-cols-3 gap-6 mt-8">
                         {/* Form Content */}
             <div className="lg:col-span-2">
               <Card>
                 <CardContent className="p-6">
                   {renderCurrentStep()}
                   
                   {/* Navigation Buttons */}
                   <div className="flex justify-between mt-8 pt-6 border-t">
                     <Button
                       variant="outline"
                       onClick={currentStep === 1 ? onBack : handleBack}
                       className="flex items-center gap-2"
                     >
                       ← {currentStep === 1 ? 'Back to Templates' : 'Previous'}
                     </Button>
                     
                     <Button
                       onClick={handleNext}
                       className="flex items-center gap-2"
                     >
                       {currentStep === steps.length ? 'Complete' : 'Next'} →
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             </div>

            {/* Preview and Customization Panel */}
            <div className={`space-y-6 ${showPreview ? 'block' : 'hidden lg:block'}`}>
                             {/* Live Preview */}
               <LivePreview
                 templateId={selectedTemplate.id}
                 formData={safeFormData}
                 onDownload={() => handleDownload('whatsapp', 'PNG')}
               />

              {/* Preview Controls */}
              <PreviewControls
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                previewSize={previewSize}
                onPreviewSizeChange={setPreviewSize}
              />

              {/* Customization Options */}
              <div className="space-y-4">
                                 {/* Font Selector */}
                 <FontSelector
                   selectedFont={safeFormData.customization.typography?.fonts?.[0]?.family || 'serif'}
                   onFontChange={(fontId) => {
                     // Update typography with new font
                     const newTypography = {
                       ...safeFormData.customization.typography,
                       fonts: [{ name: fontId, family: fontId, weights: [400, 600, 700], category: 'serif' }]
                     };
                     updateCustomization({ typography: newTypography });
                   }}
                 />

                                 {/* Color Picker */}
                 <ColorPicker
                   selectedColorScheme={safeFormData.customization.colorScheme?.name || 'classic-gold'}
                   onColorChange={(colorSchemeId) => {
                     // Find the color scheme by ID
                     const scheme = selectedTemplate.templateData.colorSchemes.find(s => s.name === colorSchemeId) || 
                                   selectedTemplate.templateData.colorSchemes[0];
                     updateCustomization({ colorScheme: scheme });
                   }}
                 />

                                 {/* QR Code Manager */}
                 <QRCodeManager
                   qrCodeEnabled={safeFormData.customization.qrCodes.length > 0}
                   qrCodePosition={safeFormData.customization.qrCodes[0]?.position || 'bottom-center'}
                   qrCodeSize={safeFormData.customization.qrCodes[0]?.size || 'medium'}
                   onQRCodeChange={(settings) => {
                     const qrCodes = settings.enabled ? [{
                       id: 'main-qr',
                       position: settings.position || 'bottom-center',
                       size: settings.size || 'medium',
                       data: 'https://example.com/rsvp'
                     }] : [];
                     updateCustomization({ qrCodes });
                   }}
                 />

                                 {/* Download Options */}
                 <DownloadOptions
                   template={selectedTemplate}
                   formData={safeFormData}
                   onDownload={handleDownload}
                   onShare={handleShare}
                 />
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}