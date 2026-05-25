// ─────────────────────────────────────────────────────────────────────────────
// email-html-extractor.ts
// Client-side utility to extract copyable text sections from HTML emails.
// Uses DOMParser (browser API) for accurate DOM traversal.
// ─────────────────────────────────────────────────────────────────────────────

export interface ExtractedEmailSections {
  /** From <title> tag or passed subject */
  subject: string;
  /** From hidden preheader div */
  preheader: string;
  /** From <h1> or first heading element */
  heading: string;
  /** Body text paragraphs joined */
  body: string;
  /** CTA button text */
  cta: string;
  /** CTA link URL */
  ctaUrl: string;
  /** Full email as clean plain text */
  fullPlainText: string;
}

/**
 * Extract structured, copyable text sections from an HTML email string.
 * Designed to run in the browser (uses DOMParser).
 */
export function extractEmailSections(
  html: string,
  fallbackSubject?: string
): ExtractedEmailSections {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // ── Subject ──
  const titleEl = doc.querySelector('title');
  const subject = titleEl?.textContent?.trim() || fallbackSubject || '';

  // ── Preheader (hidden div with display:none) ──
  let preheader = '';
  const allDivs = doc.querySelectorAll('div');
  for (const div of allDivs) {
    const style = div.getAttribute('style') || '';
    if (style.includes('display:none') || style.includes('display: none')) {
      preheader = div.textContent?.trim() || '';
      break;
    }
  }

  // ── Heading (first h1, then h2, then h3) ──
  const h1 = doc.querySelector('h1');
  const h2 = doc.querySelector('h2');
  const h3 = doc.querySelector('h3');
  const heading = h1?.textContent?.trim() || h2?.textContent?.trim() || h3?.textContent?.trim() || '';

  // ── CTA (link styled as button — has background-color in inline style) ──
  let cta = '';
  let ctaUrl = '';
  const allLinks = doc.querySelectorAll('a');
  for (const link of allLinks) {
    const style = link.getAttribute('style') || '';
    if (style.includes('background-color')) {
      cta = link.textContent?.trim() || '';
      ctaUrl = link.getAttribute('href') || '';
      break;
    }
  }

  // ── Body paragraphs ──
  // Collect text from <p> tags and <td> elements that contain body content.
  // Exclude: title, preheader, heading, CTA, footer.
  const bodyParts: string[] = [];

  // Strategy: find all <p> tags in the body content area
  const allP = doc.querySelectorAll('p');
  for (const p of allP) {
    const text = p.textContent?.trim() || '';
    if (!text) continue;
    // Skip if it's the preheader text
    if (text === preheader) continue;
    // Skip if it's in a footer-like context (very short text with "unsubscribe")
    if (text.toLowerCase().includes('unsubscribe')) continue;
    bodyParts.push(text);
  }

  // If no <p> tags found, try extracting from <td> elements
  if (bodyParts.length === 0) {
    const allTd = doc.querySelectorAll('td');
    for (const td of allTd) {
      const style = td.getAttribute('style') || '';
      // Look for content cells (typically have font-size in the 14-16px range)
      if (style.includes('font-size:15px') || style.includes('font-size:14px') || style.includes('font-size:16px') || style.includes('line-height:1.8')) {
        const text = td.textContent?.trim() || '';
        if (text && text !== heading && text !== cta && !text.toLowerCase().includes('unsubscribe')) {
          bodyParts.push(text);
        }
      }
    }
  }

  const body = bodyParts.join('\n\n');

  // ── Full plain text ──
  const fullParts: string[] = [];
  if (subject) fullParts.push(`Subject: ${subject}`);
  if (preheader) fullParts.push(`Preview: ${preheader}`);
  if (heading) fullParts.push(`\n${heading}`);
  if (body) fullParts.push(`\n${body}`);
  if (cta) fullParts.push(`\n[${cta}]`);
  const fullPlainText = fullParts.join('\n');

  return {
    subject,
    preheader,
    heading,
    body,
    cta,
    ctaUrl,
    fullPlainText,
  };
}

/**
 * Generate a basic HTML email wrapper for legacy plain-text emails.
 * Used when an email has a `body` but no `html` field.
 */
export function wrapPlainTextAsHtml(
  subject: string,
  preview: string,
  body: string,
  cta?: string
): string {
  // Convert plain text newlines to <p> tags
  const paragraphs = body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.8;color:#3c3c4a;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  const ctaHtml = cta
    ? `<tr><td align="center" style="padding:8px 40px 32px 40px;">
<a href="#" style="display:inline-block;background-color:#4f46e5;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;">${escapeHtml(cta)}</a>
</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="padding:32px 40px 0 40px;">
<h1 style="margin:0;font-size:22px;line-height:1.4;color:#1a1a2e;font-weight:700;">${escapeHtml(subject)}</h1>
</td></tr>
<tr><td style="padding:24px 40px;font-size:15px;line-height:1.8;color:#3c3c4a;">
${paragraphs}
</td></tr>
${ctaHtml}
<tr><td style="padding:24px 40px;border-top:1px solid #e8e8ed;font-size:12px;color:#8c8c9a;text-align:center;">
You received this email based on your interest. <a href="#" style="color:#4f46e5;text-decoration:underline;">Unsubscribe</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
