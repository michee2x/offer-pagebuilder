import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import puppeteer from "puppeteer-core";
import crypto from "crypto";
import { buildDocx } from "@/utils/buildDocx";

export const maxDuration = 300; // 5 minutes
export const runtime = "nodejs";

function buildPrompt(
  format: "pdf" | "docx",
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

  if (format === "docx") {
    return `You are a world-class copywriter, strategist, and direct response marketer.
Generate a comprehensive, editable Strategy Playbook for a funnel named "${funnelName}".

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
4. Write the document as an EDITABLE STRATEGY PLAYBOOK.
5. Include at least 6-10 substantive sections.
6. Write in a clear, professional but engaging tone.
7. headingLevel should be 1 for major sections, 2 for subsections.

${antiHallucinationRules}`;
  }

  // Default: PDF
  return `You are a world-class copywriter and direct response marketer.
Generate a complete, high-value Guide/Checklist PDF for a funnel named "${funnelName}".

TOPIC: ${topic}
${contextBlock}

INSTRUCTIONS:
1. Write the full, comprehensive content. Make it valuable, actionable, and visually appealing.
2. Return ONLY raw, valid HTML. Do NOT wrap it in markdown block quotes (like \`\`\`html).
3. The HTML should include inline CSS styling to make it look like a beautiful, professional PDF document. Use a clean, modern design with a highly readable font (e.g., system-ui, sans-serif). Include a bold title, headers, nicely padded sections, and bullet points.
4. Ensure the HTML is self-contained. No external stylesheets that might block rendering.

${antiHallucinationRules}`;
}

export async function POST(req: Request) {
  try {
    const { funnelId, topic, type, format, fileId } = await req.json();

    if (!funnelId || !topic || !fileId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const docFormat = format === "docx" ? "docx" : "pdf";
    console.log(`[generate-blueprints-auto/execute] Generating ${docFormat} for ${fileId}...`);

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

    // 2. Generate content via AI
    const prompt = buildPrompt(docFormat, funnel.name, topic, context);
    const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

    let rawContent = "";
    try {
      const { text } = await generateText({
        model: anthropic(model),
        prompt,
        maxOutputTokens: 4096,
      });
      rawContent = text;
    } catch (e: any) {
      console.error("[generate-blueprints-auto/execute] AI text generation failed", e);
      throw new Error(`AI generation failed: ${e.message}`);
    }

    let content = rawContent;
    if (docFormat === "pdf") {
      content = rawContent.replace(/^```html\n?/, "").replace(/\n?```$/, "");
    } else if (docFormat === "docx") {
      content = rawContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    // 3. Render file
    let fileBuffer: Buffer = Buffer.alloc(0);
    let contentType = "application/pdf";
    let fileExtension = "pdf";

    if (docFormat === "pdf") {
      let browser;
      try {
        const sparticuz = require("@sparticuz/chromium");
        const chromium = sparticuz.default || sparticuz;
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: { width: 1920, height: 1080 },
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
          timeout: 30000,
        });
      } catch (chromiumError) {
        const chromePath = process.env.CHROME_PATH || process.env.CHROME_BIN;
        if (chromePath) {
          browser = await puppeteer.launch({
            executablePath: chromePath,
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            defaultViewport: { width: 1920, height: 1080 },
            timeout: 30000,
          });
        } else {
          throw new Error("Chromium unavailable.");
        }
      }

      const page = await browser.newPage();
      await page.setContent(content, { waitUntil: "networkidle0", timeout: 60000 });
      const pdfBytes = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "40px", bottom: "40px", left: "40px", right: "40px" },
        timeout: 60000,
      });
      fileBuffer = Buffer.from(pdfBytes);
      await browser.close();
      contentType = "application/pdf";
      fileExtension = "pdf";
    } else if (docFormat === "docx") {
      try {
        const parsedContent = JSON.parse(content);
        fileBuffer = await buildDocx(parsedContent);
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        fileExtension = "docx";
      } catch (err: any) {
        throw new Error(`Failed to build DOCX: ${err.message}`);
      }
    }

    // 4. Upload to Supabase
    const bucketName = "blueprints";
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === bucketName)) {
      await supabase.storage.createBucket(bucketName, { public: true });
    }

    const blueprintType = type === "bonus" ? "bonus" : "lead";
    const generatedFileName = `${funnelId}_${blueprintType}_${crypto.randomBytes(6).toString("hex")}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(generatedFileName, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(generatedFileName);
    const fileUrl = publicUrlData.publicUrl;

    // 5. Update the generating placeholder to completed
    // We MUST fetch fresh blocks to prevent overwriting parallel changes from the other asset generating simultaneously
    const { data: freshFunnel } = await supabase
      .from("builder_pages")
      .select("blocks")
      .eq("id", funnelId)
      .single();

    const currentFiles = Array.isArray(freshFunnel?.blocks?.blueprintFiles) ? freshFunnel.blocks.blueprintFiles : [];

    const updatedFiles = currentFiles.map((file: any) => {
      if (file.id === fileId) {
        return {
          ...file,
          status: "completed",
          url: fileUrl,
          fileName: generatedFileName,
        };
      }
      return file;
    });

    // Auto-activate the lead magnet the moment it finishes generating.
    // Only set it if there is no active lead magnet already (so we don't
    // overwrite a user's manual choice on re-generation).
    const updatedBlocks: any = { ...freshFunnel?.blocks, blueprintFiles: updatedFiles };
    if (blueprintType === "lead" && !freshFunnel?.blocks?.activeLeadMagnetFileId) {
      updatedBlocks.activeLeadMagnetFileId = fileId;
      console.log(`[generate-blueprints-auto/execute] Auto-activating lead magnet: ${fileId}`);
    }

    await supabase
      .from("builder_pages")
      .update({ blocks: updatedBlocks })
      .eq("id", funnelId);

    console.log(`[generate-blueprints-auto/execute] Successfully completed ${fileId}`);
    return NextResponse.json({ success: true, fileUrl });
  } catch (error: any) {
    console.error("[generate-blueprints-auto/execute] Error:", error);

    // Attempt to mark as failed
    try {
      const { funnelId, fileId } = await req.json().catch(() => ({}));
      if (funnelId && fileId) {
        const supabase = createAdminClient();
        const { data: freshFunnel } = await supabase.from("builder_pages").select("blocks").eq("id", funnelId).single();
        const currentFiles = Array.isArray(freshFunnel?.blocks?.blueprintFiles) ? freshFunnel.blocks.blueprintFiles : [];
        const updatedFiles = currentFiles.map((file: any) => {
          if (file.id === fileId) return { ...file, status: "failed" };
          return file;
        });
        await supabase.from("builder_pages").update({ blocks: { ...freshFunnel?.blocks, blueprintFiles: updatedFiles } }).eq("id", funnelId);
      }
    } catch (e) {
      // Ignore
    }

    return NextResponse.json({ error: error.message || "Failed execution" }, { status: 500 });
  }
}
