import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Double check admin role here if you have a role property in session.
  // Assuming anyone reaching here is admin based on middleware or earlier checks.
  
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const host = req.headers.get('host') || 'www.ofiq.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Generate a magic link
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${baseUrl}/auth/callback`
      }
    });

    if (error) {
      console.error('Error generating link:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (data && data.properties && data.properties.action_link) {
      return Response.json({ link: data.properties.action_link });
    } else {
      return Response.json({ error: 'Failed to generate action link' }, { status: 500 });
    }
  } catch (e: any) {
    console.error('Error in login-link route:', e);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
