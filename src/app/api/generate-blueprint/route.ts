import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import puppeteer from "puppeteer-core";
import crypto from "crypto";

export const maxDuration = 300; // Allow 300s (5 minutes) for PDF generation - includes Claude text gen + Puppeteer + PDF render + upload
export const runtime = "nodejs"; // Puppeteer requires nodejs runtime

export async function POST(req: Request) {
  try {
    const startTime = Date.now();
    console.log("[generate-blueprint] Request started");
    
    const { funnelId, topic, type } = await req.json();

    if (!funnelId || !topic) {
      return NextResponse.json({ error: "Missing funnelId or topic" }, { status: 400 });
    }

    const blueprintType = type === "bonus" ? "bonus" : "lead";

    console.log(`[generate-blueprint] Generating blueprint for funnelId=${funnelId}, topic=${topic}, type=${blueprintType}`);
    
    const supabase = createAdminClient();

    // 1. Fetch Funnel Data
    console.log("[generate-blueprint] Fetching funnel data from database...");
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
    console.log("[generate-blueprint] Generating HTML content via Claude...");
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
    console.log(`[generate-blueprint] HTML generation complete (${textGenTime}ms)`);

    // Clean up if the model still wrapped in markdown
    const cleanHtml = htmlContent.replace(/^```html\n?/, "").replace(/\n?```$/, "");

    // 3. Generate PDF via Puppeteer (serverless Chromium preferred)
    console.log("[generate-blueprint] Starting Puppeteer launch (serverless preferred)...");
    let browser;
    try {
      const sparticuz = require("@sparticuz/chromium");
      const chromium = sparticuz.default || sparticuz;
      console.log("[generate-blueprint] Launching puppeteer-core with @sparticuz/chromium executablePath");
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        timeout: 30000,
      });
    } catch (chromiumError) {
      console.error("[generate-blueprint] Serverless Chromium launch failed:", chromiumError);

      // Try system Chrome if the developer has it installed and provided via CHROME_PATH/CHROME_BIN
      const chromePath = process.env.CHROME_PATH || process.env.CHROME_BIN;
      if (chromePath) {
        try {
          console.log(`[generate-blueprint] Attempting to launch system Chrome at ${chromePath}`);
          browser = await puppeteer.launch({
            executablePath: chromePath,
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            defaultViewport: { width: 1920, height: 1080 },
            timeout: 30000,
          });
        } catch (sysErr) {
          console.error("[generate-blueprint] System Chrome launch failed:", sysErr);
          throw new Error(
            "Failed to launch a browser. For local development run: `pnpm dlx puppeteer browsers install chrome` or set CHROME_PATH to your Chrome executable."
          );
        }
      } else {
        throw new Error(
          "Serverless Chromium is unavailable. For local development run: `pnpm dlx puppeteer browsers install chrome` or set CHROME_PATH to your Chrome executable."
        );
      }
    }

    console.log("[generate-blueprint] Browser launched. Creating new page...");
    const page = await browser.newPage();
    
    console.log("[generate-blueprint] Setting page content...");
    await page.setContent(cleanHtml, { waitUntil: "networkidle0", timeout: 60000 });
    
    console.log("[generate-blueprint] Generating PDF...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "40px", bottom: "40px", left: "40px", right: "40px" },
      timeout: 30000,
    });
    
    console.log("[generate-blueprint] Closing browser...");
    await browser.close();
    console.log("[generate-blueprint] PDF generation complete");

    // 4. Ensure Supabase Bucket exists
    const bucketName = "blueprints";
    console.log("[generate-blueprint] Checking Supabase bucket...");
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === bucketName)) {
      console.log("[generate-blueprint] Creating bucket...");
      await supabase.storage.createBucket(bucketName, { public: true });
    }

    // 5. Upload PDF
    console.log("[generate-blueprint] Uploading PDF to Supabase...");
    const generatedFileName = `${funnelId}_${blueprintType}_${crypto.randomBytes(6).toString("hex")}.pdf`;
    console.log(`[generate-blueprint] Generated filename: ${generatedFileName}`);
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(generatedFileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    console.log("[generate-blueprint] Getting public URL...");
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(generatedFileName);

    const pdfUrl = publicUrlData.publicUrl;

    // 6. Save file metadata to Funnel Blocks
    console.log("[generate-blueprint] Updating database with blueprint file metadata...");
    const currentFiles = Array.isArray(funnel.blocks?.blueprintFiles)
      ? funnel.blocks.blueprintFiles
      : [];
    const fileId = crypto.randomUUID();
    const newFile = {
      id: fileId,
      topic,
      type: blueprintType,
      fileType: "pdf",
      url: pdfUrl,
      fileName: generatedFileName,
      createdAt: new Date().toISOString(),
    };
    console.log("[generate-blueprint] New file metadata to save:", JSON.stringify(newFile, null, 2));
    const updatedBlocks = {
      ...funnel.blocks,
      blueprintUrl: pdfUrl,
      blueprintFiles: [...currentFiles, newFile],
    };

    console.log("[generate-blueprint] Updated blocks blueprintFiles count:", (updatedBlocks.blueprintFiles || []).length);

    await supabase
      .from("builder_pages")
      .update({ blocks: updatedBlocks })
      .eq("id", funnelId);

    console.log("[generate-blueprint] Database updated with new blueprint file for funnelId=", funnelId, "fileId=", fileId);

    const totalTime = Date.now() - startTime;
    console.log(`[generate-blueprint] Success! Total time: ${totalTime}ms`);
    
    return NextResponse.json({ success: true, pdfUrl, fileId, type: blueprintType });
  } catch (error: any) {
    console.error("[generate-blueprint] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate blueprint" }, { status: 500 });
  }
}
