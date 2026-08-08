import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-appsumo-signature');
    const timestamp = req.headers.get('x-appsumo-timestamp');
    const apiKey = process.env.APPSUMO_API_KEY;

    // Security check: Validate signature presence
    if (!signature || !timestamp || !apiKey) {
      return NextResponse.json({ error: 'Missing security headers' }, { status: 401 });
    }

    // Verify HMAC SHA256 Signature
    const hmac = crypto.createHmac('sha256', apiKey);
    hmac.update(timestamp + rawBody);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      console.error('AppSumo Webhook: Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // AppSumo sends test webhooks to validate the URL in the partner portal
    if (payload.test) {
      return NextResponse.json({ event: payload.event, success: true });
    }

    const { event, license_key, prev_license_key, plan_id, partner_plan_name } = payload;
    
    // Map AppSumo plans to OfferIQ plans
    // Default to starter, but check for higher tiers
    let newPlan = 'starter';
    const planIdentifier = (plan_id || partner_plan_name || '').toLowerCase();
    
    if (planIdentifier.includes('tier2') || planIdentifier.includes('tier 2') || planIdentifier.includes('growth')) {
      newPlan = 'growth';
    } else if (planIdentifier.includes('tier3') || planIdentifier.includes('tier 3') || planIdentifier.includes('agency')) {
      newPlan = 'agency';
    }

    switch (event) {
      case 'purchase':
        // A purchase occurred, but activation happens via OAuth redirect
        break;
      
      case 'activate':
        // AppSumo expects a 200 OK to mark the license as active on their end
        await supabaseAdmin
          .from('users')
          .update({ appsumo_license_status: 'active' })
          .eq('appsumo_license_key', license_key);
        break;

      case 'upgrade':
      case 'downgrade':
      case 'migrate':
        // Find user by their previous license key and update to the new one
        if (prev_license_key) {
          const { data: userToUpdate } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('appsumo_license_key', prev_license_key)
            .single();

          if (userToUpdate) {
            await supabaseAdmin
              .from('users')
              .update({ 
                appsumo_license_key: license_key,
                appsumo_tier: planIdentifier,
                plan: newPlan 
              })
              .eq('id', userToUpdate.id);
          }
        }
        break;

      case 'deactivate':
        // A refund or cancellation occurred. Revert user to free plan.
        const { data: userToDeactivate } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('appsumo_license_key', license_key)
          .single();

        if (userToDeactivate) {
          await supabaseAdmin
            .from('users')
            .update({ 
              plan: 'free',
              appsumo_license_status: 'deactivated',
              appsumo_license_key: null // Remove key so it cannot be used again
            })
            .eq('id', userToDeactivate.id);
        }
        break;
    }

    // Must return this exact format to satisfy AppSumo
    return NextResponse.json({ event, success: true });

  } catch (error) {
    console.error('AppSumo webhook processing error:', error);
    // Even on error, we should return a valid JSON structure for debug
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
