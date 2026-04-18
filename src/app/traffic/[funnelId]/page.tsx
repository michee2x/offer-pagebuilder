'use client';

import React, { use, useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import {
  Zap, Loader2, Copy, RefreshCw, TrendingUp, DollarSign, Target, Sparkles,
  AlertTriangle, Check, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FunnelSidebar } from '@/components/layout/FunnelSidebar';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlatformEntry {
  name: string;
  tier: 'primary' | 'secondary' | 'test';
  budget_pct: string;
  budget_range: string;
  expected_cac: string;
  projected_roas: string;
  best_format: string;
  persona_fit: string;
  why: string;
}

interface AdCopyVariant {
  platform: string;
  variant_name: string;
  headline: string;
  body: string;
  cta: string;
  psychological_trigger: string;
}

interface TrafficData {
  primary_platform: string;
  monthly_budget_range: string;
  projected_roas: string;
  expected_cac: string;
  break_even_timeline: string;
  platforms: PlatformEntry[];
  monthly_projections: {
    leads: string;
    sales: string;
    revenue: string;
    roas: string;
    break_even: string;
  };
  ad_copy_variants: AdCopyVariant[];
  timeline: Array<{ period: string; result: string; note: string }>;
  retargeting_strategy: string;
  key_warning: string | null;
}

// ─── Generation overlay ───────────────────────────────────────────────────────

const GEN_STEPS = [
  'Scanning 35,000+ comparable offers',
  'Analysing persona x platform fit',
  'Calculating CAC & ROAS benchmarks',
  'Building budget allocation model',
  'Writing platform-specific ad copy',
  'Generating performance projections',
];

function GenerationOverlay({ visible, step }: { visible: boolean; step: number }) {
  if (!visible) return null;
  const progressPercent = Math.min(100, Math.round((step / GEN_STEPS.length) * 100));
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center">
      <div className="w-full max-w-sm mx-auto px-6 text-center flex flex-col items-center">
        <div className="relative w-24 h-24 mb-8">
          <svg className="animate-spin w-full h-full" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <path className="opacity-80 text-foreground" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
            {progressPercent}%
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Traffic Intelligence™</h2>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {step >= GEN_STEPS.length ? 'Finalising report…' : GEN_STEPS[Math.min(step, GEN_STEPS.length - 1)]}
        </p>
        <div className="w-64 h-1 bg-border rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-foreground rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onGenerate, generating }: { onGenerate: () => void; generating: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-6">
      <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-6">
        <TrendingUp className="w-7 h-7 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Traffic Intelligence™ not generated yet</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
        Generate a full paid traffic strategy calibrated to your offer — platform priority matrix, budget model, projected ROAS, and ready-to-deploy ad copy.
      </p>
      <Button size="lg" onClick={onGenerate} disabled={generating} className="gap-2 font-semibold">
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Generate Traffic Intelligence
      </Button>
    </div>
  );
}

// ─── Platform card ────────────────────────────────────────────────────────────

const TIER_STYLES: Record<string, { card: string; badge: string; accent: string }> = {
  primary: {
    card: 'bg-gradient-to-br from-amber-400/7 to-orange-400/4 border-amber-400/25',
    badge: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    accent: 'text-amber-400',
  },
  secondary: {
    card: 'bg-gradient-to-br from-sky-400/7 to-teal-400/4 border-sky-400/20',
    badge: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    accent: 'text-sky-400',
  },
  test: {
    card: 'bg-muted/40 border-border',
    badge: 'bg-muted text-muted-foreground border-border',
    accent: 'text-muted-foreground',
  },
};

function PlatformCard({ platform }: { platform: PlatformEntry }) {
  const styles = TIER_STYLES[platform.tier] || TIER_STYLES.test;
  return (
    <div className={`rounded-2xl border p-4 relative transition-all hover:translate-y-[-2px] hover:shadow-xl ${styles.card}`}>
      <div className="absolute top-3 right-3">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${styles.badge}`}>
          {platform.tier}
        </span>
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${styles.accent}`}>
        {platform.tier === 'primary' ? '⭐ Primary · ' : platform.tier === 'secondary' ? 'Secondary · ' : 'Test · '}
        {platform.budget_pct} of budget
      </div>
      <h3 className="text-xl font-black text-foreground mb-0.5">{platform.name}</h3>
      <p className={`text-sm font-bold mb-3 ${styles.accent}`}>{platform.budget_range}</p>
      {[
        { label: 'Expected CAC', value: platform.expected_cac },
        { label: 'Projected ROAS', value: platform.projected_roas },
        { label: 'Best Format', value: platform.best_format },
        { label: 'Persona Fit', value: platform.persona_fit },
      ].map(s => (
        <div key={s.label} className="flex justify-between text-xs py-1.5 border-b border-white/5 last:border-b-0">
          <span className="text-muted-foreground">{s.label}</span>
          <span className="font-bold text-foreground">{s.value}</span>
        </div>
      ))}
      <p className="text-[11px] text-muted-foreground leading-relaxed mt-3 pt-3 border-t border-white/5">
        {platform.why}
      </p>
    </div>
  );
}

// ─── Ad copy card ─────────────────────────────────────────────────────────────

function AdCopyCard({ variant }: { variant: AdCopyVariant }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(`Headline: ${variant.headline}\n\n${variant.body}\n\nCTA: ${variant.cta}`);
    setCopied(true);
    toast.success('Ad copy copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-muted/40 border border-border rounded-2xl overflow-hidden mb-3 last:mb-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 uppercase tracking-wide">
            {variant.platform}
          </span>
          <span className="text-sm font-bold text-foreground">{variant.variant_name}</span>
        </div>
        <button
          onClick={handleCopy}
          className="w-7 h-7 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Headline</p>
          <p className="text-base font-black text-foreground leading-tight">{variant.headline}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Body</p>
          <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">{variant.body}</p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm font-bold text-amber-400">→ {variant.cta}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-400 border border-violet-400/20">
            ⚡ {variant.psychological_trigger}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Sections config ──────────────────────────────────────────────────────────

type SectionId = 'media' | 'adcopy' | 'timeline' | 'retargeting';

const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode; sub: string }[] = [
  { id: 'media', label: 'Media Strategy', icon: <TrendingUp className="w-4 h-4" />, sub: 'Platforms · Budget · ROAS' },
  { id: 'adcopy', label: 'Ad Copy Matrix', icon: <Target className="w-4 h-4" />, sub: 'Ready-to-deploy copy' },
  { id: 'timeline', label: 'Growth Timeline', icon: <ChevronRight className="w-4 h-4" />, sub: 'Week 1 → Month 3' },
  { id: 'retargeting', label: 'Retargeting', icon: <Zap className="w-4 h-4" />, sub: 'Warm audience strategy' },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TrafficIntelligencePage({
  params,
}: {
  params: Promise<{ funnelId: string }>;
}) {
  const { funnelId } = use(params);

  const [funnelName, setFunnelName] = useState('Your Funnel');
  const [data, setData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionId>('media');

  useEffect(() => {
    fetch(`/api/offer-data/${funnelId}`)
      .then(r => r.json())
      .then(res => {
        if (res.funnel) {
          setFunnelName(res.funnel.name || 'Your Funnel');
          const ti = res.funnel.blocks?.traffic_intelligence;
          if (ti) setData(ti);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [funnelId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenStep(0);

    const interval = setInterval(() => {
      setGenStep(s => Math.min(s + 1, GEN_STEPS.length - 1));
    }, 2500);

    try {
      const resp = await fetch(`/api/generate-traffic-intelligence/${funnelId}`, { method: 'POST' });
      clearInterval(interval);
      setGenStep(GEN_STEPS.length);

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Generation failed');
      }

      const { data: generated } = await resp.json();
      setData(generated);
      toast.success('Traffic Intelligence generated!');
    } catch (e: any) {
      clearInterval(interval);
      toast.error(e.message || 'Failed to generate');
    } finally {
      setGenerating(false);
      setGenStep(0);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <GenerationOverlay visible={generating} step={genStep} />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ marginLeft: '56px' }}>
        <Topbar
          breadcrumbs={[
            { label: 'Funnels', href: `/funnels/${funnelId}` },
            { label: funnelName, href: '#' },
            { label: 'Traffic Intelligence™' },
          ]}
          actions={
            data ? (
              <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generating} className="gap-1.5 font-semibold">
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate All
              </Button>
            ) : undefined
          }
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Funnel secondary sidebar (collapsible icon rail) */}
          <FunnelSidebar funnelId={funnelId} funnelName={funnelName} collapsible />
          {/* Left nav */}
          <div className="w-[230px] border-r border-border bg-card flex flex-col overflow-hidden flex-shrink-0">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Traffic Intelligence™</p>
              <div className="flex items-center gap-1.5 bg-muted/40 border border-border rounded-lg px-2.5 py-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate">{funnelName}</span>
              </div>
              {data && (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-semibold text-emerald-400">Generated · 35K+ offer database</span>
                </div>
              )}
            </div>

            {data && (
              <div className="flex-1 overflow-y-auto py-2 px-2">
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full text-left rounded-xl px-3 py-2.5 mb-1 border transition-all flex items-start gap-2.5 ${
                      activeSection === s.id
                        ? 'bg-primary/10 border-primary/30'
                        : 'border-transparent hover:bg-muted'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      activeSection === s.id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                    }`}>
                      {s.icon}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${activeSection === s.id ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</p>
                      <p className="text-[10px] text-muted-foreground/70">{s.sub}</p>
                    </div>
                  </button>
                ))}

                {/* Key projections */}
                <div className="mt-4 mx-1 pt-4 border-t border-border">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Key Projections</p>
                  {[
                    { label: 'Primary Platform', value: data.primary_platform },
                    { label: 'Rec. Monthly Budget', value: data.monthly_budget_range },
                    { label: 'Projected ROAS', value: data.projected_roas },
                    { label: 'Expected CAC', value: data.expected_cac },
                    { label: 'Break-even', value: data.break_even_timeline },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between text-[11px] mb-1.5">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-bold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!data && (
              <div className="flex-1 flex items-center justify-center px-4">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Generate your traffic intelligence to see the breakdown
                </p>
              </div>
            )}

            {data && (
              <div className="p-3 border-t border-border">
                <button
                  onClick={handleGenerate}
                  className="w-full h-9 bg-gradient-to-r from-violet-600 to-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Regenerate All Intelligence
                </button>
              </div>
            )}
          </div>

          {/* Center content */}
          <div className="flex-1 overflow-y-auto bg-background custom-scrollbar">
            {!data ? (
              <EmptyState onGenerate={handleGenerate} generating={generating} />
            ) : (
              <div className="max-w-5xl mx-auto px-6 py-8 pb-20 space-y-8">

                {/* Warning banner */}
                {data.key_warning && (
                  <div className="bg-amber-400/8 border border-amber-400/25 rounded-2xl px-5 py-4 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-0.5">Key Risk Flag</p>
                      <p className="text-sm text-foreground leading-relaxed">{data.key_warning}</p>
                    </div>
                  </div>
                )}

                {/* ── Media Strategy ── */}
                {activeSection === 'media' && (
                  <>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-amber-400 mb-1">L · Media Buying Strategy</p>
                      <h1 className="text-2xl font-black text-foreground tracking-tight mb-1">Platform Priority Matrix</h1>
                      <p className="text-sm text-muted-foreground">Engineered from 35K+ comparable offers. Ranked by conversion probability for your persona and price point.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {data.platforms.map(p => <PlatformCard key={p.name} platform={p} />)}
                    </div>

                    {/* Projections */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                        <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-amber-400" />
                          Monthly Projections
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">Month 1</span>
                      </div>
                      <div className="grid grid-cols-5">
                        {[
                          { label: 'Leads', value: data.monthly_projections.leads, color: 'text-sky-400' },
                          { label: 'Sales', value: data.monthly_projections.sales, color: 'text-emerald-400' },
                          { label: 'Revenue', value: data.monthly_projections.revenue, color: 'text-amber-400' },
                          { label: 'ROAS', value: data.monthly_projections.roas, color: 'text-emerald-400' },
                          { label: 'Break-even', value: data.monthly_projections.break_even, color: 'text-violet-400' },
                        ].map(m => (
                          <div key={m.label} className="text-center py-4 px-3 border-r border-border last:border-r-0">
                            <p className={`text-base font-black ${m.color} mb-1`}>{m.value}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Ad Copy Matrix ── */}
                {activeSection === 'adcopy' && (
                  <>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-sky-400 mb-1">M · Ad Copy Matrix</p>
                      <h1 className="text-2xl font-black text-foreground tracking-tight mb-1">Platform-Specific Ad Copy</h1>
                      <p className="text-sm text-muted-foreground">Ready to deploy. Built from your offer intelligence, persona data, and proven hooks.</p>
                    </div>
                    {data.ad_copy_variants.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No ad copy variants found. Try regenerating.</p>
                    ) : (
                      data.ad_copy_variants.map((v, i) => <AdCopyCard key={i} variant={v} />)
                    )}
                  </>
                )}

                {/* ── Timeline ── */}
                {activeSection === 'timeline' && (
                  <>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 mb-1">N · Growth Timeline</p>
                      <h1 className="text-2xl font-black text-foreground tracking-tight mb-1">Timeline to Profitability</h1>
                      <p className="text-sm text-muted-foreground">Based on comparable offers at your price point and traffic channels.</p>
                    </div>

                    <div className="relative bg-card border border-border rounded-2xl p-6">
                      {/* Timeline line */}
                      <div className="absolute top-[76px] left-[48px] right-[48px] h-0.5 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 opacity-50" />

                      <div className="flex justify-between relative z-10">
                        {data.timeline.map((t, i) => {
                          const colors = ['text-rose-400', 'text-amber-400', 'text-emerald-400', 'text-emerald-400'];
                          const bgColors = ['bg-rose-400/15', 'bg-amber-400/15', 'bg-emerald-400/15', 'bg-emerald-400/20'];
                          return (
                            <div key={i} className="flex flex-col items-center flex-1">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs ${bgColors[i]} ${colors[i]} border-2 border-background mb-3`}>
                                W{i + 1}
                              </div>
                              <p className="text-[10px] font-bold text-muted-foreground text-center mb-1">{t.period}</p>
                              <p className={`text-sm font-black text-center ${colors[i]}`}>{t.result}</p>
                              <p className="text-[10px] text-muted-foreground text-center mt-1">{t.note}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Retargeting ── */}
                {activeSection === 'retargeting' && (
                  <>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-violet-400 mb-1">O · Retargeting</p>
                      <h1 className="text-2xl font-black text-foreground tracking-tight mb-1">Warm Audience Strategy</h1>
                      <p className="text-sm text-muted-foreground">How to re-capture and convert visitors who didn&apos;t convert on first touch.</p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <p className="text-sm text-foreground leading-relaxed">{data.retargeting_strategy}</p>
                    </div>

                    <div className="bg-violet-400/6 border border-violet-400/18 rounded-2xl p-5">
                      <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Pro Tips</p>
                      {[
                        "Create a separate retargeting ad set targeting anyone who visited your page but didn't opt in",
                        'Use social proof-heavy creatives for retargeting (testimonials, results)',
                        'Lower friction by offering something free first before the paid offer',
                        'Cap frequency at 3\u20135 impressions/day to avoid ad fatigue',
                      ].map((tip, i) => (
                        <div key={i} className="flex items-start gap-2.5 mb-2.5 last:mb-0">
                          <div className="w-1 h-1 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
