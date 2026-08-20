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
  context: any,
  type: string,
  chapters?: string[]
): string {
  const currentYear = new Date().getFullYear();
  const contextBlock = `
CONTEXT ABOUT THE OFFER:
Product Type: ${context.productType || "Info Product"}
Target Audience: ${context.targetAudience || "General"}
Main Benefit: ${context.coreBenefit || "Unknown"}`;

  const chaptersBlock = chapters && chapters.length > 0
    ? `\nPLANNED CHAPTERS / SECTIONS:\n${chapters.map((c, i) => `${i + 1}. ${c}`).join("\n")}`
    : "";

  const antiHallucinationRules = `
CRITICAL ACCURACY RULES:
- The current year is ${currentYear}. Do NOT reference past years (like 2023 or 2024) as the current year. Any copyright dates must be ${currentYear}.
- Do NOT hallucinate or invent false information (e.g., fake contact details, fake company names, fake names).
- If specific data is missing from the context, use placeholders (e.g., [Company Name]) or omit it entirely. Never guess or fabricate facts.`;

  const isBonus = type === "bonus";
  const isBigProduct = type === "product";

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
3. Each section can have any combination of: paragraphs, bullets, numberedList, table.
4. Write this as a premium, standalone info product that delivers REAL, actionable value. It must be self-contained and immediately useful.
5. ${isBigProduct ? "Include at least 8-12 substantive chapters/sections aligned with the planned chapters above." : isBonus ? "Include at least 4-6 focused sections. This is a bonus guide that complements the main product." : "Include at least 6-8 substantive sections."}
6. Write in a clear, professional but engaging tone. This is a downloadable info product, not a course.
7. headingLevel should be 1 for major sections, 2 for subsections.

${antiHallucinationRules}`;
  }

  // Default: PDF
  return `You are a world-class copywriter and direct response marketer specialising in info products.
Generate a complete, high-value Info Product PDF for a funnel named "${funnelName}".

TOPIC: ${topic}
${contextBlock}${chaptersBlock}

INSTRUCTIONS:
1. Write comprehensive, genuinely valuable content. This must be a REAL info product a customer would happily pay for.
2. Return ONLY raw, valid HTML. Do NOT wrap it in markdown block quotes.
3. The HTML should include inline CSS styling to look like a beautiful, professional PDF document. Use a clean, modern design with a highly readable font (e.g., system-ui, sans-serif). Include a bold title, headers, nicely padded sections, and bullet points.
4. Ensure the HTML is self-contained.
5. ${isBigProduct ? "Structure the content around the planned chapters above. Write each chapter with depth and real insight." : isBonus ? "This is a bonus companion guide. Make it feel exclusive and high-value, complementing the main product." : "Make it immediately actionable with clear takeaways."}

${antiHallucinationRules}`;
}

export async function POST(req: Request) {
  let funnelIdToUpdate: string | undefined;
  let fileIdToUpdate: string | undefined;

  try {
    const { funnelId, topic, type, format, fileId, page, chapters } = await req.json();
    funnelIdToUpdate = funnelId;
    fileIdToUpdate = fileId;

    if (!funnelId || !topic || !fileId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const docFormat = format === "docx" ? "docx" : "pdf";
    const blueprintType = type === "product" ? "product" : type === "bonus" ? "bonus" : "lead";
    console.log(`[generate-blueprints-auto/execute] Generating ${docFormat} type=${blueprintType} page=${page || "none"} for ${fileId}...`);

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
    const prompt = buildPrompt(docFormat, funnel.name, topic, context, blueprintType, chapters || []);
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

    const blueprintTypeSafe = type === "product" ? "product" : type === "bonus" ? "bonus" : "lead";
    const generatedFileName = `${funnelId}_${blueprintTypeSafe}${page ? `_${page}` : ""}_${crypto.randomBytes(6).toString("hex")}.${fileExtension}`;

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

    // Auto-activate the lead magnet or product the moment it finishes generating.
    const updatedBlocks: any = { ...freshFunnel?.blocks, blueprintFiles: updatedFiles };
    if (blueprintTypeSafe === "lead" && !freshFunnel?.blocks?.activeLeadMagnetFileId) {
      updatedBlocks.activeLeadMagnetFileId = fileId;
      console.log(`[generate-blueprints-auto/execute] Auto-activating lead magnet: ${fileId}`);
    } else if (blueprintTypeSafe === "product" && page) {
      // Auto-activate product per page slot if none active yet
      const activeKey = `activeProductFileId_${page}`;
      if (!freshFunnel?.blocks?.[activeKey]) {
        updatedBlocks[activeKey] = fileId;
        console.log(`[generate-blueprints-auto/execute] Auto-activating ${page} product: ${fileId}`);
      }
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
      if (funnelIdToUpdate && fileIdToUpdate) {
        const supabase = createAdminClient();
        const { data: freshFunnel } = await supabase.from("builder_pages").select("blocks").eq("id", funnelIdToUpdate).single();
        const currentFiles = Array.isArray(freshFunnel?.blocks?.blueprintFiles) ? freshFunnel.blocks.blueprintFiles : [];
        const updatedFiles = currentFiles.map((file: any) => {
          if (file.id === fileIdToUpdate) return { ...file, status: "failed" };
          return file;
        });
        await supabase.from("builder_pages").update({ blocks: { ...freshFunnel?.blocks, blueprintFiles: updatedFiles } }).eq("id", funnelIdToUpdate);
      }
    } catch (e) {
      // Ignore
    }

    return NextResponse.json({ error: error.message || "Failed execution" }, { status: 500 });
  }
}
