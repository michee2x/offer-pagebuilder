-- Create products table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  payment_type VARCHAR(50) NOT NULL DEFAULT 'one_time', -- 'one_time', 'recurring'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view funnel products"
  ON public.products FOR SELECT
  USING (
    funnel_id IN (
      SELECT f.id FROM public.funnels f
      JOIN public.workspace_members wm ON wm.workspace_id = f.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can insert funnel products"
  ON public.products FOR INSERT
  WITH CHECK (
    funnel_id IN (
      SELECT f.id FROM public.funnels f
      JOIN public.workspace_members wm ON wm.workspace_id = f.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update funnel products"
  ON public.products FOR UPDATE
  USING (
    funnel_id IN (
      SELECT f.id FROM public.funnels f
      JOIN public.workspace_members wm ON wm.workspace_id = f.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete funnel products"
  ON public.products FOR DELETE
  USING (
    funnel_id IN (
      SELECT f.id FROM public.funnels f
      JOIN public.workspace_members wm ON wm.workspace_id = f.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

-- Update purchases table to reference product_id
ALTER TABLE public.purchases ADD COLUMN product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;
