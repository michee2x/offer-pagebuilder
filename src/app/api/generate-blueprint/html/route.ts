import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const maxDuration = 300; // Allow 300s (5 minutes) for Claude text gen
export const runtime = "nodejs";

type DocFormat = "pdf" | "csv" | "docx";

function buildPrompt(
  format: DocFormat,
  funnelName: string,
  topic: string,
  context: any
): string {
  const currentYear = new Date().getFullYear();
  const contextBlock = `
CONTEXT ABOUT THE OFFER:
Product Type: ${context.productType || "Unknown"}
Target Audience: ${context.targetAudience || "General"}
Main Benefit: ${context.coreBenefit || "Unknown"}`;

  const antiHallucinationRules = `
CRITICAL ACCURACY RULES:
- The current year is ${currentYear}. Do NOT reference past years (like 2023 or 2024) as the current year. Any copyright dates must be ${currentYear}.
- Do NOT hallucinate or invent false information (e.g., fake contact details, fake company names, fake names).
- If specific data is missing from the context, use placeholders (e.g., [Company Name]) or omit it entirely. Never guess or fabricate facts.`;

  if (format === "csv") {
    return `You are a world-class direct response marketing strategist and data analyst.
Generate a comprehensive, structured Lead Magnet Blueprint as a CSV spreadsheet for a funnel named "${funnelName}".

TOPIC: ${topic}
${contextBlock}

INSTRUCTIONS:
1. Output ONLY valid CSV text. No markdown, no explanation, no code fences. Just raw CSV.
2. The CSV must be designed as a PURPOSE-BUILT strategic spreadsheet — NOT prose converted to columns.
3. Use the following column structure (you may add extra columns if they fit the topic):
   Action Item, Category, Priority (High/Medium/Low), Timeline, KPI / Success Metric, Owner / Role, Status, Notes
4. Generate at least 20-30 actionable rows that form a complete implementation blueprint.
5. Group related actions together logically (e.g., by funnel stage, marketing channel, or priority).
6. Include a header row as the first line.
7. Make every row specific, tactical, and immediately actionable — NOT vague or generic.
8. Use proper CSV escaping: wrap fields containing commas in double quotes.

Example row format:
"Launch email welcome sequence","Email Marketing",High,"Week 1","Open rate > 40%","Email Marketer",Not Started,"Focus on value-first approach"

${antiHallucinationRules}`;
  }

  if (format === "docx") {
    return `You are a world-class copywriter, strategist, and direct response marketer.
Generate a comprehensive, editable Lead Magnet Strategy Playbook for a funnel named "${funnelName}".

TOPIC: ${topic}
${contextBlock}

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
4. Write the document as an EDITABLE STRATEGY PLAYBOOK — something a marketing team can customize, annotate, and distribute.
5. Include at least 8-12 substantive sections covering: Executive Summary, Target Audience Deep Dive, Value Proposition, Core Strategy, Implementation Steps, Content Outline, Distribution Channels, KPIs & Metrics, Timeline, and Next Steps.
6. Write in a clear, professional but engaging tone. This is a working document, not a polished brochure.
7. Include practical tables where appropriate (e.g., timeline tables, comparison tables, budget breakdowns).
8. Make it comprehensive — at least 2000 words of actual content.
9. headingLevel should be 1 for major sections, 2 for subsections, 3 for sub-subsections.

${antiHallucinationRules}`;
  }

  // Default: PDF (existing behavior)
  return `You are a world-class copywriter and direct response marketer.
Generate a complete, high-value Lead Magnet PDF for a funnel named "${funnelName}".

TOPIC: ${topic}
${contextBlock}

INSTRUCTIONS:
1. Write the full, comprehensive content for the Lead Magnet. Make it valuable, actionable, and visually appealing.
2. Return ONLY raw, valid HTML. Do NOT wrap it in markdown block quotes (like \`\`\`html).
3. The HTML should include inline CSS styling to make it look like a beautiful, professional PDF document. Use a clean, modern design with a highly readable font (e.g., system-ui, sans-serif). Include a bold title, headers, nicely padded sections, and bullet points.
4. Ensure the HTML is self-contained. No external stylesheets that might block rendering, though Google Fonts is okay.

${antiHallucinationRules}`;
}

export async function POST(req: Request) {
  try {
    const startTime = Date.now();
    console.log("[generate-blueprint/html] Request started");
    
    const { funnelId, topic, type, docFormat: rawFormat } = await req.json();

    if (!funnelId || !topic) {
      return NextResponse.json({ error: "Missing funnelId or topic" }, { status: 400 });
    }

    const blueprintType = type === "bonus" ? "bonus" : "lead";
    const docFormat: DocFormat = (["pdf", "csv", "docx"].includes(rawFormat) ? rawFormat : "pdf") as DocFormat;

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

    // 2. Generate content via Claude with format-specific prompt
    console.log(`[generate-blueprint/html] Generating ${docFormat.toUpperCase()} content via Claude...`);
    const prompt = buildPrompt(docFormat, funnel.name, topic, context);

    const model = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20241022";
    
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
    } else if (docFormat === "csv") {
      // Clean markdown fencing for CSV
      content = rawContent.replace(/^```(?:csv)?\n?/, "").replace(/\n?```$/, "");
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
