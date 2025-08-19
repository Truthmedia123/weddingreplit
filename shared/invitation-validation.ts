import { z } from 'zod';
import { CULTURAL_THEMES, TEMPLATE_CATEGORIES, GENERATION_STATUSES, EVENT_TYPES } from './invitation-types';

// Element validation schemas
export const elementPropertiesSchema = z.object({
  // Text properties
  text: z.string().optional(),
  fontSize: z.number().min(8).max(72).optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.enum(['normal', 'bold', 'lighter']).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  
  // Image properties
  src: z.string().url().optional(),
  alt: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  
  // Shape properties
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().min(0).optional(),
  
  // QR Code properties
  qrData: z.string().optional(),
  qrSize: z.enum(['small', 'medium', 'large']).optional(),
  qrStyle: z.object({
    foregroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    borderRadius: z.number().min(0).max(50),
    margin: z.number().min(0).max(20)
  }).optional()
});

export const elementConstraintsSchema = z.object({
  minWidth: z.number().min(0).optional(),
  maxWidth: z.number().min(0).optional(),
  minHeight: z.number().min(0).optional(),
  maxHeight: z.number().min(0).optional(),
  lockAspectRatio: z.boolean().optional(),
  allowResize: z.boolean().optional(),
  allowMove: z.boolean().optional()
});

export const templateElementSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['text', 'image', 'shape', 'decoration', 'qr-code']),
  position: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100)
  }),
  size: z.object({
    width: z.number().min(0).max(100),
    height: z.number().min(0).max(100)
  }),
  properties: elementPropertiesSchema,
  editable: z.boolean(),
  constraints: elementConstraintsSchema.optional()
});

// Color scheme validation
export const colorSchemeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  text: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
});

// Typography validation
export const typographyConfigSchema = z.object({
  headingFont: z.string().min(1),
  bodyFont: z.string().min(1),
  accentFont: z.string().min(1),
  sizes: z.object({
    heading: z.number().min(16).max(72),
    subheading: z.number().min(14).max(48),
    body: z.number().min(10).max(24),
    caption: z.number().min(8).max(16)
  })
});

// Layout validation
export const layoutZoneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['header', 'body', 'footer', 'sidebar', 'decoration']),
  bounds: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    width: z.number().min(0).max(100),
    height: z.number().min(0).max(100)
  }),
  elements: z.array(z.string())
});

export const templateLayoutSchema = z.object({
  canvasSize: z.object({
    width: z.number().min(400).max(2000),
    height: z.number().min(400).max(3000)
  }),
  margins: z.object({
    top: z.number().min(0).max(200),
    right: z.number().min(0).max(200),
    bottom: z.number().min(0).max(200),
    left: z.number().min(0).max(200)
  }),
  zones: z.array(layoutZoneSchema),
  responsiveBreakpoints: z.array(z.object({
    breakpoint: z.number().min(320).max(1920),
    canvasSize: z.object({
      width: z.number().min(200).max(1000),
      height: z.number().min(200).max(1500)
    }),
    elementAdjustments: z.record(z.string(), templateElementSchema.partial())
  })).optional()
});

// Template validation
export const invitationTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  category: z.enum(TEMPLATE_CATEGORIES),
  culturalTheme: z.enum(CULTURAL_THEMES),
  description: z.string().max(1000).optional(),
  previewUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  templateData: z.object({
    elements: z.array(templateElementSchema),
    layout: templateLayoutSchema
  }),
  colorSchemes: z.array(colorSchemeSchema).min(1).max(5),
  typography: typographyConfigSchema,
  features: z.array(z.string()).max(10),
  isActive: z.boolean().optional(),
  sortOrder: z.number().min(0).optional()
});

// Form data validation schemas
export const contactPersonSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(10).max(15).regex(/^[\+]?[0-9\s\-\(\)]+$/),
  email: z.string().email(),
  relation: z.string().min(1).max(50)
});

export const rsvpConfigSchema = z.object({
  enabled: z.boolean(),
  deadline: z.string().optional(),
  method: z.enum(['phone', 'email', 'website', 'qr']),
  url: z.string().url().optional(),
  instructions: z.string().max(500).optional()
});

export const qrCodeConfigSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['rsvp', 'website', 'contact', 'location', 'custom']),
  data: z.string().min(1),
  position: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100)
  }),
  size: z.enum(['small', 'medium', 'large']),
  style: z.object({
    foregroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    borderRadius: z.number().min(0).max(50),
    margin: z.number().min(0).max(20)
  })
});

export const invitationFormDataSchema = z.object({
  coupleDetails: z.object({
    groomName: z.string().min(1).max(100),
    groomFatherName: z.string().min(1).max(100),
    groomMotherName: z.string().min(1).max(100),
    brideName: z.string().min(1).max(100),
    brideFatherName: z.string().min(1).max(100),
    brideMotherName: z.string().min(1).max(100),
    culturalTradition: z.enum(CULTURAL_THEMES),
    languagePreferences: z.array(z.string()).min(1).max(4)
  }),
  ceremonyDetails: z.object({
    type: z.enum(['religious', 'civil', 'traditional']),
    venue: z.string().min(1).max(200),
    address: z.string().min(1).max(300),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    duration: z.string().max(50).optional(),
    dresscode: z.string().max(100).optional(),
    specialInstructions: z.string().max(500).optional()
  }),
  receptionDetails: z.object({
    venue: z.string().min(1).max(200),
    address: z.string().min(1).max(300),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    menuType: z.string().max(100).optional(),
    entertainmentDetails: z.string().max(300).optional()
  }),
  contactInfo: z.object({
    primaryContact: contactPersonSchema,
    secondaryContact: contactPersonSchema.optional(),
    rsvpDetails: rsvpConfigSchema,
    additionalInfo: z.string().max(1000).optional()
  }),
  customization: z.object({
    selectedTemplate: z.string().uuid(),
    colorScheme: colorSchemeSchema,
    typography: typographyConfigSchema,
    qrCodes: z.array(qrCodeConfigSchema).max(3),
    backgroundImage: z.string().url().optional(),
    customElements: z.array(z.object({
      id: z.string().min(1),
      type: z.enum(['text', 'image', 'decoration']),
      data: z.any(),
      position: z.object({
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100)
      }),
      size: z.object({
        width: z.number().min(0).max(100),
        height: z.number().min(0).max(100)
      })
    })).max(5)
  })
});

// Generation request validation
export const exportFormatSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  extension: z.string().min(1),
  mimeType: z.string().min(1),
  quality: z.number().min(0.1).max(1),
  optimization: z.object({
    compression: z.number().min(0).max(100),
    progressive: z.boolean(),
    stripMetadata: z.boolean()
  })
});

export const exportResolutionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  width: z.number().min(200).max(4000),
  height: z.number().min(200).max(6000),
  dpi: z.number().min(72).max(600),
  useCase: z.enum(['social', 'whatsapp', 'print', 'web'])
});

export const generationRequestSchema = z.object({
  templateId: z.string().uuid(),
  formData: invitationFormDataSchema,
  formats: z.array(exportFormatSchema).min(1).max(5),
  resolutions: z.array(exportResolutionSchema).min(1).max(5),
  options: z.object({
    quality: z.enum(['draft', 'standard', 'high']),
    watermark: z.boolean(),
    compression: z.boolean(),
    backgroundRemoval: z.boolean()
  })
});

// Analytics validation
export const analyticsEventSchema = z.object({
  type: z.enum(EVENT_TYPES),
  templateId: z.string().uuid().optional(),
  step: z.string().optional(),
  duration: z.number().min(0).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  sessionId: z.string().min(1),
  timestamp: z.date()
});

// API response validation
export const templateListResponseSchema = z.object({
  templates: z.array(invitationTemplateSchema),
  categories: z.array(z.string()),
  culturalThemes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string(),
    description: z.string(),
    colors: z.array(z.string()),
    symbols: z.array(z.string()),
    typography: z.array(z.string()),
    traditions: z.array(z.string()),
    languages: z.array(z.string())
  })),
  pagination: z.object({
    page: z.number().min(1),
    limit: z.number().min(1).max(100),
    total: z.number().min(0),
    totalPages: z.number().min(0)
  }),
  filters: z.object({
    categories: z.array(z.string()),
    culturalThemes: z.array(z.string()),
    features: z.array(z.string())
  })
});

export const generationResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string().uuid(),
    downloadToken: z.string(),
    formats: z.array(z.object({
      format: exportFormatSchema,
      resolution: exportResolutionSchema,
      fileUrl: z.string().url(),
      fileSize: z.number().min(0),
      downloadUrl: z.string().url()
    })),
    shareUrl: z.string().url(),
    expiresAt: z.date()
  }).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }).optional()
});

// Validation helper functions
export function validateTemplateData(data: unknown) {
  return invitationTemplateSchema.safeParse(data);
}

export function validateFormData(data: unknown) {
  return invitationFormDataSchema.safeParse(data);
}

export function validateGenerationRequest(data: unknown) {
  return generationRequestSchema.safeParse(data);
}

export function validateAnalyticsEvent(data: unknown) {
  return analyticsEventSchema.safeParse(data);
}

// Export all schemas for use in API endpoints
export const validationSchemas = {
  invitationTemplate: invitationTemplateSchema,
  invitationFormData: invitationFormDataSchema,
  generationRequest: generationRequestSchema,
  analyticsEvent: analyticsEventSchema,
  templateListResponse: templateListResponseSchema,
  generationResponse: generationResponseSchema
} as const;