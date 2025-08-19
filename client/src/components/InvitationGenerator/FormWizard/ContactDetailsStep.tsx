import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { InvitationFormData } from '@shared/invitation-types';

interface ContactDetailsStepProps {
  data: InvitationFormData;
  onChange: (data: Partial<InvitationFormData>) => void;
  errors: Record<string, string>;
}

const ContactDetailsStep: React.FC<ContactDetailsStepProps> = ({
  data,
  onChange,
  errors
}) => {
  const handleInputChange = (field: keyof InvitationFormData['contactInfo']['primaryContact'], value: string) => {
    onChange({ 
      contactInfo: { 
        ...data.contactInfo,
        primaryContact: { 
          ...data.contactInfo.primaryContact, 
          [field]: value 
        } 
      } 
    });
  };

  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Contact Details
        </CardTitle>
        <p className="text-sm text-gray-600">
          Enter contact information for RSVP and guest inquiries.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Primary Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Primary Contact
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact1" className="text-sm font-medium">
                Primary Contact *
              </Label>
              <Input
                id="contact1"
                type="text"
                value={data.contact1}
                onChange={(e) => handleInputChange('contact1', e.target.value)}
                placeholder="e.g., +91 98765 43210"
                className={errors.contact1 ? 'border-red-500' : ''}
                aria-describedby={errors.contact1 ? 'contact1-error' : undefined}
              />
              {errors.contact1 && (
                <p id="contact1-error" className="text-sm text-red-600">
                  {errors.contact1}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location1" className="text-sm font-medium">
                Location *
              </Label>
              <Input
                id="location1"
                type="text"
                value={data.location1}
                onChange={(e) => handleInputChange('location1', e.target.value)}
                placeholder="e.g., Panaji, Goa"
                className={errors.location1 ? 'border-red-500' : ''}
                aria-describedby={errors.location1 ? 'location1-error' : undefined}
              />
              {errors.location1 && (
                <p id="location1-error" className="text-sm text-red-600">
                  {errors.location1}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address1" className="text-sm font-medium">
              Primary Address *
            </Label>
            <Textarea
              id="address1"
              value={data.address1}
              onChange={(e) => handleInputChange('address1', e.target.value)}
              placeholder="Enter the primary address for RSVP"
              rows={3}
              className={errors.address1 ? 'border-red-500' : ''}
              aria-describedby={errors.address1 ? 'address1-error' : undefined}
            />
            {errors.address1 && (
              <p id="address1-error" className="text-sm text-red-600">
                {errors.address1}
              </p>
            )}
          </div>
        </div>

        {/* Secondary Contact (Optional) */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Secondary Contact (Optional)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact2" className="text-sm font-medium">
                Secondary Contact
              </Label>
              <Input
                id="contact2"
                type="text"
                value={data.contact2 || ''}
                onChange={(e) => handleInputChange('contact2', e.target.value)}
                placeholder="e.g., +91 98765 43211"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location2" className="text-sm font-medium">
                Secondary Location
              </Label>
              <Input
                id="location2"
                type="text"
                value={data.location2 || ''}
                onChange={(e) => handleInputChange('location2', e.target.value)}
                placeholder="e.g., Margao, Goa"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address2" className="text-sm font-medium">
              Secondary Address
            </Label>
            <Textarea
              id="address2"
              value={data.address2 || ''}
              onChange={(e) => handleInputChange('address2', e.target.value)}
              placeholder="Enter the secondary address (optional)"
              rows={3}
            />
          </div>
        </div>

        {/* RSVP Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            RSVP Information
          </h3>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">
              📞 RSVP Instructions
            </h4>
            <p className="text-sm text-yellow-800">
              Guests will be able to RSVP by calling the primary contact number or 
              scanning the QR code on the invitation. Make sure the contact information 
              is accurate and someone will be available to take calls.
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            💡 Tips for Contact Details
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Include country code for phone numbers (e.g., +91 for India)</li>
            <li>• Provide a complete address for RSVP purposes</li>
            <li>• Secondary contact is optional but helpful for busy periods</li>
            <li>• Ensure someone will be available to take RSVP calls</li>
          </ul>
        </div>
      </CardContent>
    </div>
  );
};

export default ContactDetailsStep;