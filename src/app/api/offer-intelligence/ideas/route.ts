import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { getUser } from '@/auth';
import { IDEA_GENERATION_SYSTEM, buildIdeaGenerationPrompt } from '@/lib/offer-prompts';

export const maxDuration = 120;

export async function POST(req: Request) {
  console.log('[ideas] Starting idea generation request');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[ideas] Missing ANTHROPIC_API_KEY');
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
  }

  const user = await getUser();
  if (!user || !user.id) {
    console.error('[ideas] Unauthorized - no user found');
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[ideas] User authenticated:', user.id);

  let body: {
    skills?: string[];
    customSkill?: string;
    audienceTypes?: string[];
    bCountry?: string;
    bCurrency?: string;
    budget?: string;
  };

  try {
    body = await req.json();
    console.log('[ideas] Request body parsed:', {
      skillsCount: body.skills?.length || 0,
      hasCustomSkill: !!body.customSkill,
      audienceCount: body.audienceTypes?.length || 0,
      country: body.bCountry,
      currency: body.bCurrency,
      budget: body.budget
    });
  } catch (error) {
    console.error('[ideas] Invalid request body:', error);
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  console.log('[ideas] Building AI prompt');
  const prompt = buildIdeaGenerationPrompt({
    skills: body.skills ?? [],
    customSkill: body.customSkill ?? '',
    audienceTypes: body.audienceTypes ?? [],
    country: body.bCountry ?? '',
    currency: body.bCurrency ?? '',
    budget: body.budget ?? '',
  });

  console.log('[ideas] Starting AI stream with Claude');
  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: IDEA_GENERATION_SYSTEM,
    prompt,
  });

  const response = result.toTextStreamResponse();
  const text = await response.text();

  console.log('[ideas] AI response received, length:', text.length);

  try {
    const raw = text.trim();
    const jsonString = raw.startsWith('[') ? raw : extractJsonArray(raw);
    console.log('[ideas] Extracted JSON string, parsing...');

    const ideas = JSON.parse(jsonString);

    if (!Array.isArray(ideas) || ideas.length === 0) {
      console.error('[ideas] Generated idea list is empty or not an array');
      throw new Error('Generated idea list is empty');
    }

    const normalized = ideas.map((idea: any) => ({
      title: String(idea.title || idea.name || '').trim(),
      description: String(idea.description || idea.desc || '').trim(),
      demand: String(idea.demand || idea.demand_level || '').trim(),
      competition: String(idea.competition || idea.competition_level || '').trim(),
      fit: String(idea.fit || idea.match || '').trim(),
    }));

    console.log('[ideas] Successfully generated', normalized.length, 'ideas');
    return Response.json({ ideas: normalized });
  } catch (error) {
    console.error('[ideas] Idea generation parse error:', error, 'raw:', text);
    return Response.json({ error: 'Failed to parse idea generation output' }, { status: 500 });
  }
}

function extractJsonArray(raw: string): string {
  const match = raw.match(/\[.*\]/s);
  if (!match) {
    throw new Error('Unable to parse JSON array from AI output');
  }
  return match[0];
}
