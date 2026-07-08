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
  let parsed: any;
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Strategy 1: direct JSON.parse
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    // Strategy 2: extract JSON object and try repair
    const match = extractJsonObject(cleaned);
    const jsonText = match || cleaned;
    const repaired = repairJsonString(jsonText);

    if (repaired !== jsonText) {
      try {
        parsed = JSON.parse(repaired);
        console.warn('[parseCopyOutput] Repaired AI JSON output and parsed successfully.');
      } catch (repairError) {
        // Strategy 3: regex-based fallback extraction
        console.warn('[parseCopyOutput] Repair failed, attempting regex fallback extraction...', {
          originalError: error?.toString?.() ?? error,
          repairError: repairError?.toString?.() ?? repairError,
        });
        const fallback = extractPagesFromRawText(cleaned);
        if (Object.keys(fallback.pages).length > 0) {
          console.info(`[parseCopyOutput] Regex fallback extracted ${Object.keys(fallback.pages).length} pages successfully.`);
          return fallback;
        }
        console.error('[parseCopyOutput] All parsing strategies failed', {
          error: repairError?.toString?.() ?? repairError,
          originalError: error?.toString?.() ?? error,
        });
        return { declaration: { pages: [], rationale: '' }, pages: {} };
      }
    } else if (match) {
      try {
        parsed = JSON.parse(match);
      } catch (innerError) {
        // Strategy 3: regex-based fallback extraction
        console.warn('[parseCopyOutput] Extracted JSON parse failed, attempting regex fallback...');
        const fallback = extractPagesFromRawText(cleaned);
        if (Object.keys(fallback.pages).length > 0) {
          console.info(`[parseCopyOutput] Regex fallback extracted ${Object.keys(fallback.pages).length} pages successfully.`);
          return fallback;
        }
        console.error('[parseCopyOutput] All parsing strategies failed', {
          error: innerError?.toString?.() ?? innerError,
        });
        return { declaration: { pages: [], rationale: '' }, pages: {} };
      }
    } else {
      // No JSON object found — try regex as last resort
      console.warn('[parseCopyOutput] No JSON object found, attempting regex fallback...');
      const fallback = extractPagesFromRawText(cleaned);
      if (Object.keys(fallback.pages).length > 0) {
        console.info(`[parseCopyOutput] Regex fallback extracted ${Object.keys(fallback.pages).length} pages successfully.`);
        return fallback;
      }
      console.error('[parseCopyOutput] No JSON object found in AI output', {
        error: error?.toString?.() ?? error,
      });
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

function extractJsonObject(rawText: string): string | null {
  const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = cleaned.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let i = start;

  while (i < cleaned.length) {
    const char = cleaned[i];

    // Handle escape sequences inside strings
    if (inString && char === '\\') {
      i += 2; // skip backslash + next char
      continue;
    }

    if (char === '"') {
      if (!inString) {
        inString = true;
        i++;
        continue;
      }
      // Inside a string — check if this is the real end
      // Look at what follows the quote
      let j = i + 1;
      while (j < cleaned.length && (cleaned[j] === ' ' || cleaned[j] === '\t')) j++;
      const nextChar = cleaned[j] || '';

      if (nextChar === ':' || nextChar === ',' || nextChar === '}') {
        inString = false;
      } else if (nextChar === ']') {
        // Check further: is this JSON "]," or "]}" or HTML content like "]</em>"?
        let k = j + 1;
        while (k < cleaned.length && /[\s]/.test(cleaned[k])) k++;
        const afterBracket = cleaned[k] || '';
        if (afterBracket === ',' || afterBracket === '}' || afterBracket === ']' || afterBracket === '') {
          inString = false; // Real JSON array close
        }
        // Otherwise it's HTML content — stay in string
      } else if (nextChar === '' || nextChar === '\n' || nextChar === '\r') {
        inString = false;
      }
      // If none matched, this " is content inside the string — stay in string mode
    }

    if (!inString) {
      if (char === '{') {
        depth += 1;
      } else if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          return cleaned.slice(start, i + 1);
        }
      }
    }

    i++;
  }

  return null;
}

function repairJsonString(rawText: string): string {
  let text = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  let inString = false;
  let result = '';
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    // Handle escape sequences inside strings
    if (inString && char === '\\') {
      result += char;
      i++;
      if (i < text.length) {
        result += text[i];
        i++;
      }
      continue;
    }

    // Escape literal newlines/carriage returns/tabs inside JSON strings
    if (inString && (char === '\n' || char === '\r' || char === '\t')) {
      if (char === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
        result += '\\n';
        i += 2;
      } else if (char === '\n') {
        result += '\\n';
        i++;
      } else {
        result += '\\t';
        i++;
      }
      continue;
    }

    if (char === '"') {
      if (!inString) {
        // Opening a new JSON string
        inString = true;
        result += char;
        i++;
        continue;
      }

      // We're inside a string. Is this " the end of the string or content?
      let j = i + 1;
      while (j < text.length && (text[j] === ' ' || text[j] === '\t')) j++;
      const nextChar = text[j] || '';

      // Definite JSON structural delimiters after a closing quote
      if (nextChar === ':' || nextChar === ',') {
        inString = false;
        result += char;
        i++;
        continue;
      }

      if (nextChar === '}') {
        // Very likely end of JSON object value
        inString = false;
        result += char;
        i++;
        continue;
      }

      if (nextChar === ']') {
        // Could be JSON array close or HTML content like "]</em>"
        // Check what comes AFTER the ]
        let k = j + 1;
        while (k < text.length && /[\s]/.test(text[k])) k++;
        const afterBracket = text[k] || '';
        if (afterBracket === ',' || afterBracket === '}' || afterBracket === ']' || afterBracket === '') {
          // Real JSON array close — end the string
          inString = false;
          result += char;
          i++;
          continue;
        }
        // It's HTML content (e.g. "]</em>") — escape the quote
        result += '\\"';
        i++;
        continue;
      }

      if (nextChar === '' || nextChar === '\n' || nextChar === '\r') {
        // End of text or line break — likely end of string
        inString = false;
        result += char;
        i++;
        continue;
      }

      // Next char is not a JSON delimiter — this is an unescaped quote in content
      result += '\\"';
      i++;
      continue;
    }

    result += char;
    i++;
  }

  return result;
}

// ─── Regex fallback: extract pages from raw text when JSON.parse fails ────────

function unescapeJsonString(s: string): string {
  return s
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\r/g, '\r');
}

function extractPagesFromRawText(rawText: string): CopyOutput {
  const result: CopyOutput = {
    declaration: { pages: [], rationale: '' },
    pages: {},
  };

  // Extract rationale
  const rationaleMatch = rawText.match(/"rationale"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (rationaleMatch) {
    result.declaration.rationale = unescapeJsonString(rationaleMatch[1]);
  }

  const pageKeys: FunnelPageKey[] = ['lead_capture', 'sales_page', 'upsell', 'downsell', 'thankyou'];

  for (let pi = 0; pi < pageKeys.length; pi++) {
    const pageKey = pageKeys[pi];

    // Find "pageKey": { in the raw text
    const keyIdx = rawText.indexOf(`"${pageKey}"`);
    if (keyIdx === -1) continue;

    // Determine the boundary for this page's block
    const blockStart = rawText.indexOf('{', keyIdx);
    if (blockStart === -1) continue;

    // Find the end: look for the next page key, or end of text
    let blockEnd = rawText.length;
    for (let ni = pi + 1; ni < pageKeys.length; ni++) {
      const nextKeyIdx = rawText.indexOf(`"${pageKeys[ni]}"`, blockStart);
      if (nextKeyIdx !== -1) {
        blockEnd = nextKeyIdx;
        break;
      }
    }

    const pageBlock = rawText.slice(blockStart, blockEnd);

    // Extract simple fields using regex
    const titleMatch = pageBlock.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    const title = titleMatch ? unescapeJsonString(titleMatch[1]) : pageKey;

    const scoreMatch = pageBlock.match(/"score"\s*:\s*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 85;

    const wcMatch = pageBlock.match(/"word_count"\s*:\s*(\d+)/);
    const wordCount = wcMatch ? parseInt(wcMatch[1], 10) : 0;

    // Extract HTML content
    // Find "html": " — then take everything until the last unescaped " before }
    const htmlMarker = '"html"';
    const htmlMarkerIdx = pageBlock.indexOf(htmlMarker);
    if (htmlMarkerIdx === -1) continue;

    // Find the opening quote of the html value
    const afterHtmlKey = pageBlock.slice(htmlMarkerIdx + htmlMarker.length);
    const colonQuoteMatch = afterHtmlKey.match(/\s*:\s*"/);
    if (!colonQuoteMatch) continue;

    const htmlContentStart = htmlMarkerIdx + htmlMarker.length + colonQuoteMatch.index! + colonQuoteMatch[0].length;
    const htmlBlock = pageBlock.slice(htmlContentStart);

    // Scan backwards from end to find the closing " of the html value
    // It should be the last " before a } that closes the page object
    let closingQuoteIdx = -1;
    for (let i = htmlBlock.length - 1; i >= 0; i--) {
      if (htmlBlock[i] === '"') {
        // Make sure it's not escaped
        let backslashes = 0;
        let j = i - 1;
        while (j >= 0 && htmlBlock[j] === '\\') {
          backslashes++;
          j--;
        }
        if (backslashes % 2 === 0) {
          closingQuoteIdx = i;
          break;
        }
      }
    }

    const htmlContent = closingQuoteIdx > 0
      ? htmlBlock.slice(0, closingQuoteIdx)
      : htmlBlock.replace(/"\s*}\s*,?\s*$/, '');

    const finalHtml = unescapeJsonString(htmlContent.trim());

    if (finalHtml.length > 0) {
      const wc = wordCount > 0 ? wordCount : countHtmlWords(finalHtml);
      result.pages[pageKey] = {
        key: pageKey,
        title,
        html: finalHtml,
        score,
        word_count: wc,
      };
      result.declaration.pages.push(pageKey);
    }
  }

  if (Object.keys(result.pages).length > 0) {
    console.info('[extractPagesFromRawText] Successfully extracted pages:', result.declaration.pages);
  }

  return result;
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
  'VSL_VIDEO_SCRIPT', 'UGC_VIDEO_SCRIPT'
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

  let extracted = text.substring(contentStart, nextSectionIndex).trim();

  // Clean up any remaining JSON syntax around the extracted block in case of fallback
  extracted = extracted.replace(/^"?[ \t]*:[ \t]*"?/, '');
  extracted = extracted.replace(/(?:\\?"?,?\s*)+$/, '');
  
  // Unescape if needed
  if (extracted.includes('\\"')) {
    extracted = extracted.replace(/\\"/g, '"');
  }
  if (extracted.includes('\\n')) {
    extracted = extracted.replace(/\\n/g, '\n');
  }

  return extracted.trim();
}

export function parseCall1Output(rawText: string): Record<string, string> {
  let parsed: any = {};
  const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = extractJsonObject(cleaned);
    const jsonText = match || cleaned;
    
    // Attempt to repair unescaped quotes inside HTML values
    const repaired = repairJsonString(jsonText);
    if (repaired !== jsonText) {
      try {
        parsed = JSON.parse(repaired);
      } catch (e) {}
    }
    
    if (!parsed || Object.keys(parsed).length === 0) {
      if (match) {
        try {
          parsed = JSON.parse(match);
        } catch {
          console.error('[parseCall1Output] Failed to parse AI JSON output');
        }
      }
    }
  }

  const sections: Record<string, string> = {};
  for (const sectionName of ALL_SECTIONS) {
    if (parsed && typeof parsed === 'object') {
      let val = parsed[sectionName];
      if (val === undefined) val = parsed[sectionName.toLowerCase()];

      if (val !== undefined) {
        if (Array.isArray(val)) {
          sections[sectionName] = val.map(String).join('\n\n');
        } else {
          sections[sectionName] = typeof val === 'object'
            ? JSON.stringify(val, null, 2)
            : String(val);
        }
      } else {
        const fallback = extractSection(rawText, sectionName);
        if (fallback) {
          sections[sectionName] = fallback;
        }
      }
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
    vsl_video_script: parsedMap['VSL_VIDEO_SCRIPT'] || extractSection(rawText, 'VSL_VIDEO_SCRIPT'),
    ugc_video_script: parsedMap['UGC_VIDEO_SCRIPT'] || extractSection(rawText, 'UGC_VIDEO_SCRIPT'),
  };
}