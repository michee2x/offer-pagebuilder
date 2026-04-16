import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { CALL1_SYSTEM, buildCall1UserPrompt } from '@/lib/offer-prompts';
import { parseCall1Output } from '@/lib/offer-parser';
import type { OfferFormData } from '@/lib/offer-types';
import { getSession } from '@/auth';

export const maxDuration = 120;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
  }

  let formData: OfferFormData;
  let existingFunnelId: string | undefined;
  let workspaceId: string | undefined;

  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    formData = body.formData;
    existingFunnelId = body.funnelId;
    workspaceId = body.workspaceId;
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Create or reuse the builder_pages record
  let funnelId = existingFunnelId;

  if (!funnelId) {
    const funnelData: any = {
      name: formData.field_1_name || 'Untitled Funnel',
      user_id: session.user.id,
      blocks: {
        intelligence: {
          raw_input: formData,
          call1_complete: false,
          call2_complete: false,
        },
        pages: {
          '/': { name: 'Lead Capture', path: '/', components: {}, rootList: [] },
        },
      },
    };

    if (workspaceId) {
      funnelData.workspace_id = workspaceId;
    }

    const { data, error } = await supabaseAdmin
      .from('builder_pages')
      .insert(funnelData)
      .select('id')
      .single();

    if (error || !data) {
      return Response.json({ error: 'Failed to create funnel record' }, { status: 500 });
    }
    funnelId = data.id;
  }

  const userPrompt = buildCall1UserPrompt(formData);

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: CALL1_SYSTEM,
    prompt: userPrompt,
    onFinish: async ({ text }) => {
      try {
        const parsed = parseCall1Output(text);
        // Fetch current blocks to merge
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
                call1: parsed,
                call1_raw: text,
                call1_complete: true,
              },
            },
          })
          .eq('id', funnelId);
      } catch (e) {
        console.error('[call1] onFinish save error:', e);
      }
    },
  });

  const response = result.toTextStreamResponse();

  // Attach funnelId as a response header for the client to read
  const headers = new Headers(response.headers);
  headers.set('X-Funnel-Id', funnelId || '');
  headers.set('Access-Control-Expose-Headers', 'X-Funnel-Id');

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
