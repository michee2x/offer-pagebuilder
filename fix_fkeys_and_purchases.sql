-- Fix foreign key constraint for products
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_funnel_id_fkey;

ALTER TABLE public.products
  ADD CONSTRAINT products_funnel_id_fkey 
  FOREIGN KEY (funnel_id) REFERENCES public.builder_pages(id) ON DELETE CASCADE;

-- Fix foreign key constraint for purchases
ALTER TABLE public.purchases
  DROP CONSTRAINT IF EXISTS purchases_funnel_id_fkey;

ALTER TABLE public.purchases
  ADD CONSTRAINT purchases_funnel_id_fkey 
  FOREIGN KEY (funnel_id) REFERENCES public.builder_pages(id) ON DELETE CASCADE;

-- Fix purchases RLS policy that references funnels instead of builder_pages
DROP POLICY IF EXISTS "Workspace members can view funnel purchases" ON public.purchases;

CREATE POLICY "Workspace members can view funnel purchases"
  ON public.purchases FOR SELECT
  USING (
    funnel_id IN (
      SELECT f.id FROM public.builder_pages f
      JOIN public.workspace_members wm ON wm.workspace_id = f.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );
