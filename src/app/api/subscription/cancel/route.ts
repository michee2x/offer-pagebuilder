import { getSession } from '@/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/subscription/cancel
 *
 * Cancels the authenticated user's active Paddle subscription.
 * Uses `effective_from: "next_billing_period"` — the user retains access
 * until the current billing period ends, then Paddle downgrades them.
 * Paddle will fire a `subscription.updated` webhook which the existing
 * webhook handler picks up and sets plan → free.
 */
export async function POST() {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch user's Paddle subscription ID and status from DB
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('paddle_subscription_id, subscription_status, plan')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const { paddle_subscription_id, subscription_status, plan } = user;

    // Guard: nothing to cancel if already free or no subscription
    if (!paddle_subscription_id) {
      return Response.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    if (subscription_status === 'canceled') {
      return Response.json(
        { error: 'Subscription is already canceled' },
        { status: 400 }
      );
    }

    // Call Paddle API to schedule cancellation at next billing period
    const apiKey = process.env.PADDLE_API_KEY;
    // Derive environment from the API key prefix — live keys start with 'pdl_live_'.
    // This avoids relying on NEXT_PUBLIC_PADDLE_ENVIRONMENT which may not be set on Vercel.
    const baseUrl = apiKey?.startsWith('pdl_live_')
      ? 'https://api.paddle.com'
      : 'https://sandbox-api.paddle.com';

    const paddleRes = await fetch(
      `${baseUrl}/subscriptions/${paddle_subscription_id}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ effective_from: 'next_billing_period' }),
      }
    );

    if (!paddleRes.ok) {
      const errBody = await paddleRes.json().catch(() => ({}));
      console.error('[cancel-sub] Paddle API error:', errBody);
      return Response.json(
        { error: errBody?.error?.detail ?? 'Failed to cancel with Paddle' },
        { status: paddleRes.status }
      );
    }

    const paddleData = await paddleRes.json();
    const effectiveAt: string | null =
      paddleData?.data?.scheduled_change?.effective_at ?? null;

    console.log(
      `[cancel-sub] Scheduled cancellation for user=${session.user.id} plan=${plan} effective_at=${effectiveAt}`
    );

    // Optimistically reflect in DB that cancellation is pending
    // The real plan downgrade happens via the webhook when the period ends.
    await supabaseAdmin
      .from('users')
      .update({
        subscription_status: 'canceled',
        scheduled_change_at: effectiveAt,
      })
      .eq('id', session.user.id);

    return Response.json({
      success: true,
      message: `Your subscription has been cancelled. You'll keep access until ${
        effectiveAt
          ? new Date(effectiveAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
          : 'the end of your billing period'
      }.`,
      effective_at: effectiveAt,
    });
  } catch (err: any) {
    console.error('[cancel-sub] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
