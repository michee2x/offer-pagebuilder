// ─────────────────────────────────────────────────────────────────────────────
// ai-theme.ts  —  Context-aware theme generator for OfferIQ Builder
//
// Maps offer niche / tone to a curated, conversion-optimised PageTheme.
// Palettes are hand-crafted by a designer — NOT randomly generated.
// Each palette is proven to work for its category of offer.
// ─────────────────────────────────────────────────────────────────────────────

export interface ColorPalette {
  background: string;   // Page background
  surface: string;      // Card / section background
  border: string;       // Subtle border (rgba hex)
  primary: string;      // Brand accent / CTA colour
  primaryHover: string; // Darker shade for hover
  primaryFg: string;    // Text on primary buttons
  text: string;         // Main body text
  textMuted: string;    // Secondary text / captions
  gradient: string;     // Hero gradient or accent gradient (CSS value)
}

export interface PageTheme {
  id: string;
  name: string;          // e.g. "Dark Tech", "Luxury Gold"
  palette: ColorPalette;
  headingFont: string;   // Google Font name, e.g. "Plus Jakarta Sans"
  bodyFont: string;      // Google Font name, e.g. "Inter"
  googleFontsUrl: string;
  borderRadius: string;  // e.g. "12px"
  buttonRadius: string;  // e.g. "9999px" (pill) or "10px" (rounded)
  styleTag: string;      // Short descriptor for prompts
}

import { COOLORS_THEMES } from './coolors-themes';

// ─────────────────────────────────────────────────────────────────────────────
// CURATED PALETTE LIBRARY
// ─────────────────────────────────────────────────────────────────────────────

const BASE_PRESETS: Record<string, PageTheme> = {
  'dark-tech': {
    id: 'dark-tech',
    name: 'Dark Tech',
    palette: {
      background: '#09090b',
      surface: '#18181b',
      border: '#27272a',
      primary: '#7c3aed',
      primaryHover: '#6d28d9',
      primaryFg: '#ffffff',
      text: '#fafafa',
      textMuted: '#a1a1aa',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
    },
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap',
    borderRadius: '12px',
    buttonRadius: '10px',
    styleTag: 'dark, tech, SaaS, software, AI, productivity',
  },

  'luxury-gold': {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    palette: {
      background: '#0a0800',
      surface: '#1a1500',
      border: '#2d2400',
      primary: '#d4a017',
      primaryHover: '#b8860b',
      primaryFg: '#0a0800',
      text: '#fef9e7',
      textMuted: '#a89060',
      gradient: 'linear-gradient(135deg, #d4a017 0%, #f5d060 100%)',
    },
    headingFont: 'Playfair Display',
    bodyFont: 'Lato',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&display=swap',
    borderRadius: '8px',
    buttonRadius: '6px',
    styleTag: 'luxury, premium, high-ticket, coaching, consulting, wealth',
  },

  'energetic-orange': {
    id: 'energetic-orange',
    name: 'Energetic Orange',
    palette: {
      background: '#0f0a00',
      surface: '#1a1200',
      border: '#2e1f00',
      primary: '#f97316',
      primaryHover: '#ea6c0c',
      primaryFg: '#ffffff',
      text: '#ffffff',
      textMuted: '#a8956a',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
    },
    headingFont: 'Oswald',
    bodyFont: 'Open Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap',
    borderRadius: '6px',
    buttonRadius: '6px',
    styleTag: 'fitness, sport, energy, urgency, challenge, ecommerce, flash sale',
  },

  'clean-professional': {
    id: 'clean-professional',
    name: 'Clean Professional',
    palette: {
      background: '#f9fafb',
      surface: '#ffffff',
      border: '#e5e7eb',
      primary: '#1d4ed8',
      primaryHover: '#1e40af',
      primaryFg: '#ffffff',
      text: '#111827',
      textMuted: '#6b7280',
      gradient: 'linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%)',
    },
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap',
    borderRadius: '10px',
    buttonRadius: '8px',
    styleTag: 'B2B, professional services, finance, legal, corporate, agency',
  },

  'health-wellness': {
    id: 'health-wellness',
    name: 'Health & Wellness',
    palette: {
      background: '#f0fdf4',
      surface: '#ffffff',
      border: '#bbf7d0',
      primary: '#16a34a',
      primaryHover: '#15803d',
      primaryFg: '#ffffff',
      text: '#14532d',
      textMuted: '#4b7a5a',
      gradient: 'linear-gradient(135deg, #16a34a 0%, #0d9488 100%)',
    },
    headingFont: 'DM Serif Display',
    bodyFont: 'DM Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap',
    borderRadius: '16px',
    buttonRadius: '9999px',
    styleTag: 'health, wellness, nutrition, weight loss, mindfulness, natural',
  },

  'bold-red': {
    id: 'bold-red',
    name: 'Bold Red',
    palette: {
      background: '#09090b',
      surface: '#18181b',
      border: '#27272a',
      primary: '#dc2626',
      primaryHover: '#b91c1c',
      primaryFg: '#ffffff',
      text: '#fafafa',
      textMuted: '#a1a1aa',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #7c3aed 100%)',
    },
    headingFont: 'Bebas Neue',
    bodyFont: 'Inter',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&display=swap',
    borderRadius: '4px',
    buttonRadius: '4px',
    styleTag: 'urgency, aggressive marketing, info products, bold claims, weight loss, make money',
  },

  'midnight-blue': {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    palette: {
      background: '#03071e',
      surface: '#0a0f2e',
      border: '#1a2060',
      primary: '#4361ee',
      primaryHover: '#3451d1',
      primaryFg: '#ffffff',
      text: '#e8ecff',
      textMuted: '#8b93cc',
      gradient: 'linear-gradient(135deg, #4361ee 0%, #7209b7 100%)',
    },
    headingFont: 'Space Grotesk',
    bodyFont: 'Inter',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&display=swap',
    borderRadius: '14px',
    buttonRadius: '10px',
    styleTag: 'fintech, crypto, investing, trading, newsletter, Web3',
  },

  'rose-elegant': {
    id: 'rose-elegant',
    name: 'Rose Elegant',
    palette: {
      background: '#fff1f2',
      surface: '#ffffff',
      border: '#fecdd3',
      primary: '#e11d48',
      primaryHover: '#be185d',
      primaryFg: '#ffffff',
      text: '#1e1b4b',
      textMuted: '#6b5563',
      gradient: 'linear-gradient(135deg, #e11d48 0%, #9333ea 100%)',
    },
    headingFont: 'Cormorant Garamond',
    bodyFont: 'DM Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap',
    borderRadius: '16px',
    buttonRadius: '9999px',
    styleTag: 'beauty, fashion, women, feminine, relationship, dating, lifestyle',
  },
};

export const THEME_PRESETS: Record<string, PageTheme> = {
  ...BASE_PRESETS,
  ...COOLORS_THEMES,
};

// ─────────────────────────────────────────────────────────────────────────────
// THEME SELECTION LOGIC
// ─────────────────────────────────────────────────────────────────────────────

interface OfferContext {
  niche?: string;
  audience?: string;
  tone?: string;
  productType?: string;
  marketSophistication?: string;
}

// Keyword → theme mapping (order matters: first match wins)
const THEME_KEYWORD_MAP: Array<{ keywords: string[]; themeId: string }> = [
  { keywords: ['luxury', 'high ticket', 'premium', 'elite', 'vip', 'exclusive', 'wealth', 'affluent', 'high-ticket'], themeId: 'luxury-gold' },
  { keywords: ['health', 'wellness', 'nutrition', 'weight', 'fitness', 'diet', 'natural', 'organic', 'mindfulness', 'yoga', 'supplement'], themeId: 'health-wellness' },
  { keywords: ['beauty', 'fashion', 'women', 'feminine', 'relationship', 'dating', 'lifestyle', 'skincare', 'makeup'], themeId: 'rose-elegant' },
  { keywords: ['fitness', 'sport', 'gym', 'muscle', 'challenge', 'energy', 'transformation', 'bootcamp', 'burn', 'shred'], themeId: 'energetic-orange' },
  { keywords: ['crypto', 'fintech', 'invest', 'trading', 'token', 'web3', 'blockchain', 'finance', 'money', 'stock'], themeId: 'midnight-blue' },
  { keywords: ['saas', 'software', 'app', 'ai', 'tech', 'developer', 'automation', 'platform', 'tool', 'productivity', 'startup'], themeId: 'dark-tech' },
  { keywords: ['urgent', 'limited', 'make money', 'income', 'fast', 'guaranteed', 'clickbait', 'viral', 'secret', 'exposed'], themeId: 'bold-red' },
  { keywords: ['b2b', 'corporate', 'agency', 'consulting', 'legal', 'accounting', 'enterprise', 'professional', 'business service'], themeId: 'clean-professional' },
];

/**
 * Picks the best PageTheme based on the offer context.
 * Falls back to 'dark-tech' as the universal default.
 */
export function generateTheme(ctx: OfferContext): PageTheme {
  const searchText = [
    ctx.niche ?? '',
    ctx.audience ?? '',
    ctx.tone ?? '',
    ctx.productType ?? '',
  ].join(' ').toLowerCase();

  for (const { keywords, themeId } of THEME_KEYWORD_MAP) {
    if (keywords.some((kw) => searchText.includes(kw))) {
      return THEME_PRESETS[themeId];
    }
  }

  // If no specific keyword matches, grab ANY random theme to ensure massive variety!
  const allIds = Object.keys(THEME_PRESETS);
  // Hash the title or niche to safely pseudo-randomise without Math.random() so it's stable per offer
  let hash = 0;
  for (let i = 0; i < searchText.length; i++) hash += searchText.charCodeAt(i);
  const randomStableIndex = hash % allIds.length;
  
  return THEME_PRESETS[allIds[randomStableIndex]] || THEME_PRESETS['dark-tech'];
}

/**
 * Returns the theme by its id, or fallback to dark-tech.
 */
export function getThemeById(id: string): PageTheme {
  return THEME_PRESETS[id] ?? THEME_PRESETS['dark-tech'];
}

export const ALL_THEME_IDS = Object.keys(THEME_PRESETS);
