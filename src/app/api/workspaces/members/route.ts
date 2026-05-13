import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return Response.json({ error: 'Workspace ID is required' }, { status: 400 });
  }

  try {
    const { data: members, error } = await supabaseAdmin
      .from('workspace_members')
      .select(`
        role,
        user_id,
        users (
          id,
          name,
          email
        )
      `)
      .eq('workspace_id', workspaceId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ members });
  } catch (e: any) {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
