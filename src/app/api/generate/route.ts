import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { LUCIDE_ICON_NAMES } from '@/config/components';
import { createAdminClient } from '@/utils/supabase/admin';
import { getSession } from '@/auth';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const maxDuration = 300;

const MODEL = 'claude-sonnet-4-6';
const MAX_OUTPUT_TOKENS = 16_000;

// ─────────────────────────────────────────────────────────────────────────────
// System prompt — teaches the visual assembly rules
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// LANDING PAGE AGENT — SYSTEM PROMPT BUILDER
// Generates the master prompt for a world-class React landing page / sales
// funnel agent.  Pass the product category and an optional screenshot filename.
// The LUCIDE_ICON_NAMES array must be defined in the same module and imported
// here; it is injected into the prompt at build time.
// ─────────────────────────────────────────────────────────────────────────────


export function buildSystemPrompt(
  category: string,
  screenshotFileName: string | null
) {
  const icons = LUCIDE_ICON_NAMES.join(", ");

  return `# LANDING PAGE AGENT

You build premium, high-converting 4-page React sales funnels (Lead Capture, Upsell, Downsell, Thank You). Output is production-grade, visually exceptional, and Babel Standalone-compatible.

Your primary instruction is to act as an advanced assembly agent${screenshotFileName ? ` using the provided screenshot ("${screenshotFileName}") as your core visual blueprint` : " building an original design from the copy alone"}.

---

## ━━━ SECTION 0: BABEL COMPILE CONTRACT — NEVER SKIP ━━━

⛔ HARD BLOCKERS — violating any single rule crashes the runtime compiler.

### 🚨 RULE 0.1 — NO BACKTICK TEMPLATE LITERALS INSIDE JSX ATTRIBUTES
❌ ILLEGAL: src={\`https://example.com/\${id}\`} className={\`p-6 \${active ? 'a' : 'b'}\`}
✅ REQUIRED: src={"https://example.com/" + id} className={"p-6 " + (active ? "a" : "b")}
Applies to ALL elements — img, div, a, button, input, span, section — no exceptions.

### 🚨 RULE 0.2 — NO MULTI-LINE TEMPLATE LITERALS IN JSX ATTRIBUTES
❌ ILLEGAL: className={\`p-6 rounded-2xl\n  border\`}
✅ REQUIRED: className="p-6 rounded-2xl border"

### 🚨 RULE 0.3 — CONDITIONAL CLASSNAMES USE CONCATENATION ONLY
❌ ILLEGAL: className={\`p-6 \${featured ? "bg-primary" : "bg-white"}\`}
✅ REQUIRED: className={"p-6 " + (featured ? "bg-primary" : "bg-white")}

### 🚨 RULE 0.4 — STYLE TAG USES STRING CONCATENATION, NOT BACKTICKS
✅ SHORT: <style>{"@import url('https://fonts.googleapis.com/...'); .display-font{font-family:'Fraunces',serif;}"}</style>
✅ LONG: <style>{"@import url('...');" + " .display-font { font-family: 'Sora', sans-serif; }" + " html { scroll-behavior: smooth; }"}</style>
❌ NEVER: <style>{\`@import url(...)\`}</style>
Place <style> as FIRST child of the return. Never declare font strings as module-level variables.

### 🚨 RULE 0.5 — camelCase JSX ATTRIBUTES ONLY
❌ ILLEGAL: fetchpriority class for tabindex
✅ REQUIRED: fetchPriority className htmlFor tabIndex

### 🚨 RULE 0.6 — NO JSX OUTSIDE COMPONENT FUNCTIONS
All JSX lives inside function component bodies only.

### 🚨 RULE 0.7 — EXACTLY ONE DEFAULT EXPORT PER FILE
One \`export default function [PageName]Page\` per file, no exceptions.

### 🚨 RULE 0.8 — ESCAPE DOLLAR SIGNS IN JSX STRING LITERALS
✅ REQUIRED: <span>{"$49"}</span> or <span>{"$" + price}</span>

### 🚨 RULE 0.9 — STRICTLY NO TYPESCRIPT
No interface, no type, no type annotations. Pure ES6 JSX only.

### 🚨 RULE 0.10 — BE CONCISE TO PREVENT TRUNCATION
Max 4 feature cards, max 4 FAQs. Avoid verbose nested markup.

### ✅ PRE-FLIGHT CHECKLIST — VERIFY BEFORE CLOSING EACH </page> TAG
- [ ] Zero backtick template literals inside any JSX attribute
- [ ] All conditional classNames use string concatenation with +
- [ ] <style> tag uses string concatenation, not backticks
- [ ] fetchPriority / className / htmlFor — no HTML attribute names
- [ ] Exactly one export default function [PageName]Page per file
- [ ] No JSX outside component function bodies
- [ ] Dollar signs in JSX strings wrapped in JS string expressions
- [ ] Zero TypeScript — no interface, no type, no annotations
- [ ] import React from "react" at top of every file
- [ ] decoding="async" on every <img>

---

## ━━━ SECTION 1: VISUAL DESIGN ━━━

${screenshotFileName ? `Use the attached screenshot "${screenshotFileName}" as structural blueprint. Reproduce section order, grid counts, and spatial rhythm exactly. 40% creative freedom allowed: modernize flat cards to glassmorphism, improve typography hierarchy, add micro-interactions. NEVER change core layout anatomy.` : `No screenshot provided. Follow elite SaaS conventions: hero → logos → features → social proof → pricing → FAQ → CTA → footer. Choose a bold aesthetic and commit fully.`}

**MANDATORY VISUAL RULES:**
- Colors: Deep navy/violet base (#030612 or #060b18). Enrich with indigo, violet, fuchsia, teal gradients. Never monochrome.
- Cards: Glassmorphism — bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] hover:border-indigo-500/30
- Glow effects: absolute + pointer-events-none inside relative overflow-hidden parent. Max 2 per section. blur-[80px] to blur-[140px].
- Text gradients on T1 headlines only: bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent
- Fonts: Always TWO families. Display (T1/T2): Fraunces, Sora, DM Serif Display. Body: DM Sans, Plus Jakarta Sans, Figtree. Never Inter/Roboto/Arial.
- Eyebrow label on every section (pill badge style preferred).
- Unsplash images everywhere — never placeholder shapes or empty divs.

**TYPOGRAPHY SCALE:**
- T1 Hero: text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95]
- T2 Section: text-3xl md:text-4xl font-bold tracking-tight
- T3 Card: text-xl font-semibold leading-snug
- T4 Body: text-base font-normal leading-relaxed
- T5 Caption: text-xs font-semibold tracking-widest uppercase

**SPACING:**
- Hero: pt-36 md:pt-44 pb-24 md:pb-32
- Sections: py-24 md:py-32
- Containers: max-w-6xl mx-auto px-6 lg:px-8
- Card grids: always gap-6

**MOTION (framer-motion):**
- Import: import { motion, AnimatePresence } from "framer-motion" — do NOT import useInView
- Scroll reveal: initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
- Stagger grids with containerVariants/itemVariants
- Card hover: whileHover={{ y: -4, scale: 1.01 }} with spring transition
- Always viewport={{ once: true }}

**SCROLL-AWARE NAVBAR:**
const navClass = "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 " + (scrolled ? "bg-background/80 backdrop-blur-xl border-b border-white/[0.07]" : "bg-transparent");
Add <div className="h-20 md:h-24" /> spacer immediately after nav.

**CODE ARCHITECTURE:**
- import React from "react" mandatory on every file
- All static data arrays (FEATURES, FAQS, STATS) declared at module level, never inside component
- All sub-components (FeatureCard, TestimonialCard) defined at module level
- Use [0,1,2,3,4].map not [...Array(5)].map for star ratings
- Key props always use stable id fields, never array index

---

## ━━━ SECTION 2: COPY RULES ━━━

- Use COPY OBJECT verbatim — every word, price, bullet, testimonial
- Never invent copy, never use Lorem Ipsum, never truncate
- Map markdown headings → section headers, lists → feature cards, blockquotes → testimonial cards
- Max 2 emojis per page, hero eyebrow or banner only

---

## ━━━ SECTION 3: ICONS ━━━

Import only icons you use. Approved list: ${icons}
Sizing: navbar/cards w-5 h-5, buttons w-4 h-4, hero accent w-6 h-6.

---

## ━━━ SECTION 4: FUNNEL PAGES ━━━

### PAGE 1 — LEAD CAPTURE (path: "/")
export default function LeadCapturePage()
Sections: style tag → fixed navbar → spacer → hero (T1 + gradient + image) → logos bar → stats bar → features grid (3-4 cards staggered) → how it works (3 steps) → testimonials (3 cards) → lead capture form (name+email, risk reversal above CTA) → FAQ accordion → footer
Form submits → navigate("/upsell")

### PAGE 2 — UPSELL (path: "/upsell")
export default function UpsellPage()
Sections: style tag → countdown timer banner (amber, full-width) → hero headline → anchor pricing (struck-through original + offer price + savings badge) → value comparison stack → upsell features (3-4) → testimonials (1-2) → risk reversal row → accept CTA with pulse ring → /thankyou → decline link → /downsell

Countdown: const [timeLeft, setTimeLeft] = React.useState(900); display as mm:ss

### PAGE 3 — DOWNSELL (path: "/downsell")
export default function DownsellPage()
Sections: style tag → empathy banner → hero (reframed lower-commitment offer) → alternative anchor pricing → what's included list → testimonial (1) → risk reversal → accept CTA → /thankyou → decline link → /thankyou

### PAGE 4 — THANK YOU (path: "/thankyou")
export default function ThankYouPage()
Sections: style tag → success banner (animated check + "You're In!" headline) → purchase summary card → interactive next-steps checklist (useState toggles) → onboarding CTA → resource links → minimal footer

---

## ━━━ SECTION 5: ROUTING ━━━

All routing via react-router-dom only. Never next/navigation or window.location.href.
import { Link, useNavigate } from "react-router-dom"

| Page | Action | Destination |
|------|--------|-------------|
| Lead Capture | Form submit | /upsell |
| Upsell | Accept | /thankyou |
| Upsell | Decline | /downsell |
| Downsell | Accept | /thankyou |
| Downsell | Decline | /thankyou |

---

## ━━━ SECTION 6: OUTPUT FORMAT ━━━

Wrap each page in:
<page path="[PATH]" name="[NAME]">
import React from "react";
// raw component code — no backtick wrappers
</page>

Allowed imports only: react, framer-motion, lucide-react, react-router-dom.
Output ONLY the <page> blocks. No conversational filler text.
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
    copySection = `COPY OBJECT (RICH MARKDOWN BY PAGE):
We have generated rich sales copy in Markdown format for each page of the funnel. You must parse this Markdown structure and map it directly to visually beautiful Tailwind sections and components without inventing any text:
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

IMPORTANT: Do NOT output any conversational filler text (e.g. "I'll analyze the reference..."). Output ONLY the <page> blocks and nothing else.

Begin streaming the <page> blocks now.
`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Screenshot Selection Helper
// ─────────────────────────────────────────────────────────────────────────────
interface ScreenshotSelection {
  data: Buffer | null;
  mimeType: string | null;
  fileName: string | null;
}

function selectRandomScreenshot(): ScreenshotSelection {
  const screenshotsPath = path.join(process.cwd(), 'public', 'screenshots');

  try {
    if (!fs.existsSync(screenshotsPath)) {
      console.warn(`[screenshot] Directory does not exist: ${screenshotsPath}`);
      return { data: null, mimeType: null, fileName: null };
    }

    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const imageFiles: string[] = [];

    const scanDir = (dir: string) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          if (imageExtensions.includes(path.extname(item).toLowerCase())) {
            imageFiles.push(fullPath);
          }
        } else if (stat.isDirectory() && item !== 'fallback' && item !== 'sections') {
          scanDir(fullPath);
        }
      }
    };

    scanDir(screenshotsPath);

    if (imageFiles.length === 0) {
      console.warn(`[screenshot] No image files found in: ${screenshotsPath}`);
      return { data: null, mimeType: null, fileName: null };
    }

    const randomFilePath = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    const randomFile = path.basename(randomFilePath);
    const data = fs.readFileSync(randomFilePath);

    const ext = path.extname(randomFile).toLowerCase();
    let mimeType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') {
      mimeType = 'image/jpeg';
    } else if (ext === '.webp') {
      mimeType = 'image/webp';
    }

    console.log(`[screenshot] Successfully loaded reference screenshot: ${randomFile}`);
    return { data, mimeType, fileName: randomFile };
  } catch (err) {
    console.error('[screenshot] Error reading reference screenshot:', err);
    return { data: null, mimeType: null, fileName: null };
  }
}

// Helper to resize screenshot if dimensions exceed Anthropic's limits (8000px max)
async function resizeImageIfNeeded(data: Buffer): Promise<Buffer> {
  try {
    const image = sharp(data);
    const metadata = await image.metadata();

    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;

    const MAX_DIMENSION = 4000;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      console.log(`[screenshot] Resizing image from ${width}x${height} to fit within ${MAX_DIMENSION}px`);
      if (width > height) {
        return await image.resize({ width: MAX_DIMENSION }).toBuffer();
      } else {
        return await image.resize({ height: MAX_DIMENSION }).toBuffer();
      }
    }

    return data;
  } catch (err) {
    console.error('[screenshot] Failed to resize image:', err);
    return data;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
  }

  // 1. Session Authentication
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  let offerContext: any = {};
  let funnelId: string | undefined;

  try {
    const body = await req.json().catch(() => ({}));
    offerContext = body.offerContext ?? {};
    funnelId = body.funnelId;
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!funnelId) {
    return Response.json({ error: 'Missing funnelId parameter' }, { status: 400 });
  }

  // Narrow the type to string after the guard above
  const resolvedFunnelId: string = funnelId;

  // 2. Validate Ownership & Fetch existing blocks
  const supabase = createAdminClient();
  let existingBlocks: any = {};
  try {
    const { data: pageRecord, error: pageError } = await supabase
      .from('builder_pages')
      .select('blocks, user_id')
      .eq('id', resolvedFunnelId)
      .single();

    if (pageError || !pageRecord) {
      return Response.json({ error: 'Page not found' }, { status: 404 });
    }

    if (pageRecord.user_id !== userId) {
      return Response.json({ error: 'Unauthorized page access' }, { status: 403 });
    }

    existingBlocks = pageRecord.blocks || {};
  } catch (e: any) {
    return Response.json({ error: 'Database error: ' + e.message }, { status: 500 });
  }

  // 2b. Check for stale "generating" status — if older than 5 minutes, reset it
  const STALE_GENERATION_MS = 5 * 60 * 1000;
  if (existingBlocks.generation?.status === 'generating' && existingBlocks.generation?.updatedAt) {
    const genStarted = new Date(existingBlocks.generation.updatedAt).getTime();
    const elapsed = Date.now() - genStarted;
    if (elapsed > STALE_GENERATION_MS) {
      console.warn(`[generate] Stale generation detected (${Math.round(elapsed / 1000)}s old). Resetting to failed.`);
      existingBlocks = {
        ...existingBlocks,
        generation: {
          status: 'failed',
          error: 'Generation timed out (stale status reset)',
          updatedAt: new Date().toISOString(),
        },
      };
      await supabase
        .from('builder_pages')
        .update({ blocks: existingBlocks, updated_at: new Date().toISOString() })
        .eq('id', resolvedFunnelId);
    }
  }

  // 3. Mark generation as "generating" in the DB
  try {
    const updatedBlocks = {
      ...existingBlocks,
      generation: {
        status: 'generating',
        updatedAt: new Date().toISOString(),
      },
    };

    await supabase
      .from('builder_pages')
      .update({ blocks: updatedBlocks, updated_at: new Date().toISOString() })
      .eq('id', resolvedFunnelId);
  } catch (e: any) {
    return Response.json({ error: 'Failed to update generation status in DB: ' + e.message }, { status: 500 });
  }

  // 4. Deduce category from context
  const category = offerContext.category ?? 'business';

  // 5. Select a Random Reference Screenshot
  const screenshot = selectRandomScreenshot();
  if (screenshot.data) {
    screenshot.data = await resizeImageIfNeeded(screenshot.data);
  }

  // 6. Fetch Copy Context from existingBlocks
  let copyContext: string | null = null;
  if (existingBlocks.copy) {
    copyContext = JSON.stringify(existingBlocks.copy, null, 2);
  }

  const systemPrompt = buildSystemPrompt(category, screenshot.fileName);
  const contentPrompt = buildContentPrompt(offerContext, copyContext, category);

  console.log('[generate] model:', MODEL, '| maxTokens:', MAX_OUTPUT_TOKENS, '| funnelId:', resolvedFunnelId);

  const encoder = new TextEncoder();

  try {
    // 7. Construct user message content: text instructions + image attachment (if loaded)
    const userMessageContent: any[] = [
      {
        type: 'text',
        text: contentPrompt,
      },
    ];

    if (screenshot.data) {
      userMessageContent.push({
        type: 'image',
        image: screenshot.data,
        mimeType: screenshot.mimeType,
      });
      console.log(
        `[generate] Appending screenshot file "${screenshot.fileName}" (size: ${screenshot.data.length} bytes) to Anthropic messages stream.`
      );
    } else {
      console.log('[generate] No screenshot reference available. Running text-only page builder fallback.');
    }

    const result = streamText({
      model: anthropic(MODEL),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessageContent,
        },
      ],
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      headers: {
        'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15,output-128k-2025-02-19',
      },
    });

    // Create client SSE stream — the generate logic runs inline inside its pull/start,
    // keeping the HTTP response alive until generation fully completes.
    let generateResolve: () => void = () => {};
    new Promise<void>((res) => {
      generateResolve = res;
    });

    let controllerRef: ReadableStreamDefaultController | null = null;

    const sendToClient = (type: string, data: string) => {
      if (!controllerRef) return;
      try {
        controllerRef.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));
      } catch {
        // Connection closed by client, safe to stop pushing
        controllerRef = null;
      }
    };

    const clientStream = new ReadableStream({
      start(controller) {
        controllerRef = controller;

        // Kick off the generation as a background task tied to this stream.
        // The stream stays open (no controller.close()) until this completes.
        (async () => {
          let fullText = '';
          try {
            for await (const part of result.fullStream) {
              if (part.type === 'text-delta') {
                fullText += part.text;
                // Stream text deltas to client so partial progress is visible
                sendToClient('text-delta', part.text);
              } else if (part.type === 'reasoning-delta') {
                sendToClient('thinking', part.text);
              } else if (part.type === 'error') {
                sendToClient('error', String(part.error));
              } else if (part.type === 'finish') {
                console.log('[generate] finish — usage:', JSON.stringify(part.totalUsage ?? {}));
              }
            }

            console.log('[generate] complete — output length:', fullText.length);

            // Parse XML <page> blocks out of the generated response
            const newPages: Record<string, any> = {};
            const pageRegex = /<page\s+([^>]+)>([\s\S]*?)(?:<\/page>|$)/g;
            let match;
            let pageCount = 0;

            while ((match = pageRegex.exec(fullText)) !== null) {
              const attrs = match[1];
              const pathMatch = attrs.match(/path=["']([^"']+)["']/i);
              const nameMatch = attrs.match(/name=["']([^"']+)["']/i);

              const pathVal = pathMatch ? pathMatch[1] : `/${pageCount}`;
              const nameVal = nameMatch ? nameMatch[1] : `Page ${pageCount + 1}`;
              let code = match[2].trim();

              // Strip markdown code block wrappers
              code = code.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();

              // Remove rogue jsx literal string wrappers if any
              if (code.startsWith('{`')) {
                code = code.replace(/^\{`\n?/, '').replace(/\n?`\}$/, '').trim();
              }

              newPages[pathVal] = {
                name: nameVal,
                path: pathVal,
                components: {},
                rootList: [],
                code,
              };
              pageCount++;
            }

            // Fallback: assume whole response is a single page code
            if (pageCount === 0 && fullText.trim()) {
              let code = fullText.trim();
              const codeBlockMatch = code.match(/```(?:tsx|jsx|js|ts)?\n([\s\S]*?)\n```/i);
              if (codeBlockMatch) {
                code = codeBlockMatch[1].trim();
              } else {
                code = code.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
              }
              if (code.includes('import ') || code.includes('export default')) {
                newPages['/'] = {
                  name: 'Lead Capture',
                  path: '/',
                  components: {},
                  rootList: [],
                  code,
                };
                pageCount = 1;
              }
            }

            if (pageCount === 0) {
              throw new Error('Failed to find any valid generated pages in the stream.');
            }

            const initialPage = newPages['/'] || Object.values(newPages)[0];

            // Fetch fresh blocks from the DB to avoid overwriting changes done during generation
            const { data: freshRecord } = await supabase
              .from('builder_pages')
              .select('blocks')
              .eq('id', resolvedFunnelId)
              .single();

            const latestBlocks = freshRecord?.blocks || {};
            const updatedBlocks = {
              ...latestBlocks,
              components: initialPage.components || {},
              rootList: initialPage.rootList || [],
              pages: newPages,
              generation: {
                status: 'completed',
                updatedAt: new Date().toISOString(),
              },
            };

            const { error: saveErr } = await supabase
              .from('builder_pages')
              .update({ blocks: updatedBlocks, updated_at: new Date().toISOString() })
              .eq('id', resolvedFunnelId);

            if (saveErr) {
              throw new Error('Failed to save final pages: ' + saveErr.message);
            }

            console.log(`[generate] Completed background save for funnelId: ${resolvedFunnelId}`);
            sendToClient('complete', fullText);
            generateResolve();
          } catch (err: any) {
            console.error('[generate] generation error:', err);

            try {
              const { data: freshRecord } = await supabase
                .from('builder_pages')
                .select('blocks')
                .eq('id', resolvedFunnelId)
                .single();

              const latestBlocks = freshRecord?.blocks || {};
              const updatedBlocks = {
                ...latestBlocks,
                generation: {
                  status: 'failed',
                  error: err.message || String(err),
                  updatedAt: new Date().toISOString(),
                },
              };

              await supabase
                .from('builder_pages')
                .update({ blocks: updatedBlocks, updated_at: new Date().toISOString() })
                .eq('id', resolvedFunnelId);
            } catch (dbErr) {
              console.error('[generate] Failed to save failure state:', dbErr);
            }

            sendToClient('error', err?.message ?? 'Stream failed');
            generateResolve(); // Resolve (not reject) so the stream closes cleanly
          } finally {
            if (controllerRef) {
              try {
                controllerRef.close();
              } catch (e) {
                // ignore — stream may already be closed
              }
            }
          }
        })();
      },
    });

    return new Response(clientStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('[generate] failed to initialize stream:', err);
    return Response.json({ error: err?.message ?? 'Failed to start generation' }, { status: 500 });
  }
}