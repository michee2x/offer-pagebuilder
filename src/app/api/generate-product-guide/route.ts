import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import crypto from "crypto";
import { buildDocx } from "@/utils/buildDocx";

export const maxDuration = 300; // Allow 300s (5 minutes) for Claude text gen + DOCX generation
export const runtime = "nodejs";

const buildPrompt = (funnelName: string, context: any, blueprintText: string) => {
  return `You are a world-class course creator, digital product strategist, and direct response marketer.
Generate a comprehensive, editable Step-by-Step Product Creation Guide for a funnel named "${funnelName}".

CONTEXT ABOUT THE OFFER:
${JSON.stringify(context, null, 2)}

FUNNEL BLUEPRINT:
${blueprintText}

INSTRUCTIONS:
1. Output your response as a VALID JSON object (no markdown fences, no explanation outside the JSON).
2. The JSON must follow this exact structure to be rendered as a DOCX file:
{
  "title": "The Main Product Creation Guide",
  "subtitle": "Step-by-step instructions for building the Main Offer, Upsell, and Downsell",
  "sections": [
    {
      "heading": "Section Title",
      "headingLevel": 1,
      "paragraphs": ["Paragraph text here...", "Another paragraph..."],
      "bullets": ["Bullet point 1", "Bullet point 2"],
      "numberedList": ["Step 1", "Step 2"],
      "table": {
        "headers": ["Column A", "Column B"],
        "rows": [["Cell 1", "Cell 2"]]
      }
    }
  ]
}

3. This guide MUST cover exactly how the user should build three components:
   A) The Main Offer (Sales Page Product)
   B) The Upsell
   C) The Downsell

4. For each of these three components, you must clearly tell the user:
   - What topics/titles to use (if it's a course or community).
   - What specific app or platform to use (e.g., "Use Skool or Telegram for the community", "Use Loom or Zoom for video lessons", "Use Kajabi or Teachable for courses").
   - Exact "Copy & Paste" AI prompts they can use to generate the content (e.g., "Paste this prompt into ChatGPT/Claude to generate your video scripts: ...").
   - Step-by-step action items to get it done.

5. Use tables where helpful (e.g., a "Tools & Apps Stack" table, or an "Action Plan Timeline" table).
6. Write in a clear, instructional, and encouraging tone. Make it feel like an expensive consulting document.
7. CRITICAL: Do NOT invent fake URLs or fake company data. Do NOT use markdown fences around the JSON output. Provide valid JSON only.

Ensure the final JSON is robust, deep, and fully covers the entire product suite for the user.`;
};

export async function POST(req: Request) {
  try {
    const startTime = Date.now();
    console.log("[generate-product-guide] Request started");
    
    const { funnelId } = await req.json();

    if (!funnelId) {
      return NextResponse.json({ error: "Missing funnelId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch Funnel Data
    console.log("[generate-product-guide] Fetching funnel data...");
    const { data: funnel } = await supabase
      .from("builder_pages")
      .select("id, name, blocks")
      .eq("id", funnelId)
      .single();

    if (!funnel) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
    }

    const offerContext = funnel.blocks?.offerContext || {};
    // Depending on generation state, we might have FUNNEL_STRUCTURE_BLUEPRINT or funnel_structure_blueprint
    const call1Raw = funnel.blocks?.offerIntelligence?.call1 || funnel.blocks?.offerIntelligenceRaw || {};
    const blueprintText = funnel.blocks?.offerIntelligence?.FUNNEL_STRUCTURE_BLUEPRINT 
                       || call1Raw?.FUNNEL_STRUCTURE_BLUEPRINT 
                       || call1Raw?.funnel_structure_blueprint 
                       || "";

    // 2. Generate content via Claude
    console.log("[generate-product-guide] Generating DOCX content via Claude...");
    const prompt = buildPrompt(funnel.name || "My Funnel", offerContext, blueprintText);

    const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
    
    // Cap output tokens to prevent JSON truncation issues, similar to intelligence tools
    const { text: rawContent } = await generateText({
      model: anthropic(model),
      prompt,
      maxOutputTokens: 8192,
      temperature: 0.7,
    });
    
    const textGenTime = Date.now() - startTime;
    console.log(`[generate-product-guide] Content generation complete (${textGenTime}ms)`);

    // Clean markdown fencing for JSON
    const content = rawContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

    // 3. Render DOCX
    console.log("[generate-product-guide] Building DOCX from structured JSON...");
    let fileBuffer: Buffer;
    try {
      const parsedContent = JSON.parse(content);
      fileBuffer = await buildDocx(parsedContent);
    } catch (err: any) {
      console.error("[generate-product-guide] Error building DOCX. Raw Output:", content);
      return NextResponse.json({ error: `Failed to build DOCX: ${err.message}` }, { status: 500 });
    }

    // 4. Upload to Supabase Storage
    const bucketName = "blueprints";
    console.log("[generate-product-guide] Checking Supabase bucket...");
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === bucketName)) {
      console.log("[generate-product-guide] Creating bucket...");
      await supabase.storage.createBucket(bucketName, { public: true });
    }

    console.log("[generate-product-guide] Uploading DOCX to Supabase...");
    const generatedFileName = `${funnelId}_product_guide_${crypto.randomBytes(6).toString("hex")}.docx`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(generatedFileName, fileBuffer, {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: false,
      });

    if (uploadError) {
      console.error("[generate-product-guide] Upload failed:", uploadError);
      return NextResponse.json({ error: `Failed to upload file: ${uploadError.message}` }, { status: 500 });
    }

    console.log("[generate-product-guide] Getting public URL...");
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(generatedFileName);

    const fileUrl = publicUrlData.publicUrl;

    // 5. Save file metadata to Funnel Blocks
    const currentFiles = Array.isArray(funnel.blocks?.blueprintFiles)
      ? funnel.blocks.blueprintFiles
      : [];
    const fileId = crypto.randomUUID();
    
    const newFile = {
      id: fileId,
      topic: "Product Creation Guide",
      type: "product_guide", 
      fileType: "docx", 
      url: fileUrl,
      fileName: generatedFileName,
      createdAt: new Date().toISOString(),
    };

    const updatedBlocks = {
      ...funnel.blocks,
      blueprintFiles: [...currentFiles, newFile],
    };

    await supabase
      .from("builder_pages")
      .update({ blocks: updatedBlocks })
      .eq("id", funnelId);

    console.log("[generate-product-guide] Database updated with new guide file metadata");

    const totalTime = Date.now() - startTime;
    console.log(`[generate-product-guide] Success! Total time: ${totalTime}ms`);
    
    return NextResponse.json({ 
      success: true, 
      fileUrl, 
      fileId, 
      type: "product_guide",
      format: "docx"
    });
  } catch (error: any) {
    console.error("[generate-product-guide] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate product guide" }, { status: 500 });
  }
}
