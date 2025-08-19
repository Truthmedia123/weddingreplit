-- Migration: Enhanced Invitation System (SQLite)
-- Description: Adds new tables for enhanced wedding invitation generator functionality
-- Date: 2024-01-XX

-- Create invitation_templates table
CREATE TABLE IF NOT EXISTS invitation_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    style TEXT NOT NULL,
    description TEXT NOT NULL,
    preview_url TEXT,
    template_data TEXT, -- JSON string
    features TEXT, -- JSON string
    colors TEXT, -- JSON string
    price TEXT DEFAULT 'Free',
    popular INTEGER DEFAULT 0, -- boolean as integer
    premium INTEGER DEFAULT 0, -- boolean as integer
    is_active INTEGER DEFAULT 1, -- boolean as integer
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create generated_invitations table
CREATE TABLE IF NOT EXISTS generated_invitations (
    id TEXT PRIMARY KEY,
    template_id TEXT,
    form_data TEXT, -- JSON string
    customization_data TEXT, -- JSON string
    download_token TEXT NOT NULL UNIQUE,
    formats TEXT, -- JSON string
    download_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL,
    last_accessed_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create invitation_analytics table
CREATE TABLE IF NOT EXISTS invitation_analytics (
    id TEXT PRIMARY KEY,
    invitation_id TEXT NOT NULL,
    template_id TEXT,
    action TEXT NOT NULL,
    format TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
INSERT OR IGNORE INTO invitation_templates (id, name, category, style, description, features, colors, popular, premium) VALUES
(
    'goan-beach-bliss',
    'Goan Beach Bliss',
    'goan-beach',
    'Tropical Paradise',
    'Stunning beach wedding invitation with golden sunset, palm trees, and ocean waves perfect for Goan ceremonies',
    '["Beach Sunset Theme", "Palm Tree Silhouettes", "Ocean Wave Borders", "Tropical Typography"]',
    '["Coral", "Turquoise", "Gold"]',
    1,
    0
),
(
    'portuguese-heritage',
    'Portuguese Heritage',
    'christian',
    'Colonial Elegance',
    'Elegant design inspired by Portuguese colonial architecture with azulejo tile patterns and traditional motifs',
    '["Azulejo Tile Patterns", "Colonial Architecture", "Bilingual Support", "Heritage Colors"]',
    '["Royal Blue", "White", "Gold"]',
    0,
    1
),
(
    'hindu-elegant',
    'Hindu Elegant',
    'hindu',
    'Traditional Splendor',
    'Beautiful Hindu wedding invitation with traditional motifs, mandala patterns, and auspicious symbols',
    '["Traditional Motifs", "Mandala Patterns", "Auspicious Symbols", "Cultural Elements"]',
    '["Deep Red", "Gold", "Saffron"]',
    1,
    0
),
(
    'muslim-nikah',
    'Muslim Nikah',
    'muslim',
    'Islamic Grace',
    'Elegant Muslim wedding invitation featuring Islamic geometric patterns and calligraphy',
    '["Islamic Patterns", "Arabic Calligraphy", "Geometric Designs", "Cultural Motifs"]',
    '["Emerald Green", "Gold", "Navy Blue"]',
    0,
    0
),
(
    'modern-minimalist',
    'Modern Minimalist',
    'modern',
    'Contemporary Clean',
    'Clean and modern design with minimalist typography and subtle geometric elements',
    '["Minimalist Design", "Modern Typography", "Clean Layout", "Subtle Elements"]',
    '["Navy", "Rose Gold", "Cream"]',
    0,
    0
),
(
    'vintage-charm',
    'Vintage Charm',
    'vintage',
    'Old World Romance',
    'Nostalgic design capturing old Goa charm with vintage illustrations and classic Portuguese elements',
    '["Vintage Illustrations", "Portuguese Elements", "Sepia Tones", "Classic Borders"]',
    '["Sepia", "Antique Gold", "Cream"]',
    0,
    0
);
