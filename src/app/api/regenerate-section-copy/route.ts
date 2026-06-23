import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { COPY_SYSTEM } from '@/lib/offer-prompts';
import { FUNNEL_PAGE_LABELS } from '@/lib/offer-types';

export const maxDuration = 300;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
  }

  try {
    const { funnelId, pageKey, currentCopy } = await req.json();

    if (!funnelId || !pageKey || !currentCopy) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('builder_pages')
      .select('blocks')
      .eq('id', funnelId)
      .single();

    if (error || !data?.blocks?.intelligence) {
      return Response.json(
        { error: 'Intelligence not found. Run Call 1 and Call 2 first.' },
        { status: 400 }
      );
    }

    const call1Raw = data.blocks.intelligence.call1 || {};
    const call2 = data.blocks.intelligence.call2 || {};

    const pageLabel = FUNNEL_PAGE_LABELS[pageKey as keyof typeof FUNNEL_PAGE_LABELS] || pageKey;

    const userPrompt = `You need to regenerate the copy for the ${pageLabel} section of the funnel.
Here is the current copy that needs to be improved or rewritten:

${currentCopy.html || currentCopy.markdown || "No existing copy."}

Based on the intelligence provided, rewrite this section to be more compelling and conversion-focused.
Return ONLY valid HTML code for this section. No markdown, no explanations.

Intelligence Context:
PAIN POINTS: ${JSON.stringify(call1Raw.PAIN_POINT_MAPPING || {})}
FUNNEL BLUEPRINT: ${JSON.stringify(call1Raw.FUNNEL_STRUCTURE_BLUEPRINT || {})}
CONVERSION HOOKS: ${JSON.stringify(call1Raw.CONVERSION_HOOK_LIBRARY || {})}
STRATEGIC NARRATIVE: ${JSON.stringify(call2 || {})}`;

    const result = streamText({
      model: anthropic('claude-sonnet-4-6'),
      system: COPY_SYSTEM,
      prompt: userPrompt,
      maxOutputTokens: 8192,
    });

    return result.toTextStreamResponse();
  } catch (e: any) {
    console.error('[regenerate-section-copy]', e);
    return Response.json(
      { error: e.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
