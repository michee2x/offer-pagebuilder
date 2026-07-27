-- ============================================================
-- OfferIQ: Billing, Credits & Plan Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add plan column (free | starter | growth | agency)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'starter', 'growth', 'agency'));

-- 2. Add Paddle subscription tracking columns
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none'
    CHECK (subscription_status IN ('none', 'trialing', 'active', 'past_due', 'paused', 'canceled')),
  ADD COLUMN IF NOT EXISTS scheduled_change_at TIMESTAMPTZ;

-- 3. Add credit system columns
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS credits_remaining INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_total INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_reset_at TIMESTAMPTZ;

-- 4. Indexes for webhook lookups (Paddle fires by customer_id)
CREATE INDEX IF NOT EXISTS idx_users_paddle_customer_id
  ON public.users (paddle_customer_id);

CREATE INDEX IF NOT EXISTS idx_users_paddle_subscription_id
  ON public.users (paddle_subscription_id);

-- 5. Create credit_transactions audit table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN (
                  'monthly_reset', 'admin_topup',
                  'deduct_intelligence', 'deduct_generation'
                )),
  amount        INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id
  ON public.credit_transactions (user_id);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit transactions"
  ON public.credit_transactions FOR SELECT
  USING (user_id = auth.uid());

-- 6. Create magic_link_tokens table
CREATE TABLE IF NOT EXISTS public.magic_link_tokens (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash    TEXT NOT NULL UNIQUE,
  expires_at    TIMESTAMPTZ NOT NULL,
  used_at       TIMESTAMPTZ,
  created_by    UUID REFERENCES public.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_magic_link_tokens_token_hash
  ON public.magic_link_tokens (token_hash);

CREATE INDEX IF NOT EXISTS idx_magic_link_tokens_user_id
  ON public.magic_link_tokens (user_id);

ALTER TABLE public.magic_link_tokens ENABLE ROW LEVEL SECURITY;
