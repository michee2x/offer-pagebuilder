// ─────────────────────────────────────────────────────────────────────────────
// offer-parser — v4
// Parses AI JSON output into CopyOutput (PageDoc / html format).
// Also migrates legacy PageSpec (sections/elements) data to HTML.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CopyOutput,
  PageDoc,
  PageSpec,
  PageSection,
  PageElement,
  FunnelPageKey,
  PageDeclaration,
  Call2Output,
  Call3Output,
  EmailCopy,
  FunnelEmailSequence,
} from './offer-types';

const VALID_PAGE_KEYS = new Set<FunnelPageKey>([
  'lead_capture',
  'sales_page',
  'upsell',
  'downsell',
  'thankyou',
]);

// ─── Count words in an HTML string ───────────────────────────────────────────

function countHtmlWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').filter(Boolean).length : 0;
}

// ─── Migrate a legacy PageSpec (sections/elements) → HTML string ─────────────

function legacySpecToHtml(spec: PageSpec): string {
  const parts: string[] = [];
  for (const section of spec.sections) {
    for (const el of section.elements) {
      switch (el.type) {
        case 'headline':
          parts.push(`<h1>${el.copy ?? ''}</h1>`);
          break;
        case 'subheadline':
          parts.push(el.size === 'sm'
            ? `<h2>${el.copy ?? ''}</h2>`
            : `<h3>${el.copy ?? ''}</h3>`);
          break;
        case 'body_text':
          parts.push(`<p>${el.copy ?? ''}</p>`);
          break;
        case 'bullet_list':
        case 'icon_list':
          if (el.items?.length) {
            parts.push(`<ul>${el.items.map(i => `<li>${i}</li>`).join('')}</ul>`);
          }
          break;
        case 'step_indicator':
          if (el.items?.length) {
            parts.push(`<ol>${el.items.map(i => `<li>${i}</li>`).join('')}</ol>`);
          }
          break;
        case 'testimonial_card':
          parts.push(`<blockquote><p>${el.copy ?? ''}</p>${el.secondary_copy ? `<p><em>— ${el.secondary_copy}</em></p>` : ''}</blockquote>`);
          break;
        case 'testimonial_grid':
          if (el.items?.length) {
            el.items.forEach(item => {
              parts.push(`<blockquote><p>${item}</p></blockquote>`);
            });
          }
          break;
        case 'social_proof_bar':
        case 'avatar_stack':
          parts.push(`<blockquote>${el.copy ?? ''}</blockquote>`);
          break;
        case 'price_block':
          parts.push(`<h3>${el.copy ?? ''}</h3>`);
          if (el.secondary_copy) parts.push(`<p>${el.secondary_copy}</p>`);
          break;
        case 'guarantee_badge':
          parts.push(`<blockquote>🛡️ ${el.copy ?? ''}</blockquote>`);
          break;
        case 'cta_button':
          parts.push(`<p><em>[🔘 Button: ${el.copy ?? 'Click Here'}]</em></p>`);
          if (el.secondary_copy) parts.push(`<p><em>${el.secondary_copy}</em></p>`);
          break;
        case 'video_placeholder':
          parts.push(`<p><em>[▶️ Video: ${el.placeholder_label ?? 'Video goes here'}]</em></p>`);
          break;
        case 'image_placeholder':
          parts.push(`<p><em>[📷 Image: ${el.placeholder_label ?? 'Image goes here'}]</em></p>`);
          break;
        case 'form_input':
          parts.push(`<p><em>[📧 Form: ${el.copy ?? 'Enter your email'}]</em></p>`);
          break;
        case 'countdown_timer':
          parts.push(`<p><em>[⏱️ Countdown: ${el.copy ?? 'Offer expires in:'}]</em></p>`);
          break;
        case 'divider':
          parts.push('<hr>');
          break;
        case 'nav_logo':
          parts.push(`<h3>${el.copy ?? ''}</h3>`);
          break;
        case 'nav_links':
        case 'countdown_timer':
          // skip nav/timer — editor doesn't need raw nav
          break;
        default:
          if (el.copy) parts.push(`<p>${el.copy}</p>`);
      }
    }
  }
  return parts.join('');
}

// ─── Parse a single page from AI output into PageDoc ─────────────────────────

function parsePageDoc(raw: any, key: FunnelPageKey): PageDoc | null {
  if (!raw || typeof raw !== 'object') return null;

  // New format: page has an `html` field
  if (typeof raw.html === 'string' && raw.html.trim()) {
    const html = raw.html.trim();
    return {
      key,
      title: raw.title || key,
      html,
      score: typeof raw.score === 'number' ? raw.score : 85,
      word_count: typeof raw.word_count === 'number' && raw.word_count > 0
        ? raw.word_count
        : countHtmlWords(html),
    };
  }

  // Legacy format: page has `sections` array — migrate to HTML
  if (Array.isArray(raw.sections) && raw.sections.length > 0) {
    const legacySpec = sanitiseLegacySpec(raw, key);
    if (!legacySpec) return null;
    const html = legacySpecToHtml(legacySpec);
    return {
      key,
      title: raw.title || key,
      html,
      score: typeof raw.score === 'number' ? raw.score : 85,
      word_count: countHtmlWords(html),
    };
  }

  return null;
}

// ─── Sanitise a legacy PageSpec ───────────────────────────────────────────────

function sanitiseLegacySpec(raw: any, key: FunnelPageKey): PageSpec | null {
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
  return {
    key,
    title: raw.title || key,
    sections,
    score: typeof raw.score === 'number' ? raw.score : 85,
    word_count: 0,
  };
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
  } catch {
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

  const pages: Partial<Record<FunnelPageKey, PageDoc>> = {};
  const pagesRaw = parsed.pages || {};

  for (const key of declaredPages) {
    const doc = parsePageDoc(pagesRaw[key], key);
    if (doc) pages[key] = doc;
  }

  // Fallback: declaration is empty but pages exist
  if (declaredPages.length === 0) {
    for (const key of Object.keys(pagesRaw) as FunnelPageKey[]) {
      if (!VALID_PAGE_KEYS.has(key)) continue;
      const doc = parsePageDoc(pagesRaw[key], key);
      if (doc) {
        pages[key] = doc;
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

// ─── Email sequence parser — per-page format ─────────────────────────────────

export const EMAIL_SEQUENCE_MIN_PER_PAGE = 2;
export const EMAIL_SEQUENCE_MAX_PER_PAGE = 3;

/** Trim each page section to the allowed 2–3 email range. */
export function clampEmailSequence(sequence: FunnelEmailSequence): FunnelEmailSequence {
  const result: FunnelEmailSequence = {};
  for (const [key, emails] of Object.entries(sequence)) {
    if (!emails?.length) continue;
    const pageKey = key as FunnelPageKey;
    if (!VALID_PAGE_KEYS.has(pageKey)) continue;
    result[pageKey] = emails.slice(0, EMAIL_SEQUENCE_MAX_PER_PAGE);
  }
  return result;
}

const PAGE_KEY_MAP: Record<string, FunnelPageKey> = {
  LEAD_CAPTURE: 'lead_capture',
  SALES_PAGE: 'sales_page',
  UPSELL: 'upsell',
  DOWNSELL: 'downsell',
  THANKYOU: 'thankyou',
};

/**
 * Parse the new per-page email sequence format.
 * Expected AI output has page headers like `=== LEAD_CAPTURE ===`
 * followed by EMAIL blocks within each section.
 */
export function parseEmailSequenceV2(raw: string): FunnelEmailSequence {
  const result: FunnelEmailSequence = {};

  // Split by page headers
  const pageBlocks = raw.split(/===\s*(LEAD_CAPTURE|SALES_PAGE|UPSELL|DOWNSELL|THANKYOU)\s*===/i);

  // pageBlocks: [preamble, PAGE_KEY, content, PAGE_KEY, content, ...]
  for (let i = 1; i < pageBlocks.length; i += 2) {
    const rawKey = pageBlocks[i].toUpperCase().trim();
    const pageKey = PAGE_KEY_MAP[rawKey];
    if (!pageKey) continue;

    const content = pageBlocks[i + 1] || '';
    const emails = parseEmailBlocksFromContent(content, pageKey);
    if (emails.length > 0) {
      result[pageKey] = emails.slice(0, EMAIL_SEQUENCE_MAX_PER_PAGE);
    }
  }

  return result;
}

/**
 * Parse EMAIL blocks within a single page section.
 * Supports both new HTML: format and legacy BODY: format.
 */
function parseEmailBlocksFromContent(content: string, pageKey: FunnelPageKey): EmailCopy[] {
  const emails: EmailCopy[] = [];
  const emailBlocks = content.split(/EMAIL\s+\d+\s*(?:—|–|-)\s*DAY\s+\d+/i).slice(1);
  const dayMatches = [...content.matchAll(/EMAIL\s+(\d+)\s*(?:—|–|-)\s*DAY\s+(\d+)/gi)];

  emailBlocks.forEach((block, i) => {
    const emailNum = parseInt(dayMatches[i]?.[1] ?? '0', 10);
    const day = parseInt(dayMatches[i]?.[2] ?? '0', 10);
    const subject = block.match(/SUBJECT:\s*(.+)/i)?.[1]?.trim() ?? '';
    const preview = block.match(/PREVIEW:\s*(.+)/i)?.[1]?.trim() ?? '';

    // Try HTML: format first
    const htmlMatch = block.match(/HTML:\s*([\s\S]*?<html[\s\S]*?<\/html>)/i);
    const html = htmlMatch?.[1]?.trim() ?? '';
    let body = '';
    let cta = '';

    if (html) {
      // Extract plain text body from HTML for the text copy mode
      body = extractPlainTextFromHtml(html);
      // Extract CTA text from the HTML
      const ctaMatch = html.match(/<a\b[^>]*style="[^"]*background-color[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
      cta = ctaMatch?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '';
    } else {
      // Fallback: legacy BODY: format
      const bodyMatch = block.match(/BODY:\s*([\s\S]*?)(?=---|CTA:|$)/i);
      body = bodyMatch?.[1]?.trim() ?? '';
      cta = block.match(/CTA:\s*(.+)/i)?.[1]?.trim() ?? '';
    }

    if (subject && (body || html)) {
      emails.push({
        day,
        subject,
        preview,
        body,
        html: html || undefined,
        page: pageKey,
        order: emailNum || i + 1,
        cta: cta || undefined,
      });
    }
  });

  return emails;
}

/**
 * Extract readable plain text from an HTML email string.
 * Used to populate the text copy fields from AI-generated HTML.
 */
function extractPlainTextFromHtml(html: string): string {
  // Remove everything outside <body>
  const bodyContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  // Remove hidden preheader divs
  let text = bodyContent.replace(/<div[^>]*display:\s*none[^>]*>[\s\S]*?<\/div>/gi, '');
  // Remove the footer row (unsubscribe etc)
  text = text.replace(/<tr>\s*<td[^>]*border-top[^>]*>[\s\S]*?<\/td>\s*<\/tr>/gi, '');
  // Convert <br> and </p> to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  // Remove CTA links (we extract those separately)
  text = text.replace(/<a\b[^>]*style="[^"]*background-color[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '');
  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');
  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
  // Clean up whitespace
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  return text;
}

/**
 * Legacy flat parser — kept as fallback for old-format AI output.
 */
export function parseEmailSequence(raw: string): EmailCopy[] {
  // Try v2 format first
  if (/===\s*(LEAD_CAPTURE|SALES_PAGE|UPSELL|DOWNSELL|THANKYOU)\s*===/i.test(raw)) {
    const perPage = parseEmailSequenceV2(raw);
    // Flatten all pages into a single array for backward-compatible callers
    const flat: EmailCopy[] = [];
    for (const emails of Object.values(perPage)) {
      if (emails) flat.push(...emails);
    }
    return flat;
  }

  // Old flat format
  const emails: EmailCopy[] = [];
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

/**
 * Migrate a legacy flat EmailCopy[] into FunnelEmailSequence.
 * All emails are assigned to lead_capture since we can't infer the page.
 */
export function migrateFlatEmailSequence(flat: EmailCopy[]): FunnelEmailSequence {
  if (!flat || flat.length === 0) return {};

  // If emails already have page keys, group them
  const hasPages = flat.some(e => e.page);
  if (hasPages) {
    const grouped: FunnelEmailSequence = {};
    for (const email of flat) {
      const key = email.page || 'lead_capture';
      if (!grouped[key]) grouped[key] = [];
      grouped[key]!.push(email);
    }
    return grouped;
  }

  // No page keys — assign all to lead_capture
  return {
    lead_capture: flat.map((e, i) => ({
      ...e,
      page: 'lead_capture' as FunnelPageKey,
      order: i + 1,
    })),
  };
}

// ─── Intel Parser Restoration ────────────────────────────────────────────────

const ALL_SECTIONS = [
  'OFFER_SCORE', 'SCORE_SUMMARY', 'REVENUE_MODEL_ARCHITECTURE', 'PAIN_POINT_MAPPING',
  'FUNNEL_STRUCTURE_BLUEPRINT',
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
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: any = {};
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        console.error('[parseCall1Output] Failed to parse AI JSON output');
      }
    }
  }

  const sections: Record<string, string> = {};
  for (const sectionName of ALL_SECTIONS) {
    if (parsed && typeof parsed === 'object' && parsed[sectionName] !== undefined) {
      sections[sectionName] = typeof parsed[sectionName] === 'object'
        ? JSON.stringify(parsed[sectionName], null, 2)
        : String(parsed[sectionName]);
    } else {
      const fallback = extractSection(rawText, sectionName);
      if (fallback) {
        sections[sectionName] = fallback;
      }
    }
  }
  return sections;
}

export function parseCall2Output(rawText: string): Call2Output {
  const parsedMap = parseCall1Output(rawText);
  return {
    offer_positioning_analysis: parsedMap['OFFER_POSITIONING_ANALYSIS'] || extractSection(rawText, 'OFFER_POSITIONING_ANALYSIS'),
    target_persona_intelligence: parsedMap['TARGET_PERSONA_INTELLIGENCE'] || extractSection(rawText, 'TARGET_PERSONA_INTELLIGENCE'),
    conversion_hook_library: parsedMap['CONVERSION_HOOK_LIBRARY'] || extractSection(rawText, 'CONVERSION_HOOK_LIBRARY'),
    messaging_angle_matrix: parsedMap['MESSAGING_ANGLE_MATRIX'] || extractSection(rawText, 'MESSAGING_ANGLE_MATRIX'),
    product_core_value_perception: parsedMap['PRODUCT_CORE_VALUE_PERCEPTION'] || extractSection(rawText, 'PRODUCT_CORE_VALUE_PERCEPTION'),
    real_world_use_case_scenarios: parsedMap['REAL_WORLD_USE_CASE_SCENARIOS'] || extractSection(rawText, 'REAL_WORLD_USE_CASE_SCENARIOS'),
    monetization_strategy_narrative: parsedMap['MONETIZATION_STRATEGY_NARRATIVE'] || extractSection(rawText, 'MONETIZATION_STRATEGY_NARRATIVE'),
  };
}

export function parseCall3Output(rawText: string): Call3Output {
  const parsedMap = parseCall1Output(rawText);
  return {
    platform_priority_narrative: parsedMap['PLATFORM_PRIORITY_NARRATIVE'] || extractSection(rawText, 'PLATFORM_PRIORITY_NARRATIVE'),
    omnichannel_ad_copy_matrix: parsedMap['OMNICHANNEL_AD_COPY_MATRIX'] || extractSection(rawText, 'OMNICHANNEL_AD_COPY_MATRIX'),
    google_ads_copy_matrix: parsedMap['GOOGLE_ADS_COPY_MATRIX'] || extractSection(rawText, 'GOOGLE_ADS_COPY_MATRIX'),
    vsl_ugc_video_script_intelligence: parsedMap['VSL_UGC_VIDEO_SCRIPT_INTELLIGENCE'] || extractSection(rawText, 'VSL_UGC_VIDEO_SCRIPT_INTELLIGENCE'),
    media_buying_strategy_report: parsedMap['MEDIA_BUYING_STRATEGY_REPORT'] || extractSection(rawText, 'MEDIA_BUYING_STRATEGY_REPORT'),
    traffic_funnel_alignment: parsedMap['TRAFFIC_FUNNEL_ALIGNMENT'] || extractSection(rawText, 'TRAFFIC_FUNNEL_ALIGNMENT'),
    competitive_acquisition_intelligence: parsedMap['COMPETITIVE_ACQUISITION_INTELLIGENCE'] || extractSection(rawText, 'COMPETITIVE_ACQUISITION_INTELLIGENCE'),
    launch_sequence_recommendation: parsedMap['LAUNCH_SEQUENCE_RECOMMENDATION'] || extractSection(rawText, 'LAUNCH_SEQUENCE_RECOMMENDATION'),
  };
}