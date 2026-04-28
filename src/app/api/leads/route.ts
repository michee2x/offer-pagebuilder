import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

// ─── Blueprint email template ─────────────────────────────────────────────────

function buildBlueprintEmail(firstName: string, offerName: string): string {
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
              You requested access to the <strong style="color:#ffffff;">${offerName}</strong> blueprint — and here it is. Everything you need to get started is below.
            </p>

            <!-- Step list -->
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ['1', 'Review Your Blueprint', 'Read through the full framework below and identify the 2-3 highest-leverage moves for your situation.'],
                ['2', 'Implement One Thing', 'Pick the single most impactful action and execute it within 48 hours. Speed of implementation beats perfection.'],
                ['3', 'Track Your Results', 'Measure the outcome. Real data beats theory every time — let the results guide your next move.'],
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
                  <a href="#" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                    Access Your Dashboard →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

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

// ─── POST /api/leads — capture a lead from a published funnel ─────────────────

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, email, phone, domain, sourcePage = '/' } = body;

  if (!name || !email) {
    return Response.json({ error: 'name and email are required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Resolve funnel from domain
  let funnelId: string | null = null;
  const host = (domain ?? '').split(':')[0].toLowerCase(); // strip port

  if (host && host !== 'localhost' && host !== '127.0.0.1') {
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

  // Insert lead
  const { data: lead, error: insertErr } = await supabase
    .from('leads')
    .insert({
      funnel_id:   funnelId,
      name:        name.trim(),
      email:       email.trim().toLowerCase(),
      phone:       phone?.trim() || null,
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
      .select('name, blocks')
      .eq('id', funnelId)
      .single();

    const offerName =
      page?.blocks?.offerContext?.productType ||
      page?.blocks?.copy?.productName ||
      page?.name ||
      'your blueprint';

    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    process.env.RESEND_FROM ?? 'OfferIQ <onboarding@resend.dev>',
        to:      [email.trim()],
        subject: `Your Blueprint is Here, ${name.trim().split(' ')[0]}!`,
        html:    buildBlueprintEmail(name.trim().split(' ')[0], offerName),
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
