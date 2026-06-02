import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import crypto from "crypto";

export const maxDuration = 60; // Allow 60s for PDF generation
export const runtime = "nodejs"; // Puppeteer requires nodejs runtime

export async function POST(req: Request) {
  try {
    const { funnelId, topic } = await req.json();

    if (!funnelId || !topic) {
      return NextResponse.json({ error: "Missing funnelId or topic" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch Funnel Data
    const { data: funnel } = await supabase
      .from("builder_pages")
      .select("id, name, blocks")
      .eq("id", funnelId)
      .single();

    if (!funnel) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
    }

    const context = funnel.blocks?.offerContext || {};
    const copyBlocks = funnel.blocks?.copy || {};

    // 2. Generate HTML Content via Claude
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

    // Clean up if the model still wrapped in markdown
    const cleanHtml = htmlContent.replace(/^```html\n?/, "").replace(/\n?```$/, "");

    // 3. Generate PDF via Puppeteer
    const executablePath = await chromium.executablePath();
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: executablePath || undefined, // undefined falls back to local installed chromium if not in serverless
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(cleanHtml, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "40px", bottom: "40px", left: "40px", right: "40px" },
    });
    await browser.close();

    // 4. Ensure Supabase Bucket exists
    const bucketName = "blueprints";
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === bucketName)) {
      await supabase.storage.createBucket(bucketName, { public: true });
    }

    // 5. Upload PDF
    const fileName = `${funnelId}_${crypto.randomBytes(6).toString("hex")}.pdf`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    const pdfUrl = publicUrlData.publicUrl;

    // 6. Save URL to Funnel Blocks
    const updatedBlocks = {
      ...funnel.blocks,
      blueprintUrl: pdfUrl,
    };

    await supabase
      .from("builder_pages")
      .update({ blocks: updatedBlocks })
      .eq("id", funnelId);

    return NextResponse.json({ success: true, pdfUrl });
  } catch (error: any) {
    console.error("[generate-blueprint] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate blueprint" }, { status: 500 });
  }
}
