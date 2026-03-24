-- Run this in the Supabase SQL Editor to add domain support to your pages table

ALTER TABLE builder_pages 
ADD COLUMN IF NOT EXISTS subdomain text UNIQUE;

ALTER TABLE builder_pages 
ADD COLUMN IF NOT EXISTS custom_domain text UNIQUE;

-- Create indexes for faster domain lookups in the middleware/dynamic routes
CREATE INDEX IF NOT EXISTS idx_builder_pages_subdomain ON builder_pages(subdomain);
CREATE INDEX IF NOT EXISTS idx_builder_pages_custom_domain ON builder_pages(custom_domain);
