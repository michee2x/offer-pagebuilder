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
    ? `<tr><td align="center" style="padding:8px 40px 32px 40px;" class="email-padding">
<a href="#" style="display:inline-block;background-color:#4f46e5;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;">${escapeHtml(cta)}</a>
</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(subject)}</title>
<style>
  @media only screen and (max-width: 600px) {
    .email-container {
      width: 100% !important;
    }
    .email-padding {
      padding-left: 20px !important;
      padding-right: 20px !important;
    }
    h1 {
      font-size: 18px !important;
    }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;">
<tr><td align="center" style="padding:40px 20px;" class="email-padding">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="padding:32px 40px 0 40px;" class="email-padding">
<h1 style="margin:0;font-size:22px;line-height:1.4;color:#1a1a2e;font-weight:700;">${escapeHtml(subject)}</h1>
</td></tr>
<tr><td style="padding:24px 40px;font-size:15px;line-height:1.8;color:#3c3c4a;" class="email-padding">
${paragraphs}
</td></tr>
${ctaHtml}
<tr><td style="padding:24px 40px;border-top:1px solid #e8e8ed;font-size:12px;color:#8c8c9a;text-align:center;" class="email-padding">
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

/**
 * Update a specific field in the HTML email and return the updated HTML string.
 */
export function updateEmailHtml(
  html: string,
  field: 'subject' | 'preview' | 'heading' | 'body' | 'cta',
  value: string
): string {
  if (typeof window === 'undefined') return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  if (field === 'subject') {
    const titleEl = doc.querySelector('title');
    if (titleEl) {
      titleEl.textContent = value;
    } else {
      const head = doc.querySelector('head') || doc.documentElement;
      const newTitle = doc.createElement('title');
      newTitle.textContent = value;
      head.appendChild(newTitle);
    }
  } else if (field === 'preview') {
    let preheaderEl: HTMLDivElement | null = null;
    const allDivs = doc.querySelectorAll('div');
    for (const div of allDivs) {
      const style = div.getAttribute('style') || '';
      if (style.includes('display:none') || style.includes('display: none')) {
        preheaderEl = div;
        break;
      }
    }
    if (preheaderEl) {
      preheaderEl.textContent = value;
    } else {
      const bodyEl = doc.querySelector('body');
      if (bodyEl) {
        const div = doc.createElement('div');
        div.setAttribute('style', 'display:none;max-height:0;overflow:hidden;');
        div.textContent = value;
        bodyEl.insertBefore(div, bodyEl.firstChild);
      }
    }
  } else if (field === 'heading') {
    const headingEl = doc.querySelector('h1') || doc.querySelector('h2') || doc.querySelector('h3');
    if (headingEl) {
      headingEl.textContent = value;
    }
  } else if (field === 'cta') {
    let ctaEl: HTMLAnchorElement | null = null;
    const allLinks = doc.querySelectorAll('a');
    for (const link of allLinks) {
      const style = link.getAttribute('style') || '';
      if (style.includes('background-color')) {
        ctaEl = link;
        break;
      }
    }
    if (ctaEl) {
      ctaEl.textContent = value;
    }
  } else if (field === 'body') {
    // Determine preheader text to avoid replacing it
    let preheaderText = '';
    const allDivs = doc.querySelectorAll('div');
    for (const div of allDivs) {
      const style = div.getAttribute('style') || '';
      if (style.includes('display:none') || style.includes('display: none')) {
        preheaderText = div.textContent?.trim() || '';
        break;
      }
    }

    const bodyPElements: HTMLParagraphElement[] = [];
    const allP = doc.querySelectorAll('p');
    for (const p of allP) {
      const text = p.textContent?.trim() || '';
      if (!text) continue;
      if (text === preheaderText) continue;
      if (text.toLowerCase().includes('unsubscribe')) continue;
      bodyPElements.push(p);
    }

    const newParagraphs = value
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    let baseStyle = 'margin:0 0 16px 0;font-size:15px;line-height:1.8;color:#3c3c4a;';
    if (bodyPElements.length > 0) {
      baseStyle = bodyPElements[0].getAttribute('style') || baseStyle;
      const parent = bodyPElements[0].parentElement;
      if (parent) {
        // Create new paragraph elements
        const newElements: HTMLParagraphElement[] = [];
        for (const pText of newParagraphs) {
          const pEl = doc.createElement('p');
          pEl.setAttribute('style', baseStyle);
          const lines = pText.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (i > 0) {
              pEl.appendChild(doc.createElement('br'));
            }
            pEl.appendChild(doc.createTextNode(lines[i]));
          }
          newElements.push(pEl);
        }

        // Insert new elements before the first old body paragraph
        const firstOld = bodyPElements[0];
        for (const newEl of newElements) {
          parent.insertBefore(newEl, firstOld);
        }

        // Remove all old body paragraph elements
        for (const oldEl of bodyPElements) {
          oldEl.remove();
        }
      }
    } else {
      // Fallback: search for td content
      const allTd = Array.from(doc.querySelectorAll('td'));
      let targetTd: HTMLTableCellElement | null = null;
      for (const td of allTd) {
        const style = td.getAttribute('style') || '';
        if (style.includes('font-size:15px') || style.includes('font-size:14px') || style.includes('font-size:16px') || style.includes('line-height:1.8')) {
          const text = td.textContent?.trim() || '';
          if (text && !text.toLowerCase().includes('unsubscribe')) {
            targetTd = td;
            break;
          }
        }
      }

      if (targetTd) {
        targetTd.innerHTML = '';
        for (const pText of newParagraphs) {
          const pEl = doc.createElement('p');
          pEl.setAttribute('style', 'margin:0 0 16px 0;font-size:15px;line-height:1.8;color:#3c3c4a;');
          const lines = pText.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (i > 0) {
              pEl.appendChild(doc.createElement('br'));
            }
            pEl.appendChild(doc.createTextNode(lines[i]));
          }
          targetTd.appendChild(pEl);
        }
      }
    }
  }

  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
}
