// Enhanced Wedding Invitation Generator Type Definitions

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'decoration' | 'qr-code' | 'scripture' | 'host-names' | 'invitation-message' | 'closing-message';
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: ElementProperties;
  editable: boolean;
  constraints?: ElementConstraints;
}

export interface ElementProperties {
  // Text properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  
  // Image properties
  src?: string;
  alt?: string;
  opacity?: number;
  
  // Shape properties
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  
  // QR Code properties
  qrData?: string;
  qrSize?: 'small' | 'medium' | 'large';
  qrStyle?: QRCodeStyle;
}

export interface ElementConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  lockAspectRatio?: boolean;
  allowResize?: boolean;
  allowMove?: boolean;
}

export interface QRCodeStyle {
  foregroundColor: string;
  backgroundColor: string;
  borderRadius: number;
  margin: number;
}

export interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface TypographyConfig {
  headingFont: string;
  bodyFont: string;
  accentFont: string;
  sizes: {
    heading: number;
    subheading: number;
    body: number;
    caption: number;
  };
}

export interface TemplateLayout {
  canvasSize: { width: number; height: number };
  margins: { top: number; right: number; bottom: number; left: number };
  zones: LayoutZone[];
  responsiveBreakpoints?: ResponsiveConfig[];
}

export interface LayoutZone {
  id: string;
  name: string;
  type: 'header' | 'body' | 'footer' | 'sidebar' | 'decoration';
  bounds: { x: number; y: number; width: number; height: number };
  elements: string[]; // Element IDs that belong to this zone
}

export interface ResponsiveConfig {
  breakpoint: number;
  canvasSize: { width: number; height: number };
  elementAdjustments: Record<string, Partial<TemplateElement>>;
}

export interface CulturalTheme {
  id: string;
  name: string;
  displayName: string;
  description: string;
  colors: string[];
  symbols: string[];
  typography: string[];
  traditions: string[];
  languages: string[];
}

// Form Data Interfaces
export interface InvitationFormData {
  // Step 1: Couple Details
  coupleDetails: {
    groomName: string;
    groomFatherName: string;
    groomMotherName: string;
    brideName: string;
    brideFatherName: string;
    brideMotherName: string;
    culturalTradition: string;
    religion: ReligionType;
    languagePreferences: string[];
  };
  
  // Step 2: Ceremony Details
  ceremonyDetails: {
    type: 'religious' | 'civil' | 'traditional';
    venue: string;
    address: string;
    date: string;
    time: string;
    duration?: string;
    dresscode?: string;
    specialInstructions?: string;
  };
  
  // Step 3: Reception Details
  receptionDetails: {
    venue: string;
    address: string;
    date: string;
    time: string;
    menuType?: string;
    entertainmentDetails?: string;
  };
  
  // Step 4: Contact & Additional Info
  contactInfo: {
    primaryContact: ContactPerson;
    secondaryContact?: ContactPerson;
    rsvpDetails: RSVPConfig;
    additionalInfo?: string;
  };
  
  // Enhanced customization options
  customization: {
    selectedTemplate: string;
    colorScheme: ColorScheme;
    typography: TypographyConfig;
    qrCodes: QRCodeConfig[];
    backgroundImage?: string;
    customElements: CustomElement[];
  };
}

export interface ContactPerson {
  name: string;
  phone: string;
  email: string;
  relation: string;
}

export interface RSVPConfig {
  enabled: boolean;
  deadline?: string;
  method: 'phone' | 'email' | 'website' | 'qr';
  url?: string;
  instructions?: string;
}

export interface QRCodeConfig {
  id: string;
  type: 'rsvp' | 'website' | 'contact' | 'location' | 'custom';
  data: string;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  style: QRCodeStyle;
}

export interface CustomElement {
  id: string;
  type: 'text' | 'image' | 'decoration';
  data: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// Export and Generation Interfaces
export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  quality: number;
  optimization: OptimizationConfig;
}

export interface ExportResolution {
  id: string;
  name: string;
  width: number;
  height: number;
  dpi: number;
  useCase: 'social' | 'whatsapp' | 'print' | 'web';
}

export interface OptimizationConfig {
  compression: number;
  progressive: boolean;
  stripMetadata: boolean;
}

export interface GenerationRequest {
  templateId: string;
  formData: InvitationFormData;
  formats: ExportFormat[];
  resolutions: ExportResolution[];
  options: GenerationOptions;
}

export interface GenerationOptions {
  quality: 'draft' | 'standard' | 'high';
  watermark: boolean;
  compression: boolean;
  backgroundRemoval: boolean;
}

export interface GenerationResult {
  id: string;
  downloadToken: string;
  formats: GeneratedFormat[];
  shareUrl: string;
  expiresAt: Date;
}

export interface GeneratedFormat {
  format: ExportFormat;
  resolution: ExportResolution;
  fileUrl: string;
  fileSize: number;
  downloadUrl: string;
}

// Analytics Interfaces
export interface AnalyticsEvent {
  type: 'template_view' | 'template_select' | 'form_step' | 'generation_start' | 'generation_complete' | 'download' | 'share';
  templateId?: string;
  step?: string;
  duration?: number;
  metadata?: Record<string, any>;
  sessionId: string;
  timestamp: Date;
}

export interface TemplateUsageStats {
  templateId: string;
  templateName: string;
  viewCount: number;
  selectCount: number;
  completionCount: number;
  conversionRate: number;
}

export interface CompletionStats {
  totalStarts: number;
  totalCompletions: number;
  overallCompletionRate: number;
  stepCompletionRates: Record<string, number>;
  averageCompletionTime: number;
}

export interface PerformanceStats {
  averageLoadTime: number;
  averagePreviewTime: number;
  averageGenerationTime: number;
  errorRate: number;
}

// API Response Interfaces
export interface TemplateListResponse {
  templates: InvitationTemplate[];
  categories: string[];
  culturalThemes: CulturalTheme[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    categories: string[];
    culturalThemes: string[];
    features: string[];
  };
}

export interface InvitationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  style: string;
  price?: string;
  isActive?: boolean;
  previewUrl?: string;
  templateData?: any;
  features?: string[];
  colors?: string[];
  premium?: boolean;
  culturalTheme?: string;
}

export interface TemplateDetailResponse {
  template: InvitationTemplate;
  elements: TemplateElement[];
  colorSchemes: ColorScheme[];
  typography: TypographyConfig;
  layout: TemplateLayout;
}

export interface GenerationResponse {
  success: boolean;
  data?: GenerationResult;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Validation Schemas
export const CULTURAL_THEMES = ['christian', 'hindu', 'muslim', 'secular'] as const;
export const TEMPLATE_CATEGORIES = ['goan-beach', 'christian', 'hindu', 'muslim', 'modern', 'floral'] as const;
export const GENERATION_STATUSES = ['pending', 'processing', 'completed', 'failed'] as const;
export const EVENT_TYPES = ['template_view', 'template_select', 'form_step', 'generation_start', 'generation_complete', 'download', 'share'] as const;

export const RELIGION_OPTIONS = [
  'Christianity',
  'Hinduism', 
  'Islam',
  'Sikhism',
  'Buddhism',
  'Jainism',
  'Judaism',
  'Zoroastrianism',
  'Secular',
  'Other'
] as const;

export type CulturalThemeType = typeof CULTURAL_THEMES[number];
export type TemplateCategoryType = typeof TEMPLATE_CATEGORIES[number];
export type GenerationStatusType = typeof GENERATION_STATUSES[number];
export type EventType = typeof EVENT_TYPES[number];
export type ReligionType = typeof RELIGION_OPTIONS[number];