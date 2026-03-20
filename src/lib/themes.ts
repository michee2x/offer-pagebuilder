// ─────────────────────────────────────────────────────────────────────────────
// themes.ts  —  OfferIQ Theme System (shadcn CSS variable format)
//
// Each theme is a set of shadcn CSS variable values in HSL (no hsl() wrapper).
// Applied as scoped CSS vars on the canvas element — builder UI is unaffected.
// ─────────────────────────────────────────────────────────────────────────────

export interface ShadcnThemeVars {
  background: string;
  foreground: string;
  card: string;
  'card-foreground': string;
  popover: string;
  'popover-foreground': string;
  primary: string;
  'primary-foreground': string;
  secondary: string;
  'secondary-foreground': string;
  muted: string;
  'muted-foreground': string;
  accent: string;
  'accent-foreground': string;
  destructive: string;
  'destructive-foreground': string;
  border: string;
  input: string;
  ring: string;
  radius: string;
}

export interface ShadcnTheme {
  id: string;
  name: string;
  category: 'dark' | 'light';
  headingFont: string;
  bodyFont: string;
  googleFontsUrl: string;
  vars: ShadcnThemeVars;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5 CURATED THEMES
// ─────────────────────────────────────────────────────────────────────────────

export const SHADCN_THEMES: Record<string, ShadcnTheme> = {

  // ── 1. DARK TECH (Violet SaaS — the "Vercel/Linear" look) ─────────────────
  'dark-tech': {
    id: 'dark-tech',
    name: 'Dark Tech',
    category: 'dark',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap',
    vars: {
      background: '240 10% 3.9%',
      foreground: '0 0% 98%',
      card: '240 10% 8%',
      'card-foreground': '0 0% 98%',
      popover: '240 10% 8%',
      'popover-foreground': '0 0% 98%',
      primary: '263 70% 58%',       // violet
      'primary-foreground': '0 0% 100%',
      secondary: '240 5% 16%',
      'secondary-foreground': '0 0% 98%',
      muted: '240 5% 14%',
      'muted-foreground': '240 5% 65%',
      accent: '263 70% 18%',
      'accent-foreground': '0 0% 98%',
      destructive: '0 62.8% 50%',
      'destructive-foreground': '0 0% 98%',
      border: '240 5% 16%',
      input: '240 5% 16%',
      ring: '263 70% 58%',
      radius: '0.625rem',
    },
  },

  // ── 2. LUXURY GOLD (Dark gold — coaching, consulting, high-ticket) ─────────
  'luxury-gold': {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    category: 'dark',
    headingFont: 'Playfair Display',
    bodyFont: 'Lato',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&display=swap',
    vars: {
      background: '36 90% 3%',
      foreground: '45 90% 95%',
      card: '36 60% 8%',
      'card-foreground': '45 90% 95%',
      popover: '36 60% 8%',
      'popover-foreground': '45 90% 95%',
      primary: '43 89% 45%',        // gold
      'primary-foreground': '36 90% 3%',
      secondary: '36 45% 14%',
      'secondary-foreground': '45 90% 95%',
      muted: '36 40% 12%',
      'muted-foreground': '40 30% 60%',
      accent: '43 89% 20%',
      'accent-foreground': '45 90% 95%',
      destructive: '0 62.8% 50%',
      'destructive-foreground': '0 0% 98%',
      border: '36 40% 18%',
      input: '36 40% 18%',
      ring: '43 89% 45%',
      radius: '0.375rem',
    },
  },

  // ── 3. CLEAN LIGHT (White/Blue SaaS — B2B, professional, corporate) ───────
  'clean-professional': {
    id: 'clean-professional',
    name: 'Clean Professional',
    category: 'light',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap',
    vars: {
      background: '0 0% 100%',
      foreground: '222 47% 11%',
      card: '0 0% 100%',
      'card-foreground': '222 47% 11%',
      popover: '0 0% 100%',
      'popover-foreground': '222 47% 11%',
      primary: '221 83% 53%',       // blue
      'primary-foreground': '0 0% 100%',
      secondary: '210 40% 96%',
      'secondary-foreground': '222 47% 11%',
      muted: '210 40% 97%',
      'muted-foreground': '215 16% 47%',
      accent: '210 40% 93%',
      'accent-foreground': '222 47% 11%',
      destructive: '0 72% 51%',
      'destructive-foreground': '0 0% 100%',
      border: '214 32% 91%',
      input: '214 32% 91%',
      ring: '221 83% 53%',
      radius: '0.5rem',
    },
  },

  // ── 4. ROSE PINK (Feminine, beauty, lifestyle, relationships) ─────────────
  'rose-elegant': {
    id: 'rose-elegant',
    name: 'Rose Elegant',
    category: 'light',
    headingFont: 'Cormorant Garamond',
    bodyFont: 'DM Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap',
    vars: {
      background: '0 0% 100%',
      foreground: '240 10% 15%',
      card: '0 0% 100%',
      'card-foreground': '240 10% 15%',
      popover: '0 0% 100%',
      'popover-foreground': '240 10% 15%',
      primary: '336 80% 45%',       // rose/crimson
      'primary-foreground': '0 0% 100%',
      secondary: '330 30% 96%',
      'secondary-foreground': '240 10% 15%',
      muted: '330 20% 96%',
      'muted-foreground': '240 4% 46%',
      accent: '330 60% 93%',
      'accent-foreground': '240 10% 15%',
      destructive: '0 72% 51%',
      'destructive-foreground': '0 0% 100%',
      border: '330 20% 88%',
      input: '330 20% 88%',
      ring: '336 80% 45%',
      radius: '1rem',
    },
  },

  // ── 5. EMERALD (Health, wellness, natural, organic) ───────────────────────
  'health-emerald': {
    id: 'health-emerald',
    name: 'Health Emerald',
    category: 'light',
    headingFont: 'DM Serif Display',
    bodyFont: 'DM Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap',
    vars: {
      background: '138 60% 97%',
      foreground: '140 50% 8%',
      card: '0 0% 100%',
      'card-foreground': '140 50% 8%',
      popover: '0 0% 100%',
      'popover-foreground': '140 50% 8%',
      primary: '142 76% 36%',       // emerald green
      'primary-foreground': '0 0% 100%',
      secondary: '138 40% 92%',
      'secondary-foreground': '140 50% 8%',
      muted: '138 30% 94%',
      'muted-foreground': '140 10% 45%',
      accent: '142 76% 88%',
      'accent-foreground': '140 50% 8%',
      destructive: '0 72% 51%',
      'destructive-foreground': '0 0% 100%',
      border: '138 30% 82%',
      input: '138 30% 82%',
      ring: '142 76% 36%',
      radius: '1.5rem',
    },
  },

  // ── 6. HEYMESSAGE DARK (Modern AI Template) ─────────────────────────────────
  'heymessage-dark': {
    id: 'heymessage-dark',
    name: 'HeyMessage Dark',
    category: 'dark',
    headingFont: '"Host Grotesk Local", Inter, sans-serif',
    bodyFont: '"DM Sans Local", Inter, sans-serif',
    googleFontsUrl: '', // Hosted locally in globals.css
    vars: {
      background: '0 0% 0%',
      foreground: '0 0% 100%',
      card: '0 0% 6%',
      'card-foreground': '0 0% 100%',
      popover: '0 0% 6%',
      'popover-foreground': '0 0% 100%',
      primary: '0 0% 98%',          // light gray/white for main buttons
      'primary-foreground': '0 0% 9%',
      secondary: '0 0% 12%',
      'secondary-foreground': '0 0% 100%',
      muted: '0 0% 15%',
      'muted-foreground': '0 0% 52%', // #858585
      accent: '74 100% 64%',         // #d5ff45 (original yellow)
      'accent-foreground': '0 0% 4%',
      destructive: '0 62.8% 50%',
      'destructive-foreground': '0 0% 98%',
      border: '0 0% 16%',            // transparent white border equivalent
      input: '0 0% 16%',
      ring: '74 100% 64%',           // yellow focus ring
      radius: '1rem',                // 16px radius for cards/buttons
    },
  },

};

export const ALL_SHADCN_THEME_IDS = Object.keys(SHADCN_THEMES);
export const DEFAULT_THEME_ID = 'dark-tech';

/**
 * Gets a theme by id, falls back to dark-tech.
 */
export function getShadcnTheme(id: string): ShadcnTheme {
  return SHADCN_THEMES[id] ?? SHADCN_THEMES[DEFAULT_THEME_ID];
}

/**
 * Picks the best theme based on offer keywords.
 * Used as the initial default when generating a page.
 */
export function pickThemeForOffer(ctx: {
  niche?: string;
  tone?: string;
  audience?: string;
  productType?: string;
}): ShadcnTheme {
  const text = [ctx.niche, ctx.tone, ctx.audience, ctx.productType]
    .filter(Boolean).join(' ').toLowerCase();

  if (/luxury|high.?ticket|premium|wealth|coaching|consulting/.test(text))
    return SHADCN_THEMES['luxury-gold'];
  if (/health|wellness|fitness|natural|organic|nutrition/.test(text))
    return SHADCN_THEMES['health-emerald'];
  if (/beauty|fashion|women|feminine|dating|lifestyle|pink|rose/.test(text))
    return SHADCN_THEMES['rose-elegant'];
  if (/b2b|corporate|agency|legal|finance|professional|enterprise/.test(text))
    return SHADCN_THEMES['clean-professional'];

  // default: dark tech (good for SaaS, AI, productivity, general)
  return SHADCN_THEMES['dark-tech'];
}
