import { anthropic } from '@ai-sdk/anthropic';
import { streamText, jsonSchema, convertToModelMessages } from 'ai';

export const maxDuration = 45;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY in .env.local' }),
      { status: 500 }
    );
  }

  const body = await req.json();
  const { messages, ability, abilityContext } = body;

  console.log('=== /api/agent-chat ===');
  console.log('ability:', ability);
  console.log('messages count:', messages?.length);
  
  if (!['email-sequence', 'copy'].includes(ability)) {
    return new Response(
      JSON.stringify({ error: `Unsupported ability: ${ability}` }),
      { status: 400 }
    );
  }

  const converted = await convertToModelMessages(messages);

  let systemPrompt = '';

  if (ability === 'email-sequence') {
    const { activeEmail, activePage, activeEmailIndex, emailSequence, funnelName } = abilityContext || {};
    const currentSequenceSummary = emailSequence
      ? Object.keys(emailSequence)
          .map((pageKey) => {
            const emails = emailSequence[pageKey] || [];
            return `- ${pageKey} (${emails.length} emails): ${emails.map((e: any, idx: number) => `Email ${idx + 1} (Day ${e.day})`).join(', ')}`;
          })
          .join('\n')
      : 'No active email sequence';

    systemPrompt = `You are the OfferIQ Agent, an elite automated assistant integrated into the OfferIQ page and email builder.
You are currently running with the **"email-sequence"** ability in the funnel "${funnelName || 'Your Funnel'}".

CRITICAL SCOPE BOUNDARY RULES:
1. You have access ONLY to email sequence skills. You can edit email contents (subject, preview text, body paragraphs, and HTML), add new emails to the sequence, delete emails, and provide email copywriting insights.
2. If the user asks for anything OUTSIDE this scope—such as "build me a new landing page", "create a thank you page", "change the colors of the sales page", "edit the pricing block in the builder", "setup a domain", etc.—YOU MUST IMMEDIATELY DECLINE and explain that it is outside your current ability. 
   - Example Response: "That is outside the scope of my ability. I am currently operating with the Email Sequence Ability, which is focused on editing, analyzing, and optimizing your funnel's email campaign. To build or edit landing pages, please open the Page Builder."
   - Do NOT attempt to simulate page building or styling changes, and do NOT invoke any tools if the request is outside your ability scope.

CONTEXT OF CURRENT EMAIL SEQUENCE:
- Funnel Name: ${funnelName || 'Your Funnel'}
- Active Page Section: ${activePage || 'None'}
- Active Email Index: ${activeEmailIndex !== undefined ? activeEmailIndex : 'None'} (this is the email the user is currently viewing)
- Active Email Copy:
  * Subject: "${activeEmail?.subject || ''}"
  * Preview: "${activeEmail?.preview || ''}"
  * Day: Day ${activeEmail?.day || 0}
  * Body PlainText:
${activeEmail?.body || ''}
- Full Email Sequence Summary:
${currentSequenceSummary}

INSTRUCTIONS FOR SKILL CALLS:
- If the user asks to rewrite, rephrase, or optimize the active email, CALL the \`edit_email_content\` tool. Always generate clean, production-ready, beautiful HTML layout (wrapped in responsive table structures matching standard high-converting newsletter templates, similar to what's already in the email).
- If the user asks to add a follow-up or a new email, CALL the \`add_new_email\` tool. You must write the entire email including subject, preview, body, HTML copy, and specify the day.
- If the user asks to delete the current email, CALL the \`delete_active_email\` tool.
- If the user asks for copy advice, critique, or spam word audits, CALL the \`suggest_email_improvements\` tool to give them high-value feedback.
- ALWAYS explain and summarize exactly what you have changed in your chat text response, so the user knows what updates occurred. Keep conversational text responses extremely brief, clean, and professional. Avoid raw JSON or technical jargon in the message bubble.`;
  } else if (ability === 'copy') {
    const { copy, activeCopyPage, funnelName } = abilityContext || {};
    const activePageContent = activeCopyPage && copy?.pages ? copy.pages[activeCopyPage] : null;

    systemPrompt = `You are the OfferIQ Agent, an elite automated assistant integrated into the OfferIQ page and email builder.
You are currently running with the **"copy"** ability in the funnel "${funnelName || 'Your Funnel'}".

CRITICAL SCOPE BOUNDARY RULES:
1. You have access ONLY to copy editing skills. You can edit page copy (headlines, body text, CTAs, testimonials, etc.), rewrite specific sections for better conversions, and provide copy critique and objection-handling suggestions.
2. If the user asks for anything OUTSIDE this scope—such as "build me a landing page", "change the layout", "add new sections", "modify colors or design", "setup a domain", "edit the builder", etc.—YOU MUST IMMEDIATELY DECLINE and explain that it is outside your current ability. 
   - Example Response: "That is outside the scope of my ability. I am currently operating with the Copy Editing Ability, which is focused on optimizing your page copy for conversions. To build pages or modify layouts, please open the Page Builder."
   - Do NOT attempt to simulate page building or layout changes, and do NOT invoke any tools if the request is outside your ability scope.

CONTEXT OF CURRENT PAGE:
- Funnel Name: ${funnelName || 'Your Funnel'}
- Active Page: ${activeCopyPage || 'None'}
- Current Page Content:
  * Title/Score: ${activePageContent?.title || 'N/A'}
  * Conversion Score: ${activePageContent?.score || 0}/100
  * HTML Content (first 500 chars):
${activePageContent?.html?.substring(0, 500) || 'No content'}...

INSTRUCTIONS FOR SKILL CALLS:
- If the user asks to rewrite, rephrase, or optimize the page copy, CALL the \`edit_page_copy\` tool. Always generate clean, production-ready, beautiful HTML maintaining the existing structure and styling.
- If the user asks for copy critique, suggestions, or objection analysis, CALL the \`suggest_copy_improvements\` tool to give them high-value feedback.
- ALWAYS explain and summarize exactly what you have changed in your chat text response, so the user knows what updates occurred. Keep conversational text responses extremely brief, clean, and professional. Avoid raw JSON or technical jargon in the message bubble.`;
  }

  const model = process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022';

  // Define tools based on ability
  const toolsConfig = ability === 'email-sequence' ? {
    edit_email_content: {
      description: 'Updates and edits the copy of the currently active email in the sequence.',
      inputSchema: jsonSchema({
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'The new compelling subject line for the email.' },
          preview: { type: 'string', description: 'The new preheader preview text.' },
          body: { type: 'string', description: 'The plain text body content.' },
          html: { type: 'string', description: 'The complete, fully-styled inline-CSS responsive HTML email code.' },
        },
      }),
      execute: async (data: any) => {
        console.log('=== Tool execute: edit_email_content ===', data);
        return { success: true, action: 'edit_email', data };
      },
    },
    add_new_email: {
      description: 'Appends a new email copy into the sequence for the current active page.',
      inputSchema: jsonSchema({
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'The subject line for the new email.' },
          preview: { type: 'string', description: 'The preview text for the new email.' },
          body: { type: 'string', description: 'The plain text body paragraphs.' },
          html: { type: 'string', description: 'The complete inline-CSS responsive HTML template code.' },
          day: { type: 'number', description: 'The sequence day number (e.g. Day 4 or Day 7).' },
        },
        required: ['subject', 'preview', 'body', 'html', 'day'],
      }),
      execute: async (data: any) => {
        console.log('=== Tool execute: add_new_email ===', data);
        return { success: true, action: 'add_email', data };
      },
    },
    delete_active_email: {
      description: 'Deletes the currently active email from the page sequence.',
      inputSchema: jsonSchema({
        type: 'object',
        properties: {},
      }),
      execute: async () => {
        console.log('=== Tool execute: delete_active_email ===');
        return { success: true, action: 'delete_email' };
      },
    },
    suggest_email_improvements: {
      description: 'Analyzes copy and outputs a detailed critique with actionable suggestions.',
      inputSchema: jsonSchema({
        type: 'object',
        properties: {
          analysis: { type: 'string', description: 'A brief text critique summarizing readability, spam words, and tone.' },
          toneScore: { type: 'number', description: 'Estimated persuasion/friendliness score from 1-100.' },
          suggestions: {
            type: 'array',
            items: { type: 'string' },
            description: 'A list of 3-4 bullet-point suggestions to improve click rates.',
          },
        },
        required: ['analysis', 'toneScore', 'suggestions'],
      }),
      execute: async (data: any) => {
        console.log('=== Tool execute: suggest_email_improvements ===', data);
        return { success: true, action: 'suggest_email', data };
      },
    },
  } : {
    edit_page_copy: {
      description: 'Updates and edits the copy of the currently active page.',
      inputSchema: jsonSchema({
        type: 'object',
        properties: {
          html: { type: 'string', description: 'The complete, fully-styled inline-CSS responsive HTML page code with updated copy.' },
        },
        required: ['html'],
      }),
      execute: async (data: any) => {
        console.log('=== Tool execute: edit_page_copy ===', data);
        return { success: true, action: 'edit_page_copy', data };
      },
    },
    suggest_copy_improvements: {
      description: 'Analyzes page copy and outputs a detailed critique with actionable suggestions.',
      inputSchema: jsonSchema({
        type: 'object',
        properties: {
          analysis: { type: 'string', description: 'A brief text critique summarizing headline strength, value proposition clarity, objection handling, and CTA effectiveness.' },
          conversionScore: { type: 'number', description: 'Estimated conversion potential score from 1-100.' },
          suggestions: {
            type: 'array',
            items: { type: 'string' },
            description: 'A list of 3-5 bullet-point suggestions to improve conversion rate.',
          },
        },
        required: ['analysis', 'conversionScore', 'suggestions'],
      }),
      execute: async (data: any) => {
        console.log('=== Tool execute: suggest_copy_improvements ===', data);
        return { success: true, action: 'suggest_copy', data };
      },
    },
  };

  const result = streamText({
    model: anthropic(model),
    system: systemPrompt,
    messages: converted,
    tools: toolsConfig as any,
  });

  return result.toUIMessageStreamResponse();
}
