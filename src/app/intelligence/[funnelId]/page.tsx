'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Zap, FileText, ArrowRight, Loader2, RefreshCw,
  TrendingUp, Target, Users, DollarSign, BarChart3,
  AlertTriangle, CheckCircle2, ChevronRight, Layers,
  MessageSquare, Sparkles, Globe, Shield,
} from 'lucide-react';
import type { Call1Output, Call2Output, OfferFormData, OfferIntelligence } from '@/lib/offer-types';
import { parseCall1Output, parseCall2Output } from '@/lib/offer-parser';

// ─── Wizard step config ───────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { id: 1, label: 'Upload', status: 'done' as const },
  { id: 2, label: 'Intelligence', status: 'active' as const },
  { id: 3, label: 'Copy', status: 'pending' as const },
  { id: 4, label: 'Build Pages', status: 'pending' as const },
  { id: 5, label: 'Publish', status: 'pending' as const },
];

// ─── Score helpers ────────────────────────────────────────────────────────────

function scoreColor(n: number): string {
  if (n >= 75) return 'text-emerald-400';
  if (n >= 55) return 'text-amber-400';
  return 'text-rose-400';
}
function scoreBg(n: number): string {
  if (n >= 75) return 'bg-emerald-500';
  if (n >= 55) return 'bg-amber-500';
  return 'bg-rose-500';
}
function scoreGrade(n: number): string {
  if (n >= 85) return 'A';
  if (n >= 75) return 'B+';
  if (n >= 65) return 'B';
  if (n >= 55) return 'C+';
  if (n >= 45) return 'C';
  return 'D';
}

// ─── Small reusable UI ────────────────────────────────────────────────────────

function SectionHeader({ icon, label, badge }: { icon: React.ReactNode; label: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-foreground tracking-tight">{label}</h3>
      {badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
          {badge}
        </span>
      )}
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-5', className)}>
      {children}
    </div>
  );
}

function NarrativeText({ text }: { text: string }) {
  if (!text) return <StreamingPlaceholder />;
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      {text.split('\n').filter(Boolean).map((para, i) => (
        <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-2 last:mb-0">{para}</p>
      ))}
    </div>
  );
}

function PreformattedSection({ text }: { text: string }) {
  if (!text) return <StreamingPlaceholder />;
  return (
    <div className="space-y-0.5">
      {text.split('\n').filter(l => l.trim()).map((line, i) => {
        const isKey = /^[A-Z_\s]+:/.test(line.trim()) || /^\[\d+\]/.test(line.trim()) || /^STAGE:|^BONUS|^HOOK|^ANGLE/.test(line.trim());
        const isIntensity = /INTENSITY:\s*(CRITICAL|HIGH|MEDIUM|LOW)/.test(line);
        const intensity = isIntensity ? line.match(/INTENSITY:\s*(\w+)/)?.[1] : null;
        return (
          <div key={i} className={cn(
            'text-sm leading-relaxed',
            isKey ? 'text-foreground font-semibold mt-3 first:mt-0' : 'text-muted-foreground',
          )}>
            {isIntensity && intensity && (
              <span className={cn('text-[10px] font-bold mr-2 px-1.5 py-0.5 rounded-sm border',
                intensity === 'CRITICAL' && 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                intensity === 'HIGH' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                intensity === 'MEDIUM' && 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                intensity === 'LOW' && 'bg-muted text-muted-foreground border-border',
              )}>
                {intensity}
              </span>
            )}
            {line}
          </div>
        );
      })}
    </div>
  );
}

function StreamingPlaceholder() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-3 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-5/6" />
      <div className="h-3 bg-muted rounded w-2/3" />
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn('text-xs font-bold', scoreColor(value))}>{value}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', scoreBg(value))}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function PlatformCard({
  platform,
  allocation,
  objective,
  cpl,
  rationale,
  rank,
}: {
  platform: string;
  allocation: string;
  objective: string;
  cpl: string;
  rationale: string;
  rank: 1 | 2 | 3;
}) {
  const colors = {
    1: 'border-primary/30 bg-primary/5',
    2: 'border-border bg-muted/20',
    3: 'border-border bg-background',
  };
  const rankColors = {
    1: 'bg-primary text-primary-foreground',
    2: 'bg-muted text-muted-foreground',
    3: 'bg-muted text-muted-foreground',
  };
  return (
    <div className={cn('rounded-xl border p-4 flex flex-col gap-3', colors[rank])}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn('text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center', rankColors[rank])}>
              {rank}
            </span>
            <span className="font-bold text-sm text-foreground">{platform}</span>
          </div>
          <span className="text-xs text-muted-foreground">{objective}</span>
        </div>
        <span className="text-lg font-bold text-foreground shrink-0">{allocation}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>CPL: <strong className="text-foreground">{cpl}</strong></span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{rationale}</p>
    </div>
  );
}

// ─── Divider with label ───────────────────────────────────────────────────────

function SectionDivider({ label, color = 'default' }: { label: string; color?: 'default' | 'violet' | 'amber' }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-border" />
      <span className={cn(
        'text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border',
        color === 'violet' && 'text-violet-400 bg-violet-500/10 border-violet-500/20',
        color === 'amber' && 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        color === 'default' && 'text-muted-foreground bg-muted border-border',
      )}>
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Streaming state machine ──────────────────────────────────────────────────

type StreamPhase = 'idle' | 'call1' | 'call2' | 'done' | 'error';

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IntelligencePage({
  params,
}: {
  params: Promise<{ funnelId: string }>;
}) {
  const { funnelId } = use(params);
  const router = useRouter();

  const [phase, setPhase] = useState<StreamPhase>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [funnelName, setFunnelName] = useState('');
  const [formData, setFormData] = useState<OfferFormData | null>(null);
  const [call1, setCall1] = useState<Call1Output | null>(null);
  const [call2, setCall2] = useState<Call2Output | null>(null);

  // ── Load & optionally stream ──────────────────────────────────────────────

  const streamCall1 = useCallback(async (fd: OfferFormData, existingCall1?: Call1Output) => {
    if (existingCall1) {
      setCall1(existingCall1);
      return existingCall1;
    }
    setPhase('call1');
    const res = await fetch('/api/offer-intelligence/call1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ funnelId, formData: fd }),
    });
    if (!res.ok || !res.body) throw new Error('Call 1 failed');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
    }
    const parsed = parseCall1Output(accumulated);
    setCall1(parsed);
    return parsed;
  }, [funnelId]);

  const streamCall2 = useCallback(async (fd: OfferFormData, c1: Call1Output, existingCall2?: Call2Output) => {
    if (existingCall2) {
      setCall2(existingCall2);
      return;
    }
    setPhase('call2');
    const res = await fetch('/api/offer-intelligence/call2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ funnelId, formData: fd, call1: c1 }),
    });
    if (!res.ok || !res.body) throw new Error('Call 2 failed');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
      // Parse and update progressively every ~500 chars
      if (accumulated.length % 500 < 50) {
        setCall2(parseCall2Output(accumulated));
      }
    }
    setCall2(parseCall2Output(accumulated));
  }, [funnelId]);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`/api/offer-data/${funnelId}`);
        if (!res.ok) throw new Error('Funnel not found');
        const { funnel } = await res.json();

        const intelligence: OfferIntelligence = funnel.blocks?.intelligence || {};
        const fd: OfferFormData = intelligence.raw_input;
        setFormData(fd);
        setFunnelName(funnel.name || 'Untitled Funnel');

        const c1 = await streamCall1(fd, intelligence.call1_complete ? intelligence.call1 : undefined);
        await streamCall2(fd, c1, intelligence.call2_complete ? intelligence.call2 : undefined);

        setPhase('done');
      } catch (e: any) {
        setErrorMsg(e.message || 'Something went wrong');
        setPhase('error');
      }
    }
    init();
  }, [funnelId, streamCall1, streamCall2]);

  // ── Phase indicator ───────────────────────────────────────────────────────

  const PhaseStatus = () => {
    if (phase === 'done') return null;
    if (phase === 'error') return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium">
        <AlertTriangle className="w-3.5 h-3.5" />
        {errorMsg}
      </div>
    );
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {phase === 'call1' ? 'Running structural analysis (Sonnet)…' : phase === 'call2' ? 'Running strategic analysis (Opus)…' : 'Loading…'}
      </div>
    );
  };

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ marginLeft: '56px' }}>

        {/* Topbar */}
        <Topbar
          breadcrumbs={[
            { label: 'Funnels', href: '/' },
            { label: funnelName || funnelId, href: `/intelligence/${funnelId}` },
            { label: 'Intelligence' },
          ]}
          steps={WIZARD_STEPS}
        >
          <PhaseStatus />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/intelligence/${funnelId}`)}
            className="gap-1.5 text-muted-foreground"
            title="Refresh report"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            disabled={!call1 || !call2}
            onClick={() => router.push(`/copy/${funnelId}`)}
            className="gap-1.5 font-semibold"
          >
            Generate Copy
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Topbar>

        {/* Main + Right Sidebar */}
        <div className="flex flex-1 overflow-hidden">

          {/* Center scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">

              {/* Report header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Intelligence Report
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">{funnelName || '—'}</h1>
                  {formData && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.field_1_format} · {formData.field_4_price} {formData.field_4_currency} · {formData.field_7_channels.join(', ')}
                    </p>
                  )}
                </div>
                {call1 && call1.offer_score && call1.offer_score.overall > 0 && (
                  <div className="shrink-0 text-right">
                    <div className={cn('text-5xl font-bold tracking-tighter', scoreColor(call1.offer_score.overall))}>
                      {call1.offer_score.overall}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Offer Score · Grade {scoreGrade(call1.offer_score.overall)}
                    </div>
                  </div>
                )}
              </div>

              {/* Score Summary */}
              {call1?.score_summary && (
                <Card className="border-l-2 border-l-primary">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {call1.score_summary}
                  </p>
                </Card>
              )}

              <SectionDivider label="Structural Intelligence" color="amber" />

              {/* Score dimensions + Health */}
              <div className="grid grid-cols-2 gap-4">
                {/* Score card */}
                <Card>
                  <SectionHeader icon={<BarChart3 className="w-3.5 h-3.5" />} label="Offer Score Breakdown" />
                  {call1?.offer_score ? (
                    <div className="space-y-2.5">
                      {[
                        ['Market Viability', call1.offer_score.market_viability],
                        ['Audience Clarity', call1.offer_score.audience_clarity],
                        ['Offer Strength', call1.offer_score.offer_strength],
                        ['Price / Value Alignment', call1.offer_score.price_value_alignment],
                        ['Uniqueness', call1.offer_score.uniqueness],
                        ['Proof Strength', call1.offer_score.proof_strength],
                        ['Conversion Readiness', call1.offer_score.conversion_readiness],
                      ].map(([label, val]) => (
                        <ScoreBar key={label as string} label={label as string} value={val as number} />
                      ))}
                    </div>
                  ) : <StreamingPlaceholder />}
                </Card>

                {/* Health score card */}
                <Card>
                  <SectionHeader icon={<Shield className="w-3.5 h-3.5" />} label="Funnel Health Score" />
                  {call1 && call1.funnel_health_score && call1.funnel_health_score.score > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-end gap-3">
                        <span className={cn('text-5xl font-bold tracking-tighter', scoreColor(call1.funnel_health_score.score))}>
                          {call1.funnel_health_score.score}
                        </span>
                        <div className="pb-1 space-y-0.5">
                          <div className="text-xs text-muted-foreground">
                            Cold CVR: <strong className="text-foreground">{call1.funnel_health_score.cvr_cold_traffic}</strong>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Warm CVR: <strong className="text-foreground">{call1.funnel_health_score.cvr_warm_traffic}</strong>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Rev/Lead: <strong className="text-foreground">{call1.funnel_health_score.revenue_per_lead_estimate}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Primary Leakage
                        </div>
                        <p className="text-sm text-amber-400">{call1.funnel_health_score.primary_leakage_point}</p>
                        <p className="text-xs text-muted-foreground">{call1.funnel_health_score.primary_leakage_cause}</p>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Top Fixes
                        </div>
                        {[call1.funnel_health_score.fix_1, call1.funnel_health_score.fix_2, call1.funnel_health_score.fix_3].map((fix, i) => fix && (
                          <div key={i} className="flex gap-2 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{fix}</span>
                          </div>
                        ))}
                      </div>
                      {call1.funnel_health_score.validation_required_before_scaling && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          Validate before scaling
                        </div>
                      )}
                    </div>
                  ) : <StreamingPlaceholder />}
                </Card>
              </div>

              {/* Revenue Model */}
              <Card>
                <SectionHeader icon={<DollarSign className="w-3.5 h-3.5" />} label="Revenue Model Architecture" />
                <PreformattedSection text={call1?.revenue_model_architecture || ''} />
              </Card>

              {/* Pain Points */}
              <Card>
                <SectionHeader icon={<Target className="w-3.5 h-3.5" />} label="Pain Point Mapping" badge="5-7 Points" />
                <PreformattedSection text={call1?.pain_point_mapping || ''} />
              </Card>

              {/* Funnel Blueprint */}
              <Card>
                <SectionHeader icon={<Layers className="w-3.5 h-3.5" />} label="Funnel Structure Blueprint" />
                <PreformattedSection text={call1?.funnel_structure_blueprint || ''} />
              </Card>

              {/* 2-col: Pricing + Bonuses */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <SectionHeader icon={<TrendingUp className="w-3.5 h-3.5" />} label="Pricing Strategy" />
                  <PreformattedSection text={call1?.pricing_strategy || ''} />
                </Card>
                <Card>
                  <SectionHeader icon={<Sparkles className="w-3.5 h-3.5" />} label="Strategic Bonus Stack" />
                  <PreformattedSection text={call1?.strategic_bonus_recommendations || ''} />
                </Card>
              </div>

              {/* Upsell paths */}
              <Card>
                <SectionHeader icon={<ChevronRight className="w-3.5 h-3.5" />} label="Upsell & Downsell Paths" />
                <PreformattedSection text={call1?.upsell_downsell_paths || ''} />
              </Card>

              {/* Design Intelligence */}
              <Card>
                <SectionHeader icon={<FileText className="w-3.5 h-3.5" />} label="Design Intelligence" />
                <PreformattedSection text={call1?.design_intelligence_recommendation || ''} />
              </Card>

              {/* Platform Priority Matrix */}
              {call1 && call1.platform_priority_matrix?.primary?.platform && (
                <div>
                  <SectionHeader icon={<Globe className="w-3.5 h-3.5" />} label="Platform Priority Matrix" />
                  <div className="grid grid-cols-3 gap-3">
                    <PlatformCard
                      rank={1}
                      platform={call1.platform_priority_matrix.primary.platform}
                      allocation={call1.platform_priority_matrix.primary.budget_allocation}
                      objective={call1.platform_priority_matrix.primary.campaign_objective}
                      cpl={call1.platform_priority_matrix.primary.cold_cpl_estimate}
                      rationale={call1.platform_priority_matrix.primary.rationale}
                    />
                    <PlatformCard
                      rank={2}
                      platform={call1.platform_priority_matrix.secondary.platform}
                      allocation={call1.platform_priority_matrix.secondary.budget_allocation}
                      objective={call1.platform_priority_matrix.secondary.campaign_objective}
                      cpl={call1.platform_priority_matrix.secondary.cold_cpl_estimate}
                      rationale={call1.platform_priority_matrix.secondary.rationale}
                    />
                    <PlatformCard
                      rank={3}
                      platform={call1.platform_priority_matrix.tertiary.platform}
                      allocation={call1.platform_priority_matrix.tertiary.budget_allocation}
                      objective={call1.platform_priority_matrix.tertiary.campaign_objective}
                      cpl={call1.platform_priority_matrix.tertiary.cold_cpl_estimate}
                      rationale={call1.platform_priority_matrix.tertiary.rationale}
                    />
                  </div>
                  {call1.platform_priority_matrix.high_risk_warning && (
                    <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {call1.platform_priority_matrix.high_risk_warning}
                    </div>
                  )}
                  {call1.platform_priority_matrix.hold?.platforms?.length > 0 && (
                    <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
                      <span className="font-semibold shrink-0">Hold:</span>
                      {call1.platform_priority_matrix.hold.platforms.join(', ')} — {call1.platform_priority_matrix.hold.reason}
                    </div>
                  )}
                </div>
              )}

              <SectionDivider label="Strategic Intelligence — Opus" color="violet" />

              {/* Positioning Analysis */}
              <Card>
                <SectionHeader icon={<Target className="w-3.5 h-3.5" />} label="Offer Positioning Analysis" badge="Opus" />
                <NarrativeText text={call2?.offer_positioning_analysis || ''} />
              </Card>

              {/* Persona */}
              <Card>
                <SectionHeader icon={<Users className="w-3.5 h-3.5" />} label="Target Persona Intelligence" badge="Opus" />
                <PreformattedSection text={call2?.target_persona_intelligence || ''} />
              </Card>

              {/* Hooks */}
              <Card>
                <SectionHeader icon={<Zap className="w-3.5 h-3.5" />} label="Conversion Hook Library" badge="5 Hooks" />
                <PreformattedSection text={call2?.conversion_hook_library || ''} />
              </Card>

              {/* Messaging matrix */}
              <Card>
                <SectionHeader icon={<MessageSquare className="w-3.5 h-3.5" />} label="Messaging Angle Matrix" />
                <PreformattedSection text={call2?.messaging_angle_matrix || ''} />
              </Card>

              {/* Value Perception */}
              <Card>
                <SectionHeader icon={<BarChart3 className="w-3.5 h-3.5" />} label="Core Value Perception" />
                <NarrativeText text={call2?.product_core_value_perception || ''} />
              </Card>

              {/* Scenarios */}
              <Card>
                <SectionHeader icon={<Users className="w-3.5 h-3.5" />} label="Real-World Operator Scenarios" />
                <PreformattedSection text={call2?.real_world_use_case_scenarios || ''} />
              </Card>

              {/* Monetization Narrative — crown jewel */}
              <Card className="border-primary/20 bg-primary/[0.02]">
                <SectionHeader icon={<Sparkles className="w-3.5 h-3.5" />} label="Monetization Strategy Narrative" badge="Master Strategy" />
                <NarrativeText text={call2?.monetization_strategy_narrative || ''} />
              </Card>

              {/* CTA bottom */}
              {phase === 'done' && (
                <div className="flex justify-center pt-4 pb-8">
                  <Button
                    size="lg"
                    onClick={() => router.push(`/copy/${funnelId}`)}
                    className="gap-2 font-bold px-8"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Sales Copy
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

            </div>
          </div>

          {/* Right sidebar — quick nav */}
          <div className="w-52 shrink-0 border-l border-border bg-card overflow-y-auto hidden xl:block">
            <div className="p-4 sticky top-0 bg-card border-b border-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sections</p>
            </div>
            <nav className="p-2 space-y-0.5 text-xs">
              {[
                ['Offer Score', ''],
                ['Funnel Health', ''],
                ['Revenue Model', ''],
                ['Pain Points', ''],
                ['Funnel Blueprint', ''],
                ['Pricing', ''],
                ['Upsell Paths', ''],
                ['Bonuses', ''],
                ['Design', ''],
                ['Platforms', ''],
                ['Positioning', 'Opus'],
                ['Persona', 'Opus'],
                ['Hooks', 'Opus'],
                ['Messaging', 'Opus'],
                ['Value Perception', 'Opus'],
                ['Scenarios', 'Opus'],
                ['Strategy Narrative', 'Opus'],
              ].map(([label, badge]) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <span>{label}</span>
                  {badge && <span className="text-[9px] text-violet-400 font-bold">{badge}</span>}
                </div>
              ))}
            </nav>
          </div>

        </div>
      </div>
    </div>
  );
}
