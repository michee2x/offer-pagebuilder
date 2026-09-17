import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createAdminClient } from '@/utils/supabase/admin';
import { getUser } from '@/auth';

export const maxDuration = 30;

function loadKnowledgeBase(): string {
  try {
    const knowledgePath = join(process.cwd(), 'src', 'lib', 'support-knowledge.md');
    return readFileSync(knowledgePath, 'utf-8');
  } catch {
    console.warn('[support-chat] Could not load support-knowledge.md, using default knowledge base');
    return 'You are an OfferIQ support assistant. Be helpful and friendly.';
  }
}

const knowledgeBase = loadKnowledgeBase();

// In-memory rate limiter for unauthenticated requests
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((entry, ip) => {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(ip);
    }
  });
}, 5 * 60_000);

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many messages. Please wait a moment before sending another.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { messages?: any[] };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const rawMessages: any[] = body.messages ?? [];

  const messages = rawMessages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => {
      const role: 'user' | 'assistant' = m.role === 'assistant' ? 'assistant' : 'user';
      if (m.parts && Array.isArray(m.parts)) {
        const text = m.parts
          .filter((p: any) => p?.type === 'text')
          .map((p: any) => String(p.text ?? ''))
          .join('');
        return { role, content: text };
      }
      const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content ?? '');
      return { role, content };
    });

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

  // Get current authenticated user if available
  let currentUser: { id: string; email?: string } | null = null;
  try {
    currentUser = await getUser();
  } catch {
    // optional / unauthenticated
  }

  const systemPrompt = `${knowledgeBase}

---

IMPORTANT HUMAN CONVERSATIONAL GUIDELINES:
- You are Maya from OfferIQ Support, chatting in real-time with a user inside the OfferIQ web app.
- Talk like a warm, supportive, and caring human customer success team member.
- NEVER sound like a robotic search engine, rigid AI, or automated phone tree.
- Use natural human conversational openings: "Hi there!", "Great question!", "I completely understand,", "Happy to walk you through this!"
- Be encouraging about their business and funnel goals.
- If a user expresses confusion, frustration, or asks something outside your knowledge base:
  1. Show genuine empathy first: "I completely understand why you'd need help with that!"
  2. Explain that you're looping in our human support team for personalized assistance.
  3. Give them our direct support email: **support@ofiq.app** and encourage them to email us so a team member can jump in to help directly.
- Always end with a warm, caring sign-off asking if they have any follow-up questions.
- Today's date context: You are deployed in 2026.`;

  try {
    const result = streamText({
      model: anthropic('claude-haiku-4-5'),
      system: systemPrompt,
      messages,
      onFinish: async ({ text }) => {
        // Log conversation to database for admin reporting
        try {
          const supabase = createAdminClient();
          const isEscalated =
            text.toLowerCase().includes('support@ofiq.app') ||
            text.toLowerCase().includes('human support') ||
            text.toLowerCase().includes("don't have the exact answer") ||
            text.toLowerCase().includes('reach out directly');

          await supabase.from('support_chat_logs').insert({
            user_id: currentUser?.id || null,
            user_email: currentUser?.email || null,
            user_message: lastUserMessage,
            bot_response: text,
            escalated: isEscalated,
          });
        } catch (dbErr) {
          console.error('[support-chat] Failed to log chat to DB:', dbErr);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err: any) {
    console.error('[support-chat] streamText error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'An error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
