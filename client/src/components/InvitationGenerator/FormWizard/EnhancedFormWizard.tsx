import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Download,
  Share2
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import StepIndicator from './StepIndicator';
import CoupleDetailsStep from './CoupleDetailsStep';
import CeremonyDetailsStep from './CeremonyDetailsStep';
import ReceptionDetailsStep from './ReceptionDetailsStep';
import ContactDetailsStep from './ContactDetailsStep';
import LivePreview from '../PreviewPanel/LivePreview';
import { useToast } from '@/hooks/use-toast';

export interface FormData {
  // Couple Details
  groomName: string;
  groomFatherName: string;
  groomMotherName: string;
  brideName: string;
  brideFatherName: string;
  brideMotherName: string;
  
  // Ceremony Details
  ceremonyVenue: string;
  ceremonyDay: string;
  ceremonyDate: string;
  ceremonyTime: string;
  bibleVerse?: string;
  bibleReference?: string;
  
  // Reception Details
  receptionVenue: string;
  receptionDate: string;
  receptionTime: string;
  
  // Contact Details
  address1: string;
  location1: string;
  contact1: string;
  address2?: string;
  location2?: string;
  contact2?: string;
  
  // Customization
  selectedFont: string;
  selectedColorScheme: string;
  qrCodeEnabled: boolean;
  qrCodePosition: 'bottom-center' | 'bottom-corner' | 'custom';
  qrCodeSize: 'small' | 'medium' | 'large';
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<{
    data: FormData;
    onChange: (data: Partial<FormData>) => void;
    errors: Record<string, string>;
  }>;
  validation: (data: FormData) => Record<string, string>;
}

interface EnhancedFormWizardProps {
  templateId: string;
  onComplete: (data: FormData) => void;
  onPreview: (data: FormData) => void;
}

const STEPS: FormStep[] = [
  {
    id: 'couple-details',
    title: 'Couple Details',
    description: 'Enter the names of the couple and their parents',
    component: CoupleDetailsStep,
    validation: (data) => {
      const errors: Record<string, string> = {};
      if (!data.groomName.trim()) errors.groomName = 'Groom name is required';
      if (!data.brideName.trim()) errors.brideName = 'Bride name is required';
      if (!data.groomFatherName.trim()) errors.groomFatherName = 'Groom father name is required';
      if (!data.brideFatherName.trim()) errors.brideFatherName = 'Bride father name is required';
      return errors;
    }
  },
  {
    id: 'ceremony-details',
    title: 'Ceremony Details',
    description: 'Enter the ceremony venue, date, and time',
    component: CeremonyDetailsStep,
    validation: (data) => {
      const errors: Record<string, string> = {};
      if (!data.ceremonyVenue.trim()) errors.ceremonyVenue = 'Ceremony venue is required';
      if (!data.ceremonyDate.trim()) errors.ceremonyDate = 'Ceremony date is required';
      if (!data.ceremonyTime.trim()) errors.ceremonyTime = 'Ceremony time is required';
      return errors;
    }
  },
  {
    id: 'reception-details',
    title: 'Reception Details',
    description: 'Enter the reception venue, date, and time',
    component: ReceptionDetailsStep,
    validation: (data) => {
      const errors: Record<string, string> = {};
      if (!data.receptionVenue.trim()) errors.receptionVenue = 'Reception venue is required';
      if (!data.receptionDate.trim()) errors.receptionDate = 'Reception date is required';
      if (!data.receptionTime.trim()) errors.receptionTime = 'Reception time is required';
      return errors;
    }
  },
  {
    id: 'contact-details',
    title: 'Contact Details',
    description: 'Enter contact information for RSVP',
    component: ContactDetailsStep,
    validation: (data) => {
      const errors: Record<string, string> = {};
      if (!data.address1.trim()) errors.address1 = 'Primary address is required';
      if (!data.contact1.trim()) errors.contact1 = 'Primary contact is required';
      return errors;
    }
  }
];

const EnhancedFormWizard: React.FC<EnhancedFormWizardProps> = ({
  templateId,
  onComplete,
  onPreview
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    groomName: '',
    groomFatherName: '',
    groomMotherName: '',
    brideName: '',
    brideFatherName: '',
    brideMotherName: '',
    ceremonyVenue: '',
    ceremonyDay: '',
    ceremonyDate: '',
    ceremonyTime: '',
    receptionVenue: '',
    receptionDate: '',
    receptionTime: '',
    address1: '',
    location1: '',
    contact1: '',
    selectedFont: 'elegant-script',
    selectedColorScheme: 'classic-gold',
    qrCodeEnabled: true,
    qrCodePosition: 'bottom-center',
    qrCodeSize: 'medium'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-save functionality
  const autoSave = useCallback(() => {
    try {
      localStorage.setItem('invitation-form-data', JSON.stringify({
        data: formData,
        templateId,
        timestamp: new Date().toISOString()
      }));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [formData, templateId]);

  // Load saved data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('invitation-form-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.templateId === templateId) {
          setFormData(parsed.data);
          toast({
            title: "Form data restored",
            description: "Your previous progress has been loaded.",
          });
        }
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
  }, [templateId, toast]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    const currentStepData = STEPS[currentStep];
    const stepErrors = currentStepData.validation(formData);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [currentStep, formData]);

  // Handle form data changes
  const handleDataChange = useCallback((newData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
    // Clear errors for changed fields
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newData).forEach(key => {
        delete newErrors[key];
      });
      return newErrors;
    });
  }, []);

  // Navigation functions
  const goToNextStep = useCallback(() => {
    if (validateCurrentStep()) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
        setErrors({});
      } else {
        onComplete(formData);
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before proceeding.",
        variant: "destructive",
      });
    }
  }, [currentStep, validateCurrentStep, onComplete, formData, toast]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  }, [currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    // Allow going to any completed step or the next step
    if (stepIndex <= currentStep || stepIndex === currentStep + 1) {
      setCurrentStep(stepIndex);
      setErrors({});
    }
  }, [currentStep]);

  // Progress calculation
  const progress = useMemo(() => {
    return ((currentStep + 1) / STEPS.length) * 100;
  }, [currentStep]);

  // Check if all steps are completed
  const isAllStepsValid = useMemo(() => {
    return STEPS.every(step => {
      const stepErrors = step.validation(formData);
      return Object.keys(stepErrors).length === 0;
    });
  }, [formData]);

  const currentStepData = STEPS[currentStep];
  const CurrentStepComponent = currentStepData.component;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Section */}
      <div className="space-y-6">
        {/* Progress Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-lg">Step {currentStep + 1} of {STEPS.length}</CardTitle>
                <p className="text-sm text-gray-600">{currentStepData.title}</p>
              </div>
              <div className="flex items-center gap-2">
                {lastSaved && (
                  <Badge variant="outline" className="text-xs">
                    <Save className="h-3 w-3 mr-1" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isPreviewVisible ? 'Hide' : 'Show'} Preview
                </Button>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
        </Card>

        {/* Step Indicator */}
        <StepIndicator
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={goToStep}
          isAllStepsValid={isAllStepsValid}
        />

        {/* Current Step Form */}
        <Card>
          <CardHeader>
            <CardTitle>{currentStepData.title}</CardTitle>
            <p className="text-sm text-gray-600">{currentStepData.description}</p>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent
              data={formData}
              onChange={handleDataChange}
              errors={errors}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep === STEPS.length - 1 ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => onPreview(formData)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={goToNextStep}
                  disabled={!isAllStepsValid}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Invitation
                </Button>
              </>
            ) : (
              <Button onClick={goToNextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <h4 className="font-medium text-red-800">Please fix the following errors:</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>• {error}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview Section */}
      {isPreviewVisible && (
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LivePreview
                templateId={templateId}
                formData={formData}
                isPreview={true}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedFormWizard;
