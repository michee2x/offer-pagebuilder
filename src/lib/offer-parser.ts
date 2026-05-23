// ─────────────────────────────────────────────────────────────────────────────
// offer-parser — v3
// Parses the AI's JSON page spec output into CopyOutput.
// No more regex. JSON.parse and done.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CopyOutput,
  PageSpec,
  PageSection,
  PageElement,
  FunnelPageKey,
  PageDeclaration,
  Call2Output,
  Call3Output,
} from './offer-types';

const VALID_PAGE_KEYS = new Set<FunnelPageKey>([
  'lead_capture',
  'sales_page',
  'upsell',
  'downsell',
  'thankyou',
]);

// ─── Word counter ─────────────────────────────────────────────────────────────

function countWords(spec: PageSpec): number {
  let count = 0;
  for (const section of spec.sections) {
    for (const el of section.elements) {
      if (el.copy) count += el.copy.split(/\s+/).filter(Boolean).length;
      if (el.secondary_copy) count += el.secondary_copy.split(/\s+/).filter(Boolean).length;
      if (el.items) {
        for (const item of el.items) {
          count += item.split(/\s+/).filter(Boolean).length;
        }
      }
    }
  }
  return count;
}

// ─── Sanitise a page spec coming from AI ─────────────────────────────────────

function sanitisePage(raw: any, key: FunnelPageKey): PageSpec | null {
  if (!raw || typeof raw !== 'object') return null;

  const sections: PageSection[] = [];

  if (Array.isArray(raw.sections)) {
    for (const sec of raw.sections) {
      if (!sec || typeof sec !== 'object') continue;

      const elements: PageElement[] = [];
      if (Array.isArray(sec.elements)) {
        for (const el of sec.elements) {
          if (!el || typeof el !== 'object' || !el.type) continue;
          elements.push({
            id: el.id || `el_${Math.random().toString(36).slice(2, 7)}`,
            type: el.type,
            copy: el.copy ?? undefined,
            secondary_copy: el.secondary_copy ?? undefined,
            items: Array.isArray(el.items) ? el.items : undefined,
            align: el.align ?? 'left',
            placeholder_label: el.placeholder_label ?? undefined,
            placeholder_aspect: el.placeholder_aspect ?? undefined,
            variant: el.variant ?? undefined,
            size: el.size ?? undefined,
          });
        }
      }

      sections.push({
        id: sec.id || `sec_${Math.random().toString(36).slice(2, 7)}`,
        label: sec.label || sec.id || 'Section',
        layout: sec.layout || 'full_width',
        padding_top: sec.padding_top || 'md',
        padding_bottom: sec.padding_bottom || 'md',
        background: sec.background || 'default',
        elements,
      });
    }
  }

  if (sections.length === 0) return null;

  const spec: PageSpec = {
    key,
    title: raw.title || key,
    sections,
    score: typeof raw.score === 'number' ? raw.score : 85,
    word_count: 0,
  };

  spec.word_count = countWords(spec);

  return spec;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function parseCopyOutput(rawText: string): CopyOutput {
  // Strip markdown code fences if AI wrapped it anyway
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: any;

  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    // Attempt to extract a JSON object if there's surrounding text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        console.error('[parseCopyOutput] Failed to parse AI JSON output');
        return { declaration: { pages: [], rationale: '' }, pages: {} };
      }
    } else {
      console.error('[parseCopyOutput] No JSON object found in AI output');
      return { declaration: { pages: [], rationale: '' }, pages: {} };
    }
  }

  // Parse declaration
  const decl = parsed.declaration || {};
  const declaredPages: FunnelPageKey[] = Array.isArray(decl.pages)
    ? decl.pages.filter((k: any) => VALID_PAGE_KEYS.has(k))
    : [];

  const declaration: PageDeclaration = {
    pages: declaredPages,
    rationale: decl.rationale || '',
  };

  // Parse pages
  const pages: Partial<Record<FunnelPageKey, PageSpec>> = {};

  const pagesRaw = parsed.pages || {};

  for (const key of declaredPages) {
    const raw = pagesRaw[key];
    const spec = sanitisePage(raw, key);
    if (spec) pages[key] = spec;
  }

  // Fallback: if declaration is empty but pages exist in the JSON, grab them
  if (declaredPages.length === 0) {
    for (const key of Object.keys(pagesRaw) as FunnelPageKey[]) {
      if (!VALID_PAGE_KEYS.has(key)) continue;
      const spec = sanitisePage(pagesRaw[key], key);
      if (spec) {
        pages[key] = spec;
        declaration.pages.push(key);
      }
    }
  }

  return { declaration, pages };
}

// ─── Legacy shim — kept so hydrateSections callers don't break ───────────────
// The new page.tsx no longer calls this but it's kept for any other consumers.

import type { CopySection, PageCopy } from './offer-types';

export function hydrateSections(pageCopy: PageCopy): CopySection[] {
  if (pageCopy.sections?.length > 0) return pageCopy.sections;
  if (pageCopy.markdown?.trim()) {
    return [{ id: 'BODY', label: 'Page Copy', content: pageCopy.markdown.trim() }];
  }
  return [];
}

// ─── Email sequence parser — unchanged ───────────────────────────────────────

export function parseEmailSequence(raw: string): Array<{
  day: number;
  subject: string;
  preview: string;
  body: string;
}> {
  const emails: Array<{ day: number; subject: string; preview: string; body: string }> = [];
  const emailBlocks = raw.split(/EMAIL \d+ — DAY \d+/i).slice(1);
  const dayMatches = [...raw.matchAll(/EMAIL \d+ — DAY (\d+)/gi)];

  emailBlocks.forEach((block, i) => {
    const day = parseInt(dayMatches[i]?.[1] ?? '0', 10);
    const subject = block.match(/SUBJECT:\s*(.+)/i)?.[1]?.trim() ?? '';
    const preview = block.match(/PREVIEW:\s*(.+)/i)?.[1]?.trim() ?? '';
    const bodyMatch = block.match(/BODY:\s*([\s\S]*?)(?=---|$)/i);
    const body = bodyMatch?.[1]?.trim() ?? '';
    if (subject && body) emails.push({ day, subject, preview, body });
  });

  return emails;
}

// ─── Intel Parser Restoration ────────────────────────────────────────────────

const ALL_SECTIONS = [
  'OFFER_SCORE', 'SCORE_SUMMARY', 'REVENUE_MODEL_ARCHITECTURE', 'PAIN_POINT_MAPPING',
  'FUNNEL_STRUCTURE_BLUEPRINT', 'PRICING_STRATEGY', 'UPSELL_DOWNSELL_PATHS',
  'STRATEGIC_BONUS_RECOMMENDATIONS', 'DESIGN_INTELLIGENCE_RECOMMENDATION',
  'FUNNEL_HEALTH_SCORE', 'PLATFORM_PRIORITY_MATRIX',
  'OFFER_POSITIONING_ANALYSIS', 'TARGET_PERSONA_INTELLIGENCE', 'CONVERSION_HOOK_LIBRARY',
  'MESSAGING_ANGLE_MATRIX', 'PRODUCT_CORE_VALUE_PERCEPTION', 'REAL_WORLD_USE_CASE_SCENARIOS',
  'MONETIZATION_STRATEGY_NARRATIVE',
  'PLATFORM_PRIORITY_NARRATIVE', 'OMNICHANNEL_AD_COPY_MATRIX', 'GOOGLE_ADS_COPY_MATRIX',
  'VSL_UGC_VIDEO_SCRIPT_INTELLIGENCE', 'MEDIA_BUYING_STRATEGY_REPORT', 'TRAFFIC_FUNNEL_ALIGNMENT',
  'COMPETITIVE_ACQUISITION_INTELLIGENCE', 'LAUNCH_SEQUENCE_RECOMMENDATION'
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

  return text.substring(contentStart, nextSectionIndex).trim();
}

export function parseCall1Output(rawText: string): Record<string, string> {
  const sections: Record<string, string> = {};
  for (const sectionName of ALL_SECTIONS) {
    const content = extractSection(rawText, sectionName);
    if (content) {
      sections[sectionName] = content;
    }
  }
  return sections;
}

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

export function parseCall3Output(rawText: string): Call3Output {
  return {
    platform_priority_narrative: extractSection(rawText, 'PLATFORM_PRIORITY_NARRATIVE'),
    omnichannel_ad_copy_matrix: extractSection(rawText, 'OMNICHANNEL_AD_COPY_MATRIX'),
    google_ads_copy_matrix: extractSection(rawText, 'GOOGLE_ADS_COPY_MATRIX'),
    vsl_ugc_video_script_intelligence: extractSection(rawText, 'VSL_UGC_VIDEO_SCRIPT_INTELLIGENCE'),
    media_buying_strategy_report: extractSection(rawText, 'MEDIA_BUYING_STRATEGY_REPORT'),
    traffic_funnel_alignment: extractSection(rawText, 'TRAFFIC_FUNNEL_ALIGNMENT'),
    competitive_acquisition_intelligence: extractSection(rawText, 'COMPETITIVE_ACQUISITION_INTELLIGENCE'),
    launch_sequence_recommendation: extractSection(rawText, 'LAUNCH_SEQUENCE_RECOMMENDATION'),
  };
}