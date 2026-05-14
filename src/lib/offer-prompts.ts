// ─────────────────────────────────────────────────────────────────────────────
// OfferIQ — AI Prompt Builders (Call 1, 2, 3)
// Each builder returns { system, user } strings ready for the AI SDK
// ─────────────────────────────────────────────────────────────────────────────
import type { OfferFormData, Call2Output, Call1Parsed } from './offer-types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatChannels(channels: string[]): string {
  return channels.length > 0 ? channels.join(', ') : 'Not specified';
}

// ─────────────────────────────────────────────────────────────────────────────
// CALL 1 — Sonnet (Structural Intelligence)
// ─────────────────────────────────────────────────────────────────────────────

export const CALL1_SYSTEM = `You are OfferIQ Intelligence Engine — Structural Analysis Module. You produce precise, scored, structured intelligence frameworks for offer monetization analysis. You are calibrated on patterns from 35,000+ high-performing offers across every major niche and business model.
Your job in this call is structural analysis: scoring, frameworks, blueprints, matrices, and organized lists. You do not write long narrative paragraphs in this call. Every output is precise, specific to this offer, and formatted exactly as specified.

CRITICAL CALIBRATION RULES:

* Score ruthlessly. An average offer scores 45-60. A well-defined offer with proof and mechanism scores 65-80. A score above 85 requires exceptional proof, a validated market, and a sharp unique mechanism. Never inflate scores to encourage the user.
* Every recommendation must be specific to THIS offer. Never write something that could apply to any offer in this category.
* If user input is vague, flag it with [NEEDS CLARITY] and provide your best inference based on the offer type. Never skip a section due to insufficient input.
* When price is in a non-USD currency, reason about it in terms of local purchasing power, not just USD conversion.

RICH UI COMPONENTS:
You have access to custom UI components to make the report visually engaging. Use them generously within your narrative text to highlight data, insights, and references.
1. <Chart type="bar|pie|radar" data='[{"name":"...", "value":...}]' title="..." summary="..." />
   - Use for any statistical data, comparisons, or scoring. e.g. <Chart type="pie" data='[{"name":"Amapiano", "value":67}, {"name":"Rock", "value":33}]' title="Music Preferences" summary="67% of Nigerians listen to more Amapiano during parties." />
2. <Insight value="67%" title="...">Content here...</Insight>
   - Use to highlight key takeaways, important numbers, or strategic insights.
3. <Reference url="..." domain="...">Title</Reference>
   - Use to cite sources, competitors, or external data points. The domain is used to fetch the website's avatar/favicon.`;

export function buildCall1UserPrompt(form: OfferFormData): string {
  const zeroProofFlag =
    !form.field_5_proof &&
      form.field_8_challenge?.toLowerCase().includes('launch')
      ? 'ZERO_PROOF_PRE_LAUNCH — weight all strategies toward validation, mechanism authority, and future-pacing. Reduce conversion predictions by 30% from baseline.'
      : '';

  const noTrafficFlag =
    form.field_7_channels.includes("Haven't started yet") && !form.field_5_proof
      ? 'NO_TRAFFIC_NO_PROOF — all scaling recommendations must be deferred. Phase 1 validation approach only. Flag this in outputs.'
      : '';

  return `Analyze this offer and produce the Call 1 Structural Intelligence report. Output every section in the exact format specified. Do not skip sections. Do not reorder sections. Do not add sections not listed.

=== OFFER INPUT ===
OFFER NAME: ${form.field_1_name}
OFFER FORMAT: ${form.field_1_format}
WHAT IT DOES / OUTCOME: ${form.field_2_outcome}
IDEAL BUYER: ${form.field_3_persona}
PRICE: ${form.field_4_price} ${form.field_4_currency}
UPSELL / PREMIUM TIER: ${form.field_4_upsell || 'Not specified'}
PROOF / CREDIBILITY: ${form.field_5_proof || 'Not provided — no existing proof or credentials shared'}
UNIQUE MECHANISM: ${form.field_6_mechanism}
TRAFFIC CHANNELS: ${formatChannels(form.field_7_channels)}
TRAFFIC DETAIL: ${form.field_7_detail || 'No additional detail provided'}
PRIMARY CHALLENGE: ${form.field_8_challenge || 'Not specified'}
=== END INPUT ===
${zeroProofFlag ? `\n[INTERNAL FLAG: ${zeroProofFlag}]` : ''}
${noTrafficFlag ? `\n[INTERNAL FLAG: ${noTrafficFlag}]` : ''}

Now produce the following sections in this exact order:
——————————————————
OFFER_SCORE
——————————————————
Output a single JSON object on one line with this exact structure:
{"overall": X, "market_viability": X, "audience_clarity": X, "offer_strength": X, "price_value_alignment": X, "uniqueness": X, "proof_strength": X, "conversion_readiness": X}

Scoring calibration:
* market_viability: Is there demonstrated demand for this type of offer? (Sources: category size, proof of similar offers succeeding, buyer language indicating active search)
* audience_clarity: How specific and actionable is the persona? Vague = 30-45. Specific with situation + tried alternatives = 75-90.
* offer_strength: Does the outcome statement create strong desire? Is it specific, credible, time-bound?
* price_value_alignment: Does the price match what this persona would pay for this outcome? Over/under-priced affects this score in both directions.
* uniqueness: How differentiated is the mechanism? Generic ("coaching program") = 20-35. Named, specific mechanism = 65-80. Genuinely novel approach with defensible differentiation = 85+.
* proof_strength: No proof = 10-20. Anecdotal/personal experience = 30-50. Client results with numbers = 60-80. Multiple case studies with specific metrics = 80-95.
* conversion_readiness: Overall readiness to convert cold traffic. Considers all other dimensions combined. A score above 70 requires strong proof AND strong mechanism AND specific persona.

——————————————————
SCORE_SUMMARY
——————————————————
Write exactly 3 sentences:
Sentence 1: Name the single strongest asset this offer has — what gives it its best chance of succeeding. Be specific to this offer, not generic praise.
Sentence 2: Name the single most critical threat to conversion — the specific weakness most likely to cause this offer to underperform. Name it directly.
Sentence 3: State the strategic priority — the one thing this offer owner should focus on first, before anything else.
——————————————————
REVENUE_MODEL_ARCHITECTURE
——————————————————
Produce a structured revenue model. For each element, provide the specific recommendation and a one-sentence rationale tied to this offer's price point, format, and buyer psychology.
CORE OFFER: [Price recommendation] — [Rationale vs. current/planned price]
LEAD MAGNET: [Specific free entry point recommendation — name it, describe it in one line, explain why it attracts this specific persona]
ORDER BUMP: [Specific add-on at checkout — name, price, rationale]
PRIMARY UPSELL: [Specific upgrade — name, price, the bridge from core offer, expected take rate based on similar offers]
DOWNSELL: [Only include if conversion risk is high — name, price, rationale for reducing commitment] OR "Not recommended for this offer — [reason]"
BACKEND / RECURRING: [Long-term LTV expansion recommendation — what to sell them 30-90 days after core offer purchase]
TOTAL LTV POTENTIAL: [Best-case LTV if all paths convert at benchmark rates — single number]
——————————————————
PAIN_POINT_MAPPING
——————————————————
Map 5-7 pain points for this specific persona in this market. Format each exactly as:
[NUMBER]. SURFACE PAIN: [What they complain about — in their own words]
ROOT PAIN: [The underlying cause — what's really happening beneath the complaint]
INTENSITY: [LOW / MEDIUM / HIGH / CRITICAL]
HOW THIS OFFER ADDRESSES IT: [One specific sentence — not generic, tied to this offer's mechanism or outcome]
Order from highest to lowest intensity. CRITICAL intensity means this pain point is the primary purchase driver — build the primary hook around it.
——————————————————
FUNNEL_STRUCTURE_BLUEPRINT
——————————————————
Recommend the exact funnel architecture for this offer. Base the recommendation on: format, price point, proof level, traffic source, and persona awareness level.
RECOMMENDED FUNNEL TYPE: [Name the funnel type — e.g., "Lead Gen → VSL Sales Page" or "Direct to Application" or "Webinar → Sales Call"]
RATIONALE: [2 sentences — why this funnel type matches this specific offer's economics and buyer psychology]
FUNNEL SEQUENCE:
[Step 1]: [Page name] — [Specific job this page does] — [Conversion benchmark to aim for]
[Step 2]: [Page name] — [Specific job] — [Benchmark]
[Step n]: [Continue through full sequence]
CRITICAL SUCCESS ELEMENT: [The single element that will make or break this funnel for THIS specific offer. Not a general funnel principle — specific to this offer, this price, this audience.]
CRITICAL FAILURE RISK: [The single most common mistake operators make with this type of funnel at this price point — and how to avoid it]
——————————————————
PRICING_STRATEGY
——————————————————
PRICE ASSESSMENT: [Is current/planned price over-priced / correctly-priced / under-priced for this market — and exactly why, referenced to what comparable offers charge and what this persona would pay]
RECOMMENDED PRICE: [Specific price with brief rationale]
PAYMENT PLAN: [Recommended payment plan terms if applicable, or "Not recommended — [reason]"]
ANCHORING STRATEGY: [How to frame the price so it feels like a bargain — specific to this offer's value stack, not generic anchoring advice]
PRICE OBJECTION: [The exact objection buyers in this market make about this price point — in their words] → PREEMPTION: [The specific copy approach to neutralize it before it forms]
——————————————————
UPSELL_DOWNSELL_PATHS
——————————————————
Design the complete revenue expansion path for this offer.
For each stage:
STAGE: [Name]
OFFER: [What is being sold — specific name and description]
PRICE: [Amount]
TRIGGER MOMENT: [Exactly when in the funnel this appears]
BRIDGE ANGLE: [The specific copy angle that transitions from previous offer to this one — one sentence of actual copy direction]
EXPECTED TAKE RATE: [Benchmark % based on similar offers at this price point]
Include: Order Bump / OTO 1 (Primary Upsell) / OTO 2 (Secondary Upsell, only if justified) / Downsell / 90-Day Backend
——————————————————
STRATEGIC_BONUS_RECOMMENDATIONS
——————————————————
Design 3-5 bonuses that eliminate specific, named objections from this persona. Do NOT recommend generic bonuses ("private Facebook group," "bonus Q&A call") without specific justification for this offer and persona.
For each bonus:
BONUS [N]: [Name it — should be specific and outcome-focused, not generic]
PURPOSE: [The specific objection or fear it eliminates — name the objection]
FORMAT: [What it is — checklist, template, workshop recording, tool, swipe file, etc.]
PERCEIVED VALUE: [What this would cost if purchased separately — must be believable, not inflated]
CREATION EFFORT: [LOW / MEDIUM / HIGH — honest assessment of how hard this is to build]
——————————————————
DESIGN_INTELLIGENCE_RECOMMENDATION
——————————————————
Provide specific visual and design direction for this offer's pages.
VISUAL THEME: [2-3 specific adjectives that define the emotional tone — e.g., "authoritative, premium, trust-forward" or "energetic, accessible, results-focused"]
COLOR DIRECTION: [Primary color category + secondary + accent — with psychological rationale tied to this persona's psychology and the emotional state the copy should create]
TYPOGRAPHY DIRECTION: [Heading weight/style — e.g., "Bold serif headings signal authority for high-ticket consulting" or "Clean sans-serif communicates accessibility for beginner audiences"]
HERO SECTION TREATMENT: [Specific recommendation for the above-the-fold layout — headline position, visual element type, CTA treatment]
PROOF PLACEMENT STRATEGY: [Where proof appears in the page flow and why, specific to this offer's proof strength level]
DIFFERENTIATING VISUAL ELEMENT: [One specific design choice that will set this page apart from generic offers in this niche — must be specific to the category]
——————————————————
FUNNEL_HEALTH_SCORE
——————————————————
Output a single JSON object on one line:
{"score": X, "cvr_cold_traffic": "X.X%", "cvr_warm_traffic": "X.X%", "revenue_per_lead_estimate": "X-X", "primary_leakage_point": "string describing where most revenue is lost", "primary_leakage_cause": "string describing why it leaks there", "fix_1": "string — most impactful single fix", "fix_2": "string — second priority fix", "fix_3": "string — third priority fix", "validation_required_before_scaling": true/false}

Scoring calibration:

Pre-launch, no proof, untested: 25-40
Launched, some proof, inconsistent results: 40-60
Validated with proof and optimized funnel: 60-80
Fully optimized, strong proof, scaling successfully: 80+
CVR predictions must be realistic for cold paid traffic (info products: 1-3%, high-ticket services: 0.5-2%, local services via ads: varies by CPA model)

——————————————————
PLATFORM_PRIORITY_MATRIX
——————————————————
Output a single JSON object on one line:
{"primary": {"platform": "string", "budget_allocation": "X%", "campaign_objective": "string", "cold_cpl_estimate": "X-X", "rationale": "string — why this platform first for this specific offer and persona"}, "secondary": {"platform": "string", "budget_allocation": "X%", "campaign_objective": "string", "cold_cpl_estimate": "X-X", "rationale": "string"}, "tertiary": {"platform": "string", "budget_allocation": "X%", "campaign_objective": "string", "cold_cpl_estimate": "X-X", "rationale": "string"}, "hold": {"platforms": ["string", "string"], "reason": "string — why these platforms are not recommended at this stage"}, "total_allocation_check": "must equal 100%", "high_risk_warning": "string or null — include if cold paid traffic is high-risk given proof level"}

Base platform selection on: persona media consumption habits, offer price point, funnel type, proof strength, and traffic channels the user has selected. Do not recommend platforms inappropriate for this offer type.
=== END OF CALL 1 ===`;
}

export const IDEA_GENERATION_SYSTEM = `You are OfferIQ Idea Generation Engine. Your job is to generate five distinct, high-potential digital offer ideas based on the user's skills, audience, country, currency, and price range. Output only valid JSON: a top-level array of objects. Each object must include title, description, demand, competition, and fit. Do not add any prose outside the JSON array.

Guidelines:
* Keep titles short and idea-specific.
* Descriptions should be clear, outcome-focused, and tied to the user's strengths.
* Demand should be one of: High Demand, Medium Demand, Low Demand.
* Competition should be one of: High Competition, Medium Competition, Low Competition.
* Fit should be one of: Perfect Fit, Strong Fit, Good Match, Needs Clarification.
`;

export function buildIdeaGenerationPrompt({
  skills,
  customSkill,
  audienceTypes,
  country,
  currency,
  budget,
}: {
  skills: string[];
  customSkill: string;
  audienceTypes: string[];
  country: string;
  currency: string;
  budget: string;
}): string {
  const skillText = skills.length > 0 ? skills.join(', ') : 'Not specified';
  const audienceText = audienceTypes.length > 0 ? audienceTypes.join(', ') : 'Not specified';

  return `Generate five distinct business or digital offer ideas.

USER INPUT:
Skills / Strengths: ${skillText}
Custom skill description: ${customSkill || 'Not provided'}
Audience types: ${audienceText}
Target country: ${country || 'Not specified'}
Currency: ${currency || 'Not specified'}
Price range: ${budget || 'Not specified'}

Return exactly valid JSON with 5 items. Each item must include: title, description, demand, competition, fit.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CALL 2 — Opus (Strategic Intelligence)
// ─────────────────────────────────────────────────────────────────────────────

export const CALL2_SYSTEM = `You are OfferIQ Intelligence Engine — Strategic Intelligence Module. You produce the highest-quality strategic narrative analysis in the offer monetization field. You think and write like a senior revenue strategist who has personally built, launched, and scaled hundreds of offers — someone who charges $25,000 for a day of consulting and earns it.
You have access to the structural analysis already completed for this offer. Your job is to produce the strategic intelligence layers that require deep thinking: positioning psychology, persona insight, persuasive copy hooks, messaging strategy, and the master monetization narrative. These are the outputs that cannot be templated or structured away — they require genuine strategic reasoning specific to this offer.

CRITICAL STANDARDS:

* Every paragraph must earn its place. No filler. No encouragement. No hedging. Be realistic with No BS honesty.
* Write in direct second-person to the offer owner ("Your offer's real problem is...").
* Every recommendation must be specific enough that removing the offer name would make it wrong. If it could be about any offer, rewrite it.
* Name things. Name the positioning category. Name the persona's fear. Name the specific copy angle. Vague strategy is useless strategy.
* Where the structural analysis (Call 1) identified weaknesses, your narratives must address them — not ignore them or soften them.

RICH UI COMPONENTS:
You have access to custom UI components to make the report visually engaging. Use them generously within your narrative text to highlight data, insights, and references.
1. <Chart type="bar|pie|radar" data='[{"name":"...", "value":...}]' title="..." summary="..." />
   - Use for any statistical data, comparisons, or scoring. e.g. <Chart type="pie" data='[{"name":"Amapiano", "value":67}, {"name":"Rock", "value":33}]' title="Music Preferences" summary="67% of Nigerians listen to more Amapiano during parties." />
2. <Insight value="67%" title="...">Content here...</Insight>
   - Use to highlight key takeaways, important numbers, or strategic insights.
3. <Reference url="..." domain="...">Title</Reference>
   - Use to cite sources, competitors, or external data points. The domain is used to fetch the website's avatar/favicon.`;

export function buildCall2UserPrompt(form: OfferFormData, call1: Call1Parsed): string {
  return `You have access to the structural intelligence already generated for this offer. Now produce the strategic intelligence layers that require deep analysis. Every section must be specific to this offer, consistent with the structural analysis, and written at the level of a senior revenue strategist.

=== ORIGINAL OFFER INPUT ===
OFFER NAME: ${form.field_1_name}
OFFER FORMAT: ${form.field_1_format}
WHAT IT DOES: ${form.field_2_outcome}
IDEAL BUYER: ${form.field_3_persona}
PRICE: ${form.field_4_price} ${form.field_4_currency}
UPSELL: ${form.field_4_upsell || 'Not specified'}
PROOF: ${form.field_5_proof || 'No proof provided'}
UNIQUE MECHANISM: ${form.field_6_mechanism}
TRAFFIC CHANNELS: ${formatChannels(form.field_7_channels)}
TRAFFIC DETAIL: ${form.field_7_detail || 'No detail provided'}
PRIMARY CHALLENGE: ${form.field_8_challenge || 'Not specified'}
=== END OFFER INPUT ===

=== CALL 1 STRUCTURAL INTELLIGENCE (Use as foundation — do not contradict) ===
OVERALL SCORE: ${call1.offer_score.overall}
SCORE SUMMARY: ${call1.score_summary}
RECOMMENDED FUNNEL TYPE: ${call1.funnel_structure_blueprint.split('\n')[0] || 'See full blueprint'}
REVENUE MODEL: ${call1.revenue_model_architecture}
PAIN POINTS (top 3 by intensity): ${call1.pain_point_mapping}
PLATFORM PRIMARY: ${JSON.stringify(call1.platform_priority_matrix.primary)}
FUNNEL HEALTH SCORE: ${call1.funnel_health_score.score}
PRIMARY LEAKAGE POINT: ${call1.funnel_health_score.primary_leakage_point}
=== END CALL 1 CONTEXT ===

Now produce the following sections in this exact order. Write with the authority of someone who has seen this exact type of offer succeed and fail hundreds of times.
——————————————————
OFFER_POSITIONING_ANALYSIS
——————————————————
[5-7 sentences of dense strategic analysis]
This is not a summary of what the offer does. This is an analysis of WHERE this offer sits in the competitive landscape and HOW it must reposition to win.
Address in sequence:

1. Name the category this offer currently competes in and the specific competitors or alternatives a buyer would consider (name actual alternatives, not generic "competitors")
2. Diagnose the positioning problem — why competing in that category is a losing game for this specific offer at this price point
3. Prescribe the repositioning — name a specific new micro-category this offer should own (not a vague "niche down" instruction — an actual named category)
4. Explain why this specific repositioning creates buyer urgency that the current positioning does not
5. State what copy and visual signals need to change to make this repositioning believable to a cold traffic audience

The repositioned category name must be specific enough to use directly in the headline. Generic repositioning advice is not acceptable.
——————————————————
TARGET_PERSONA_INTELLIGENCE
——————————————————
[Deep psychological profile — structured but narrative, not just bullets]
Build the complete primary buyer persona. This is a psychological portrait, not a demographic checklist. Write it so that any copywriter reading it could immediately know exactly what to write.
ARCHETYPE NAME & SITUATION:
[Name the archetype — a specific, memorable label — and describe their exact current situation in 3-4 sentences. What is their daily reality? What do they see when they look at their business or career? What specific moment happens that makes them search for something like this offer?]

THE SURFACE DESIRE:
[What they say they want — the stated goal]
THE DEEP DESIRE:
[What they actually want underneath — the identity shift, the status signal, the emotional freedom. This is the real purchase driver. Name it precisely.]
THE DOMINANT FEAR:
[Not their surface objection — their real fear. The thing they're afraid will happen if they spend money on this and it doesn't work. Or the thing they're afraid others will see about them.]
WHAT THEY'VE ALREADY TRIED:
[List 3-4 specific things this persona has tried before — specific enough to be recognizable, with a brief note on why each failed them. This becomes the "Failed Solutions" section of any sales page.]
THEIR VOCABULARY:
[The exact words and phrases this persona uses to describe their problem — in their own language, not marketing language. Write these as actual phrases someone would type into Google or say to a friend.]
BUYING BEHAVIOR PATTERN:
[Are they an impulse buyer or a researcher? Price-sensitive or outcome-sensitive? What does their decision process look like between discovering the offer and purchasing? How long does it typically take? What is the final trigger that makes them pull the card out?]
MAXIMUM PURCHASE INTENT TRIGGER:
[The specific moment, situation, or emotional state when this persona is most ready to buy. This is when to run the ads, send the email, make the pitch.]
——————————————————
CONVERSION_HOOK_LIBRARY
——————————————————
[5 complete, copy-ready hooks]
Generate 5 specific conversion hooks. Each hook must be complete copy — not a description of a hook, but the actual opening line or headline ready to use. Each targets a different emotional trigger.
Format each exactly as:
HOOK [N] — [TRIGGER TYPE: FEAR / DESIRE / CURIOSITY / IDENTITY / PROOF]
AUDIENCE FIT: Cold [1-5] | Warm [1-5] | Hot [1-5]
HEADLINE / OPENING LINE:
"[Complete, copy-ready hook — could run as a Facebook ad headline or email subject line tomorrow]"
WHY IT WORKS FOR THIS PERSONA:
[One specific sentence — tied to the psychology identified in the persona section. Not generic — why THIS hook works for THIS specific buyer's psychology]
BEST USE CASE:
[Where to use this hook: ad headline / email subject / sales page H1 / video hook / etc.]
After all 5 hooks, add:
RECOMMENDED LEAD HOOKS: Hook [X] and Hook [Y] — [One sentence explaining which two to test first and why, based on the traffic channels selected and awareness level of the audience]
——————————————————
MESSAGING_ANGLE_MATRIX
——————————————————
[5-7 complete messaging angles]
Each angle is a complete mini-argument for buying this offer, targeting a different segment of the audience or a different emotional entry point.
Format each exactly as:
ANGLE [N]: [ANGLE NAME — make it memorable and specific]
AUDIENCE AWARENESS: [Cold / Warm / Hot]
BEST CHANNEL: [The traffic channel where this angle performs best]
HOOK LINE: "[The opening sentence that enters this angle]"
CORE ARGUMENT: [2-3 sentences — the logical and emotional sequence of this argument. How does it move from hook to purchase desire?]
PROOF REQUIREMENT: [What specific proof is needed to make this angle credible — be honest if current proof level is insufficient and note what proof to collect first]
COPY RISK: [The specific way this angle can fail — what makes it miss if executed poorly]
After all angles:
PRIORITY ORDER: Lead with Angle [X], test Angle [Y] second, hold Angle [Z] until proof is stronger — [2-3 sentences explaining the sequencing logic for this specific offer's current state]
——————————————————
PRODUCT_CORE_VALUE_PERCEPTION
——————————————————
[4-5 sentences of perceptual analysis]
Analyze the gap between what this offer IS and what the market currently PERCEIVES it to be. This is not a features analysis — it's a perception analysis.
Address:

What proxies does this specific market use to judge quality before buying? (credentials, peer reviews, specificity of the promise, production quality, community size, the founder's story — name the actual proxies this niche uses)
How does this offer currently stack up against those proxies, honestly?
What is the specific value perception gap — the thing the offer IS that the market doesn't yet believe it is?
What is the one specific copy or positioning move that closes that perception gap most efficiently?

——————————————————
REAL_WORLD_USE_CASE_SCENARIOS
——————————————————
[3 specific, realistic scenarios]
Generate 3 operator scenarios showing how this offer is deployed in practice. These must be REALISTIC, not inspirational. If the offer has weaknesses, the scenarios should reflect them — showing the result WITH the strategic recommendations applied, with honest projections, not inflated claims.
For each scenario:
OPERATOR: [Specific archetype — not a generic persona, a specific starting position]
STARTING POINT: [Their exact situation before using OfferIQ's intelligence]
HOW THEY APPLY THE INTELLIGENCE: [Specifically what they change or build, based on the recommendations in this analysis]
30-DAY OUTCOME: [Realistic projection — with specific numbers, explicitly stated as projections not guarantees]
90-DAY OUTCOME: [Realistic projection — what compounding looks like if the strategy is working]
THE HONEST CAVEAT: [What could prevent these outcomes — the real risk factor for this operator type]
Scenario types to cover: one beginner / one intermediate / one agency or operator deploying this for clients.
——————————————————
MONETIZATION_STRATEGY_NARRATIVE
——————————————————
[6-8 paragraphs — the crown jewel of the intelligence report]
This is the master strategy document. It is written directly to the offer owner in second person. It connects every element of this analysis into a single coherent revenue strategy. It is the output that should make the reader say "How did this know exactly what I needed to hear?"
Structure:
Paragraph 1: THE CORE INSIGHT — The one strategic truth about this offer that most operators would miss. What gives this offer its real advantage, stated plainly and specifically.
Paragraph 2: THE POSITIONING PLAY — Why the recommended repositioning is the right move for THIS offer at THIS stage, and what specifically becomes possible once that positioning is established.
Paragraph 3: THE REVENUE ARCHITECTURE — How the funnel, pricing, and upsell paths work together as a coherent system. How they solve the specific economics problem of this offer type at this price point.
Paragraph 4: THE PERSONA STRATEGY — How understanding the deep desire and dominant fear of this specific buyer changes what the copy should lead with — and what to stop leading with.
Paragraph 5: THE PROOF STRATEGY — Given the current proof level (be honest about what was provided), how to deploy proof most effectively and what proof to collect as a priority.
Paragraph 6: THE TRAFFIC-FUNNEL BRIDGE — How the recommended traffic platform and the funnel structure work together. Why this traffic source goes to this funnel entry point — the alignment that makes acquisition efficient.
Paragraph 7: THE SEQUENCE — What to build first, second, and third. Not a vague "start with the basics" instruction — a specific sequence with reasoning. What will break if built out of order.
Paragraph 8: THE CRITICAL WARNING — The single most dangerous mistake this offer owner could make given this specific offer's situation, market, and stage. Named directly. This is the paragraph they'll remember.

=== END OF CALL 2 ===`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COPY GENERATION — Opus
// ─────────────────────────────────────────────────────────────────────────────

export const COPY_SYSTEM = `You are OfferIQ Copy Engine. You produce world-class, conversion-optimized sales copy for all pages of a marketing funnel. You write at the level of a $10,000/day copywriter who has written copy for 200+ successful launches. Every word is purposeful. Every line moves the reader closer to a decision. You write in the voice and language of the buyer, not the seller.`;

export function buildCopyUserPrompt(form: OfferFormData, call1: Call1Parsed, call2: Call2Output): string {
  return `Generate complete sales copy for all pages of this funnel. Use the intelligence analysis below as your foundation. Every section of copy must be consistent with the strategic analysis — especially the persona psychology, hooks, and messaging angles.

=== OFFER ===
Name: ${form.field_1_name}
Format: ${form.field_1_format}
Outcome: ${form.field_2_outcome}
Persona: ${form.field_3_persona}
Price: ${form.field_4_price} ${form.field_4_currency}
Mechanism: ${form.field_6_mechanism}
Proof: ${form.field_5_proof || 'None provided'}

=== KEY INTELLIGENCE ===
Overall Score: ${call1.offer_score.overall}
Score Summary: ${call1.score_summary}
Pricing: ${call1.pricing_strategy}
Positioning: ${call2.offer_positioning_analysis}
Persona Deep Desire: [Extract from persona intelligence below]
Dominant Fear: [Extract from persona intelligence below]
Persona Intelligence: ${call2.target_persona_intelligence}
Top Hooks: ${call2.conversion_hook_library}
Top Messaging Angles: ${call2.messaging_angle_matrix}
Pain Points: ${call1.pain_point_mapping}
Bonus Stack: ${call1.strategic_bonus_recommendations}

Now generate copy for all 5 sections below. Use these exact section markers so the output can be parsed.

=== PAGE: LEAD_CAPTURE ===
SECTION: HERO_HEADLINE
[Main headline — punchy, 6-12 words, leading with the top hook or deep desire]

SECTION: HERO_SUBHEADLINE
[One sentence — expands the headline with specificity and credibility]

SECTION: IDENTITY_BRIDGE
[2 short paragraphs — speaking directly to this persona, confirming you know who they are and what they want]

SECTION: BENEFIT_BULLETS
[5 benefit bullets — each starting with a named framework or mechanism, following with the specific outcome]

SECTION: SOCIAL_PROOF_STRIP
[3 short testimonials or a stat strip — use realistic but illustrative examples if no real proof provided]

SECTION: CTA_COPY
[CTA headline, button text, sub-copy under button]

SECTION: TRUST_MICROCOPY
[1-2 sentences of privacy/risk-reversal copy]

=== PAGE: SALES_PAGE ===
SECTION: HERO_HEADLINE
[Sales page main headline — desire-led or identity-led]

SECTION: HERO_SUBHEADLINE
[2 sentences — expands the promise with credentials or mechanism]

SECTION: PAIN_AGITATION
[3-4 paragraphs — agitate the primary pain points in order of intensity. Use the persona's exact vocabulary.]

SECTION: THE_REAL_PROBLEM
[1-2 paragraphs — name the real problem beneath the surface pain. Why generic alternatives fail them.]

SECTION: SOLUTION_REVEAL
[2 paragraphs — introduce the offer. Name the mechanism. Build desire without overexplaining.]

SECTION: WHAT_YOU_GET
[Full offer stack breakdown — each component with a name, description, and value statement]

SECTION: TESTIMONIALS
[3 detailed testimonials with name, role, and specific result]

SECTION: PRICING_AND_CTA
[Price reveal with anchoring, payment plan if applicable, guarantee, CTA button text]

SECTION: FAQ
[5 objection-busting FAQs in Q&A format — the real objections from the persona analysis]

=== PAGE: UPSELL ===
SECTION: CONGRATULATIONS_OPENER
[1 paragraph — momentum builder, confirm they made a great decision]

SECTION: THE_ONE_TIME_OFFER
[2 paragraphs — introduce the upsell as a natural next step, not a new sell]

SECTION: WHATS_INCLUDED
[3-4 bullet points of what the upsell contains]

SECTION: ROI_FRAME
[1 paragraph — the math. Why adding this makes the core offer more valuable.]

SECTION: CTA_AND_DECLINE
[Accept CTA button text + decline link text]

=== PAGE: THANKYOU ===
SECTION: WELCOME_CONFIRMATION
[1 paragraph — warm confirmation of purchase, what happens next]

SECTION: NEXT_THREE_STEPS
[3 numbered steps — specific and actionable]

SECTION: ACCESS_CTA
[Button text + access instruction]

=== EMAIL_SEQUENCE ===
Write 5 emails. Format each as:
EMAIL [N] — DAY [X]
SUBJECT: [Subject line]
PREVIEW: [Preview text]
BODY:
[Full email body — conversational, personal, on-brand voice. 200-350 words per email.]
---
Email 1 — Day 1: Welcome + Quick Win
Email 2 — Day 3: The Real Problem (deeper insight)
Email 3 — Day 5: Case Study / Proof (realistic example)
Email 4 — Day 8: Objection Crusher
Email 5 — Day 12: Final Push / Urgency

=== END OF COPY GENERATION ===`;
}
