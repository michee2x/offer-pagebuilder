/**
 * Scans a component's props to find which prop key contains a specific image src URL.
 * Handles both direct string props and nested array items (e.g. features[].imageUrl).
 */

export interface DirectPropMatch {
  type: 'direct';
  key: string;
}

export interface NestedPropMatch {
  type: 'nested';
  /** Top-level array prop key (e.g. "features") */
  key: string;
  /** Index within the array */
  index: number;
  /** Field name inside the array item (e.g. "imageUrl") */
  nestedKey: string;
  /** The full current array value, so callers can splice & update */
  fullArray: any[];
}

export type ImagePropMatch = DirectPropMatch | NestedPropMatch | null;

/** Strip query-string and origins so DOM absolute URLs match relative local props. */
function normalizeSrc(src: string): string {
  try {
    // If it's a full URL, extract just the pathname
    if (src.startsWith('http')) {
      return new URL(src).pathname;
    }
    // If it's relative, just strip query strings and fragments
    return src.split('?')[0].split('#')[0];
  } catch {
    return src;
  }
}

export function findImagePropMatch(
  props: Record<string, any>,
  rawSrc: string
): ImagePropMatch {
  const targetNorm = normalizeSrc(rawSrc);

  console.log('[findImagePropMatch] rawSrc:', rawSrc);
  console.log('[findImagePropMatch] targetNorm:', targetNorm);

  for (const [key, value] of Object.entries(props)) {
    // ── Direct string prop ──────────────────────────────────────────────────
    if (typeof value === 'string') {
      const valNorm = normalizeSrc(value);
      if (valNorm === targetNorm || value === rawSrc) {
        console.log(`[findImagePropMatch] MATCH direct property: ${key}`);
        return { type: 'direct', key };
      }
    }

    // ── Array of objects (e.g. features, contentItems) ────────────────────
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (item && typeof item === 'object') {
          for (const [nestedKey, nestedVal] of Object.entries(item)) {
            if (typeof nestedVal === 'string') {
              const valNorm = normalizeSrc(nestedVal);
              if (valNorm === targetNorm || nestedVal === rawSrc) {
                console.log(`[findImagePropMatch] MATCH nested property: ${key}[${i}].${nestedKey}`);
                return { type: 'nested', key, index: i, nestedKey, fullArray: value };
              }
            }
          }
        }
      }
    }
  }

  console.log('[findImagePropMatch] NO MATCH FOUND!');
  return null;
}
