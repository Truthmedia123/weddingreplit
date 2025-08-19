import React from 'react';

interface InvitationPreviewProps {
  template: {
    id: string;
    name: string;
    category: string;
    style: string;
    colors?: string[];
  };
  width?: number;
  height?: number;
}

const InvitationPreview: React.FC<InvitationPreviewProps> = ({ 
  template, 
  width = 300, 
  height = 400 
}) => {
  const getColorScheme = (colors: string[] | undefined) => {
    const colorMap: { [key: string]: string } = {
      'Coral': '#FF6B6B',
      'Turquoise': '#4ECDC4',
      'Gold': '#FFD700',
      'Royal Blue': '#4169E1',
      'White': '#FFFFFF',
      'Magenta': '#FF1493',
      'Emerald': '#50C878',
      'Sunshine Yellow': '#FFDB58',
      'Navy': '#000080',
      'Rose Gold': '#E8B4B8',
      'Cream': '#F5F5DC',
      'Deep Purple': '#483D8B',
      'Crimson': '#DC143C',
      'Sepia': '#704214',
      'Antique Gold': '#CD9575',
      'Dusty Rose': '#DCAE96',
      'Sage Green': '#9CAF88',
      'Sand': '#F4A460',
      'Blush Pink': '#FFC0CB',
      'Terracotta': '#E2725B',
      'Forest Green': '#228B22',
      'Black': '#000000',
      'Champagne': '#F7E7CE',
      'Navy Blue': '#000080',
      'Red': '#FF0000',
      'Orange': '#FFA500',
      'Pink': '#FFC0CB',
      'Purple': '#800080',
      'Ivory': '#FFFFF0',
      'Deep Blue': '#00008B',
      'Blush': '#FFC0CB'
    };
    
    // Default colors if colors array is undefined or empty
    const defaultColors = ['Gold', 'Royal Blue', 'White'];
    const safeColors = colors && colors.length > 0 ? colors : defaultColors;
    
    return safeColors.map(color => colorMap[color] || '#CCCCCC');
  };

  const [primary, secondary, accent] = getColorScheme(template.colors);

  const renderTemplate = () => {
    switch (template.id) {
      case 'goan-beach-bliss':
        return (
          <div className="w-full h-full relative overflow-hidden" style={{ 
            background: `linear-gradient(135deg, ${accent} 0%, ${primary} 50%, ${secondary} 100%)` 
          }}>
            {/* Beach Elements */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30" style={{ backgroundColor: secondary }}></div>
            <div className="absolute top-4 left-4 text-2xl">🌴</div>
            <div className="absolute top-4 right-4 text-2xl">🌴</div>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-xl">🌊</div>
            
            {/* Content */}
            <div className="flex flex-col items-center justify-center h-full p-6 text-center relative z-10">
              <div className="text-xs font-serif mb-2 text-white opacity-90">Beach Wedding Invitation</div>
              <div className="text-xl font-bold mb-2 text-white">Maria & João</div>
              <div className="text-xs mb-2 text-white opacity-80">invite you to celebrate their love</div>
              <div className="text-sm font-semibold mb-1 text-white">15th February 2025</div>
              <div className="text-xs text-white opacity-80">Sunset Beach, Goa</div>
            </div>
          </div>
        );

      case 'portuguese-heritage':
        return (
          <div className="w-full h-full relative" style={{ backgroundColor: accent }}>
            {/* Portuguese Tile Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-4 h-full">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="border" style={{ borderColor: secondary }}>
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: primary }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="text-xs font-serif mb-2" style={{ color: secondary }}>Convite de Casamento</div>
              <div className="text-lg font-bold mb-2" style={{ color: primary }}>António & Isabella</div>
              <div className="text-xs mb-2" style={{ color: secondary }}>request your presence</div>
              <div className="text-sm font-semibold mb-1" style={{ color: primary }}>20th March 2025</div>
              <div className="text-xs" style={{ color: secondary }}>Basilica of Bom Jesus, Old Goa</div>
            </div>
          </div>
        );

      case 'modern-geometric':
        return (
          <div className="w-full h-full relative" style={{ backgroundColor: accent }}>
            {/* Geometric Shapes */}
            <div className="absolute top-4 left-4 w-6 h-6 transform rotate-45" style={{ backgroundColor: primary }}></div>
            <div className="absolute top-4 right-4 w-4 h-8" style={{ backgroundColor: secondary }}></div>
            <div className="absolute bottom-4 left-4 w-8 h-4" style={{ backgroundColor: secondary }}></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full" style={{ backgroundColor: primary }}></div>
            
            {/* Content */}
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="text-xs font-sans mb-2 uppercase tracking-wide" style={{ color: secondary }}>Save The Date</div>
              <div className="text-xl font-light mb-2" style={{ color: primary }}>ALEX & SARAH</div>
              <div className="text-xs mb-2 uppercase" style={{ color: secondary }}>Are Getting Married</div>
              <div className="text-sm font-medium mb-1" style={{ color: primary }}>03.04.2025</div>
              <div className="text-xs uppercase" style={{ color: secondary }}>Beach Resort, Goa</div>
            </div>
          </div>
        );

      case 'vintage-classic':
        return (
          <div className="w-full h-full relative" style={{ backgroundColor: accent }}>
            {/* Vintage Border */}
            <div className="absolute inset-3 border-2 border-dashed" style={{ borderColor: secondary }}>
              <div className="absolute inset-2 border" style={{ borderColor: primary }}>
                {/* Ornate Corners */}
                <div className="absolute -top-1 -left-1 w-3 h-3" style={{ backgroundColor: secondary }}></div>
                <div className="absolute -top-1 -right-1 w-3 h-3" style={{ backgroundColor: secondary }}></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3" style={{ backgroundColor: secondary }}></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3" style={{ backgroundColor: secondary }}></div>
              </div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="text-xs font-serif mb-2" style={{ color: secondary }}>~ Wedding Invitation ~</div>
              <div className="text-lg font-serif font-bold mb-2" style={{ color: primary }}>William & Elizabeth</div>
              <div className="text-xs mb-2 italic" style={{ color: secondary }}>request your presence</div>
              <div className="text-sm font-serif mb-1" style={{ color: primary }}>December 20th, 2024</div>
              <div className="text-xs font-serif" style={{ color: secondary }}>Old Goa Church</div>
            </div>
          </div>
        );

      case 'watercolor-floral':
        return (
          <div className="w-full h-full relative" style={{ backgroundColor: accent }}>
            {/* Watercolor Effects */}
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full opacity-30" style={{ backgroundColor: primary }}></div>
            <div className="absolute top-8 right-4 w-12 h-12 rounded-full opacity-20" style={{ backgroundColor: secondary }}></div>
            <div className="absolute bottom-4 left-8 w-20 h-10 rounded-full opacity-25" style={{ backgroundColor: primary }}></div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="text-xs font-script mb-2" style={{ color: secondary }}>Together with their families</div>
              <div className="text-lg font-script font-bold mb-2" style={{ color: primary }}>Michael & Emma</div>
              <div className="text-xs mb-2 font-script" style={{ color: secondary }}>invite you to celebrate their wedding</div>
              <div className="text-sm font-script mb-1" style={{ color: primary }}>April 8th, 2025</div>
              <div className="text-xs font-script" style={{ color: secondary }}>Garden Resort, Goa</div>
            </div>
          </div>
        );

      case 'beach-tropical':
        return (
          <div className="w-full h-full relative" style={{ backgroundColor: accent }}>
            {/* Palm Leaves */}
            <div className="absolute top-2 left-2 w-8 h-12 rounded-full opacity-40" style={{ backgroundColor: secondary }}></div>
            <div className="absolute top-2 right-2 w-8 h-12 rounded-full opacity-40" style={{ backgroundColor: secondary }}></div>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-4 rounded-full opacity-30" style={{ backgroundColor: primary }}></div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="text-xs mb-2" style={{ color: secondary }}>🌴 Beach Wedding 🌴</div>
              <div className="text-lg font-bold mb-2" style={{ color: primary }}>David & Maria</div>
              <div className="text-xs mb-2" style={{ color: secondary }}>are tying the knot by the sea</div>
              <div className="text-sm font-semibold mb-1" style={{ color: primary }}>June 15th, 2025</div>
              <div className="text-xs" style={{ color: secondary }}>Sunset Beach, Goa</div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: primary }}>
            <div className="text-center p-4">
              <div className="text-lg font-bold mb-2" style={{ color: accent }}>Wedding Invitation</div>
              <div className="text-sm" style={{ color: secondary }}>{template.name}</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="border border-gray-200 rounded-lg shadow-lg overflow-hidden"
      style={{ width, height }}
    >
      {renderTemplate()}
    </div>
  );
};

export default InvitationPreview;