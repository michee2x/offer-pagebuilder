import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { ShadcnTheme } from '@/lib/themes';
import { COMPONENT_REGISTRY, LUCIDE_ICON_NAMES } from '@/config/components';

export const maxDuration = 90;

// ─────────────────────────────────────────────────────────────────────────────
// Helper — build the Macro-Component focused system prompt
// ─────────────────────────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
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
STYLING — DO NOTHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The page is ALREADY perfectly styled by the user's chosen theme (a shadcn CSS variable theme).
You do NOT write ANY CSS, Tailwind classes, colors, or style props.
CRITICALLY IMPORTANT: NEVER inject inline CSS or hack the elementStyles or style props. Leave them completely empty or absent!
Your ONLY job is: STRATEGY + COPYWRITING. Fill in the text props to maximise conversions.

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
function buildContentPrompt(offerContext: any): string {
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

Build a COMPLETE, high-converting sales funnel landing page consisting of 4 to 7 macro-components.
Your job is pure Strategy and Copywriting — make it feel like a $10,000 copywriter wrote this.

DYNAMIC BLUEPRINTING:
Do NOT use the same generic sequence every time! Evaluate the offer above and design a custom, organic page structure. For example, some pages might need more social proof (multiple testimonial blocks), others might just need a Hero and a Pricing block. 
Select the optimal component variants from the MACRO-COMPONENT REGISTRY that best fit your conversion strategy.

Use persuasive, benefit-driven language. Be bold. Be specific.
Generate the JSON now. Remember to invent unique 6-character IDs for the 'id' fields.`;
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

  const systemPrompt = buildSystemPrompt();
  const contentPrompt = buildContentPrompt(offerContext);

  try {
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5';
    const { text } = await generateText({
      model: anthropic(model),
      system: systemPrompt,
      prompt: contentPrompt,
    });

    const jsonStr = text.replace(/```(?:json)?\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    // Return items only — theme is now user-controlled, not AI-generated
    return Response.json({ items: parsed.items }, { status: 200 });
  } catch (err: any) {
    console.error('Generate error:', err);
    return Response.json({ error: err.message || 'Error generating page.' }, { status: 500 });
  }
}
