import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import StepIndicator from './StepIndicator';
import CoupleDetailsStep from './CoupleDetailsStep';
import CeremonyDetailsStep from './CeremonyDetailsStep';
import ReceptionDetailsStep from './ReceptionDetailsStep';
import ContactDetailsStep from './ContactDetailsStep';
import type { InvitationFormData, CulturalTheme, InvitationTemplate } from '@shared/invitation-types';
import { invitationFormDataSchema } from '@shared/invitation-validation';

interface FormWizardProps {
  selectedTemplate: InvitationTemplate;
  culturalThemes: CulturalTheme[];
  onComplete: (data: InvitationFormData) => void;
  onBack: () => void;
}

const steps = [
  {
    id: 1,
    title: 'Couple Details',
    description: 'Names and family'
  },
  {
    id: 2,
    title: 'Ceremony',
    description: 'Wedding details'
  },
  {
    id: 3,
    title: 'Reception',
    description: 'Celebration info'
  },
  {
    id: 4,
    title: 'Contact',
    description: 'RSVP and contact'
  }
];

export default function FormWizard({ selectedTemplate, culturalThemes, onComplete, onBack }: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
        culturalTradition: selectedTemplate.culturalTheme,
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
        colorScheme: selectedTemplate.colorSchemes[0],
        typography: selectedTemplate.typography,
        qrCodes: [],
        customElements: []
      }
    },
    mode: 'onChange'
  });

  const { watch, getValues } = methods;

  // Auto-save functionality
  useEffect(() => {
    const subscription = watch(() => {
      const formData = getValues();
      localStorage.setItem('invitation-form-data', JSON.stringify(formData));
      setLastSaved(new Date());
    });

    // Auto-save every 30 seconds
    const autoSaveInterval = setInterval(() => {
      const formData = getValues();
      localStorage.setItem('invitation-form-data', JSON.stringify(formData));
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
      // Final step - complete the form
      const formData = getValues();
      onComplete(formData);
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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CoupleDetailsStep
            culturalThemes={culturalThemes}
            onNext={handleNext}
            onBack={currentStep === 1 ? onBack : handleBack}
          />
        );
      case 2:
        return (
          <CeremonyDetailsStep
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ReceptionDetailsStep
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <ContactDetailsStep
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create Your Wedding Invitation
            </h1>
            <p className="text-gray-600">
              Using template: <span className="font-semibold text-blue-600">{selectedTemplate.name}</span>
            </p>
            {lastSaved && (
              <p className="text-sm text-green-600 mt-2">
                ✓ Auto-saved at {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Step Indicator */}
          <StepIndicator
            currentStep={currentStep}
            steps={steps}
            onStepClick={handleStepClick}
          />

          {/* Current Step Content */}
          <div className="mt-8">
            {renderCurrentStep()}
          </div>

          {/* Template Preview (Small) */}
          <div className="fixed bottom-4 right-4 hidden lg:block">
            <div className="bg-white rounded-lg shadow-lg p-3 border">
              <p className="text-xs text-gray-600 mb-2">Selected Template</p>
              <img
                src={selectedTemplate.thumbnailUrl || selectedTemplate.previewUrl}
                alt={selectedTemplate.name}
                className="w-16 h-20 object-cover rounded border"
              />
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}