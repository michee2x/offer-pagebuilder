import { anthropic } from '@ai-sdk/anthropic';
import { streamText, generateText } from 'ai';
import { LUCIDE_ICON_NAMES } from '@/config/components';
import { createAdminClient } from '@/utils/supabase/admin';
import fs from 'fs';
import path from 'path';

export const maxDuration = 300;

const MODEL          = 'claude-sonnet-4-6';
const MAX_OUTPUT_TOKENS = 32_000;

// ─────────────────────────────────────────────────────────────────────────────
// System prompt — teaches the visual assembly rules
// ─────────────────────────────────────────────────────────────────────────────
function buildSystemPrompt(category: string, screenshotFileName: string | null): string {
  const icons = LUCIDE_ICON_NAMES.join(', ');

  return `You are a world-class conversion architect, visual designer, and elite React assembler.
You build premium, high-converting React landing pages and sales funnels.

Your primary instruction is to act as an advanced assembly agent using the provided screenshot as your core visual blueprint.
${screenshotFileName ? `1. DEEP VISUAL ANALYSIS: Study the attached screenshot reference ("${screenshotFileName}"). Deeply analyze its exact layout, spacing, section structure, visual hierarchy, font combinations, and image placements.
2. LAYOUT REPRODUCTION WITH CREATIVE FREEDOM: Use the screenshot as your foundational blueprint, reproducing its structural layout. Allow yourself about 40% creative freedom to generalize or integrate modern design patterns, BUT strictly maintain the core structural anatomy (e.g. 50/50 splits, bento grids, masonry layouts).` : '1. Build a stunning, conversion-optimized landing page structure matching elite visual design standards.'}
3. STRICT COPY ADHERENCE (NO JIBBERISH): Use ONLY the provided copy object for all text content. Do NOT invent new copy, do NOT add generic filler text, do NOT use Lorem Ipsum, and do NOT generate unnecessary sections that don't have copy.
4. COMPREHENSIVE DESIGN SYSTEM EXTRACTION: You MUST extract a cohesive "Design System" from the reference image and apply it to ALL pages you generate (Upsell, Downsell, Thank You). This includes matching header vs body text contrast (e.g., pure white headers vs slate-400 body), border radius, card opacities, and hover states.

━━━ TYPOGRAPHY & FONTS (CRITICAL) ━━━
- Do NOT just use default fonts everywhere. You must build a deliberate typography system.
- Extract the exact typography relationships from the reference: Is the header a massive, thick, tracking-tighter sans-serif? Is the body text a highly readable, muted sans? Is there a serif font used for elegant accents?
- Explicitly use Tailwind typography utilities to enforce this: e.g., \`font-serif\`, \`font-sans\`, \`tracking-tighter\`, \`leading-relaxed\`, \`font-black\`, \`font-light\`.
- Enforce contrast: e.g., \`text-white\` for headers and \`text-white/70\` or \`text-muted-foreground\` for body copy.

━━━ IMAGE & MEDIA PLACEHOLDERS (CRITICAL) ━━━
- VALUE IMAGES HIGHLY. If the reference shows a massive dashboard graphic, abstract art, or a photo taking up 50% of the screen, you MUST create a large visual placeholder \`div\` (e.g., \`bg-muted/30 aspect-video\`, or \`img\` tag) that takes up the EXACT same amount of screen real estate.
- NEVER replace large visual graphics with tiny icons or empty space. Match the aspect ratios and styling (rounded corners, drop shadows) of the images in the reference.
- If a section in the reference has photographic cards (like blog posts or team members), use a prominent image placeholder at the top of those cards.

━━━ GRADIENTS & COLOR TEMPO ━━━
- DO NOT SPAM GRADIENTS. Only use gradients where explicitly shown in the reference image.
- If you use a gradient on text, ENSURE READABILITY. Do not use gradients that make the text fade into the background and become unreadable.
- Replicate the "color tempo" of the reference: the exact use of opacities, gradients, glowing effects, shading, and contrast. Apply this tempo using the provided theme colors (e.g., \`bg-primary/10\`, glowing blurs).
- If the reference uses high contrast (e.g., stark white cards on a dark background), hardcode that contrast polarity (\`bg-white text-black\`) so the theme doesn't ruin intentional design choices.

━━━ NAVIGATION RULES ━━━
- The Navigation Bar (Navbar) must be FIXED to the top of the screen (\`fixed top-0 w-full z-50\`). Add a backdrop blur for elegance.
- The Navbar links must ONLY reference the actual sections present on the page.
- Implement smooth scrolling anchor links (e.g., \`href="#features"\`, \`id="features"\`) so that clicking a nav item smoothly scrolls the user to that exact section.

━━━ EMOJI RULES ━━━
- STRICT LIMIT: Use a MAXIMUM of 2 emojis across the ENTIRE page. Absolutely NO emoji spamming.

━━━ ICONS ━━━
- Import and use standard Lucide icons from "lucide-react": e.g. "import { ArrowRight, Shield, Star, Check, Sparkles } from 'lucide-react'".
- Only use approved icons: ${icons}

━━━ FUNNEL STRUCTURAL PAGES ━━━
You must output exactly 4 pages in the funnel:
1. Lead Capture Page (path: "/")
   - Form-led structure, features grid, trust testimonials, and FAQ.
2. Upsell Offer Page (path: "/upsell")
   - High-urgency discount upgrade offer, value comparisons, and explicit skip/accept CTAs.
3. Downsell Offer Page (path: "/downsell")
   - Empathic payment plans or split alternatives, testimonials, and skip/accept CTAs.
4. Thank You Page (path: "/thankyou")
   - Success status banner, purchase breakdown summary card, and next-step checklist.

━━━ CTA LINKING RULES ━━━
- Lead Capture form action or button MUST link/redirect to: "/upsell"
- Upsell Accept CTA -> "/thankyou" | Decline link -> "/downsell"
- Downsell Accept CTA -> "/thankyou" | Decline link -> "/thankyou"
- CRITICAL: DO NOT use \`react-router-dom\` (e.g., \`useNavigate\`, \`Link\`) or \`next/navigation\`! The environment does NOT support them.
- For ALL navigation, use standard HTML \`<a href="...">\` tags.

━━━ OUTPUT FORMAT RULES ━━━
- Output each page wrapped inside a dedicated \`<page path="..." name="...">\` XML-style tag.
- Inside the tag, write standard, valid **React TSX component code** starting with its standard imports and ending with the default component export.
- Do NOT wrap code inside Markdown code blocks (no \`\`\`tsx).
- Do NOT output any conversational text or comments outside of the page tags.
- Stream each page immediately.
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Content prompt — offer-specific context
// ─────────────────────────────────────────────────────────────────────────────
function buildContentPrompt(
  offerContext: any,
  copyContext: string | null,
  category: string
): string {
  let offerSection = '';
  if (offerContext) {
    offerSection = `PRODUCT DETAILS:
• Name: ${offerContext.productType ?? 'Not specified'}
• Category: ${category.toUpperCase()}
• Niche: ${offerContext.niche ?? 'Not specified'}
• Target Audience: ${offerContext.audience ?? 'Not specified'}
• Tone: ${offerContext.tone ?? 'Not specified'}
`;
  }

  let copySection = 'No pre-written copy provided.';
  if (copyContext) {
    copySection = `COPY OBJECT:
Use the exact text chunks defined below for each page sections:
${copyContext}
`;
  }

  return `
=== GENERATION INPUT ===
${offerSection}
${copySection}
=== END GENERATION INPUT ===

TASK: Generate a complete 4-page sales funnel (Lead Capture "/", Upsell "/upsell", Downsell "/downsell", Thank You "/thankyou").
Structure each page's layout hierarchy by analyzing the visual arrangement, card spacing, headings, and visual density of the reference screenshot image. Apply the typography, color tempo, and image structures observed. Remember to use exactly the text from the COPY OBJECT and strictly limit emojis to 2 maximum across the page.

Begin streaming the <page> blocks now.
`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Category Classification Helper
// ─────────────────────────────────────────────────────────────────────────────
async function classifyCategory(offerContext: any): Promise<string> {
  const contextStr = `
Niche: ${offerContext.niche ?? 'Not specified'}
Audience: ${offerContext.audience ?? 'Not specified'}
Tone: ${offerContext.tone ?? 'Not specified'}
Product Type: ${offerContext.productType ?? 'Not specified'}
  `.trim();

  try {
    const response = await generateText({
      model: anthropic(MODEL),
      system: `You are an expert design classifier. Analyze the provided product/offer context and classify it into exactly one of these 6 landing page categories:
- business
- creative
- health
- saas
- community
- style

Reply with ONLY the category name in lowercase. Do not include any other words, punctuation, markdown formatting, or explanations.`,
      prompt: `Classify this product context:\n\n${contextStr}`,
      maxOutputTokens: 10,
    });

    const category = response.text.trim().toLowerCase();
    const validCategories = ['business', 'creative', 'health', 'saas', 'community', 'style'];
    
    if (validCategories.includes(category)) {
      return category;
    }
    
    // Substring fallback checks
    for (const valid of validCategories) {
      if (category.includes(valid)) {
        return valid;
      }
    }
    
    console.warn(`[classify] Invalid category returned: "${category}", falling back to "business"`);
    return 'business';
  } catch (err) {
    console.error('[classify] Error classifying category:', err);
    return 'business';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Screenshot Selection Helper
// ─────────────────────────────────────────────────────────────────────────────
interface ScreenshotSelection {
  data: Buffer | null;
  mimeType: string | null;
  fileName: string | null;
}

function selectRandomScreenshot(category: string): ScreenshotSelection {
  const categoryPath = path.join(process.cwd(), 'public', 'screenshots', category);
  
  try {
    if (!fs.existsSync(categoryPath)) {
      console.warn(`[screenshot] Directory does not exist: ${categoryPath}`);
      return { data: null, mimeType: null, fileName: null };
    }
    
    const files = fs.readdirSync(categoryPath);
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const imageFiles = files.filter(file => 
      imageExtensions.includes(path.extname(file).toLowerCase())
    );
    
    if (imageFiles.length === 0) {
      console.warn(`[screenshot] No image files found in: ${categoryPath}`);
      return { data: null, mimeType: null, fileName: null };
    }
    
    // Pick random file
    const randomFile = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    const filePath = path.join(categoryPath, randomFile);
    const data = fs.readFileSync(filePath);
    
    const ext = path.extname(randomFile).toLowerCase();
    let mimeType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') {
      mimeType = 'image/jpeg';
    } else if (ext === '.webp') {
      mimeType = 'image/webp';
    }
    
    console.log(`[screenshot] Successfully loaded reference screenshot: ${randomFile} from ${category}`);
    return { data, mimeType, fileName: randomFile };
  } catch (err) {
    console.error('[screenshot] Error reading reference screenshot:', err);
    return { data: null, mimeType: null, fileName: null };
  }
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

  // 1. Run AI Category Classification
  const startTime = Date.now();
  const category = await classifyCategory(offerContext);
  console.log(`[generate] Category classified as "${category}" in ${Date.now() - startTime}ms`);

  // 2. Select a Random Reference Screenshot
  const screenshot = selectRandomScreenshot(category);

  // 3. Fetch Copy Context from DB if funnelId is provided
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

  const systemPrompt  = buildSystemPrompt(category, screenshot.fileName);
  const contentPrompt = buildContentPrompt(offerContext, copyContext, category);

  console.log('[generate] model:', MODEL, '| maxTokens:', MAX_OUTPUT_TOKENS, '| funnelId:', funnelId ?? 'none');

  const encoder = new TextEncoder();

  try {
    // 4. Construct user message content: text instructions + image attachment (if loaded)
    const userMessageContent: any[] = [
      {
        type: 'text',
        text: contentPrompt,
      }
    ];

    if (screenshot.data) {
      userMessageContent.push({
        type: 'image',
        image: screenshot.data,
        mimeType: screenshot.mimeType,
      });
      console.log(`[generate] Appending screenshot file "${screenshot.fileName}" (size: ${screenshot.data.length} bytes) to Anthropic messages stream.`);
    } else {
      console.log(`[generate] No screenshot reference available. Running text-only page builder fallback.`);
    }

    const result = streamText({
      model:           anthropic(MODEL),
      system:          systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessageContent,
        }
      ],
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

          console.log('[generate] complete — output length:', fullText.length);
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
