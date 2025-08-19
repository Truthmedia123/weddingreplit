import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { FormStep } from './EnhancedFormWizard';

interface StepIndicatorProps {
  steps: FormStep[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
  isAllStepsValid: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  isAllStepsValid
}) => {
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepIcon = (stepIndex: number, status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'current':
        return <Circle className="h-5 w-5 text-blue-600 fill-current" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Form Progress</h3>
          <div className="flex items-center gap-2">
            {isAllStepsValid && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                All Steps Valid
              </Badge>
            )}
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isClickable = index <= currentStep || index === currentStep + 1;
            
            return (
              <div
                key={step.id}
                className={`relative ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
                onClick={() => isClickable && onStepClick(index)}
              >
                {/* Step Line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-6 left-6 w-full h-0.5 bg-gray-200 -z-10">
                    <div
                      className={`h-full transition-all duration-300 ${
                        index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      style={{ width: index < currentStep ? '100%' : '0%' }}
                    />
                  </div>
                )}

                {/* Step Circle */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                      status === 'completed'
                        ? 'bg-green-100 border-green-500'
                        : status === 'current'
                        ? 'bg-blue-100 border-blue-500'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    {getStepIcon(index, status)}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-sm font-medium transition-colors ${
                        status === 'completed'
                          ? 'text-green-700'
                          : status === 'current'
                          ? 'text-blue-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Step Number */}
                <div
                  className={`absolute -top-1 -right-1 w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center ${
                    status === 'completed'
                      ? 'bg-green-500 text-white'
                      : status === 'current'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation Tips */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">Navigation Tips:</p>
              <ul className="space-y-1">
                <li>• Click on any completed step to go back and edit</li>
                <li>• You can only proceed to the next step when current step is valid</li>
                <li>• Your progress is automatically saved as you type</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepIndicator;