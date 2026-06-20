import { anthropic } from '@ai-sdk/anthropic';
import { streamText, jsonSchema } from 'ai';

export const maxDuration = 300; // Increased to 5 minutes to allow for large code generations

export async function POST(req: Request) {
  try {
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
    console.log('raw messages:', JSON.stringify(messages?.slice(-1), null, 2));
    
    // Normalize messages from parts format to content format
    const normalizedMessages = (messages || []).map((msg: any) => {
      if (msg.parts && Array.isArray(msg.parts)) {
        // Extract text content from parts
        const textContent = msg.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('');
        return { role: msg.role, content: textContent };
      }
      return msg; // Already in content format
    });
    
    console.log('normalized messages:', JSON.stringify(normalizedMessages?.slice(-1), null, 2));
    
    if (!['email-sequence', 'copy', 'intelligence', 'blueprint-ideation', 'builder'].includes(ability)) {
      return new Response(
        JSON.stringify({ error: `Unsupported ability: ${ability}` }),
        { status: 400 }
      );
    }

    // Pass normalized messages directly as ModelMessage[].
    // convertToModelMessages is for chat history conversion; streamText expects { role, content } format directly.
    // Filter out any messages with empty content to prevent Anthropic API errors
    const modelMessages = (Array.isArray(normalizedMessages) ? normalizedMessages : [])
      .filter((msg: any) => msg.content && msg.content.trim().length > 0);
    console.log('messages ready for streamText:', JSON.stringify(modelMessages.slice(-1), null, 2));

    let systemPrompt = '';

    if (ability === 'email-sequence') {
      const { activeEmail, activePage, activeEmailIndex, emailSequence, funnelName, funnelId } = abilityContext || {};
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
   - Example Response: "That is outside the scope of my ability. I am currently operating with the Email Sequence Ability, which is focused on editing, analyzing, and optimizing your funnel's email campaign. To build or edit landing pages, please open the [Page Builder](/builder/${funnelId})."
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
      const { copy, activeCopyPage, funnelName, funnelId } = abilityContext || {};
      const activePageContent = activeCopyPage && copy?.pages ? copy.pages[activeCopyPage] : null;

      // Build a summary of ALL pages so the agent knows about the whole funnel
      const allPagesSummary = copy?.pages
        ? Object.entries(copy.pages)
            .map(([key, page]: [string, any]) => {
              const isActive = key === activeCopyPage;
              return `- ${key}${isActive ? ' [ACTIVE]' : ''}: "${page?.title || 'Untitled'}" (Score: ${page?.score || 0}/100, ${page?.word_count || 0} words)`;
            })
            .join('\n')
        : 'No pages available';

      systemPrompt = `You are the OfferIQ Agent, an elite automated assistant integrated into the OfferIQ page and email builder.
You are currently running with the **"copy"** ability in the funnel "${funnelName || 'Your Funnel'}".

CRITICAL SCOPE BOUNDARY RULES:
1. You have access ONLY to copy editing skills. You can edit page copy (headlines, body text, CTAs, testimonials, etc.), rewrite specific sections for better conversions, and provide copy critique and objection-handling suggestions.
2. If the user asks for anything OUTSIDE this scope—such as "build me a landing page", "change the layout", "add new sections", "modify colors or design", "setup a domain", "edit the builder", etc.—YOU MUST IMMEDIATELY DECLINE and explain that it is outside your current ability. 
   - Example Response: "That is outside the scope of my ability. I am currently operating with the Copy Editing Ability, which is focused on optimizing your page copy for conversions. To build pages or modify layouts, please open the [Page Builder](/builder/${funnelId})."
   - Do NOT attempt to simulate page building or layout changes, and do NOT invoke any tools if the request is outside your ability scope.

ALL FUNNEL PAGES:
${allPagesSummary}

ACTIVE PAGE DETAILS:
- Active Page Key: ${activeCopyPage || 'None'}
- Title: ${activePageContent?.title || 'N/A'}
- Conversion Score: ${activePageContent?.score || 0}/100
- Full HTML Content:
${activePageContent?.html || 'No content'}

INSTRUCTIONS FOR SKILL CALLS:
- If the user asks to rewrite, rephrase, or optimize the page copy, CALL the \`edit_page_copy\` tool. You MUST include the \`page\` parameter (the page key, e.g. "lead_capture", "sales_page") and the full updated \`html\`. Always generate clean, production-ready, beautiful HTML maintaining the existing structure and styling.
- If the user asks for copy critique, suggestions, or objection analysis, CALL the \`suggest_copy_improvements\` tool to give them high-value feedback.
- When editing copy, you have access to the FULL HTML above. You must return the COMPLETE updated HTML in the tool call — do not truncate or summarize it.
- ALWAYS explain and summarize exactly what you have changed in your chat text response, so the user knows what updates occurred. Keep conversational text responses extremely brief, clean, and professional. Avoid raw JSON or technical jargon in the message bubble.`;
    } else if (ability === 'intelligence') {
      const { activeSectionId, activeSectionContent, reportData, funnelName, funnelId } = abilityContext || {};

      // Build a summary of ALL report sections so the agent has full context
      const sectionLabels: Record<string, string> = {
        OFFER_SCORE: 'Intelligence Score',
        SCORE_SUMMARY: 'Score Summary',
        REVENUE_MODEL_ARCHITECTURE: 'Revenue Model',
        PAIN_POINT_MAPPING: 'Pain Points',
        FUNNEL_STRUCTURE_BLUEPRINT: 'Funnel Blueprint',
        PRICING_STRATEGY: 'Pricing Strategy',
        UPSELL_DOWNSELL_PATHS: 'Upsell Paths',
        STRATEGIC_BONUS_RECOMMENDATIONS: 'Bonus Stack',
        DESIGN_INTELLIGENCE_RECOMMENDATION: 'Design Intelligence',
        FUNNEL_HEALTH_SCORE: 'Funnel Health',
        PLATFORM_PRIORITY_MATRIX: 'Platform Priority',
        OFFER_POSITIONING_ANALYSIS: 'Offer Positioning',
        TARGET_PERSONA_INTELLIGENCE: 'Target Persona',
        CONVERSION_HOOK_LIBRARY: 'Conversion Hooks',
        MESSAGING_ANGLE_MATRIX: 'Messaging Matrix',
        PRODUCT_CORE_VALUE_PERCEPTION: 'Value Perception',
        REAL_WORLD_USE_CASE_SCENARIOS: 'Use Cases',
        MONETIZATION_STRATEGY_NARRATIVE: 'Monetization Strategy',
      };

      let allSectionsSummary = 'No report data available.';
      if (reportData) {
        const allData: Record<string, string> = { ...(reportData.call1 || {}), ...(reportData.call2 || {}) };
        const entries = Object.entries(allData).filter(([_, val]) => val && val.length > 0);
        if (entries.length > 0) {
          allSectionsSummary = entries.map(([key, val]) => {
            const isActive = key === activeSectionId;
            const label = sectionLabels[key] || key;
            const preview = val.substring(0, 300).replace(/\n/g, ' ');
            return `- ${key} ("${label}")${isActive ? ' [ACTIVE - CURRENTLY VIEWING]' : ''}: ${preview}...`;
          }).join('\n');
        }
      }

      systemPrompt = `You are the OfferIQ Agent, an elite automated assistant integrated into the OfferIQ page and email builder.
You are currently running with the **"Sales Intelligence"** ability in the funnel "${funnelName || 'Your Funnel'}".

CRITICAL SCOPE BOUNDARY RULES:
1. You have access ONLY to sales intelligence editing skills. You can rewrite, expand, or adjust ANY section of the Sales Intelligence Report.
2. You can embed dynamic charts and YouTube videos, or add reference links.
3. If the user asks for anything OUTSIDE this scope (like building a page or writing email sequences), decline immediately and provide a markdown link to the appropriate tool.
   - Example Response: "That is outside the scope of my ability. I am currently operating with the Sales Intelligence Ability. To generate email sequences, please visit the [Email Campaigns](/funnels/${funnelId}/email) page. To edit landing pages, visit the [Page Builder](/builder/${funnelId})."

FULL REPORT SECTIONS OVERVIEW:
The following sections exist in this intelligence report. You have access to ALL of them:
${allSectionsSummary}

ACTIVE SECTION (Currently being viewed and editable):
- Section ID: ${activeSectionId || 'None'}
- Section Name: ${sectionLabels[activeSectionId || ''] || activeSectionId || 'Unknown'}
- Full Content (Markdown/HTML):
${activeSectionContent || 'No content'}

INSTRUCTIONS FOR SKILL CALLS:
- If the user asks to rewrite, restructure, or add elements (like charts/videos) to the active section, CALL the \`edit_intelligence_section\` tool.
- You must output the entire replacement markdown/HTML content for the section, maintaining any high-level data storytelling structures.
- You can answer questions about ANY section in the report using the overview above, but you can only EDIT the active section (the one the user is currently viewing).
- If the user wants to edit a different section, tell them to navigate to that section first using the sidebar.
- IMPORTANT: Write in a highly digestible, simple, and punchy tone. Speak like an encouraging business coach. NO "BIG GRAMMAR" or corporate fluff.
- ALWAYS explain exactly what you changed in your chat response. Keep conversational text brief.`;
    } else if (ability === 'blueprint-ideation') {
      const { funnelName, intelligenceData, topicMode } = abilityContext || {};
      const funnelBlueprint = intelligenceData?.call1?.funnel_structure_blueprint || intelligenceData?.call1?.FUNNEL_STRUCTURE_BLUEPRINT || intelligenceData?.call2?.funnel_structure_blueprint || intelligenceData?.call2?.FUNNEL_STRUCTURE_BLUEPRINT || '';
      const bonusStack = intelligenceData?.call1?.strategic_bonus_recommendations || intelligenceData?.call1?.STRATEGIC_BONUS_RECOMMENDATIONS || intelligenceData?.call2?.strategic_bonus_recommendations || intelligenceData?.call2?.STRATEGIC_BONUS_RECOMMENDATIONS || '';

      systemPrompt = `You are the OfferIQ Blueprint Architect. Your goal is to help the user extract and refine the best blueprint topics from their sales intelligence report for the funnel: "${funnelName || 'Your Funnel'}".

CRITICAL RULES:
1. When topicMode is "lead": Extract the best lead magnet topic using ONLY the "Funnel Blueprint" section. 
   - Start your response exactly like this (adapted for the topic): "Hey, I'll be generating your lead magnet. First let's find the best lead topic... Based on your report, '[TOPIC]' is the best option. If you feel like editing the topic then type in a topic that works for you. If you don't then click the button below."
2. When topicMode is "bonus": Extract bonus topic ideas using ONLY the "Bonus Stack" section.
   - Start your response exactly like this: "Hey, I'll be generating your bonus stack. First let's pick the best bonus topics... Based on your report, here are the best options. If you feel like editing the topic then type in a custom topic that works for you. If you don't then select one and click the button below."
3. Do not invent unrelated topics. The suggestions MUST be grounded in the report content.
4. CUSTOM TOPIC VALIDATION: If the user replies with their own custom topic, you must validate it against the report context (Lead or Bonus depending on mode).
   - If it is outside scope: Decline strictly with: "The current suggested topic is outside the scope of this campaign. Please provide a relevant topic or choose one of the suggested topics from the report." (Then list the valid suggestions again in <topics> tags).
   - If it is within scope: Accept it enthusiastically (e.g., "Great choice! Your custom topic works perfectly.") and output it in the <topics> tag so the user can generate it.
5. Always output your final validated or suggested topics at the very end of your response, wrapped in <topics> tags like this:

<topics>
1. [First topic title]
2. [Second topic title]
</topics>

REPORT CONTEXT:
Funnel Blueprint (For Leads):
${funnelBlueprint || 'No funnel blueprint content available.'}

Bonus Stack (For Bonuses):
${bonusStack || 'No bonus stack content available.'}`;
    } else if (ability === 'builder') {
      const { builderPages, activeBuilderPagePath, funnelName, funnelId } = abilityContext || {};
      const activePageObject = activeBuilderPagePath && builderPages ? builderPages[activeBuilderPagePath] : null;
      const pageCode = activePageObject?.code?.trim() || null;

      systemPrompt = `You are the OfferIQ Builder Agent, an elite automated assistant integrated into the OfferIQ page builder.
You are currently running with the **"builder"** ability in the funnel "${funnelName || 'Your Funnel'}".

CRITICAL SCOPE BOUNDARY RULES:
1. You have access ONLY to React/Tailwind builder code editing skills. You can modify the active page's components, layout, styling, and visual structure.
2. If the user asks for anything OUTSIDE this scope—such as "generate an email sequence", "write my sales report", etc.—YOU MUST IMMEDIATELY DECLINE and provide a link to the right page.
   - Example Response: "That is outside the scope of my ability. I am operating as the Builder Agent. To manage your email sequences, please visit the [Email Campaigns](/funnels/${funnelId}/email) page. To view sales intelligence, visit the [Intelligence Report](/funnels/${funnelId}/report) page."

CONTEXT OF CURRENT BUILDER PAGE:
- Funnel Name: ${funnelName || 'Your Funnel'}
- Active Page Path: ${activeBuilderPagePath || 'None'}
- Current Page Code:
${pageCode ? pageCode : 'No code available for this page yet.'}


INSTRUCTIONS FOR SKILL CALLS:
- If the user asks to change the layout, add sections, modify colors, or edit the React code, CALL the \`edit_builder_page\` tool. You must provide the FULL updated React code for the active page. Ensure you follow Babel Standalone React/Tailwind rules (no backtick template literals in JSX, use standard string concatenation).
- ALWAYS explain exactly what you changed in your chat response briefly.`;
    }

    const model = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8';

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
    } : ability === 'copy' ? {
      edit_page_copy: {
        description: 'Updates and edits the copy of the specified page. You must specify which page you are editing.',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            page: { type: 'string', description: 'The page key being edited (e.g. "lead_capture", "sales_page", "upsell", "downsell", "thankyou"). Must match one of the available page keys.' },
            html: { type: 'string', description: 'The complete, fully-styled inline-CSS responsive HTML page code with updated copy. Must be the FULL page HTML, not a partial snippet.' },
          },
          required: ['page', 'html'],
        }),
        execute: async (data: any) => {
          console.log('=== Tool execute: edit_page_copy ===', data?.page);
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
    } : ability === 'intelligence' ? {
      edit_intelligence_section: {
        description: 'Rewrites or updates the currently active Sales Intelligence section.',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            content: { type: 'string', description: 'The complete rewritten markdown/HTML content for this section, including any <chart> or <iframe> embeds.' },
          },
          required: ['content'],
        }),
        execute: async (data: any) => {
          console.log('=== Tool execute: edit_intelligence_section ===', data);
          return { success: true, action: 'edit_intelligence', data };
        },
      },
    } : ability === 'builder' ? {
      edit_builder_page: {
        description: 'Updates and rewrites the complete React JSX/Tailwind code for the currently active builder page.',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            code: { type: 'string', description: 'The complete, fully-functional React component code replacing the current page.' },
          },
          required: ['code'],
        }),
        execute: async (data: any) => {
          console.log('=== Tool execute: edit_builder_page ===');
          return { success: true, action: 'edit_builder_page', data };
        },
      },
    } : {};

    try {
      const result = streamText({
        model: anthropic(model),
        system: systemPrompt,
        messages: modelMessages,
        ...(Object.keys(toolsConfig).length > 0 && { tools: toolsConfig as any }),
      });

      return result.toUIMessageStreamResponse();
    } catch (streamError: any) {
      console.error('=== streamText ERROR ===', streamError);
      throw streamError;
    }
  } catch (error: any) {
    console.error('=== API ERROR ===', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error', stack: error.stack }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
