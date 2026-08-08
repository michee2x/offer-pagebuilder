-- ============================================================
-- OfferIQ: AppSumo Licensing Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add AppSumo tracking columns to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS appsumo_license_key TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS appsumo_tier TEXT,
  ADD COLUMN IF NOT EXISTS appsumo_license_status TEXT DEFAULT 'inactive';

-- 2. Indexes for faster lookups (Webhooks fire by license_key)
CREATE INDEX IF NOT EXISTS idx_users_appsumo_license_key
  ON public.users (appsumo_license_key);
