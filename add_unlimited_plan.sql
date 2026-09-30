-- ============================================================
-- OfferIQ: Add 'unlimited' to plan check constraint
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

-- Drop the old constraint and recreate it with 'unlimited' included
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_plan_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_plan_check
    CHECK (plan IN ('free', 'starter', 'growth', 'agency', 'unlimited'));
