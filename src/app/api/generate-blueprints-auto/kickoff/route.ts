import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import crypto from "crypto";

export const maxDuration = 30; // Fast endpoint just to kickoff
export const runtime = "nodejs";

/** Parses the <!-- INFO_PRODUCTS: {...} --> comment from the INFO_PRODUCT_PLAN HTML section. */
function parseInfoProductPlan(html: string): Record<string, any> | null {
  if (!html) return null;
  const match = html.match(/<!--\s*INFO_PRODUCTS:\s*(\{[\s\S]*?\})\s*-->/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    console.error("[kickoff] Failed to parse INFO_PRODUCTS comment:", e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { funnelId } = await req.json();
    if (!funnelId) {
      return NextResponse.json({ error: "Missing funnelId" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: funnel } = await supabase
      .from("builder_pages")
      .select("blocks, name")
      .eq("id", funnelId)
      .single();

    if (!funnel) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
    }

    const intelligence = funnel.blocks?.intelligence || {};
    const call1 = intelligence.call1 || {};
    const call2 = intelligence.call2 || {};

    const blueprint =
      call1.FUNNEL_STRUCTURE_BLUEPRINT ||
      call1.funnel_structure_blueprint ||
      call2.FUNNEL_STRUCTURE_BLUEPRINT ||
      call2.funnel_structure_blueprint ||
      "";

    const bonusStack =
      call1.STRATEGIC_BONUS_RECOMMENDATIONS ||
      call1.strategic_bonus_recommendations ||
      call2.STRATEGIC_BONUS_RECOMMENDATIONS ||
      call2.strategic_bonus_recommendations ||
      "";

    const infoProductPlanHtml =
      call1.INFO_PRODUCT_PLAN ||
      call1.info_product_plan ||
      call2.INFO_PRODUCT_PLAN ||
      call2.info_product_plan ||
      "";

    // 1. Try to extract structured product plan from the intelligence report
    let parsedPlan = parseInfoProductPlan(infoProductPlanHtml);

    // 2. If no structured plan exists in the report (older funnels), fall back to AI extraction
    if (!parsedPlan) {
      console.log("[kickoff] No INFO_PRODUCT_PLAN found, falling back to AI extraction...");
      const prompt = `You are an elite direct response marketing strategist specialising in info products.
Based on the funnel intelligence below, extract topics and formats for:
- 1 Lead Magnet (free, delivered at lead capture)
- 3 Info Products (paid, one per sales page: Sales, Upsell, Downsell)
- 3 Bonuses (one per purchasable info product, sent on purchase)

All products and bonuses must be info products (downloadable PDF or DOCX guides, ebooks, or playbooks).

Funnel Blueprint:
${blueprint || "N/A"}

Bonus Stack:
${bonusStack || "N/A"}

Return ONLY a valid JSON object with NO markdown fences:
{
  "leadMagnet": { "title": "string", "format": "pdf" },
  "sales": { "title": "string", "format": "pdf", "bonus": { "title": "string", "format": "pdf" } },
  "upsell": { "title": "string", "format": "pdf", "bonus": { "title": "string", "format": "pdf" } },
  "downsell": { "title": "string", "format": "pdf", "bonus": { "title": "string", "format": "pdf" } }
}`;

      const modelName = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
      let aiText = "";
      try {
        const { text } = await generateText({ model: anthropic(modelName), prompt });
        aiText = text;
      } catch (e: any) {
        console.error("[kickoff] AI extraction failed:", e);
        aiText = "";
      }

      try {
        const clean = aiText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
        const extracted = JSON.parse(clean);
        parsedPlan = {
          sales: { title: extracted.sales?.title, format: extracted.sales?.format || "pdf", bonus: extracted.sales?.bonus },
          upsell: { title: extracted.upsell?.title, format: extracted.upsell?.format || "pdf", bonus: extracted.upsell?.bonus },
          downsell: { title: extracted.downsell?.title, format: extracted.downsell?.format || "pdf", bonus: extracted.downsell?.bonus },
        };
        // Override leadMagnet from extracted
        parsedPlan._leadMagnet = extracted.leadMagnet;
      } catch (e) {
        console.error("[kickoff] Failed to parse AI JSON fallback:", e);
        parsedPlan = null;
      }
    }

    // 3. Extract lead magnet topic using the funnel blueprint
    const leadMagnetTopic =
      parsedPlan?._leadMagnet?.title ||
      (blueprint ? `Free Guide: ${funnel.name} Starter Blueprint` : "Lead Magnet Guide");
    const leadMagnetFormat = parsedPlan?._leadMagnet?.format || "pdf";

    const validFormats = ["pdf", "docx"];

    // 4. Build file placeholder records
    const leadId = crypto.randomUUID();
    const salesId = crypto.randomUUID();
    const upsellId = crypto.randomUUID();
    const downsellId = crypto.randomUUID();
    const salesBonusId = crypto.randomUUID();
    const upsellBonusId = crypto.randomUUID();
    const downsellBonusId = crypto.randomUUID();

    const salesData = parsedPlan?.sales || {};
    const upsellData = parsedPlan?.upsell || {};
    const downsellData = parsedPlan?.downsell || {};

    const newFiles = [
      // Lead Magnet
      {
        id: leadId,
        topic: leadMagnetTopic,
        type: "lead",
        page: null,
        fileType: validFormats.includes(leadMagnetFormat) ? leadMagnetFormat : "pdf",
        status: "generating",
        url: null,
        fileName: null,
        assignedProductId: null,
        createdAt: new Date().toISOString(),
      },
      // Sales Page Info Product
      {
        id: salesId,
        topic: salesData.title || `${funnel.name} — Core Guide`,
        type: "product",
        page: "sales",
        fileType: validFormats.includes(salesData.format) ? salesData.format : "pdf",
        status: "generating",
        url: null,
        fileName: null,
        assignedProductId: null,
        chapters: salesData.chapters || [],
        createdAt: new Date().toISOString(),
      },
      // Upsell Page Info Product
      {
        id: upsellId,
        topic: upsellData.title || `${funnel.name} — Advanced Playbook`,
        type: "product",
        page: "upsell",
        fileType: validFormats.includes(upsellData.format) ? upsellData.format : "pdf",
        status: "generating",
        url: null,
        fileName: null,
        assignedProductId: null,
        chapters: upsellData.chapters || [],
        createdAt: new Date().toISOString(),
      },
      // Downsell Page Info Product
      {
        id: downsellId,
        topic: downsellData.title || `${funnel.name} — Starter Guide`,
        type: "product",
        page: "downsell",
        fileType: validFormats.includes(downsellData.format) ? downsellData.format : "pdf",
        status: "generating",
        url: null,
        fileName: null,
        assignedProductId: null,
        chapters: downsellData.chapters || [],
        createdAt: new Date().toISOString(),
      },
      // Sales Bonus (assigned to Sales Product by default)
      {
        id: salesBonusId,
        topic: salesData.bonus?.title || `${funnel.name} — Sales Bonus`,
        type: "bonus",
        page: "sales",
        fileType: validFormats.includes(salesData.bonus?.format) ? salesData.bonus.format : "pdf",
        status: "generating",
        url: null,
        fileName: null,
        assignedProductId: salesId,
        createdAt: new Date().toISOString(),
      },
      // Upsell Bonus (assigned to Upsell Product by default)
      {
        id: upsellBonusId,
        topic: upsellData.bonus?.title || `${funnel.name} — Upsell Bonus`,
        type: "bonus",
        page: "upsell",
        fileType: validFormats.includes(upsellData.bonus?.format) ? upsellData.bonus.format : "pdf",
        status: "generating",
        url: null,
        fileName: null,
        assignedProductId: upsellId,
        createdAt: new Date().toISOString(),
      },
      // Downsell Bonus (assigned to Downsell Product by default)
      {
        id: downsellBonusId,
        topic: downsellData.bonus?.title || `${funnel.name} — Downsell Bonus`,
        type: "bonus",
        page: "downsell",
        fileType: validFormats.includes(downsellData.bonus?.format) ? downsellData.bonus.format : "pdf",
        status: "generating",
        url: null,
        fileName: null,
        assignedProductId: downsellId,
        createdAt: new Date().toISOString(),
      },
    ];

    const currentFiles = Array.isArray(funnel.blocks?.blueprintFiles)
      ? funnel.blocks.blueprintFiles
      : [];

    const updatedBlocks = {
      ...funnel.blocks,
      blueprintFiles: [...currentFiles, ...newFiles],
    };

    await supabase.from("builder_pages").update({ blocks: updatedBlocks }).eq("id", funnelId);

    return NextResponse.json({
      success: true,
      lead: newFiles[0],
      sales: newFiles[1],
      upsell: newFiles[2],
      downsell: newFiles[3],
      salesBonus: newFiles[4],
      upsellBonus: newFiles[5],
      downsellBonus: newFiles[6],
    });
  } catch (error: any) {
    console.error("[generate-blueprints-auto/kickoff] Error:", error);
    return NextResponse.json({ error: error.message || "Failed kickoff" }, { status: 500 });
  }
}
