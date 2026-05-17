'use client';

import React, { use, useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import {
  Zap, Copy, RefreshCw, TrendingUp, DollarSign, Target, Sparkles,
  AlertTriangle, Check, ChevronRight, Play, ArrowRight, Lock, ShieldAlert,
  PieChart, Calendar, Clock, ExternalLink, ChevronDown, CheckCircle2, Eye, FileText, Globe
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FunnelSidebar } from '@/components/layout/FunnelSidebar';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId =
  | 'platform_priority_narrative'
  | 'omnichannel_ad_copy_matrix'
  | 'google_ads_copy_matrix'
  | 'vsl_ugc_video_script_intelligence'
  | 'media_buying_strategy_report'
  | 'traffic_funnel_alignment'
  | 'competitive_acquisition_intelligence'
  | 'launch_sequence_recommendation';

interface SectionConfig {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  sub: string;
  badge: string;
  gradient: string;
}

const SECTIONS: SectionConfig[] = [
  { 
    id: 'platform_priority_narrative', 
    label: 'Platform Strategy', 
    icon: <TrendingUp className="w-4 h-4" />, 
    sub: 'Platform Priority &conviction', 
    badge: 'Strategic WHY',
    gradient: 'from-amber-500/10 to-orange-500/5 border-amber-500/20'
  },
  { 
    id: 'omnichannel_ad_copy_matrix', 
    label: 'Meta Ad Matrix', 
    icon: <Target className="w-4 h-4" />, 
    sub: '3 Complete Instagram/FB Ads', 
    badge: 'Paid Social',
    gradient: 'from-sky-500/10 to-blue-500/5 border-sky-500/20'
  },
  { 
    id: 'google_ads_copy_matrix', 
    label: 'Google Search Ads', 
    icon: <Sparkles className="w-4 h-4" />, 
    sub: 'Responsive Search Ads', 
    badge: 'Intent Search',
    gradient: 'from-purple-500/10 to-indigo-500/5 border-purple-500/20'
  },
  { 
    id: 'vsl_ugc_video_script_intelligence', 
    label: 'Video Script Lab', 
    icon: <Zap className="w-4 h-4" />, 
    sub: 'VSL & UGC Script Blueprints', 
    badge: 'Video Creative',
    gradient: 'from-rose-500/10 to-pink-500/5 border-rose-500/20'
  },
  { 
    id: 'media_buying_strategy_report', 
    label: 'Media Buying Plan', 
    icon: <DollarSign className="w-4 h-4" />, 
    sub: '3-Phase Budget & Audiences', 
    badge: 'Operational Plan',
    gradient: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20'
  },
  { 
    id: 'traffic_funnel_alignment', 
    label: 'Funnel Alignment', 
    icon: <AlertTriangle className="w-4 h-4" />, 
    sub: 'Message Match & Flow', 
    badge: 'Architecture Integration',
    gradient: 'from-violet-500/10 to-purple-500/5 border-violet-500/20'
  },
  { 
    id: 'competitive_acquisition_intelligence', 
    label: 'Competitive Edge', 
    icon: <ChevronRight className="w-4 h-4" />, 
    sub: 'Saturation Gap & 3 Tactics', 
    badge: 'Differentiation',
    gradient: 'from-fuchsia-500/10 to-rose-500/5 border-fuchsia-500/20'
  },
  { 
    id: 'launch_sequence_recommendation', 
    label: '21-Day Launch Map', 
    icon: <Check className="w-4 h-4" />, 
    sub: 'Daily Validation Roadmap', 
    badge: 'Launch Blueprint',
    gradient: 'from-teal-500/10 to-emerald-500/5 border-teal-500/20'
  },
];

const GEN_STEPS = [
  'Extracting contextual details from Call 1 structural blueprint…',
  'Mapping psychological vectors from Call 2 strategic narrative…',
  'Calibrating media buying benchmarks from 35,000+ comparable funnels…',
  'Synthesizing platform specific ad copies & hooks…',
  'Architecting video script hook sequences & directions…',
  'Drafting the 21-day paid traffic validation checklist…',
];

// ─── Parsers for structured UI cards ───────────────────────────────────────────

function parseMetaAds(text: string) {
  if (!text) return [];
  const blocks = text.split(/(?=AD VARIANT\s*\d+|VARIANT\s*\d+)/i).filter(b => b.trim().length > 20);
  return blocks.map((block, index) => {
    const hook = block.match(/HOOK:\s*(.*)/i)?.[1]?.trim() || `Hook ${index + 1}`;
    const audience = block.match(/AUDIENCE TYPE:\s*(.*)/i)?.[1]?.trim() || 'Cold Traffic';
    const objective = block.match(/CAMPAIGN OBJECTIVE:\s*(.*)/i)?.[1]?.trim() || 'Conversion';
    const primaryText = block.match(/PRIMARY TEXT:\s*([\s\S]*?)(?=HEADLINE:|$)/i)?.[1]?.trim() || '';
    const headline = block.match(/HEADLINE:\s*(.*)/i)?.[1]?.trim() || 'Discover the Solution';
    const linkDescription = block.match(/LINK DESCRIPTION:\s*(.*)/i)?.[1]?.trim() || '';
    const ctaButton = block.match(/CTA BUTTON:\s*(.*)/i)?.[1]?.trim() || 'Learn More';
    const performance = block.match(/PERFORMANCE ANALYSIS:\s*([\s\S]*?)$/i)?.[1]?.trim() || '';
    return { hook, audience, objective, primaryText, headline, linkDescription, ctaButton, performance };
  });
}

function parseGoogleAds(text: string) {
  if (!text) return [];
  const blocks = text.split(/(?=SEARCH AD\s*\d+)/i).filter(b => b.trim().length > 20);
  return blocks.map((block, index) => {
    const keyword = block.match(/KEYWORD INTENT:\s*(.*)/i)?.[1]?.trim() || 'Core Query';
    const headlines: string[] = [];
    const hMatches = block.matchAll(/H\d+:\s*(.*)/gi);
    for (const m of hMatches) {
      if (m[1]) headlines.push(m[1].trim());
    }
    const descriptions: string[] = [];
    const dMatches = block.matchAll(/D\d+:\s*(.*)/gi);
    for (const m of dMatches) {
      if (m[1]) descriptions.push(m[1].trim());
    }
    const matchType = block.match(/MATCH TYPE:\s*(.*)/i)?.[1]?.trim() || 'Phrase Match';
    const negativeKeywords = block.match(/NEGATIVE KEYWORDS TO ADD:\s*(.*)/i)?.[1]?.trim() || 'Competitor brands';
    return { keyword, headlines: headlines.length > 0 ? headlines : ['Premium Solution'], descriptions: descriptions.length > 0 ? descriptions : ['Get started today'], matchType, negativeKeywords };
  });
}

function parseVideoScripts(text: string) {
  if (!text) return [];
  const blocks = text.split(/(?=SCRIPT\s*\d+|SCRIPT\s*1|SCRIPT\s*2)/i).filter(b => b.trim().length > 20);
  return blocks.map((block) => {
    const title = block.match(/(SCRIPT\s*\d+\s*[—-]\s*[^\n]+|SCRIPT\s*\d+\s*[^\n]+)/i)?.[0]?.trim() || 'Video Script Blueprint';
    const length = block.match(/RECOMMENDED LENGTH:\s*(.*)/i)?.[1]?.trim() || '60 seconds';
    const tone = block.match(/TONE DIRECTION:\s*(.*)/i)?.[1]?.trim() || 'Authoritative & Warm';
    
    const cues: { time: string; action: string; direction: string }[] = [];
    const lines = block.split('\n');
    lines.forEach(line => {
      const match = line.match(/^(\d+:\d+\s*–\s*\d+:\d+|\d+:\d+\s*-\s*\d+:\d+|\d+:\d+)\s*\|\s*([^:]+):\s*(.*)/i);
      if (match) {
        cues.push({
          time: match[1].trim(),
          action: match[2].trim(),
          direction: match[3].trim(),
        });
      }
    });

    const successFactor = block.match(/CRITICAL SUCCESS FACTOR:\s*([\s\S]*?)$/i)?.[1]?.trim() || '';
    return { title, length, tone, cues, successFactor, rawText: block };
  });
}

function parseMediaBuying(text: string) {
  if (!text) return [];
  const blocks = text.split(/(?=PHASE\s*\d+)/i).filter(b => b.trim().length > 20);
  return blocks.map((block) => {
    const title = block.match(/(PHASE\s*\d+\s*[—-]\s*[^\n]+|PHASE\s*\d+\s*[^\n]+)/i)?.[0]?.trim() || 'Validation Phase';
    const budget = block.match(/DAILY BUDGET:\s*(.*)/i)?.[1]?.trim() || '$100/day';
    const objective = block.match(/CAMPAIGN OBJECTIVE:\s*(.*)/i)?.[1]?.trim() || 'Conversion';
    const coldAudience = block.match(/COLD AUDIENCE DEFINITION:\s*(.*)/i)?.[1]?.trim() || 'Broad targeting';
    const creativeTesting = block.match(/CREATIVE TESTING APPROACH:\s*(.*)/i)?.[1]?.trim() || 'A/B Hook testing';
    const successThreshold = block.match(/SUCCESS THRESHOLD:\s*(.*)/i)?.[1]?.trim() || 'CPL under target';
    const pauseThreshold = block.match(/PAUSE THRESHOLD:\s*(.*)/i)?.[1]?.trim() || 'CPL exceeds threshold';
    const pixelEvents = block.match(/PIXEL EVENTS TO TRACK:\s*(.*)/i)?.[1]?.trim() || 'Lead & Purchase';
    return { title, budget, objective, coldAudience, creativeTesting, successThreshold, pauseThreshold, pixelEvents, rawText: block };
  });
}

// ─── Sub-renderers ─────────────────────────────────────────────────────────────

function TextRenderer({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="space-y-4 text-foreground/80 leading-relaxed text-[15px]">
      {text.split('\n').map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        if (trimmed.startsWith('###')) {
          return <h3 key={i} className="text-lg font-bold text-white mt-6 mb-2">{trimmed.replace(/^###\s*/, '')}</h3>;
        }
        if (trimmed.startsWith('##')) {
          return <h2 key={i} className="text-xl font-extrabold text-white mt-8 mb-3">{trimmed.replace(/^##\s*/, '')}</h2>;
        }
        if (trimmed.startsWith('#')) {
          return <h1 key={i} className="text-2xl font-black text-white mt-8 mb-4">{trimmed.replace(/^#\s*/, '')}</h1>;
        }
        
        let prefixNode = null;
        let mainText = trimmed;
        const keyRegex = /^([A-Z0-9_\s]+:|STAGE:|PHASE.*?:|TACTIC.*?:|WEEK.*?:|PRE-LAUNCH.*?:|Day\s*\d+:)(.*)/;
        const match = trimmed.match(keyRegex);
        if (match) {
          prefixNode = <strong className="text-white font-semibold mr-1.5">{match[1]}</strong>;
          mainText = match[2];
        }

        const fragments = mainText.split(/(\*\*.*?\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        });

        return (
          <p key={i} className={cn("text-[15px] font-normal", prefixNode && "mt-3")}>
            {prefixNode}
            {fragments}
          </p>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TrafficIntelligencePage({
  params,
}: {
  params: Promise<{ funnelId: string }>;
}) {
  const { funnelId } = use(params);

  const [funnelName, setFunnelName] = useState('Your Funnel');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionId>('platform_priority_narrative');
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');

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
    }, 4500);

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
      toast.success('Traffic Intelligence successfully generated!');
    } catch (e: any) {
      clearInterval(interval);
      toast.error(e.message || 'Failed to generate');
    } finally {
      setGenerating(false);
      setGenStep(0);
    }
  };

  const handleCopySection = () => {
    if (!data) return;
    const content = data[activeSection] || '';
    navigator.clipboard.writeText(content);
    toast.success('Section content copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner size="md" color="muted" />
      </div>
    );
  }

  const activeConfig = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];
  const activeContent = data ? (data[activeSection] || '') : '';

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] relative text-white font-sans">
      {/* Framer style dynamic background noise and radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background pointer-events-none -z-10" />
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.06)_0%,_rgba(236,72,153,0)_70%)] rotate-[-30deg] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.06)_0%,_rgba(59,130,246,0)_70%)] rotate-[30deg] pointer-events-none -z-10" />

      {generating && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center">
          <div className="w-full max-w-md mx-auto px-6 text-center flex flex-col items-center">
            <div className="relative w-24 h-24 mb-8">
              <svg className="animate-spin w-full h-full text-brand-yellow" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                {Math.min(100, Math.round(((genStep + 1) / (GEN_STEPS.length + 1)) * 100))}%
              </div>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Synthesizing Traffic Engine</h2>
            <p className="text-sm font-semibold text-muted-foreground animate-pulse min-h-[40px] px-4">
              {GEN_STEPS[Math.min(genStep, GEN_STEPS.length - 1)]}
            </p>
            <div className="w-64 h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-brand-yellow rounded-full transition-all duration-700" style={{ width: `${Math.round(((genStep + 1) / (GEN_STEPS.length + 1)) * 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <Topbar
          breadcrumbs={[
            { label: 'Funnels', href: `/funnels/${funnelId}` },
            { label: funnelName, href: '#' },
            { label: 'Traffic Intelligence™' },
          ]}
          actions={
            data ? (
              <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generating} className="gap-1.5 font-semibold text-white border-white/10 hover:bg-white/5">
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate All
              </Button>
            ) : undefined
          }
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Funnel secondary sidebar (collapsible icon rail) */}
          <FunnelSidebar funnelId={funnelId} funnelName={funnelName} collapsible />
          
          {/* Left Navigation Rails - Section selection */}
          <div className="w-[260px] border-r border-white/5 bg-card/10 backdrop-blur-2xl flex flex-col overflow-hidden flex-shrink-0">
            <div className="px-4 py-4 border-b border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Operational Channels</p>
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5 mb-2">
                <TrendingUp className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                <span className="text-xs font-bold text-white truncate">{funnelName}</span>
              </div>
              {data && (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse" />
                  <span className="text-[11px] font-bold text-brand-yellow">Calibrated Phase 3 Active</span>
                </div>
              )}
            </div>

            {data && (
              <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
                {SECTIONS.map(s => {
                  const isActive = activeSection === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className={cn(
                        "w-full text-left rounded-xl px-3 py-3 border transition-all flex items-start gap-3 group relative",
                        isActive
                          ? "bg-brand-yellow/10 border-brand-yellow/30 shadow-[inset_0_0_0_1px_rgba(245,166,35,0.05)]"
                          : "border-transparent hover:bg-white/[0.03] text-muted-foreground hover:text-white"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                        isActive ? "bg-brand-yellow text-black" : "bg-white/5 text-muted-foreground group-hover:text-white"
                      )}>
                        {s.icon}
                      </div>
                      <div className="truncate">
                        <p className={cn("text-xs font-bold transition-colors", isActive ? "text-white" : "text-muted-foreground group-hover:text-white")}>
                          {s.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground/75 truncate mt-0.5">{s.sub}</p>
                      </div>
                      {isActive && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <ChevronRight className="w-3.5 h-3.5 text-brand-yellow" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {!data && (
              <div className="flex-1 flex items-center justify-center px-6 text-center">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Unlock premium platform priority narrative, ad copy matrices, VSL video scripts, and validation timeline.
                </p>
              </div>
            )}

            {data && (
              <div className="p-4 border-t border-white/5 bg-[#030712]">
                <button
                  onClick={handleGenerate}
                  className="w-full h-10 bg-brand-yellow text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-brand-yellow/90 transition-all hover:scale-[1.02] shadow-lg shadow-brand-yellow/10"
                >
                  <Zap className="w-4 h-4" />
                  Regenerate Engine
                </button>
              </div>
            )}
          </div>

          {/* Central main dashboard panel */}
          <div className="flex-1 overflow-y-auto bg-transparent custom-scrollbar flex flex-col">
            {!data ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 max-w-xl mx-auto">
                <div className="relative w-20 h-20 mb-8 rounded-[2rem] bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center animate-pulse">
                  <TrendingUp className="w-10 h-10 text-brand-yellow" />
                  <div className="absolute inset-0 bg-brand-yellow/5 blur-xl rounded-full" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white mb-2">Traffic Intelligence Suite</h2>
                <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed">
                  Synthesize an direct-response acquisition strategy based on 35,000+ comparable funnels. Receive platform priority matrices, full ad copies, 5-minute video scripts, and a 21-day validation dashboard.
                </p>
                <Button size="lg" onClick={handleGenerate} disabled={generating} className="bg-brand-yellow text-black font-black hover:bg-brand-yellow/90 h-12 px-8 rounded-xl shadow-xl shadow-brand-yellow/5">
                  {generating ? <Spinner size="sm" color="white" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Synthesize Traffic Strategy
                </Button>
              </div>
            ) : (
              <div className="max-w-5xl w-full mx-auto px-6 lg:px-12 py-10 pb-32">
                
                {/* Visual / Raw Toggle tab and Copy buttons */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-8">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-brand-yellow/20 bg-brand-yellow/10 text-brand-yellow/90">
                      {activeConfig.badge}
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-tight mt-2">{activeConfig.label}</h1>
                    <p className="text-xs text-muted-foreground mt-1">{activeConfig.sub}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/5 border border-white/5 p-1 rounded-lg flex items-center">
                      <button 
                        onClick={() => setViewMode('visual')}
                        className={cn("px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5", viewMode === 'visual' ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white")}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Visual Dashboard
                      </button>
                      <button 
                        onClick={() => setViewMode('raw')}
                        className={cn("px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5", viewMode === 'raw' ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white")}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Raw Analysis
                      </button>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopySection} className="text-white/60 hover:text-white border-white/10 bg-white/5 hover:bg-white/10 gap-1.5">
                      <Copy className="w-3.5 h-3.5" />
                      Copy Content
                    </Button>
                  </div>
                </div>

                {/* Conditional rendering based on mode */}
                {viewMode === 'raw' ? (
                  <div className="bg-[#0b0f19] border border-white/5 rounded-3xl p-8 shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
                    <TextRenderer text={activeContent} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Render visual dashboards unique for each section */}
                    
                    {/* 1. platform_priority_narrative */}
                    {activeSection === 'platform_priority_narrative' && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />
                          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-brand-yellow" />
                            Direct-Response Media Strategy
                          </h2>
                          <div className="text-[16px] text-white/90 leading-relaxed font-normal space-y-4">
                            <TextRenderer text={activeContent} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                            <h4 className="text-xs font-bold text-brand-yellow uppercase tracking-widest mb-2">Platform Selection Rationale</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Calibrated based on primary demographics, price elasticity, and specific outcomes outlined in Call 1. Designed to produce the first cash-flow event in the shortest possible validation window.
                            </p>
                          </div>
                          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                            <h4 className="text-xs font-bold text-brand-yellow uppercase tracking-widest mb-2">Operational Risk Management</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Identifies specific saturation flags, ad frequency thresholds, and pixel capture misalignments that threaten initial scaling viability.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. omnichannel_ad_copy_matrix */}
                    {activeSection === 'omnichannel_ad_copy_matrix' && (
                      <div className="space-y-6">
                        {parseMetaAds(activeContent).length === 0 ? (
                          <div className="bg-[#0b0f19] border border-white/5 rounded-3xl p-8">
                            <TextRenderer text={activeContent} />
                          </div>
                        ) : (
                          parseMetaAds(activeContent).map((ad, idx) => (
                            <div key={idx} className="bg-[#0b0f19] border border-white/5 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-white/10 group">
                              <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/5">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wide">
                                    Ad Variant {idx + 1}
                                  </span>
                                  <h3 className="text-sm font-black text-white">{ad.hook}</h3>
                                </div>
                                <span className="text-[11px] font-bold text-muted-foreground">
                                  Target: <span className="text-white">{ad.audience}</span>
                                </span>
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-12">
                                {/* Left column - Simulated Facebook/Insta Mock */}
                                <div className="lg:col-span-8 p-6 border-r border-white/5 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-9 h-9 rounded-full bg-brand-yellow flex items-center justify-center text-black font-black text-xs">
                                        IQ
                                      </div>
                                      <div>
                                        <p className="text-xs font-black text-white">OfferIQ Advertiser</p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">Sponsored · <Globe className="w-2.5 h-2.5" /></p>
                                      </div>
                                    </div>
                                    <p className="text-sm text-white/90 leading-relaxed mb-4 whitespace-pre-line font-normal">{ad.primaryText}</p>
                                  </div>
                                  
                                  {/* Simulated Ad Visual Placeholder */}
                                  <div className="border border-white/5 bg-white/[0.02] rounded-xl overflow-hidden mb-4">
                                    <div className="aspect-video relative bg-[#0e1320] flex flex-col items-center justify-center text-center p-6 border-b border-white/5">
                                      <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-3">
                                        <Sparkles className="w-5 h-5 text-sky-400" />
                                      </div>
                                      <p className="text-xs font-bold text-white mb-1">High-Fidelity 3D Visual Asset Recommendation</p>
                                      <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">
                                        Render an abstract mock representation matching: "{ad.hook}"
                                      </p>
                                    </div>
                                    <div className="bg-[#121824] px-4 py-3 flex items-center justify-between">
                                      <div>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{ad.linkDescription || 'OFFER-IQ EXCLUSIVE'}</p>
                                        <p className="text-sm font-black text-white mt-0.5">{ad.headline}</p>
                                      </div>
                                      <span className="text-xs font-bold px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg border border-white/5">
                                        {ad.ctaButton}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* Right column - Performance Analysis */}
                                <div className="lg:col-span-4 p-6 bg-white/[0.01] flex flex-col justify-between">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-1">Campaign Objective</h4>
                                      <p className="text-xs text-white font-bold">{ad.objective}</p>
                                    </div>
                                    <div className="pt-4 border-t border-white/5">
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-yellow mb-2">Performance Intelligence</h4>
                                      <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line font-normal">{ad.performance}</p>
                                    </div>
                                  </div>
                                  <Button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(`Headline: ${ad.headline}\n\nPrimary Text:\n${ad.primaryText}\n\nCTA: ${ad.ctaButton}`);
                                      toast.success('Ad creative copied!');
                                    }}
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full text-white/60 hover:text-white border-white/10 mt-6"
                                  >
                                    Copy Ad Assets
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* 3. google_ads_copy_matrix */}
                    {activeSection === 'google_ads_copy_matrix' && (
                      <div className="space-y-6">
                        {parseGoogleAds(activeContent).length === 0 ? (
                          <div className="bg-[#0b0f19] border border-white/5 rounded-3xl p-8">
                            <TextRenderer text={activeContent} />
                          </div>
                        ) : (
                          parseGoogleAds(activeContent).map((search, idx) => (
                            <div key={idx} className="bg-[#0b0f19] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wide">
                                    Search Ad {idx + 1}
                                  </span>
                                  <span className="text-xs font-bold text-muted-foreground">
                                    Intent Match: <span className="text-white font-black">"{search.keyword}"</span>
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-purple-400 bg-purple-400/5 px-2 py-0.5 rounded border border-purple-400/10">
                                  {search.matchType}
                                </span>
                              </div>

                              {/* Google Search Mockup */}
                              <div className="bg-[#0e1320] border border-white/5 rounded-2xl p-5 max-w-2xl mb-6">
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2">
                                  <span className="font-bold text-white">Google Ad</span>
                                  <span>·</span>
                                  <span>https://yourdomain.com/funnel</span>
                                </div>
                                <div className="text-base text-blue-400 font-medium hover:underline cursor-pointer leading-tight mb-2 flex items-center gap-1.5 flex-wrap">
                                  {search.headlines.slice(0, 3).map((hl, hidx) => (
                                    <React.Fragment key={hidx}>
                                      {hidx > 0 && <span className="text-white/40">|</span>}
                                      <span>{hl}</span>
                                    </React.Fragment>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                                  {search.descriptions.join(' ')}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">All Configured Headlines</h4>
                                  <div className="space-y-1">
                                    {search.headlines.map((hl, hlIdx) => (
                                      <div key={hlIdx} className="flex items-center gap-2 text-xs py-1 border-b border-white/[0.03] last:border-b-0">
                                        <span className="text-muted-foreground w-6 font-bold">H{hlIdx + 1}:</span>
                                        <span className="text-white font-medium">{hl}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-yellow mb-3">Negative Keywords to Add</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {search.negativeKeywords.split(/[,;\n]/).map((nk, nkIdx) => {
                                      const word = nk.replace(/[\[\]-]/g, '').trim();
                                      if (!word) return null;
                                      return (
                                        <span key={nkIdx} className="text-xs px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg font-mono">
                                          -[{word}]
                                        </span>
                                      );
                                    })}
                                  </div>
                                  <div className="mt-6 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Target Keyword Rationale</h5>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                      Eliminates high-cost low-intent query bleed. Focuses budget only on buyers searching for transformational mechanisms.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* 4. vsl_ugc_video_script_intelligence */}
                    {activeSection === 'vsl_ugc_video_script_intelligence' && (
                      <div className="space-y-6">
                        {parseVideoScripts(activeContent).length === 0 ? (
                          <div className="bg-[#0b0f19] border border-white/5 rounded-3xl p-8">
                            <TextRenderer text={activeContent} />
                          </div>
                        ) : (
                          parseVideoScripts(activeContent).map((script, idx) => (
                            <div key={idx} className="bg-[#0b0f19] border border-white/5 rounded-3xl p-6 shadow-2xl">
                              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                                <div>
                                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wide">
                                    Script Variant {idx + 1}
                                  </span>
                                  <h3 className="text-xl font-black text-white mt-2">{script.title}</h3>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-rose-400 flex items-center gap-1.5 justify-end">
                                    <Clock className="w-3.5 h-3.5" />
                                    {script.length}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">Tone: {script.tone}</p>
                                </div>
                              </div>

                              {/* Script Cues Timeline */}
                              <div className="space-y-4 mb-6 relative">
                                <div className="absolute top-[20px] bottom-[20px] left-[39px] w-[2px] bg-white/5" />
                                
                                {script.cues.map((cue, cIdx) => (
                                  <div key={cIdx} className="flex gap-4 items-start relative group">
                                    <div className="w-[80px] text-xs font-mono font-bold text-rose-400 shrink-0 text-right pr-2 pt-2.5">
                                      {cue.time}
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-[#121824] border border-white/10 flex items-center justify-center shrink-0 mt-2.5 relative z-10 group-hover:border-rose-400/50 transition-colors">
                                      <Play className="w-2.5 h-2.5 text-white/50 group-hover:text-rose-400 transition-colors" />
                                    </div>
                                    <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.02] transition-colors">
                                      <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1.5">{cue.action}</h5>
                                      <p className="text-sm text-white/80 leading-relaxed font-normal">{cue.direction}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {script.successFactor && (
                                <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 flex gap-3">
                                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                                  <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-0.5">Critical Success Factor</h4>
                                    <p className="text-xs text-white/70 leading-relaxed font-normal">{script.successFactor}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* 5. media_buying_strategy_report */}
                    {activeSection === 'media_buying_strategy_report' && (
                      <div className="space-y-6">
                        {parseMediaBuying(activeContent).length === 0 ? (
                          <div className="bg-[#0b0f19] border border-white/5 rounded-3xl p-8">
                            <TextRenderer text={activeContent} />
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {parseMediaBuying(activeContent).map((phase, pIdx) => (
                              <div key={pIdx} className="bg-[#0b0f19] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-[-30%] right-[-10%] w-80 h-80 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
                                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                                      Phase {pIdx + 1}
                                    </span>
                                    <h3 className="text-xl font-black text-white">{phase.title}</h3>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-black text-emerald-400 bg-emerald-400/5 border border-emerald-400/10 px-3 py-1.5 rounded-xl">
                                      Budget Target: {phase.budget}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Campaign Objective</h4>
                                    <p className="text-xs text-white/90 leading-relaxed font-semibold">{phase.objective}</p>
                                  </div>
                                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Cold Audience Definition</h4>
                                    <p className="text-xs text-white/90 leading-relaxed font-semibold">{phase.coldAudience}</p>
                                  </div>
                                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Creative Testing Approach</h4>
                                    <p className="text-xs text-white/90 leading-relaxed font-semibold">{phase.creativeTesting}</p>
                                  </div>
                                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 border-l-2 border-l-emerald-400">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Success KPI Threshold</h4>
                                    <p className="text-xs text-emerald-400 leading-relaxed font-black">{phase.successThreshold}</p>
                                  </div>
                                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 border-l-2 border-l-red-500">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Pause & Pivot Threshold</h4>
                                    <p className="text-xs text-red-400 leading-relaxed font-black">{phase.pauseThreshold}</p>
                                  </div>
                                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Conversion Pixel Events</h4>
                                    <p className="text-xs text-white/90 leading-relaxed font-semibold">{phase.pixelEvents}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 6. traffic_funnel_alignment */}
                    {activeSection === 'traffic_funnel_alignment' && (
                      <div className="bg-[#0b0f19] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-violet-500/5 blur-[150px] rounded-full pointer-events-none" />
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-violet-400" />
                          Acquisition & Funnel Integration Matrix
                        </h2>
                        <div className="text-[16px] text-white/95 leading-relaxed font-normal">
                          <TextRenderer text={activeContent} />
                        </div>
                      </div>
                    )}

                    {/* 7. competitive_acquisition_intelligence */}
                    {activeSection === 'competitive_acquisition_intelligence' && (
                      <div className="bg-[#0b0f19] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-fuchsia-500/5 blur-[150px] rounded-full pointer-events-none" />
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-fuchsia-400" />
                          Competitive Advantage Plan
                        </h2>
                        <div className="text-[16px] text-white/95 leading-relaxed font-normal">
                          <TextRenderer text={activeContent} />
                        </div>
                      </div>
                    )}

                    {/* 8. launch_sequence_recommendation */}
                    {activeSection === 'launch_sequence_recommendation' && (
                      <div className="bg-[#0b0f19] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-teal-500/5 blur-[150px] rounded-full pointer-events-none" />
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-teal-400" />
                          21-Day Validation Checklist
                        </h2>
                        <div className="text-[16px] text-white/95 leading-relaxed font-normal">
                          <TextRenderer text={activeContent} />
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
