import { getSession } from "@/auth";
import { anthropic } from '@ai-sdk/anthropic';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { anthropic_key } = await req.json();

    if (!anthropic_key) {
      return Response.json({ error: "Please provide an API key to test." }, { status: 400 });
    }

    const customAnthropic = createAnthropic({ apiKey: anthropic_key });

    // Try a very simple, fast generation to test the key
    const { text } = await generateText({
      model: customAnthropic('claude-3-haiku-20240307'),
      prompt: "Say the word 'success'.",
    });

    if (text) {
      return Response.json({ success: true, message: "API Key is valid and working!" });
    }

    return Response.json({ error: "No response from Anthropic." }, { status: 500 });
  } catch (err: any) {
    console.error('Test API Key error:', err);
    return Response.json({ error: err.message || "Failed to validate API key. It may be invalid or restricted." }, { status: 500 });
  }
}
