import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const maxDuration = 300; // Allow 300s (5 minutes) for Claude text gen
export const runtime = "nodejs";

type DocFormat = "pdf" | "docx";

function parseInfoProductPlanEntry(
  planHtml: string,
  pageSlot: "sales" | "upsell" | "downsell"
): { chapters: string[]; description: string } {
  if (!planHtml) return { chapters: [], description: "" };
  const match = planHtml.match(/<!--\s*INFO_PRODUCTS:\s*(\{[\s\S]*?\})\s*-->/);
  if (!match) return { chapters: [], description: "" };
  try {
    const parsed = JSON.parse(match[1]);
    const entry = parsed[pageSlot] || {};
    return {
      chapters: Array.isArray(entry.chapters) ? entry.chapters : [],
      description: entry.description || "",
    };
  } catch {
    return { chapters: [], description: "" };
  }
}

function buildPrompt(
  format: DocFormat,
  funnelName: string,
  topic: string,
  context: any,
  blueprintType: string,
  planEntry?: { chapters: string[]; description: string }
): string {
  const currentYear = new Date().getFullYear();
  const contextBlock = `
CONTEXT ABOUT THE OFFER:
Product Type: ${context.productType || "Info Product"}
Target Audience: ${context.targetAudience || "General"}
Main Benefit: ${context.coreBenefit || "Unknown"}`;

  const chaptersBlock =
    planEntry && planEntry.chapters.length > 0
      ? `\nPLANNED CHAPTERS:\n${planEntry.chapters.map((c, i) => `${i + 1}. ${c}`).join("\n")}`
      : "";

  const isProduct = blueprintType === "product";
  const isBonus = blueprintType === "bonus";

  const antiHallucinationRules = `
CRITICAL ACCURACY RULES:
- The current year is ${currentYear}. Do NOT reference past years (like 2023 or 2024) as the current year. Any copyright dates must be ${currentYear}.
- Do NOT hallucinate or invent false information (e.g., fake contact details, fake company names, fake names).
- If specific data is missing from the context, use placeholders (e.g., [Company Name]) or omit it entirely. Never guess or fabricate facts.`;


  if (format === "docx") {
    return `You are a world-class copywriter, strategist, and direct response marketer specialising in info products.
Generate a comprehensive, editable Info Product Playbook for a funnel named "${funnelName}".

TOPIC: ${topic}
${contextBlock}${chaptersBlock}

INSTRUCTIONS:
1. Output your response as a VALID JSON object (no markdown fences, no explanation outside the JSON).
2. The JSON must follow this exact structure:
{
  "title": "The main document title",
  "subtitle": "A compelling subtitle or tagline",
  "sections": [
    {
      "heading": "Section Title",
      "headingLevel": 1,
      "paragraphs": ["Paragraph text here...", "Another paragraph..."],
      "bullets": ["Bullet point 1", "Bullet point 2"],
      "numberedList": ["Step 1", "Step 2"],
      "table": {
        "headers": ["Column A", "Column B", "Column C"],
        "rows": [["Cell 1", "Cell 2", "Cell 3"]]
      }
    }
  ]
}
3. Each section can have any combination of: paragraphs, bullets, numberedList, table. Include whichever fits best.
4. Write this as a PREMIUM, standalone info product that delivers REAL, actionable value a customer would pay for.
5. ${isProduct ? "Include at least 8-12 substantive chapters aligned with the planned chapters above. Write each chapter with depth." : isBonus ? "Include at least 4-6 focused sections. This is a bonus companion guide." : "Include at least 6-8 substantive sections."}
6. Write in a clear, professional but engaging tone. This is a downloadable info product, not a course or coaching service.
7. headingLevel should be 1 for major sections, 2 for subsections, 3 for sub-subsections.

${antiHallucinationRules}`;
  }

  // Default: PDF
  return `You are a world-class copywriter and direct response marketer specialising in info products.
Generate a complete, high-value Info Product PDF for a funnel named "${funnelName}".

TOPIC: ${topic}
${contextBlock}${chaptersBlock}

INSTRUCTIONS:
1. Write the full, comprehensive content. This must be genuinely valuable — a real info product a customer would happily pay for.
2. Return ONLY raw, valid HTML. Do NOT wrap it in markdown block quotes (like \`\`\`html).
3. The HTML should include inline CSS styling to look like a beautiful, professional PDF document. Use a clean, modern design with a highly readable font (e.g., system-ui, sans-serif). Include a bold title, headers, nicely padded sections, and bullet points.
4. Ensure the HTML is self-contained. Google Fonts is okay.
5. ${isProduct ? "Structure the content around the planned chapters. Each chapter should be comprehensive and insightful." : isBonus ? "This is a bonus companion guide — make it feel exclusive and immediately useful." : "Make it actionable with clear, implementable takeaways."}

${antiHallucinationRules}`;
}

export async function POST(req: Request) {
  try {
    const startTime = Date.now();
    console.log("[generate-blueprint/html] Request started");
    
    const { funnelId, topic, type, docFormat: rawFormat, page } = await req.json();

    if (!funnelId || !topic) {
      return NextResponse.json({ error: "Missing funnelId or topic" }, { status: 400 });
    }

    const blueprintType = type === "product" ? "product" : type === "bonus" ? "bonus" : "lead";
    const docFormat: DocFormat = (["pdf", "docx"].includes(rawFormat) ? rawFormat : "pdf") as DocFormat;

    console.log(`[generate-blueprint/html] Generating blueprint for funnelId=${funnelId}, topic=${topic}, type=${blueprintType}, format=${docFormat}`);
    
    const supabase = createAdminClient();

    // 1. Fetch Funnel Data
    console.log("[generate-blueprint/html] Fetching funnel data from database...");
    const { data: funnel } = await supabase
      .from("builder_pages")
      .select("id, name, blocks")
      .eq("id", funnelId)
      .single();

    if (!funnel) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
    }

    const context = funnel.blocks?.offerContext || {};

    // Extract INFO_PRODUCT_PLAN chapters if this is a product type with a page slot
    const call1 = funnel.blocks?.intelligence?.call1 || {};
    const infoProductPlanHtml =
      call1.INFO_PRODUCT_PLAN || call1.info_product_plan || "";
    const planEntry =
      blueprintType === "product" && page
        ? parseInfoProductPlanEntry(infoProductPlanHtml, page as "sales" | "upsell" | "downsell")
        : undefined;

    // 2. Generate content via Claude with format-specific prompt
    console.log(`[generate-blueprint/html] Generating ${docFormat.toUpperCase()} content via Claude...`);
    const prompt = buildPrompt(docFormat, funnel.name, topic, context, blueprintType, planEntry);

    const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
    
    const { text: rawContent } = await generateText({
      model: anthropic(model),
      prompt,
    });
    
    const textGenTime = Date.now() - startTime;
    console.log(`[generate-blueprint/html] Content generation complete (${textGenTime}ms)`);

    // Clean up based on format
    let content = rawContent;
    if (docFormat === "pdf") {
      // Clean markdown fencing for HTML
      content = rawContent.replace(/^```html\n?/, "").replace(/\n?```$/, "");
    } else if (docFormat === "docx") {
      // Clean markdown fencing for JSON
      content = rawContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    return NextResponse.json({ success: true, content, format: docFormat, type: blueprintType });
  } catch (error: any) {
    console.error("[generate-blueprint/html] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate blueprint content" }, { status: 500 });
  }
}
