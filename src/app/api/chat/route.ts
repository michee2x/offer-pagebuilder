import { anthropic } from '@ai-sdk/anthropic';
import { streamText, jsonSchema, convertToModelMessages } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY in .env.local' }),
      { status: 500 }
    );
  }

  const body = await req.json();
  const { messages, componentContext } = body;

  console.log('=== /api/chat ===');
  console.log('componentContext:', JSON.stringify(componentContext, null, 2));
  console.log('messages count:', messages?.length);
  console.log('last message:', JSON.stringify(messages?.[messages.length - 1], null, 2));

  const converted = await convertToModelMessages(messages);
  console.log('converted messages:', JSON.stringify(converted, null, 2));

  const systemPrompt = `You are an elite UX Copywriter and Design AI integrated into a Next.js page builder.
Your job is to help non-technical users optimize high-converting text content and visually tune specific elements for their landing pages.

IMPORTANT — THE MACRO-COMPONENT ARCHITECTURE:
The user is working with pre-designed, heavily optimized "Macro-Components" (e.g. HeroSection, PricingSection).
You have control over two distinct things:
1. RAW CONTENT: You can update strings, arrays of text, image URLs, and icons by directly setting their prop keys.
2. HYBRID STYLING (elementStyles): You CANNOT change global CSS, but you CAN inject pinpoint inline CSS overrides on specific elements using the special "elementStyles" prop!

HOW TO USE \`elementStyles\`:
The "elementStyles" prop is a dictionary mapping from a string key (like "headline" or "badgeText" or "features.0.title") to a React.CSSProperties object (camelCase keys like backgroundColor, fontSize, borderRadius, padding).
If the user asks to change the visual look of an element, you MUST inject those CSS rules into the \`elementStyles\` dictionary.
Example: To make the badge background red and text white, call the tool with:
{ "props": { "elementStyles": { "badgeText": { "backgroundColor": "red", "color": "white" } } } }

The selected component context:
- Component Type: ${componentContext?.type}
- Component ID: ${componentContext?.id}
- Current writable props: ${JSON.stringify(componentContext?.props ?? {}, null, 2)}
- Allowed schema: ${JSON.stringify(componentContext?.availableFields ?? {}, null, 2)}

${componentContext?.focusedField ? `CRITICAL TARGETING CONTEXT:
The user explicitly clicked on the nested element mapped to the field path: \`${componentContext.focusedField}\`.
When the user says "change this copy" or "make this blue", they are referring ONLY to the \`${componentContext.focusedField}\` property/element!
- If they want a text change, update the string for \`${componentContext.focusedField}\`.
- If they want a visual/style change, inject the CSS into \`elementStyles["${componentContext.focusedField}"]\`.
You must reconstruct the necessary arrays/objects in your tool call to safely update ONLY \`${componentContext.focusedField}\` while preserving all other data in the component's current props.
` : ''}

Instructions:
1. When the user asks to rewrite, optimize, or alter content, YOU MUST ALWAYS CALL THE update_component_props TOOL.
2. If the user asks to style, color, or resize an element, YOU MUST ALWAYS CALL THE update_component_props TOOL and write to the \`elementStyles\` prop dict.
3. Keep conversational responses extremely brief and professional. Let the tool execution do the heavy lifting! Never output raw JSON in your chat message.`;

  const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5';

  const result = streamText({
    model: anthropic(model),
    system: systemPrompt,
    messages: converted,
    onFinish: ({ text, toolCalls, toolResults, finishReason }) => {
      console.log('=== streamText onFinish ===');
      console.log('finishReason:', finishReason);
      console.log('text:', text);
      console.log('toolCalls:', JSON.stringify(toolCalls, null, 2));
      console.log('toolResults:', JSON.stringify(toolResults, null, 2));
    },
    tools: {
      update_component_props: {
        description: 'Updates specific properties of the currently selected component on the page.',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            props: {
              type: 'object',
              description: 'A partial record of only the changed prop keys and their new values.',
              additionalProperties: true,
            },
          },
          required: ['props'],
        }),
        execute: async ({ props }: { props: Record<string, any> }) => {
          console.log('=== Tool execute: update_component_props ===');
          console.log('props to update:', JSON.stringify(props, null, 2));
          return { success: true, updatedProps: props };
        },
      },
    },
  });

  // toUIMessageStreamResponse streams the full UI-compatible stream including tool calls
  // This is required for DefaultChatTransport on the client to receive tool data
  return result.toUIMessageStreamResponse();
}
