-- Create payment_integrations table to store API keys
CREATE TABLE public.payment_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  gateway VARCHAR(255) NOT NULL, -- 'stripe', 'paypal', 'paystack'
  is_live BOOLEAN DEFAULT false,
  -- We store keys as JSON. In a real production app, consider encrypting these or using Supabase Vault.
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, gateway)
);

-- Enable RLS for payment_integrations
ALTER TABLE public.payment_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment integrations"
  ON public.payment_integrations FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own payment integrations"
  ON public.payment_integrations FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own payment integrations"
  ON public.payment_integrations FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

-- Create purchases table
CREATE TABLE public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  external_payment_id VARCHAR(255) NOT NULL UNIQUE,
  gateway VARCHAR(255) NOT NULL,
  payment_type VARCHAR(50) NOT NULL, -- 'one_time', 'recurring'
  payment_status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'pending'
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  payer_email VARCHAR(255),
  payer_name VARCHAR(255),
  raw_webhook_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view funnel purchases"
  ON public.purchases FOR SELECT
  USING (
    funnel_id IN (
      SELECT f.id FROM public.funnels f
      JOIN public.workspace_members wm ON wm.workspace_id = f.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );
