export interface FontSelectorProps {
  selectedFont: string;
  onFontChange: (fontId: string) => void;
  disabled?: boolean;
}

export interface ColorPickerProps {
  selectedColorScheme: string;
  onColorChange: (colorSchemeId: string) => void;
  disabled?: boolean;
}

export interface QRCodeManagerProps {
  qrCodeEnabled: boolean;
  qrCodePosition: 'bottom-center' | 'bottom-corner' | 'custom';
  qrCodeSize: 'small' | 'medium' | 'large';
  onQRCodeChange: (settings: {
    enabled: boolean;
    position?: 'bottom-center' | 'bottom-corner' | 'custom';
    size?: 'small' | 'medium' | 'large';
  }) => void;
  disabled?: boolean;
}
