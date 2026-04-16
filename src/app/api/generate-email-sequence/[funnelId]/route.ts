import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import type { EmailCopy, OfferFormData } from '@/lib/offer-types';

export const maxDuration = 120;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseEmails(rawText: string): EmailCopy[] {
  const emails: EmailCopy[] = [];
  // Match EMAIL N — DAY X blocks
  const emailBlocks = rawText.split(/(?=\nEMAIL\s+\d+)/gi).filter(b => b.trim());

  for (const block of emailBlocks) {
    const dayMatch = block.match(/EMAIL\s+\d+\s*[—\-–]\s*DAY\s+(\d+)/i);
    const subjectMatch = block.match(/SUBJECT:\s*(.+)/i);
    const previewMatch = block.match(/PREVIEW:\s*(.+)/i);
    const bodyMatch = block.match(/BODY:\n([\s\S]*?)(?=---\s*$|EMAIL\s+\d+|$)/i);

    if (dayMatch && subjectMatch && bodyMatch) {
      emails.push({
        day: parseInt(dayMatch[1]),
        subject: subjectMatch[1].trim(),
        preview: previewMatch?.[1]?.trim() || '',
        body: bodyMatch[1].replace(/^---\s*$/, '').trim(),
      });
    }
  }

  return emails;
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  const { funnelId } = await params;

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
  }

  // Load funnel + intelligence context
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
  const copyData = funnel.blocks?.copy;

  if (!formData) {
    return Response.json({ error: 'Funnel has no offer data. Please complete the onboarding form first.' }, { status: 400 });
  }

  // Build contextual prompt
  const contextSummary = [
    `OFFER NAME: ${formData.field_1_name}`,
    `OFFER FORMAT: ${formData.field_1_format}`,
    `OUTCOME: ${formData.field_2_outcome}`,
    `IDEAL BUYER: ${formData.field_3_persona}`,
    `PRICE: ${formData.field_4_price} ${formData.field_4_currency}`,
    `UNIQUE MECHANISM: ${formData.field_6_mechanism}`,
    `TRAFFIC CHANNELS: ${formData.field_7_channels?.join(', ')}`,
    `PRIMARY CHALLENGE: ${formData.field_8_challenge || 'Not specified'}`,
    call1 ? `SCORE SUMMARY: ${call1.SCORE_SUMMARY || ''}` : '',
    call1 ? `PAIN POINTS (KEY): ${(call1.PAIN_POINT_MAPPING || '').substring(0, 500)}` : '',
    copyData?.lead_capture?.sections?.[0]?.content
      ? `HERO HOOK: ${copyData.lead_capture.sections[0].content.substring(0, 200)}`
      : '',
  ].filter(Boolean).join('\n');

  const systemPrompt = `You are OfferIQ Email Sequence Engine. You write high-converting, personalised email nurture sequences for digital offers.

Your emails must:
- Sound human and personal, not corporate or templated
- Reference the specific offer, mechanism, and persona
- Use the buyer's vocabulary (NOT business jargon unless the persona uses it)
- Build a logical progression: Welcome → Story → Proof → Objection → Urgency
- Be 200–350 words per email body
- Never use generic placeholder text like [First Name] — write it as a real email
- The subject lines must be compelling, specific, and under 50 characters`;

  const userPrompt = `Write a 5-email nurture sequence for this offer:

${contextSummary}

Write the sequence in this exact format (no extra text before or after):

EMAIL 1 — DAY 1
SUBJECT: [Subject line]
PREVIEW: [Preview text — one punchy sentence]
BODY:
[Full email body — 200–350 words, conversational, personal voice]
---

EMAIL 2 — DAY 3
SUBJECT: [Subject line]
PREVIEW: [Preview text]
BODY:
[Full email body — go deeper into the real problem. Tell a story or insight.]
---

EMAIL 3 — DAY 5
SUBJECT: [Subject line]
PREVIEW: [Preview text]
BODY:
[Full email body — a case study or proof point. Real or realistic example.]
---

EMAIL 4 — DAY 8
SUBJECT: [Subject line]
PREVIEW: [Preview text]
BODY:
[Full email body — crush the top objection the buyer has]
---

EMAIL 5 — DAY 12
SUBJECT: [Subject line]
PREVIEW: [Preview text]
BODY:
[Full email body — urgency, final push, address any remaining fence-sitters]
---`;

  try {
    const result = streamText({
      model: anthropic('claude-3-5-sonnet-latest'),
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 4000,
      onFinish: async ({ text }) => {
        try {
          const parsedEmails = parseEmails(text);
          if (parsedEmails.length === 0) {
            console.error('[generate-email-sequence] AI returned no parseable emails onFinish.');
            return;
          }

          // Persist to DB
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
                email_sequence: parsedEmails,
                email_sequence_generated_at: new Date().toISOString(),
              },
            })
            .eq('id', funnelId);
        } catch (dbErr) {
          console.error('[generate-email-sequence] DB Update failed onFinish', dbErr);
        }
      }
    });

    return result.toDataStreamResponse();
  } catch (e: any) {
    console.error('[generate-email-sequence]', e);
    return Response.json({ error: e.message || 'Generation failed' }, { status: 500 });
  }
}
