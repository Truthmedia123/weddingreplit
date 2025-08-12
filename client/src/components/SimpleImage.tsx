import React from 'react';

interface SimpleImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackGradient?: string;
  fallbackIcon?: string;
}

export const SimpleImage: React.FC<SimpleImageProps> = ({
  src,
  alt,
  className = "",
  fallbackGradient = "from-teal-400 via-blue-500 to-purple-600",
  fallbackIcon = "🖼️"
}) => {
  // If it's an SVG, just render it directly
  if (src.endsWith('.svg')) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={(e) => {
          // Replace with CSS gradient fallback
          const target = e.currentTarget;
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="${className} bg-gradient-to-br ${fallbackGradient} flex items-center justify-center text-white text-4xl">
                ${fallbackIcon}
              </div>
            `;
          }
        }}
      />
    );
  }

  // For other images, use the same approach
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        // Replace with CSS gradient fallback
        const target = e.currentTarget;
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `
            <div class="${className} bg-gradient-to-br ${fallbackGradient} flex items-center justify-center text-white text-4xl">
              ${fallbackIcon}
            </div>
          `;
        }
      }}
    />
  );
};

export default SimpleImage;