-- 1. Add is_admin to users (assuming public.users exists and is mirrored from auth.users)
-- If your users are only in auth.users, you may need to run this on auth.users instead
-- or use a separate admins table.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create the funnel_templates table
CREATE TABLE IF NOT EXISTS funnel_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  category text,
  blocks jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_funnel_templates_category ON funnel_templates(category);
CREATE INDEX IF NOT EXISTS idx_funnel_templates_is_active ON funnel_templates(is_active);

-- 4. Enable RLS
ALTER TABLE funnel_templates ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Anyone can read active templates
CREATE POLICY "Anyone can read active templates" ON funnel_templates
  FOR SELECT USING (is_active = true);

-- Admins can do everything
-- Note: This requires the is_admin column. If using a different auth method, update this policy.
CREATE POLICY "Admins can insert templates" ON funnel_templates
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update templates" ON funnel_templates
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete templates" ON funnel_templates
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );
