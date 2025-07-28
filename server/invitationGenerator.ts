import { createCanvas, loadImage, Canvas } from 'canvas';
import path from 'path';
import crypto from 'crypto';

export interface InvitationData {
  bibleVerse: string;
  bibleReference: string;
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
  receptionVenue: string;
  receptionTime: string;
  address1: string;
  location1: string;
  contact1: string;
  address2: string;
  location2: string;
  contact2: string;
}

export interface GeneratedInvitation {
  token: string;
  filename: string;
  expiresAt: Date;
}

// Store generated invitations temporarily
const invitationStore = new Map<string, { buffer: Buffer; filename: string; expiresAt: Date }>();

// Clean up expired invitations every hour
setInterval(() => {
  const now = new Date();
  const entries = Array.from(invitationStore.entries());
  for (const [token, data] of entries) {
    if (data.expiresAt < now) {
      invitationStore.delete(token);
    }
  }
}, 60 * 60 * 1000);

export async function generateInvitation(data: InvitationData): Promise<GeneratedInvitation> {
  try {
    // Create canvas matching the template size (standard invitation size)
    const canvas = createCanvas(800, 1200);
    const ctx = canvas.getContext('2d');

    // Load the blank template
    let templateLoaded = false;
    try {
      const templatePath = path.resolve(process.cwd(), 'attached_assets', 'Blank Template_1753690165955.png');
      console.log('[INVITATION] Attempting to load template from:', templatePath);
      
      // Check if file exists first
      const fs = await import('fs');
      if (!fs.existsSync(templatePath)) {
        throw new Error('Template file does not exist');
      }
      
      const template = await loadImage(templatePath);
      console.log('[INVITATION] Template loaded successfully, dimensions:', template.width, 'x', template.height);

      // Draw the blank template - scale to fit canvas while maintaining aspect ratio
      const aspectRatio = template.width / template.height;
      let drawWidth = 800;
      let drawHeight = 1200;
      
      if (aspectRatio > 800/1200) {
        drawHeight = 800 / aspectRatio;
      } else {
        drawWidth = 1200 * aspectRatio;
      }
      
      const x = (800 - drawWidth) / 2;
      const y = (1200 - drawHeight) / 2;
      
      ctx.drawImage(template, x, y, drawWidth, drawHeight);
      templateLoaded = true;
      console.log('[INVITATION] Successfully loaded and drew floral template');
    } catch (error) {
      console.error('Template loading error:', error);
      console.log('Creating fallback background with floral border design');
      
      // Create a soft cream background
      ctx.fillStyle = '#fef9f3';
      ctx.fillRect(0, 0, 800, 1200);
      
      // Add a decorative border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      
      // Draw geometric border similar to the template
      ctx.beginPath();
      ctx.moveTo(80, 80);
      ctx.lineTo(720, 80);
      ctx.lineTo(720, 1120);
      ctx.lineTo(80, 1120);
      ctx.closePath();
      ctx.stroke();
    }

    // Set default text properties
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Bible verse at top (italic, elegant style matching demo)
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'italic 18px "Times New Roman", serif';
    ctx.fillText(`"${data.bibleVerse}"`, 400, 240);
    
    // Bible reference (smaller, matching demo style)  
    ctx.font = 'italic 16px "Times New Roman", serif';
    ctx.fillText(`- ${data.bibleReference}`, 400, 265);

    // "We," section (matching demo positioning)
    ctx.font = 'italic 24px "Times New Roman", serif';
    ctx.fillText('We,', 400, 320);

    // Names in beautiful script style (matching demo)
    ctx.font = 'italic 48px "Times New Roman", serif';
    ctx.fillStyle = '#1e40af'; // Blue color matching demo
    ctx.fillText(data.groomName, 280, 380);
    
    ctx.font = '32px "Times New Roman", serif';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('&', 400, 380);
    
    ctx.font = 'italic 48px "Times New Roman", serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText(data.brideName, 520, 380);

    // Parent details (matching demo format)
    ctx.font = '16px "Times New Roman", serif';
    ctx.fillStyle = '#4a5568';
    ctx.fillText(`(s/o Mr. ${data.groomFatherName}`, 280, 415);
    ctx.fillText(`& Mrs. ${data.groomMotherName})`, 280, 435);
    
    ctx.fillText(`(d/o Mr. ${data.brideFatherName}`, 520, 415);
    ctx.fillText(`& Mrs. ${data.brideMotherName})`, 520, 435);

    // Main invitation text (matching demo)
    ctx.font = '18px "Times New Roman", serif';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'center';
    ctx.fillText('Together with our parents', 400, 490);
    ctx.fillText('cordially invite you & your family', 400, 515);
    ctx.fillText('to witness the most memorable event of our lives', 400, 540);
    ctx.fillText('as we exchange our marriage vows to pledge our love to each other', 400, 565);

    // Ceremony details (matching demo layout)
    ctx.font = '20px "Times New Roman", serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText(`at ${data.ceremonyVenue}, on ${data.ceremonyDay},`, 400, 620);
    
    // Date and time in larger text
    ctx.font = 'bold 22px "Times New Roman", serif';
    ctx.fillText(`${data.ceremonyDate} at ${data.ceremonyTime}`, 400, 650);

    // Reception details
    ctx.font = '18px "Times New Roman", serif';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('And thereafter to join us for our celebration', 400, 690);
    
    ctx.font = '20px "Times New Roman", serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText(`at ${data.receptionVenue} at ${data.receptionTime} sharp`, 400, 720);

    // Contact information (matching demo layout)
    ctx.font = '16px "Times New Roman", serif';
    ctx.fillStyle = '#4a5568';
    ctx.textAlign = 'left';
    ctx.fillText(data.address1, 100, 1050);
    ctx.fillText(data.location1, 100, 1070);
    ctx.fillText(`Mob.: ${data.contact1}`, 100, 1090);

    ctx.textAlign = 'right';
    ctx.fillText(data.address2, 700, 1050);
    ctx.fillText(data.location2, 700, 1070);
    ctx.fillText(`Mob.: ${data.contact2}`, 700, 1090);

    // Final blessing (matching demo)
    ctx.textAlign = 'center';
    ctx.font = 'italic 20px "Times New Roman", serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText('Your presence is our blessing', 400, 1130);

    // Generate unique token and filename
    const token = crypto.randomBytes(32).toString('hex');
    const filename = `wedding-invitation-${data.groomName.toLowerCase().replace(/\s+/g, '-')}-${data.brideName.toLowerCase().replace(/\s+/g, '-')}.png`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Convert to buffer
    const buffer = canvas.toBuffer('image/png');

    // Store in memory
    invitationStore.set(token, { buffer, filename, expiresAt });

    console.log(`Generated invitation for ${data.groomName} & ${data.brideName}`);
    return { token, filename, expiresAt };

  } catch (error) {
    console.error('Error generating invitation:', error);
    throw new Error('Failed to generate invitation: ' + (error as Error).message);
  }
}

export function getInvitation(token: string): { buffer: Buffer; filename: string } | null {
  const data = invitationStore.get(token);
  if (!data || data.expiresAt < new Date()) {
    invitationStore.delete(token);
    return null;
  }

  // Delete after retrieval (one-time download)
  invitationStore.delete(token);
  return { buffer: data.buffer, filename: data.filename };
}