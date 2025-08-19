import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { InvitationFormData } from '@shared/invitation-types';

interface ReceptionDetailsStepProps {
  data: InvitationFormData;
  onChange: (data: Partial<InvitationFormData>) => void;
  errors: Record<string, string>;
}

const ReceptionDetailsStep: React.FC<ReceptionDetailsStepProps> = ({
  data,
  onChange,
  errors
}) => {
  const handleInputChange = (field: keyof InvitationFormData['receptionDetails'], value: string) => {
    onChange({ 
      receptionDetails: { 
        ...data.receptionDetails, 
        [field]: value 
      } 
    });
  };

  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Reception Details
        </CardTitle>
        <p className="text-sm text-gray-600">
          Enter the reception venue, date, and time information.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Venue Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Reception Venue
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receptionVenue" className="text-sm font-medium">
                Reception Venue *
              </Label>
              <Input
                id="receptionVenue"
                type="text"
                value={data.receptionDetails.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                placeholder="e.g., Taj Exotica Resort & Spa, Benaulim"
                className={errors.receptionVenue ? 'border-red-500' : ''}
                aria-describedby={errors.receptionVenue ? 'receptionVenue-error' : undefined}
              />
              {errors.receptionVenue && (
                <p id="receptionVenue-error" className="text-sm text-red-600">
                  {errors.receptionVenue}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Date & Time
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receptionDate" className="text-sm font-medium">
                Reception Date *
              </Label>
              <Input
                id="receptionDate"
                type="date"
                value={data.receptionDetails.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={errors.receptionDate ? 'border-red-500' : ''}
                aria-describedby={errors.receptionDate ? 'receptionDate-error' : undefined}
              />
              {errors.receptionDate && (
                <p id="receptionDate-error" className="text-sm text-red-600">
                  {errors.receptionDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receptionTime" className="text-sm font-medium">
                Reception Time *
              </Label>
              <Input
                id="receptionTime"
                type="time"
                value={data.receptionDetails.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={errors.receptionTime ? 'border-red-500' : ''}
                aria-describedby={errors.receptionTime ? 'receptionTime-error' : undefined}
              />
              {errors.receptionTime && (
                <p id="receptionTime-error" className="text-sm text-red-600">
                  {errors.receptionTime}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Additional Information (Optional)
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dressCode" className="text-sm font-medium">
                Dress Code
              </Label>
              <Input
                id="dressCode"
                type="text"
                placeholder="e.g., Formal, Traditional Indian, Beach Casual"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions" className="text-sm font-medium">
                Special Instructions
              </Label>
              <Textarea
                id="specialInstructions"
                placeholder="Any special instructions for guests, parking information, or additional notes..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            💡 Tips for Reception Details
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Include the full venue name and location</li>
            <li>• Reception can be on the same day or different day from ceremony</li>
            <li>• Use 24-hour format for time (e.g., 19:00 for 7:00 PM)</li>
            <li>• Dress code helps guests prepare appropriately</li>
          </ul>
        </div>
      </CardContent>
    </div>
  );
};

export default ReceptionDetailsStep;