import { createCanvas, loadImage } from 'canvas';
import crypto from 'crypto';

// No templates available - template system disabled
export const INVITATION_TEMPLATES = {};

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
  throw new Error('Invitation generation service is currently disabled');
}

export function isTokenExpired(createdAt: Date, expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function generateExpiryDate(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 24 hours from now
  return expiry;
}