import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export const maxDuration = 60;

const CONSTANT_CONTENT_DOC = `
OfferIQ Waitlist Page
Header: "Supercharge Your Offers with AI"
Description: "The only platform you need to build, test, and launch high-converting offers in seconds. Stop guessing what works and start knowing."
Call to Action: "Join the Waitlist"
Testimonial: "OfferIQ increased our conversion rate by 200% on the first day." - Sarah Jenkins, CMO
`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY in .env.local' }),
      { status: 500 }
    );
  }

  const systemPrompt = `You are a professional web designer. Given a raw content document, translate it into a structured JSON for an AI page builder.

Available components:
1. "Heading" -> props: { text: string, level: "1"|"2"|"3"|"4"|"5"|"6" }
2. "Text" -> props: { text: string, color: "#ffffff" }
3. "Button" -> props: { text: string, variant: "default"|"destructive"|"outline"|"secondary"|"ghost"|"link" }
4. "Image" -> props: { src: string, alt: string, rounded: "none"|"sm"|"md"|"lg"|"full" }

IMPORTANT: Return ONLY valid JSON with no markdown formatting, no code fences.
The JSON must be: { "items": [{ "id": "abc123", "type": "Heading", "props": { "text": "...", "level": "1" } }, ...] }
Each id must be a unique short alphanumeric string. Include 4-8 components based on the content.`;

  try {
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5';
    const { text } = await generateText({
      model: anthropic(model),
      system: systemPrompt,
      prompt: `Translate this content into the page builder JSON:\n\n${CONSTANT_CONTENT_DOC}`,
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
