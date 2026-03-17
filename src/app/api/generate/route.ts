import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { generateTheme, PageTheme } from '@/lib/ai-theme';
import { COMPONENT_REGISTRY, LUCIDE_ICON_NAMES } from '@/config/components';

export const maxDuration = 90;

// ─────────────────────────────────────────────────────────────────────────────
// Helper — build the Macro-Component focused system prompt
// ─────────────────────────────────────────────────────────────────────────────
function buildSystemPrompt(theme: PageTheme): string {
  // Extract Semantic Definitions dynamically from the registry
  const macroDefs = Object.values(COMPONENT_REGISTRY)
    .filter(c => c.semantic)
    .map(c => `
--- COMPONENT: ${c.type} ---
PURPOSE: ${c.semantic!.purpose}
EXAMPLE JSON USAGE:
${JSON.stringify({ type: c.type, props: c.semantic!.example }, null, 2)}
`)
    .join('\n');

  return `You are an elite funnel strategist and conversion copywriter building a world-class sales funnel page.
You output ONLY a JSON object. No markdown. No explanation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MACRO-COMPONENT REGISTRY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You must build the page using ONLY the following Macro-Components.
Do not invent components. Do not use generic layout blocks. 
Just select these components and fill out their high-converting copywriting props.
${macroDefs}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPROVED LUCIDE ICON NAMES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If a component REQUIRES an icon string, use ONE of these exact names:
${LUCIDE_ICON_NAMES.join(', ')}

🚫 NEVER use emojis.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTIVE BRAND THEME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The page is already styled perfectly via React components consuming CSS variables for the "${theme.name}" theme.
You do NOT need to write any CSS or Tailwind classes. The developers have handled 100% of the styling, animations, and responsive layout.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RETURN FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "items": [
    // Array of component JSON objects exactly matching the EXAMPLES above
  ]
}

- Every item in "items" MUST have an "id" field (generate a random 6-character string).
- Do NOT use "children" or nest components. The Macro-Components handle their own internal layout.
- Return standard JSON. No markdown fences. No comments inside JSON.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build the content prompt from offer context
// ─────────────────────────────────────────────────────────────────────────────
function buildContentPrompt(offerContext: any, theme: PageTheme): string {
  const hasOffer = offerContext && (offerContext.niche || offerContext.productType || offerContext.audience);

  const offerSection = hasOffer
    ? `OFFER DETAILS:
- Product/Service: ${offerContext.productType ?? 'Not specified'}
- Niche: ${offerContext.niche ?? 'Not specified'}
- Target Audience: ${offerContext.audience ?? 'Not specified'}
- Core Benefit: ${offerContext.benefit ?? 'Not specified'}
- Pain Point: ${offerContext.painPoint ?? 'Not specified'}
- Price Point: ${offerContext.price ?? 'Not specified'}
- Tone: ${offerContext.tone ?? 'Not specified'}
${offerContext.headlines ? `- Headlines to use: ${offerContext.headlines}` : ''}
${offerContext.cta ? `- CTA text: ${offerContext.cta}` : ''}`
    : `OFFER DETAILS: Build a stunning demo page for "OfferIQ" — an AI-powered offer & funnel builder for online businesses.
Core benefit: Turn any offer into a high-converting funnel page in minutes.
Target audience: Coaches, course creators, and e-commerce entrepreneurs.`;

  return `${offerSection}

DESIGN BRIEF — Theme: "${theme.name}" (${theme.styleTag})

Build a COMPLETE, high-converting 5-section sales funnel landing page.
Your job is pure Strategy and Copywriting. 

Sequence the Macro-Components logically. For example:
1. HeroSection (Hook them)
2. FeaturesSection (Explain the mechanism)
3. TestimonialsSection (Build trust)
4. PricingSection (The offer)
5. CTASection (Final push)

Make it feel like a $10,000 copywriter wrote this. Use persuasive, benefit-driven language.
Generate the JSON now. Remember to invent unique 6-character UUIDs for the 'id' fields.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY in .env.local' }, { status: 500 });
  }

  let offerContext: any = {};
  try {
    const body = await req.json().catch(() => ({}));
    offerContext = body.offerContext ?? {};
  } catch {
    // empty body is fine
  }

  // Determine theme from offer context
  const theme = generateTheme({
    niche: offerContext.niche,
    audience: offerContext.audience,
    tone: offerContext.tone,
    productType: offerContext.productType,
  });

  const systemPrompt = buildSystemPrompt(theme);
  const contentPrompt = buildContentPrompt(offerContext, theme);

  try {
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5';
    const { text } = await generateText({
      model: anthropic(model),
      system: systemPrompt,
      prompt: contentPrompt,
    });

    const jsonStr = text.replace(/```(?:json)?\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    // Return items + theme so client can store it
    return Response.json({ items: parsed.items, theme }, { status: 200 });
  } catch (err: any) {
    console.error('Generate error:', err);
    return Response.json({ error: err.message || 'Error generating page.' }, { status: 500 });
  }
}
