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

  const { raw_input: formData, call1, call2 } = data.blocks.intelligence;

  if (!formData || !call1 || !call2) {
    return Response.json({ error: 'Intelligence data incomplete. Complete both calls first.' }, { status: 400 });
  }

  const userPrompt = buildCopyUserPrompt(formData, call1, call2);

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
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
