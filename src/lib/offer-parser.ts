// ─────────────────────────────────────────────────────────────────────────────
// OfferIQ — Text parser for AI stream output
// Extracts named sections from the structured text format
// ─────────────────────────────────────────────────────────────────────────────

import type { CopyOutput, PageCopy, EmailCopy, Call2Output } from './offer-types';

// ─────────────────────────────────────────────────────────────────────────────
// Generic section extractor
// ─────────────────────────────────────────────────────────────────────────────

const ALL_SECTIONS = [
  'OFFER_SCORE', 'SCORE_SUMMARY', 'REVENUE_MODEL_ARCHITECTURE', 'PAIN_POINT_MAPPING',
  'FUNNEL_STRUCTURE_BLUEPRINT', 'PRICING_STRATEGY', 'UPSELL_DOWNSELL_PATHS',
  'STRATEGIC_BONUS_RECOMMENDATIONS', 'DESIGN_INTELLIGENCE_RECOMMENDATION',
  'PLATFORM_PRIORITY_MATRIX',
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
    // Removed console.log for cleaner output
  } else {
    // Removed console.warn for cleaner output
  }

  return result;
}

// Call 1 parser
// ─────────────────────────────────────────────────────────────────────────────

export function parseCall1Output(rawText: string): Record<string, string> {
  const sections: Record<string, string> = {};

  // Extract all sections into key-value pairs
  for (const sectionName of ALL_SECTIONS) {
    const content = extractSection(rawText, sectionName);
    if (content) {
      sections[sectionName] = content;
    }
  }

  return sections;
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
  // Removed console.log for cleaner output
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

  // Removed console.log for cleaner output
  return emails;
}

export function parseEmailSequence(text: string): EmailCopy[] {
  const emails: EmailCopy[] = [];
  // Split by "EMAIL N" markers to get individual email blocks
  const emailBlocks = text.split(/(?=EMAIL\s+\d+)/gi).filter(b => b.trim().length > 20);

  for (const block of emailBlocks) {
    const dayMatch = block.match(/DAY\s+(\d+)/i);
    const subjectMatch = block.match(/SUBJECT:\s*(.*)/i);
    const previewMatch = block.match(/PREVIEW:\s*(.*)/i);
    // Body is from BODY: to the separator --- or the next EMAIL or end
    const bodyMatch = block.match(/BODY:\s*\n?([\s\S]*?)(?=\n?---\s*|\n?EMAIL\s+\d+|$)/i);

    if (dayMatch && subjectMatch && bodyMatch) {
      emails.push({
        day: parseInt(dayMatch[1]),
        subject: subjectMatch[1].trim().replace(/^\[|\]$/g, ''), // remove optional brackets
        preview: previewMatch ? previewMatch[1].trim().replace(/^\[|\]$/g, '') : '',
        body: bodyMatch[1].trim(),
      });
    }
  }

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
