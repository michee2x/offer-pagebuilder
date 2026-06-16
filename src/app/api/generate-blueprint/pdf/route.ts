import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import puppeteer from "puppeteer-core";
import crypto from "crypto";
import { buildDocx } from "@/utils/buildDocx";

export const maxDuration = 300; // Allow 300s (5 minutes) for Puppeteer + upload
export const runtime = "nodejs"; // Puppeteer requires nodejs runtime

export async function POST(req: Request) {
  try {
    const startTime = Date.now();
    console.log("[generate-blueprint/render] Request started");
    
    // Accept html for backwards compatibility, but map it to content
    const body = await req.json();
    const { funnelId, html, content: rawContent, type, topic, format = "pdf" } = body;
    
    const content = rawContent || html; // Fallback to html if content is not provided

    if (!funnelId || !content || !topic) {
      return NextResponse.json({ error: "Missing funnelId, content, or topic" }, { status: 400 });
    }

    const blueprintType = type === "bonus" ? "bonus" : "lead";
    const docFormat = (["pdf", "csv", "docx"].includes(format) ? format : "pdf") as "pdf" | "csv" | "docx";

    console.log(`[generate-blueprint/render] Generating ${docFormat.toUpperCase()} for funnelId=${funnelId}, type=${blueprintType}`);
    
    const supabase = createAdminClient();
    
    let fileBuffer: Buffer;
    let contentType: string;
    let fileExtension: string;

    if (docFormat === "pdf") {
      // 1. Generate PDF via Puppeteer
      console.log("[generate-blueprint/render] Starting Puppeteer launch...");
      let browser;
      try {
        const sparticuz = require("@sparticuz/chromium");
        const chromium = sparticuz.default || sparticuz;
        console.log("[generate-blueprint/render] Launching puppeteer-core with @sparticuz/chromium");
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: { width: 1920, height: 1080 },
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
          timeout: 30000,
        });
      } catch (chromiumError) {
        console.error("[generate-blueprint/render] Serverless Chromium launch failed:", chromiumError);

        // Try system Chrome if the developer has it installed and provided via CHROME_PATH/CHROME_BIN
        const chromePath = process.env.CHROME_PATH || process.env.CHROME_BIN;
        if (chromePath) {
          try {
            console.log(`[generate-blueprint/render] Attempting to launch system Chrome at ${chromePath}`);
            browser = await puppeteer.launch({
              executablePath: chromePath,
              headless: true,
              args: ["--no-sandbox", "--disable-setuid-sandbox"],
              defaultViewport: { width: 1920, height: 1080 },
              timeout: 30000,
            });
          } catch (sysErr) {
            console.error("[generate-blueprint/render] System Chrome launch failed:", sysErr);
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

      console.log("[generate-blueprint/render] Browser launched. Creating new page...");
      const page = await browser.newPage();
      
      console.log("[generate-blueprint/render] Setting page content...");
      await page.setContent(content, { waitUntil: "networkidle0", timeout: 60000 });
      
      console.log("[generate-blueprint/render] Generating PDF...");
      const pdfBytes = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "40px", bottom: "40px", left: "40px", right: "40px" },
        timeout: 60000,
      });
      fileBuffer = Buffer.from(pdfBytes);
      
      console.log("[generate-blueprint/render] Closing browser...");
      await browser.close();
      
      contentType = "application/pdf";
      fileExtension = "pdf";
    } else if (docFormat === "csv") {
      // 2. Generate CSV
      console.log("[generate-blueprint/render] Formatting CSV...");
      fileBuffer = Buffer.from(content, "utf-8");
      contentType = "text/csv";
      fileExtension = "csv";
    } else if (docFormat === "docx") {
      // 3. Generate DOCX
      console.log("[generate-blueprint/render] Building DOCX from structured JSON...");
      try {
        const parsedContent = JSON.parse(content);
        fileBuffer = await buildDocx(parsedContent);
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        fileExtension = "docx";
      } catch (err: any) {
        console.error("[generate-blueprint/render] Error building DOCX:", err);
        throw new Error(`Failed to build DOCX: ${err.message}`);
      }
    } else {
      throw new Error(`Unsupported document format: ${docFormat}`);
    }

    // Ensure Supabase Bucket exists
    const bucketName = "blueprints";
    console.log("[generate-blueprint/render] Checking Supabase bucket...");
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === bucketName)) {
      console.log("[generate-blueprint/render] Creating bucket...");
      await supabase.storage.createBucket(bucketName, { public: true });
    }

    // Upload File
    console.log(`[generate-blueprint/render] Uploading ${docFormat.toUpperCase()} to Supabase...`);
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

    console.log("[generate-blueprint/render] Getting public URL...");
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(generatedFileName);

    const fileUrl = publicUrlData.publicUrl;

    // Save file metadata to Funnel Blocks
    console.log("[generate-blueprint/render] Fetching current funnel blocks...");
    const { data: funnel } = await supabase
      .from("builder_pages")
      .select("blocks")
      .eq("id", funnelId)
      .single();

    const currentFiles = Array.isArray(funnel?.blocks?.blueprintFiles)
      ? funnel.blocks.blueprintFiles
      : [];
    const fileId = crypto.randomUUID();
    
    // We add fileFormat to distinguish from blueprintType (lead/bonus)
    const newFile = {
      id: fileId,
      topic,
      type: blueprintType, // lead or bonus
      fileType: docFormat, // pdf, csv, or docx
      url: fileUrl,
      fileName: generatedFileName,
      createdAt: new Date().toISOString(),
    };

    const updatedBlocks = {
      ...funnel?.blocks,
      blueprintUrl: fileUrl, // legacy reference, keep for backwards compat
      blueprintFiles: [...currentFiles, newFile],
    };

    await supabase
      .from("builder_pages")
      .update({ blocks: updatedBlocks })
      .eq("id", funnelId);

    console.log("[generate-blueprint/render] Database updated with new blueprint file metadata");

    const totalTime = Date.now() - startTime;
    console.log(`[generate-blueprint/render] Success! Total time: ${totalTime}ms`);
    
    return NextResponse.json({ 
      success: true, 
      fileUrl, // return generic name instead of pdfUrl
      pdfUrl: fileUrl, // backwards compatibility for frontend
      fileId, 
      type: blueprintType,
      format: docFormat
    });
  } catch (error: any) {
    console.error("[generate-blueprint/render] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate blueprint" }, { status: 500 });
  }
}
