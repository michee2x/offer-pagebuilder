-- This migration fixes the row-level security (RLS) policies on the `products` table.
-- The previous policies checked `funnel_id IN (SELECT f.id FROM public.funnels f...)`.
-- However, funnels in this app are stored in `public.builder_pages`, causing all inserts/updates/deletes to fail.

-- Drop old policies
DROP POLICY IF EXISTS "Workspace members can view funnel products" ON public.products;
DROP POLICY IF EXISTS "Workspace members can insert funnel products" ON public.products;
DROP POLICY IF EXISTS "Workspace members can update funnel products" ON public.products;
DROP POLICY IF EXISTS "Workspace members can delete funnel products" ON public.products;

-- Create correct policies targeting `public.builder_pages`
CREATE POLICY "Workspace members can view funnel products"
  ON public.products FOR SELECT
  USING (
    funnel_id IN (
      SELECT f.id FROM public.builder_pages f
      JOIN public.workspace_members wm ON wm.workspace_id = f.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can insert funnel products"
  ON public.products FOR INSERT
  WITH CHECK (
    funnel_id IN (
      SELECT f.id FROM public.builder_pages f
      JOIN public.workspace_members wm ON wm.workspace_id = f.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update funnel products"
  ON public.products FOR UPDATE
  USING (
    funnel_id IN (
      SELECT f.id FROM public.builder_pages f
      JOIN public.workspace_members wm ON wm.workspace_id = f.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete funnel products"
  ON public.products FOR DELETE
  USING (
    funnel_id IN (
      SELECT f.id FROM public.builder_pages f
      JOIN public.workspace_members wm ON wm.workspace_id = f.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );
