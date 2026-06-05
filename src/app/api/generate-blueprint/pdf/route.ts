import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import puppeteer from "puppeteer-core";
import crypto from "crypto";

export const maxDuration = 300; // Allow 300s (5 minutes) for Puppeteer + upload
export const runtime = "nodejs"; // Puppeteer requires nodejs runtime

export async function POST(req: Request) {
  try {
    const startTime = Date.now();
    console.log("[generate-blueprint/pdf] Request started");
    
    const { funnelId, html, type, topic } = await req.json();

    if (!funnelId || !html || !topic) {
      return NextResponse.json({ error: "Missing funnelId, html, or topic" }, { status: 400 });
    }

    const blueprintType = type === "bonus" ? "bonus" : "lead";

    console.log(`[generate-blueprint/pdf] Generating PDF for funnelId=${funnelId}, type=${blueprintType}`);
    
    const supabase = createAdminClient();

    // 1. Generate PDF via Puppeteer (serverless Chromium preferred)
    console.log("[generate-blueprint/pdf] Starting Puppeteer launch...");
    let browser;
    try {
      const sparticuz = require("@sparticuz/chromium");
      const chromium = sparticuz.default || sparticuz;
      console.log("[generate-blueprint/pdf] Launching puppeteer-core with @sparticuz/chromium");
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        timeout: 30000,
      });
    } catch (chromiumError) {
      console.error("[generate-blueprint/pdf] Serverless Chromium launch failed:", chromiumError);

      // Try system Chrome if the developer has it installed and provided via CHROME_PATH/CHROME_BIN
      const chromePath = process.env.CHROME_PATH || process.env.CHROME_BIN;
      if (chromePath) {
        try {
          console.log(`[generate-blueprint/pdf] Attempting to launch system Chrome at ${chromePath}`);
          browser = await puppeteer.launch({
            executablePath: chromePath,
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            defaultViewport: { width: 1920, height: 1080 },
            timeout: 30000,
          });
        } catch (sysErr) {
          console.error("[generate-blueprint/pdf] System Chrome launch failed:", sysErr);
          throw new Error(
            "Failed to launch a browser. For local development run: `pnpm dlx puppeteer browsers install chrome` or set CHROME_PATH."
          );
        }
      } else {
        throw new Error(
          "Serverless Chromium is unavailable. For local development run: `pnpm dlx puppeteer browsers install chrome` or set CHROME_PATH."
        );
      }
    }

    console.log("[generate-blueprint/pdf] Browser launched. Creating new page...");
    const page = await browser.newPage();
    
    console.log("[generate-blueprint/pdf] Setting page content...");
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 60000 });
    
    console.log("[generate-blueprint/pdf] Generating PDF...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "40px", bottom: "40px", left: "40px", right: "40px" },
      timeout: 60000,
    });
    
    console.log("[generate-blueprint/pdf] Closing browser...");
    await browser.close();
    console.log("[generate-blueprint/pdf] PDF generation complete");

    // 2. Ensure Supabase Bucket exists
    const bucketName = "blueprints";
    console.log("[generate-blueprint/pdf] Checking Supabase bucket...");
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === bucketName)) {
      console.log("[generate-blueprint/pdf] Creating bucket...");
      await supabase.storage.createBucket(bucketName, { public: true });
    }

    // 3. Upload PDF
    console.log("[generate-blueprint/pdf] Uploading PDF to Supabase...");
    const generatedFileName = `${funnelId}_${blueprintType}_${crypto.randomBytes(6).toString("hex")}.pdf`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(generatedFileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    console.log("[generate-blueprint/pdf] Getting public URL...");
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(generatedFileName);

    const pdfUrl = publicUrlData.publicUrl;

    // 4. Save file metadata to Funnel Blocks
    console.log("[generate-blueprint/pdf] Fetching current funnel blocks...");
    const { data: funnel } = await supabase
      .from("builder_pages")
      .select("blocks")
      .eq("id", funnelId)
      .single();

    const currentFiles = Array.isArray(funnel?.blocks?.blueprintFiles)
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

    const updatedBlocks = {
      ...funnel?.blocks,
      blueprintUrl: pdfUrl, // legacy reference
      blueprintFiles: [...currentFiles, newFile],
    };

    await supabase
      .from("builder_pages")
      .update({ blocks: updatedBlocks })
      .eq("id", funnelId);

    console.log("[generate-blueprint/pdf] Database updated with new blueprint file metadata");

    const totalTime = Date.now() - startTime;
    console.log(`[generate-blueprint/pdf] Success! Total time: ${totalTime}ms`);
    
    return NextResponse.json({ success: true, pdfUrl, fileId, type: blueprintType });
  } catch (error: any) {
    console.error("[generate-blueprint/pdf] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate PDF blueprint" }, { status: 500 });
  }
}
