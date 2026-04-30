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
    let domain = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      name = body.name;
      domain = body.domain;
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const nameValue = formData.get('name');
      const domainValue = formData.get('domain');
      name = typeof nameValue === 'string' ? nameValue : '';
      domain = typeof domainValue === 'string' ? domainValue : '';
    } else {
      const text = await req.text();
      try {
        const body = JSON.parse(text || '{}');
        name = body.name;
        domain = body.domain;
      } catch {
        name = text;
      }
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    const cleanDomain = typeof domain === 'string' ? domain.trim().toLowerCase() : '';
    if (!cleanDomain || !/^[a-z0-9-]{3,30}$/.test(cleanDomain)) {
      return Response.json({ error: 'Workspace domain is required and must be valid' }, { status: 400 });
    }

    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from('workspaces')
      .insert({
        name: name.trim(),
        domain: cleanDomain,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (workspaceError || !workspace) {
      const message = workspaceError?.message || 'Failed to create workspace';
      if (message.includes('workspaces_domain_key') || message.includes('duplicate key value')) {
        return Response.json({ error: 'That workspace domain is already taken. Please choose another one.' }, { status: 400 });
      }
      return Response.json({ error: message }, { status: 500 });
    }

    const { error: memberError } = await supabaseAdmin.from('workspace_members').insert({
      workspace_id: workspace.id,
      user_id: session.user.id,
      role: 'owner',
    });

    if (memberError) {
      return Response.json({ error: memberError.message }, { status: 500 });
    }

    return Response.json({ workspace });
  } catch (e: any) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}