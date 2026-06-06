import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import type { OfferFormData, FunnelPageKey } from '@/lib/offer-types';
import {
  parseEmailSequenceV2,
  parseEmailSequence,
  clampEmailSequence,
  EMAIL_SEQUENCE_MIN_PER_PAGE,
  EMAIL_SEQUENCE_MAX_PER_PAGE,
} from '@/lib/offer-parser';
import { FUNNEL_PAGE_LABELS } from '@/lib/offer-types';

export const maxDuration = 120;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Email counts per page type (min 2, max 3 per section)
const PAGE_EMAIL_COUNTS: Record<FunnelPageKey, number> = {
  lead_capture: 3,
  sales_page: 3,
  upsell: 3,
  downsell: 2,
  thankyou: 2,
};

// Page sequence descriptions for the AI prompt
const PAGE_SEQUENCE_GUIDANCE: Record<FunnelPageKey, string> = {
  lead_capture:
    'Start with a warm welcome email that thanks them for opting in and delivers the promised lead magnet or value. Follow with nurture emails that build trust, share insights, tell stories, and naturally warm them up toward the sales page offer. The final email should tease or transition into the sales pitch.',
  sales_page:
    'These emails must be a dedicated direct-response sales campaign pitching the core product/offer itself (e.g., the course, coaching program, SaaS, etc.) that the user is selling. Instead of just continuing the general lead nurture stories, these emails should focus directly on the transaction: introducing the product by name, highlighting what is included in the purchase (modules, curriculum, features, bonuses), explaining the price/currency, offering the risk-reversal guarantee, addressing purchasing objections, and prompting a direct buy action.',
  upsell:
    'Post-purchase emails for buyers who just bought the main offer. Introduce the upgrade/premium offer naturally. Show how it accelerates or amplifies the results from the main purchase. Build desire for the next level.',
  downsell:
    'Emails for those who didn\'t take the upsell. Acknowledge their decision, then introduce a lighter/more affordable alternative. Position it as an easy win that complements their main purchase.',
  thankyou:
    'Post-purchase onboarding emails. Welcome them as a customer, set expectations for what happens next, deliver access instructions, and encourage early engagement with the product. Make them feel confident about their purchase.',
};

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  const { funnelId } = await params;

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
  }

  // Load funnel + intelligence context
  const { data: funnel, error: funnelErr } = await supabaseAdmin
    .from('builder_pages')
    .select('blocks, name')
    .eq('id', funnelId)
    .single();

  if (funnelErr || !funnel) {
    return Response.json({ error: 'Funnel not found' }, { status: 404 });
  }

  const intelligence = funnel.blocks?.intelligence;
  const formData: OfferFormData | undefined = intelligence?.raw_input;
  const call1 = intelligence?.call1;
  const copyData = funnel.blocks?.copy;

  if (!formData) {
    return Response.json(
      { error: 'Funnel has no offer data. Please complete the onboarding form first.' },
      { status: 400 }
    );
  }

  // Determine which funnel pages exist
  const declaredPages: FunnelPageKey[] =
    copyData?.declaration?.pages ??
    ['lead_capture', 'sales_page', 'thankyou'];

  // Case-insensitive property getter
  const getVal = (obj: any, key: string): string => {
    if (!obj) return '';
    const upper = key.toUpperCase();
    const lower = key.toLowerCase();
    return obj[upper] || obj[lower] || '';
  };

  let heroHook = '';
  if (copyData?.lead_capture?.sections?.[0]?.content) {
    heroHook = copyData.lead_capture.sections[0].content;
  } else if (copyData?.lead_capture?.markdown) {
    heroHook = copyData.lead_capture.markdown.replace(/[#*`>_\-]/g, '').trim();
  }

  // Build contextual prompt
  const contextSummary = [
    `OFFER NAME: ${formData.field_1_name}`,
    `OFFER FORMAT: ${formData.field_1_format}`,
    `OUTCOME: ${formData.field_2_outcome}`,
    `IDEAL BUYER: ${formData.field_3_persona}`,
    `PRICE: ${formData.field_4_price} ${formData.field_4_currency}`,
    formData.field_4_upsell ? `UPSELL: ${formData.field_4_upsell}` : '',
    `UNIQUE MECHANISM: ${formData.field_6_mechanism}`,
    `TRAFFIC CHANNELS: ${formData.field_7_channels?.join(', ')}`,
    `PRIMARY CHALLENGE: ${formData.field_8_challenge || 'Not specified'}`,
    call1 ? `SCORE SUMMARY: ${getVal(call1, 'SCORE_SUMMARY')}` : '',
    call1
      ? `PAIN POINTS (KEY): ${getVal(call1, 'PAIN_POINT_MAPPING').substring(0, 500)}`
      : '',
    heroHook ? `HERO HOOK: ${heroHook.substring(0, 200)}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  // Build per-page format instructions
  const pageInstructions = declaredPages
    .map((pageKey) => {
      const count = Math.min(
        EMAIL_SEQUENCE_MAX_PER_PAGE,
        Math.max(EMAIL_SEQUENCE_MIN_PER_PAGE, PAGE_EMAIL_COUNTS[pageKey] ?? 3)
      );
      const label = FUNNEL_PAGE_LABELS[pageKey] ?? pageKey;
      const guidance = PAGE_SEQUENCE_GUIDANCE[pageKey] ?? '';
      return `
=== ${pageKey.toUpperCase()} ===
Page: ${label}
Number of emails: ${count}
Guidance: ${guidance}

Write ${count} emails for this page section. Each email MUST follow this EXACT format:

EMAIL 1 — DAY [number]
SUBJECT: [Subject line — compelling, specific, under 50 characters]
PREVIEW: [Preview text — one punchy sentence]
HTML:
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[Subject line repeated here]</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-container {
      width: 100% !important;
    }
    .email-padding {
      padding-left: 20px !important;
      padding-right: 20px !important;
    }
    h1 {
      font-size: 18px !important;
    }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">[Preview text here]</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;">
<tr><td align="center" style="padding:40px 20px;" class="email-padding">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<!-- Header / Branding -->
<tr><td style="padding:32px 40px 0 40px;" class="email-padding">
<h1 style="margin:0;font-size:22px;line-height:1.4;color:#1a1a2e;font-weight:700;">[Email heading/hook]</h1>
</td></tr>
<!-- Body -->
<tr><td style="padding:24px 40px;font-size:15px;line-height:1.8;color:#3c3c4a;" class="email-padding">
[Email body paragraphs wrapped in <p> tags with margin:0 0 16px 0]
</td></tr>
<!-- CTA Button -->
<tr><td align="center" style="padding:8px 40px 32px 40px;" class="email-padding">
<a href="#" style="display:inline-block;background-color:#4f46e5;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;">[CTA text]</a>
</td></tr>
<!-- Footer -->
<tr><td style="padding:24px 40px;border-top:1px solid #e8e8ed;font-size:12px;color:#8c8c9a;text-align:center;" class="email-padding">
You're receiving this because you signed up for [Offer Name]. <a href="#" style="color:#4f46e5;text-decoration:underline;">Unsubscribe</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
---

EMAIL 2 — DAY [number]
...and so on for all ${count} emails.`;
    })
    .join('\n\n');

  const systemPrompt = `You are OfferIQ Email Sequence Engine. You write high-converting, personalised email nurture sequences for digital offers and return them as PRODUCTION-READY HTML emails.

Your emails must:
- Sound human and personal, not corporate or templated
- Reference the specific offer, mechanism, and persona
- Use the buyer's vocabulary (NOT business jargon unless the persona uses it)
- Be 200–350 words per email body
- Never use generic placeholder text like [First Name] — write it as a real email
- The subject lines must be compelling, specific, and under 50 characters
- Include a clear CTA (call-to-action) button in each email

HTML EMAIL RULES:
- Use ONLY inline CSS styles (no <style> blocks, no external stylesheets)
- Use table-based layout for email client compatibility
- Use the exact HTML structure template provided — do NOT invent your own layout
- Each email must be a complete, valid HTML document
- Include a hidden preheader div for preview text
- Use <p> tags for body paragraphs with style="margin:0 0 16px 0;font-size:15px;line-height:1.8;color:#3c3c4a;"
- The CTA button must use an <a> tag styled as a button with background-color:#4f46e5
- Wrap the <title> tag content with the email subject line
- Keep the email design clean, modern, and professional
- Use a light background (#f4f4f7) with white content card

EMAIL COUNT RULES:
- Each funnel page section must have between ${EMAIL_SEQUENCE_MIN_PER_PAGE} and ${EMAIL_SEQUENCE_MAX_PER_PAGE} emails only
- Never write more than ${EMAIL_SEQUENCE_MAX_PER_PAGE} or fewer than ${EMAIL_SEQUENCE_MIN_PER_PAGE} emails for any page section

CRITICAL RULES FOR SEQUENCE PROGRESSION:
- Each funnel page has its own email sequence section
- Emails within a page build on each other logically
- The FIRST email of each subsequent page picks up where the LAST email of the previous page left off
- This creates one continuous narrative journey across the entire funnel
- Day numbers should be CONTINUOUS across pages (don't restart from Day 1 for each page)`;

  const userPrompt = `Write a complete per-page email sequence for this offer. Return each email as FULL HTML CODE.

${contextSummary}

FUNNEL PAGES IN ORDER: ${declaredPages.map((k) => FUNNEL_PAGE_LABELS[k]).join(' → ')}

Write emails for EACH page section below. Use the exact page header format shown. Day numbers should be continuous across all pages (e.g., if lead_capture ends on Day 8, sales_page starts on Day 10).

${pageInstructions}`;

  try {
    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 16000,
      onFinish: async ({ text }) => {
        try {
          // Try v2 format first, fall back to flat
          let parsedSequence = clampEmailSequence(parseEmailSequenceV2(text));
          if (Object.keys(parsedSequence).length === 0) {
            // Fallback: try flat parser and assign to lead_capture
            const flat = parseEmailSequence(text);
            if (flat.length > 0) {
              parsedSequence = clampEmailSequence({ lead_capture: flat });
            }
          }

          if (Object.keys(parsedSequence).length === 0) {
            console.error(
              '[generate-email-sequence] AI returned no parseable emails onFinish.'
            );
            return;
          }

          // Persist to DB
          const { data: current } = await supabaseAdmin
            .from('builder_pages')
            .select('blocks')
            .eq('id', funnelId)
            .single();

          await supabaseAdmin
            .from('builder_pages')
            .update({
              blocks: {
                ...(current?.blocks || {}),
                email_sequence_v2: parsedSequence,
                email_sequence_generated_at: new Date().toISOString(),
              },
            })
            .eq('id', funnelId);
        } catch (dbErr) {
          console.error(
            '[generate-email-sequence] DB Update failed onFinish',
            dbErr
          );
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (e: any) {
    console.error('[generate-email-sequence]', e);
    return Response.json(
      { error: e.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
