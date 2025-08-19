import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { InvitationFormData } from '@shared/invitation-types';

interface CeremonyDetailsStepProps {
  data: InvitationFormData;
  onChange: (data: Partial<InvitationFormData>) => void;
  errors: Record<string, string>;
}

const CeremonyDetailsStep: React.FC<CeremonyDetailsStepProps> = ({
  data,
  onChange,
  errors
}) => {
  const handleInputChange = (field: keyof InvitationFormData['ceremonyDetails'], value: string) => {
    onChange({ 
      ceremonyDetails: { 
        ...data.ceremonyDetails, 
        [field]: value 
      } 
    });
  };

  // Get day of week from date
  const getDayOfWeek = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Update day when date changes
  const handleDateChange = (date: string) => {
    handleInputChange('date', date);
    const day = getDayOfWeek(date);
    // Note: We don't store the day separately in the new structure
  };

  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Ceremony Details
        </CardTitle>
        <p className="text-sm text-gray-600">
          Enter the ceremony venue, date, and time information.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Venue Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Venue Information
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ceremonyVenue" className="text-sm font-medium">
                Ceremony Venue *
              </Label>
              <Input
                id="ceremonyVenue"
                type="text"
                value={data.ceremonyDetails.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                placeholder="e.g., St. Francis Xavier Church, Old Goa"
                className={errors.ceremonyVenue ? 'border-red-500' : ''}
                aria-describedby={errors.ceremonyVenue ? 'ceremonyVenue-error' : undefined}
              />
              {errors.ceremonyVenue && (
                <p id="ceremonyVenue-error" className="text-sm text-red-600">
                  {errors.ceremonyVenue}
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
              <Label htmlFor="ceremonyDate" className="text-sm font-medium">
                Ceremony Date *
              </Label>
              <Input
                id="ceremonyDate"
                type="date"
                value={data.ceremonyDetails.date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={errors.ceremonyDate ? 'border-red-500' : ''}
                aria-describedby={errors.ceremonyDate ? 'ceremonyDate-error' : undefined}
              />
              {errors.ceremonyDate && (
                <p id="ceremonyDate-error" className="text-sm text-red-600">
                  {errors.ceremonyDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ceremonyTime" className="text-sm font-medium">
                Ceremony Time *
              </Label>
              <Input
                id="ceremonyTime"
                type="time"
                value={data.ceremonyDetails.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={errors.ceremonyTime ? 'border-red-500' : ''}
                aria-describedby={errors.ceremonyTime ? 'ceremonyTime-error' : undefined}
              />
              {errors.ceremonyTime && (
                <p id="ceremonyTime-error" className="text-sm text-red-600">
                  {errors.ceremonyTime}
                </p>
              )}
            </div>
          </div>

          {/* Day of Week Display */}
          {data.ceremonyDetails.date && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Day:</span> {getDayOfWeek(data.ceremonyDetails.date)}
              </p>
            </div>
          )}
        </div>

        {/* Special Instructions */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Special Instructions (Optional)
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="specialInstructions" className="text-sm font-medium">
              Additional Information
            </Label>
            <Textarea
              id="specialInstructions"
              value={data.ceremonyDetails.specialInstructions || ''}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              placeholder="e.g., Bible verse, dress code, special instructions..."
              rows={3}
            />
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            💡 Tips for Ceremony Details
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Include the full venue name and location</li>
            <li>• Use 24-hour format for time (e.g., 14:00 for 2:00 PM)</li>
            <li>• Bible verses are optional for Christian ceremonies</li>
            <li>• The day of the week will be automatically calculated</li>
          </ul>
        </div>
      </CardContent>
    </div>
  );
};

export default CeremonyDetailsStep;