import React from 'react';

interface PlaceholderImageProps {
  width?: number;
  height?: number;
  text?: string;
  className?: string;
  alt: string;
  gradient?: string;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  width = 800,
  height = 600,
  text = "Wedding Image",
  className = "",
  alt,
  gradient = "from-teal-400 via-blue-500 to-purple-600"
}) => {
  return (
    <div 
      className={`bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold ${className}`}
      style={{ width: width, height: height, minHeight: height }}
      role="img"
      aria-label={alt}
    >
      <div className="text-center p-4">
        <div className="text-2xl mb-2">🏖️</div>
        <div className="text-sm opacity-90">{text}</div>
      </div>
    </div>
  );
};

export default PlaceholderImage;