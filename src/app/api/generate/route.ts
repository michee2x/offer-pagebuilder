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
TESTIMONIAL AVATARS — USE REALISTIC IMAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Whenever generating Testimonials, you MUST populate the avatarUrl field with realistic fake user portraits from pravatar. 
Use this exact format: https://i.pravatar.cc/150?u=[RANDOM_6_CHAR_STRING]
Do NOT leave it empty.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY PAGE STRUCTURE — READ CAREFULLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVERY page you generate MUST follow this rule:
1. The FIRST item in the "items" array MUST ALWAYS be a FeatureHeader component.
2. The LAST item in the "items" array MUST ALWAYS be a FeatureFooter component.
3. Between them, freely choose 3-6 modern Feature components based on the offer strategy. 
   CRITICAL: Do NOT simply output the same layout over and over. Choose different visual variants!
   For example, choose either 'FeatureHero' OR 'HeroCenter'. For features, choose either 'FeaturesGrid' or 'FeatureSplit'. Give the page dynamic visual variety.

If you generate a FeatureLogos component, populate its "logos" array using real, highly recognizable companies related to the offer. For each logo, provide the exact web domain (e.g., "stripe.com", "shopify.com", "slack.com").

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANCHOR NAVIGATION — CRITICAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The FeatureHeader uses anchor links to scroll to sections on the page.
Each section component you place MUST be given a "sectionId" prop matching the link.
Follow this exact mapping:
  - Any Hero component (FeatureHero, HeroCenter)          → sectionId: "hero"
  - FeatureLogos                                          → sectionId: "logos"
  - FeaturePricing                                        → sectionId: "pricing"
  - FeatureFAQ                                            → sectionId: "faq"
  - FeatureTestimonials                                   → sectionId: "testimonials"
  - Any features/content block (FeatureSplit, FeaturesGrid) → sectionId: "features"
  - FeatureCTA                                            → sectionId: "cta"

The FeatureHeader's "links" prop must include entries whose href values match the sectionIds like this:
  { "label": "Features",     "href": "#hero" }
  { "label": "Testimonials", "href": "#testimonials" }
  { "label": "Pricing",      "href": "#pricing" }
  { "label": "FAQ",          "href": "#faq" }
Only include links for sections that actually exist in the page you are generating.

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

Build a COMPLETE, high-converting sales funnel landing page.
REMEMBER: First item = FeatureHeader, Last item = FeatureFooter.
Fill the FeatureHeader "links" prop with anchor hrefs matching the sectionIds you assign.
Your job is pure Strategy and Copywriting — make it feel like a $10,000 copywriter wrote this.

DYNAMIC BLUEPRINTING:
Do NOT use the same generic sequence every time! Evaluate the offer above and design a custom, organic page structure.
Select the optimal component variants from the MACRO-COMPONENT REGISTRY that best fit your conversion strategy.
To combat layout fatigue, you MUST use different variants. Don't just use FeatureCard 10 times.

Use persuasive, benefit-driven language. Be bold. Be specific.
Headlines MUST be extremely short and punchy (3 to 8 words maximum). Never write a long sentence as a headline!
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
