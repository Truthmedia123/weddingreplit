/**
 * Mock Database for Development
 * This provides a simple in-memory database that matches the PostgreSQL schema
 * Replace with real PostgreSQL when ready
 */

import type { 
  InvitationTemplate, 
  GeneratedInvitation, 
  TemplateAnalytics,
  Vendor,
  Category,
  BlogPost,
  Wedding,
  Rsvp
} from "@shared/schema";
import type { CulturalTheme } from "@shared/invitation-types";

// Mock data storage
const mockData = {
  invitationTemplates: [] as InvitationTemplate[],
  generatedInvitations: [] as GeneratedInvitation[],
  templateAnalytics: [] as TemplateAnalytics[],
  vendors: [] as Vendor[],
  categories: [] as Category[],
  blogPosts: [] as BlogPost[],
  weddings: [] as Wedding[],
  rsvps: [] as Rsvp[]
};

// Mock database operations
export const mockDb = {
  // Invitation Templates
  invitationTemplates: {
    findMany: (filters?: any) => {
      let results = mockData.invitationTemplates.filter(t => t.isActive);
      
      if (filters?.where) {
        const { category, culturalTheme, name } = filters.where;
        if (category) results = results.filter(t => t.category === category);
        if (culturalTheme) results = results.filter(t => t.culturalTheme === culturalTheme);
        if (name?.like) {
          const searchTerm = name.like.replace(/%/g, '');
          results = results.filter(t => 
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      }
      
      return Promise.resolve(results);
    },
    
    findUnique: (id: string) => {
      const template = mockData.invitationTemplates.find(t => t.id === id && t.isActive);
      return Promise.resolve(template || null);
    },
    
    create: (data: any) => {
      const template: InvitationTemplate = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        sortOrder: 0,
        ...data
      };
      mockData.invitationTemplates.push(template);
      return Promise.resolve(template);
    }
  },

  // Generated Invitations
  generatedInvitations: {
    create: (data: any) => {
      const invitation: GeneratedInvitation = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        generationStatus: 'pending',
        viewCount: 0,
        downloadCount: 0,
        ...data
      };
      mockData.generatedInvitations.push(invitation);
      return Promise.resolve(invitation);
    },
    
    findUnique: (id: string) => {
      const invitation = mockData.generatedInvitations.find(i => i.id === id);
      return Promise.resolve(invitation || null);
    },
    
    findByToken: (token: string) => {
      const invitation = mockData.generatedInvitations.find(i => i.downloadToken === token);
      return Promise.resolve(invitation || null);
    }
  },

  // Template Analytics
  templateAnalytics: {
    create: (data: any) => {
      const analytics: TemplateAnalytics = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        ...data
      };
      mockData.templateAnalytics.push(analytics);
      return Promise.resolve(analytics);
    }
  }
};

// Initialize with sample templates
export async function initializeMockData() {
  if (mockData.invitationTemplates.length > 0) return; // Already initialized

  const sampleTemplates: Partial<InvitationTemplate>[] = [
    {
      name: 'Goan Beach Bliss',
      category: 'goan-beach',
      culturalTheme: 'secular',
      description: 'Stunning beach wedding invitation with golden sunset, palm trees, and ocean waves perfect for Goan ceremonies',
      previewUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400&q=80',
      templateData: {
        elements: [],
        layout: { canvasSize: { width: 800, height: 1200 }, margins: { top: 60, right: 60, bottom: 60, left: 60 }, zones: [] }
      },
      colorSchemes: [
        { id: 'tropical-sunset', name: 'Tropical Sunset', primary: '#FF7F7F', secondary: '#40E0D0', accent: '#FFD700', background: '#FFF8DC', text: '#8B4513' }
      ],
      typography: {
        headingFont: 'Montserrat',
        bodyFont: 'Source Sans Pro',
        accentFont: 'Pacifico',
        sizes: { heading: 30, subheading: 22, body: 16, caption: 12 }
      },
      features: ['Beach Sunset Theme', 'Palm Tree Silhouettes', 'Ocean Wave Borders', 'Popular'],
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
        elements: [],
        layout: { canvasSize: { width: 800, height: 1200 }, margins: { top: 60, right: 60, bottom: 60, left: 60 }, zones: [] }
      },
      colorSchemes: [
        { id: 'colonial-elegance', name: 'Colonial Elegance', primary: '#4169E1', secondary: '#FFFFFF', accent: '#FFD700', background: '#F8F8FF', text: '#191970' }
      ],
      typography: {
        headingFont: 'Playfair Display',
        bodyFont: 'Lato',
        accentFont: 'Dancing Script',
        sizes: { heading: 32, subheading: 24, body: 16, caption: 12 }
      },
      features: ['Portuguese Colonial Style', 'Catholic Symbols', 'Bilingual Support'],
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
        elements: [],
        layout: { canvasSize: { width: 800, height: 1200 }, margins: { top: 60, right: 60, bottom: 60, left: 60 }, zones: [] }
      },
      colorSchemes: [
        { id: 'royal-red-gold', name: 'Royal Red & Gold', primary: '#DC143C', secondary: '#FFD700', accent: '#F4C430', background: '#FFF8DC', text: '#8B0000' }
      ],
      typography: {
        headingFont: 'Cinzel',
        bodyFont: 'Open Sans',
        accentFont: 'Kalam',
        sizes: { heading: 36, subheading: 26, body: 16, caption: 12 }
      },
      features: ['Intricate Mandalas', 'Sanskrit Elements', 'Royal Motifs', 'Premium'],
      sortOrder: 3
    }
  ];

  for (const template of sampleTemplates) {
    await mockDb.invitationTemplates.create(template);
  }

  console.log('✅ Mock database initialized with sample templates');
}

// Cultural themes data
export const culturalThemes: CulturalTheme[] = [
  {
    id: 'christian',
    name: 'christian',
    displayName: 'Christian',
    description: 'Traditional Christian wedding themes with Portuguese colonial influences',
    colors: ['#4169E1', '#FFFFFF', '#FFD700'],
    symbols: ['Cross', 'Church', 'Rings', 'Dove'],
    typography: ['Playfair Display', 'Lato', 'Dancing Script'],
    traditions: ['Church Ceremony', 'Bible Readings', 'Wedding Vows'],
    languages: ['English', 'Portuguese', 'Konkani']
  },
  {
    id: 'hindu',
    name: 'hindu',
    displayName: 'Hindu',
    description: 'Traditional Hindu wedding themes with sacred symbols and vibrant colors',
    colors: ['#DC143C', '#FFD700', '#F4C430'],
    symbols: ['Om', 'Mandala', 'Lotus', 'Kalash'],
    typography: ['Cinzel', 'Open Sans', 'Kalam'],
    traditions: ['Mandap Ceremony', 'Saptapadi', 'Mangalsutra'],
    languages: ['English', 'Hindi', 'Sanskrit', 'Konkani']
  },
  {
    id: 'muslim',
    name: 'muslim',
    displayName: 'Muslim',
    description: 'Islamic wedding themes with geometric patterns and elegant calligraphy',
    colors: ['#50C878', '#FFD700', '#FFFFFF'],
    symbols: ['Crescent', 'Star', 'Geometric Patterns', 'Calligraphy'],
    typography: ['Amiri', 'Noto Sans', 'Scheherazade'],
    traditions: ['Nikah Ceremony', 'Mehndi', 'Walima'],
    languages: ['English', 'Arabic', 'Urdu']
  },
  {
    id: 'secular',
    name: 'secular',
    displayName: 'Secular',
    description: 'Modern non-religious themes suitable for civil ceremonies and beach weddings',
    colors: ['#2F4F4F', '#F5F5DC', '#FF69B4'],
    symbols: ['Hearts', 'Rings', 'Flowers', 'Beach Elements'],
    typography: ['Montserrat', 'Source Sans Pro', 'Pacifico'],
    traditions: ['Civil Ceremony', 'Beach Wedding', 'Garden Party'],
    languages: ['English', 'Portuguese']
  }
];