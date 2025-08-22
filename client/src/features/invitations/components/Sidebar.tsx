import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TextLayer } from '../types';

interface SidebarProps {
  layers: TextLayer[];
  data: Record<string, string>;
  onDataChange: (key: string, value: string) => void;
  isVisible: boolean;
}

const getPrettyLabel = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

export const Sidebar: React.FC<SidebarProps> = ({ layers, data, onDataChange, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Edit Text</h3>
      <div className="space-y-4">
        {layers.map((layer) => {
          const value = data[layer.key] || layer.defaultText || '';
          const isLongText = layer.key === 'coupleNames' || layer.key === 'eventDetails' || layer.key === 'addressLeft' || layer.key === 'addressRight';
          const InputComponent = isLongText ? Textarea : Input;

          return (
            <div key={layer.key} className="space-y-2">
              <Label htmlFor={layer.key} className="text-sm font-medium">
                {getPrettyLabel(layer.key)}
              </Label>
              <InputComponent
                id={layer.key}
                value={value}
                onChange={(e) => onDataChange(layer.key, e.target.value)}
                placeholder={`Enter ${getPrettyLabel(layer.key).toLowerCase()}`}
                className="w-full"
                rows={isLongText ? 3 : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
