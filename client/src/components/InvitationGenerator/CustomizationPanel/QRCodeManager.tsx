import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { QRCodeManagerProps } from './types';

const QR_POSITIONS = [
  {
    id: 'bottom-center',
    name: 'Bottom Center',
    description: 'Centered at the bottom of the invitation',
    icon: '⬇️'
  },
  {
    id: 'bottom-corner',
    name: 'Bottom Corner',
    description: 'Positioned in the bottom right corner',
    icon: '↘️'
  },
  {
    id: 'custom',
    name: 'Custom Position',
    description: 'Manually positioned on the invitation',
    icon: '🎯'
  }
];

const QR_SIZES = [
  {
    id: 'small',
    name: 'Small',
    description: 'Discrete and unobtrusive',
    size: '60px'
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'Standard size for easy scanning',
    size: '80px'
  },
  {
    id: 'large',
    name: 'Large',
    description: 'Prominent and easy to scan',
    size: '100px'
  }
];

const QRCodeManager: React.FC<QRCodeManagerProps> = ({
  qrCodeEnabled,
  qrCodePosition,
  qrCodeSize,
  onQRCodeChange,
  disabled = false
}) => {
  const handleToggle = (enabled: boolean) => {
    onQRCodeChange({ enabled });
  };

  const handlePositionChange = (position: 'bottom-center' | 'bottom-corner' | 'custom') => {
    onQRCodeChange({ enabled: qrCodeEnabled, position });
  };

  const handleSizeChange = (size: 'small' | 'medium' | 'large') => {
    onQRCodeChange({ enabled: qrCodeEnabled, size });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          QR Code Settings
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configure QR code for RSVP and sharing
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable QR Code */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Enable QR Code</h4>
            <p className="text-sm text-gray-600">
              Add a QR code for easy RSVP and sharing
            </p>
          </div>
          <Switch
            checked={qrCodeEnabled}
            onCheckedChange={handleToggle}
            disabled={disabled}
          />
        </div>

        {qrCodeEnabled && (
          <>
            {/* QR Code Position */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">QR Code Position</Label>
              <div className="grid grid-cols-1 gap-3">
                {QR_POSITIONS.map((position) => (
                  <div
                    key={position.id}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      qrCodePosition === position.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !disabled && handlePositionChange(position.id as any)}
                  >
                    <div className="text-2xl">{position.icon}</div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{position.name}</h5>
                      <p className="text-sm text-gray-600">{position.description}</p>
                    </div>
                    {qrCodePosition === position.id && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Selected
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code Size */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">QR Code Size</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {QR_SIZES.map((size) => (
                  <div
                    key={size.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center ${
                      qrCodeSize === size.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !disabled && handleSizeChange(size.id as any)}
                  >
                    <div className="mb-2">
                      <div
                        className="mx-auto border-2 border-gray-300 bg-gray-100"
                        style={{
                          width: size.size,
                          height: size.size
                        }}
                      />
                    </div>
                    <h5 className="font-medium text-gray-900">{size.name}</h5>
                    <p className="text-xs text-gray-600">{size.description}</p>
                    {qrCodeSize === size.id && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 mt-2">
                        Selected
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code Preview */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">QR Code Preview</h4>
              <div className="flex items-center gap-4">
                <div
                  className="border-2 border-gray-300 bg-white p-2"
                  style={{
                    width: qrCodeSize === 'small' ? '60px' : qrCodeSize === 'medium' ? '80px' : '100px',
                    height: qrCodeSize === 'small' ? '60px' : qrCodeSize === 'medium' ? '80px' : '100px'
                  }}
                >
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">QR</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    <strong>Size:</strong> {QR_SIZES.find(s => s.id === qrCodeSize)?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Position:</strong> {QR_POSITIONS.find(p => p.id === qrCodePosition)?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This QR code will link to your RSVP page
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            📱 QR Code Benefits
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Guests can easily RSVP by scanning the code</li>
            <li>• Share your wedding details instantly</li>
            <li>• Works with any smartphone camera</li>
            <li>• Reduces manual typing and errors</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeManager;