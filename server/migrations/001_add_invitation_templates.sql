-- Migration: Add Enhanced Wedding Invitation Generator Tables
-- Created: 2024-01-XX
-- Description: Adds invitation templates, generated invitations, and analytics tables

-- Create invitation_templates table
CREATE TABLE IF NOT EXISTS invitation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    cultural_theme TEXT NOT NULL,
    description TEXT,
    preview_url TEXT NOT NULL,
    thumbnail_url TEXT,
    template_data JSONB NOT NULL,
    color_schemes JSONB NOT NULL,
    typography JSONB NOT NULL,
    features TEXT[],
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create generated_invitations table
CREATE TABLE IF NOT EXISTS generated_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES invitation_templates(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL,
    customizations JSONB,
    download_token TEXT NOT NULL UNIQUE,
    formats JSONB NOT NULL,
    generation_status TEXT DEFAULT 'pending',
    error_message TEXT,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP
);

-- Create template_analytics table
CREATE TABLE IF NOT EXISTS template_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES invitation_templates(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    session_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_invitation_templates_category ON invitation_templates(category);
CREATE INDEX IF NOT EXISTS idx_invitation_templates_cultural_theme ON invitation_templates(cultural_theme);
CREATE INDEX IF NOT EXISTS idx_invitation_templates_active ON invitation_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_invitation_templates_sort_order ON invitation_templates(sort_order);

CREATE INDEX IF NOT EXISTS idx_generated_invitations_template_id ON generated_invitations(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_invitations_download_token ON generated_invitations(download_token);
CREATE INDEX IF NOT EXISTS idx_generated_invitations_status ON generated_invitations(generation_status);
CREATE INDEX IF NOT EXISTS idx_generated_invitations_expires_at ON generated_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_generated_invitations_created_at ON generated_invitations(created_at);

CREATE INDEX IF NOT EXISTS idx_template_analytics_template_id ON template_analytics(template_id);
CREATE INDEX IF NOT EXISTS idx_template_analytics_event_type ON template_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_template_analytics_session_id ON template_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_template_analytics_created_at ON template_analytics(created_at);

-- Add constraints
ALTER TABLE invitation_templates 
ADD CONSTRAINT chk_category CHECK (category IN ('goan-beach', 'christian', 'hindu', 'muslim', 'modern', 'floral'));

ALTER TABLE invitation_templates 
ADD CONSTRAINT chk_cultural_theme CHECK (cultural_theme IN ('christian', 'hindu', 'muslim', 'secular'));

ALTER TABLE generated_invitations 
ADD CONSTRAINT chk_generation_status CHECK (generation_status IN ('pending', 'processing', 'completed', 'failed'));

ALTER TABLE template_analytics 
ADD CONSTRAINT chk_event_type CHECK (event_type IN ('template_view', 'template_select', 'form_step', 'generation_start', 'generation_complete', 'download', 'share'));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for invitation_templates
CREATE TRIGGER update_invitation_templates_updated_at 
    BEFORE UPDATE ON invitation_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function for automatic cleanup of expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM generated_invitations 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get template usage statistics
CREATE OR REPLACE FUNCTION get_template_usage_stats(template_uuid UUID DEFAULT NULL)
RETURNS TABLE (
    template_id UUID,
    template_name TEXT,
    view_count BIGINT,
    select_count BIGINT,
    completion_count BIGINT,
    conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as template_id,
        t.name as template_name,
        COALESCE(views.count, 0) as view_count,
        COALESCE(selects.count, 0) as select_count,
        COALESCE(completions.count, 0) as completion_count,
        CASE 
            WHEN COALESCE(selects.count, 0) > 0 
            THEN ROUND((COALESCE(completions.count, 0)::NUMERIC / selects.count) * 100, 2)
            ELSE 0
        END as conversion_rate
    FROM invitation_templates t
    LEFT JOIN (
        SELECT template_id, COUNT(*) as count
        FROM template_analytics 
        WHERE event_type = 'template_view'
        AND (template_uuid IS NULL OR template_id = template_uuid)
        GROUP BY template_id
    ) views ON t.id = views.template_id
    LEFT JOIN (
        SELECT template_id, COUNT(*) as count
        FROM template_analytics 
        WHERE event_type = 'template_select'
        AND (template_uuid IS NULL OR template_id = template_uuid)
        GROUP BY template_id
    ) selects ON t.id = selects.template_id
    LEFT JOIN (
        SELECT template_id, COUNT(*) as count
        FROM generated_invitations 
        WHERE generation_status = 'completed'
        AND (template_uuid IS NULL OR template_id = template_uuid)
        GROUP BY template_id
    ) completions ON t.id = completions.template_id
    WHERE t.is_active = true
    AND (template_uuid IS NULL OR t.id = template_uuid)
    ORDER BY completion_count DESC, view_count DESC;
END;
$$ LANGUAGE plpgsql;