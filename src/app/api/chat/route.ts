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

  const systemPrompt = `You are an AI assistant integrated into a website page builder.
Your job is to help non-technical users modify the currently selected web component.

IMPORTANT — HOW STYLING WORKS:
Every component has a "style" prop which is a JSON object of CSS properties (camelCase keys).
You can set ANY CSS property this way — color, backgroundColor, fontSize, fontWeight, padding,
margin, border, borderRadius, opacity, letterSpacing, lineHeight, textAlign, textTransform, etc.
Example: to make text green and bold, call the tool with:
  { "props": { "style": { "color": "green", "fontWeight": "bold" } } }
When updating style, always MERGE with the existing style — include all existing style keys plus your new ones.

The selected component:
- Type: ${componentContext?.type}
- ID: ${componentContext?.id}
- Current props: ${JSON.stringify(componentContext?.props ?? {}, null, 2)}
- Structural fields (non-style props): ${JSON.stringify(componentContext?.availableFields ?? {}, null, 2)}

Instructions:
1. When the user asks to change anything — text, color, size, spacing, font, layout — call the update_component_props tool.
2. For visual changes (color, size, etc.) use the "style" prop with camelCase CSS keys.
3. For content changes (text, heading level, etc.) use the direct prop keys.
4. Only include CHANGED keys. For style changes, merge with the current style object.
5. Keep your text response short and friendly.
6. Do NOT output raw JSON in your response text — always use the tool.`;

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
