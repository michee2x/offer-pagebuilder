-- Run this in your Supabase SQL editor
-- Creates the leads table for funnel lead capture

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS leads (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id   UUID        NOT NULL REFERENCES builder_pages(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  phone       TEXT,
  source_page TEXT        NOT NULL DEFAULT '/',
  metadata    JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_funnel_id_idx  ON leads(funnel_id);
CREATE INDEX IF NOT EXISTS leads_email_idx      ON leads(email);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Funnel owner can read their leads
CREATE POLICY "owner_select_leads"
  ON leads FOR SELECT
  USING (
    funnel_id IN (
      SELECT id FROM builder_pages WHERE user_id = auth.uid()
    )
  );

-- Funnel owner can delete their leads
CREATE POLICY "owner_delete_leads"
  ON leads FOR DELETE
  USING (
    funnel_id IN (
      SELECT id FROM builder_pages WHERE user_id = auth.uid()
    )
  );

-- Service role (used by /api/leads) can insert — bypasses RLS automatically
-- No INSERT policy needed for service role key
