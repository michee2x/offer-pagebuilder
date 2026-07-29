/**
 * Lists your Paddle notification destinations and updates the webhook
 * secret key so it matches what's in your Vercel env vars.
 *
 * Usage:  node scripts/set-paddle-webhook-secret.mjs
 */

const PADDLE_API_KEY  = process.env.PADDLE_API_KEY || 'your_paddle_api_key_here';
const BASE_URL        = 'https://sandbox-api.paddle.com';
const WEBHOOK_URL     = 'https://www.ofiq.app/api/webhooks/paddle';

// ── The secret we will set (and what you put in Vercel PADDLE_WEBHOOK_SECRET) ──
const NEW_SECRET = 'ofiqwebhooksecret2026';

async function run() {
  // 1. List all notification settings (webhook destinations)
  const listRes = await fetch(`${BASE_URL}/notification-settings`, {
    headers: { Authorization: `Bearer ${PADDLE_API_KEY}` },
  });
  const listJson = await listRes.json();
  const destinations = listJson?.data ?? [];
  if (!listRes.ok) {
    console.log('List response:', JSON.stringify(listJson, null, 2));
    return;
  }

  console.log('\nAll notification destinations:');
  destinations.forEach(d => console.log(' -', d.id, d.endpoint_url ?? d.url ?? '(no url)'));

  // 2. Find ours by URL
  const dest = destinations.find(d =>
    (d.endpoint_url ?? d.url ?? '').includes('ofiq.app')
  );

  if (!dest) {
    console.error('\n❌ Could not find webhook destination for ofiq.app');
    console.log('Raw list response:', JSON.stringify(listJson, null, 2));
    return;
  }

  console.log(`\n✅ Found destination: ${dest.id}`);

  // 3. Update its secret key via PATCH /notification-settings/{id}
  const updateRes = await fetch(`${BASE_URL}/notification-settings/${dest.id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${PADDLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ secret_key: NEW_SECRET }),
  });

  const updateJson = await updateRes.json();

  if (!updateRes.ok) {
    console.error('\n❌ Update failed:', JSON.stringify(updateJson, null, 2));
    return;
  }

  console.log('\n✅ Secret key updated successfully!');
  console.log('\n👉 Now set this in your Vercel env vars:');
  console.log(`   PADDLE_WEBHOOK_SECRET = ${NEW_SECRET}`);
}

run().catch(console.error);
