import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Plan → credits mapping (mirrors webhook route)
const PLAN_CREDITS: Record<string, number> = {
  starter: 5,
  growth: 10,
  agency: 30,
};

// All price IDs → plan name (sandbox + live)
const PRICE_TO_PLAN: Record<string, string> = {
  // Sandbox
  'pri_01kyj6v0qyavxvd9v10c5xf459': 'starter',
  'pri_01kyj6n8yckwsd2ybzkb80k614': 'growth',
  'pri_01kyj6f94bvanvps5edphqzywv': 'agency',
  // Live
  'pri_01ky03yzfe5x26tmb44091s7bc': 'starter',
  'pri_01ky04c7rmqfx3086c97k06xf8': 'growth',
  'pri_01ky050888y453wtx015apdkz2': 'agency',
};

/**
 * Fetch the user's active subscription from Paddle by customer ID.
 * Returns the subscription object or null.
 */
async function fetchPaddleSubscription(customerId: string) {
  const apiKey = process.env.PADDLE_API_KEY;
  const env = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ?? 'sandbox';
  const baseUrl = env === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com';

  try {
    const res = await fetch(
      `${baseUrl}/subscriptions?customer_id=${customerId}&status=active,trialing&per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const subs: any[] = json?.data ?? [];
    // Return the most recent active/trialing subscription
    return subs[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * If the user has a paddle_customer_id but their DB plan is "free",
 * re-sync from Paddle API and correct the DB automatically.
 * This makes the system self-healing — webhook failures don't leave
 * users stuck on the wrong plan forever.
 */
async function syncPaddleSubscriptionIfNeeded(user: any): Promise<any> {
  // Only sync if user has a Paddle customer ID but is stuck on free
  if (!user.paddle_customer_id || user.plan !== 'free') return user;

  const sub = await fetchPaddleSubscription(user.paddle_customer_id);
  if (!sub) return user; // No active sub found — free is correct

  const priceId = sub.items?.[0]?.price?.id;
  const plan = PRICE_TO_PLAN[priceId] ?? null;
  if (!plan) return user; // Unrecognised price — leave unchanged

  const status = sub.status; // 'active' | 'trialing'
  const credits = PLAN_CREDITS[plan] ?? 0;

  console.log(`[user-sync] Correcting plan for user ${user.id}: free → ${plan} (sub ${sub.id})`);

  const { data: updated, error } = await supabaseAdmin
    .from('users')
    .update({
      plan,
      paddle_subscription_id: sub.id,
      subscription_status: status,
      credits_remaining: credits,
      credits_total: credits,
      credits_reset_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('[user-sync] Failed to correct plan:', error);
    return user;
  }

  // Log the correction (non-fatal — don't block the response if this fails)
  try {
    await supabaseAdmin.from('credit_transactions').insert({
      user_id: user.id,
      type: 'monthly_reset',
      amount: credits,
      balance_after: credits,
      note: `Auto-sync: corrected from free → ${plan} (webhook missed)`,
    });
  } catch {
    // ignore — credit log is non-fatal
  }

  return updated;
}

export async function GET() {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Auto-heal: if DB says free but Paddle has an active sub, fix it silently
    const syncedUser = await syncPaddleSubscriptionIfNeeded(user);

    return Response.json({ user: syncedUser });
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
    const { name, role } = body;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ name, role })
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ user });
  } catch (e: any) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
