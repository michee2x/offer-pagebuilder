import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import type { OfferFormData } from '@/lib/offer-types';
import { parseCall3Output } from '@/lib/offer-parser';
import { getCreativityParams } from '@/lib/creativity';

export const maxDuration = 180;

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map from section IDs to prompt-level section names
const SECTION_LABELS: Record<string, string> = {
    platform_priority_narrative: 'PLATFORM_PRIORITY_NARRATIVE',
    omnichannel_ad_copy_matrix: 'OMNICHANNEL_AD_COPY_MATRIX',
    google_ads_copy_matrix: 'GOOGLE_ADS_COPY_MATRIX',
    vsl_video_script: 'VSL_VIDEO_SCRIPT',
    ugc_video_script: 'UGC_VIDEO_SCRIPT',
};

export async function POST(
    req: Request,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    const { funnelId } = await params;

    if (!process.env.ANTHROPIC_API_KEY) {
        return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
    }

    // Parse optional body for single-section regeneration
    let sectionId: string | undefined;
    try {
        const body = await req.json().catch(() => ({}));
        sectionId = body?.sectionId;
    } catch {
        sectionId = undefined;
    }

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
    const call2 = intelligence?.call2;
    const creativityLevel = funnel.blocks?.campaign_settings?.creativity_level || 'Standard';

    if (!formData) {
        return Response.json({ error: 'No offer data found for this funnel. Please complete structural intelligence first.' }, { status: 400 });
    }

    // Safe JSON parser helper
    const parseJsonSafe = (val: any, fallback: any) => {
        if (!val) return fallback;
        if (typeof val === 'object') return val;
        try {
            if (typeof val === 'string') {
                return JSON.parse(val);
            }
            return val;
        } catch {
            return fallback;
        }
    };

    // Case-insensitive property getter
    const getVal = (obj: any, key: string): string => {
        if (!obj) return '';
        const upper = key.toUpperCase();
        const lower = key.toLowerCase();
        return obj[upper] || obj[lower] || '';
    };

    // Extract foundational context from Call 1 & Call 2
    const platformPriorityRaw = getVal(call1, 'PLATFORM_PRIORITY_MATRIX');
    const platformPriorityMatrix = parseJsonSafe(platformPriorityRaw, null);
    const platformPrimary = platformPriorityMatrix?.primary?.platform || 'Meta Ads';
    const platformSecondary = platformPriorityMatrix?.secondary?.platform || 'Google Ads';

    const blueprintText = getVal(call1, 'FUNNEL_STRUCTURE_BLUEPRINT');
    const funnelTypeMatch = blueprintText.match(/RECOMMENDED FUNNEL TYPE:\s*([^\n]+)/i);
    const recommendedFunnelType = funnelTypeMatch ? funnelTypeMatch[1].trim() : 'Lead Gen → VSL Sales Page';

    const positioningText = getVal(call2, 'OFFER_POSITIONING_ANALYSIS');
    const categoryMatch = positioningText.match(/reposition.*to\s*([^\n\.]+)/i) || positioningText.match(/micro-category\s*([^\n\.]+)/i);
    const repositionedCategory = categoryMatch ? categoryMatch[1].trim() : 'Premium Solution';

    const personaText = getVal(call2, 'TARGET_PERSONA_INTELLIGENCE');
    const archetypeMatch = personaText.match(/ARCHETYPE NAME & SITUATION:\s*([^\n]+)/i);
    const personaArchetype = archetypeMatch ? archetypeMatch[1].trim() : 'Target Buyer';

    const deepDesireMatch = personaText.match(/THE DEEP DESIRE:\s*([^\n]+)/i);
    const deepDesire = deepDesireMatch ? deepDesireMatch[1].trim() : 'Emotional Freedom';

    const dominantFearMatch = personaText.match(/THE DOMINANT FEAR:\s*([^\n]+)/i);
    const dominantFear = dominantFearMatch ? dominantFearMatch[1].trim() : 'Failure / Wasted investment';

    const hooksText = getVal(call2, 'CONVERSION_HOOK_LIBRARY');
    const topHooks = hooksText.split('\n').filter((l: string) => l.includes('HOOK')).slice(0, 2).join(', ') || 'Hook 1, Hook 2';

    const anglesText = getVal(call2, 'MESSAGING_ANGLE_MATRIX');
    const topAngles = anglesText.split('\n').filter((l: string) => l.includes('ANGLE')).slice(0, 2).join(', ') || 'Angle 1, Angle 2';

    const systemPrompt = `You are OfferIQ Intelligence Engine — Traffic Intelligence Module. You produce the most specific, executable traffic acquisition strategy for offer monetization available. You think like a direct response media buyer who has spent $50M+ across Meta, Google, YouTube, and TikTok — and also writes copy that converts. You write ad copy that is ready to deploy. You write VSL scripts that are ready to record. You write media buying strategies that give specific numbers, specific audiences, and specific decision thresholds. You do not produce strategic frameworks — you produce operational intelligence. Every ad copy line, script direction, and budget number must be tied to the specific offer, persona psychology, and proof level established in the previous analysis calls. Generic ad copy is a failure condition for this module.`;

    const contextBlock = `=== OFFER CONTEXT ===
OFFER: ${formData.field_1_name} — ${formData.field_1_format}
PRICE: ${formData.field_4_price} ${formData.field_4_currency}
PROOF LEVEL: ${formData.field_5_proof || 'No proof provided'}
=== END OFFER CONTEXT ===

=== STRATEGIC INTELLIGENCE FOUNDATION (from Calls 1 + 2) ===
REPOSITIONED CATEGORY: ${repositionedCategory}
PRIMARY PERSONA ARCHETYPE: ${personaArchetype}
DEEP DESIRE: ${deepDesire}
DOMINANT FEAR: ${dominantFear}
RECOMMENDED FUNNEL TYPE: ${recommendedFunnelType}
PLATFORM PRIMARY: ${platformPrimary}
PLATFORM SECONDARY: ${platformSecondary}
TOP 2 HOOKS: ${topHooks}
TOP 2 MESSAGING ANGLES: ${topAngles}
=== END FOUNDATION ===`;

    const fullSectionInstructions = `—————————————————— PLATFORM_PRIORITY_NARRATIVE ——————————————————
[Comprehensive article broken down into readable sections]
Explain the platform strategy in plain language — written directly to the offer owner. Do not repeat the JSON from Call 1. Instead, explain the WHY behind the platform priority in a way that gives the offer owner conviction to execute.
IMPORTANT: You MUST break your answer down into 3-4 distinct sections using '###' headings and short paragraphs. Do NOT output a single wall of text.
Use these headings or similar:
### Why [Platform] First
### The First 30 Days
### The Primary Risk Factor

—————————————————— OMNICHANNEL_AD_COPY_MATRIX ——————————————————
[3 complete Meta/Instagram ad variants]
Each variant uses a different hook from the Conversion Hook Library. Each is complete and ready to deploy.
For each variant:
AD VARIANT [N] — HOOK: [Hook name used]
AUDIENCE TYPE: [Cold / Warm Retargeting / Lookalike]
CAMPAIGN OBJECTIVE: [Traffic / Lead Gen / Purchase / Conversion]
PRIMARY TEXT: [Full ad copy 2-4 paragraphs]
HEADLINE: [Under 40 characters]
LINK DESCRIPTION: [Under 30 characters]
CTA BUTTON: [Learn More / Sign Up / Shop Now / Book Now / Get Quote]
PERFORMANCE ANALYSIS: [What makes it strong and what might underperform]

—————————————————— GOOGLE_ADS_COPY_MATRIX ——————————————————
[3 responsive search ad variants]
SEARCH AD [N]:
KEYWORD INTENT: [Specific search query]
H1-H5: [Max 30 chars each]
D1-D3: [Max 90 chars each]
MATCH TYPE: [Exact / Phrase with rationale]
NEGATIVE KEYWORDS TO ADD: [3-5 specifics]

—————————————————— VSL_VIDEO_SCRIPT ——————————————————
[Produce exactly 2 variations of the VSL script]
SCRIPT 1 — VSL FORMAT VARIATION 1 [For: Sales page hero video, YouTube pre-roll, or Facebook video ad (3-5 minutes)]
RECOMMENDED LENGTH: [Time]
TONE DIRECTION: [Pacing, energy, formality]
0:00 – 0:05 | HOOK: [Exact opening line]
0:05 – 0:30 | PROBLEM AGITATION: [3-4 specific story beats]
1:00 – 1:45 | SOLUTION REVEAL: [Direction for offer intro]
1:45 – 2:30 | PROOF STACK: [How to present proof]
2:30 – 3:30 | OFFER PRESENTATION: [Offer stack sequence]
3:30 – 4:00 | CTA: [Exact closing lines]
CRITICAL SUCCESS FACTOR: [Single make-or-break element]

SCRIPT 2 — VSL FORMAT VARIATION 2 [Alternative hook or angle]
RECOMMENDED LENGTH: [Time]
TONE DIRECTION: [Different pacing or energy]
0:00 – 0:05 | HOOK: [Alternative exact opening line]
0:05 – 0:30 | PROBLEM AGITATION: [Alternative approach]
1:00 – 1:45 | SOLUTION REVEAL: [Direction for offer intro]
1:45 – 2:30 | PROOF STACK: [Alternative proof presentation]
2:30 – 3:30 | OFFER PRESENTATION: [Offer stack sequence]
3:30 – 4:00 | CTA: [Exact closing lines]
CRITICAL SUCCESS FACTOR: [Make-or-break element]

—————————————————— UGC_VIDEO_SCRIPT ——————————————————
[Produce exactly 2 variations of the UGC script]
SCRIPT 1 — UGC FORMAT VARIATION 1 [For: TikTok, Instagram Reels, YouTube Shorts (45-60 seconds)]
TARGET PLATFORM: [Primary recommendation]
CREATOR DIRECTION: [Who should film and why]
AUTHENTICITY NOTE: [Filming style direction]
0:00 – 0:03 | SCROLL STOP HOOK: [Exact opening — words + visual action]
0:03 – 0:15 | TENSION ESTABLISHMENT: [Core problem in persona's vocabulary]
0:15 – 0:35 | THE REVEAL: [Mechanism presented as discovery]
0:35 – 0:50 | PROOF MOMENT: [One specific proof element]
0:50 – 1:00 | PATTERN INTERRUPT CTA: [Natural-feeling CTA]

SCRIPT 2 — UGC FORMAT VARIATION 2 [Alternative hook or creator]
TARGET PLATFORM: [Secondary recommendation or same]
CREATOR DIRECTION: [Different persona or angle]
AUTHENTICITY NOTE: [Filming style direction]
0:00 – 0:03 | SCROLL STOP HOOK: [Alternative opening]
0:03 – 0:15 | TENSION ESTABLISHMENT: [Alternative problem focus]
0:15 – 0:35 | THE REVEAL: [Mechanism presented differently]
0:35 – 0:50 | PROOF MOMENT: [Different proof element]
0:50 – 1:00 | PATTERN INTERRUPT CTA: [Different CTA]

`;

    const fullUserPrompt = `You have completed Phase 1 (Structural) and Phase 2 (Strategic) intelligence for this offer. Now produce Phase 3: Traffic Intelligence.

${contextBlock}

Now produce all sections. Use the exact section separators before each section.

${fullSectionInstructions}`;

    // ─── Single-section regeneration mode ─────────────────────────────────────
    if (sectionId && SECTION_LABELS[sectionId]) {
        const sectionKey = SECTION_LABELS[sectionId];

        // Extract just the instruction for this section from fullSectionInstructions
        const sectionParts = fullSectionInstructions.split(/—————————————————— \w+ ——————————————————/);
        const sectionHeaders = fullSectionInstructions.match(/—————————————————— \w+ ——————————————————/g) || [];
        const sectionIndex = sectionHeaders.findIndex(h => h.includes(sectionKey));
        const sectionInstruction = sectionIndex >= 0 ? (sectionParts[sectionIndex + 1] || '').trim() : '';

        const singleSectionPrompt = `You are regenerating ONLY the "${sectionKey}" section of a Traffic Intelligence report.

${contextBlock}

Regenerate this section to be more specific, detailed, and actionable than before.

Use the exact section separator format:
—————————————————— ${sectionKey} ——————————————————
${sectionInstruction}

Output ONLY the section separator line and content for "${sectionKey}". No other sections. No preamble.`;

        try {
            const { temperature, maxOutputTokens } = getCreativityParams(creativityLevel, 8000);

            const { text } = await generateText({
                model: anthropic('claude-sonnet-4-6'),
                system: systemPrompt,
                prompt: singleSectionPrompt,
                temperature,
                maxOutputTokens,
                headers: {
                    'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15,output-128k-2025-02-19',
                },
            });

            const parsed = parseCall3Output(text);

            // Merge with existing data
            const { data: current } = await supabaseAdmin
                .from('builder_pages')
                .select('blocks')
                .eq('id', funnelId)
                .single();

            const currentBlocks = current?.blocks || {};
            const existingTI = currentBlocks.traffic_intelligence || {};
            
            const mergedTI = { ...existingTI };
            const parsedVal = parsed[sectionId as keyof typeof parsed];
            if (parsedVal) {
                mergedTI[sectionId] = parsedVal;
            } else if (text.trim()) {
                mergedTI[sectionId] = text.trim();
            }

            await supabaseAdmin
                .from('builder_pages')
                .update({
                    blocks: {
                        ...currentBlocks,
                        traffic_intelligence: mergedTI,
                    },
                })
                .eq('id', funnelId);

            return Response.json({ data: mergedTI });
        } catch (e: any) {
            console.error('[generate-traffic-intelligence] section regen error:', e);
            return Response.json({ error: e.message || 'Section regeneration failed' }, { status: 500 });
        }
    }

    // ─── Full regeneration mode ────────────────────────────────────────────────
    try {
        const { temperature, maxOutputTokens } = getCreativityParams(creativityLevel, 16000);

        const { text } = await generateText({
            model: anthropic('claude-sonnet-4-6'),
            system: systemPrompt,
            prompt: fullUserPrompt,
            temperature,
            maxOutputTokens,
            headers: {
                'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15,output-128k-2025-02-19',
            },
        });

        const parsed = parseCall3Output(text);

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
                    traffic_intelligence: parsed,
                    traffic_intelligence_raw: text,
                    traffic_intelligence_generated_at: new Date().toISOString(),
                },
            })
            .eq('id', funnelId);

        return Response.json({ data: parsed });
    } catch (e: any) {
        console.error('[generate-traffic-intelligence]', e);
        return Response.json({ error: e.message || 'Generation failed' }, { status: 500 });
    }
}
