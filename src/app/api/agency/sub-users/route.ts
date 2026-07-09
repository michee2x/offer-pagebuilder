import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/auth';
import { hash } from 'bcryptjs';

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
    // Check if the current user is an Agency (has role 'agency')
    const { data: currentUser } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (currentUser?.role !== 'agency') {
      return Response.json({ error: 'Forbidden: Requires Agency access' }, { status: 403 });
    }

    // Fetch sub-users created by this agency owner
    const { data: subUsers, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('parent_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ subUsers });
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
    const { data: currentUser } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (currentUser?.role !== 'agency') {
      return Response.json({ error: 'Forbidden: Requires Agency access' }, { status: 403 });
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check sub-user limit (e.g., 20 clients)
    const { count, error: countError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', session.user.id);

    if (countError) {
      return Response.json({ error: 'Failed to verify account limits' }, { status: 500 });
    }

    if (count && count >= 20) {
      return Response.json({ error: 'Agency sub-account limit reached (Max 20)' }, { status: 403 });
    }

    // Try to create the user in the custom users table directly
    // since this project seems to use the public users table for auth (based on auth.ts)
    const hashedPassword = await hash(password, 10);
    
    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return Response.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        parent_id: session.user.id,
        role: 'user' // Default to basic user for the sub-account
      })
      .select()
      .single();

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    return Response.json({ user: newUser });
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
    return Response.json({ error: 'Sub-User ID is required' }, { status: 400 });
  }

  try {
    // Verify ownership before deleting
    const { data: userToDelete } = await supabaseAdmin
      .from('users')
      .select('parent_id')
      .eq('id', id)
      .single();

    if (!userToDelete || userToDelete.parent_id !== session.user.id) {
      return Response.json({ error: 'Forbidden: You do not own this sub-account' }, { status: 403 });
    }

    const { error } = await supabaseAdmin.from('users').delete().eq('id', id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
