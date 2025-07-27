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
    // Create high-resolution canvas (1080x1920px for WhatsApp stories)
    const canvas = createCanvas(1080, 1920);
    const ctx = canvas.getContext('2d');

    // Load your blank template
    try {
      const templatePath = path.join(process.cwd(), 'attached_assets', 'image_1753434868813.png');
      const template = await loadImage(templatePath);

      // Draw your template exactly as it is
      ctx.drawImage(template, 0, 0, 1080, 1920);
      console.log('Successfully loaded your blank template');
    } catch (error) {
      console.log('Template not found, using white background');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1080, 1920);
    }

    // Set text properties
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#2c3e50';

    // Bible verse at top
    ctx.font = 'italic 24px serif';
    ctx.fillText(`"${data.bibleVerse}"`, 540, 300);
    ctx.font = '20px serif';
    ctx.fillText(`- ${data.bibleReference}`, 540, 340);

    // "We," section
    ctx.font = 'italic 28px serif';
    ctx.fillText('We,', 540, 420);

    // Names
    ctx.font = 'bold 40px serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText(`${data.groomName} & ${data.brideName}`, 540, 500);

    // Parent details
    ctx.font = '18px serif';
    ctx.fillStyle = '#4a5568';
    ctx.fillText(`(s/o ${data.groomFatherName} & ${data.groomMotherName})`, 540, 540);
    ctx.fillText(`(d/o ${data.brideFatherName} & ${data.brideMotherName})`, 540, 570);

    // Main invitation text
    ctx.font = '22px serif';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('Together with our parents', 540, 650);
    ctx.fillText('cordially invite you & your family', 540, 680);
    ctx.fillText('to witness the most memorable event of our lives', 540, 710);
    ctx.fillText('as we exchange our marriage vows to pledge our love to each other', 540, 740);

    // Ceremony details
    ctx.font = '24px serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText(`at ${data.ceremonyVenue}`, 540, 820);
    ctx.fillText(`on ${data.ceremonyDay}, ${data.ceremonyDate} at ${data.ceremonyTime}`, 540, 860);

    // Reception details
    ctx.font = '22px serif';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('And thereafter to join us for our celebration', 540, 940);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText(`at ${data.receptionVenue} at ${data.receptionTime} sharp`, 540, 980);

    // Contact information
    ctx.font = '18px serif';
    ctx.fillStyle = '#4a5568';
    ctx.textAlign = 'left';
    ctx.fillText(data.address1, 150, 1100);
    ctx.fillText(data.location1, 150, 1130);
    ctx.fillText(`Mob.: ${data.contact1}`, 150, 1160);

    ctx.textAlign = 'right';
    ctx.fillText(data.address2, 930, 1100);
    ctx.fillText(data.location2, 930, 1130);
    ctx.fillText(`Mob.: ${data.contact2}`, 930, 1160);

    // Final blessing
    ctx.textAlign = 'center';
    ctx.font = 'italic 24px serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText('Your presence is our blessing', 540, 1250);

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