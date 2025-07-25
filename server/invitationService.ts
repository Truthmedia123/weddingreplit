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
  await ensureTempDir();

  // Get template from database
  const [template] = await db
    .select()
    .from(invitationTemplates)
    .where(eq(invitationTemplates.slug, templateId))
    .limit(1);

  if (!template) {
    throw new Error('Template not found');
  }

  // Read the PDF template file
  const templatePath = path.join(process.cwd(), 'attached_assets', template.pdfFilename);
  const pdfBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Get field mapping for this template
  const fieldMapping = template.fieldMapping as Record<string, string>;

  // Fill the PDF form with provided data
  try {
    const form = pdfDoc.getForm();
    
    // Map invitation data to PDF fields based on template configuration
    Object.entries(fieldMapping).forEach(([dataKey, pdfFieldName]) => {
      const value = invitationData[dataKey as keyof InvitationData];
      if (value && pdfFieldName) {
        try {
          const field = form.getTextField(pdfFieldName);
          field.setText(value);
        } catch (error) {
          console.warn(`Could not set field ${pdfFieldName}:`, error);
        }
      }
    });

    // Flatten the form to prevent further editing
    form.flatten();
  } catch (error) {
    console.warn('PDF form manipulation failed, using text overlay instead:', error);
    
    // Fallback: Add text directly to the PDF without form fields
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Template-specific text positioning
    if (templateId === 'save-the-date-classic') {
      firstPage.drawText(`${invitationData.brideName}`, {
        x: width / 2 - 50,
        y: height - 150,
        size: 24,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText('AND', {
        x: width / 2 - 20,
        y: height - 180,
        size: 16,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(`${invitationData.groomName}`, {
        x: width / 2 - 50,
        y: height - 210,
        size: 24,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(`${invitationData.weddingDate}`, {
        x: width / 2 - 80,
        y: height - 280,
        size: 20,
        color: rgb(0, 0, 0),
      });
    } else if (templateId === 'wedding-invitation-elegant') {
      firstPage.drawText(`${invitationData.brideName} & ${invitationData.groomName}`, {
        x: width / 2 - 100,
        y: height / 2,
        size: 28,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(`${invitationData.weddingDate}`, {
        x: width / 2 - 80,
        y: height / 2 - 40,
        size: 18,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(`${invitationData.venue}`, {
        x: width / 2 - 80,
        y: height / 2 - 80,
        size: 16,
        color: rgb(0, 0, 0),
      });
    }
  }

  // Generate download token
  const downloadToken = jwt.sign(
    { 
      templateId, 
      timestamp: Date.now(),
      brideName: invitationData.brideName,
      groomName: invitationData.groomName 
    },
    JWT_SECRET,
    { expiresIn: '5m' }
  );

  // Save invitation record to database
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await db.insert(invitationTokens).values({
    token: downloadToken,
    templateId,
    coupleNames: `${invitationData.brideName} & ${invitationData.groomName}`,
    weddingDate: invitationData.weddingDate,
    venue: invitationData.venue || '',
    message: invitationData.coupleMessage || '',
    customization: invitationData,
    expiresAt,
  });

  // Save the filled PDF temporarily
  const filledPdfBytes = await pdfDoc.save();
  const tempFilePath = path.join(TEMP_DIR, `invitation_${downloadToken}.pdf`);
  await fs.writeFile(tempFilePath, filledPdfBytes);

  return {
    downloadToken,
    expiresIn: 5 * 60 * 1000, // 5 minutes in milliseconds
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

    // Read the PDF file
    const tempFilePath = path.join(TEMP_DIR, `invitation_${token}.pdf`);
    
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
        const tempFilePath = path.join(TEMP_DIR, `invitation_${invitation.token}.pdf`);
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