import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import type { OfferFormData } from '@/lib/offer-types';

export const maxDuration = 120;

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    const { funnelId } = await params;

    if (!process.env.ANTHROPIC_API_KEY) {
        return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
    }

    const { data: funnel, error: funnelErr } = await supabaseAdmin
        .from('builder_pages')
        .select('blocks, name')
        .eq('id', funnelId)
        .single();

    if (funnelErr || !funnel) {
        return Response.json({ error: 'Funnel not found' }, { status: 404 });
    }

    const intelligence = funnel.blocks?.intelligence;
    const formData: OfferFormData | undefined = intelligence?.raw_input;
    const call1 = intelligence?.call1;

    if (!formData) {
        return Response.json({ error: 'No offer data found for this funnel.' }, { status: 400 });
    }

    const offerContext = [
        `OFFER NAME: ${formData.field_1_name}`,
        `FORMAT: ${formData.field_1_format}`,
        `OUTCOME: ${formData.field_2_outcome}`,
        `IDEAL BUYER: ${formData.field_3_persona}`,
        `PRICE: ${formData.field_4_price} ${formData.field_4_currency}`,
        `UPSELL: ${formData.field_4_upsell || 'None'}`,
        `PROOF: ${formData.field_5_proof || 'None provided'}`,
        `MECHANISM: ${formData.field_6_mechanism}`,
        `CURRENT CHANNELS: ${formData.field_7_channels?.join(', ') || 'None'}`,
        `CHALLENGE: ${formData.field_8_challenge || 'Not specified'}`,
        call1?.PLATFORM_PRIORITY_MATRIX ? `PLATFORM MATRIX (existing): ${(call1.PLATFORM_PRIORITY_MATRIX || '').substring(0, 600)}` : '',
    ].filter(Boolean).join('\n');

    const systemPrompt = `You are OfferIQ Traffic Intelligence Engine, calibrated on 35,000+ offers across all major traffic channels and niches.

You produce precise, actionable paid traffic strategies — not vague marketing advice. Every recommendation must be specific to THIS offer's price point, persona, and funnel type.

Rules:
- Give specific platform names, budget ranges, and projected metrics
- Percentages must be grounded in reality for the offer format and price
- If the offer has no proof or audience, flag it and adjust conservatively
- Output must be parseable JSON only — no markdown, no prose outside JSON`;

    const userPrompt = `Analyze this offer and return a Traffic Intelligence report as strict JSON.

OFFER DATA:
${offerContext}

Return this exact JSON shape (no extra text, just the JSON object):

{
  "primary_platform": "string",
  "monthly_budget_range": "string (e.g. $3,000–$8,000/mo)",
  "projected_roas": "string (e.g. 2.8–3.5×)",
  "expected_cac": "string (e.g. $45–$65)",
  "break_even_timeline": "string (e.g. Day 12–18)",
  "platforms": [
    {
      "name": "string",
      "tier": "primary | secondary | test",
      "budget_pct": "string (e.g. 60–70%)",
      "budget_range": "string (e.g. $1,800–$4,200/mo)",
      "expected_cac": "string",
      "projected_roas": "string",
      "best_format": "string (e.g. UGC video 60s)",
      "persona_fit": "string",
      "why": "string (2–3 sentences specific to this offer)"
    }
  ],
  "monthly_projections": {
    "leads": "string (e.g. 120–180)",
    "sales": "string (e.g. 10–14)",
    "revenue": "string",
    "roas": "string",
    "break_even": "string"
  },
  "ad_copy_variants": [
    {
      "platform": "string",
      "variant_name": "string",
      "headline": "string",
      "body": "string (50–100 words)",
      "cta": "string",
      "psychological_trigger": "string"
    }
  ],
  "timeline": [
    { "period": "Week 1–2", "result": "string", "note": "string" },
    { "period": "Week 3", "result": "string", "note": "string" },
    { "period": "Week 4", "result": "string", "note": "string" },
    { "period": "Month 2", "result": "string", "note": "string" }
  ],
  "retargeting_strategy": "string (2–3 sentences)",
  "key_warning": "string or null (flag any major risk)"
}`;

    try {
        const { text } = await generateText({
            model: anthropic('claude-3-5-sonnet-20241022'),
            system: systemPrompt,
            prompt: userPrompt,
            maxTokens: 3000,
        });

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return Response.json({ error: 'AI returned no parseable traffic data. Please retry.' }, { status: 500 });
        }

        const trafficData = JSON.parse(jsonMatch[0]);

        // Persist
        const { data: current } = await supabaseAdmin
            .from('builder_pages')
            .select('blocks')
            .eq('id', funnelId)
            .single();

        await supabaseAdmin
            .from('builder_pages')
            .update({
                blocks: {
                    ...(current?.blocks || {}),
                    traffic_intelligence: trafficData,
                    traffic_intelligence_generated_at: new Date().toISOString(),
                },
            })
            .eq('id', funnelId);

        return Response.json({ data: trafficData });
    } catch (e: any) {
        console.error('[generate-traffic-intelligence]', e);
        return Response.json({ error: e.message || 'Generation failed' }, { status: 500 });
    }
}
