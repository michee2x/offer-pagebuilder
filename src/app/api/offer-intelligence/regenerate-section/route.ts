import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { CALL1_SYSTEM, CALL2_SYSTEM, buildCall1UserPrompt, buildCall2UserPrompt } from '@/lib/offer-prompts';
import type { OfferFormData, Call2Output } from '@/lib/offer-types';
import { parseCall1Output, parseCall2Output } from '@/lib/offer-parser';

export const maxDuration = 300;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Which sections come from Call1 vs Call2
const CALL1_SECTIONS = new Set([
  'OFFER_SCORE',
  'SCORE_SUMMARY',
  'REVENUE_MODEL_ARCHITECTURE',
  'PAIN_POINT_MAPPING',
  'FUNNEL_STRUCTURE_BLUEPRINT',
  'STRATEGIC_BONUS_RECOMMENDATIONS',
  'DESIGN_INTELLIGENCE_RECOMMENDATION',
  'FUNNEL_HEALTH_SCORE',
  'PLATFORM_PRIORITY_MATRIX',
]);

const CALL2_SECTION_MAP: Record<string, string> = {
  OFFER_POSITIONING_ANALYSIS: 'offer_positioning_analysis',
  TARGET_PERSONA_INTELLIGENCE: 'target_persona_intelligence',
  CONVERSION_HOOK_LIBRARY: 'conversion_hook_library',
  MESSAGING_ANGLE_MATRIX: 'messaging_angle_matrix',
  PRODUCT_CORE_VALUE_PERCEPTION: 'product_core_value_perception',
  REAL_WORLD_USE_CASE_SCENARIOS: 'real_world_use_case_scenarios',
  MONETIZATION_STRATEGY_NARRATIVE: 'monetization_strategy_narrative',
};

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
  }

  try {
    const { funnelId, sectionId, formData, call1, call2 } = await req.json();

    if (!funnelId || !sectionId || !formData) {
      return Response.json({ error: 'Missing required fields: funnelId, sectionId, formData' }, { status: 400 });
    }

    const isCall1Section = CALL1_SECTIONS.has(sectionId);
    const call2OriginalKey = CALL2_SECTION_MAP[sectionId];
    const isCall2Section = !!call2OriginalKey;

    if (!isCall1Section && !isCall2Section) {
      return Response.json({ error: `Unknown section: ${sectionId}` }, { status: 400 });
    }

    const sectionLabel = sectionId
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

    // Build a targeted prompt that asks only for the one section
    let systemPrompt: string;
    let userPrompt: string;

    if (isCall1Section) {
      systemPrompt = CALL1_SYSTEM;
      userPrompt = `${buildCall1UserPrompt(formData as OfferFormData)}

=== REGENERATION DIRECTIVE ===
You are ONLY regenerating the "${sectionId}" section.
Output ONLY a valid JSON object with a single key: "${sectionId}".
Example: { "${sectionId}": "<your rich HTML content here>" }
Do NOT include any other sections. Just the one key.
Make this section even better, more detailed, and more specific to the offer than before.`;
    } else {
      // Call2 section — we need call1 context
      const call1Data = call1 || {};
      systemPrompt = CALL2_SYSTEM;
      userPrompt = `${buildCall2UserPrompt(formData as OfferFormData, call1Data)}

=== REGENERATION DIRECTIVE ===
You are ONLY regenerating the "${sectionId}" section (stored under key "${call2OriginalKey}").
Output ONLY a valid JSON object with a single key: "${call2OriginalKey}".
Example: { "${call2OriginalKey}": "<your rich HTML content here>" }
Do NOT include any other sections. Just the one key.
Make this section even better, more detailed, and more specific to the offer than before.`;
    }

    // Stream the response and extract the section content
    const result = streamText({
      model: anthropic('claude-sonnet-4-6'),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 8192,
      onFinish: async ({ text }) => {
        try {
          // Parse the JSON output
          let parsed: Record<string, string> = {};
          try {
            parsed = JSON.parse(text);
          } catch {
            // Try extracting JSON from text
            const match = text.match(/\{[\s\S]*\}/);
            if (match) parsed = JSON.parse(match[0]);
          }

          if (!parsed || Object.keys(parsed).length === 0) return;

          // Get the current funnel data
          const { data: current } = await supabaseAdmin
            .from('builder_pages')
            .select('blocks')
            .eq('id', funnelId)
            .single();

          if (!current?.blocks) return;

          const currentBlocks = current.blocks;
          const currentIntelligence = currentBlocks.intelligence || {};

          if (isCall1Section) {
            const updatedCall1 = {
              ...(currentIntelligence.call1 || {}),
              [sectionId]: parsed[sectionId] ?? parsed[sectionId.toLowerCase()] ?? '',
            };
            await supabaseAdmin
              .from('builder_pages')
              .update({
                blocks: {
                  ...currentBlocks,
                  intelligence: {
                    ...currentIntelligence,
                    call1: updatedCall1,
                  },
                },
              })
              .eq('id', funnelId);
          } else if (call2OriginalKey) {
            const updatedCall2 = {
              ...(currentIntelligence.call2 || {}),
              [call2OriginalKey]: parsed[call2OriginalKey] ?? '',
            };
            await supabaseAdmin
              .from('builder_pages')
              .update({
                blocks: {
                  ...currentBlocks,
                  intelligence: {
                    ...currentIntelligence,
                    call2: updatedCall2,
                  },
                },
              })
              .eq('id', funnelId);
          }
        } catch (e) {
          console.error('[regenerate-section] onFinish save error:', e);
        }
      },
    });

    // We stream back the raw JSON text; the client will parse out the section value
    return result.toTextStreamResponse();
  } catch (e: any) {
    console.error('[regenerate-section]', e);
    return Response.json({ error: e.message || 'Generation failed' }, { status: 500 });
  }
}
