import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/auth';

type WorkspaceWithPages = {
  id: any;
  name: any;
  domain: any;
  created_at: any;
  builder_pages: {
    id: any;
    name: any;
    updated_at: any;
    og_image_url: any;
    blocks: any;
  }[];
};

type WorkspaceMemberRecord = {
  workspace_id: any;
  workspaces: WorkspaceWithPages[] | null;
};

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

  // Ensure user exists in users table
  const { data: existingUser, error: userCheckError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', session.user.id)
    .maybeSingle();

  let userId = session.user.id;

  if (!existingUser && !userCheckError) {
      // Get authenticated user data from Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.getUser(session.user.id);

      if (authError) {
        console.error('Failed to get auth user:', authError);
        return Response.json({ error: 'Failed to authenticate user' }, { status: 401 });
      }

      // User doesn't exist in users table, create them
      const { data: newUser, error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: session.user.id,
          email: authUser.user?.email || session.user.email || '',
          name: authUser.user?.user_metadata?.name || '',
        })
        .select('id')
        .single();

      if (createUserError) {
        console.error('Failed to create user record:', createUserError);
        console.log('Continuing without user record creation for Supabase Auth user');
      } else if (newUser) {
        userId = newUser.id;
      }
  }

  // Then get owned workspaces
  const { data: ownedWorkspaces, error: ownedError } = await supabaseAdmin
    .from('workspaces')
    .select(`
      id,
      name,
      domain,
      created_at,
      builder_pages (
        id,
        name,
        updated_at,
        og_image_url,
        blocks
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  console.log('Owned workspaces query result:', {
    count: ownedWorkspaces?.length || 0,
    error: ownedError,
    data: ownedWorkspaces
  });

  if (ownedError) {
    console.error('GET /api/workspaces owned workspaces error:', ownedError);
    return Response.json({ error: ownedError.message }, { status: 500 });
  }

  // Then get workspaces where user is a member
  const { data: memberWorkspacesData, error: memberError } = await supabaseAdmin
    .from('workspace_members')
    .select(`
      workspace_id,
      workspaces (
        id,
        name,
        domain,
        created_at,
        builder_pages (
          id,
          name,
          updated_at,
          og_image_url,
          blocks
        )
      )
    `)
    .eq('user_id', userId);

  console.log('Member workspaces query result:', {
    count: memberWorkspacesData?.length || 0,
    error: memberError,
    data: memberWorkspacesData
  });

  if (memberError) {
    console.error('GET /api/workspaces member workspaces error:', memberError);
    return Response.json({ error: memberError.message }, { status: 500 });
  }

  // Combine and deduplicate workspaces
  const memberWorkspaces = memberWorkspacesData
    ?.map((item: WorkspaceMemberRecord) => item.workspaces?.[0])
    .filter((workspace): workspace is WorkspaceWithPages => Boolean(workspace)) || [];

  console.log('Processed member workspaces:', {
    count: memberWorkspaces.length,
    data: memberWorkspaces
  });

  const allWorkspaces = [...(ownedWorkspaces || []), ...memberWorkspaces];

  console.log('Combined workspaces before deduplication:', {
    count: allWorkspaces.length,
    data: allWorkspaces
  });

  // Remove duplicates based on id
  const uniqueWorkspaces = allWorkspaces.filter(
    (workspace, index, self) =>
      index === self.findIndex(w => w.id === workspace.id)
  );

  console.log('Final unique workspaces:', {
    count: uniqueWorkspaces.length,
    data: uniqueWorkspaces
  });

  console.log('GET /api/workspaces result count:', uniqueWorkspaces.length);
  return Response.json({ workspaces: uniqueWorkspaces });
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

    // Ensure user exists in users table
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle();

    let userId = session.user.id;

    if (!existingUser && !userCheckError) {
      // Get authenticated user data from Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.getUser(session.user.id);

      if (authError) {
        console.error('Failed to get auth user:', authError);
        return Response.json({ error: 'Failed to authenticate user' }, { status: 401 });
      }

      // User doesn't exist in users table, create them
      const { data: newUser, error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: session.user.id,
          email: authUser.user?.email || session.user.email || '',
          name: authUser.user?.user_metadata?.name || '',
          password: '', // Empty password for Supabase Auth users
        })
        .select('id')
        .single();

      if (createUserError) {
        console.error('Failed to create user record:', createUserError);
        return Response.json({ error: 'Failed to create user record' }, { status: 500 });
      }

      userId = newUser.id;
    }

    const insertWorkspace = async (payload: Record<string, any>) => {
      return supabaseAdmin.from('workspaces').insert(payload).select().single();
    };

    let workspace = null;
    let workspaceError = null;

    let insertResult = await insertWorkspace({
      name: name.trim(),
      domain: cleanDomain,
      user_id: userId,
    });
    workspace = insertResult.data;
    workspaceError = insertResult.error;

    if (workspaceError) {
      const message = workspaceError.message || '';
      if (message.includes('column "user_id"')) {
        insertResult = await insertWorkspace({
          name: name.trim(),
          domain: cleanDomain,
          owner_id: userId,
        });
        workspace = insertResult.data;
        workspaceError = insertResult.error;
      }
    }

    if (workspaceError || !workspace) {
      const message = workspaceError?.message || 'Failed to create workspace';
      if (message.includes('workspaces_domain_key') || message.includes('duplicate key value')) {
        return Response.json({ error: 'That workspace domain is already taken. Please choose another one.' }, { status: 400 });
      }
      return Response.json({ error: message }, { status: 500 });
    }

    const { error: memberError } = await supabaseAdmin.from('workspace_members').insert({
      workspace_id: workspace.id,
      user_id: userId,
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