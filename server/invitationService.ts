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

  const canvas = createCanvas(800, 1200);
  const ctx = canvas.getContext('2d');

  // Template-specific rendering based on layout
  switch (template.layout) {
    case 'white-floral':
      return generateWhiteFloralInvitation(canvas, ctx, data, template);
    case 'botanical-watercolor':
      return generateBotanicalInvitation(canvas, ctx, data, template);
    case 'pink-modern':
      return generatePinkModernInvitation(canvas, ctx, data, template);
    case 'lavender-couple':
      return generateLavenderCoupleInvitation(canvas, ctx, data, template);
    case 'save-the-date-floral':
      return generateSaveTheDateInvitation(canvas, ctx, data, template);
    default:
      return generateGenericInvitation(canvas, ctx, data, template);
  }
}

// White Floral Elegance template - luxurious paper flower design
function generateWhiteFloralInvitation(canvas: any, ctx: any, data: InvitationData, template: any): Buffer {
  // Pure white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 800, 1200);

  // Add subtle paper texture effect
  ctx.fillStyle = '#F9F9F9';
  for (let i = 0; i < 50; i++) {
    ctx.fillRect(Math.random() * 800, Math.random() * 1200, 2, 2);
  }

  // Elegant frame with golden accents
  ctx.strokeStyle = template.colors.primary;
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 80, 680, 1040);

  // Inner decorative border
  ctx.strokeStyle = template.colors.accent;
  ctx.lineWidth = 1;
  ctx.strokeRect(80, 100, 640, 1000);

  // "TOGETHER WITH THEIR FAMILY" header
  ctx.fillStyle = template.colors.text;
  ctx.font = 'bold 18px serif';
  ctx.textAlign = 'center';
  ctx.fillText('TOGETHER WITH', 400, 180);
  ctx.fillText('THEIR FAMILY', 400, 205);

  // Main couple names in elegant script
  const names = data.coupleNames.split(/\s+(?:and|&)\s+/i);
  ctx.fillStyle = template.colors.primary;
  ctx.font = 'italic 68px serif';
  if (names.length >= 2) {
    ctx.fillText(names[0], 400, 320);
    ctx.font = 'italic 42px serif';
    ctx.fillText('&', 400, 380);
    ctx.font = 'italic 68px serif';
    ctx.fillText(names[1], 400, 450);
  } else {
    ctx.fillText(data.coupleNames, 400, 380);
  }

  // Invitation text box
  ctx.fillStyle = template.colors.text;
  ctx.strokeStyle = template.colors.text;
  ctx.lineWidth = 2;
  ctx.strokeRect(150, 520, 500, 80);
  
  ctx.font = 'bold 16px serif';
  ctx.fillText('INVITE YOU', 400, 545);
  ctx.fillText('TO THEIR WEDDING CELEBRATION', 400, 575);

  // Date and time with icon-style formatting
  ctx.fillStyle = template.colors.text;
  ctx.font = 'bold 32px serif';
  ctx.fillText(data.weddingDate, 400, 680);

  // Venue
  ctx.font = 'bold 24px serif';
  ctx.fillText(data.venue.toUpperCase(), 400, 750);

  // RSVP information
  ctx.font = '14px serif';
  ctx.fillText('PLEASE RSVP ONLINE AT', 400, 850);
  ctx.fillText('WWW.WEDDING.COM', 400, 875);

  return canvas.toBuffer('image/png');
}

// Botanical Watercolor template - natural green foliage frame
function generateBotanicalInvitation(canvas: any, ctx: any, data: InvitationData, template: any): Buffer {
  // Light background with watercolor effect
  const gradient = ctx.createLinearGradient(0, 0, 800, 1200);
  gradient.addColorStop(0, '#F8F8FF');
  gradient.addColorStop(1, '#F0F8F0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 1200);

  // Watercolor leaf border effects
  ctx.fillStyle = template.colors.accent;
  ctx.globalAlpha = 0.3;
  
  // Top left foliage
  ctx.beginPath();
  ctx.ellipse(100, 150, 80, 40, Math.PI / 4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.ellipse(150, 120, 60, 30, -Math.PI / 6, 0, 2 * Math.PI);
  ctx.fill();
  
  // Top right foliage
  ctx.ellipse(700, 150, 80, 40, -Math.PI / 4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.ellipse(650, 120, 60, 30, Math.PI / 6, 0, 2 * Math.PI);
  ctx.fill();

  // Bottom decorative leaves
  ctx.ellipse(150, 1050, 70, 35, Math.PI / 3, 0, 2 * Math.PI);
  ctx.fill();
  ctx.ellipse(650, 1050, 70, 35, -Math.PI / 3, 0, 2 * Math.PI);
  ctx.fill();

  ctx.globalAlpha = 1.0;

  // Main text content
  ctx.fillStyle = template.colors.text;
  ctx.font = 'italic 20px serif';
  ctx.textAlign = 'center';
  ctx.fillText('TOGETHER', 400, 250);
  ctx.fillText('WITH THEIR FAMILIES', 400, 280);

  // Couple names in elegant script
  const names = data.coupleNames.split(/\s+(?:and|&)\s+/i);
  ctx.fillStyle = template.colors.primary;
  ctx.font = 'italic 58px serif';
  if (names.length >= 2) {
    ctx.fillText(names[0], 400, 400);
    // Heart symbol
    ctx.fillStyle = template.colors.accent;
    ctx.font = '32px serif';
    ctx.fillText('♥', 400, 450);
    ctx.fillStyle = template.colors.primary;
    ctx.font = 'italic 58px serif';
    ctx.fillText(names[1], 400, 520);
  } else {
    ctx.fillText(data.coupleNames, 400, 450);
  }

  // Invitation text
  ctx.fillStyle = template.colors.text;
  ctx.font = 'italic 18px serif';
  ctx.fillText('we invite you to join our wedding', 400, 620);

  // Date styling
  ctx.font = 'bold 36px serif';
  const dateParts = data.weddingDate.split(' ');
  if (dateParts.length >= 3) {
    ctx.fillText(dateParts.slice(0, 2).join(' '), 400, 720);
    ctx.fillText(dateParts[2], 400, 760);
  } else {
    ctx.fillText(data.weddingDate, 400, 740);
  }

  // Time and venue
  ctx.font = 'italic 20px serif';
  ctx.fillText('ONE O\'CLOCK IN THE AFTERNOON', 400, 820);
  ctx.font = 'bold 18px serif';
  ctx.fillText(`Venue: ${data.venue}`, 400, 880);

  return canvas.toBuffer('image/png');
}

// Pink Modern Romance template - contemporary with couple illustration
function generatePinkModernInvitation(canvas: any, ctx: any, data: InvitationData, template: any): Buffer {
  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 800, 1200);

  // Pink border frame
  ctx.strokeStyle = template.colors.primary;
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, 720, 1120);

  // "Invitation" header in large pink text
  ctx.fillStyle = template.colors.primary;
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Invitation', 400, 180);

  // Decorative heart divider
  ctx.fillStyle = template.colors.primary;
  ctx.font = '24px serif';
  ctx.fillText('>>> ♥ <<<', 400, 220);

  // Couple names
  const names = data.coupleNames.split(/\s+(?:and|&)\s+/i);
  ctx.fillStyle = template.colors.text;
  ctx.font = 'bold 42px sans-serif';
  if (names.length >= 2) {
    ctx.fillText(names[0], 320, 320);
    ctx.fillStyle = template.colors.primary;
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('&', 400, 320);
    ctx.fillStyle = template.colors.text;
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(names[1], 480, 320);
  } else {
    ctx.fillText(data.coupleNames, 400, 320);
  }

  // Date styling
  ctx.fillStyle = template.colors.text;
  ctx.font = '20px sans-serif';
  ctx.fillText(data.weddingDate, 400, 420);

  // Simple couple illustration placeholder
  ctx.fillStyle = template.colors.accent;
  ctx.beginPath();
  ctx.arc(350, 550, 40, 0, 2 * Math.PI); // Bride
  ctx.arc(450, 550, 40, 0, 2 * Math.PI); // Groom
  ctx.fill();

  // Wedding dress and suit representation
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(330, 580, 40, 80); // Dress
  ctx.fillStyle = template.colors.text;
  ctx.fillRect(430, 580, 40, 80); // Suit

  // Venue and details
  ctx.fillStyle = template.colors.text;
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(data.venue, 400, 750);

  // Decorative flowers at bottom
  ctx.fillStyle = template.colors.primary;
  ctx.beginPath();
  ctx.arc(150, 1000, 25, 0, 2 * Math.PI);
  ctx.arc(200, 1020, 20, 0, 2 * Math.PI);
  ctx.arc(600, 1020, 20, 0, 2 * Math.PI);
  ctx.arc(650, 1000, 25, 0, 2 * Math.PI);
  ctx.fill();

  return canvas.toBuffer('image/png');
}

// Lavender Couple Portrait template - soft background with couple silhouette
function generateLavenderCoupleInvitation(canvas: any, ctx: any, data: InvitationData, template: any): Buffer {
  // Lavender gradient background
  const gradient = ctx.createLinearGradient(0, 0, 800, 1200);
  gradient.addColorStop(0, '#E6E6FA');
  gradient.addColorStop(1, '#D8BFD8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 1200);

  // Decorative eucalyptus leaves
  ctx.fillStyle = template.colors.accent;
  ctx.globalAlpha = 0.4;
  
  // Top corners
  ctx.beginPath();
  ctx.ellipse(100, 100, 60, 20, Math.PI / 4, 0, 2 * Math.PI);
  ctx.ellipse(700, 100, 60, 20, -Math.PI / 4, 0, 2 * Math.PI);
  ctx.fill();

  ctx.globalAlpha = 1.0;

  // "SAVE THE DATE FOR" header
  ctx.fillStyle = template.colors.text;
  ctx.font = 'bold 20px serif';
  ctx.textAlign = 'center';
  ctx.fillText('SAVE THE DATE FOR', 400, 200);
  ctx.fillText('THE WEDDING OF', 400, 230);

  // Couple names in elegant style
  const names = data.coupleNames.split(/\s+(?:and|&)\s+/i);
  ctx.fillStyle = template.colors.primary;
  ctx.font = 'bold 52px serif';
  if (names.length >= 2) {
    ctx.fillText(names[0].toUpperCase(), 400, 350);
    ctx.font = 'bold 32px serif';
    ctx.fillText('&', 400, 400);
    ctx.font = 'bold 52px serif';
    ctx.fillText(names[1].toUpperCase(), 400, 450);
  } else {
    ctx.fillText(data.coupleNames.toUpperCase(), 400, 400);
  }

  // Couple silhouette representation
  ctx.fillStyle = template.colors.text;
  // Bride silhouette
  ctx.beginPath();
  ctx.arc(350, 600, 30, 0, 2 * Math.PI); // Head
  ctx.fill();
  ctx.fillRect(320, 620, 60, 100); // Dress
  
  // Groom silhouette  
  ctx.beginPath();
  ctx.arc(450, 600, 30, 0, 2 * Math.PI); // Head
  ctx.fill();
  ctx.fillRect(430, 620, 40, 100); // Suit

  // Wedding details
  ctx.fillStyle = template.colors.text;
  ctx.font = 'italic 18px serif';
  ctx.fillText('Join us for an evening of celebration, architecture,', 400, 800);
  ctx.fillText('and connections, followed by high tea and a guided', 400, 825);
  ctx.fillText('site walkthrough.', 400, 850);

  // Date and venue
  ctx.fillStyle = template.colors.primary;
  ctx.font = 'bold 28px serif';
  ctx.fillText(data.weddingDate.toUpperCase(), 400, 920);
  ctx.fillText(data.venue.toUpperCase(), 400, 960);

  // Family signature
  ctx.fillStyle = template.colors.text;
  ctx.font = 'italic 16px serif';
  ctx.fillText('Warm regards,', 400, 1020);
  ctx.fillText(`${names.length >= 2 ? names[0] : 'Wedding'} Family`, 400, 1045);

  return canvas.toBuffer('image/png');
}

// Save the Date Floral template - romantic pink hibiscus design
function generateSaveTheDateInvitation(canvas: any, ctx: any, data: InvitationData, template: any): Buffer {
  // Cream background
  ctx.fillStyle = template.colors.secondary;
  ctx.fillRect(0, 0, 800, 1200);

  // Corner hibiscus flowers
  ctx.fillStyle = template.colors.accent;
  ctx.globalAlpha = 0.6;
  
  // Top right flowers
  ctx.beginPath();
  ctx.arc(700, 150, 40, 0, 2 * Math.PI);
  ctx.arc(650, 120, 30, 0, 2 * Math.PI);
  ctx.arc(720, 100, 25, 0, 2 * Math.PI);
  ctx.fill();

  // Bottom left flowers
  ctx.beginPath();
  ctx.arc(100, 1050, 40, 0, 2 * Math.PI);
  ctx.arc(150, 1080, 30, 0, 2 * Math.PI);
  ctx.arc(80, 1100, 25, 0, 2 * Math.PI);
  ctx.fill();

  ctx.globalAlpha = 1.0;

  // "Save the Date" header
  ctx.fillStyle = template.colors.primary;
  ctx.font = 'italic 52px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Save the Date', 400, 250);

  // Romantic subtitle
  ctx.fillStyle = template.colors.text;
  ctx.font = 'italic 18px serif';
  ctx.fillText('He proposed! She said Yes!', 400, 320);
  ctx.fillText('and now', 400, 350);

  // Interlocked rings design
  ctx.strokeStyle = template.colors.primary;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(350, 450, 50, 0, 2 * Math.PI);
  ctx.arc(450, 450, 50, 0, 2 * Math.PI);
  ctx.stroke();

  // Couple initials in rings
  const names = data.coupleNames.split(/\s+(?:and|&)\s+/i);
  ctx.fillStyle = template.colors.primary;
  ctx.font = 'bold 36px serif';
  if (names.length >= 2) {
    ctx.fillText(names[0].charAt(0), 350, 465);
    ctx.fillText(names[1].charAt(0), 450, 465);
  }

  // Full names below rings
  ctx.fillStyle = template.colors.primary;
  ctx.font = 'italic 42px serif';
  if (names.length >= 2) {
    ctx.fillText(`${names[0]} and ${names[1]}`, 400, 580);
  } else {
    ctx.fillText(data.coupleNames, 400, 580);
  }

  // "are hitched!" text
  ctx.fillStyle = template.colors.text;
  ctx.font = 'italic 20px serif';
  ctx.fillText('are hitched!', 400, 620);

  // Wedding details
  ctx.fillStyle = template.colors.text;
  ctx.font = 'italic 18px serif';
  ctx.fillText('Join us for a day of love and celebration', 400, 720);

  // Date styling
  ctx.fillStyle = template.colors.primary;
  ctx.font = 'bold 38px serif';
  const dateParts = data.weddingDate.split(' ');
  if (dateParts.length >= 3) {
    ctx.fillText(dateParts[0], 300, 820);
    ctx.fillText(dateParts[1], 400, 820);
    ctx.fillText(dateParts[2], 500, 820);
  } else {
    ctx.fillText(data.weddingDate, 400, 820);
  }

  // Venue
  ctx.fillStyle = template.colors.text;
  ctx.font = 'bold 22px serif';
  ctx.fillText(data.venue, 400, 880);

  return canvas.toBuffer('image/png');
}

// Fallback generic template
function generateGenericInvitation(canvas: any, ctx: any, data: InvitationData, template: any): Buffer {
  // Simple background
  ctx.fillStyle = template.colors.secondary;
  ctx.fillRect(0, 0, 800, 1200);

  // Basic border
  ctx.strokeStyle = template.colors.primary;
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, 720, 1120);

  // Basic text layout
  ctx.fillStyle = template.colors.text;
  ctx.font = '24px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Wedding Invitation', 400, 200);
  
  ctx.font = 'bold 48px serif';
  ctx.fillText(data.coupleNames, 400, 350);
  
  ctx.font = '32px serif';
  ctx.fillText(data.weddingDate, 400, 500);
  ctx.fillText(data.venue, 400, 600);

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