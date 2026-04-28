import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { LUCIDE_ICON_NAMES } from '@/config/components';
import { createAdminClient } from '@/utils/supabase/admin';

export const maxDuration = 300;

const MODEL          = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
const MAX_OUTPUT_TOKENS = 32_000;

// ─────────────────────────────────────────────────────────────────────────────
// System prompt — teaches the micro-component DSL; no macro definitions
// ─────────────────────────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  const icons = LUCIDE_ICON_NAMES.join(', ');

  return `You are an elite conversion architect building world-class sales funnels.
Pages are composed of PageSection items, each containing a blocks array.

━━━ PAGESECTION PROPS ━━━
theme:   "default" | "muted" | "primary" | "card" | "dark"
layout:  "center" | "left" | "split"
padding: "none" | "sm" | "md" | "lg" | "xl"
blocks:  Block[]

━━━ BLOCK VOCABULARY ━━━

Layout (can nest other blocks):
  Row   { type, align?:"start"|"center"|"end", justify?:"start"|"center"|"end"|"between", gap?:"sm"|"md"|"lg", wrap?:boolean, blocks }
  Col   { type, align?:"start"|"center"|"end", gap?:"sm"|"md"|"lg", blocks }
  Grid  { type, cols:2|3|4, gap?:"sm"|"md"|"lg", blocks }
  Card  { type, accent?:boolean, blocks }

Typography:
  H1 / H2 / H3 / H4   { type, text, align?:"left"|"center"|"right" }
  Paragraph            { type, text, align?, size?:"sm"|"base"|"lg"|"xl", weight?:"normal"|"medium"|"semibold" }
  Badge                { type, text, variant?:"default"|"secondary"|"outline" }
  Checklist            { type, items:string[] }

UI atoms:
  Button         { type, text, href, variant?:"default"|"outline"|"ghost"|"secondary", size?:"sm"|"default"|"lg", icon? }
  Divider        { type }
  Spacer         { type, size?:"sm"|"md"|"lg" }
  Icon           { type, name, size?:"sm"|"md"|"lg" }

Composites:
  NavBar          { type, logo, links?:[{text,href}], ctaText?, ctaHref? }
  Footer          { type, logo, copy, links?:[{text,href}] }
  FeatureItem     { type, icon, title, description }
  TestimonialCard { type, name, role, quote, initials, stars? }
  StatItem        { type, value, label, icon? }
  PricingTier     { type, name, price, period?, description?, features:string[], ctaText, ctaHref, highlighted? }
  FAQList         { type, items:[{question,answer}] }
  VideoEmbed      { type, url }
  LeadCapturePopup { type, triggerText, headline, subheadline?, collectPhone?:boolean, submitText, successTitle?, successMessage? }
  CountdownTimer  { type, targetHours:number, style?:"minimal"|"bold" }
  UpsellOffer     { type, headline, subheadline?, price, originalPrice?, ctaText, ctaHref, declineText?, declineHref? }
  DownsellOffer   { type, headline, subheadline?, price, paymentText?, ctaText, ctaHref, declineText?, declineHref? }
  ThankYouBlock   { type, headline, subheadline?, receiptAmount?, steps?:string[], ctaText?, ctaHref? }

Approved icons (use exact names): ${icons}

━━━ FUNNEL STRUCTURE RULES ━━━
Lead Capture (/):
  1. PageSection(theme:"default", padding:"sm") → NavBar block
  2. PageSection(theme:"primary", padding:"xl") → hero: Col → Badge, H1, Paragraph, LeadCapturePopup (collectPhone:true)
  3-6. Mix of muted/card/default sections with FeatureItems, TestimonialCards, StatItems, FAQList, CountdownTimer, etc.
  Last: PageSection(theme:"muted", padding:"sm") → Footer block

Upsell (/upsell):
  1. PageSection(theme:"default", padding:"sm") → NavBar
  2. PageSection(theme:"primary"|"dark", padding:"xl") → UpsellOffer
  3. PageSection(theme:"muted", padding:"lg") → Grid(cols:3) of TestimonialCards
  Last: PageSection(theme:"muted", padding:"sm") → Footer

Downsell (/downsell):
  1. PageSection(theme:"default", padding:"sm") → NavBar
  2. PageSection(theme:"primary"|"dark", padding:"xl") → DownsellOffer
  Last: PageSection(theme:"muted", padding:"sm") → Footer

Thank You (/thankyou):
  1. PageSection(theme:"default", padding:"sm") → NavBar
  2. PageSection(theme:"primary", padding:"xl") → ThankYouBlock
  Last: PageSection(theme:"muted", padding:"sm") → Footer

━━━ COMPOSITION RULES ━━━
• NavBar and Footer are always solo in their PageSection
• UpsellOffer / DownsellOffer / ThankYouBlock each get their own PageSection
• Group FeatureItems in Grid(cols:3), TestimonialCards in Grid(cols:3)
• Group PricingTiers in Grid(cols:2) or Grid(cols:3) depending on tier count
• FAQList stands alone inside a Col; max-width naturally constrains it
• Use Col to stack Badge → H1 → Paragraph → Button for hero blocks
• Alternate section themes for visual rhythm (never two "primary" sections in a row)
• CountdownTimer adds urgency — use on lead capture hero and upsell sections
• Split layout works well for feature explanations (text + FeatureItem list)
• LeadCapturePopup is the ONLY opt-in mechanism on Lead Capture pages — never use a plain Button or EmailCapture for the main CTA
• Set collectPhone:true on LeadCapturePopup; write a compelling headline ("Get Your Free Blueprint") and subheadline that reinforces the value exchange

━━━ CTA LINK RULES ━━━
• Lead Capture CTAs → href: "/upsell"
• Upsell accept CTAs → href: "/thankyou" | decline → href: "/downsell"
• Downsell accept CTAs → href: "/thankyou" | decline → href: "#"

━━━ COPY RULES ━━━
• H1: 5-10 words — punchy emotional claim, benefit-first
• Paragraphs: max 2 sentences, specific and credible
• CTA buttons: action verb + specific benefit ("Start Losing Fat Today")
• TestimonialCard quotes: include specific measurable results
• FeatureItem descriptions: lead with outcomes, not features
• NEVER use emojis, NEVER use generic filler like "Lorem ipsum"
• Tone must match the offer audience precisely

━━━ OUTPUT FORMAT ━━━
Return ONLY valid JSON wrapped in <json></json>.
Every item needs a unique 6-char alphanumeric id. Output all 4 pages.

<json>
{
  "pages": [
    {
      "path": "/",
      "name": "Lead Capture",
      "items": [
        {
          "id": "nav001",
          "type": "PageSection",
          "props": {
            "theme": "default",
            "layout": "center",
            "padding": "sm",
            "blocks": [
              { "type": "NavBar", "logo": "BrandName", "ctaText": "Get Started", "ctaHref": "/upsell" }
            ]
          }
        }
      ]
    },
    { "path": "/upsell",   "name": "Upsell",    "items": [] },
    { "path": "/downsell", "name": "Downsell",  "items": [] },
    { "path": "/thankyou", "name": "Thank You", "items": [] }
  ]
}
</json>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Content prompt — offer-specific context
// ─────────────────────────────────────────────────────────────────────────────
function buildContentPrompt(offerContext: any, copyContext: string | null): string {
  let offerSection: string;

  if (copyContext) {
    offerSection = `OFFER INTELLIGENCE & PRE-WRITTEN COPY (use directly in block props):

=== COPY ===
${copyContext}
=== END COPY ===`;
  } else if (offerContext && Object.values(offerContext).some(Boolean)) {
    offerSection = `OFFER DETAILS:
• Product/Service: ${offerContext.productType ?? 'Not specified'}
• Niche: ${offerContext.niche ?? 'Not specified'}
• Target Audience: ${offerContext.audience ?? 'Not specified'}
• Core Benefit: ${offerContext.benefit ?? 'Not specified'}
• Pain Point: ${offerContext.painPoint ?? 'Not specified'}
• Price Point: ${offerContext.price ?? 'Not specified'}
• Tone: ${offerContext.tone ?? 'Not specified'}
${offerContext.headlines ? `• Headlines: ${offerContext.headlines}` : ''}
${offerContext.cta ? `• CTA: ${offerContext.cta}` : ''}`;
  } else {
    offerSection = `OFFER: "OfferIQ" — AI funnel builder that generates high-converting funnels in minutes.
Audience: Coaches, course creators, and e-commerce entrepreneurs tired of slow, expensive funnel agencies.`;
  }

  return `${offerSection}

TASK: Generate a complete 4-page sales funnel (Lead Capture, Upsell, Downsell, Thank You).

Process:
1. ANALYSE — who is the buyer, what is their #1 fear, what result do they want most?
2. COMPOSE — design the section sequence per page, vary themes for visual rhythm
3. WRITE — elite copy: specific, punchy, emotionally resonant, no filler

Output the <json> block now.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
  }

  let offerContext: any = {};
  let funnelId: string | undefined;

  try {
    const body = await req.json().catch(() => ({}));
    offerContext = body.offerContext ?? {};
    funnelId     = body.funnelId;
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  let copyContext: string | null = null;
  if (funnelId) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('builder_pages')
        .select('blocks')
        .eq('id', funnelId)
        .single();
      if (!error && data?.blocks?.copy) {
        copyContext = JSON.stringify(data.blocks.copy, null, 2);
      }
    } catch (e) {
      console.error('[generate] Failed to fetch copy context:', e);
    }
  }

  const systemPrompt  = buildSystemPrompt();
  const contentPrompt = buildContentPrompt(offerContext, copyContext);

  console.log('[generate] model:', MODEL, '| maxTokens:', MAX_OUTPUT_TOKENS, '| funnelId:', funnelId ?? 'none');

  const encoder = new TextEncoder();

  try {
    const result = streamText({
      model:           anthropic(MODEL),
      system:          systemPrompt,
      prompt:          contentPrompt,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const send = (type: string, data: string) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));

        let fullText = '';

        try {
          for await (const part of result.fullStream) {
            if (part.type === 'text-delta') {
              fullText += part.text;
            } else if (part.type === 'reasoning-delta') {
              send('thinking', part.text);
            } else if (part.type === 'error') {
              send('error', String(part.error));
            } else if (part.type === 'finish') {
              console.log('[generate] finish — usage:', JSON.stringify(part.totalUsage ?? {}));
            }
          }

          console.log('[generate] complete — output length:', fullText.length, '| has <json>:', fullText.includes('<json>'));
          send('complete', fullText);

        } catch (err: any) {
          console.error('[generate] stream error:', err);
          send('error', err?.message ?? 'Stream failed');
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
      },
    });

  } catch (err: any) {
    console.error('[generate] failed to init stream:', err);
    return Response.json({ error: err?.message ?? 'Failed to start generation' }, { status: 500 });
  }
}
