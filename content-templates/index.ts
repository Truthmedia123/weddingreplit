// Content Templates Configuration
// This file contains template definitions for the invitation generator

export interface TemplateConfig {
  id: string;
  name: string;
  preview: string;
  schema: TemplateSchema;
  category: string;
  style: string;
  description: string;
  features: string[];
  colors: string[];
  price: string;
  popular: boolean;
  premium: boolean;
}

export interface TemplateSchema {
  fields: TemplateField[];
  layout: 'portrait' | 'landscape' | 'square';
  elements: Record<string, ElementConfig>;
  colorSchemes: ColorScheme[];
  typography: TypographyConfig;
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'time' | 'email' | 'phone';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: ValidationRule[];
}

export interface ElementConfig {
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  maxWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export interface TypographyConfig {
  fonts: FontConfig[];
}

export interface FontConfig {
  name: string;
  family: string;
  weights: number[];
  category: 'script' | 'serif' | 'sans-serif' | 'display';
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// Goan Romance Template Configuration
export const goanRomanceTemplate = {
  id: 'goan-romance',
  name: 'Goan Romance',
  background: '/templates/template-goan-romance.jpg',
  width: 768,  // Set to PNG dimensions
  height: 1152,
  layers: [
    { key: 'headerQuote', x: 384, y: 95, fontSize: 36, fontFamily: 'Playfair Display', color: '#222', align: 'center', fontStyle: 'italic', defaultText: '' },
    { key: 'verse', x: 384, y: 138, fontSize: 18, fontFamily: 'Playfair Display', color: '#333', align: 'center', fontStyle: 'italic', defaultText: '' },
    { key: 'parentsLeft', x: 90, y: 185, fontSize: 18, fontFamily: 'Lato', color: '#222', align: 'left', defaultText: '' },
    { key: 'parentsRight', x: 600, y: 185, fontSize: 18, fontFamily: 'Lato', color: '#222', align: 'right', defaultText: '' },
    { key: 'inviteText', x: 384, y: 240, fontSize: 20, fontFamily: 'Lato', color: '#222', align: 'center', defaultText: '' },
    { key: 'coupleNames', x: 384, y: 325, fontSize: 58, fontFamily: 'Great Vibes, cursive', color: '#212121', align: 'center', defaultText: '' },
    { key: 'eventDetails', x: 384, y: 450, fontSize: 22, fontFamily: 'Lato', color: '#212121', align: 'center', defaultText: '' },
    { key: 'reception', x: 384, y: 520, fontSize: 20, fontFamily: 'Lato', color: '#212121', align: 'center', fontStyle: 'italic', defaultText: '' },
    { key: 'addressLeft', x: 90, y: 595, fontSize: 16, fontFamily: 'Lato', color: '#222', align: 'left', defaultText: '' },
    { key: 'addressRight', x: 600, y: 595, fontSize: 16, fontFamily: 'Lato', color: '#222', align: 'right', defaultText: '' },
    { key: 'blessing', x: 384, y: 660, fontSize: 18, fontFamily: 'Lato', color: '#7f4e13', align: 'center', fontStyle: 'italic', defaultText: '' }
  ]
};

// Template Definitions
export const invitationTemplates: TemplateConfig[] = [
  {
    id: 'goan-romance',
    name: 'Goan Romance',
    preview: '/templates/template-goan-romance.jpg',
    category: 'goan-beach',
    style: 'Traditional Elegance',
    description: 'Classic Goan wedding invitation with vibrant floral borders and traditional typography perfect for romantic ceremonies',
    features: ['Floral Border Design', 'Traditional Typography', 'Script Fonts', 'Cultural Elements', 'Romantic Theme'],
    colors: ['Crimson Red', 'Forest Green', 'Gold', 'Cream'],
    price: 'Free',
    popular: true,
    premium: false,
    schema: {
      layout: 'portrait',
             fields: [
         {
           id: 'scriptureText',
           name: 'Scripture Text',
           type: 'text',
           required: true,
           placeholder: 'Two hearts become one',
           validation: [
             { type: 'required', message: 'Scripture text is required' }
           ]
         },
         {
           id: 'bibleReference',
           name: 'Bible Reference',
           type: 'text',
           required: true,
           placeholder: 'Ecclesiastes 4:12',
           validation: [
             { type: 'required', message: 'Bible reference is required' }
           ]
         },
         {
           id: 'hostNamesLeft',
           name: 'Host Names (Left)',
           type: 'text',
           required: true,
           placeholder: 'Mr. Antonio Fernandes.\n& Mrs. Conceico Maria Feira.',
           validation: [
             { type: 'required', message: 'Host names are required' }
           ]
         },
         {
           id: 'hostNamesRight',
           name: 'Host Names (Right)',
           type: 'text',
           required: true,
           placeholder: 'Mr. Francisco Almeida Santos\n& Mrs. Rosario Isabel Rodrigues',
           validation: [
             { type: 'required', message: 'Host names are required' }
           ]
         },
         {
           id: 'invitationMessage',
           name: 'Invitation Message',
           type: 'text',
           required: true,
           placeholder: 'Request the honour of your presence',
           validation: [
             { type: 'required', message: 'Invitation message is required' }
           ]
         },
         {
           id: 'celebrationMessage',
           name: 'Celebration Message',
           type: 'text',
           required: true,
           placeholder: 'to celebrate and share the happiness blessings',
           validation: [
             { type: 'required', message: 'Celebration message is required' }
           ]
         },
         {
           id: 'unionMessage',
           name: 'Union Message',
           type: 'text',
           required: true,
           placeholder: 'of the Holy union of our children',
           validation: [
             { type: 'required', message: 'Union message is required' }
           ]
         },
         {
           id: 'brideName',
           name: 'Bride Name',
           type: 'text',
           required: true,
           placeholder: 'Gabriella',
           validation: [
             { type: 'required', message: 'Bride name is required' }
           ]
         },
         {
           id: 'groomName',
           name: 'Groom Name',
           type: 'text',
           required: true,
           placeholder: 'Armando',
           validation: [
             { type: 'required', message: 'Groom name is required' }
           ]
         },
         {
           id: 'date',
           name: 'Date',
           type: 'text',
           required: true,
           placeholder: 'an Saturday, the 25th of October 2025',
           validation: [
             { type: 'required', message: 'Date is required' }
           ]
         },
         {
           id: 'venue',
           name: 'Venue',
           type: 'text',
           required: true,
           placeholder: 'at Se Cathedral, Old Goa',
           validation: [
             { type: 'required', message: 'Venue is required' }
           ]
         },
         {
           id: 'time',
           name: 'Time',
           type: 'text',
           required: true,
           placeholder: 'at 4:00 pm',
           validation: [
             { type: 'required', message: 'Time is required' }
           ]
         },
         {
           id: 'reception',
           name: 'Reception',
           type: 'text',
           required: true,
           placeholder: 'followed at Reception at Casa Portuguesco,',
           validation: [
             { type: 'required', message: 'Reception details are required' }
           ]
         },
         {
           id: 'contactLeft',
           name: 'Contact Info (Left)',
           type: 'text',
           required: true,
           placeholder: 'H. No. 245, Fontainhas\nPanaio Goa\n9834367500',
           validation: [
             { type: 'required', message: 'Contact information is required' }
           ]
         },
         {
           id: 'contactRight',
           name: 'Contact Info (Right)',
           type: 'text',
           required: true,
           placeholder: 'H. No. 10610, Primeiro\nSanta Cruz - Gom\n9824463734',
           validation: [
             { type: 'required', message: 'Contact information is required' }
           ]
         },
         {
           id: 'closingMessage',
           name: 'Closing Message',
           type: 'text',
           required: true,
           placeholder: 'Your Blessing is the only Precious Gift our heart desires',
           validation: [
             { type: 'required', message: 'Closing message is required' }
           ]
         }
       ],
             elements: {
         scriptureText: { key: 'scriptureText', x: 50, y: 8, fontSize: 16, fontFamily: 'Dancing Script', textAlign: 'center', color: '#8B4513' },
         bibleReference: { key: 'bibleReference', x: 50, y: 12, fontSize: 12, fontFamily: 'Playfair Display', textAlign: 'center', color: '#333333' },
         hostNamesLeft: { key: 'hostNamesLeft', x: 25, y: 18, fontSize: 11, fontFamily: 'Playfair Display', textAlign: 'left', color: '#333333' },
         hostNamesRight: { key: 'hostNamesRight', x: 75, y: 18, fontSize: 11, fontFamily: 'Playfair Display', textAlign: 'right', color: '#333333' },
         invitationMessage: { key: 'invitationMessage', x: 50, y: 28, fontSize: 14, fontFamily: 'Playfair Display', textAlign: 'center', color: '#333333' },
         celebrationMessage: { key: 'celebrationMessage', x: 50, y: 32, fontSize: 14, fontFamily: 'Playfair Display', textAlign: 'center', color: '#333333' },
         unionMessage: { key: 'unionMessage', x: 50, y: 36, fontSize: 14, fontFamily: 'Playfair Display', textAlign: 'center', color: '#333333' },
         brideName: { key: 'brideName', x: 50, y: 45, fontSize: 28, fontFamily: 'Dancing Script', textAlign: 'center', color: '#8B4513' },
         groomName: { key: 'groomName', x: 50, y: 52, fontSize: 28, fontFamily: 'Dancing Script', textAlign: 'center', color: '#8B4513' },
         date: { key: 'date', x: 50, y: 62, fontSize: 14, fontFamily: 'Playfair Display', textAlign: 'center', color: '#333333' },
         venue: { key: 'venue', x: 50, y: 66, fontSize: 14, fontFamily: 'Playfair Display', textAlign: 'center', color: '#333333' },
         time: { key: 'time', x: 50, y: 70, fontSize: 14, fontFamily: 'Playfair Display', textAlign: 'center', color: '#333333' },
         reception: { key: 'reception', x: 50, y: 76, fontSize: 14, fontFamily: 'Playfair Display', textAlign: 'center', color: '#333333' },
         contactLeft: { key: 'contactLeft', x: 25, y: 85, fontSize: 11, fontFamily: 'Playfair Display', textAlign: 'left', color: '#333333' },
         contactRight: { key: 'contactRight', x: 75, y: 85, fontSize: 11, fontFamily: 'Playfair Display', textAlign: 'right', color: '#333333' },
         closingMessage: { key: 'closingMessage', x: 50, y: 92, fontSize: 14, fontFamily: 'Dancing Script', textAlign: 'center', color: '#8B4513' }
       },
      colorSchemes: [
        {
          name: 'Romance',
          primary: '#DC143C',
          secondary: '#228B22',
          accent: '#FFD700',
          background: '#F5F5DC'
        }
      ],
      typography: {
        fonts: [
          {
            name: 'Script',
            family: 'Dancing Script',
            weights: [400, 600, 700],
            category: 'script'
          },
          {
            name: 'Serif',
            family: 'Playfair Display',
            weights: [400, 600, 700],
            category: 'serif'
          }
        ]
      }
    }
  }
];

export default invitationTemplates;
