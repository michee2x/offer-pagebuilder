import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Plan → credits mapping
const PLAN_CREDITS: Record<string, number> = {
  starter: 5,
  growth:  10,
  agency:  30,
};

// Sandbox + Live price IDs → plan name
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

// ── Paddle webhook signature verification ─────────────────────
function verifyPaddleSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;

  try {
    // Paddle-Signature header format: ts=TIMESTAMP;h1=HMAC_SHA256
    const parts = Object.fromEntries(
      signatureHeader.split(';').map(p => p.split('=') as [string, string])
    );
    const { ts, h1 } = parts;
    if (!ts || !h1) return false;

    const payload = `${ts}:${rawBody}`;
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    return expected === h1;
  } catch {
    return false;
  }
}

// ── Handlers ──────────────────────────────────────────────────
async function handleSubscriptionCreated(data: any) {
  const customerId    = data.customer_id;
  const subscriptionId = data.id;
  const priceId       = data.items?.[0]?.price?.id;
  const status        = data.status; // 'trialing' or 'active'
  const userId        = data.custom_data?.user_id;

  const plan = PRICE_TO_PLAN[priceId] ?? 'starter';
  const credits = PLAN_CREDITS[plan] ?? 0;

  // Find user — prefer custom_data.user_id, fall back to customer email
  let userQuery = supabaseAdmin.from('users').select('id, email');
  if (userId) {
    userQuery = userQuery.eq('id', userId) as any;
  } else {
    // Look up by Paddle customer email
    const customerEmail = data.customer?.email;
    if (!customerEmail) {
      console.error('[paddle] subscription.created: no user_id or email to match');
      return;
    }
    userQuery = userQuery.eq('email', customerEmail) as any;
  }

  const { data: user, error } = await (userQuery as any).single();
  if (error || !user) {
    console.error('[paddle] subscription.created: user not found', { userId, error });
    return;
  }

  // Update user record
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      plan,
      paddle_customer_id:    customerId,
      paddle_subscription_id: subscriptionId,
      subscription_status:   status,
      credits_remaining:     credits,
      credits_total:         credits,
      credits_reset_at:      new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('[paddle] subscription.created: update failed', updateError);
    return;
  }

  // Log initial credit grant
  await supabaseAdmin.from('credit_transactions').insert({
    user_id:       user.id,
    type:          'monthly_reset',
    amount:        credits,
    balance_after: credits,
    note:          `Initial grant for ${plan} plan (${status})`,
  });

  console.log(`[paddle] subscription.created: user=${user.id} plan=${plan} credits=${credits}`);
}

async function handleSubscriptionUpdated(data: any) {
  const customerId    = data.customer_id;
  const subscriptionId = data.id;
  const status        = data.status;
  const priceId       = data.items?.[0]?.price?.id;
  const scheduledChangeAt = data.scheduled_change?.effective_at ?? null;

  const plan = PRICE_TO_PLAN[priceId] ?? null;

  // Find user by paddle_customer_id
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, plan, credits_remaining')
    .eq('paddle_customer_id', customerId)
    .single();

  if (error || !user) {
    // May not be linked yet if subscription.created hasn't fired
    console.warn('[paddle] subscription.updated: user not found for customer', customerId);
    return;
  }

  const updatePayload: Record<string, any> = {
    subscription_status:    status,
    paddle_subscription_id: subscriptionId,
    scheduled_change_at:    scheduledChangeAt,
  };

  // If plan changed (upgrade/downgrade), update it
  if (plan && plan !== user.plan) {
    updatePayload.plan = plan;
    const newCredits = PLAN_CREDITS[plan] ?? 0;
    updatePayload.credits_remaining = newCredits;
    updatePayload.credits_total     = newCredits;
    updatePayload.credits_reset_at  = new Date().toISOString();

    await supabaseAdmin.from('credit_transactions').insert({
      user_id:       user.id,
      type:          'monthly_reset',
      amount:        newCredits,
      balance_after: newCredits,
      note:          `Plan changed to ${plan}`,
    });
  }

  // If canceled, downgrade to free
  if (status === 'canceled') {
    updatePayload.plan             = 'free';
    updatePayload.credits_remaining = 0;
    updatePayload.credits_total     = 0;
  }

  await supabaseAdmin
    .from('users')
    .update(updatePayload)
    .eq('id', user.id);

  console.log(`[paddle] subscription.updated: user=${user.id} status=${status} plan=${plan ?? user.plan}`);
}

async function handleTransactionCompleted(data: any) {
  // Only handle subscription renewals (recurring billing)
  if (!data.subscription_id) return;

  const customerId = data.customer_id;

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, plan')
    .eq('paddle_customer_id', customerId)
    .single();

  if (error || !user) return;

  const plan    = user.plan as string;
  const credits = PLAN_CREDITS[plan] ?? 0;
  if (credits === 0) return; // free plan — nothing to reset

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      credits_remaining: credits,
      credits_total:     credits,
      credits_reset_at:  new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('[paddle] transaction.completed: credit reset failed', updateError);
    return;
  }

  await supabaseAdmin.from('credit_transactions').insert({
    user_id:       user.id,
    type:          'monthly_reset',
    amount:        credits,
    balance_after: credits,
    note:          `Monthly renewal — ${plan} plan`,
  });

  console.log(`[paddle] transaction.completed: user=${user.id} credits reset to ${credits}`);
}

// ── Main route handler ─────────────────────────────────────────
export async function POST(req: Request) {
  const rawBody  = await req.text();
  const sigHeader = req.headers.get('paddle-signature');
  const secret   = process.env.PADDLE_WEBHOOK_SECRET ?? '';

  // 1. Verify signature
  if (!verifyPaddleSignature(rawBody, sigHeader, secret)) {
    console.error('[paddle] webhook signature verification failed');
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event_type, data } = event;
  console.log(`[paddle] received event: ${event_type}`);

  // 2. Dispatch to handler
  try {
    switch (event_type) {
      case 'subscription.created':
        await handleSubscriptionCreated(data);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(data);
        break;
      case 'transaction.completed':
        await handleTransactionCompleted(data);
        break;
      default:
        // Unhandled event — still return 200 so Paddle doesn't retry
        console.log(`[paddle] unhandled event type: ${event_type}`);
    }
  } catch (err) {
    console.error(`[paddle] error handling ${event_type}:`, err);
    // Return 200 anyway — Paddle retries on non-2xx, and we don't want infinite retries
    // Log to an error tracker in production
  }

  return Response.json({ received: true });
}
