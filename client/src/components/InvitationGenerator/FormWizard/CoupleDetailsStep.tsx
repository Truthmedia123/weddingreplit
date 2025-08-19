import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { InvitationFormData } from '@shared/invitation-types';

interface CoupleDetailsStepProps {
  data: InvitationFormData;
  onChange: (data: Partial<InvitationFormData>) => void;
  errors: Record<string, string>;
}

const CoupleDetailsStep: React.FC<CoupleDetailsStepProps> = ({
  data,
  onChange,
  errors
}) => {
  const handleInputChange = (field: keyof InvitationFormData['coupleDetails'], value: string) => {
    onChange({ 
      coupleDetails: { 
        ...data.coupleDetails, 
        [field]: value 
      } 
    });
  };

  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Couple Details
        </CardTitle>
        <p className="text-sm text-gray-600">
          Enter the names of the couple and their parents for the wedding invitation.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Groom Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Groom Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="groomName" className="text-sm font-medium">
                Groom's Name *
              </Label>
              <Input
                id="groomName"
                type="text"
                value={data.coupleDetails.groomName}
                onChange={(e) => handleInputChange('groomName', e.target.value)}
                placeholder="Enter groom's full name"
                className={errors.groomName ? 'border-red-500' : ''}
                aria-describedby={errors.groomName ? 'groomName-error' : undefined}
              />
              {errors.groomName && (
                <p id="groomName-error" className="text-sm text-red-600">
                  {errors.groomName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="groomFatherName" className="text-sm font-medium">
                Father's Name *
              </Label>
              <Input
                id="groomFatherName"
                type="text"
                value={data.coupleDetails.groomFatherName}
                onChange={(e) => handleInputChange('groomFatherName', e.target.value)}
                placeholder="Enter father's name"
                className={errors.groomFatherName ? 'border-red-500' : ''}
                aria-describedby={errors.groomFatherName ? 'groomFatherName-error' : undefined}
              />
              {errors.groomFatherName && (
                <p id="groomFatherName-error" className="text-sm text-red-600">
                  {errors.groomFatherName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="groomMotherName" className="text-sm font-medium">
                Mother's Name
              </Label>
              <Input
                id="groomMotherName"
                type="text"
                value={data.coupleDetails.groomMotherName}
                onChange={(e) => handleInputChange('groomMotherName', e.target.value)}
                placeholder="Enter mother's name"
              />
            </div>
          </div>
        </div>

        {/* Bride Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Bride Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brideName" className="text-sm font-medium">
                Bride's Name *
              </Label>
              <Input
                id="brideName"
                type="text"
                value={data.coupleDetails.brideName}
                onChange={(e) => handleInputChange('brideName', e.target.value)}
                placeholder="Enter bride's full name"
                className={errors.brideName ? 'border-red-500' : ''}
                aria-describedby={errors.brideName ? 'brideName-error' : undefined}
              />
              {errors.brideName && (
                <p id="brideName-error" className="text-sm text-red-600">
                  {errors.brideName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brideFatherName" className="text-sm font-medium">
                Father's Name *
              </Label>
              <Input
                id="brideFatherName"
                type="text"
                value={data.coupleDetails.brideFatherName}
                onChange={(e) => handleInputChange('brideFatherName', e.target.value)}
                placeholder="Enter father's name"
                className={errors.brideFatherName ? 'border-red-500' : ''}
                aria-describedby={errors.brideFatherName ? 'brideFatherName-error' : undefined}
              />
              {errors.brideFatherName && (
                <p id="brideFatherName-error" className="text-sm text-red-600">
                  {errors.brideFatherName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brideMotherName" className="text-sm font-medium">
                Mother's Name
              </Label>
              <Input
                id="brideMotherName"
                type="text"
                value={data.coupleDetails.brideMotherName}
                onChange={(e) => handleInputChange('brideMotherName', e.target.value)}
                placeholder="Enter mother's name"
              />
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            💡 Tips for Couple Names
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use full names as they will appear on the invitation</li>
            <li>• Include titles if desired (Mr., Mrs., Dr., etc.)</li>
            <li>• Parent names help guests identify the families</li>
            <li>• Mother's names are optional but commonly included</li>
          </ul>
        </div>
      </CardContent>
    </div>
  );
};

export default CoupleDetailsStep;