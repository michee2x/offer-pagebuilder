import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { COPY_SYSTEM, buildCopyUserPrompt } from '@/lib/offer-prompts';
import { parseCopyOutput } from '@/lib/offer-parser';

export const maxDuration = 300;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
  }

  let funnelId: string;

  try {
    const body = await req.json();
    funnelId = body.funnelId;
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!funnelId) {
    return Response.json({ error: 'funnelId is required' }, { status: 400 });
  }

  // Load the full intelligence from DB
  const { data, error } = await supabaseAdmin
    .from('builder_pages')
    .select('blocks')
    .eq('id', funnelId)
    .single();

  if (error || !data?.blocks?.intelligence) {
    return Response.json({ error: 'Intelligence not found. Run Call 1 and Call 2 first.' }, { status: 400 });
  }

  const formData = data.blocks.intelligence.raw_input || {};
  const call1Raw = data.blocks.intelligence.call1 || {};
  const call2 = data.blocks.intelligence.call2 || {};

  // Safely parse call1 into Call1Parsed format with fallback for both stringified JSON and direct structures
  const parseJsonSafe = (val: any, fallback: any) => {
    if (!val) return fallback;
    if (typeof val === 'object') return val;
    try { return JSON.parse(val); } catch { return fallback; }
  };

  const call1 = {
    offer_score: parseJsonSafe(call1Raw.OFFER_SCORE || call1Raw.offer_score, { overall: 0 }),
    score_summary: call1Raw.SCORE_SUMMARY || call1Raw.score_summary || '',
    funnel_structure_blueprint: call1Raw.FUNNEL_STRUCTURE_BLUEPRINT || call1Raw.funnel_structure_blueprint || '',
    revenue_model_architecture: call1Raw.REVENUE_MODEL_ARCHITECTURE || call1Raw.revenue_model_architecture || '',
    pain_point_mapping: call1Raw.PAIN_POINT_MAPPING || call1Raw.pain_point_mapping || '',
    platform_priority_matrix: parseJsonSafe(call1Raw.PLATFORM_PRIORITY_MATRIX || call1Raw.platform_priority_matrix, { primary: {} }),
    pricing_strategy: call1Raw.PRICING_STRATEGY || call1Raw.pricing_strategy || '',
    upsell_downsell_paths: call1Raw.UPSELL_DOWNSELL_PATHS || call1Raw.upsell_downsell_paths || '',
    strategic_bonus_recommendations: call1Raw.STRATEGIC_BONUS_RECOMMENDATIONS || call1Raw.strategic_bonus_recommendations || '',
    design_intelligence_recommendation: call1Raw.DESIGN_INTELLIGENCE_RECOMMENDATION || call1Raw.design_intelligence_recommendation || '',
  } as any;

  const userPrompt = buildCopyUserPrompt(formData, call1, call2);

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: COPY_SYSTEM,
    prompt: userPrompt,
    onFinish: async ({ text }) => {
      try {
        const parsed = parseCopyOutput(text);
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
              copy: parsed,
              copy_complete: true,
            },
          })
          .eq('id', funnelId);
      } catch (e) {
        console.error('[offer-copy] onFinish save error:', e);
      }
    },
  });

  return result.toTextStreamResponse();
}
