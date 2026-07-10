import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getUser } from '@/auth';

export async function GET(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify user is a member of the workspace
    const { data: member, error: memberError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Unauthorized for this workspace' }, { status: 403 });
    }

    // Generate a secure state token and store it in a cookie or just use a basic state
    // For simplicity, we encode workspaceId in the state
    const state = Buffer.from(JSON.stringify({ workspaceId, userId: user.id })).toString('base64');
    const clientId = process.env.STRIPE_CLIENT_ID;

    if (!clientId) {
      return NextResponse.json({ error: 'Stripe Client ID not configured.' }, { status: 500 });
    }

    // We can assume Next.js request headers will provide host, but for local/production we should be safe
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/integrations/stripe/callback`;

    // Construct Stripe OAuth URL
    const stripeConnectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_write&state=${state}&redirect_uri=${redirectUri}`;

    return NextResponse.redirect(stripeConnectUrl);
  } catch (error: any) {
    console.error('[stripe connect] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

