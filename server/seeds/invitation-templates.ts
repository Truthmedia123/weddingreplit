import { db } from '../db';
import { invitationTemplates } from '../../shared/schema';
import type { InsertInvitationTemplate } from '../../shared/schema';
import type { TemplateElement, ColorScheme, TypographyConfig, TemplateLayout } from '../../shared/invitation-types';

// Template Elements Configurations
const createBaseElements = (culturalTheme: string): TemplateElement[] => {
  const baseElements: TemplateElement[] = [
    {
      id: 'couple-names',
      type: 'text',
      position: { x: 50, y: 25 },
      size: { width: 80, height: 10 },
      properties: {
        text: '{groomName} & {brideName}',
        fontSize: 32,
        fontFamily: 'serif',
        fontWeight: 'bold',
        color: '#8B4513',
        textAlign: 'center'
      },
      editable: true,
      constraints: {
        minWidth: 60,
        maxWidth: 90,
        allowResize: true,
        allowMove: true
      }
    },
    {
      id: 'ceremony-date',
      type: 'text',
      position: { x: 50, y: 40 },
      size: { width: 60, height: 6 },
      properties: {
        text: '{ceremonyDate}',
        fontSize: 18,
        fontFamily: 'sans-serif',
        fontWeight: 'normal',
        color: '#666',
        textAlign: 'center'
      },
      editable: true
    },
    {
      id: 'ceremony-venue',
      type: 'text',
      position: { x: 50, y: 50 },
      size: { width: 70, height: 6 },
      properties: {
        text: '{ceremonyVenue}',
        fontSize: 16,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: '#8B4513',
        textAlign: 'center'
      },
      editable: true
    },
    {
      id: 'ceremony-time',
      type: 'text',
      position: { x: 50, y: 60 },
      size: { width: 50, height: 5 },
      properties: {
        text: '{ceremonyTime}',
        fontSize: 14,
        fontFamily: 'sans-serif',
        fontWeight: 'normal',
        color: '#666',
        textAlign: 'center'
      },
      editable: true
    }
  ];

  // Add cultural-specific elements
  if (culturalTheme === 'christian') {
    baseElements.push({
      id: 'bible-verse',
      type: 'text',
      position: { x: 50, y: 15 },
      size: { width: 70, height: 8 },
      properties: {
        text: '{bibleVerse}',
        fontSize: 12,
        fontFamily: 'serif',
        fontWeight: 'italic',
        color: '#8B4513',
        textAlign: 'center'
      },
      editable: true
    });
  }

  if (culturalTheme === 'hindu') {
    baseElements.push({
      id: 'sanskrit-blessing',
      type: 'text',
      position: { x: 50, y: 15 },
      size: { width: 70, height: 8 },
      properties: {
        text: 'शुभ विवाह',
        fontSize: 16,
        fontFamily: 'serif',
        fontWeight: 'bold',
        color: '#D2691E',
        textAlign: 'center'
      },
      editable: true
    });
  }

  return baseElements;
};

const createColorSchemes = (category: string): ColorScheme[] => {
  const schemes: Record<string, ColorScheme[]> = {
    'goan-beach': [
      {
        id: 'tropical-sunset',
        name: 'Tropical Sunset',
        primary: '#FF7F7F',
        secondary: '#40E0D0',
        accent: '#FFD700',
        background: '#FFF8DC',
        text: '#8B4513'
      },
      {
        id: 'ocean-breeze',
        name: 'Ocean Breeze',
        primary: '#4682B4',
        secondary: '#20B2AA',
        accent: '#F0E68C',
        background: '#F0F8FF',
        text: '#2F4F4F'
      },
      {
        id: 'palm-paradise',
        name: 'Palm Paradise',
        primary: '#228B22',
        secondary: '#32CD32',
        accent: '#FFD700',
        background: '#F5FFFA',
        text: '#006400'
      }
    ],
    'christian': [
      {
        id: 'colonial-elegance',
        name: 'Colonial Elegance',
        primary: '#4169E1',
        secondary: '#FFFFFF',
        accent: '#FFD700',
        background: '#F8F8FF',
        text: '#191970'
      },
      {
        id: 'sacred-ivory',
        name: 'Sacred Ivory',
        primary: '#FFFFF0',
        secondary: '#FFD700',
        accent: '#4169E1',
        background: '#FFFAF0',
        text: '#2F4F4F'
      },
      {
        id: 'portuguese-blue',
        name: 'Portuguese Blue',
        primary: '#1E90FF',
        secondary: '#FFFFFF',
        accent: '#FFD700',
        background: '#F0F8FF',
        text: '#000080'
      }
    ],
    'hindu': [
      {
        id: 'royal-red-gold',
        name: 'Royal Red & Gold',
        primary: '#DC143C',
        secondary: '#FFD700',
        accent: '#F4C430',
        background: '#FFF8DC',
        text: '#8B0000'
      },
      {
        id: 'saffron-elegance',
        name: 'Saffron Elegance',
        primary: '#FF8C00',
        secondary: '#FFD700',
        accent: '#DC143C',
        background: '#FFFAF0',
        text: '#B22222'
      },
      {
        id: 'mandala-mystique',
        name: 'Mandala Mystique',
        primary: '#8A2BE2',
        secondary: '#FFD700',
        accent: '#DC143C',
        background: '#F8F8FF',
        text: '#4B0082'
      }
    ],
    'muslim': [
      {
        id: 'emerald-gold',
        name: 'Emerald & Gold',
        primary: '#50C878',
        secondary: '#FFD700',
        accent: '#FFFFFF',
        background: '#F0FFF0',
        text: '#006400'
      },
      {
        id: 'royal-navy',
        name: 'Royal Navy',
        primary: '#000080',
        secondary: '#FFD700',
        accent: '#FFFFFF',
        background: '#F0F8FF',
        text: '#191970'
      },
      {
        id: 'pearl-elegance',
        name: 'Pearl Elegance',
        primary: '#FFFFFF',
        secondary: '#C0C0C0',
        accent: '#FFD700',
        background: '#FFFAFA',
        text: '#2F4F4F'
      }
    ],
    'modern': [
      {
        id: 'minimalist-chic',
        name: 'Minimalist Chic',
        primary: '#2F4F4F',
        secondary: '#F5F5DC',
        accent: '#FF69B4',
        background: '#FFFFFF',
        text: '#2F4F4F'
      },
      {
        id: 'coastal-modern',
        name: 'Coastal Modern',
        primary: '#708090',
        secondary: '#F0E68C',
        accent: '#20B2AA',
        background: '#F8F8FF',
        text: '#2F4F4F'
      },
      {
        id: 'rose-gold-modern',
        name: 'Rose Gold Modern',
        primary: '#F43F5E',
        secondary: '#FFC0CB',
        accent: '#FFFFFF',
        background: '#FFF0F5',
        text: '#8B008B'
      }
    ],
    'floral': [
      {
        id: 'tropical-blooms',
        name: 'Tropical Blooms',
        primary: '#FF1493',
        secondary: '#50C878',
        accent: '#FFD700',
        background: '#F0FFF0',
        text: '#8B008B'
      },
      {
        id: 'garden-romance',
        name: 'Garden Romance',
        primary: '#FFC0CB',
        secondary: '#98FB98',
        accent: '#FFD700',
        background: '#F5FFFA',
        text: '#8B4513'
      },
      {
        id: 'hibiscus-dream',
        name: 'Hibiscus Dream',
        primary: '#FF6347',
        secondary: '#32CD32',
        accent: '#FFD700',
        background: '#FFFAF0',
        text: '#B22222'
      }
    ]
  };

  return schemes[category] || schemes['modern'];
};

const createTypography = (culturalTheme: string): TypographyConfig => {
  const configs: Record<string, TypographyConfig> = {
    'christian': {
      headingFont: 'Playfair Display',
      bodyFont: 'Lato',
      accentFont: 'Dancing Script',
      sizes: {
        heading: 32,
        subheading: 24,
        body: 16,
        caption: 12
      }
    },
    'hindu': {
      headingFont: 'Cinzel',
      bodyFont: 'Open Sans',
      accentFont: 'Kalam',
      sizes: {
        heading: 36,
        subheading: 26,
        body: 16,
        caption: 12
      }
    },
    'muslim': {
      headingFont: 'Amiri',
      bodyFont: 'Noto Sans',
      accentFont: 'Scheherazade',
      sizes: {
        heading: 34,
        subheading: 25,
        body: 16,
        caption: 12
      }
    },
    'secular': {
      headingFont: 'Montserrat',
      bodyFont: 'Source Sans Pro',
      accentFont: 'Pacifico',
      sizes: {
        heading: 30,
        subheading: 22,
        body: 16,
        caption: 12
      }
    }
  };

  return configs[culturalTheme] || configs['secular'];
};

const createLayout = (): TemplateLayout => ({
  canvasSize: { width: 800, height: 1200 },
  margins: { top: 60, right: 60, bottom: 60, left: 60 },
  zones: [
    {
      id: 'header',
      name: 'Header',
      type: 'header',
      bounds: { x: 0, y: 0, width: 100, height: 20 },
      elements: ['bible-verse', 'sanskrit-blessing']
    },
    {
      id: 'main',
      name: 'Main Content',
      type: 'body',
      bounds: { x: 0, y: 20, width: 100, height: 60 },
      elements: ['couple-names', 'ceremony-date', 'ceremony-venue', 'ceremony-time']
    },
    {
      id: 'footer',
      name: 'Footer',
      type: 'footer',
      bounds: { x: 0, y: 80, width: 100, height: 20 },
      elements: ['contact-info', 'rsvp-details']
    }
  ]
});

// Template Definitions
const templates: InsertInvitationTemplate[] = [
  {
    name: 'Goan Beach Bliss',
    category: 'goan-beach',
    culturalTheme: 'secular',
    description: 'Stunning beach wedding invitation with golden sunset, palm trees, and ocean waves perfect for Goan ceremonies',
    previewUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80',
    templateData: {
      elements: createBaseElements('secular'),
      layout: createLayout()
    },
    colorSchemes: createColorSchemes('goan-beach'),
    typography: createTypography('secular'),
    features: ['Beach Sunset Theme', 'Palm Tree Silhouettes', 'Ocean Wave Borders', 'Tropical Typography'],
    sortOrder: 1
  },
  {
    name: 'Traditional Christian Heritage',
    category: 'christian',
    culturalTheme: 'christian',
    description: 'Elegant design inspired by Portuguese colonial architecture with Catholic symbols and traditional Christian elements',
    previewUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80',
    templateData: {
      elements: createBaseElements('christian'),
      layout: createLayout()
    },
    colorSchemes: createColorSchemes('christian'),
    typography: createTypography('christian'),
    features: ['Portuguese Colonial Style', 'Catholic Symbols', 'Bilingual Support', 'Heritage Colors'],
    sortOrder: 2
  },
  {
    name: 'Hindu Elegant Mandala',
    category: 'hindu',
    culturalTheme: 'hindu',
    description: 'Opulent design with intricate mandala patterns, traditional Hindu symbols, and royal color schemes',
    previewUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80',
    templateData: {
      elements: createBaseElements('hindu'),
      layout: createLayout()
    },
    colorSchemes: createColorSchemes('hindu'),
    typography: createTypography('hindu'),
    features: ['Intricate Mandalas', 'Sanskrit Elements', 'Royal Motifs', 'Traditional Colors'],
    sortOrder: 3
  },
  {
    name: 'Muslim Nikah Elegance',
    category: 'muslim',
    culturalTheme: 'muslim',
    description: 'Beautiful Islamic design with geometric patterns, Arabic calligraphy elements, and elegant color schemes',
    previewUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80',
    templateData: {
      elements: createBaseElements('muslim'),
      layout: createLayout()
    },
    colorSchemes: createColorSchemes('muslim'),
    typography: createTypography('muslim'),
    features: ['Islamic Geometric Patterns', 'Arabic Calligraphy', 'Elegant Typography', 'Cultural Authenticity'],
    sortOrder: 4
  },
  {
    name: 'Modern Minimalist Goan',
    category: 'modern',
    culturalTheme: 'secular',
    description: 'Clean, sophisticated design blending modern typography with subtle Goan coastal elements',
    previewUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80',
    templateData: {
      elements: createBaseElements('secular'),
      layout: createLayout()
    },
    colorSchemes: createColorSchemes('modern'),
    typography: createTypography('secular'),
    features: ['Minimalist Layout', 'Coastal Elements', 'Modern Typography', 'Clean Design'],
    sortOrder: 5
  },
  {
    name: 'Tropical Floral Paradise',
    category: 'floral',
    culturalTheme: 'secular',
    description: 'Vibrant tropical flowers with hibiscus, frangipani, and lush Goan greenery in watercolor style',
    previewUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80',
    templateData: {
      elements: createBaseElements('secular'),
      layout: createLayout()
    },
    colorSchemes: createColorSchemes('floral'),
    typography: createTypography('secular'),
    features: ['Hand-painted Florals', 'Watercolor Effects', 'Tropical Botanicals', 'Vibrant Colors'],
    sortOrder: 6
  }
];

export async function seedInvitationTemplates() {
  try {
    console.log('🌱 Seeding invitation templates...');
    
    // Clear existing templates (for development)
    await db.delete(invitationTemplates);
    
    // Insert new templates
    const insertedTemplates = await db.insert(invitationTemplates).values(templates).returning();
    
    console.log(`✅ Successfully seeded ${insertedTemplates.length} invitation templates`);
    
    // Log template details
    insertedTemplates.forEach(template => {
      console.log(`   - ${template.name} (${template.category}, ${template.culturalTheme})`);
    });
    
    return insertedTemplates;
  } catch (error) {
    console.error('❌ Error seeding invitation templates:', error);
    throw error;
  }
}

// Export for use in other files
export { templates as invitationTemplateSeeds };