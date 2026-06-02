"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, Palette, Type, LayoutTemplate, Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ThemeGroundUIProps {
  content: string;
  onChange: (content: string) => void;
}

interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: number;
    headingScale: number;
  };
}

const DEFAULT_THEME: ThemeSettings = {
  colors: {
    primary: "#6366f1",
    secondary: "#ec4899",
    accent: "#8b5cf6",
    background: "#030712",
    foreground: "#f9fafb",
    muted: "#1f2937",
  },
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    baseFontSize: 16,
    headingScale: 1.25,
  },
};

const COLOR_LABELS: Record<string, string> = {
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
  background: "Background",
  foreground: "Text",
  muted: "Muted",
};

// ─── FontSelector ────────────────────────────────────────────────────────────────

function FontSelector({
  label,
  value,
  fonts,
  loading,
  onChange,
}: {
  label: string;
  value: string;
  fonts: string[];
  loading: boolean;
  onChange: (font: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return fonts;
    const q = search.toLowerCase();
    return fonts.filter((f) => f.toLowerCase().includes(q));
  }, [fonts, search]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <Label className="text-xs text-white/70">{label}</Label>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(""); }}
        className="w-full flex items-center justify-between bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 hover:border-white/20 transition-colors"
      >
        <span className="truncate" style={{ fontFamily: `'${value}', sans-serif` }}>{value}</span>
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-white/40 shrink-0" />
        ) : (
          <ChevronDown className={cn("w-3.5 h-3.5 text-white/40 shrink-0 transition-transform", open && "rotate-180")} />
        )}
      </button>

      {open && (
        <div className="relative z-50 mt-1 bg-[#0c0f1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fonts..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto custom-scrollbar p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-white/30">No fonts found</div>
            ) : (
              filtered.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => { onChange(f); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left",
                    f === value
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className="truncate" style={{ fontFamily: `'${f}', sans-serif` }}>{f}</span>
                  {f === value && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ColorSwatch ─────────────────────────────────────────────────────────────────

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-white/70">{label}</Label>
      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg p-1.5 pl-3">
        <span className="text-[11px] font-mono text-white/50 flex-1 uppercase tracking-wider">{value}</span>
        <div className="relative w-8 h-8 rounded-md overflow-hidden shadow-sm border border-white/20 shrink-0 cursor-pointer group">
          <div
            className="absolute inset-0 transition-transform group-hover:scale-110"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────────

export function ThemeGroundUI({ content, onChange }: ThemeGroundUIProps) {
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [fonts, setFonts] = useState<string[]>([]);
  const [loadingFonts, setLoadingFonts] = useState(false);
  const [rawText, setRawText] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Initialize theme from content (only once)
  useEffect(() => {
    if (initializedRef.current) return;
    if (!content) return;
    initializedRef.current = true;

    try {
      const parsed = JSON.parse(content);
      if (parsed.colors && parsed.typography) {
        setTheme(parsed);
        setRawText(null);
      }
    } catch {
      // Legacy text output from the AI
      setRawText(content);
    }
  }, [content]);

  // Fetch Google Fonts
  useEffect(() => {
    let cancelled = false;
    async function fetchFonts() {
      setLoadingFonts(true);
      try {
        const res = await fetch("https://fonts.google.com/metadata/fonts");
        const data = await res.json();
        if (!cancelled) {
          const list: string[] = data.familyMetadataList
            .slice(0, 250)
            .map((f: any) => f.family);
          setFonts(list);
        }
      } catch {
        if (!cancelled) {
          setFonts([
            "Inter", "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins",
            "Oswald", "Raleway", "Nunito", "Playfair Display", "Merriweather",
            "Source Sans Pro", "PT Sans", "Outfit", "DM Sans", "Space Grotesk",
          ]);
        }
      } finally {
        if (!cancelled) setLoadingFonts(false);
      }
    }
    fetchFonts();
    return () => { cancelled = true; };
  }, []);

  const handleUpdate = (newTheme: ThemeSettings) => {
    setTheme(newTheme);
    onChange(JSON.stringify(newTheme, null, 2));
  };

  const updateColor = (key: keyof ThemeSettings["colors"], value: string) => {
    handleUpdate({ ...theme, colors: { ...theme.colors, [key]: value } });
  };

  const updateTypography = (key: keyof ThemeSettings["typography"], value: string | number) => {
    handleUpdate({ ...theme, typography: { ...theme.typography, [key]: value } });
  };

  const convertLegacyToTheme = () => {
    handleUpdate(DEFAULT_THEME);
    setRawText(null);
  };

  // Dynamic Google Fonts stylesheet URLs
  const headingFontUrl = `https://fonts.googleapis.com/css2?family=${theme.typography.headingFont.replace(/ /g, "+")}:wght@400;700;900&display=swap`;
  const bodyFontUrl = `https://fonts.googleapis.com/css2?family=${theme.typography.bodyFont.replace(/ /g, "+")}:wght@400;500;700&display=swap`;

  const isConfigDisabled = !!rawText;

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full h-full min-h-[650px] overflow-hidden text-white/90">
      {/* Google Fonts injection */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={headingFontUrl} />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={bodyFontUrl} />

      {/* ── Configuration Panel ──────────────────────────────────────── */}
      <div className="w-full lg:w-[360px] shrink-0 overflow-y-auto pr-2 pb-10 space-y-7 custom-scrollbar">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Palette className="w-4 h-4 text-white" />
            </div>
            Theme Ground
          </h2>
          <p className="text-sm text-white/50 leading-relaxed">
            Configure the core visual identity for your funnel pages.
          </p>
        </div>

        {rawText && (
          <div className="p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
            <p className="text-sm text-indigo-200 leading-relaxed">
              The AI generated text design recommendations. Click below to initialize the interactive Theme Builder.
            </p>
            <button
              onClick={convertLegacyToTheme}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg"
            >
              Initialize Theme Builder
            </button>
          </div>
        )}

        <div
          className="space-y-7 transition-opacity"
          style={{ opacity: isConfigDisabled ? 0.4 : 1, pointerEvents: isConfigDisabled ? "none" : "auto" }}
        >
          {/* ── Colors ── */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-white/30 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5" />
              Colors
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(theme.colors).map(([key, val]) => (
                <ColorSwatch
                  key={key}
                  label={COLOR_LABELS[key] || key}
                  value={val}
                  onChange={(v) => updateColor(key as keyof ThemeSettings["colors"], v)}
                />
              ))}
            </div>
          </div>

          {/* ── Typography ── */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-white/30 flex items-center gap-2">
              <Type className="w-3.5 h-3.5" />
              Typography
            </h3>

            <FontSelector
              label="Heading Font"
              value={theme.typography.headingFont}
              fonts={fonts}
              loading={loadingFonts}
              onChange={(f) => updateTypography("headingFont", f)}
            />

            <FontSelector
              label="Body Font"
              value={theme.typography.bodyFont}
              fonts={fonts}
              loading={loadingFonts}
              onChange={(f) => updateTypography("bodyFont", f)}
            />

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-white/70">Base Font Size</Label>
                <span className="text-xs font-mono text-white/40">{theme.typography.baseFontSize}px</span>
              </div>
              <Slider
                value={[theme.typography.baseFontSize]}
                min={12}
                max={24}
                step={1}
                onValueChange={(v) => updateTypography("baseFontSize", v[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-white/70">Heading Scale</Label>
                <span className="text-xs font-mono text-white/40">{theme.typography.headingScale}×</span>
              </div>
              <Slider
                value={[theme.typography.headingScale]}
                min={1.1}
                max={1.6}
                step={0.05}
                onValueChange={(v) => updateTypography("headingScale", v[0])}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Preview ─────────────────────────────────────────────── */}
      <div className="flex-1 bg-black/30 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl flex flex-col min-h-[500px]">
        {/* Browser chrome bar */}
        <div className="px-4 py-2.5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-medium text-white/40">
            <LayoutTemplate className="w-3.5 h-3.5" />
            Live Preview
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
          </div>
        </div>

        {/* Preview content */}
        <div
          className="flex-1 overflow-y-auto custom-scrollbar transition-colors duration-500"
          style={{ backgroundColor: theme.colors.background, color: theme.colors.foreground }}
        >
          <div
            className="w-full min-h-full p-8 md:p-12 flex flex-col items-center justify-center text-center"
            style={{ fontFamily: `'${theme.typography.bodyFont}', sans-serif`, fontSize: `${theme.typography.baseFontSize}px` }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-full font-medium text-sm mb-6 shadow-sm transition-colors duration-300"
              style={{ backgroundColor: theme.colors.muted, color: theme.colors.accent }}
            >
              ✨ New Feature Release
            </div>

            {/* Hero Heading */}
            <h1
              className="font-bold tracking-tight mb-5 max-w-2xl leading-[1.1] transition-all duration-300"
              style={{
                fontFamily: `'${theme.typography.headingFont}', sans-serif`,
                fontSize: `${theme.typography.baseFontSize * theme.typography.headingScale * theme.typography.headingScale * theme.typography.headingScale}px`,
              }}
            >
              Convert more visitors with{" "}
              <span style={{ color: theme.colors.primary }}>intelligent design.</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl mx-auto mb-10 opacity-75 leading-relaxed" style={{ fontSize: `${theme.typography.baseFontSize * 1.1}px` }}>
              The visual aesthetics of your landing page instantly communicate trust.
              Configure your brand colors and typography here to see the impact live.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                className="px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg hover:opacity-90 hover:scale-[1.03]"
                style={{ backgroundColor: theme.colors.primary, color: "#fff" }}
              >
                Get Started Now
              </button>
              <button
                className="px-8 py-3.5 rounded-xl font-bold transition-all duration-300 border-2 bg-transparent hover:opacity-80"
                style={{ borderColor: theme.colors.secondary, color: theme.colors.secondary }}
              >
                View Documentation
              </button>
            </div>

            {/* Feature Cards */}
            <div className="mt-16 w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
              {[
                { n: 1, title: "Speed Optimized", desc: "Pages that load in under 2 seconds with zero layout shift." },
                { n: 2, title: "Conversion Focused", desc: "Every element is designed to move your visitor closer to action." },
                { n: 3, title: "Mobile First", desc: "Responsive layouts that look incredible on every device." },
              ].map((card) => (
                <div
                  key={card.n}
                  className="p-6 rounded-2xl shadow-sm border transition-colors duration-300"
                  style={{ backgroundColor: theme.colors.muted, borderColor: `${theme.colors.accent}33` }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-white font-bold text-sm"
                    style={{ backgroundColor: theme.colors.accent }}
                  >
                    {card.n}
                  </div>
                  <h3
                    className="font-bold mb-2"
                    style={{
                      fontFamily: `'${theme.typography.headingFont}', sans-serif`,
                      fontSize: `${theme.typography.baseFontSize * theme.typography.headingScale}px`,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p className="opacity-65 leading-relaxed" style={{ fontSize: `${theme.typography.baseFontSize * 0.9}px` }}>
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
