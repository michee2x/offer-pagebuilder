// ─────────────────────────────────────────────────────────────────────────────
// OfferIQ — Text parser for AI stream output
// Extracts named sections from the structured text format
// ─────────────────────────────────────────────────────────────────────────────

import type { Call1Output, Call2Output, CopyOutput, PageCopy, EmailCopy } from './offer-types';

// ─────────────────────────────────────────────────────────────────────────────
// Generic section extractor
// ─────────────────────────────────────────────────────────────────────────────

const ALL_SECTIONS = [
  'OFFER_SCORE', 'SCORE_SUMMARY', 'REVENUE_MODEL_ARCHITECTURE', 'PAIN_POINT_MAPPING',
  'FUNNEL_STRUCTURE_BLUEPRINT', 'PRICING_STRATEGY', 'UPSELL_DOWNSELL_PATHS',
  'STRATEGIC_BONUS_RECOMMENDATIONS', 'DESIGN_INTELLIGENCE_RECOMMENDATION',
  'FUNNEL_HEALTH_SCORE', 'PLATFORM_PRIORITY_MATRIX',
  'OFFER_POSITIONING_ANALYSIS', 'TARGET_PERSONA_INTELLIGENCE', 'CONVERSION_HOOK_LIBRARY',
  'MESSAGING_ANGLE_MATRIX', 'PRODUCT_CORE_VALUE_PERCEPTION', 'REAL_WORLD_USE_CASE_SCENARIOS',
  'MONETIZATION_STRATEGY_NARRATIVE'
];

export function extractSection(text: string, sectionName: string): string {
  const nameIndex = text.indexOf(sectionName);
  if (nameIndex === -1) return '';

  const afterName = text.substring(nameIndex + sectionName.length);
  const bottomDividerMatch = afterName.match(/^\s*(?:—|-|=){3,}\s*\n/);
  
  let contentStart = nameIndex + sectionName.length;
  if (bottomDividerMatch) {
      contentStart += bottomDividerMatch[0].length;
  }

  let nextSectionIndex = text.length;
  for (const name of ALL_SECTIONS) {
      if (name === sectionName) continue;
      const index = text.indexOf(name, contentStart);
      if (index !== -1 && index < nextSectionIndex) {
          const textBeforeNext = text.substring(contentStart, index);
          const topDividerMatch = textBeforeNext.match(/(?:—|-|=){3,}\s*$/);
          if (topDividerMatch) {
             nextSectionIndex = contentStart + topDividerMatch.index!;
          } else {
             nextSectionIndex = index;
          }
      }
  }

  const result = text.substring(contentStart, nextSectionIndex).trim();
  
  if (result) {
    console.log(`[Parser] Successfully extracted section: ${sectionName} (${result.length} characters)`);
  } else {
    console.warn(`[Parser] Failed to extract section: ${sectionName}`);
  }
  
  return result;
}

function extractJSON<T>(text: string, fallback: T): T {
  if (!text) return fallback;
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const parsed = JSON.parse(text.substring(start, end + 1)) as T;
      console.log(`[Parser] Successfully parsed JSON object`, Object.keys(parsed as any));
      return parsed;
    }
  } catch (e: any) {
    console.warn(`[Parser] JSON parsing failed: ${e.message}`);
  }
  return fallback;
}

// ─────────────────────────────────────────────────────────────────────────────
// Call 1 parser
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_OFFER_SCORE = {
  overall: 0, market_viability: 0, audience_clarity: 0, offer_strength: 0,
  price_value_alignment: 0, uniqueness: 0, proof_strength: 0, conversion_readiness: 0,
};

const DEFAULT_HEALTH_SCORE = {
  score: 0, cvr_cold_traffic: '0%', cvr_warm_traffic: '0%',
  revenue_per_lead_estimate: '$0', primary_leakage_point: '',
  primary_leakage_cause: '', fix_1: '', fix_2: '', fix_3: '',
  validation_required_before_scaling: true,
};

const DEFAULT_PLATFORM = { platform: '', budget_allocation: '0%', campaign_objective: '', cold_cpl_estimate: '$0', rationale: '' };

const DEFAULT_PLATFORM_MATRIX = {
  primary: DEFAULT_PLATFORM, secondary: DEFAULT_PLATFORM, tertiary: DEFAULT_PLATFORM,
  hold: { platforms: [], reason: '' }, total_allocation_check: '100%', high_risk_warning: null,
};

export function parseCall1Output(rawText: string): Call1Output {
  const scoreRaw = extractSection(rawText, 'OFFER_SCORE');
  const healthRaw = extractSection(rawText, 'FUNNEL_HEALTH_SCORE');
  const platformRaw = extractSection(rawText, 'PLATFORM_PRIORITY_MATRIX');

  return {
    offer_score: extractJSON(scoreRaw, DEFAULT_OFFER_SCORE),
    score_summary: extractSection(rawText, 'SCORE_SUMMARY'),
    revenue_model_architecture: extractSection(rawText, 'REVENUE_MODEL_ARCHITECTURE'),
    pain_point_mapping: extractSection(rawText, 'PAIN_POINT_MAPPING'),
    funnel_structure_blueprint: extractSection(rawText, 'FUNNEL_STRUCTURE_BLUEPRINT'),
    pricing_strategy: extractSection(rawText, 'PRICING_STRATEGY'),
    upsell_downsell_paths: extractSection(rawText, 'UPSELL_DOWNSELL_PATHS'),
    strategic_bonus_recommendations: extractSection(rawText, 'STRATEGIC_BONUS_RECOMMENDATIONS'),
    design_intelligence_recommendation: extractSection(rawText, 'DESIGN_INTELLIGENCE_RECOMMENDATION'),
    funnel_health_score: extractJSON(healthRaw, DEFAULT_HEALTH_SCORE),
    platform_priority_matrix: extractJSON(platformRaw, DEFAULT_PLATFORM_MATRIX),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Call 2 parser
// ─────────────────────────────────────────────────────────────────────────────

export function parseCall2Output(rawText: string): Call2Output {
  return {
    offer_positioning_analysis: extractSection(rawText, 'OFFER_POSITIONING_ANALYSIS'),
    target_persona_intelligence: extractSection(rawText, 'TARGET_PERSONA_INTELLIGENCE'),
    conversion_hook_library: extractSection(rawText, 'CONVERSION_HOOK_LIBRARY'),
    messaging_angle_matrix: extractSection(rawText, 'MESSAGING_ANGLE_MATRIX'),
    product_core_value_perception: extractSection(rawText, 'PRODUCT_CORE_VALUE_PERCEPTION'),
    real_world_use_case_scenarios: extractSection(rawText, 'REAL_WORLD_USE_CASE_SCENARIOS'),
    monetization_strategy_narrative: extractSection(rawText, 'MONETIZATION_STRATEGY_NARRATIVE'),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Copy parser
// ─────────────────────────────────────────────────────────────────────────────

function extractPageCopy(rawText: string, pageName: string): PageCopy {
  const pageMatch = rawText.match(
    new RegExp(`(?:=|-|—)+\\s*PAGE:\\s*${pageName}\\s*(?:=|-|—)+([\\s\\S]*?)(?:(?:=|-|—)+\\s*PAGE:|(?:=|-|—)+\\s*EMAIL_SEQUENCE|$)`, 'i')
  );
  if (!pageMatch) return { sections: [], score: 0, word_count: 0 };

  const pageText = pageMatch[1];
  const sectionMatches = pageText.matchAll(/SECTION:\s*(\w+)\s*\n([\s\S]*?)(?=SECTION:|\s*$)/gi);
  const sections = [];

  for (const m of sectionMatches) {
    const content = m[2].trim();
    if (content) {
      sections.push({ label: m[1], content });
    }
  }

  const wordCount = sections.reduce((acc, s) => acc + s.content.split(/\s+/).length, 0);
  console.log(`[Parser] Extracted PAGE COPY: ${pageName} (${sections.length} sections, ${wordCount} words)`);
  return { sections, score: 85, word_count: wordCount };
}

function extractEmailSequence(rawText: string): EmailCopy[] {
  const seqMatch = rawText.match(/(?:=|-|—)+\s*EMAIL_SEQUENCE\s*(?:=|-|—)+([\s\S]*?)(?:(?:=|-|—)+\s*END|$)/i);
  if (!seqMatch) return [];

  const seqText = seqMatch[1];
  const emailMatches = seqText.matchAll(/EMAIL\s+(\d+)\s*(?:—|-|–)\s*DAY\s+(\d+)\s*\nSUBJECT:\s*(.*)\nPREVIEW:\s*(.*)\nBODY:\n([\s\S]*?)(?=EMAIL\s+\d+|---\s*$|\s*$)/gi);
  const emails: EmailCopy[] = [];

  for (const m of emailMatches) {
    emails.push({
      day: parseInt(m[2]),
      subject: m[3].trim(),
      preview: m[4].trim(),
      body: m[5].replace(/^---\s*$/, '').trim(),
    });
  }

  console.log(`[Parser] Extracted EMAIL SEQUENCE: ${emails.length} emails found`);
  return emails;
}

export function parseCopyOutput(rawText: string): CopyOutput {
  return {
    lead_capture: extractPageCopy(rawText, 'LEAD_CAPTURE'),
    sales_page: extractPageCopy(rawText, 'SALES_PAGE'),
    upsell: extractPageCopy(rawText, 'UPSELL'),
    thankyou: extractPageCopy(rawText, 'THANKYOU'),
    email_sequence: extractEmailSequence(rawText),
  };
}
