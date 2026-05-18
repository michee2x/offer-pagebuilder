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

  return `You are a world-class conversion architect and elite frontend designer building premium, high-converting React landing pages and sales funnels.
Your code must look extremely premium, mimicking state-of-the-art SaaS sites (like Vercel, Linear, Stripe, and Apple).

━━━ DESIGN SYSTEM & VISUAL RULES ━━━
1. Theme & Colors:
   - Use high-fidelity dark-mode layouts (or modern high-contrast light-mode depending on product tone).
   - Prefer elegant gradients (e.g. "bg-gradient-to-br from-zinc-950 via-zinc-900 to-black"), glossy glassmorphism surfaces ("backdrop-blur-md bg-white/5 border border-white/10"), and extremely subtle glow accents ("shadow-[0_0_50px_-12px_rgba(245,166,35,0.15)]").
   - Never use solid ugly primary red/blue/green. Use harmonious, tailored HSL/Tailwind tokens: e.g., "text-amber-400", "bg-zinc-900", "border-zinc-800", "hover:bg-zinc-800/80".
2. Typography:
   - Make headers punchy and gorgeous. Use thin labels, glowing badges, and gradient text ("bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent").
   - Use a clear hierarchy: large display headers (text-4xl md:text-6xl font-extrabold tracking-tight), readable text (text-zinc-400 font-normal leading-relaxed).
3. Grid & Spacing:
   - Use rich, spacious layouts (py-16 md:py-24). Never crowd elements.
   - Design beautiful responsive grids: "grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8" for cards, reviews, or pricing.
   - Use cards with rich padding, subtle inner borders (border-white/5), and hover scale transitions ("transition-all duration-300 hover:scale-[1.02] hover:border-white/10").
4. Interactivity (State Hooks):
   - You are generating full, interactive React components!
   - Natively support React hooks (e.g. "import React, { useState } from 'react'").
   - You can use local state for lead capture forms, pricing calculators, interactive tabs, faq accordion toggles, or timer countdown tick states.
5. Standard Icons:
   - Import and use standard Lucide icons from "lucide-react": e.g. "import { ArrowRight, Shield, Star, Check, Sparkles } from 'lucide-react'".
   - Only use approved icons: ${icons}

━━━ FUNNEL STRUCTURAL PAGES ━━━
You must output exactly 4 pages in the funnel:
1. Lead Capture Page (path: "/")
   - A highly engaging hero section with a floating badge (e.g., "🔥 Exclusive Access").
   - A major benefit-driven main headline, a 2-sentence value subheadline, and high-trust bullets.
   - A conversion-optimized inline lead form with dynamic inputs (Email & Phone) and a prominent premium CTA button ("Claim Your Free Blueprint").
   - Trust and social proof logos (e.g. "As seen on TechCrunch, Bloomberg...").
   - Beautiful Grid of 3 core features or outcomes.
   - Option checklist, simple FAQ list, and elegant footer.
2. Upsell Offer Page (path: "/upsell")
   - Header bar with warning banner ("⚠️ Warning: Do not close this page. Your order is not yet complete...").
   - A compelling one-time upsell discount (e.g. "Upgrade your order to the Premium Accelerator for 70% OFF").
   - Grid or split layout: left showing a mock screen or product summary card, right showing the features.
   - Standard pricing tier card showing the regular price crossed out next to the special upsell price.
   - A large, highly visible "Yes, Add to My Order" accept button and a small muted link at the bottom for "No thanks, I will skip this and risk losing this deal".
3. Downsell Offer Page (path: "/downsell")
   - A conversational, empathetic downsell offer ("We understand. How about we split the payment?").
   - A lower entry price point, or an interest-free payment plan (e.g. "3 easy monthly payments of $49").
   - Clear value summary cards, testimonial, and CTA accept/decline links.
4. Thank You Page (path: "/thankyou")
   - Order complete success banner with a celebratory check icon.
   - A beautiful receipt/order summary card detailing what they unlocked.
   - A clear "Next Steps" checklist (e.g., Step 1: Check Inbox, Step 2: Join Community, Step 3: Complete Profile).
   - A prominent primary CTA button ("Join Our Discord Community" or "Go to Dashboard").

━━━ CTA LINKING RULES ━━━
- Lead Capture form action or button MUST link/redirect to: "/upsell"
- Upsell Accept CTA -> "/thankyou" | Decline link -> "/downsell"
- Downsell Accept CTA -> "/thankyou" | Decline link -> "/thankyou"

━━━ OUTPUT FORMAT RULES ━━━
- Output each page wrapped inside a dedicated \`<page path="..." name="...">\` XML-style tag.
- Inside the tag, write standard, valid **React TSX component code** starting with its standard imports and ending with the default component export.
- Do NOT wrap code inside Markdown code blocks (no \`\`\`tsx).
- Do NOT output any conversational text or comments outside of the page tags.
- Stream each page immediately.

Example:
<page path="/" name="Lead Capture">
import React, { useState } from 'react';
import { ArrowRight, Shield, Sparkles } from 'lucide-react';

export default function LeadCapture() {
  const [email, setEmail] = useState('');
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Premium Content */}
    </div>
  );
}
</page>
`;
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
2. COMPOSE — design each page with next-level visual design (grids, glowing accents, premium buttons)
3. WRITE — elite copy: specific, punchy, emotionally resonant, no filler

Begin streaming the <page> blocks now.`;
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
