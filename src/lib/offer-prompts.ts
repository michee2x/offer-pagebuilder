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
* When price is in a non-USD currency, reason about it in terms of local purchasing power, not just USD conversion.`;

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

——————————————————
SCORE_SUMMARY
——————————————————
Write exactly 3 sentences:
Sentence 1: Name the single strongest asset this offer has.
Sentence 2: Name the single most critical threat to conversion.
Sentence 3: State the strategic priority — the one thing this offer owner should focus on first.

——————————————————
REVENUE_MODEL_ARCHITECTURE
——————————————————
CORE OFFER: [Price recommendation] — [Rationale]
LEAD MAGNET: [Specific free entry point]
ORDER BUMP: [Specific add-on at checkout]
PRIMARY UPSELL: [Specific upgrade — name, price, expected take rate]
DOWNSELL: [Only if conversion risk is high] OR "Not recommended — [reason]"
BACKEND / RECURRING: [Long-term LTV recommendation]
TOTAL LTV POTENTIAL: [Best-case LTV]

——————————————————
PAIN_POINT_MAPPING
——————————————————
Map 5-7 pain points. Format each exactly as:
[NUMBER]. SURFACE PAIN: [complaint in their own words]
ROOT PAIN: [underlying cause]
INTENSITY: [LOW / MEDIUM / HIGH / CRITICAL]
HOW THIS OFFER ADDRESSES IT: [one specific sentence]
Order from highest to lowest intensity.

——————————————————
FUNNEL_STRUCTURE_BLUEPRINT
——————————————————
RECOMMENDED FUNNEL TYPE: [Name]
RATIONALE: [2 sentences]
FUNNEL SEQUENCE:
[Step 1]: [Page name] — [Job] — [Conversion benchmark]
[Step 2]: ...
CRITICAL SUCCESS ELEMENT: [Single make-or-break element for THIS offer]
CRITICAL FAILURE RISK: [Most common mistake at this price point]

——————————————————
PRICING_STRATEGY
——————————————————
PRICE ASSESSMENT: [over-priced / correctly-priced / under-priced — and exactly why]
RECOMMENDED PRICE: [Specific price with rationale]
PAYMENT PLAN: [Recommended terms or "Not recommended — [reason]"]
ANCHORING STRATEGY: [How to frame the price — specific to this offer]
PRICE OBJECTION: [Exact objection in buyer's words] → PREEMPTION: [Specific copy approach]

——————————————————
UPSELL_DOWNSELL_PATHS
——————————————————
For each stage:
STAGE: [Name]
OFFER: [Name and description]
PRICE: [Amount]
TRIGGER MOMENT: [When in funnel]
BRIDGE ANGLE: [Copy direction — one sentence]
EXPECTED TAKE RATE: [Benchmark %]
Include: Order Bump / OTO 1 / OTO 2 (if justified) / Downsell / 90-Day Backend

——————————————————
STRATEGIC_BONUS_RECOMMENDATIONS
——————————————————
For each bonus:
BONUS [N]: [Specific outcome-focused name]
PURPOSE: [Specific objection or fear it eliminates]
FORMAT: [What it is — checklist, template, workshop, tool, etc.]
PERCEIVED VALUE: [Believable purchase price]
CREATION EFFORT: [LOW / MEDIUM / HIGH]

——————————————————
DESIGN_INTELLIGENCE_RECOMMENDATION
——————————————————
VISUAL THEME: [2-3 adjectives defining the emotional tone]
COLOR DIRECTION: [Primary + secondary + accent with psychological rationale]
TYPOGRAPHY DIRECTION: [Heading style with rationale for this persona]
HERO SECTION TREATMENT: [Specific above-the-fold layout recommendation]
PROOF PLACEMENT STRATEGY: [Where proof appears and why]
DIFFERENTIATING VISUAL ELEMENT: [One specific design choice for this niche]

——————————————————
FUNNEL_HEALTH_SCORE
——————————————————
Output a single JSON object on one line:
{"score": X, "cvr_cold_traffic": "X.X%", "cvr_warm_traffic": "X.X%", "revenue_per_lead_estimate": "$X-$X", "primary_leakage_point": "string", "primary_leakage_cause": "string", "fix_1": "string", "fix_2": "string", "fix_3": "string", "validation_required_before_scaling": true/false}

——————————————————
PLATFORM_PRIORITY_MATRIX
——————————————————
Output a single JSON object on one line:
{"primary": {"platform": "string", "budget_allocation": "X%", "campaign_objective": "string", "cold_cpl_estimate": "$X-$X", "rationale": "string"}, "secondary": {"platform": "string", "budget_allocation": "X%", "campaign_objective": "string", "cold_cpl_estimate": "$X-$X", "rationale": "string"}, "tertiary": {"platform": "string", "budget_allocation": "X%", "campaign_objective": "string", "cold_cpl_estimate": "$X-$X", "rationale": "string"}, "hold": {"platforms": ["string"], "reason": "string"}, "total_allocation_check": "100%", "high_risk_warning": "string or null"}

=== END OF CALL 1 ===`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CALL 2 — Opus (Strategic Intelligence)
// ─────────────────────────────────────────────────────────────────────────────

export const CALL2_SYSTEM = `You are OfferIQ Intelligence Engine — Strategic Intelligence Module. You produce the highest-quality strategic narrative analysis in the offer monetization field. You think and write like a senior revenue strategist who has personally built, launched, and scaled hundreds of offers — someone who charges $25,000 for a day of consulting and earns it.
You have access to the structural analysis already completed for this offer. Your job is to produce the strategic intelligence layers that require deep thinking: positioning psychology, persona insight, persuasive copy hooks, messaging strategy, and the master monetization narrative.

CRITICAL STANDARDS:
* Every paragraph must earn its place. No filler. No encouragement. No hedging. Be realistic with No BS honesty.
* Write in direct second-person to the offer owner ("Your offer's real problem is...").
* Every recommendation must be specific enough that removing the offer name would make it wrong.
* Name things. Name the positioning category. Name the persona's fear. Name the specific copy angle.
* Where the structural analysis (Call 1) identified weaknesses, your narratives must address them — not ignore them or soften them.`;

export function buildCall2UserPrompt(form: OfferFormData, call1: Call1Parsed): string {
  return `You have access to the structural intelligence already generated for this offer. Now produce the strategic intelligence layers that require deep analysis.

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

=== CALL 1 STRUCTURAL INTELLIGENCE ===
OVERALL SCORE: ${JSON.parse(call1.offer_score).overall}
SCORE SUMMARY: ${call1.score_summary}
RECOMMENDED FUNNEL TYPE: ${call1.funnel_structure_blueprint.split('\n')[0] || 'See full blueprint'}
REVENUE MODEL: ${call1.revenue_model_architecture}
PAIN POINTS: ${call1.pain_point_mapping}
PLATFORM PRIMARY: ${JSON.stringify(JSON.parse(call1.platform_priority_matrix).primary)}
FUNNEL HEALTH SCORE: ${JSON.parse(call1.funnel_health_score).score}
PRIMARY LEAKAGE POINT: ${JSON.parse(call1.funnel_health_score).primary_leakage_point}
=== END CALL 1 CONTEXT ===

Now produce the following sections in this exact order:

——————————————————
OFFER_POSITIONING_ANALYSIS
——————————————————
[5-7 sentences of dense strategic analysis]
Address: (1) The category this offer currently competes in and specific named alternatives, (2) Why competing there is losing for this offer at this price, (3) A specific named micro-category to own, (4) Why this repositioning creates urgency, (5) What copy and visual signals must change.

——————————————————
TARGET_PERSONA_INTELLIGENCE
——————————————————
ARCHETYPE NAME & SITUATION:
[Memorable label + 3-4 sentences on exact current situation]

THE SURFACE DESIRE:
[What they say they want]
THE DEEP DESIRE:
[What they actually want — identity shift, status, emotional freedom]
THE DOMINANT FEAR:
[Real fear — not surface objection]
WHAT THEY'VE ALREADY TRIED:
[3-4 specific things with brief note on why each failed]
THEIR VOCABULARY:
[Exact phrases they type into Google or say to friends]
BUYING BEHAVIOR PATTERN:
[Impulse buyer or researcher? Decision process and timeline?]
MAXIMUM PURCHASE INTENT TRIGGER:
[Specific moment/situation/emotional state when most ready to buy]

——————————————————
CONVERSION_HOOK_LIBRARY
——————————————————
Generate 5 hooks. Format each exactly as:
HOOK [N] — [TRIGGER TYPE: FEAR / DESIRE / CURIOSITY / IDENTITY / PROOF]
AUDIENCE FIT: Cold [1-5] | Warm [1-5] | Hot [1-5]
HEADLINE / OPENING LINE:
"[Complete, copy-ready hook]"
WHY IT WORKS FOR THIS PERSONA:
[One specific sentence tied to the persona psychology]
BEST USE CASE:
[ad headline / email subject / sales page H1 / video hook]

After all 5:
RECOMMENDED LEAD HOOKS: Hook [X] and Hook [Y] — [One sentence explaining which to test first and why]

——————————————————
MESSAGING_ANGLE_MATRIX
——————————————————
Generate 5-7 angles. Format each exactly as:
ANGLE [N]: [MEMORABLE SPECIFIC NAME]
AUDIENCE AWARENESS: [Cold / Warm / Hot]
BEST CHANNEL: [Traffic channel where this performs best]
HOOK LINE: "[Opening sentence]"
CORE ARGUMENT: [2-3 sentences — logical and emotional sequence]
PROOF REQUIREMENT: [What proof is needed to make this credible]
COPY RISK: [How this angle can fail]

After all angles:
PRIORITY ORDER: Lead with Angle [X], test Angle [Y] second, hold Angle [Z] until proof is stronger — [2-3 sentence reasoning]

——————————————————
PRODUCT_CORE_VALUE_PERCEPTION
——————————————————
[4-5 sentences of perceptual analysis]
Address: (1) What proxies this market uses to judge quality, (2) How this offer stacks up against those proxies honestly, (3) The value perception gap, (4) The one copy or positioning move that closes that gap most efficiently.

——————————————————
REAL_WORLD_USE_CASE_SCENARIOS
——————————————————
Generate 3 realistic operator scenarios. For each:
OPERATOR: [Specific archetype with starting position]
STARTING POINT: [Exact situation before using OfferIQ]
HOW THEY APPLY THE INTELLIGENCE: [Specifically what they change or build]
30-DAY OUTCOME: [Realistic projection with specific numbers — stated as projections]
90-DAY OUTCOME: [Realistic compounding projection]
THE HONEST CAVEAT: [What could prevent these outcomes]
Scenario types: beginner / intermediate / agency deploying for clients

——————————————————
MONETIZATION_STRATEGY_NARRATIVE
——————————————————
[6-8 paragraphs — the crown jewel]
Structure:
Paragraph 1: THE CORE INSIGHT — one strategic truth most operators would miss
Paragraph 2: THE POSITIONING PLAY — why repositioning now is right and what becomes possible
Paragraph 3: THE REVENUE ARCHITECTURE — how funnel, pricing, and upsell paths work as a system
Paragraph 4: THE PERSONA STRATEGY — what the deep desire and dominant fear change about copy
Paragraph 5: THE PROOF STRATEGY — given current proof level, how to deploy it and what to collect
Paragraph 6: THE TRAFFIC-FUNNEL BRIDGE — why this traffic source goes to this funnel entry point
Paragraph 7: THE SEQUENCE — what to build first, second, third with reasoning
Paragraph 8: THE CRITICAL WARNING — the single most dangerous mistake for this offer to make

=== END OF CALL 2 ===`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COPY GENERATION — Opus
// ─────────────────────────────────────────────────────────────────────────────

export const COPY_SYSTEM = `You are OfferIQ Copy Engine. You produce world-class, conversion-optimized sales copy for all pages of a marketing funnel. You write at the level of a $10,000/day copywriter who has written copy for 200+ successful launches. Every word is purposeful. Every line moves the reader closer to a decision. You write in the voice and language of the buyer, not the seller.`;

export function buildCopyUserPrompt(form: OfferFormData, call1: Record<string, string>, call2: Call2Output): string {
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
Overall Score: ${JSON.parse(call1.offer_score).overall}
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
