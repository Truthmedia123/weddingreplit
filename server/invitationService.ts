import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface InvitationData {
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  time?: string;
  familyMessage?: string;
  coupleMessage?: string;
}

const generatedInvitations = new Map<string, {
  filename: string;
  data: Buffer;
  expiresAt: Date;
}>();

export const generateInvitationPDF = async (
  templateId: string,
  invitationData: InvitationData
): Promise<{ downloadToken: string; expiresIn: number }> => {
  console.log('Starting PDF generation for template:', templateId);

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Background with template-specific colors
    let bgColor = rgb(0.98, 0.97, 0.95); // Default cream
    let primaryColor = rgb(0.4, 0.3, 0.2); // Dark brown
    let accentColor = rgb(0.7, 0.6, 0.4); // Gold

    if (templateId.includes('pink')) {
      bgColor = rgb(0.99, 0.95, 0.97);
      primaryColor = rgb(0.7, 0.3, 0.5);
      accentColor = rgb(0.9, 0.7, 0.8);
    } else if (templateId.includes('botanical')) {
      bgColor = rgb(0.97, 0.99, 0.96);
      primaryColor = rgb(0.2, 0.5, 0.3);
      accentColor = rgb(0.6, 0.8, 0.7);
    } else if (templateId.includes('lavender')) {
      bgColor = rgb(0.96, 0.95, 0.99);
      primaryColor = rgb(0.4, 0.3, 0.6);
      accentColor = rgb(0.8, 0.7, 0.9);
    }

    // Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: bgColor,
    });

    // Decorative border
    page.drawRectangle({
      x: 40,
      y: 40,
      width: width - 80,
      height: height - 80,
      borderColor: accentColor,
      borderWidth: 3,
    });

    // Inner border
    page.drawRectangle({
      x: 55,
      y: 55,
      width: width - 110,
      height: height - 110,
      borderColor: accentColor,
      borderWidth: 1,
    });

    const centerX = width / 2;
    let yPosition = height - 100;

    // Title
    const title = templateId.includes('save-the-date') ? 'Save The Date' : 'Wedding Invitation';
    const titleWidth = titleFont.widthOfTextAtSize(title, 32);
    page.drawText(title, {
      x: centerX - (titleWidth / 2),
      y: yPosition,
      size: 32,
      font: titleFont,
      color: primaryColor,
    });
    yPosition -= 50;

    // Decorative line
    page.drawLine({
      start: { x: centerX - 120, y: yPosition },
      end: { x: centerX + 120, y: yPosition },
      thickness: 2,
      color: accentColor,
    });
    yPosition -= 40;

    // Decorative symbol
    const symbol = templateId.includes('pink') ? '♥' : templateId.includes('botanical') ? '❀' : templateId.includes('lavender') ? '✿' : '❦';
    const symbolWidth = titleFont.widthOfTextAtSize(symbol, 20);
    page.drawText(symbol, {
      x: centerX - (symbolWidth / 2),
      y: yPosition,
      size: 20,
      font: titleFont,
      color: accentColor,
    });
    yPosition -= 50;

    // Couple names
    const coupleText = `${invitationData.brideName} & ${invitationData.groomName}`;
    const coupleWidth = titleFont.widthOfTextAtSize(coupleText, 26);
    page.drawText(coupleText, {
      x: centerX - (coupleWidth / 2),
      y: yPosition,
      size: 26,
      font: titleFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    yPosition -= 60;

    // Date formatting
    let dateText = invitationData.weddingDate;
    try {
      const date = new Date(invitationData.weddingDate);
      dateText = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      // Use original date string if parsing fails
    }

    const dateWidth = bodyFont.widthOfTextAtSize(dateText, 18);
    page.drawText(dateText, {
      x: centerX - (dateWidth / 2),
      y: yPosition,
      size: 18,
      font: bodyFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 40;

    // Time if provided
    if (invitationData.time) {
      const timeText = `at ${invitationData.time}`;
      const timeWidth = bodyFont.widthOfTextAtSize(timeText, 16);
      page.drawText(timeText, {
        x: centerX - (timeWidth / 2),
        y: yPosition,
        size: 16,
        font: bodyFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 40;
    }

    // Venue
    const venueWidth = bodyFont.widthOfTextAtSize(invitationData.venue, 16);
    page.drawText(invitationData.venue, {
      x: centerX - (venueWidth / 2),
      y: yPosition,
      size: 16,
      font: bodyFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 50;

    // Family message
    if (invitationData.familyMessage) {
      yPosition -= 20;
      const labelText = 'With love from our families';
      const labelWidth = bodyFont.widthOfTextAtSize(labelText, 12);
      page.drawText(labelText, {
        x: centerX - (labelWidth / 2),
        y: yPosition,
        size: 12,
        font: bodyFont,
        color: accentColor,
      });
      yPosition -= 25;
      
      const msgWidth = bodyFont.widthOfTextAtSize(invitationData.familyMessage, 11);
      page.drawText(invitationData.familyMessage, {
        x: centerX - (msgWidth / 2),
        y: yPosition,
        size: 11,
        font: bodyFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 30;
    }

    // Couple message
    if (invitationData.coupleMessage) {
      yPosition -= 20;
      const labelText = 'A personal note from us';
      const labelWidth = bodyFont.widthOfTextAtSize(labelText, 12);
      page.drawText(labelText, {
        x: centerX - (labelWidth / 2),
        y: yPosition,
        size: 12,
        font: bodyFont,
        color: accentColor,
      });
      yPosition -= 25;
      
      const msgWidth = bodyFont.widthOfTextAtSize(invitationData.coupleMessage, 11);
      page.drawText(invitationData.coupleMessage, {
        x: centerX - (msgWidth / 2),
        y: yPosition,
        size: 11,
        font: bodyFont,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    const pdfBytes = await pdfDoc.save();
    
    const downloadToken = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    const filename = `wedding-invitation-${invitationData.brideName}-${invitationData.groomName}.pdf`
      .replace(/[^a-zA-Z0-9.-]/g, '-');
    
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    generatedInvitations.set(downloadToken, {
      filename,
      data: Buffer.from(pdfBytes),
      expiresAt
    });

    console.log('PDF generation completed successfully');

    return {
      downloadToken,
      expiresIn: 5 * 60 * 1000
    };

  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error(`Failed to generate PDF invitation: ${error.message}`);
  }
};

export const downloadInvitationPDF = async (token: string): Promise<{
  success: boolean;
  data?: Buffer;
  filename?: string;
  error?: string;
}> => {
  try {
    const invitation = generatedInvitations.get(token);

    if (!invitation) {
      return { success: false, error: 'Download link not found or expired' };
    }

    if (new Date() > invitation.expiresAt) {
      generatedInvitations.delete(token);
      return { success: false, error: 'Download link expired' };
    }

    const result = {
      success: true,
      data: invitation.data,
      filename: invitation.filename
    };

    generatedInvitations.delete(token);
    return result;

  } catch (error) {
    console.error('Download error:', error);
    return { success: false, error: 'Failed to process download' };
  }
};

export const ensureTempDir = async (): Promise<void> => {
  // No-op for in-memory storage
};