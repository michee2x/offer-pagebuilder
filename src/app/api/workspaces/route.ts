import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('GET /api/workspaces for user:', session.user.id);
  const { data: workspaces, error } = await supabaseAdmin
    .from('workspaces')
    .select(`
      id,
      name,
      created_at,
      builder_pages (
        id,
        name,
        updated_at,
        og_image_url,
        blocks
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('GET /api/workspaces error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  console.log('GET /api/workspaces result count:', workspaces?.length ?? 0);
  return Response.json({ workspaces });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let name = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      name = body.name;
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const value = formData.get('name');
      name = typeof value === 'string' ? value : '';
    } else {
      // Support fallback for plain text or other encodings
      const text = await req.text();
      try {
        const body = JSON.parse(text || '{}');
        name = body.name;
      } catch {
        name = text;
      }
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('workspaces')
      .insert({
        name: name.trim(),
        user_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ workspace: data });
  } catch (e: any) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}