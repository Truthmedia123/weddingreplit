import { createCanvas, loadImage } from 'canvas';
import crypto from 'crypto';

// Template definitions based on the provided wedding invitation designs
export const INVITATION_TEMPLATES = {
  'white-floral': {
    name: 'White Floral Elegance',
    description: 'Luxurious white background with pink and beige paper flowers framing elegant script typography',
    colors: {
      primary: '#B8860B', // Golden brown for accent text
      secondary: '#FFFFFF', // Pure white background
      text: '#2F2F2F', // Dark charcoal text
      accent: '#DDA0DD' // Soft plum for flowers
    },
    fonts: {
      title: 'Great Vibes, cursive',
      body: 'Playfair Display, serif'
    },
    layout: 'white-floral',
    customizable: ['primaryColor', 'floralColor', 'scriptFont'],
    thumbnail: 'white-floral-wedding-invitations-card-us-lega-design-template-09746b5c70be85388525b75e4824402f_screen_1753373016100.jpg'
  },
  'botanical-watercolor': {
    name: 'Botanical Watercolor',
    description: 'Soft watercolor foliage frame with natural green leaves and delicate branch details',
    colors: {
      primary: '#8B4513', // Brown for accent
      secondary: '#F8F8FF', // Ghost white background
      text: '#2F4F4F', // Dark slate gray
      accent: '#9ACD32' // Yellow green for leaves
    },
    fonts: {
      title: 'Dancing Script, cursive',
      body: 'Crimson Text, serif'
    },
    layout: 'botanical-watercolor',
    customizable: ['foliageColor', 'backgroundTint', 'scriptFont'],
    thumbnail: 'Untitled (2)_1753373016101.png'
  },
  'pink-modern': {
    name: 'Pink Modern Romance',
    description: 'Contemporary pink theme with illustrated couple and floral corner accents',
    colors: {
      primary: '#E91E63', // Bright pink
      secondary: '#FFFFFF', // White background
      text: '#2C3E50', // Dark blue gray
      accent: '#FFC0CB' // Light pink
    },
    fonts: {
      title: 'Montserrat, sans-serif',
      body: 'Open Sans, sans-serif'
    },
    layout: 'pink-modern',
    customizable: ['primaryColor', 'coupleIllustration', 'floralAccents'],
    thumbnail: 'Untitled-1_1753373016102.png'
  },
  'lavender-couple': {
    name: 'Lavender Couple Portrait',
    description: 'Soft lavender background with illustrated bride and groom silhouette and eucalyptus leaves',
    colors: {
      primary: '#FF7F50', // Coral for accent text
      secondary: '#E6E6FA', // Lavender background
      text: '#2F4F4F', // Dark slate gray
      accent: '#90EE90' // Light green for leaves
    },
    fonts: {
      title: 'Playfair Display, serif',
      body: 'Source Sans Pro, sans-serif'
    },
    layout: 'lavender-couple',
    customizable: ['backgroundColor', 'coupleColors', 'accentColor'],
    thumbnail: 'Untitled (1)_1753373016103.png'
  },
  'save-the-date-floral': {
    name: 'Save the Date Floral',
    description: 'Romantic pink hibiscus flowers with overlapping rings design and script typography',
    colors: {
      primary: '#DA70D6', // Orchid purple
      secondary: '#FFF8DC', // Cornsilk background
      text: '#696969', // Dim gray
      accent: '#FF69B4' // Hot pink for flowers
    },
    fonts: {
      title: 'Great Vibes, cursive',
      body: 'Lora, serif'
    },
    layout: 'save-the-date-floral',
    customizable: ['primaryColor', 'floralColor', 'ringColor'],
    thumbnail: 'Untitled_1753373016105.png'
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