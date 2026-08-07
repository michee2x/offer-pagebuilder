import { getSession } from '@/auth';
import { getUserWorkspaces } from '@/lib/workspaces';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const includeArchived = url.searchParams.get('include_archived') === 'true';
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const uniqueWorkspaces = await getUserWorkspaces(
      session.user.id,
      session.user.email || '',
      session.user.user_metadata?.name || '',
      includeArchived
    );

    return Response.json({ workspaces: uniqueWorkspaces });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let name = '';
    let domain = '';
    let subaccountEmail = '';
    let subaccountPermissions: any = { view: true, edit: false, delete: false, create: false };
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      name = body.name;
      domain = body.domain;
      subaccountEmail = body.subaccountEmail || '';
      subaccountPermissions = body.subaccountPermissions || { view: true, edit: false, delete: false, create: false };
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

    subaccountEmail = typeof subaccountEmail === 'string' ? subaccountEmail.trim() : '';

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    const cleanDomain = typeof domain === 'string' ? domain.trim().toLowerCase() : '';
    if (!cleanDomain || !/^[a-z0-9-]{3,30}$/.test(cleanDomain)) {
      return Response.json({ error: 'Workspace domain is required and must be valid' }, { status: 400 });
    }

    // Ensure user exists in users table and get their plan details
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id, plan, role, is_admin, workspace_limit')
      .eq('id', session.user.id)
      .maybeSingle();

    let userId = session.user.id;

    if (!existingUser && !userCheckError) {
      // Use session.user directly — no need for an extra Auth API call
      const { data: newUser, error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || '',
          password: '',
        })
        .select('id')
        .single();

      if (createUserError) {
        console.error('Failed to create user record:', createUserError);
        return Response.json({ error: 'Failed to create user record' }, { status: 500 });
      }

      userId = newUser.id;
    }

    // Check workspace limit
    const { count: workspacesCount } = await supabaseAdmin
      .from('workspaces')
      .select('id', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},owner_id.eq.${userId}`);

    const isAdmin = existingUser?.is_admin === true || existingUser?.role === 'admin';
    
    if (!isAdmin) {
      let limit = 1;
      if (existingUser) {
        if (typeof existingUser.workspace_limit === 'number' && existingUser.workspace_limit > 0) {
          limit = existingUser.workspace_limit;
        } else {
          const plan = existingUser.plan || 'free';
          if (plan === 'agency') limit = 30;
          else if (plan === 'growth') limit = 3;
          else limit = 1;
        }
      }

      if ((workspacesCount || 0) >= limit) {
        return Response.json({ error: 'Workspace limit reached. Upgrade your plan to create more.' }, { status: 403 });
      }
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

    // Handle Sub-Account Invitation
    if (subaccountEmail) {
      let subuserId = null;
      const inviteRedirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ofiq.app'}/auth/invite`;
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(subaccountEmail, {
        redirectTo: inviteRedirectUrl,
      });
      
      if (inviteError && inviteError.message.toLowerCase().includes('already registered')) {
        const { data: existUser } = await supabaseAdmin.from('users').select('id').eq('email', subaccountEmail).maybeSingle();
        if (existUser) {
          subuserId = existUser.id;
        }
      } else if (inviteData?.user) {
        subuserId = inviteData.user.id;
        // Prevent unique constraint errors during testing if the user was deleted from auth.users but not public.users
        await supabaseAdmin.from('users').delete().eq('email', subaccountEmail).neq('id', subuserId);
        
        // Ensure user exists in public.users table
        const { error: upsertErr } = await supabaseAdmin.from('users').upsert({
          id: subuserId,
          email: subaccountEmail,
          name: '',
          role: 'subaccount'
        }, { onConflict: 'id' });
        
        if (upsertErr) console.error("Upsert user error:", upsertErr);
      }

      if (subuserId) {
        const { error: memberInsertError } = await supabaseAdmin.from('workspace_members').insert({
          workspace_id: workspace.id,
          user_id: subuserId,
          role: 'member',
          permissions: subaccountPermissions
        });
        
        if (memberInsertError) {
          console.error("Failed to insert subaccount into workspace_members:", memberInsertError);
        }
      }
    }

    return Response.json({ workspace });
  } catch (e: any) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'Workspace ID is required' }, { status: 400 });
  }

  try {
    const { data: workspace, error: fetchError } = await supabaseAdmin
      .from('workspaces')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !workspace) {
      return Response.json({ error: 'Workspace not found' }, { status: 404 });
    }

    if (workspace.user_id !== session.user.id) {
      const { data: legacyWorkspace } = await supabaseAdmin
        .from('workspaces')
        .select('owner_id')
        .eq('id', id)
        .single();
      
      if (legacyWorkspace?.owner_id !== session.user.id) {
        return Response.json({ error: 'Forbidden: You must be the owner to delete this workspace' }, { status: 403 });
      }
    }

    const { count: pagesCount } = await supabaseAdmin
      .from('builder_pages')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', id);

    if (pagesCount && pagesCount > 0) {
      // Archive instead of delete
      const { error: archiveError } = await supabaseAdmin
        .from('workspaces')
        .update({ status: 'archived', archived_at: new Date().toISOString() })
        .eq('id', id);

      if (archiveError) {
        return Response.json({ error: archiveError.message }, { status: 500 });
      }

      return Response.json({ success: true, action: 'archived' });
    } else {
      // Hard delete if empty
      const { error: deleteError } = await supabaseAdmin
        .from('workspaces')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return Response.json({ error: deleteError.message }, { status: 500 });
      }

      return Response.json({ success: true, action: 'deleted' });
    }
  } catch (e: any) {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, domain, action } = body;

    if (!id) {
      return Response.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    // Verify ownership
    const { data: workspace, error: fetchError } = await supabaseAdmin
      .from('workspaces')
      .select('id, user_id, owner_id')
      .eq('id', id)
      .single();

    if (fetchError || !workspace) {
      return Response.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const isOwner =
      workspace.user_id === session.user.id ||
      workspace.owner_id === session.user.id;

    if (!isOwner) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'reactivate') {
      const { data: updated, error } = await supabaseAdmin
        .from('workspaces')
        .update({ status: 'active', archived_at: null })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json({ workspace: updated });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('workspaces')
      .update({ name, domain: domain.toLowerCase() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ workspace: updated });
  } catch (e: any) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}