import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export const maxDuration = 60;

const CONTENT_PROMPT = `Generate a jaw-dropping, award-winning SaaS landing page for "OfferIQ" (an AI pricing & offer optimization platform).

DESIGN DIRECTIVE (GOD-TIER LEVEL):
- You are not just laying out blocks; you are building a visually breathtaking, Framer-tier website.
- The aesthetic is ULTRA-MODERN DARK MODE: deep blacks/grays (e.g., #09090b, #000000), vibrant neon gradients for accents, and glassmorphism.
- USE IMAGES HEAVILY! Use stunning tech/abstract Unsplash URLs (e.g., https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80, https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80, https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80).
- Do not let the UI look like stacked rectangles. Use overlapping gradients, subtle borders (e.g., border: '1px solid rgba(255,255,255,0.1)'), huge padding (e.g., padding: '8rem 2rem'), and massive border-radiuses (e.g., borderRadius: '24px').
- Use advanced Flexbox/Grid on "Container" blocks to create sophisticated side-by-side Hero sections, 3-column auto-fit grids for features, and overlapping image collages.

REQUIRED LAYOUT SECTIONS (Build them with rich nested Containers):
1. Hero Section: A 2-column flex-row container (or wrapping flex). Left side: Massive h1 text ("Transform Your Offers into Revenue"), glowing paragraph, and a vibrant CTA Button. Right side: A stunning abstract tech Image with rounded corners and a gorgeous glow/shadow.
2. Logo Bar (Social Proof): A minimalist flex-row container with 4-5 muted text elements acting as company logos, spaced evenly.
3. Feature Grid: A container acting as a CSS grid with 3 gorgeous, glassmorphic cards ("backgroundColor: rgba(255,255,255,0.03)", "border: 1px solid rgba(255,255,255,0.1)"). Include glowing accents.
4. Split Detail Section: A dark contrasting container section with a large Image on the left and compelling features/text on the right.
5. Footer CTA: A massive centered container with a gradient text heading, massive padding, and a final shiny button.

CRITICAL RESPONSIVENESS RULES:
- The design MUST be fluidly responsive across Desktop and Mobile using Intrinsic Web Design principles WITHOUT media queries!
- For any side-by-side layout (Hero, Grids, Splits), you MUST apply \`flexWrap: 'wrap'\` to the parent Container.
- You MUST give flex children a \`minWidth\` (e.g., \`minWidth: '300px'\`) or \`flex: '1 1 300px'\` so they automatically stack on smaller screens.
- Use \`clamp()\` for fonts and padding (e.g., \`fontSize: 'clamp(2rem, 5vw, 4rem)'\`).

Use the powerful inline "style" prop on EVERYTHING. Think deeply about spacing, letter spacing, font weights, and edge-to-edge layout design.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY in .env.local' }),
      { status: 500 }
    );
  }

  const systemPrompt = `You are an elite, world-class web designer building a Next.js/Shadcn page via a JSON schema.
You will return ONLY valid JSON containing an array of nested components forming a beautiful layout tree.

AVAILABLE COMPONENTS:
1. "Container" -> Structure block. Can hold children. Useful for flexbox rows/columns, grids, padding, background colors.
2. "Heading"   -> { text: string, level: "1"|"2"|"3"|"4"|"5"|"6" }
3. "Text"      -> { text: string }
4. "Button"    -> { text: string, variant: "default"|"destructive"|"outline"|"secondary"|"ghost"|"link", href: string }
5. "Image"     -> { src: string, alt: string, rounded: "none"|"sm"|"md"|"lg"|"full" }
6. "Card"      -> { title: string, content: string }
7. "Divider"   -> {}
8. "List"      -> { items: string (newline separated), ordered: "true"|"false" }

### THE MAGICAL "style" PROP ###
EVERY component accepts a "style" prop: { "style": { "camelCaseCSS": "value" } }.
You MUST use this extensively to style the page.
Use standard CSS properties: "display", "flexWrap", "justifyContent", "padding", "margin", "borderRadius", "boxShadow", "background", "color", "fontSize", etc.

### RESPONSIVENESS AND NESTING RULES (CRITICAL) ###
Since you are generating a professional layout, NEVER just return a flat array of text blocks.
You MUST nest components inside "Container" blocks to create layout sections (e.g., a Hero Section with flex-row).
For RESPONSIVENESS, parent Containers must have \`flexWrap: "wrap"\` and children must have \`minWidth\`.
Example responsive section:
{
  "id": "hero-container",
  "type": "Container",
  "props": { "style": { "display": "flex", "flexDirection": "row", "flexWrap": "wrap", "gap": "2rem", "padding": "clamp(2rem, 5vw, 4rem)", "alignItems": "center" } },
  "children": [
     { "id": "left-col", "type": "Container", "props": { "style": { "flex": "1 1 300px", "display": "flex", "flexDirection": "column" } }, "children": [...] },
     { "id": "right-col", "type": "Container", "props": { "style": { "flex": "1 1 300px" } }, "children": [...] }
  ]
}

RETURN FORMAT EXACTLY:
{
  "items": [
     // Nested JSON component tree here
  ]
}

DO NOT wrap the response in markdown blocks. Return standard JSON only.`;

  try {
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5';
    const { text } = await generateText({
      model: anthropic(model),
      system: systemPrompt,
      prompt: CONTENT_PROMPT,
    });

    // Parse JSON from the response (strip any accidental markdown if present)
    const jsonStr = text.replace(/```(?:json)?\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Generate error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Error generating page.' }), {
      status: 500,
    });
  }
}
