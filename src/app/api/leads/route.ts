import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

// ─── Blueprint email template ─────────────────────────────────────────────────

interface EmailContext {
  firstName: string;
  offerName: string;
  blueprintUrl: string | null;
  blueprintTopic: string;
  upsellHook: string;      // e.g. "Master Digital Marketing in 30 Days"
  upsellUrl: string | null; // link back to funnel upsell page
  niche: string;            // e.g. "digital marketing"
}

function buildBlueprintEmail(ctx: EmailContext): string {
  const { firstName, offerName, blueprintUrl, blueprintTopic, upsellHook, upsellUrl, niche } = ctx;

  const ctaBlock = blueprintUrl
    ? `<a href="${blueprintUrl}" target="_blank" style="display:inline-block;padding:12px 24px;font-size:16px;font-weight:600;color:#ffffff;background-color:#000000;border-radius:6px;text-decoration:none;">
        Download Your Blueprint
      </a>`
    : `<a href="#" style="display:inline-block;padding:12px 24px;font-size:16px;font-weight:600;color:#ffffff;background-color:#000000;border-radius:6px;text-decoration:none;">
        Access Your Dashboard
      </a>`;

  const upsellBlock = upsellUrl
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:40px;border-top:1px solid #eaeaea;">
        <tr>
          <td style="padding-top:30px;">
            <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#666666;text-transform:uppercase;letter-spacing:1px;">Before You Go</p>
            <p style="margin:0 0 16px;font-size:16px;color:#333333;line-height:1.6;">
              If you're serious about taking this further, you'll want to see this:
            </p>
            <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#111111;line-height:1.4;">
              ${upsellHook}
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <a href="${upsellUrl}" target="_blank" style="display:inline-block;padding:10px 20px;font-size:14px;font-weight:600;color:#000000;background-color:#f5f5f5;border:1px solid #e0e0e0;border-radius:6px;text-decoration:none;">
                    Check It Out &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Blueprint</title>
</head>
<body style="margin:0;padding:0;background-color:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;border:1px solid #eaeaea;overflow:hidden;">
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 24px;font-size:24px;font-weight:700;color:#111111;">Hi ${firstName},</h1>
              <p style="margin:0 0 24px;font-size:16px;color:#444444;line-height:1.6;">
                You requested access to <strong>${offerName}</strong>${blueprintTopic !== offerName ? ` — specifically the <em>${blueprintTopic}</em> blueprint` : ''}, and here it is. Everything you need to get started is below.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                ${[
                  ['1', 'Review Your Blueprint', 'Read through the full framework and identify the highest-leverage moves for your situation.'],
                  ['2', 'Implement One Thing', 'Pick the single most impactful action and execute it within 48 hours.'],
                  ['3', 'Track Your Results', 'Measure the outcome and let the results guide your next move.'],
                ].map(([num, title, desc]) => `
                <tr>
                  <td style="padding-bottom:16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" valign="top">
                          <div style="width:24px;height:24px;border-radius:12px;background-color:#f0f0f0;display:inline-block;text-align:center;line-height:24px;font-size:12px;font-weight:600;color:#333333;">${num}</div>
                        </td>
                        <td>
                          <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#111111;">${title}</p>
                          <p style="margin:0;font-size:14px;color:#666666;line-height:1.5;">${desc}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join('')}
              </table>

              <table cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                <tr>
                  <td>
                    ${ctaBlock}
                  </td>
                </tr>
              </table>

              ${upsellBlock}

            </td>
          </tr>
        </table>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999999;">
                You received this because you requested the blueprint. No spam, ever.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Resolve the active lead magnet download URL ──────────────────────────────

function resolveLeadMagnetUrl(blocks: any): { url: string | null; topic: string } {
  const activeFileId = blocks?.activeLeadMagnetFileId;
  const files = Array.isArray(blocks?.blueprintFiles) ? blocks.blueprintFiles : [];

  // Filter out any bonuses (only send lead magnet)
  const leadFiles = files.filter((f: any) => f.type !== 'bonus');

  // 1. If an active file is explicitly selected and it's a lead file, use it
  if (activeFileId && leadFiles.length > 0) {
    const match = leadFiles.find((f: any) => (f.id || f.fileName) === activeFileId);
    if (match?.url) {
      return { url: match.url, topic: match.topic || 'your blueprint' };
    }
  }

  // 2. Fallback: use the first lead file in the list
  if (leadFiles.length > 0 && leadFiles[0]?.url) {
    return { url: leadFiles[0].url, topic: leadFiles[0].topic || 'your blueprint' };
  }

  // 3. Legacy fallback: blocks.blueprintUrl (old format)
  return { url: blocks?.blueprintUrl || null, topic: 'your blueprint' };
}

// ─── POST /api/leads — capture a lead from a published funnel ─────────────────

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Accept any fields the AI form sends — only email is strictly required
  const { email, domain, sourcePage = '/', ...extraFields } = body;
  const name = body.name || body.fullName || body.firstName || 'Friend';

  if (!email) {
    return Response.json({ error: 'email is required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Resolve funnel from domain, pageId, or Referer URL
  let funnelId: string | null = body.pageId || null;
  const host = (domain ?? '').split(':')[0].toLowerCase();

  // Try to extract funnelId from the Referer header (useful for testing on /p/[id] or /funnels/[id])
  if (!funnelId) {
    const referer = req.headers.get('referer') || '';
    const match = referer.match(/\/p\/([^\/?#]+)/) || referer.match(/\/funnels\/([^\/?#]+)/);
    if (match) {
      funnelId = match[1];
    }
  }

  if (!funnelId && host && host !== 'localhost' && host !== '127.0.0.1') {
    const ofiqSuffix = '.ofiq.app';

    if (host.endsWith(ofiqSuffix)) {
      const subdomain = host.slice(0, -ofiqSuffix.length);
      if (subdomain) {
        const { data } = await supabase
          .from('builder_pages')
          .select('id')
          .eq('subdomain', subdomain)
          .limit(1)
          .single();
        funnelId = data?.id ?? null;
      }
    } else {
      const { data } = await supabase
        .from('builder_pages')
        .select('id')
        .eq('custom_domain', host)
        .limit(1)
        .single();
      funnelId = data?.id ?? null;
    }
  }

  if (!funnelId) {
    return Response.json({ error: 'Funnel not found for this domain' }, { status: 404 });
  }

  // Insert lead — store all extra fields the form captured
  const { data: lead, error: insertErr } = await supabase
    .from('leads')
    .insert({
      funnel_id:   funnelId,
      name:        name.trim(),
      email:       email.trim().toLowerCase(),
      phone:       extraFields.phone?.trim() || null,
      source_page: sourcePage,
    })
    .select()
    .single();

  if (insertErr) {
    console.error('[leads] insert error:', insertErr);
    return Response.json({ error: insertErr.message }, { status: 500 });
  }

  // Fetch page configuration for emails and webhooks
  const { data: page } = await supabase
    .from('builder_pages')
    .select('name, subdomain, custom_domain, blocks')
    .eq('id', funnelId)
    .single();

  const blocks = page?.blocks || {};

  // Fire Webhooks (Make & Zapier)
  const integrations = blocks.integrations || {};
  const payload = {
    ...lead,
    funnelName: page?.name || 'Unknown Funnel'
  };

  // Gather all async side-effects into an array so we can await them
  // If we don't await them, Next.js serverless functions will abruptly terminate the execution context
  // and cancel the outgoing network requests before they finish.
  const sideEffects: Promise<any>[] = [];

  if (integrations.makeWebhookUrl) {
    sideEffects.push(
      fetch(integrations.makeWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(e => console.error('[leads] make webhook failed:', e))
    );
  }

  if (integrations.zapierWebhookUrl) {
    sideEffects.push(
      fetch(integrations.zapierWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(e => console.error('[leads] zapier webhook failed:', e))
    );
  }

  // Send blueprint email
  if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
    const offerName =
      blocks.offerContext?.productType ||
      blocks.copy?.productName ||
      page?.name ||
      'your blueprint';

    // Resolve active lead magnet
    const leadMagnet = resolveLeadMagnetUrl(blocks);

    // Build niche & upsell context from offer intelligence
    const niche =
      blocks.offerContext?.niche ||
      blocks.offerContext?.industry ||
      blocks.copy?.niche ||
      'your field';

    const upsellHook =
      blocks.offerContext?.headline ||
      blocks.copy?.upsellHeadline ||
      (blocks.copy?.productName ? `Get the full ${blocks.copy.productName}` : null) ||
      `Take your ${niche} results to the next level`;

    // Build upsell URL — link back to the funnel's upsell page
    let upsellUrl: string | null = null;
    const funnelDomain = page?.custom_domain || (page?.subdomain ? `${page.subdomain}.ofiq.app` : null);
    if (funnelDomain) {
      upsellUrl = `https://${funnelDomain}/upsell`;
    } else {
      // Fallback: use the /p/ route
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ofiq.app';
      upsellUrl = `${siteUrl}/p/${funnelId}`;
    }

    const firstName = name.trim().split(' ')[0];

    sideEffects.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    process.env.RESEND_FROM,
          to:      [email.trim()],
          subject: `Your Blueprint is Here, ${firstName}!`,
          html:    buildBlueprintEmail({
            firstName,
            offerName,
            blueprintUrl: leadMagnet.url,
            blueprintTopic: leadMagnet.topic,
            upsellHook,
            upsellUrl,
            niche,
          }),
        }),
      })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) {
          console.error('[leads] Resend rejected email — status:', r.status, 'body:', JSON.stringify(body));
        } else {
          console.log('[leads] Email sent OK — id:', body.id, 'to:', email.trim());
        }
      })
      .catch(e => console.error('[leads] Resend fetch error:', e))
    );
  }

  // Await all side-effects to guarantee delivery before closing the response
  await Promise.allSettled(sideEffects);

  return Response.json({ success: true, lead }, { status: 201 });
}

// ─── GET /api/leads?funnelId=xxx — fetch leads for a funnel (owner only) ──────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const funnelId = searchParams.get('funnelId');

  if (!funnelId) {
    return Response.json({ error: 'funnelId is required' }, { status: 400 });
  }

  // Auth check via cookie-based client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const { data: page } = await supabase
    .from('builder_pages')
    .select('id')
    .eq('id', funnelId)
    .eq('user_id', user.id)
    .single();

  if (!page) {
    return Response.json({ error: 'Funnel not found' }, { status: 404 });
  }

  // Fetch leads with admin client (bypasses RLS)
  const admin = createAdminClient();
  const { data: leads, error } = await admin
    .from('leads')
    .select('id, name, email, phone, source_page, created_at')
    .eq('funnel_id', funnelId)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ leads });
}
