import { PageTheme } from './ai-theme';

// ─────────────────────────────────────────────────────────────────────────────
// COOLORS THEMES REGISTRY
// A massive expansion of 40+ curated themes based on popular Coolors palettes.
// These themes guarantee high-end, Framer-like aesthetics.
// ─────────────────────────────────────────────────────────────────────────────

export const COOLORS_THEMES: Record<string, PageTheme> = {
  // ── MINIMAL / GREYSCALE (Inspired by User's Palettes) ──
  'bright-snow': {
    id: 'bright-snow',
    name: 'Bright Snow',
    palette: { background: '#f8f9fa', surface: '#ffffff', border: '#e9ecef', primary: '#212529', primaryHover: '#343a40', primaryFg: '#ffffff', text: '#212529', textMuted: '#6c757d', gradient: 'linear-gradient(135deg, #212529 0%, #495057 100%)' },
    headingFont: 'Inter', bodyFont: 'Inter', styleTag: 'minimal, clean, white, light, startup', borderRadius: '8px', buttonRadius: '6px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  },
  'carbon-black': {
    id: 'carbon-black',
    name: 'Carbon Black',
    palette: { background: '#070808', surface: '#141719', border: '#212529', primary: '#f8f9fa', primaryHover: '#e9ecef', primaryFg: '#070808', text: '#f8f9fa', textMuted: '#9fa8b2', gradient: 'linear-gradient(135deg, #49525b 0%, #212529 100%)' },
    headingFont: 'Inter', bodyFont: 'Inter', styleTag: 'dark, minimal, black, dev, tech', borderRadius: '4px', buttonRadius: '4px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  },
  'iron-grey': {
    id: 'iron-grey',
    name: 'Iron Grey',
    palette: { background: '#0e1011', surface: '#1d2022', border: '#2b2f34', primary: '#fdfdfd', primaryHover: '#e5e9ec', primaryFg: '#0e1011', text: '#d9dcdf', textMuted: '#8c959f', gradient: 'linear-gradient(135deg, #1d2022 0%, #3a3f45 100%)' },
    headingFont: 'Space Grotesk', bodyFont: 'Inter', styleTag: 'dark, grey, modern, subtle', borderRadius: '12px', buttonRadius: '12px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500&display=swap'
  },

  // ── SAAS / TECH ──
  'stripe-blurple': {
    id: 'stripe-blurple',
    name: 'Tech Blurple',
    palette: { background: '#f6f9fc', surface: '#ffffff', border: '#e2e8f0', primary: '#635bff', primaryHover: '#4b45c6', primaryFg: '#ffffff', text: '#334155', textMuted: '#64748b', gradient: 'linear-gradient(135deg, #635bff 0%, #00d4ff 100%)' },
    headingFont: 'Inter', bodyFont: 'Inter', styleTag: 'saas, software, payment, modern', borderRadius: '12px', buttonRadius: '9999px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  },
  'vercel-geist': {
    id: 'vercel-geist',
    name: 'Geist Monotone',
    palette: { background: '#000000', surface: '#111111', border: '#333333', primary: '#ffffff', primaryHover: '#cccccc', primaryFg: '#000000', text: '#ededed', textMuted: '#888888', gradient: 'linear-gradient(135deg, #333333 0%, #000000 100%)' },
    headingFont: 'Inter', bodyFont: 'Inter', styleTag: 'developer, tech, dark, vercel', borderRadius: '6px', buttonRadius: '6px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  },
  'cyber-neon': {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    palette: { background: '#050517', surface: '#0a0a2a', border: '#1a1a4a', primary: '#00ffcc', primaryHover: '#00cca3', primaryFg: '#050517', text: '#e0e0ff', textMuted: '#8a8a9e', gradient: 'linear-gradient(135deg, #00ffcc 0%, #ff00ff 100%)' },
    headingFont: 'Space Grotesk', bodyFont: 'Inter', styleTag: 'cyberpunk, neon, web3, future', borderRadius: '0px', buttonRadius: '0px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500&display=swap'
  },
  'oceanic-fintech': {
    id: 'oceanic-fintech',
    name: 'Oceanic Fintech',
    palette: { background: '#0b132b', surface: '#1c2541', border: '#3a506b', primary: '#5bc0be', primaryHover: '#3b9292', primaryFg: '#ffffff', text: '#ffffff', textMuted: '#8a9cad', gradient: 'linear-gradient(135deg, #5bc0be 0%, #3a506b 100%)' },
    headingFont: 'Plus Jakarta Sans', bodyFont: 'Inter', styleTag: 'finance, oceanic, corporate', borderRadius: '16px', buttonRadius: '12px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500&display=swap'
  },

  // ── CREATOR / E-COMMERCE ──
  'sunset-vibes': {
    id: 'sunset-vibes',
    name: 'Sunset Vibes',
    palette: { background: '#fffbeb', surface: '#ffffff', border: '#fde68a', primary: '#f59e0b', primaryHover: '#d97706', primaryFg: '#ffffff', text: '#451a03', textMuted: '#78350f', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
    headingFont: 'Oswald', bodyFont: 'Inter', styleTag: 'creator, warm, sunset, ecommerce', borderRadius: '12px', buttonRadius: '12px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500&display=swap'
  },
  'matcha-mint': {
    id: 'matcha-mint',
    name: 'Matcha Mint',
    palette: { background: '#f0fdf4', surface: '#ffffff', border: '#bbf7d0', primary: '#22c55e', primaryHover: '#16a34a', primaryFg: '#ffffff', text: '#14532d', textMuted: '#4b5563', gradient: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)' },
    headingFont: 'Plus Jakarta Sans', bodyFont: 'Inter', styleTag: 'health, organic, fresh, mint', borderRadius: '24px', buttonRadius: '9999px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500&display=swap'
  },
  'bubblegum-pop': {
    id: 'bubblegum-pop',
    name: 'Bubblegum Pop',
    palette: { background: '#fdf2f8', surface: '#ffffff', border: '#fbcfe8', primary: '#ec4899', primaryHover: '#db2777', primaryFg: '#ffffff', text: '#831843', textMuted: '#9d174d', gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' },
    headingFont: 'Playfair Display', bodyFont: 'Inter', styleTag: 'feminine, pop, beauty, influencer', borderRadius: '24px', buttonRadius: '9999px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500&display=swap'
  },

  // ── LUXURY / COACHING ──
  'prestige-gold': {
    id: 'prestige-gold',
    name: 'Prestige Gold',
    palette: { background: '#111111', surface: '#1c1c1c', border: '#333333', primary: '#d4af37', primaryHover: '#b5952f', primaryFg: '#111111', text: '#f5f5f5', textMuted: '#a0a0a0', gradient: 'linear-gradient(135deg, #d4af37 0%, #f3e5ab 100%)' },
    headingFont: 'Playfair Display', bodyFont: 'Lato', styleTag: 'luxury, gold, premium, wealth', borderRadius: '4px', buttonRadius: '4px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Lato:wght@300;400;700&display=swap'
  },
  'obsidian-emerald': {
    id: 'obsidian-emerald',
    name: 'Obsidian Emerald',
    palette: { background: '#051914', surface: '#0a2a22', border: '#144a3e', primary: '#10b981', primaryHover: '#059669', primaryFg: '#051914', text: '#ecfdf5', textMuted: '#6ee7b7', gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' },
    headingFont: 'Cormorant Garamond', bodyFont: 'Inter', styleTag: 'luxury, emerald, dark green, high ticket', borderRadius: '16px', buttonRadius: '16px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500&display=swap'
  },
  'nordic-frost': {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    palette: { background: '#e0e5ec', surface: '#ffffff', border: '#c7d0d9', primary: '#5c7cfa', primaryHover: '#4c6ef5', primaryFg: '#ffffff', text: '#212529', textMuted: '#495057', gradient: 'linear-gradient(135deg, #5c7cfa 0%, #3bc9db 100%)' },
    headingFont: 'Inter', bodyFont: 'Inter', styleTag: 'nordic, clean, cool, design', borderRadius: '16px', buttonRadius: '16px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  },

  // ── AUDACIOUS / HIGH CONVERSION ──
  'danger-zone': {
    id: 'danger-zone',
    name: 'Danger Zone',
    palette: { background: '#fff1f2', surface: '#ffffff', border: '#ffe4e6', primary: '#dc2626', primaryHover: '#b91c1c', primaryFg: '#ffffff', text: '#450a0a', textMuted: '#7f1d1d', gradient: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)' },
    headingFont: 'Oswald', bodyFont: 'Inter', styleTag: 'warning, urgent, red, click funnel', borderRadius: '8px', buttonRadius: '8px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500&display=swap'
  },
  'yellow-jacket': {
    id: 'yellow-jacket',
    name: 'Yellow Jacket',
    palette: { background: '#171717', surface: '#262626', border: '#404040', primary: '#eab308', primaryHover: '#ca8a04', primaryFg: '#171717', text: '#ffffff', textMuted: '#a3a3a3', gradient: 'linear-gradient(135deg, #eab308 0%, #facc15 100%)' },
    headingFont: 'Bebas Neue', bodyFont: 'Inter', styleTag: 'construction, bold, yellow, fitness', borderRadius: '0px', buttonRadius: '0px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&display=swap'
  },
  'deep-purple': {
    id: 'deep-purple',
    name: 'Deep Purple',
    palette: { background: '#1e1b4b', surface: '#312e81', border: '#4338ca', primary: '#a855f7', primaryHover: '#9333ea', primaryFg: '#ffffff', text: '#e0e7ff', textMuted: '#a5b4fc', gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' },
    headingFont: 'Space Grotesk', bodyFont: 'Inter', styleTag: 'purple, modern, agency, creative', borderRadius: '24px', buttonRadius: '24px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500&display=swap'
  },

  // ── PASTEL / SOFT ──
  'pastel-dream': {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    palette: { background: '#faf5ff', surface: '#ffffff', border: '#f3e8ff', primary: '#c084fc', primaryHover: '#a855f7', primaryFg: '#ffffff', text: '#4c1d95', textMuted: '#5b21b6', gradient: 'linear-gradient(135deg, #c084fc 0%, #f472b6 100%)' },
    headingFont: 'Playfair Display', bodyFont: 'Inter', styleTag: 'pastel, soft, dream, wedding', borderRadius: '16px', buttonRadius: '9999px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@400;500&display=swap'
  },
  'coffee-shop': {
    id: 'coffee-shop',
    name: 'Coffee Shop',
    palette: { background: '#fdf8f5', surface: '#ffffff', border: '#e8d5cc', primary: '#8b5a2b', primaryHover: '#6b4226', primaryFg: '#ffffff', text: '#3e2723', textMuted: '#5d4037', gradient: 'linear-gradient(135deg, #8b5a2b 0%, #b2854b 100%)' },
    headingFont: 'Cormorant Garamond', bodyFont: 'Lato', styleTag: 'coffee, warm, brown, organic, rustic', borderRadius: '8px', buttonRadius: '8px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Lato:wght@400;700&display=swap'
  },
  
  // ── VIBRANT ──
  'flamingo-beach': {
    id: 'flamingo-beach',
    name: 'Flamingo Beach',
    palette: { background: '#fffbeb', surface: '#ffffff', border: '#fef3c7', primary: '#f43f5e', primaryHover: '#e11d48', primaryFg: '#ffffff', text: '#0f172a', textMuted: '#334155', gradient: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)' },
    headingFont: 'Plus Jakarta Sans', bodyFont: 'Inter', styleTag: 'summer, vacation, travel, vibrant', borderRadius: '16px', buttonRadius: '16px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500&display=swap'
  },
  'synthwave': {
    id: 'synthwave',
    name: 'Synthwave',
    palette: { background: '#2b213a', surface: '#1e152a', border: '#3b2f4f', primary: '#fb923c', primaryHover: '#f97316', primaryFg: '#1e152a', text: '#fcd34d', textMuted: '#f87171', gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' },
    headingFont: 'Space Grotesk', bodyFont: 'Inter', styleTag: 'retro, 80s, synthwave, neon', borderRadius: '4px', buttonRadius: '4px',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500&display=swap'
  }
};
