import { PDFDocument, PDFForm, rgb } from 'pdf-lib';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';
import { db } from './db';
import { invitationTokens, invitationTemplates } from '@shared/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'wedding-invitation-secret-key';
const TEMP_DIR = path.join(process.cwd(), 'temp');

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.access(TEMP_DIR);
  } catch {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }
}

interface InvitationData {
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  time?: string;
  familyMessage?: string;
  coupleMessage?: string;
}

export async function generateInvitationPDF(
  templateId: string,
  invitationData: InvitationData
): Promise<{ downloadToken: string; expiresIn: number }> {
  console.log('Starting PDF generation for template:', templateId);
  await ensureTempDir();

  // Get template from database
  console.log('Querying database for template...');
  const [template] = await db
    .select()
    .from(invitationTemplates)
    .where(eq(invitationTemplates.slug, templateId))
    .limit(1);

  if (!template) {
    console.error('Template not found in database:', templateId);
    throw new Error('Template not found');
  }
  
  console.log('Found template:', template.name, 'File:', template.pdfFilename);

  // Read the PDF template file
  console.log('Reading PDF file...');
  const templatePath = path.join(process.cwd(), 'attached_assets', template.pdfFilename);
  const pdfBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Add text overlay to PDF (since templates don't have form fields)
  console.log('Adding text overlay to PDF...');
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();
  console.log('PDF dimensions:', width, 'x', height);

  // Add text overlay
  const fontSize = 14;
  const lineHeight = 20;
  let yPosition = height - 150;

  // Add couple names
  const coupleText = `${invitationData.brideName} & ${invitationData.groomName}`;
  firstPage.drawText(coupleText, {
    x: 50,
    y: yPosition,
    size: fontSize + 2,
    color: rgb(0, 0, 0),
  });
  yPosition -= lineHeight * 2;

  // Add wedding date
  firstPage.drawText(`Date: ${invitationData.weddingDate}`, {
    x: 50,
    y: yPosition,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;

  // Add venue
  firstPage.drawText(`Venue: ${invitationData.venue}`, {
    x: 50,
    y: yPosition,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;

  // Add time if provided
  if (invitationData.time) {
    firstPage.drawText(`Time: ${invitationData.time}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;
  }

  console.log('Text overlay completed.');

  // Generate a short unique ID for the PDF filename
  const shortId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const pdfFilename = `invitation_${shortId}.pdf`;

  // Generate download token
  const downloadToken = jwt.sign(
    { 
      templateId, 
      timestamp: Date.now(),
      brideName: invitationData.brideName,
      groomName: invitationData.groomName,
      shortId
    },
    JWT_SECRET,
    { expiresIn: '5m' }
  );

  // Save the PDF temporarily
  const filledPdfBytes = await pdfDoc.save();
  const tempFilePath = path.join(TEMP_DIR, pdfFilename);
  await fs.writeFile(tempFilePath, filledPdfBytes);

  // Save invitation record to database with PDF filename
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await db.insert(invitationTokens).values({
    token: downloadToken,
    templateId,
    coupleNames: `${invitationData.brideName} & ${invitationData.groomName}`,
    weddingDate: invitationData.weddingDate,
    venue: invitationData.venue || '',
    message: invitationData.coupleMessage || '',
    customization: invitationData,
    pdfFilename,
    expiresAt,
  });

  return {
    downloadToken,
    expiresIn: 5 * 60 * 1000,
  };
}

export async function downloadInvitation(token: string): Promise<{
  success: boolean;
  data?: Buffer;
  filename?: string;
  error?: string;
}> {
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if invitation exists and not yet downloaded
    const [invitation] = await db
      .select()
      .from(invitationTokens)
      .where(eq(invitationTokens.token, token))
      .limit(1);

    if (!invitation) {
      return { success: false, error: 'Download link not found' };
    }

    if (invitation.used) {
      return { success: false, error: 'Download link already used' };
    }

    if (new Date() > invitation.expiresAt) {
      return { success: false, error: 'Download link expired' };
    }

    // Get the PDF filename from database
    if (!invitation.pdfFilename) {
      return { success: false, error: 'PDF file not found' };
    }
    const tempFilePath = path.join(TEMP_DIR, invitation.pdfFilename);
    
    try {
      const fileBuffer = await fs.readFile(tempFilePath);
      
      // Mark as downloaded
      await db
        .update(invitationTokens)
        .set({ used: true })
        .where(eq(invitationTokens.token, token));

      // Schedule file deletion after a short delay
      setTimeout(async () => {
        try {
          await fs.unlink(tempFilePath);
          console.log(`Temporary file deleted: ${tempFilePath}`);
        } catch (error) {
          console.warn(`Failed to delete temporary file: ${tempFilePath}`, error);
        }
      }, 2000);

      return {
        success: true,
        data: fileBuffer,
        filename: `wedding-invitation-${invitation.coupleNames.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`,
      };
    } catch (fileError) {
      return { success: false, error: 'File not found or corrupted' };
    }
  } catch (jwtError) {
    return { success: false, error: 'Invalid or expired token' };
  }
}

// Cleanup expired invitations and files
export async function cleanupExpiredInvitations() {
  try {
    const expiredInvitations = await db
      .select()
      .from(invitationTokens)
      .where(eq(invitationTokens.used, false));

    for (const invitation of expiredInvitations) {
      if (new Date() > invitation.expiresAt) {
        // Delete file
        const tempFilePath = path.join(TEMP_DIR, invitation.pdfFilename || 'unknown.pdf');
        try {
          await fs.unlink(tempFilePath);
        } catch (error) {
          // File might already be deleted, ignore
        }

        // Mark as used to prevent future access
        await db
          .update(invitationTokens)
          .set({ used: true })
          .where(eq(invitationTokens.token, invitation.token));
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupExpiredInvitations, 10 * 60 * 1000);

export { ensureTempDir };