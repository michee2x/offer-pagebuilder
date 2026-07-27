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

  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ users });
  } catch (e: any) {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, name, role = 'user', password } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || undefined,
      email_confirm: true,
      user_metadata: { name },
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Build the base record (columns we know always exist)
    const baseRecord = {
      id: data.user.id,
      email: data.user.email,
      name: name || '',
      is_admin: role === 'admin',
    };

    // Try upsert with role column first
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .upsert({ ...baseRecord, role }, { onConflict: 'id' });

    if (dbError) {
      if (dbError.code === 'PGRST204') {
        // role column doesn't exist yet — upsert without it
        console.warn('role column missing, upserting without it. Run add_role_column.sql in Supabase.');
        const { error: fallbackError } = await supabaseAdmin
          .from('users')
          .upsert(baseRecord, { onConflict: 'id' });
        if (fallbackError) console.error('Error upserting user record (fallback):', fallbackError);
      } else {
        console.error('Error upserting user record:', dbError);
      }
    }

    return Response.json({ success: true, user: data.user });
  } catch (e: any) {
    console.error('Error creating user:', e);
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, role, plan } = body;

    if (!id) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    
    // Handle role
    if (role !== undefined) {
      updatePayload.role = role;
      if (role === 'admin') updatePayload.is_admin = true;
      if (role === 'user' || role === 'agency') updatePayload.is_admin = false;
    }
    
    // Handle plan & credits
    if (plan !== undefined) {
      updatePayload.plan = plan;
      
      let credits = 0;
      if (plan === 'starter') credits = 5;
      else if (plan === 'growth') credits = 10;
      else if (plan === 'agency') credits = 30;
      
      updatePayload.credits_remaining = credits;
      updatePayload.credits_total = credits;
      updatePayload.credits_reset_at = new Date().toISOString();
    }

    if (Object.keys(updatePayload).length === 0) {
      return Response.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ user: updatedUser });
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
    return Response.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    await supabaseAdmin.from('users').delete().eq('id', id);

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
