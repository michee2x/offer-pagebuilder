import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { ShadcnTheme } from '@/lib/themes';
import { COMPONENT_REGISTRY, LUCIDE_ICON_NAMES } from '@/config/components';
import { createAdminClient } from '@/utils/supabase/admin';

export const maxDuration = 300; // 5 minutes maximum for Vercel

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
You must output a <thinking> block explaining your strategy, followed by a <json> block containing ONLY the JSON object.

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
3. For the Lead Capture page, freely choose 3-6 modern Feature components based on the offer strategy. 
   CRITICAL: Do NOT simply output the same layout over and over. Choose different visual variants!
   For example, choose either 'FeatureHero' OR 'HeroCenter'. For features, choose either 'FeaturesGrid' or 'FeatureSplit'. Give the page dynamic visual variety.
   NEVER use UpsellHero, DownsellHero, or ThankYouHero on the Lead Capture page!
4. For the Upsell page ("/upsell"), it MUST contain exactly two components between Header and Footer: the \`UpsellHero\` followed by \`FeatureTestimonials\`.
5. For the Downsell page ("/downsell"), it MUST contain exactly one component between Header and Footer: the \`DownsellHero\`.
6. For the Thank You page ("/thankyou"), it MUST contain exactly one component between Header and Footer: the \`ThankYouHero\`. Do NOT put sales letters or complex features on the Thank You page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANCHOR NAVIGATION — CRITICAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The FeatureHeader uses anchor links to scroll to sections on the page.
Each section component you place MUST be given a "sectionId" prop matching the link.
Follow this exact mapping:
  - Any Hero component (FeatureHero, HeroCenter)          → sectionId: "hero"
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
  "pages": [
    {
      "path": "/",
      "name": "Lead Capture",
      "items": [
        // Array of component JSON objects for the lead page
      ]
    },
    {
      "path": "/upsell",
      "name": "Upsell",
      "items": [
        // FeatureHeader, UpsellHero, FeatureTestimonials, FeatureFooter
      ]
    },
    {
      "path": "/downsell",
      "name": "Downsell",
      "items": [
        // FeatureHeader, DownsellHero, FeatureFooter
      ]
    },
    {
      "path": "/thankyou",
      "name": "Thank You",
      "items": [
        // FeatureHeader, ThankYouHero, FeatureFooter
      ]
    }
  ]
}

- Every item in "items" MUST have an "id" field (generate a random 6-character string).
- Do NOT use "children" or nest components. The Macro-Components handle their own internal layout.
- For CTAs on the Lead Capture page, ensure the "href" prop links to "/upsell". For Upsell CTA, link to "/thankyou", and for Decline link to "/downsell".
- Remember to wrap your deep strategic reasoning in <thinking> tags, and your JSON payload in <json> tags.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build the content prompt from offer context
// ─────────────────────────────────────────────────────────────────────────────
function buildContentPrompt(offerContext: any, copyContext: string | null): string {
  const hasOffer = offerContext && (offerContext.niche || offerContext.productType || offerContext.audience);
  
  let offerSection = '';
  
  if (copyContext) {
    offerSection = `OFFER INTELLIGENCE COPY:
We have already run an AI intelligence engine for this offer. The following is the highly-optimized sales copy generated specifically for this funnel.
YOU MUST USE THIS EXACT COPY FOR THE RELEVANT PAGES. DO NOT MAKE UP NEW HEADLINES OR TEXT IF THEY ARE PROVIDED HERE.

=== START PRE-WRITTEN COPY ===
${copyContext}
=== END PRE-WRITTEN COPY ===`;
  } else if (hasOffer) {
    offerSection = `OFFER DETAILS:
- Product/Service: ${offerContext.productType ?? 'Not specified'}
- Niche: ${offerContext.niche ?? 'Not specified'}
- Target Audience: ${offerContext.audience ?? 'Not specified'}
- Core Benefit: ${offerContext.benefit ?? 'Not specified'}
- Pain Point: ${offerContext.painPoint ?? 'Not specified'}
- Price Point: ${offerContext.price ?? 'Not specified'}
- Tone: ${offerContext.tone ?? 'Not specified'}
${offerContext.headlines ? `- Headlines to use: ${offerContext.headlines}` : ''}
${offerContext.cta ? `- CTA text: ${offerContext.cta}` : ''}`;
  } else {
    offerSection = `OFFER DETAILS: Build a stunning demo page for "OfferIQ" — an AI-powered offer & funnel builder for online businesses.
Core benefit: Turn any offer into a high-converting funnel page in minutes.
Target audience: Coaches, course creators, and e-commerce entrepreneurs.`;
  }

  return `${offerSection}

Build a COMPLETE, high-converting MULTI-PAGE sales funnel (Lead Capture + Thank You pages).
REMEMBER: First item on EACH page = FeatureHeader, Last item = FeatureFooter.
Fill the FeatureHeader "links" prop with anchor hrefs matching the sectionIds you assign.
Your job is pure Strategy and Copywriting — make it feel like a $10,000 copywriter wrote this.

DYNAMIC BLUEPRINTING:
Do NOT use the same generic sequence every time! Evaluate the offer above and design custom, organic page structures for both pages.
Make the Lead Capture page highly persuasive. Make the Thank You page confirming and provide the next steps.
Select the optimal component variants from the MACRO-COMPONENT REGISTRY that best fit your conversion strategy.
To combat layout fatigue, you MUST use different variants. Don't just use FeatureCard 10 times.

Use persuasive, benefit-driven language. Be bold. Be specific.
Headlines MUST be extremely short and punchy (3 to 8 words maximum). Never write a long sentence as a headline!
Generate your response now. Think deeply step by step inside <thinking>, then dump the <json>.`;
}


// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY in .env.local' }, { status: 500 });
  }

  let offerContext: any = {};
  let funnelId: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    offerContext = body.offerContext ?? {};
    funnelId = body.funnelId;
  } catch {
    // empty body is fine
  }

  let copyContext: string | null = null;
  if (funnelId) {
    try {
      const supabase = createAdminClient();
      const { data } = await supabase.from('builder_pages').select('blocks').eq('id', funnelId).single();
      if (data?.blocks?.copy) {
        copyContext = JSON.stringify(data.blocks.copy, null, 2);
      }
    } catch (e) {
      console.error('Failed to load intelligence copy context', e);
    }
  }

  const systemPrompt = buildSystemPrompt();
  const contentPrompt = buildContentPrompt(offerContext, copyContext);

  try {
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5';
    
    // We stream the raw text back to the client so it can visualize the <thinking> block
    const result = streamText({
      model: anthropic(model),
      system: systemPrompt,
      prompt: contentPrompt,
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error('Generate error:', err);
    return Response.json({ error: err.message || 'Error generating page.' }, { status: 500 });
  }
}
