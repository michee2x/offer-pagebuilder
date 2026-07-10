import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const stateStr = searchParams.get('state');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    if (error) {
      console.error('[stripe callback] Stripe returned an error:', error, error_description);
      return NextResponse.json({ error: error_description || 'Stripe connection failed' }, { status: 400 });
    }

    if (!code || !stateStr) {
      return NextResponse.json({ error: 'Missing code or state from Stripe' }, { status: 400 });
    }

    // Decode state
    let state: { workspaceId: string; userId: string };
    try {
      state = JSON.parse(Buffer.from(stateStr, 'base64').toString('utf-8'));
    } catch (e) {
      return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
    }

    const { workspaceId, userId } = state;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecret) {
      return NextResponse.json({ error: 'Stripe Secret Key not configured.' }, { status: 500 });
    }

    // Exchange the authorization code for an access token / account id
    const response = await fetch('https://connect.stripe.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_secret: stripeSecret,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('[stripe callback] OAuth token exchange failed:', data);
      return NextResponse.json({ error: data.error_description || 'Failed to exchange token with Stripe' }, { status: 400 });
    }

    const stripeAccountId = data.stripe_user_id;
    
    if (!stripeAccountId) {
      return NextResponse.json({ error: 'No Stripe Account ID returned.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify user is a member of the workspace
    const { data: member, error: memberError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Unauthorized for this workspace' }, { status: 403 });
    }

    // Upsert the payment integration
    const { error: upsertError } = await supabase
      .from('payment_integrations')
      .upsert({
        workspace_id: workspaceId,
        gateway: 'stripe',
        is_live: true, // You could determine this based on the environment
        credentials: { accountId: stripeAccountId },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'workspace_id, gateway'
      });

    if (upsertError) {
      console.error('[stripe callback] DB Upsert error:', upsertError);
      return NextResponse.json({ error: 'Failed to save Stripe integration' }, { status: 500 });
    }

    // Redirect the user back to the integrations page for the first funnel in that workspace,
    // or to a generic success page. Since we don't know the exact funnel ID here easily without querying,
    // let's query the first funnel ID for this workspace.
    const { data: firstFunnel } = await supabase
      .from('funnels')
      .select('id')
      .eq('workspace_id', workspaceId)
      .limit(1)
      .single();

    if (firstFunnel) {
      return NextResponse.redirect(new URL(`/funnels/${firstFunnel.id}/integrations?stripe_connected=true`, req.url));
    } else {
      return NextResponse.redirect(new URL(`/workspaces`, req.url));
    }

  } catch (error: any) {
    console.error('[stripe callback] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
