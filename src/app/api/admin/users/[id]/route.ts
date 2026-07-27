import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/users/[id] – fetch one user with their stats
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch per-user stats in parallel
    const [
      { count: workspacesCount },
      { count: funnelsCount },
      { count: leadsCount },
      { data: purchases },
    ] = await Promise.all([
      supabaseAdmin
        .from('workspaces')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', id),
      supabaseAdmin
        .from('builder_pages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', id),
      supabaseAdmin
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', id),
      supabaseAdmin
        .from('purchases')
        .select('amount')
        .eq('user_id', id),
    ]);

    const revenue = (purchases ?? []).reduce(
      (sum: number, p: { amount: unknown }) => sum + (Number(p.amount) || 0),
      0
    );

    return Response.json({
      user: {
        ...user,
        workspaces_count: workspacesCount ?? 0,
        funnels_count: funnelsCount ?? 0,
        leads_count: leadsCount ?? 0,
        purchases_count: purchases?.length ?? 0,
        revenue,
      },
    });
  } catch (e) {
    console.error('Error fetching user details:', e);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/users/[id] – update user fields (name, email, role)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

    try {
    const body = await req.json();
    const { name, email, role, plan } = body;

    // Build the public users-table update payload
    const tableUpdates: Record<string, unknown> = {};
    if (name !== undefined) tableUpdates.name = name;
    if (role !== undefined) {
      tableUpdates.role = role;
      // keep is_admin in sync
      tableUpdates.is_admin = role === 'admin';
    }
    if (plan !== undefined) {
      tableUpdates.plan = plan;
      
      let credits = 0;
      if (plan === 'starter') credits = 5;
      else if (plan === 'growth') credits = 10;
      else if (plan === 'agency') credits = 30;
      
      tableUpdates.credits_remaining = credits;
      tableUpdates.credits_total = credits;
      tableUpdates.credits_reset_at = new Date().toISOString();
    }
    if (email) tableUpdates.email = email;

    if (Object.keys(tableUpdates).length > 0) {
      const { error } = await supabaseAdmin
        .from('users')
        .update(tableUpdates)
        .eq('id', id);

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    // Update email in Supabase Auth if provided
    if (email) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        email,
      });
      if (authError) {
        return Response.json({ error: authError.message }, { status: 500 });
      }
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error('Error updating user:', e);
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
