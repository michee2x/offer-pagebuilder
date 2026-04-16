import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { CALL2_SYSTEM, buildCall2UserPrompt } from '@/lib/offer-prompts';
import { parseCall2Output } from '@/lib/offer-parser';
import type { OfferFormData, Call1Parsed } from '@/lib/offer-types';

export const maxDuration = 180;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
  }

  let funnelId: string;
  let formData: OfferFormData;
  let call1Raw: Record<string, string>;
  let call1: Call1Parsed;

  try {
    const body = await req.json();
    funnelId = body.funnelId;
    formData = body.formData;
    call1Raw = body.call1;

    // Parse the call1 data
    call1 = {
      offer_score: JSON.parse(call1Raw.offer_score),
      score_summary: call1Raw.score_summary,
      funnel_structure_blueprint: call1Raw.funnel_structure_blueprint,
      revenue_model_architecture: call1Raw.revenue_model_architecture,
      pain_point_mapping: call1Raw.pain_point_mapping,
      platform_priority_matrix: JSON.parse(call1Raw.platform_priority_matrix),
      funnel_health_score: JSON.parse(call1Raw.funnel_health_score),
      pricing_strategy: call1Raw.pricing_strategy,
      upsell_downsell_paths: call1Raw.upsell_downsell_paths,
      strategic_bonus_recommendations: call1Raw.strategic_bonus_recommendations,
      design_intelligence_recommendation: call1Raw.design_intelligence_recommendation,
    };
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!funnelId || !formData || !call1Raw) {
    return Response.json({ error: 'funnelId, formData, and call1 are required' }, { status: 400 });
  }

  const userPrompt = buildCall2UserPrompt(formData, call1);

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system: CALL2_SYSTEM,
    prompt: userPrompt,
    onFinish: async ({ text }) => {
      try {
        const parsed = parseCall2Output(text);
        const { data: current } = await supabaseAdmin
          .from('builder_pages')
          .select('blocks')
          .eq('id', funnelId)
          .single();

        const currentBlocks = current?.blocks || {};
        await supabaseAdmin
          .from('builder_pages')
          .update({
            blocks: {
              ...currentBlocks,
              intelligence: {
                ...currentBlocks.intelligence,
                call2: parsed,
                call2_raw: text,
                call2_complete: true,
              },
            },
          })
          .eq('id', funnelId);
      } catch (e) {
        console.error('[call2] onFinish save error:', e);
      }
    },
  });

  return result.toTextStreamResponse();
}
