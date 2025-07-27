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
    // Create canvas
    const canvas = createCanvas(1080, 1920);
    const ctx = canvas.getContext('2d');

    // Just create a simple white background for now to test
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1080, 1920);

    // Add a simple border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(100, 100, 880, 1720);

    // Simple text without complex fonts
    ctx.fillStyle = '#000000';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    
    // Just add the names for testing
    ctx.fillText(`${data.groomName} & ${data.brideName}`, 540, 500);
    ctx.fillText('Wedding Invitation', 540, 400);

    // Generate token
    const token = crypto.randomBytes(16).toString('hex');
    const filename = `invitation-${token}.png`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Convert to buffer
    const buffer = canvas.toBuffer('image/png');

    // Store
    invitationStore.set(token, { buffer, filename, expiresAt });

    return { token, filename, expiresAt };

  } catch (error) {
    console.error('Error:', error);
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