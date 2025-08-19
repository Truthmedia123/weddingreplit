-- Migration: Enhanced Invitation System
-- Description: Adds new tables for enhanced wedding invitation generator functionality
-- Date: 2024-01-XX

-- Create invitation_templates table
CREATE TABLE IF NOT EXISTS invitation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    style TEXT NOT NULL,
    description TEXT NOT NULL,
    preview_url TEXT,
    template_data JSONB,
    features TEXT[],
    colors TEXT[],
    price TEXT DEFAULT 'Free',
    popular BOOLEAN DEFAULT false,
    premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create generated_invitations table
CREATE TABLE IF NOT EXISTS generated_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id TEXT,
    form_data JSONB,
    customization_data JSONB,
    download_token TEXT NOT NULL UNIQUE,
    formats JSONB,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    last_accessed_at TIMESTAMP DEFAULT NOW()
);

-- Create invitation_analytics table
CREATE TABLE IF NOT EXISTS invitation_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id TEXT NOT NULL,
    template_id TEXT,
    action TEXT NOT NULL,
    format TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitation_templates_category ON invitation_templates(category);
CREATE INDEX IF NOT EXISTS idx_invitation_templates_active ON invitation_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_generated_invitations_token ON generated_invitations(download_token);
CREATE INDEX IF NOT EXISTS idx_generated_invitations_expires ON generated_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_invitation_analytics_invitation_id ON invitation_analytics(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_analytics_action ON invitation_analytics(action);
CREATE INDEX IF NOT EXISTS idx_invitation_analytics_created_at ON invitation_analytics(created_at);

-- Insert initial template data
INSERT INTO invitation_templates (id, name, category, style, description, features, colors, popular, premium) VALUES
(
    'goan-beach-bliss',
    'Goan Beach Bliss',
    'goan-beach',
    'Tropical Paradise',
    'Stunning beach wedding invitation with golden sunset, palm trees, and ocean waves perfect for Goan ceremonies',
    ARRAY['Beach Sunset Theme', 'Palm Tree Silhouettes', 'Ocean Wave Borders', 'Tropical Typography'],
    ARRAY['Coral', 'Turquoise', 'Gold'],
    true,
    false
),
(
    'portuguese-heritage',
    'Portuguese Heritage',
    'christian',
    'Colonial Elegance',
    'Elegant design inspired by Portuguese colonial architecture with azulejo tile patterns and traditional motifs',
    ARRAY['Azulejo Tile Patterns', 'Colonial Architecture', 'Bilingual Support', 'Heritage Colors'],
    ARRAY['Royal Blue', 'White', 'Gold'],
    false,
    true
),
(
    'hindu-elegant',
    'Hindu Elegant',
    'hindu',
    'Traditional Splendor',
    'Beautiful Hindu wedding invitation with traditional motifs, mandala patterns, and auspicious symbols',
    ARRAY['Traditional Motifs', 'Mandala Patterns', 'Auspicious Symbols', 'Cultural Elements'],
    ARRAY['Deep Red', 'Gold', 'Saffron'],
    true,
    false
),
(
    'muslim-nikah',
    'Muslim Nikah',
    'muslim',
    'Islamic Grace',
    'Elegant Muslim wedding invitation featuring Islamic geometric patterns and calligraphy',
    ARRAY['Islamic Patterns', 'Arabic Calligraphy', 'Geometric Designs', 'Cultural Motifs'],
    ARRAY['Emerald Green', 'Gold', 'Navy Blue'],
    false,
    false
),
(
    'modern-minimalist',
    'Modern Minimalist',
    'modern',
    'Contemporary Clean',
    'Clean and modern design with minimalist typography and subtle geometric elements',
    ARRAY['Minimalist Design', 'Modern Typography', 'Clean Layout', 'Subtle Elements'],
    ARRAY['Navy', 'Rose Gold', 'Cream'],
    false,
    false
),
(
    'vintage-charm',
    'Vintage Charm',
    'vintage',
    'Old World Romance',
    'Nostalgic design capturing old Goa charm with vintage illustrations and classic Portuguese elements',
    ARRAY['Vintage Illustrations', 'Portuguese Elements', 'Sepia Tones', 'Classic Borders'],
    ARRAY['Sepia', 'Antique Gold', 'Cream'],
    false,
    false
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_invitation_templates_updated_at 
    BEFORE UPDATE ON invitation_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE invitation_templates IS 'Stores wedding invitation template configurations and metadata';
COMMENT ON TABLE generated_invitations IS 'Stores generated invitation data and download tokens';
COMMENT ON TABLE invitation_analytics IS 'Tracks user interactions and analytics for invitations';

COMMENT ON COLUMN invitation_templates.template_data IS 'JSON configuration for template layout, positioning, and styling';
COMMENT ON COLUMN generated_invitations.form_data IS 'Complete form data submitted by user for invitation generation';
COMMENT ON COLUMN generated_invitations.customization_data IS 'User customization choices (fonts, colors, QR settings)';
COMMENT ON COLUMN generated_invitations.formats IS 'Generated file formats and their metadata';
COMMENT ON COLUMN invitation_analytics.action IS 'Type of action: created, downloaded, shared, previewed';
