import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { funnelId } = await params;

  if (!funnelId) {
    return Response.json({ error: 'Funnel ID is required' }, { status: 400 });
  }

  // First check if the funnel belongs to the user
  const { data: funnel, error: fetchError } = await supabaseAdmin
    .from('builder_pages')
    .select('id, user_id, workspace_id')
    .eq('id', funnelId)
    .single();

  if (fetchError || !funnel) {
    return Response.json({ error: 'Funnel not found' }, { status: 404 });
  }

  let hasPermission = false;

  if (funnel.user_id === session.user.id) {
    hasPermission = true;
  } else if (funnel.workspace_id) {
    const { data: member } = await supabaseAdmin
      .from('workspace_members')
      .select('permissions, role')
      .eq('workspace_id', funnel.workspace_id)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (member?.role === 'owner' || member?.role === 'admin' || member?.permissions?.delete === true) {
      hasPermission = true;
    }
  }

  if (!hasPermission) {
    return Response.json({ error: 'Unauthorized to delete this funnel' }, { status: 403 });
  }

  // Delete the funnel
  const { error: deleteError } = await supabaseAdmin
    .from('builder_pages')
    .delete()
    .eq('id', funnelId);

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 });
  }

  return Response.json({ success: true });
}