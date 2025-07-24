import { createCanvas, loadImage } from 'canvas';
import crypto from 'crypto';

// Template definitions with elegant wedding designs
export const INVITATION_TEMPLATES = {
  'classic-gold': {
    name: 'Classic Gold',
    colors: {
      primary: '#D4AF37',
      secondary: '#FFFFFF',
      text: '#2C3E50',
      accent: '#F8F9FA'
    },
    fonts: {
      title: 'serif',
      body: 'sans-serif'
    },
    layout: 'centered'
  },
  'romantic-rose': {
    name: 'Romantic Rose',
    colors: {
      primary: '#E8B4B8',
      secondary: '#FFFFFF',
      text: '#4A4A4A',
      accent: '#F5F5F5'
    },
    fonts: {
      title: 'serif',
      body: 'sans-serif'
    },
    layout: 'centered'
  },
  'beach-coral': {
    name: 'Beach Coral',
    colors: {
      primary: '#FF7F7F',
      secondary: '#87CEEB',
      text: '#2F4F4F',
      accent: '#F0F8FF'
    },
    fonts: {
      title: 'serif',
      body: 'sans-serif'
    },
    layout: 'centered'
  },
  'elegant-navy': {
    name: 'Elegant Navy',
    colors: {
      primary: '#191970',
      secondary: '#FFFFFF',
      text: '#2F4F4F',
      accent: '#F8F8FF'
    },
    fonts: {
      title: 'serif',
      body: 'sans-serif'
    },
    layout: 'centered'
  },
  'vintage-cream': {
    name: 'Vintage Cream',
    colors: {
      primary: '#DEB887',
      secondary: '#FFFDD0',
      text: '#8B4513',
      accent: '#FFF8DC'
    },
    fonts: {
      title: 'serif',
      body: 'sans-serif'
    },
    layout: 'centered'
  }
};

export interface InvitationData {
  templateId: string;
  coupleNames: string;
  weddingDate: string;
  venue: string;
  message?: string;
  customization?: {
    primaryColor?: string;
    textColor?: string;
    font?: string;
  };
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function generateInvitationImage(data: InvitationData): Promise<Buffer> {
  const template = INVITATION_TEMPLATES[data.templateId as keyof typeof INVITATION_TEMPLATES];
  if (!template) {
    throw new Error('Invalid template ID');
  }

  // Create canvas with high resolution for print quality
  const width = 800;
  const height = 1200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Apply customization colors if provided
  const colors = {
    ...template.colors,
    ...data.customization
  };

  // Background with gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, colors.accent);
  gradient.addColorStop(1, colors.secondary);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Inner border
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, width - 120, height - 120);

  // Text styling
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.text;

  // Top decorative text
  ctx.font = 'italic 24px serif';
  ctx.fillText('Together with our families', width / 2, 150);

  // Couple names
  ctx.font = 'bold 48px serif';
  const names = data.coupleNames.split(' & ');
  if (names.length === 2) {
    ctx.fillText(names[0], width / 2, 220);
    
    // Decorative ampersand
    ctx.font = 'italic 36px serif';
    ctx.fillStyle = colors.primary;
    ctx.fillText('&', width / 2, 270);
    
    ctx.font = 'bold 48px serif';
    ctx.fillStyle = colors.text;
    ctx.fillText(names[1], width / 2, 320);
  } else {
    ctx.fillText(data.coupleNames, width / 2, 270);
  }

  // Wedding announcement
  ctx.font = 'italic 28px serif';
  ctx.fillText('request the pleasure of your company', width / 2, 400);
  ctx.fillText('at their wedding celebration', width / 2, 440);

  // Date
  ctx.font = 'bold 32px serif';
  ctx.fillStyle = colors.primary;
  ctx.fillText(data.weddingDate, width / 2, 520);

  // Venue
  ctx.font = '24px sans-serif';
  ctx.fillStyle = colors.text;
  ctx.fillText('at', width / 2, 580);
  
  ctx.font = 'bold 28px sans-serif';
  // Handle long venue names by wrapping text
  const venueWords = data.venue.split(' ');
  let venueLine1 = '';
  let venueLine2 = '';
  let currentWidth = 0;
  const maxWidth = width - 160;
  
  for (const word of venueWords) {
    const testWidth = ctx.measureText(venueLine1 + ' ' + word).width;
    if (testWidth > maxWidth && venueLine1) {
      venueLine2 = venueWords.slice(venueWords.indexOf(word)).join(' ');
      break;
    }
    venueLine1 += (venueLine1 ? ' ' : '') + word;
  }
  
  ctx.fillText(venueLine1, width / 2, 620);
  if (venueLine2) {
    ctx.fillText(venueLine2, width / 2, 660);
  }

  // Custom message if provided
  if (data.message) {
    ctx.font = 'italic 20px sans-serif';
    ctx.fillStyle = colors.text;
    const messageY = venueLine2 ? 720 : 700;
    
    // Wrap message text
    const words = data.message.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + word + ' ';
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine.trim());
    
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, messageY + (index * 30));
    });
  }

  // Decorative elements
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 2;
  
  // Top decorative line
  ctx.beginPath();
  ctx.moveTo(width / 2 - 100, 180);
  ctx.lineTo(width / 2 + 100, 180);
  ctx.stroke();
  
  // Bottom decorative line
  const bottomY = data.message ? 900 : 800;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 100, bottomY);
  ctx.lineTo(width / 2 + 100, bottomY);
  ctx.stroke();

  // Small decorative hearts
  ctx.fillStyle = colors.primary;
  ctx.font = '20px serif';
  ctx.fillText('♥', width / 2 - 120, 185);
  ctx.fillText('♥', width / 2 + 120, 185);
  ctx.fillText('♥', width / 2 - 120, bottomY + 5);
  ctx.fillText('♥', width / 2 + 120, bottomY + 5);

  return canvas.toBuffer('image/png');
}

export function isTokenExpired(createdAt: Date, expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function generateExpiryDate(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 24 hours from now
  return expiry;
}