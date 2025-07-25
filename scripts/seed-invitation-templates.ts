import { db } from '../server/db';
import { invitationTemplates } from '../shared/schema';

async function seedInvitationTemplates() {
  console.log('Seeding invitation templates...');

  // Clear existing templates
  await db.delete(invitationTemplates);

  // Template data for the 4 PDF files we have
  const templates = [
    {
      name: "Save the Date - Classic",
      slug: "save-the-date-classic",
      category: "save-the-date",
      description: "Elegant save the date with classic typography and beautiful layout",
      previewImage: null,
      pdfFilename: "Untitled (2)_1753415935470.pdf",
      fieldMapping: {
        brideName: "bride_name",
        groomName: "groom_name", 
        weddingDate: "wedding_date"
      }
    },
    {
      name: "Wedding Invitation - Simple",
      slug: "wedding-invitation-simple",
      category: "wedding-invitation",
      description: "Clean and simple wedding invitation design",
      previewImage: null,
      pdfFilename: "Untitled-1_1753415935471.pdf",
      fieldMapping: {
        brideName: "bride_name",
        groomName: "groom_name",
        weddingDate: "wedding_date"
      }
    },
    {
      name: "Save the Date - Family Style",
      slug: "save-the-date-family",
      category: "save-the-date", 
      description: "Family-focused save the date with warm message and venue details",
      previewImage: null,
      pdfFilename: "Untitled (1)_1753415935472.pdf",
      fieldMapping: {
        brideName: "bride_name",
        groomName: "groom_name",
        weddingDate: "wedding_date",
        venue: "venue",
        familyMessage: "family_message"
      }
    },
    {
      name: "Wedding Invitation - Together",
      slug: "wedding-invitation-together",
      category: "wedding-invitation",
      description: "Formal wedding invitation with family details and ceremony time",
      previewImage: null,
      pdfFilename: "Untitled_1753415935473.pdf",
      fieldMapping: {
        brideName: "bride_name",
        groomName: "groom_name", 
        weddingDate: "wedding_date",
        venue: "venue",
        time: "ceremony_time"
      }
    }
  ];

  // Insert templates
  for (const template of templates) {
    const [newTemplate] = await db.insert(invitationTemplates).values(template).returning();
    console.log(`✓ Created template: ${newTemplate.name} (ID: ${newTemplate.id})`);
  }

  console.log('✅ Invitation templates seeded successfully!');
}

// Run the seeding function
seedInvitationTemplates().catch(console.error);