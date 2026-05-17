import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import type { OfferFormData } from '@/lib/offer-types';
import { parseCall3Output } from '@/lib/offer-parser';

export const maxDuration = 180;

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    const { funnelId } = await params;

    if (!process.env.ANTHROPIC_API_KEY) {
        return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
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

    const userPrompt = `You have completed Phase 1 (Structural) and Phase 2 (Strategic) intelligence for this offer. Now produce Phase 3: Traffic Intelligence — the complete acquisition strategy for this offer.

=== OFFER CONTEXT ===
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
=== END FOUNDATION ===

Now produce the Traffic Intelligence outputs. Every ad, script, and strategy element must use the hooks, persona psychology, and messaging angles established above — not create new ones.

Produce the following sections in this exact order. Use the exact section separators (e.g. —————————————————— SECTION_NAME ——————————————————) before each section content.

—————————————————— PLATFORM_PRIORITY_NARRATIVE ——————————————————
[4-5 sentences]
Explain the platform strategy in plain language — written directly to the offer owner. Do not repeat the JSON from Call 1. Instead, explain the WHY behind the platform priority in a way that gives the offer owner conviction to execute.
Answer: Why this platform first? What does the first 30 days look like in terms of where attention and budget goes? What is the single platform most likely to produce the first profitable result — and what is the specific reason it will work for this offer with this persona at this price point? What is the risk to watch for in this platform selection?

—————————————————— OMNICHANNEL_AD_COPY_MATRIX ——————————————————
[3 complete Meta/Instagram ad variants]
Each variant uses a different hook from the Conversion Hook Library. Each is complete and ready to deploy.
For each variant, follow this format:
AD VARIANT [N] — HOOK: [Hook name used]
AUDIENCE TYPE: [Cold / Warm Retargeting / Lookalike]
CAMPAIGN OBJECTIVE: [Traffic / Lead Gen / Purchase / Conversion]
PRIMARY TEXT: [Full ad copy as it appears in the ad — 2-4 paragraphs. Written in the voice appropriate for this persona. Conversational but specific. Opens with the hook. Establishes the pain. Introduces the mechanism. Delivers the promise. Ends with CTA. Must feel like it was written by someone who knows this exact persona — not a template.]
HEADLINE: [Under 40 characters — the single most important line after the hook]
LINK DESCRIPTION: [Under 30 characters — the secondary hook or proof point]
CTA BUTTON: [Select: Learn More / Sign Up / Shop Now / Book Now / Get Quote]
PERFORMANCE ANALYSIS: [What specifically makes this ad strong — and the one element most likely to underperform if the creative or delivery isn't right]

—————————————————— GOOGLE_ADS_COPY_MATRIX ——————————————————
[3 responsive search ad variants]
For each variant, follow this format:
SEARCH AD [N]:
KEYWORD INTENT: [The specific search query this ad targets — be specific]
HEADLINES (write 5):
H1: [Max 30 chars]
H2: [Max 30 chars]
H3: [Max 30 chars]
H4: [Max 30 chars]
H5: [Max 30 chars]
DESCRIPTIONS (write 3):
D1: [Max 90 chars]
D2: [Max 90 chars]
D3: [Max 90 chars]
MATCH TYPE: [Exact Match / Phrase Match — with rationale for this stage]
NEGATIVE KEYWORDS TO ADD: [3-5 specific negatives that protect budget for this offer type]

—————————————————— VSL_UGC_VIDEO_SCRIPT_INTELLIGENCE ——————————————————
[2 complete script structures]
SCRIPT 1 — VSL FORMAT [For: Sales page hero video, YouTube pre-roll, or Facebook video ad (3-5 minutes)]
RECOMMENDED LENGTH: [Time — based on offer price point and funnel position]
TONE DIRECTION: [How to speak — pacing, energy level, formality — specific to this persona's trust requirements]
0:00 – 0:05 | HOOK: [EXACT OPENING LINE — the first words spoken. Must stop the scroll or prevent the skip. Write it out completely.]
[Visual direction: what should appear on screen]
0:05 – 0:30 | PROBLEM AGITATION: [The 3-4 specific points to hit — not a script, but specific story beats and pain points, in order, tied to the persona's dominant fear and failed solutions]
[Delivery note: what emotional register to hold here]
1:00 – 1:45 | SOLUTION REVEAL: [How to introduce the offer — specific direction. What to name, what to show, what to NOT say yet. The tease before the full reveal.]
1:45 – 2:30 | PROOF STACK: [How to present the available proof — specific to what was provided. If no social proof: how to use the mechanism as proof. How to handle the proof honestly without overstating.]
2:30 – 3:30 | OFFER PRESENTATION: [The offer stack sequence — what to reveal, in what order, building perceived value. How to handle the price reveal. Anchoring instruction.]
3:30 – 4:00 | CTA: [EXACT CLOSING LINES — the final call to action. Specific urgency if available. Guarantee mention. The last sentence spoken.]
CRITICAL SUCCESS FACTOR: [The single element that will make or break this VSL — specific to this offer type and persona trust level]

SCRIPT 2 — UGC FORMAT [For: TikTok, Instagram Reels, YouTube Shorts (45-60 seconds)]
TARGET PLATFORM: [Primary platform recommendation for this short-form format]
CREATOR DIRECTION: [Who should ideally film this — founder, customer testimonial, or actor — and why for this offer]
AUTHENTICITY NOTE: [Specific filming style direction — iPhone vs. produced, scripted vs. natural, location, setup — specific to what converts in this niche]
0:00 – 0:03 | SCROLL STOP HOOK: [EXACT OPENING — first words AND visual action simultaneously. Must be disruptive. Written out completely.]
0:03 – 0:15 | TENSION ESTABLISHMENT: [The core problem stated in the persona's own vocabulary — conversational, not scripted-sounding. 2-3 specific sentences.]
0:15 – 0:35 | THE REVEAL: [The mechanism or result — presented as discovery, not pitch. How to tease the offer without sounding like an ad.]
0:35 – 0:50 | PROOF MOMENT: [One specific proof element — result, screenshot, reaction — that creates believability in the shortest possible time]
0:50 – 1:00 | PATTERN INTERRUPT CTA: [The CTA — must feel natural, not forced. Specific instruction: what to say, where to direct, how to avoid sounding like every other ad]

—————————————————— MEDIA_BUYING_STRATEGY_REPORT ——————————————————
[Operational 3-phase plan with specific numbers]
PHASE 1 — VALIDATION (Days 1-21):
DAILY BUDGET: [$X/day — with rationale tied to the CPL estimate and the number of variables needing testing]
CAMPAIGN OBJECTIVE: [Specific objective + why, not generic "use conversions"]
COLD AUDIENCE DEFINITION: [Specific interest layers, demographic parameters, behavior signals — written as if you're setting up the ad set right now]
CREATIVE TESTING APPROACH: [How many ad variants, what variable to isolate first, what to test second — specific to this offer's unknowns]
SUCCESS THRESHOLD: [The specific CPL or ROAS number that says "this is working, keep going" — be specific]
PAUSE THRESHOLD: [The specific number that says "stop, diagnose, change something" — be specific. Include what to diagnose first.]
PIXEL EVENTS TO TRACK: [The specific conversion events to set up, in order of importance for this funnel type]

PHASE 2 — SCALING (Days 22-60, ONLY if Phase 1 hits success threshold):
SCALE TRIGGER: [The exact result that justifies budget increase — specific number]
BUDGET INCREASE APPROACH: [How much, how fast — e.g., "increase by 30% every 72 hours if ROAS holds" — not "gradually increase"]
AUDIENCE EXPANSION: [Lookalike percentages, interest expansion, broad targeting approach — specific to this platform and offer type]
CREATIVE REFRESH TRIGGER: [When to add new creative — the specific frequency decay signal to watch for]
SCALE WARNING: [The specific risk to this offer type when scaling — what breaks first and how to catch it early]

PHASE 3 — OPTIMIZATION (Day 60+):
RETARGETING ARCHITECTURE: [Specific audience segments — who goes in each bucket, what creative each sees, what the goal of each retargeting segment is]
LTV OPTIMIZATION: [How to increase revenue per acquired customer — specific to this offer's upsell path]
PLATFORM EXPANSION CRITERIA: [The specific result that justifies testing the secondary platform — not "when you're ready" but an actual threshold]

—————————————————— TRAFFIC_FUNNEL_ALIGNMENT ——————————————————
[5-6 sentences — the most important traffic section]
Explain specifically how each recommended traffic source aligns with the funnel structure. This is NOT a repeat of previous analysis — this is the integration layer that ties traffic to funnel.
Answer: Where does cold traffic enter this funnel and what do they experience in the first 30 seconds? Why is THIS funnel entry point correct for cold traffic to this offer — and what would break if cold traffic entered at a different point? What is the most common misalignment this type of operator makes with traffic and funnel (e.g., sending cold paid traffic to a high-ticket sales call page, or sending warm email traffic to a VSL they've already seen)? How does this strategy specifically avoid that misalignment? What is the single ad-to-landing-page message match that is most important to get right for this offer?

—————————————————— COMPETITIVE_ACQUISITION_INTELLIGENCE ——————————————————
[4-5 sentences + 3 specific differentiation tactics]
Describe what competitors in this specific niche are doing for acquisition — not generic competitor behavior, but what is actually happening in ads and content for this market right now.
STATE: The dominant ad angle being used by most competitors in this niche (the one that is saturated)
STATE: The proof type that most competitors are leading with (the one that buyers are now fatigued by)
STATE: The positioning gap — what no one in this niche is saying that this offer could own
Then give 3 SPECIFIC differentiation tactics:
TACTIC 1: [Specific acquisition angle or format that competitors are not using — named and described operationally]
TACTIC 2: [Specific targeting approach that competitors are not testing for this offer type]
TACTIC 3: [Specific creative format or platform use that creates attention differentiation]
Each tactic must be specific to this offer's niche, not generic marketing advice.

—————————————————— LAUNCH_SEQUENCE_RECOMMENDATION ——————————————————
[Specific 21-day operational plan]
This is not a content calendar. It is the exact sequence of actions to validate this offer with paid traffic. Be specific enough that the offer owner knows exactly what to do on each day.
PRE-LAUNCH (Days 0-3): [What to set up before spending a dollar — specific technical and creative requirements]
WEEK 1 (Days 1-7):
Day 1: [Specific actions]
Day 2: [Specific actions]
Day 3: [Specific actions]
Day 4-5: [Specific actions]
Day 6-7: [First data review — what metrics to check, what decisions they mean]
WEEK 2 (Days 8-14):
Day 8-10: [Specific actions based on Week 1 data]
Day 11-14: [Optimization actions — what to do if it's working / what to do if it's not]
WEEK 3 (Days 15-21):
Day 15-17: [Expansion or pivot decisions]
Day 18-21: [Scaling if validated / diagnostic if not — specific decision tree]
DAY 21 REVIEW: [The specific metrics to compile. The go/no-go decision criteria for continuing vs. pivoting the offer. The 3 questions to answer before Week 4.]`;

    try {
        const { text } = await generateText({
            model: anthropic('claude-opus-4-6'),
            system: systemPrompt,
            prompt: userPrompt,
            maxOutputTokens: 4000,
        });

        // Parse parsed section structure using the newly implemented parseCall3Output function
        const parsed = parseCall3Output(text);

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
