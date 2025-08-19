import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D } from 'canvas';
import path from 'path';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import sharp from 'sharp';
import { db } from './db';
import { invitationTemplates, generatedInvitations, invitationAnalytics } from '../shared/schema';
import { eq } from 'drizzle-orm';

export interface EnhancedInvitationData {
  // Form data
  groomName: string;
  groomFatherName: string;
  groomMotherName: string;
  brideName: string;
  brideFatherName: string;
  brideMotherName: string;
  ceremonyVenue: string;
  ceremonyDay: string;
  ceremonyDate: string;
  ceremonyTime: string;
  bibleVerse?: string;
  bibleReference?: string;
  receptionVenue: string;
  receptionDate: string;
  receptionTime: string;
  address1: string;
  location1: string;
  contact1: string;
  address2?: string;
  location2?: string;
  contact2?: string;
  
  // Customization data
  selectedFont: string;
  selectedColorScheme: string;
  qrCodeEnabled: boolean;
  qrCodePosition: 'bottom-center' | 'bottom-corner' | 'custom';
  qrCodeSize: 'small' | 'medium' | 'large';
}

export interface GeneratedInvitationResult {
  token: string;
  filename: string;
  expiresAt: Date;
  formats: {
    png: string;
    jpg: string;
    pdf: string;
    social?: string;
    whatsapp?: string;
  };
  downloadUrl: string;
}

export interface TemplateConfig {
  id: string;
  name: string;
  category: string;
  layout: 'portrait' | 'landscape' | 'square';
  dimensions: {
    width: number;
    height: number;
  };
  elements: {
    coupleNames: { x: number; y: number; fontSize: number; fontFamily: string };
    ceremonyDetails: { x: number; y: number; fontSize: number; fontFamily: string };
    receptionDetails: { x: number; y: number; fontSize: number; fontFamily: string };
    contactInfo: { x: number; y: number; fontSize: number; fontFamily: string };
    qrCode: { x: number; y: number; size: number };
  };
  colorSchemes: Array<{
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  }>;
  backgroundImage?: string;
}

// Template configurations
const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  'goan-beach-bliss': {
    id: 'goan-beach-bliss',
    name: 'Goan Beach Bliss',
    category: 'goan-beach',
    layout: 'portrait',
    dimensions: { width: 800, height: 1200 },
    elements: {
      coupleNames: { x: 400, y: 300, fontSize: 48, fontFamily: 'Playfair Display' },
      ceremonyDetails: { x: 400, y: 500, fontSize: 24, fontFamily: 'Lato' },
      receptionDetails: { x: 400, y: 700, fontSize: 24, fontFamily: 'Lato' },
      contactInfo: { x: 400, y: 900, fontSize: 18, fontFamily: 'Lato' },
      qrCode: { x: 400, y: 1100, size: 80 }
    },
    colorSchemes: [
      {
        name: 'coral-sunset',
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
        background: '#F7F7F7'
      },
      {
        name: 'ocean-breeze',
        primary: '#74B9FF',
        secondary: '#0984E3',
        accent: '#00B894',
        background: '#F5F6FA'
      }
    ],
    backgroundImage: 'goan-beach-background.png'
  },
  'portuguese-heritage': {
    id: 'portuguese-heritage',
    name: 'Portuguese Heritage',
    category: 'christian',
    layout: 'portrait',
    dimensions: { width: 800, height: 1200 },
    elements: {
      coupleNames: { x: 400, y: 280, fontSize: 52, fontFamily: 'Crimson Text' },
      ceremonyDetails: { x: 400, y: 480, fontSize: 26, fontFamily: 'Crimson Text' },
      receptionDetails: { x: 400, y: 680, fontSize: 26, fontFamily: 'Crimson Text' },
      contactInfo: { x: 400, y: 880, fontSize: 20, fontFamily: 'Crimson Text' },
      qrCode: { x: 400, y: 1080, size: 90 }
    },
    colorSchemes: [
      {
        name: 'royal-blue',
        primary: '#1E3A8A',
        secondary: '#3B82F6',
        accent: '#F59E0B',
        background: '#FEF9F3'
      },
      {
        name: 'golden-age',
        primary: '#D97706',
        secondary: '#92400E',
        accent: '#FEF3C7',
        background: '#FFFBEB'
      }
    ],
    backgroundImage: 'portuguese-heritage-background.png'
  },
  'hindu-elegant': {
    id: 'hindu-elegant',
    name: 'Hindu Elegant',
    category: 'hindu',
    layout: 'portrait',
    dimensions: { width: 800, height: 1200 },
    elements: {
      coupleNames: { x: 400, y: 320, fontSize: 50, fontFamily: 'Noto Serif Devanagari' },
      ceremonyDetails: { x: 400, y: 520, fontSize: 28, fontFamily: 'Noto Sans Devanagari' },
      receptionDetails: { x: 400, y: 720, fontSize: 28, fontFamily: 'Noto Sans Devanagari' },
      contactInfo: { x: 400, y: 920, fontSize: 22, fontFamily: 'Noto Sans Devanagari' },
      qrCode: { x: 400, y: 1120, size: 85 }
    },
    colorSchemes: [
      {
        name: 'deep-red',
        primary: '#DC2626',
        secondary: '#991B1B',
        accent: '#FEF3C7',
        background: '#FEF9F3'
      },
      {
        name: 'saffron-gold',
        primary: '#F59E0B',
        secondary: '#D97706',
        accent: '#DC2626',
        background: '#FFFBEB'
      }
    ],
    backgroundImage: 'hindu-elegant-background.png'
  }
};

export class EnhancedInvitationService {
  private static instance: EnhancedInvitationService;
  private invitationStore = new Map<string, { buffer: Buffer; filename: string; expiresAt: Date }>();

  private constructor() {
    // Clean up expired invitations every hour
    setInterval(() => this.cleanupExpiredInvitations(), 60 * 60 * 1000);
  }

  public static getInstance(): EnhancedInvitationService {
    if (!EnhancedInvitationService.instance) {
      EnhancedInvitationService.instance = new EnhancedInvitationService();
    }
    return EnhancedInvitationService.instance;
  }

  async generateInvitation(
    templateId: string,
    data: EnhancedInvitationData,
    formats: ('png' | 'jpg' | 'pdf' | 'social' | 'whatsapp')[] = ['png', 'jpg', 'pdf']
  ): Promise<GeneratedInvitationResult> {
    try {
      // Get template configuration
      const templateConfig = TEMPLATE_CONFIGS[templateId];
      if (!templateConfig) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Generate unique token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Generate QR code if enabled
      let qrCodeBuffer: Buffer | null = null;
      if (data.qrCodeEnabled) {
        const rsvpUrl = `${process.env.BASE_URL || 'https://yourdomain.com'}/rsvp/${token}`;
        qrCodeBuffer = await QRCode.toBuffer(rsvpUrl, {
          width: templateConfig.elements.qrCode.size,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      }

      // Generate different formats
      const generatedFormats: Record<string, string> = {};
      
      for (const format of formats) {
        const buffer = await this.generateFormat(templateConfig, data, qrCodeBuffer, format);
        const filename = `invitation-${templateId}-${token}.${format}`;
        
        // Store in memory (in production, you'd store in cloud storage)
        this.invitationStore.set(`${token}-${format}`, {
          buffer,
          filename,
          expiresAt
        });
        
        generatedFormats[format] = filename;
      }

      // Save to database
      await db.insert(generatedInvitations).values({
        templateId,
        formData: data,
        customizationData: {
          selectedFont: data.selectedFont,
          selectedColorScheme: data.selectedColorScheme,
          qrCodeEnabled: data.qrCodeEnabled,
          qrCodePosition: data.qrCodePosition,
          qrCodeSize: data.qrCodeSize
        },
        downloadToken: token,
        formats: generatedFormats,
        expiresAt
      });

      // Track analytics
      await this.trackAnalytics(token, templateId, 'created');

      return {
        token,
        filename: generatedFormats.png,
        expiresAt,
        formats: generatedFormats as any,
        downloadUrl: `${process.env.BASE_URL || 'https://yourdomain.com'}/api/invitations/download/${token}`
      };

    } catch (error) {
      console.error('Error generating invitation:', error);
      throw new Error('Failed to generate invitation');
    }
  }

  private async generateFormat(
    templateConfig: TemplateConfig,
    data: EnhancedInvitationData,
    qrCodeBuffer: Buffer | null,
    format: string
  ): Promise<Buffer> {
    const { width, height } = templateConfig.dimensions;
    
    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Get color scheme
    const colorScheme = templateConfig.colorSchemes.find(
      scheme => scheme.name === data.selectedColorScheme
    ) || templateConfig.colorSchemes[0];

    // Draw background
    ctx.fillStyle = colorScheme.background;
    ctx.fillRect(0, 0, width, height);

    // Load and draw background image if available
    if (templateConfig.backgroundImage) {
      try {
        const backgroundPath = path.resolve(process.cwd(), 'attached_assets', 'templates', templateConfig.backgroundImage);
        const backgroundImage = await loadImage(backgroundPath);
        ctx.drawImage(backgroundImage, 0, 0, width, height);
      } catch (error) {
        console.warn(`Background image not found: ${templateConfig.backgroundImage}`);
        // Draw fallback decorative border
        ctx.strokeStyle = colorScheme.primary;
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, width - 40, height - 40);
      }
    }

    // Draw text elements
    await this.drawTextElements(ctx, templateConfig, data, colorScheme);

    // Draw QR code if enabled
    if (qrCodeBuffer) {
      await this.drawQRCode(ctx, templateConfig, qrCodeBuffer, data.qrCodePosition, data.qrCodeSize);
    }

    // Convert to requested format
    switch (format) {
      case 'png':
        return canvas.toBuffer('image/png');
      
      case 'jpg':
        return canvas.toBuffer('image/jpeg', { quality: 0.9 });
      
      case 'pdf':
        return await this.convertToPDF(canvas, templateConfig, data);
      
      case 'social':
        return await this.generateSocialFormat(canvas, 1080, 1080);
      
      case 'whatsapp':
        return await this.generateWhatsAppFormat(canvas, 800, 1200);
      
      default:
        return canvas.toBuffer('image/png');
    }
  }

  private async drawTextElements(
    ctx: CanvasRenderingContext2D,
    templateConfig: TemplateConfig,
    data: EnhancedInvitationData,
    colorScheme: any
  ) {
    const { elements } = templateConfig;

    // Draw couple names
    ctx.font = `${elements.coupleNames.fontSize}px ${elements.coupleNames.fontFamily}`;
    ctx.fillStyle = colorScheme.primary;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const coupleText = `${data.groomName} & ${data.brideName}`;
    ctx.fillText(coupleText, elements.coupleNames.x, elements.coupleNames.y);

    // Draw ceremony details
    ctx.font = `${elements.ceremonyDetails.fontSize}px ${elements.ceremonyDetails.fontFamily}`;
    ctx.fillStyle = colorScheme.secondary;
    ctx.textAlign = 'center';
    
    const ceremonyText = [
      `Ceremony: ${data.ceremonyVenue}`,
      `${data.ceremonyDate} at ${data.ceremonyTime}`
    ];
    
    ceremonyText.forEach((line, index) => {
      ctx.fillText(
        line, 
        elements.ceremonyDetails.x, 
        elements.ceremonyDetails.y + index * 40
      );
    });

    // Draw reception details
    ctx.font = `${elements.receptionDetails.fontSize}px ${elements.receptionDetails.fontFamily}`;
    
    const receptionText = [
      `Reception: ${data.receptionVenue}`,
      `${data.receptionDate} at ${data.receptionTime}`
    ];
    
    receptionText.forEach((line, index) => {
      ctx.fillText(
        line, 
        elements.receptionDetails.x, 
        elements.receptionDetails.y + index * 40
      );
    });

    // Draw contact info
    ctx.font = `${elements.contactInfo.fontSize}px ${elements.contactInfo.fontFamily}`;
    
    const contactText = [
      `Contact: ${data.contact1}`,
      data.address1
    ];
    
    contactText.forEach((line, index) => {
      ctx.fillText(
        line, 
        elements.contactInfo.x, 
        elements.contactInfo.y + index * 30
      );
    });
  }

  private async drawQRCode(
    ctx: CanvasRenderingContext2D,
    templateConfig: TemplateConfig,
    qrCodeBuffer: Buffer,
    position: string,
    size: string
  ) {
    const { elements } = templateConfig;
    const qrElement = elements.qrCode;
    
    // Calculate QR code size based on setting
    let qrSize = qrElement.size;
    switch (size) {
      case 'small': qrSize = qrElement.size * 0.7; break;
      case 'large': qrSize = qrElement.size * 1.3; break;
    }

    // Calculate position based on setting
    let x = qrElement.x;
    let y = qrElement.y;
    
    switch (position) {
      case 'bottom-corner':
        x = templateConfig.dimensions.width - qrSize - 40;
        y = templateConfig.dimensions.height - qrSize - 40;
        break;
      case 'custom':
        // Use default position
        break;
    }

    // Load QR code image
    const qrImage = await loadImage(qrCodeBuffer);
    ctx.drawImage(qrImage, x - qrSize/2, y - qrSize/2, qrSize, qrSize);

    // Add QR code label
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText('Scan for RSVP', x, y + qrSize/2 + 20);
  }

  private async convertToPDF(canvas: Canvas, templateConfig: TemplateConfig, data: EnhancedInvitationData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([templateConfig.dimensions.width, templateConfig.dimensions.height]);
    
    // Convert canvas to image
    const pngBuffer = canvas.toBuffer('image/png');
    const image = await pdfDoc.embedPng(pngBuffer);
    
    // Draw image on PDF page
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: templateConfig.dimensions.width,
      height: templateConfig.dimensions.height,
    });

    return Buffer.from(await pdfDoc.save());
  }

  private async generateSocialFormat(canvas: Canvas, width: number, height: number): Promise<Buffer> {
    const pngBuffer = canvas.toBuffer('image/png');
    return await sharp(pngBuffer)
      .resize(width, height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();
  }

  private async generateWhatsAppFormat(canvas: Canvas, width: number, height: number): Promise<Buffer> {
    const pngBuffer = canvas.toBuffer('image/png');
    return await sharp(pngBuffer)
      .resize(width, height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  async getInvitation(token: string, format: string = 'png'): Promise<{ buffer: Buffer; filename: string } | null> {
    const key = `${token}-${format}`;
    const invitation = this.invitationStore.get(key);
    
    if (!invitation || invitation.expiresAt < new Date()) {
      return null;
    }

    // Track download analytics
    await this.trackAnalytics(token, '', 'downloaded', format);

    return {
      buffer: invitation.buffer,
      filename: invitation.filename
    };
  }

  async getTemplates(): Promise<any[]> {
    try {
      const templates = await db.select().from(invitationTemplates).where(eq(invitationTemplates.isActive, true));
      return templates.map(template => ({
        ...template,
        config: TEMPLATE_CONFIGS[template.id] || null
      }));
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  private async trackAnalytics(
    invitationId: string, 
    templateId: string, 
    action: string, 
    format?: string
  ): Promise<void> {
    try {
      await db.insert(invitationAnalytics).values({
        invitationId,
        templateId,
        action,
        format,
        userAgent: 'server',
        ipAddress: '127.0.0.1'
      });
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  }

  private cleanupExpiredInvitations(): void {
    const now = new Date();
    const entries = Array.from(this.invitationStore.entries());
    
    for (const [key, data] of entries) {
      if (data.expiresAt < now) {
        this.invitationStore.delete(key);
      }
    }
  }
}

export const invitationService = EnhancedInvitationService.getInstance();
