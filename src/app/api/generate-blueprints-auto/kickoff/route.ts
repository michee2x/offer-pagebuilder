import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import crypto from "crypto";

export const maxDuration = 30; // Fast endpoint just to kickoff
export const runtime = "nodejs";

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

    const blueprint = call1.FUNNEL_STRUCTURE_BLUEPRINT || call1.funnel_structure_blueprint || call2.FUNNEL_STRUCTURE_BLUEPRINT || call2.funnel_structure_blueprint || "";
    const bonusStack = call1.STRATEGIC_BONUS_RECOMMENDATIONS || call1.strategic_bonus_recommendations || call2.STRATEGIC_BONUS_RECOMMENDATIONS || call2.strategic_bonus_recommendations || "";

    const prompt = `You are an elite direct response marketing strategist.
I need you to quickly extract the best topic for a Lead Magnet and a Bonus based on the funnel intelligence provided below.
You must also decide the best file format for each asset. The only allowed formats are "pdf" (best for visual guides, checklists, cheat sheets) or "docx" (best for text-heavy workbooks, templates, or playbooks). Do NOT choose "csv".

Funnel Blueprint:
${blueprint || "N/A"}

Bonus Stack:
${bonusStack || "N/A"}

Return ONLY a valid JSON object matching this exact structure, with no other text or markdown block formatting:
{
  "leadMagnet": {
    "topic": "The exact title/topic for the Lead Magnet",
    "format": "pdf or docx"
  },
  "bonus": {
    "topic": "The exact title/topic for the Bonus",
    "format": "pdf or docx"
  }
}`;

    const modelName = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
    let aiResponse;
    try {
      const { text } = await generateText({
        model: anthropic(modelName),
        prompt,
      });
      aiResponse = text;
    } catch (e: any) {
      console.error("[generate-blueprints-auto] AI generation failed", e);
      // Fallback in case AI fails
      aiResponse = JSON.stringify({
        leadMagnet: { topic: "Lead Magnet Guide", format: "pdf" },
        bonus: { topic: "Bonus Checklist", format: "pdf" }
      });
    }

    let parsed;
    try {
      // Remove any markdown fencing if the AI ignores instructions
      const cleanJson = aiResponse.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.error("[generate-blueprints-auto] Failed to parse JSON:", aiResponse);
      parsed = {
        leadMagnet: { topic: "Lead Magnet Blueprint", format: "pdf" },
        bonus: { topic: "Bonus Resource", format: "pdf" }
      };
    }

    // Force format validation just in case
    const validFormats = ["pdf", "docx"];
    const leadFormat = validFormats.includes(parsed.leadMagnet?.format) ? parsed.leadMagnet.format : "pdf";
    const bonusFormat = validFormats.includes(parsed.bonus?.format) ? parsed.bonus.format : "pdf";

    const leadId = crypto.randomUUID();
    const bonusId = crypto.randomUUID();

    const newLeadFile = {
      id: leadId,
      topic: parsed.leadMagnet?.topic || "Lead Magnet",
      type: "lead",
      fileType: leadFormat,
      status: "generating",
      createdAt: new Date().toISOString(),
    };

    const newBonusFile = {
      id: bonusId,
      topic: parsed.bonus?.topic || "Bonus",
      type: "bonus",
      fileType: bonusFormat,
      status: "generating",
      createdAt: new Date().toISOString(),
    };

    const currentFiles = Array.isArray(funnel.blocks?.blueprintFiles) ? funnel.blocks.blueprintFiles : [];
    
    // Check if we already have files that are 'generating' for this funnel just in case the user clicked multiple times quickly
    // To be safe, we just append them.
    const updatedBlocks = {
      ...funnel.blocks,
      blueprintFiles: [...currentFiles, newLeadFile, newBonusFile],
    };

    await supabase.from("builder_pages").update({ blocks: updatedBlocks }).eq("id", funnelId);

    return NextResponse.json({
      success: true,
      leadMagnet: newLeadFile,
      bonus: newBonusFile,
    });
  } catch (error: any) {
    console.error("[generate-blueprints-auto/kickoff] Error:", error);
    return NextResponse.json({ error: error.message || "Failed kickoff" }, { status: 500 });
  }
}
