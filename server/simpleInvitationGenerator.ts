import { createCanvas, loadImage } from 'canvas';
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

const invitationStore = new Map<string, { buffer: Buffer; filename: string; expiresAt: Date }>();

export async function generateInvitation(data: InvitationData): Promise<GeneratedInvitation> {
  try {
    // Create canvas matching the template size
    const canvas = createCanvas(800, 1200);
    const ctx = canvas.getContext('2d');

    // Load the beautiful floral template
    let templateLoaded = false;
    try {
      const templatePath = path.resolve(process.cwd(), 'attached_assets', 'Blank Template_1753690165955.png');
      console.log('[INVITATION] Loading template from:', templatePath);
      
      const template = await loadImage(templatePath);
      console.log('[INVITATION] Template loaded, size:', template.width, 'x', template.height);

      // Draw the template to fit canvas
      ctx.drawImage(template, 0, 0, 800, 1200);
      templateLoaded = true;
      console.log('[INVITATION] Template drawn successfully');
    } catch (error) {
      console.error('[INVITATION] Template loading failed:', error);
      // Fallback to cream background with decorative border
      ctx.fillStyle = '#fef9f3';
      ctx.fillRect(0, 0, 800, 1200);
      
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(80, 80);
      ctx.lineTo(720, 80);
      ctx.lineTo(720, 1120);
      ctx.lineTo(80, 1120);
      ctx.closePath();
      ctx.stroke();
    }

    // Set text properties
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Bible verse at top (moved down to avoid floral overlap)
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'italic 18px "Times New Roman", serif';
    ctx.fillText(`"${data.bibleVerse}"`, 400, 280);
    
    // Bible reference 
    ctx.font = 'italic 16px "Times New Roman", serif';
    ctx.fillText(`- ${data.bibleReference}`, 400, 305);

    // "We," section
    ctx.font = 'italic 24px "Times New Roman", serif';
    ctx.fillText('We,', 400, 360);

    // Names in beautiful script style (matching demo)
    ctx.font = 'italic 48px "Times New Roman", serif';
    ctx.fillStyle = '#1e40af'; // Blue color
    ctx.fillText(data.groomName, 280, 420);
    
    ctx.font = '32px "Times New Roman", serif';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('&', 400, 420);
    
    ctx.font = 'italic 48px "Times New Roman", serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText(data.brideName, 520, 420);

    // Parent details
    ctx.font = '16px "Times New Roman", serif';
    ctx.fillStyle = '#4a5568';
    ctx.fillText(`(s/o Mr. ${data.groomFatherName}`, 280, 455);
    ctx.fillText(`& Mrs. ${data.groomMotherName})`, 280, 475);
    
    ctx.fillText(`(d/o Mr. ${data.brideFatherName}`, 520, 455);
    ctx.fillText(`& Mrs. ${data.brideMotherName})`, 520, 475);

    // Main invitation text
    ctx.font = '18px "Times New Roman", serif';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'center';
    ctx.fillText('Together with our parents', 400, 530);
    ctx.fillText('cordially invite you & your family', 400, 555);
    ctx.fillText('to witness the most memorable event of our lives', 400, 580);
    ctx.fillText('as we exchange our marriage vows to pledge our love to each other', 400, 605);

    // Ceremony details
    ctx.font = '20px "Times New Roman", serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText(`at ${data.ceremonyVenue}, on ${data.ceremonyDay},`, 400, 660);
    
    // Date and time in larger text
    ctx.font = 'bold 22px "Times New Roman", serif';
    ctx.fillText(`${data.ceremonyDate} at ${data.ceremonyTime}`, 400, 690);

    // Reception details
    ctx.font = '18px "Times New Roman", serif';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('And thereafter to join us for our celebration', 400, 730);
    
    ctx.font = '20px "Times New Roman", serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText(`at ${data.receptionVenue} at ${data.receptionTime} sharp`, 400, 760);

    // Contact information (moved up slightly to maintain balance)
    ctx.font = '16px "Times New Roman", serif';
    ctx.fillStyle = '#4a5568';
    ctx.textAlign = 'left';
    ctx.fillText(data.address1, 100, 1020);
    ctx.fillText(data.location1, 100, 1040);
    ctx.fillText(`Mob.: ${data.contact1}`, 100, 1060);

    ctx.textAlign = 'right';
    ctx.fillText(data.address2, 700, 1020);
    ctx.fillText(data.location2, 700, 1040);
    ctx.fillText(`Mob.: ${data.contact2}`, 700, 1060);

    // Final blessing
    ctx.textAlign = 'center';
    ctx.font = 'italic 20px "Times New Roman", serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText('Your presence is our blessing', 400, 1100);

    // Generate token and filename
    const token = crypto.randomBytes(16).toString('hex');
    const filename = `invitation-${data.groomName.toLowerCase().replace(/\s+/g, '-')}-${data.brideName.toLowerCase().replace(/\s+/g, '-')}.png`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Convert to buffer
    const buffer = canvas.toBuffer('image/png');

    // Store in memory
    invitationStore.set(token, { buffer, filename, expiresAt });

    console.log(`[INVITATION] Generated invitation for ${data.groomName} & ${data.brideName}`);
    return { token, filename, expiresAt };

  } catch (error) {
    console.error('[INVITATION] Generation error:', error);
    throw error;
  }
}

export function getInvitation(token: string): { buffer: Buffer; filename: string } | null {
  const data = invitationStore.get(token);
  if (!data || data.expiresAt < new Date()) {
    invitationStore.delete(token);
    return null;
  }
  
  invitationStore.delete(token);
  return { buffer: data.buffer, filename: data.filename };
}