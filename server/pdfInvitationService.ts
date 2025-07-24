import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import crypto from 'crypto';

// PDF Template definitions based on uploaded templates
export const PDF_INVITATION_TEMPLATES = {
  'save-the-date-classic': {
    name: 'Save The Date - Classic',
    description: 'Traditional save the date design with elegant typography and formal layout',
    template: 'save-the-date-classic.pdf',
    customizable: ['coupleNames', 'weddingDate', 'venue'],
    layout: 'save-the-date'
  },
  'simple-invitation': {
    name: 'Simple Wedding Invitation',
    description: 'Clean and minimal invitation design perfect for modern weddings',
    template: 'simple-invitation.pdf', 
    customizable: ['coupleNames', 'weddingDate', 'venue'],
    layout: 'simple'
  },
  'family-invitation': {
    name: 'Family Wedding Invitation',
    description: 'Formal family-style invitation with "Together with their families" header',
    template: 'family-invitation.pdf',
    customizable: ['coupleNames', 'weddingDate', 'venue', 'time'],
    layout: 'family'
  },
  'save-the-date-detailed': {
    name: 'Save The Date - Detailed',
    description: 'Comprehensive save the date with venue details and family signature',
    template: 'save-the-date-detailed.pdf',
    customizable: ['coupleNames', 'weddingDate', 'venue', 'message'],
    layout: 'detailed'
  }
};

export interface PDFInvitationData {
  templateId: string;
  coupleNames: string;
  weddingDate: string;
  venue: string;
  time?: string;
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

export function generateExpiryDate(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 24 hours from now
  return expiry;
}

export function isTokenExpired(createdAt: Date, expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export async function generatePDFInvitation(data: PDFInvitationData): Promise<Buffer> {
  const template = PDF_INVITATION_TEMPLATES[data.templateId as keyof typeof PDF_INVITATION_TEMPLATES];
  if (!template) {
    throw new Error('Invalid template ID');
  }

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  
  // Get fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const { width, height } = page.getSize();

  // Template-specific rendering
  switch (template.layout) {
    case 'save-the-date':
      generateSaveTheDatePDF(page, data, width, height, helveticaBold, helveticaFont);
      break;
    case 'simple':
      generateSimpleInvitationPDF(page, data, width, height, helveticaBold, helveticaFont);
      break;
    case 'family': 
      generateFamilyInvitationPDF(page, data, width, height, timesBold, timesRoman);
      break;
    case 'detailed':
      generateDetailedSaveTheDatePDF(page, data, width, height, timesBold, timesRoman);
      break;
    default:
      generateDefaultPDF(page, data, width, height, helveticaBold, helveticaFont);
      break;
  }

  return Buffer.from(await pdfDoc.save());
}

function generateSaveTheDatePDF(page: any, data: PDFInvitationData, width: number, height: number, boldFont: any, regularFont: any): void {
  // "SAVE THE DATE" header
  page.drawText('SAVE THE DATE', {
    x: width / 2 - 100,
    y: height - 100,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Parse couple names
  const names = data.coupleNames.split(/\s+(?:and|&)\s+/i);
  
  if (names.length >= 2) {
    page.drawText(names[0], {
      x: width / 2 - 80,
      y: height - 200,
      size: 32,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('AND', {
      x: width / 2 - 20,
      y: height - 250,
      size: 20,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(names[1], {
      x: width / 2 - 80,
      y: height - 300,
      size: 32,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
  } else {
    page.drawText(data.coupleNames, {
      x: width / 2 - 100,
      y: height - 250,
      size: 32,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
  }

  page.drawText('ARE GETTING', {
    x: width / 2 - 60,
    y: height - 400,
    size: 16,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  page.drawText('MARRIED ON', {
    x: width / 2 - 60,
    y: height - 430,
    size: 16,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(data.weddingDate.toUpperCase(), {
    x: width / 2 - 120,
    y: height - 550,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
}

function generateSimpleInvitationPDF(page: any, data: PDFInvitationData, width: number, height: number, boldFont: any, regularFont: any): void {
  page.drawText('Invitation', {
    x: width / 2 - 50,
    y: height - 100,
    size: 28,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  const names = data.coupleNames.replace(/\s+(?:and|&)\s+/i, ' & ');
  page.drawText(names, {
    x: width / 2 - (names.length * 6),
    y: height - 200,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(data.weddingDate, {
    x: width / 2 - (data.weddingDate.length * 5),
    y: height - 250,
    size: 18,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
}

function generateFamilyInvitationPDF(page: any, data: PDFInvitationData, width: number, height: number, boldFont: any, regularFont: any): void {
  page.drawText('TOGETHER', {
    x: width / 2 - 60,
    y: height - 80,
    size: 20,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  page.drawText('WITH THEIR FAMILIES', {
    x: width / 2 - 100,
    y: height - 110,
    size: 16,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  const names = data.coupleNames.split(/\s+(?:and|&)\s+/i);
  if (names.length >= 2) {
    page.drawText(names[0], {
      x: width / 2 - 50,
      y: height - 200,
      size: 32,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('&', {
      x: width / 2 - 10,
      y: height - 240,
      size: 24,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(names[1], {
      x: width / 2 - 50,
      y: height - 280,
      size: 32,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
  }

  page.drawText('we invite you to join our wedding', {
    x: width / 2 - 120,
    y: height - 350,
    size: 14,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  // Date formatting
  const dateParts = data.weddingDate.split(' ');
  if (dateParts.length >= 3) {
    page.drawText(dateParts[0], {
      x: width / 2 - 20,
      y: height - 450,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(dateParts[1], {
      x: width / 2 - 15,
      y: height - 480,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(dateParts[2], {
      x: width / 2 - 25,
      y: height - 510,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
  }

  if (data.time) {
    page.drawText(data.time.toUpperCase(), {
      x: width / 2 - 80,
      y: height - 580,
      size: 14,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
  }

  page.drawText(`Venue: ${data.venue}`, {
    x: width / 2 - 100,
    y: height - 650,
    size: 14,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
}

function generateDetailedSaveTheDatePDF(page: any, data: PDFInvitationData, width: number, height: number, boldFont: any, regularFont: any): void {
  page.drawText('SAVE THE DATE FOR', {
    x: width / 2 - 80,
    y: height - 80,
    size: 16,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  page.drawText('THE WEDDING OF', {
    x: width / 2 - 70,
    y: height - 110,
    size: 16,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  const names = data.coupleNames.split(/\s+(?:and|&)\s+/i);
  if (names.length >= 2) {
    page.drawText(names[0], {
      x: width / 2 - 60,
      y: height - 180,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('&', {
      x: width / 2 - 10,
      y: height - 210,
      size: 20,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(names[1], {
      x: width / 2 - 60,
      y: height - 240,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
  }

  if (data.message) {
    const lines = data.message.split('\n');
    lines.forEach((line, index) => {
      page.drawText(line, {
        x: width / 2 - (line.length * 3),
        y: height - 320 - (index * 20),
        size: 12,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
    });
  }

  page.drawText(data.weddingDate, {
    x: width / 2 - 50,
    y: height - 450,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(data.venue, {
    x: width / 2 - (data.venue.length * 3),
    y: height - 480,
    size: 14,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  page.drawText('Warm regards,', {
    x: width / 2 - 50,
    y: height - 550,
    size: 12,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  const familyName = names.length >= 1 ? `${names[0]} Family` : 'Wedding Family';
  page.drawText(familyName, {
    x: width / 2 - (familyName.length * 3),
    y: height - 570,
    size: 12,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
}

function generateDefaultPDF(page: any, data: PDFInvitationData, width: number, height: number, boldFont: any, regularFont: any): void {
  page.drawText('Wedding Invitation', {
    x: width / 2 - 80,
    y: height - 100,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(data.coupleNames, {
    x: width / 2 - (data.coupleNames.length * 6),
    y: height - 200,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(data.weddingDate, {
    x: width / 2 - (data.weddingDate.length * 4),
    y: height - 300,
    size: 16,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(data.venue, {
    x: width / 2 - (data.venue.length * 4),
    y: height - 350,
    size: 16,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
}