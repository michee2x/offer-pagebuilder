import { createClient } from '@supabase/supabase-js';

type WorkspaceWithPages = {
  id: any;
  name: any;
  domain: any;
  created_at: any;
  status?: string;
  archived_at?: string | null;
  builder_pages: {
    id: any;
    name: any;
    updated_at: any;
    og_image_url: any;
    subdomain: any;
    custom_domain: any;
    blocks: any;
  }[];
  userPermissions?: any;
  userRole?: string;
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getUserWorkspaces(sessionUserId: string, sessionUserEmail: string, sessionUserName: string, includeArchived: boolean = false) {
  // Ensure user exists in users table
  const { data: existingUser, error: userCheckError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', sessionUserId)
    .maybeSingle();

  let userId = sessionUserId;

  if (!existingUser && !userCheckError) {
    const { data: newUser, error: createUserError } = await supabaseAdmin
      .from('users')
      .insert({
        id: sessionUserId,
        email: sessionUserEmail || '',
        name: sessionUserName || '',
      })
      .select('id')
      .single();

    if (createUserError) {
      console.error('Failed to create user record:', createUserError);
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
      status,
      archived_at,
      builder_pages (
        id,
        name,
        updated_at,
        og_image_url,
        subdomain,
        custom_domain,
        blocks
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (ownedError) {
    console.error('getUserWorkspaces owned workspaces error:', ownedError);
    throw new Error(ownedError.message);
  }

  // Then get workspaces where user is a member
  const { data: memberWorkspacesData, error: memberError } = await supabaseAdmin
    .from('workspace_members')
    .select(`
      workspace_id,
      role,
      permissions,
      workspaces (
        id,
        name,
        domain,
        created_at,
        status,
        archived_at,
        builder_pages (
          id,
          name,
          updated_at,
          og_image_url,
          subdomain,
          custom_domain,
          blocks
        )
      )
    `)
    .eq('user_id', userId);

  if (memberError) {
    console.error('getUserWorkspaces member workspaces error:', memberError);
    throw new Error(memberError.message);
  }

  // Combine and deduplicate workspaces
  const memberWorkspaces = memberWorkspacesData
    ?.map((item: any) => {
      const ws = Array.isArray(item.workspaces) ? item.workspaces[0] : item.workspaces;
      if (ws) {
        ws.userPermissions = item.permissions;
        ws.userRole = item.role;
      }
      return ws;
    })
    .filter((workspace): workspace is WorkspaceWithPages => Boolean(workspace)) || [];

  const allWorkspaces = [...(ownedWorkspaces || []), ...memberWorkspaces];

  const uniqueWorkspaces = allWorkspaces.filter(
    (workspace, index, self) =>
      index === self.findIndex(w => w.id === workspace.id) &&
      (includeArchived || workspace.status !== 'archived')
  );

  return uniqueWorkspaces;
}
