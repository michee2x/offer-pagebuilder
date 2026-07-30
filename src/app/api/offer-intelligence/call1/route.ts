import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { CALL1_SYSTEM, buildCall1UserPrompt } from '@/lib/offer-prompts';
import { parseCall1Output } from '@/lib/offer-parser';
import type { OfferFormData } from '@/lib/offer-types';
import { getUser } from '@/auth';
import { getCreativityParams } from '@/lib/creativity';

export const maxDuration = 120;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  console.log('[call1] Starting request processing...');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[call1] Missing ANTHROPIC_API_KEY');
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
  }

  let formData: OfferFormData;
  let existingFunnelId: string | undefined;
  let workspaceId: string | undefined;
  let isTemplate = false;
  let templateCategory: string | null = null;
  let templateTags: string[] = [];
  let creativityLevel: string | undefined;

  const user = await getUser();
  if (!user || !user.id) {
    console.error('[call1] Unauthorized - no user found');
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[call1] User authenticated:', user.id);

  try {
    const body = await req.json();
    formData = body.formData;
    existingFunnelId = body.funnelId;
    workspaceId = body.workspaceId;
    isTemplate = body.isTemplate || false;
    templateCategory = body.templateCategory || null;
    templateTags = body.templateTags ? body.templateTags.split(',').map((t: string) => t.trim()) : [];
    creativityLevel = body.creativityLevel || 'Standard';

    console.log('[call1] Request body parsed:', {
      hasFormData: !!formData,
      existingFunnelId,
      workspaceId,
      offerName: formData?.field_1_name
    });
  } catch (error) {
    console.error('[call1] Invalid request body:', error);
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Create or reuse the builder_pages record
  let funnelId = existingFunnelId;

  // Check and consume credit if creating a new funnel
  if (!funnelId) {
    let creditTargetUserId = user.id;

    if (workspaceId) {
      const { data: workspaceData } = await supabaseAdmin
        .from('workspaces')
        .select('user_id, owner_id')
        .eq('id', workspaceId)
        .maybeSingle();
      
      if (workspaceData) {
        creditTargetUserId = workspaceData.user_id || workspaceData.owner_id || user.id;
      }
      
      if (creditTargetUserId !== user.id) {
        // This means the user is a sub-account or team member. Check their permissions.
        const { data: memberData } = await supabaseAdmin
          .from('workspace_members')
          .select('permissions')
          .eq('workspace_id', workspaceId)
          .eq('user_id', user.id)
          .maybeSingle();

        // If memberData is found and permissions object exists, check if create is false
        if (memberData?.permissions && memberData.permissions.create === false) {
          console.error('[call1] User lacks create permission in workspace');
          return Response.json({ error: 'You do not have permission to create projects in this workspace' }, { status: 403 });
        }
      }
    }

    const { data: dbUser, error: userErr } = await supabaseAdmin
      .from('users')
      .select('credits_remaining, is_admin')
      .eq('id', creditTargetUserId)
      .single();

    if (userErr || !dbUser) {
      console.error('[call1] Failed to fetch user credits:', userErr);
      return Response.json({ error: 'Failed to verify credits' }, { status: 500 });
    }

    if (!dbUser.is_admin && dbUser.credits_remaining <= 0) {
      console.error('[call1] User out of credits');
      return Response.json({ error: 'Out of credits' }, { status: 403 });
    }

    // Deduct credit
    if (!dbUser.is_admin) {
      const { error: deductErr } = await supabaseAdmin
        .from('users')
        .update({ credits_remaining: dbUser.credits_remaining - 1 })
        .eq('id', creditTargetUserId);

      if (deductErr) {
        console.error('[call1] Failed to deduct credit:', deductErr);
      }
    }

    console.log('[call1] Creating new funnel record');

    const funnelData: any = {
      name: formData.field_1_name || 'Untitled Funnel',
      user_id: user.id,
      is_template: isTemplate,
      template_category: templateCategory,
      template_tags: templateTags,
      blocks: {
        campaign_settings: {
          creativity_level: creativityLevel,
        },
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
      console.error('[call1] Failed to create funnel record:', error);
      return Response.json({ error: 'Failed to create funnel record' }, { status: 500 });
    }

    funnelId = data.id;
    console.log('[call1] Created funnel record:', funnelId);
  } else {
    console.log('[call1] Using existing funnel:', funnelId);
  }

  console.log('[call1] Building AI prompt');
  const userPrompt = buildCall1UserPrompt(formData);

  // call1 must generate 9 full sections of rich HTML — needs large token budget
  const { maxOutputTokens } = getCreativityParams(creativityLevel, 12000);

  console.log('[call1] Starting AI stream with Claude');
  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: CALL1_SYSTEM,
    prompt: userPrompt,
    temperature: 0.5, // Force low temperature for strict JSON generation
    maxOutputTokens,
    onFinish: async ({ text }) => {
      console.log('[call1] AI stream finished, parsing output');

      try {
        const parsed = parseCall1Output(text);
        console.log('[call1] Parsed output successfully');

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

        console.log('[call1] Successfully saved parsed data to database');
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

  console.log('[call1] Returning response with funnelId:', funnelId);
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
