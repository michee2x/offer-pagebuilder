import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const maxDuration = 300; // Allow 300s (5 minutes) for Claude text gen
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const startTime = Date.now();
    console.log("[generate-blueprint/html] Request started");
    
    const { funnelId, topic, type } = await req.json();

    if (!funnelId || !topic) {
      return NextResponse.json({ error: "Missing funnelId or topic" }, { status: 400 });
    }

    const blueprintType = type === "bonus" ? "bonus" : "lead";

    console.log(`[generate-blueprint/html] Generating blueprint for funnelId=${funnelId}, topic=${topic}, type=${blueprintType}`);
    
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

    // 2. Generate HTML Content via Claude
    console.log("[generate-blueprint/html] Generating HTML content via Claude...");
    const prompt = `You are a world-class copywriter and direct response marketer.
Generate a complete, high-value Lead Magnet PDF for a funnel named "${funnel.name}".

TOPIC: ${topic}

CONTEXT ABOUT THE OFFER:
Product Type: ${context.productType || "Unknown"}
Target Audience: ${context.targetAudience || "General"}
Main Benefit: ${context.coreBenefit || "Unknown"}

INSTRUCTIONS:
1. Write the full, comprehensive content for the Lead Magnet. Make it valuable, actionable, and visually appealing.
2. Return ONLY raw, valid HTML. Do NOT wrap it in markdown block quotes (like \`\`\`html).
3. The HTML should include inline CSS styling to make it look like a beautiful, professional PDF document. Use a clean, modern design with a highly readable font (e.g., system-ui, sans-serif). Include a bold title, headers, nicely padded sections, and bullet points.
4. Ensure the HTML is self-contained. No external stylesheets that might block rendering, though Google Fonts is okay.`;

    const model = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20241022";
    
    const { text: htmlContent } = await generateText({
      model: anthropic(model),
      prompt,
    });
    
    const textGenTime = Date.now() - startTime;
    console.log(`[generate-blueprint/html] HTML generation complete (${textGenTime}ms)`);

    // Clean up if the model still wrapped in markdown
    const cleanHtml = htmlContent.replace(/^```html\n?/, "").replace(/\n?```$/, "");

    return NextResponse.json({ success: true, html: cleanHtml, type: blueprintType });
  } catch (error: any) {
    console.error("[generate-blueprint/html] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate HTML blueprint" }, { status: 500 });
  }
}
