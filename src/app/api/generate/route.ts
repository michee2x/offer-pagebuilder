import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export const maxDuration = 60;

const CONTENT_PROMPT = `Generate a beautiful, modern, and high-converting landing page for a SaaS product called "OfferIQ".

The page must feel professional and premium. Use ample spacing (padding/margin), centered sections, and cohesive typography.
The design is fundamentally DARK MODE, so use dark backgrounds (e.g. #09090b, #18181b) and light text (#f4f4f5, #a1a1aa).

Structure the page with these sections:
1. Hero Section: A massive, bold H1, a descriptive subheadline, and a primary CTA button. (Add plenty of top/bottom margin).
2. Divider.
3. Features Section: A section heading, followed by 3 rich Cards containing features.
4. Divider.
5. Social Proof / Testimonial: A stylistic quote.
6. Footer CTA: Another heading and button to close the page.

Apply rich inline CSS rules via the "style" prop on EVERYTHING to make it look incredible.
Use flexbox, maximum widths, centering, contrasting text colors, and proper typography sizing.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY in .env.local' }),
      { status: 500 }
    );
  }

  const systemPrompt = `You are an elite, world-class web designer building a Next.js/Shadcn page via a JSON schema.
You will return ONLY valid JSON containing an array of components.

AVAILABLE COMPONENTS AND PROPS:
1. "Heading"  -> { text: string, level: "1"|"2"|"3"|"4"|"5"|"6" }
2. "Text"     -> { text: string }
3. "Button"   -> { text: string, variant: "default"|"destructive"|"outline"|"secondary"|"ghost"|"link", href: string }
4. "Image"    -> { src: string, alt: string, rounded: "none"|"sm"|"md"|"lg"|"full" }
5. "Card"     -> { title: string, content: string }
6. "Divider"  -> {}
7. "List"     -> { items: string (newline separated), ordered: "true"|"false" }

### THE MAGICAL "style" PROP ###
EVERY component above also accepts a "style" prop: { "style": { "camelCaseCSS": "value" } }.
You MUST use this extensively to style the page.
Example styles you should use:
- { "textAlign": "center", "maxWidth": "800px", "margin": "0 auto", "padding": "4rem 2rem" }
- { "color": "#a1a1aa", "fontSize": "1.25rem", "lineHeight": "1.6" }

RETURN FORMAT EXACTLY:
{
  "items": [
    { 
      "id": "unique1", 
      "type": "Heading", 
      "props": { "text": "Build Faster", "level": "1", "style": { "textAlign": "center", "marginBottom": "2rem", "color": "#ffffff" } } 
    }
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
