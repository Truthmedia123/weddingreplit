import React from 'react';
import { TemplateConfig, TextLayer } from '../types';

interface InviteCanvasProps {
  template: TemplateConfig;
  data: Record<string, string>;
  previewWidth: number;
}

export const InviteCanvas: React.FC<InviteCanvasProps> = ({ template, data, previewWidth }) => {
  const scale = previewWidth / template.width;

  return (
    <div className="flex justify-center">
      <div
        className="relative bg-white shadow-lg border border-gray-200"
        style={{
          width: template.width,
          height: template.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left'
        }}
      >
        {/* Background Image */}
        <img
          src={template.background}
          alt={template.name}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            objectFit: 'cover'
          }}
        />

        {/* Text Layers */}
        {template.layers.map((layer: TextLayer) => {
          const value = data[layer.key] || layer.defaultText || '';
          
          return (
            <div
              key={layer.key}
              className="absolute select-none"
              style={{
                left: layer.x,
                top: layer.y,
                fontSize: layer.fontSize,
                fontFamily: layer.fontFamily,
                color: layer.color,
                textAlign: layer.align || 'center',
                fontStyle: layer.fontStyle || 'normal',
                lineHeight: layer.lineHeight || 1.2,
                maxWidth: layer.maxWidth,
                transform: 'translate(-50%, -50%)',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
              }}
            >
              {value}
            </div>
          );
        })}
      </div>
    </div>
  );
};
