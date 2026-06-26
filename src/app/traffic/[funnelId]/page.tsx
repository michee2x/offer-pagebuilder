"use client";

import React, { use, useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import {
  Zap,
  Copy,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Target,
  Sparkles,
  AlertTriangle,
  Check,
  ChevronRight,
  Play,
  ArrowRight,
  Lock,
  ShieldAlert,
  PieChart,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Eye,
  FileText,
  Globe,
  Video,
  Film,
  Mic,
  User,
  Smartphone,
  Clapperboard,
  Layers,
  Crosshair,
  Rocket,
  ListChecks,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FunnelSidebar } from "@/components/layout/FunnelSidebar";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId =
  | "platform_priority_narrative"
  | "omnichannel_ad_copy_matrix"
  | "google_ads_copy_matrix"
  | "vsl_video_script"
  | "ugc_video_script";

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
    id: "platform_priority_narrative",
    label: "Platform Strategy",
    icon: <TrendingUp className="w-4 h-4" />,
    sub: "Platform Priority &conviction",
    badge: "Strategic WHY",
    gradient: "from-amber-500/10 to-orange-500/5 border-amber-500/20",
  },
  {
    id: "omnichannel_ad_copy_matrix",
    label: "Facebook Ad Copies",
    icon: <Target className="w-4 h-4" />,
    sub: "3 Complete Instagram/FB Ads",
    badge: "Paid Social",
    gradient: "from-sky-500/10 to-blue-500/5 border-sky-500/20",
  },
  {
    id: "google_ads_copy_matrix",
    label: "Google Ad Copies",
    icon: <Sparkles className="w-4 h-4" />,
    sub: "Responsive Search Ads",
    badge: "Intent Search",
    gradient: "from-purple-500/10 to-indigo-500/5 border-purple-500/20",
  },
  {
    id: "vsl_video_script",
    label: "Video Sales Letter",
    icon: <Video className="w-4 h-4" />,
    sub: "3-5 Minutes Script",
    badge: "Video Content",
    gradient: "from-rose-500/10 to-red-500/5 border-rose-500/20",
  },
  {
    id: "ugc_video_script",
    label: "User Generated Content",
    icon: <Smartphone className="w-4 h-4" />,
    sub: "45-60 Seconds Script",
    badge: "Social Content",
    gradient: "from-violet-500/10 to-purple-500/5 border-violet-500/20",
  },
];

const GEN_STEPS = [
  "Extracting contextual details from Call 1 structural blueprint…",
  "Mapping psychological vectors from Call 2 strategic narrative…",
  "Synthesizing platform specific ad copies & hooks…",
  "Architecting video script hook sequences & directions…",
  "Finalizing traffic strategy generation…",
];

// ─── Parsers for structured UI cards ───────────────────────────────────────────

function parseMetaAds(text: string) {
  if (!text) return [];
  const blocks = text
    .split(/(?=AD VARIANT\s*\d+|VARIANT\s*\d+)/i)
    .filter((b) => b.trim().length > 20);
  return blocks.map((block, index) => {
    const hook =
      block.match(/HOOK:\s*(.*)/i)?.[1]?.trim() || `Hook ${index + 1}`;
    const audience =
      block.match(/AUDIENCE TYPE:\s*(.*)/i)?.[1]?.trim() || "Cold Traffic";
    const objective =
      block.match(/CAMPAIGN OBJECTIVE:\s*(.*)/i)?.[1]?.trim() || "Conversion";
    const primaryText =
      block.match(/PRIMARY TEXT:\s*([\s\S]*?)(?=HEADLINE:|$)/i)?.[1]?.trim() ||
      "";
    const headline =
      block.match(/HEADLINE:\s*(.*)/i)?.[1]?.trim() || "Discover the Solution";
    const linkDescription =
      block.match(/LINK DESCRIPTION:\s*(.*)/i)?.[1]?.trim() || "";
    const ctaButton =
      block.match(/CTA BUTTON:\s*(.*)/i)?.[1]?.trim() || "Learn More";
    const performance =
      block.match(/PERFORMANCE ANALYSIS:\s*([\s\S]*?)$/i)?.[1]?.trim() || "";
    return {
      hook,
      audience,
      objective,
      primaryText,
      headline,
      linkDescription,
      ctaButton,
      performance,
    };
  });
}

function parseGoogleAds(text: string) {
  if (!text) return [];
  const blocks = text
    .split(/(?=SEARCH AD\s*\d+)/i)
    .filter((b) => b.trim().length > 20);
  return blocks.map((block, index) => {
    const keyword =
      block.match(/KEYWORD INTENT:\s*(.*)/i)?.[1]?.trim() || "Core Query";
    const headlines: string[] = [];
    const hMatches = Array.from(block.matchAll(/H\d+:\s*(.*)/gi));
    for (const m of hMatches) {
      if (m[1]) headlines.push(m[1].trim());
    }
    const descriptions: string[] = [];
    const dMatches = Array.from(block.matchAll(/D\d+:\s*(.*)/gi));
    for (const m of dMatches) {
      if (m[1]) descriptions.push(m[1].trim());
    }
    const matchType =
      block.match(/MATCH TYPE:\s*(.*)/i)?.[1]?.trim() || "Phrase Match";
    const negativeKeywords =
      block.match(/NEGATIVE KEYWORDS TO ADD:\s*(.*)/i)?.[1]?.trim() ||
      "Competitor brands";
    return {
      keyword,
      headlines: headlines.length > 0 ? headlines : ["Premium Solution"],
      descriptions:
        descriptions.length > 0 ? descriptions : ["Get started today"],
      matchType,
      negativeKeywords,
    };
  });
}

function parseVideoScripts(text: string) {
  if (!text) return [];
  // Split on SCRIPT 1, SCRIPT 2, etc. — keep the SCRIPT header with each block
  const blocks = text
    .split(/(?=SCRIPT\s*\d+\s*(?:—|-|–|:|\n|\|))/i)
    .filter((b) => b.trim().length > 20);
  return blocks.map((block) => {
    const title =
      block
        .match(/(SCRIPT\s*\d+\s*(?:—|-|–)\s*[^\n]+)/i)?.[0]
        ?.trim() || "Video Script Blueprint";
    
    // Detect format type
    const isUGC = /UGC\s*FORMAT/i.test(title) || /UGC/i.test(block.split("\n")[0]);
    const isVSL = /VSL\s*FORMAT/i.test(title) || (!isUGC);
    const formatType = isUGC ? "UGC" : "VSL";
    
    // Extract the [For: ...] usage context
    const forContext = block.match(/\[For:\s*([^\]]+)\]/i)?.[1]?.trim() || 
      (isUGC ? "TikTok, Instagram Reels, YouTube Shorts" : "Sales page hero video, YouTube pre-roll, or Facebook video ad");
    
    const length =
      block.match(/RECOMMENDED LENGTH:\s*(.*)/i)?.[1]?.trim() || 
      (isUGC ? "45-60 seconds" : "3-5 minutes");
    const tone =
      block.match(/TONE DIRECTION:\s*([^\n]+)/i)?.[1]?.trim() ||
      "Authoritative & Warm";

    // UGC-specific fields
    const targetPlatform = block.match(/TARGET PLATFORM:\s*([^\n]+)/i)?.[1]?.trim() || "";
    const creatorDirection = block.match(/CREATOR DIRECTION:\s*([^\n]+)/i)?.[1]?.trim() || "";
    const authenticityNote = block.match(/AUTHENTICITY NOTE:\s*([^\n]+)/i)?.[1]?.trim() || "";

    // Parse timestamped cues — now also captures visual directions and delivery notes
    const cues: { time: string; action: string; direction: string; visualDirection?: string; deliveryNote?: string }[] = [];
    const lines = block.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match timecodes like 0:00 – 0:05, 0:00 - 0:05, 0:00–0:05
      const match = line.match(
        /^([\d]+:[\d]+\s*(?:–|-)\s*[\d]+:[\d]+|[\d]+:[\d]+)\s*\|\s*([^:]+):\s*(.*)/i,
      );
      if (match) {
        const cue: { time: string; action: string; direction: string; visualDirection?: string; deliveryNote?: string } = {
          time: match[1].trim(),
          action: match[2].trim(),
          direction: match[3].trim(),
        };
        
        // Look ahead for [Visual direction: ...] and [Delivery note: ...] lines
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const nextLine = lines[j].trim();
          // Stop if we hit another timecode or a major header
          if (/^[\d]+:[\d]+/.test(nextLine) || /^(?:CRITICAL|SCRIPT\s*\d)/i.test(nextLine)) break;
          
          const visualMatch = nextLine.match(/\[?\s*[Vv]isual\s*(?:direction)?:\s*(.*?)\]?$/);
          if (visualMatch) {
            cue.visualDirection = visualMatch[1].replace(/\]$/, "").trim();
          }
          const deliveryMatch = nextLine.match(/\[?\s*[Dd]elivery\s*(?:note)?:\s*(.*?)\]?$/);
          if (deliveryMatch) {
            cue.deliveryNote = deliveryMatch[1].replace(/\]$/, "").trim();
          }
        }
        
        cues.push(cue);
      }
    }

    const successFactor =
      block.match(/CRITICAL SUCCESS FACTOR:\s*([\s\S]*?)(?=\n\n|SCRIPT\s*\d|$)/i)?.[1]?.trim() || "";
    
    return { 
      title, 
      length, 
      tone, 
      cues, 
      successFactor, 
      rawText: block, 
      formatType,
      forContext,
      targetPlatform,
      creatorDirection,
      authenticityNote,
    };
  });
}

function parsePlatformSections(text: string) {
  if (!text) return [];
  // Split on ### headings (AI is prompted to use them)
  const parts = text.split(/(?=^###\s)/m).filter((b) => b.trim().length > 10);
  if (parts.length === 0) {
    // Fallback: try splitting on double-newlines into logical chunks
    const chunks = text.split(/\n\n+/).filter((c) => c.trim().length > 15);
    return chunks.map((chunk, i) => ({
      heading: `Insight ${i + 1}`,
      body: chunk.trim(),
    }));
  }
  return parts.map((part) => {
    const lines = part.trim().split("\n");
    const heading = lines[0].replace(/^###\s*/, "").trim();
    const body = lines.slice(1).join("\n").trim();
    return { heading, body };
  });
}

// ─── Sub-renderers ─────────────────────────────────────────────────────────────

function TextRenderer({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="space-y-4 text-foreground/80 leading-relaxed text-[15px]">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        if (trimmed.startsWith("###")) {
          return (
            <h3 key={i} className="text-lg font-bold text-white mt-6 mb-2">
              {trimmed.replace(/^###\s*/, "")}
            </h3>
          );
        }
        if (trimmed.startsWith("##")) {
          return (
            <h2 key={i} className="text-xl font-extrabold text-white mt-8 mb-3">
              {trimmed.replace(/^##\s*/, "")}
            </h2>
          );
        }
        if (trimmed.startsWith("#")) {
          return (
            <h1 key={i} className="text-2xl font-black text-white mt-8 mb-4">
              {trimmed.replace(/^#\s*/, "")}
            </h1>
          );
        }

        let prefixNode = null;
        let mainText = trimmed;
        const keyRegex =
          /^([A-Z0-9_\s]+:|STAGE:|PHASE.*?:|TACTIC.*?:|WEEK.*?:|PRE-LAUNCH.*?:|Day\s*\d+:)(.*)/;
        const match = trimmed.match(keyRegex);
        if (match) {
          prefixNode = (
            <strong className="text-white font-semibold mr-1.5">
              {match[1]}
            </strong>
          );
          mainText = match[2];
        }

        const fragments = mainText.split(/(\*\*.*?\*\*)/g).map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={j} className="text-white font-semibold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={j}>{part}</span>;
        });

        return (
          <p
            key={i}
            className={cn("text-[15px] font-normal", prefixNode && "mt-3")}
          >
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

  const [funnelName, setFunnelName] = useState("Your Funnel");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionId>(
    "platform_priority_narrative",
  );
  const [isRegeneratingSection, setIsRegeneratingSection] = useState(false);

  useEffect(() => {
    fetch(`/api/offer-data/${funnelId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.funnel) {
          setFunnelName(res.funnel.name || "Your Funnel");
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
      setGenStep((s) => Math.min(s + 1, GEN_STEPS.length - 1));
    }, 4500);

    try {
      const resp = await fetch(
        `/api/generate-traffic-intelligence/${funnelId}`,
        { method: "POST" },
      );
      clearInterval(interval);
      setGenStep(GEN_STEPS.length);

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Generation failed");
      }

      const { data: generated } = await resp.json();
      setData(generated);
      toast.success("Traffic Intelligence successfully generated!");
    } catch (e: any) {
      clearInterval(interval);
      toast.error(e.message || "Failed to generate");
    } finally {
      setGenerating(false);
      setGenStep(0);
    }
  };

  const handleCopySection = () => {
    if (!data) return;
    const content = data[activeSection] || "";
    navigator.clipboard.writeText(content);
    toast.success("Section content copied to clipboard!");
  };

  const handleRegenerateSection = async () => {
    if (!data || !activeSection) return;
    setIsRegeneratingSection(true);
    try {
      const resp = await fetch(
        `/api/generate-traffic-intelligence/${funnelId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionId: activeSection }),
        },
      );

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Regeneration failed");
      }

      const { data: generated } = await resp.json();
      // Merge only the regenerated section into current data
      if (generated && generated[activeSection]) {
        setData((prev: any) => ({ ...prev, [activeSection]: generated[activeSection] }));
        toast.success(`${SECTIONS.find(s => s.id === activeSection)?.label || activeSection} regenerated!`);
      } else if (generated) {
        // Full regeneration fallback
        setData(generated);
        toast.success("Section regenerated!");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to regenerate section");
    } finally {
      setIsRegeneratingSection(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner size="md" color="muted" />
      </div>
    );
  }

  const activeConfig =
    SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];
  const activeContent = data ? data[activeSection] || "" : "";

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] relative text-white font-sans z-0">
      {/* Background Elements (copied from home page) */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        {/* Radial - Pink */}
        <div
          className="absolute top-[80px] right-[-480px] w-[994px] h-[800px] opacity-40"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgb(236, 72, 153) 0%, rgba(236, 72, 153, 0) 100%)",
            transform: "rotate(-30deg)",
          }}
        />
        {/* Radial - Blue */}
        <div
          className="absolute top-[80px] left-[-480px] w-[994px] h-[800px] opacity-40"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgb(59, 130, 246) 0%, rgba(59, 130, 246, 0) 100%)",
            transform: "rotate(30deg)",
          }}
        />
        {/* Radial - Purple */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[522px] opacity-[0.36] z-[1]"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgb(140, 22, 250) 0%, rgba(140, 22, 250, 0) 100%)",
          }}
        />
        {/* Bottom Gradient Overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[240px] z-[2] opacity-100"
          style={{
            background:
              "linear-gradient(180deg, rgba(3, 7, 18, 0) 0%, rgb(3, 7, 18) 100%)",
          }}
        />
        {/* Noise Overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none z-[1]"
          style={{
            backgroundImage:
              "url(https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png)",
            backgroundRepeat: "repeat",
            backgroundSize: "128px auto",
          }}
        />
      </div>

      {generating && (
        <div className="fixed inset-0 z-50 bg-[#030712]/95 backdrop-blur-xl flex flex-col items-center justify-center">
          <div className="w-full max-w-md mx-auto px-6 text-center flex flex-col items-center">
            <div className="relative w-24 h-24 mb-8">
              <svg
                className="animate-spin w-full h-full text-brand-yellow"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-20"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  className="opacity-80"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                {Math.min(
                  100,
                  Math.round(((genStep + 1) / (GEN_STEPS.length + 1)) * 100),
                )}
                %
              </div>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
              Synthesizing Traffic Engine
            </h2>
            <p className="text-sm font-semibold text-muted-foreground animate-pulse min-h-[40px] px-4">
              {GEN_STEPS[Math.min(genStep, GEN_STEPS.length - 1)]}
            </p>
            <div className="w-64 h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
              <div
                className="h-full bg-brand-yellow rounded-full transition-all duration-700"
                style={{
                  width: `${Math.round(((genStep + 1) / (GEN_STEPS.length + 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Topbar
          breadcrumbs={[
            { label: "Funnels", href: `/funnels/${funnelId}` },
            { label: funnelName, href: "#" },
            { label: "Traffic Intelligence™" },
          ]}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Funnel secondary sidebar (collapsible icon rail) */}
          <FunnelSidebar
            funnelId={funnelId}
            funnelName={funnelName}
            collapsible
          />

          {/* Left Navigation Rails - Section selection */}
          <div className="w-[260px] border-r border-white/10 bg-[#131826] flex flex-col overflow-hidden flex-shrink-0">
            <div className="px-4 py-4 border-b border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                ACTIVE OFFER
              </p>
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 mb-2">
                <TrendingUp className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                <span className="text-xs font-bold text-white truncate">
                  {funnelName}
                </span>
              </div>
              {data && (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse" />
                  <span className="text-[11px] font-bold text-brand-yellow">
                    Calibrated Phase 3 Active
                  </span>
                </div>
              )}
            </div>

            {data && (
              <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
                {SECTIONS.map((s) => {
                  const isActive = activeSection === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className={cn(
                        "w-full text-left rounded-xl px-3 py-3 border transition-all flex items-start gap-3 group relative",
                        isActive
                          ? "bg-white/[0.08] border-white/15 text-white shadow-[0_0_10px_rgba(59,130,246,0.15)]"
                          : "border-transparent hover:bg-white/[0.04] text-muted-foreground hover:text-white",
                      )}
                    >
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                          isActive
                            ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            : "bg-white/5 text-muted-foreground group-hover:text-white",
                        )}
                      >
                        {s.icon}
                      </div>
                      <div className="truncate">
                        <p
                          className={cn(
                            "text-xs font-bold transition-colors",
                            isActive
                              ? "text-white"
                              : "text-muted-foreground group-hover:text-white",
                          )}
                        >
                          {s.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground/75 truncate mt-0.5">
                          {s.sub}
                        </p>
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
                  Unlock premium platform priority narrative, ad copy matrices,
                  VSL video scripts, and validation timeline.
                </p>
              </div>
            )}

            {data && (
              <div className="p-4 border-t border-white/10 bg-[#131826]">
                <button
                  onClick={handleGenerate}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.75)] border-transparent duration-300"
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
                <h2 className="text-2xl font-black tracking-tight text-white mb-2">
                  Traffic Intelligence
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed">
                  OfferIQ builds your complete traffic acquisition strategy from
                  35,000+ real converting funnels — matched to your specific
                  offer, audience, and price point.
                </p>
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black h-12 px-8 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.75)] transition-all border-0 duration-300"
                >
                  {generating ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Build My Traffic Strategy →
                </Button>
              </div>
            ) : (
              <div className="max-w-5xl w-full mx-auto px-6 lg:px-12 py-10 pb-32">
                {/* Visual / Raw Toggle tab and Copy buttons */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-brand-yellow/20 bg-brand-yellow/10 text-brand-yellow/90">
                      {activeConfig.badge}
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-tight mt-2">
                      {activeConfig.label}
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activeConfig.sub}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerateSection}
                      disabled={isRegeneratingSection || generating}
                      className="text-white bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 gap-1.5 transition-all"
                    >
                      {isRegeneratingSection ? (
                        <Spinner size="xs" color="white" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      {isRegeneratingSection ? "Regenerating…" : "Regenerate"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopySection}
                      className="text-white bg-white/5 border border-white/10 hover:bg-white/10 gap-1.5 transition-all shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Content
                    </Button>
                  </div>
                </div>

                {/* Conditional rendering based on mode */}
                <div className="space-y-6">
                    {/* Render visual dashboards unique for each section */}

                    {/* 1. platform_priority_narrative */}
                    {activeSection === "platform_priority_narrative" && (
                      <div className="space-y-5 animate-fade-in">
                        {parsePlatformSections(activeContent).length > 0 ? (
                          parsePlatformSections(activeContent).map((section, idx) => {
                            const sectionIcons = [TrendingUp, Target, ShieldAlert, Sparkles, Globe];
                            const SectionIcon = sectionIcons[idx % sectionIcons.length];
                            const accentColors = [
                              "amber", "sky", "rose", "emerald", "violet"
                            ];
                            const accent = accentColors[idx % accentColors.length];
                            return (
                              <div
                                key={idx}
                                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.12] rounded-3xl p-7 shadow-2xl relative overflow-hidden transition-all duration-300 group"
                              >
                                <div className={`absolute top-[-25%] ${idx % 2 === 0 ? 'right' : 'left'}-[-12%] w-80 h-80 bg-${accent}-500/8 blur-[150px] rounded-full pointer-events-none`} />
                                <div className="relative z-10">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-2xl bg-${accent}-500/15 border border-${accent}-500/25 flex items-center justify-center flex-shrink-0`}>
                                      <SectionIcon className={`w-4.5 h-4.5 text-${accent}-400`} />
                                    </div>
                                    <h3 className="text-lg font-black text-white leading-tight">
                                      {section.heading}
                                    </h3>
                                  </div>
                                  <div className="text-[15px] text-white/80 leading-relaxed font-normal space-y-3 pl-[52px]">
                                    {section.body.split("\n").filter(Boolean).map((line, li) => {
                                      const bold = line.split(/(\*\*.*?\*\*)/g).map((part, pi) => {
                                        if (part.startsWith("**") && part.endsWith("**")) {
                                          return <strong key={pi} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                                        }
                                        return <span key={pi}>{part}</span>;
                                      });
                                      return <p key={li}>{bold}</p>;
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
                            <TextRenderer text={activeContent} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. omnichannel_ad_copy_matrix */}
                    {activeSection === "omnichannel_ad_copy_matrix" && (
                      <div className="space-y-6">
                        {parseMetaAds(activeContent).length === 0 ? (
                          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8">
                            <TextRenderer text={activeContent} />
                          </div>
                        ) : (
                          parseMetaAds(activeContent).map((ad, idx) => (
                            <div
                              key={idx}
                              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-white/[0.12] group"
                            >
                              <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/[0.05]">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wide">
                                    Ad Variant {idx + 1}
                                  </span>
                                  <h3 className="text-sm font-black text-white">
                                    {ad.hook}
                                  </h3>
                                </div>
                                <span className="text-[11px] font-bold text-muted-foreground">
                                  Target:{" "}
                                  <span className="text-white">
                                    {ad.audience}
                                  </span>
                                </span>
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-12">
                                {/* Left column - Simulated Facebook/Insta Mock */}
                                <div className="lg:col-span-8 p-6 border-r border-white/[0.05] flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-9 h-9 rounded-full bg-brand-yellow flex items-center justify-center text-black font-black text-xs">
                                        IQ
                                      </div>
                                      <div>
                                        <p className="text-xs font-black text-white">
                                          OfferIQ Advertiser
                                        </p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                          Sponsored ·{" "}
                                          <Globe className="w-2.5 h-2.5" />
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm text-white/90 leading-relaxed mb-4 whitespace-pre-line font-normal">
                                      {ad.primaryText}
                                    </p>
                                  </div>

                                  {/* Simulated Ad Visual Placeholder */}
                                  <div className="border border-white/[0.05] bg-white/[0.01] rounded-xl overflow-hidden mb-4">
                                    <div className="aspect-video relative bg-[#0e1320] flex flex-col items-center justify-center text-center p-6 border-b border-white/[0.05]">
                                      <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-3">
                                        <Sparkles className="w-5 h-5 text-sky-400" />
                                      </div>
                                      <p className="text-xs font-bold text-white mb-1">
                                        High-Fidelity 3D Visual Asset
                                        Recommendation
                                      </p>
                                      <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">
                                        Render an abstract mock representation
                                        matching: &quot;{ad.hook}&quot;
                                      </p>
                                    </div>
                                    <div className="bg-[#121824] px-4 py-3 flex items-center justify-between">
                                      <div>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                          {ad.linkDescription ||
                                            "OFFER-IQ EXCLUSIVE"}
                                        </p>
                                        <p className="text-sm font-black text-white mt-0.5">
                                          {ad.headline}
                                        </p>
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
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-1">
                                        Campaign Objective
                                      </h4>
                                      <p className="text-xs text-white font-bold">
                                        {ad.objective}
                                      </p>
                                    </div>
                                    <div className="pt-4 border-t border-white/[0.05]">
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-yellow mb-2">
                                        Performance Intelligence
                                      </h4>
                                      <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line font-normal">
                                        {ad.performance}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        `Headline: ${ad.headline}\n\nPrimary Text:\n${ad.primaryText}\n\nCTA: ${ad.ctaButton}`,
                                      );
                                      toast.success("Ad creative copied!");
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
                    {activeSection === "google_ads_copy_matrix" && (
                      <div className="space-y-6">
                        {parseGoogleAds(activeContent).length === 0 ? (
                          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8">
                            <TextRenderer text={activeContent} />
                          </div>
                        ) : (
                          parseGoogleAds(activeContent).map((search, idx) => (
                            <div
                              key={idx}
                              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all hover:border-white/[0.12] group"
                            >
                              <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wide">
                                    Search Ad {idx + 1}
                                  </span>
                                  <span className="text-xs font-bold text-muted-foreground">
                                    Intent Match:{" "}
                                    <span className="text-white font-black">
                                      &quot;{search.keyword}&quot;
                                    </span>
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-purple-400 bg-purple-400/5 px-2 py-0.5 rounded border border-purple-400/10">
                                  {search.matchType}
                                </span>
                              </div>

                              {/* Google Search Mockup */}
                              <div className="bg-[#0e1320] border border-white/[0.05] rounded-2xl p-5 max-w-2xl mb-6">
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2">
                                  <span className="font-bold text-white">
                                    Google Ad
                                  </span>
                                  <span>·</span>
                                  <span>https://yourdomain.com/funnel</span>
                                </div>
                                <div className="text-base text-blue-400 font-medium hover:underline cursor-pointer leading-tight mb-2 flex items-center gap-1.5 flex-wrap">
                                  {search.headlines
                                    .slice(0, 3)
                                    .map((hl, hidx) => (
                                      <React.Fragment key={hidx}>
                                        {hidx > 0 && (
                                          <span className="text-white/40">
                                            |
                                          </span>
                                        )}
                                        <span>{hl}</span>
                                      </React.Fragment>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                                  {search.descriptions.join(" ")}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/[0.05]">
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">
                                    All Configured Headlines
                                  </h4>
                                  <div className="space-y-1">
                                    {search.headlines.map((hl, hlIdx) => (
                                      <div
                                        key={hlIdx}
                                        className="flex items-center gap-2 text-xs py-1 border-b border-white/[0.03] last:border-b-0"
                                      >
                                        <span className="text-muted-foreground w-6 font-bold">
                                          H{hlIdx + 1}:
                                        </span>
                                        <span className="text-white font-medium">
                                          {hl}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-yellow mb-3">
                                    Negative Keywords to Add
                                  </h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {search.negativeKeywords
                                      .split(/[,;\n]/)
                                      .map((nk, nkIdx) => {
                                        const word = nk
                                          .replace(/[\[\]-]/g, "")
                                          .trim();
                                        if (!word) return null;
                                        return (
                                          <span
                                            key={nkIdx}
                                            className="text-xs px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg font-mono"
                                          >
                                            -[{word}]
                                          </span>
                                        );
                                      })}
                                  </div>
                                  <div className="mt-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.12] rounded-xl p-4 transition-all">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-white mb-1">
                                      Target Keyword Rationale
                                    </h5>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                      Eliminates high-cost low-intent query
                                      bleed. Focuses budget only on buyers
                                      searching for transformational mechanisms.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* 4. Video Scripts */}
                    {(activeSection === "vsl_video_script" || activeSection === "ugc_video_script") && (
                      <div className="space-y-8">
                        {parseVideoScripts(activeContent).length === 0 ? (
                          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8">
                            <TextRenderer text={activeContent} />
                          </div>
                        ) : (
                          parseVideoScripts(activeContent).map(
                            (script, idx) => {
                              const isUGC = script.formatType === "UGC";
                              const accentColor = isUGC ? "violet" : "rose";
                              const accentBg = isUGC ? "violet-500" : "rose-500";
                              const accentText = isUGC ? "violet-400" : "rose-400";
                              
                              return (
                              <div
                                key={idx}
                                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-2xl hover:border-white/[0.12] transition-all duration-300 overflow-hidden relative"
                              >
                                {/* Ambient glow */}
                                <div className={`absolute top-[-30%] ${isUGC ? 'left' : 'right'}-[-15%] w-[500px] h-[500px] ${isUGC ? 'bg-violet-500/8' : 'bg-rose-500/8'} blur-[180px] rounded-full pointer-events-none`} />
                                
                                {/* Script Header */}
                                <div className={`px-6 py-5 border-b border-white/[0.06] bg-white/[0.02] relative`}>
                                  <div className="flex items-start justify-between flex-wrap gap-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                      {/* Format Icon */}
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isUGC ? 'bg-violet-500/15 border border-violet-500/25' : 'bg-rose-500/15 border border-rose-500/25'}`}>
                                        {isUGC ? (
                                          <Smartphone className={`w-5 h-5 text-${accentText}`} />
                                        ) : (
                                          <Video className={`w-5 h-5 text-${accentText}`} />
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${isUGC ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                            {isUGC ? "UGC Script" : "VSL Script"}
                                          </span>
                                          <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                                            Script {idx + 1}
                                          </span>
                                        </div>
                                        <h3 className="text-lg font-black text-white leading-tight">
                                          {script.title.replace(/^SCRIPT\s*\d+\s*(?:—|-|–)\s*/i, "")}
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                          {script.forContext}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Copy Script Button */}
                                    <Button
                                      onClick={() => {
                                        navigator.clipboard.writeText(script.rawText);
                                        toast.success(`Script ${idx + 1} copied to clipboard!`);
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="text-white/50 hover:text-white border-white/10 hover:border-white/20 flex-shrink-0 gap-1.5"
                                    >
                                      <Copy className="w-3 h-3" />
                                      Copy Script
                                    </Button>
                                  </div>
                                </div>

                                {/* Metadata Dashboard */}
                                <div className="px-6 py-4 border-b border-white/[0.06]">
                                  <div className={`grid ${isUGC ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'} gap-3`}>
                                    {/* Duration */}
                                    <div className={`bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3`}>
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isUGC ? 'bg-violet-500/10' : 'bg-rose-500/10'}`}>
                                        <Clock className={`w-3.5 h-3.5 ${isUGC ? 'text-violet-400' : 'text-rose-400'}`} />
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Duration</p>
                                        <p className={`text-xs font-black ${isUGC ? 'text-violet-400' : 'text-rose-400'}`}>{script.length}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Tone */}
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isUGC ? 'bg-violet-500/10' : 'bg-rose-500/10'}`}>
                                        <Mic className={`w-3.5 h-3.5 ${isUGC ? 'text-violet-400' : 'text-rose-400'}`} />
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Tone</p>
                                        <p className="text-xs font-bold text-white">{script.tone}</p>
                                      </div>
                                    </div>

                                    {/* UGC-specific: Target Platform */}
                                    {isUGC && script.targetPlatform && (
                                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                          <Smartphone className="w-3.5 h-3.5 text-violet-400" />
                                        </div>
                                        <div>
                                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Platform</p>
                                          <p className="text-xs font-bold text-white">{script.targetPlatform}</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* UGC-specific: Creator Type */}
                                    {isUGC && script.creatorDirection && (
                                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                          <User className="w-3.5 h-3.5 text-violet-400" />
                                        </div>
                                        <div>
                                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Creator</p>
                                          <p className="text-xs font-bold text-white truncate max-w-[140px]">{script.creatorDirection}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* UGC Authenticity Note — full width */}
                                  {isUGC && script.authenticityNote && (
                                    <div className="mt-3 bg-violet-500/[0.06] border border-violet-500/15 rounded-xl p-3 flex items-start gap-3">
                                      <Film className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                                      <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-violet-400 mb-0.5">Filming Direction</p>
                                        <p className="text-xs text-white/80 leading-relaxed font-normal">{script.authenticityNote}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Script Sequence Timeline */}
                                <div className="px-6 py-6">
                                  <div className="flex items-center gap-2 mb-5">
                                    <Clapperboard className={`w-4 h-4 ${isUGC ? 'text-violet-400' : 'text-rose-400'}`} />
                                    <h4 className={`text-xs font-black uppercase tracking-widest ${isUGC ? 'text-violet-400' : 'text-rose-400'}`}>
                                      Script Sequence
                                    </h4>
                                    <div className="flex-1 h-px bg-white/[0.06]" />
                                    <span className="text-[10px] text-muted-foreground font-bold">
                                      {script.cues.length} beat{script.cues.length !== 1 ? "s" : ""}
                                    </span>
                                  </div>

                                  <div className="space-y-3 relative">
                                    {/* Vertical timeline line */}
                                    {script.cues.length > 1 && (
                                      <div className={`absolute top-[24px] bottom-[24px] left-[47px] w-[2px] ${isUGC ? 'bg-violet-500/10' : 'bg-rose-500/10'}`} />
                                    )}

                                    {script.cues.map((cue, cIdx) => (
                                      <div
                                        key={cIdx}
                                        className="flex gap-3 items-start relative group"
                                      >
                                        {/* Timecode */}
                                        <div className={`w-[90px] text-[11px] font-mono font-bold shrink-0 text-right pr-2 pt-3 ${isUGC ? 'text-violet-400' : 'text-rose-400'}`}>
                                          {cue.time}
                                        </div>
                                        
                                        {/* Timeline Node */}
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-3 relative z-10 transition-all duration-200 ${isUGC ? 'bg-[#121824] border-violet-500/20 group-hover:border-violet-400/60 group-hover:shadow-[0_0_8px_rgba(139,92,246,0.3)]' : 'bg-[#121824] border-rose-500/20 group-hover:border-rose-400/60 group-hover:shadow-[0_0_8px_rgba(244,63,94,0.3)]'}`}>
                                          <Play className={`w-2 h-2 transition-colors ${isUGC ? 'text-violet-400/50 group-hover:text-violet-400' : 'text-rose-400/50 group-hover:text-rose-400'}`} />
                                        </div>
                                        
                                        {/* Content Card */}
                                        <div className={`flex-1 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 hover:bg-white/[0.04] transition-all duration-200 group-hover:border-white/[0.10]`}>
                                          <h5 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isUGC ? 'text-violet-400' : 'text-rose-400'}`}>
                                            {cue.action}
                                          </h5>
                                          <p className="text-[13px] text-white/85 leading-relaxed font-normal">
                                            {cue.direction}
                                          </p>
                                          
                                          {/* Visual Direction */}
                                          {cue.visualDirection && (
                                            <div className="mt-3 flex items-start gap-2 bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2">
                                              <Film className="w-3 h-3 text-sky-400 shrink-0 mt-0.5" />
                                              <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-sky-400 mb-0.5">Visual</p>
                                                <p className="text-[11px] text-white/60 leading-relaxed font-normal">{cue.visualDirection}</p>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {/* Delivery Note */}
                                          {cue.deliveryNote && (
                                            <div className="mt-2 flex items-start gap-2 bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2">
                                              <Mic className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                                              <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400 mb-0.5">Delivery</p>
                                                <p className="text-[11px] text-white/60 leading-relaxed font-normal">{cue.deliveryNote}</p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Fallback: if no cues parsed, show raw text */}
                                  {script.cues.length === 0 && (
                                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                                      <TextRenderer text={script.rawText} />
                                    </div>
                                  )}
                                </div>

                                {/* Critical Success Factor */}
                                {script.successFactor && (
                                  <div className="mx-6 mb-6">
                                    <div className={`${isUGC ? 'bg-violet-500/[0.06] border-violet-500/15' : 'bg-rose-500/[0.06] border-rose-500/15'} border rounded-2xl p-5 flex gap-3`}>
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isUGC ? 'bg-violet-500/15' : 'bg-rose-500/15'}`}>
                                        <ShieldAlert className={`w-5 h-5 ${isUGC ? 'text-violet-400' : 'text-rose-400'}`} />
                                      </div>
                                      <div>
                                        <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isUGC ? 'text-violet-400' : 'text-rose-400'}`}>
                                          Critical Success Factor
                                        </h4>
                                        <p className="text-[13px] text-white/75 leading-relaxed font-normal">
                                          {script.successFactor}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              );
                            },
                          )
                        )}
                      </div>
                    )}


                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
