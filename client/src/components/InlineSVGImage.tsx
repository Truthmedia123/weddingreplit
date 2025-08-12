import React from 'react';

interface InlineSVGImageProps {
  type: 'photography' | 'catering' | 'flowers' | 'blog' | 'default';
  className?: string;
  alt: string;
}

const svgImages = {
  photography: `
    <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="photoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#photoGrad)"/>
      <circle cx="400" cy="250" r="80" fill="white" opacity="0.2"/>
      <rect x="320" y="200" width="160" height="100" rx="10" fill="white" opacity="0.3"/>
      <circle cx="400" cy="250" r="30" fill="white" opacity="0.5"/>
      <text x="400" y="400" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">📸 Photography</text>
    </svg>
  `,
  catering: `
    <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cateringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#cateringGrad)"/>
      <circle cx="350" cy="250" r="40" fill="white" opacity="0.3"/>
      <circle cx="450" cy="250" r="40" fill="white" opacity="0.3"/>
      <text x="400" y="400" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">🍽️ Catering</text>
    </svg>
  `,
  flowers: `
    <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#flowerGrad)"/>
      <circle cx="350" cy="200" r="25" fill="white" opacity="0.4"/>
      <circle cx="450" cy="220" r="30" fill="white" opacity="0.3"/>
      <circle cx="400" cy="280" r="35" fill="white" opacity="0.5"/>
      <text x="400" y="400" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">🌸 Flowers</text>
    </svg>
  `,
  blog: `
    <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="blogGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fa709a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fee140;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="400" fill="url(#blogGrad)"/>
      <circle cx="200" cy="150" r="60" fill="white" opacity="0.2"/>
      <text x="400" y="220" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="28" font-weight="bold">🏖️ Blog</text>
    </svg>
  `,
  default: `
    <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#defaultGrad)"/>
      <text x="400" y="320" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold">🖼️</text>
    </svg>
  `
};

export const InlineSVGImage: React.FC<InlineSVGImageProps> = ({
  type,
  className = "",
  alt
}) => {
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: svgImages[type] }}
      role="img"
      aria-label={alt}
    />
  );
};

export default InlineSVGImage;