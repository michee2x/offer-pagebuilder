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
    ? `<a href="${blueprintUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
        Download Your Blueprint →
      </a>`
    : `<a href="#" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
        Access Your Dashboard →
      </a>`;

  const upsellBlock = upsellUrl
    ? `
      <!-- Upsell Pivot -->
      <tr>
        <td style="background:#141420;padding:0 40px 40px;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(109,40,217,0.15),rgba(79,70,229,0.1));border:1px solid rgba(109,40,217,0.2);border-radius:12px;padding:24px;">
            <tr><td style="padding:24px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(167,139,250,0.8);">Before You Go</p>
              <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#ffffff;line-height:1.5;">
                Thousands of people in the ${niche} space are already seeing results. If you're serious about taking this further, you'll want to see this:
              </p>
              <p style="margin:0 0 20px;font-size:20px;font-weight:900;color:#a78bfa;line-height:1.3;">
                ${upsellHook}
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:8px;">
                    <a href="${upsellUrl}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;">
                      Check It Out →
                    </a>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td>
      </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Blueprint</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6d28d9,#4f46e5);border-radius:16px 16px 0 0;padding:40px 40px 32px;text-align:center;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);">Your Blueprint Is Ready</p>
            <h1 style="margin:0;font-size:32px;font-weight:900;color:#ffffff;line-height:1.2;">Welcome, ${firstName}.</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#141420;padding:40px;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0 0 24px;font-size:16px;color:rgba(255,255,255,0.75);line-height:1.7;">
              You requested access to <strong style="color:#ffffff;">${offerName}</strong>${blueprintTopic !== offerName ? ` — specifically the <em>${blueprintTopic}</em> blueprint` : ''} — and here it is. Everything you need to get started is below.
            </p>

            <!-- Step list -->
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ['1', 'Review Your Blueprint', 'Read through the full framework and identify the 2-3 highest-leverage moves for your situation.'],
                ['2', 'Implement One Thing', 'Pick the single most impactful action and execute it within 48 hours. Speed beats perfection.'],
                ['3', 'Track Your Results', 'Measure the outcome. Real data beats theory — let the results guide your next move.'],
              ].map(([num, title, desc]) => `
              <tr>
                <td style="padding:0 0 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="40" valign="top" style="padding-right:16px;">
                        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#6d28d9,#4f46e5);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#ffffff;text-align:center;line-height:32px;">${num}</div>
                      </td>
                      <td>
                        <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#ffffff;">${title}</p>
                        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.55);line-height:1.6;">${desc}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`).join('')}
            </table>

            <!-- Divider -->
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:32px 0;" />

            <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.7;">
              If you have any questions or need help applying this to your specific situation, hit reply — we read every message.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#6d28d9,#4f46e5);border-radius:10px;">
                  ${ctaBlock}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${upsellBlock}

        <!-- Footer -->
        <tr>
          <td style="background:#0d0d18;border-radius:0 0 16px 16px;border:1px solid rgba(255,255,255,0.06);border-top:none;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:2px;text-transform:uppercase;">OfferIQ</p>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">
              You received this because you requested the blueprint. No spam, ever.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Resolve the active lead magnet download URL ──────────────────────────────

function resolveLeadMagnetUrl(blocks: any): { url: string | null; topic: string } {
  const activeFileId = blocks?.activeLeadMagnetFileId;
  const files = Array.isArray(blocks?.blueprintFiles) ? blocks.blueprintFiles : [];

  // 1. If an active file is explicitly selected, use it
  if (activeFileId && files.length > 0) {
    const match = files.find((f: any) => (f.id || f.fileName) === activeFileId);
    if (match?.url) {
      return { url: match.url, topic: match.topic || 'your blueprint' };
    }
  }

  // 2. Fallback: use the first file in the list
  if (files.length > 0 && files[0]?.url) {
    return { url: files[0].url, topic: files[0].topic || 'your blueprint' };
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

  // Send blueprint email (fire-and-forget — don't block the response)
  if (process.env.RESEND_API_KEY) {
    const { data: page } = await supabase
      .from('builder_pages')
      .select('name, subdomain, custom_domain, blocks')
      .eq('id', funnelId)
      .single();

    const blocks = page?.blocks || {};

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

    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    process.env.RESEND_FROM ?? 'OfferIQ <onboarding@resend.dev>',
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
    }).catch(e => console.error('[leads] email send failed:', e));
  }

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
