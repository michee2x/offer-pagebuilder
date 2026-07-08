import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import crypto from "crypto";
import { buildDocx } from "@/utils/buildDocx";

export const maxDuration = 300; // 5 minutes
export const runtime = "nodejs";

// ─── Prompt ──────────────────────────────────────────────────────────────────
// Lean prompt: broad coverage, concise sections, no runaway numbered lists
const buildPrompt = (funnelName: string, context: any, blueprintText: string) => {
  return `You are a world-class digital product strategist and direct response marketer.
Generate a Step-by-Step Product Creation Guide for a funnel named "${funnelName}".

OFFER CONTEXT:
${JSON.stringify(context, null, 2)}

FUNNEL BLUEPRINT:
${blueprintText}

OUTPUT RULES — READ CAREFULLY:
1. Return ONLY a single valid JSON object. No markdown, no text outside the JSON.
2. The JSON must follow this exact structure:
{
  "title": "...",
  "subtitle": "...",
  "sections": [
    {
      "heading": "Section heading",
      "headingLevel": 1,
      "paragraphs": ["..."],
      "bullets": ["..."],
      "numberedList": ["..."],
      "table": { "headers": ["Col A", "Col B"], "rows": [["a","b"]] }
    }
  ]
}
3. If a field is empty (e.g., no table for a section), use [] for arrays and omit the table key entirely — do NOT output {"headers":[],"rows":[]}.
4. KEEP EACH SECTION CONCISE: paragraphs max 2-3 sentences, bullet/numbered lists max 6 items each.
5. Cover exactly three products:
   A) Main Offer (Sales Page product)
   B) Upsell
   C) Downsell
6. For each product include:
   - Recommended topic/title/format
   - Platform to use (e.g. Kajabi, Skool, Telegram, Loom, Canva)
   - ONE paste-ready AI prompt for generating its core content
   - 5-6 step action checklist
7. Include a Tools & Apps overview table at the start.
8. DO NOT invent fake URLs or fake company names.
9. The entire JSON must be complete and valid — never cut off mid-string or mid-array.`;
};

// ─── JSON repair: try to close any open braces/brackets ──────────────────────
function attemptJsonRepair(raw: string): string {
  let s = raw.trim();
  // Remove any trailing incomplete string (ends inside a quote)
  s = s.replace(/,?\s*"[^"]*$/, "");
  // Count open vs closed braces/brackets and close the gap
  let openBraces = 0, openBrackets = 0;
  let inString = false, escaped = false;
  for (const ch of s) {
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") openBraces++;
    if (ch === "}") openBraces--;
    if (ch === "[") openBrackets++;
    if (ch === "]") openBrackets--;
  }
  // Close open structures
  while (openBrackets > 0) { s += "]"; openBrackets--; }
  while (openBraces > 0) { s += "}"; openBraces--; }
  return s;
}

// ─── Handler ─────────────────────────────────────────────────────────────────
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

    const intelligence = funnel.blocks?.intelligence || {};
    const offerContext = intelligence.raw_input || {};
    const call1Raw = intelligence.call1 || {};

    // Pass the entire parsed call1/call2 data so the AI has rich context
    // or specifically the Blueprint if that's all it needs. Let's pass the whole call1
    // to give it maximum context about the funnel target audience and offer.
    const blueprintText =
      call1Raw?.FUNNEL_STRUCTURE_BLUEPRINT ||
      call1Raw?.funnel_structure_blueprint ||
      JSON.stringify(call1Raw);

    // 2. Generate content via Claude
    // claude-sonnet-4-6 supports up to 64k output tokens.
    // 16k gives us a full, complete guide without hitting the Vercel 300s wall.
    console.log("[generate-product-guide] Generating DOCX content via Claude...");
    const prompt = buildPrompt(funnel.name || "My Funnel", offerContext, blueprintText);
    const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

    const { text: rawContent } = await generateText({
      model: anthropic(model),
      prompt,
      maxOutputTokens: 12000,
      temperature: 0.5, // lower = more deterministic JSON
    });

    const textGenTime = Date.now() - startTime;
    console.log(`[generate-product-guide] Content generation complete (${textGenTime}ms), length=${rawContent.length}`);

    // 3. Clean & parse JSON — with truncation repair fallback
    console.log("[generate-product-guide] Building DOCX from structured JSON...");
    // Strip any accidental markdown fences
    let content = rawContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    let parsedContent: any;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      console.warn("[generate-product-guide] Initial JSON.parse failed — attempting repair...");
      const repaired = attemptJsonRepair(content);
      try {
        parsedContent = JSON.parse(repaired);
        console.log("[generate-product-guide] JSON repair succeeded.");
      } catch (repairErr: any) {
        console.error("[generate-product-guide] JSON repair also failed. Raw snippet (first 500 chars):", content.slice(0, 500));
        return NextResponse.json(
          { error: `Failed to parse AI output as JSON: ${repairErr.message}` },
          { status: 500 }
        );
      }
    }

    // Sanitise: remove sections with empty table objects (headers:[]) so buildDocx never sees them
    if (Array.isArray(parsedContent?.sections)) {
      parsedContent.sections = parsedContent.sections.map((sec: any) => {
        if (sec.table && Array.isArray(sec.table.headers) && sec.table.headers.length === 0) {
          const { table, ...rest } = sec;
          return rest;
        }
        return sec;
      });
    }

    let fileBuffer: Buffer;
    try {
      fileBuffer = await buildDocx(parsedContent);
    } catch (docxErr: any) {
      console.error("[generate-product-guide] buildDocx error:", docxErr.message);
      return NextResponse.json({ error: `Failed to build DOCX: ${docxErr.message}` }, { status: 500 });
    }

    // 4. Upload to Supabase Storage
    const bucketName = "blueprints";
    console.log("[generate-product-guide] Uploading DOCX to Supabase...");
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === bucketName)) {
      await supabase.storage.createBucket(bucketName, { public: true });
    }

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

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(generatedFileName);
    const fileUrl = publicUrlData.publicUrl;

    // 5. Save file metadata to Funnel Blocks
    const currentFiles = Array.isArray(funnel.blocks?.blueprintFiles) ? funnel.blocks.blueprintFiles : [];
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

    await supabase
      .from("builder_pages")
      .update({ blocks: { ...funnel.blocks, blueprintFiles: [...currentFiles, newFile] } })
      .eq("id", funnelId);

    const totalTime = Date.now() - startTime;
    console.log(`[generate-product-guide] Success! Total time: ${totalTime}ms`);

    return NextResponse.json({ success: true, fileUrl, fileId, type: "product_guide", format: "docx" });
  } catch (error: any) {
    console.error("[generate-product-guide] Unhandled error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate product guide" }, { status: 500 });
  }
}
