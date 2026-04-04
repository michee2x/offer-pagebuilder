import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  const { funnelId } = await params;

  if (!funnelId) {
    return Response.json({ error: 'funnelId is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('builder_pages')
    .select('id, name, blocks, created_at')
    .eq('id', funnelId)
    .single();

  if (error || !data) {
    return Response.json({ error: 'Funnel not found' }, { status: 404 });
  }

  return Response.json({ funnel: data });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  const { funnelId } = await params;

  try {
    const body = await req.json();
    const { blocks } = body;

    if (!blocks) {
      return Response.json({ error: 'blocks payload required' }, { status: 400 });
    }

    // Fetch current then deep-merge
    const { data: current } = await supabaseAdmin
      .from('builder_pages')
      .select('blocks')
      .eq('id', funnelId)
      .single();

    const merged = { ...(current?.blocks || {}), ...blocks };

    const { error } = await supabaseAdmin
      .from('builder_pages')
      .update({ blocks: merged })
      .eq('id', funnelId);

    if (error) throw error;

    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
