-- Add is_admin to users if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='is_admin') THEN
    ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Drop old funnel_templates table if it exists
DROP TABLE IF EXISTS funnel_templates CASCADE;

-- Add template fields to builder_pages
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='builder_pages' AND column_name='is_template') THEN
    ALTER TABLE builder_pages ADD COLUMN is_template BOOLEAN DEFAULT FALSE;
    ALTER TABLE builder_pages ADD COLUMN template_category TEXT;
    ALTER TABLE builder_pages ADD COLUMN template_tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Update RLS on builder_pages to allow anyone to select templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'builder_pages' AND policyname = 'Allow public read of templates'
  ) THEN
    CREATE POLICY "Allow public read of templates" ON builder_pages FOR SELECT USING (is_template = TRUE);
  END IF;
END $$;
