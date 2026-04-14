"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";
import { ScoreRadarChart } from "@/components/intelligence/charts/ScoreRadarChart";
import { PricingBarChart } from "@/components/intelligence/charts/PricingBarChart";
import { PlatformPieChart } from "@/components/intelligence/charts/PlatformPieChart";
import {
  Zap,
  ArrowRight,
  Loader2,
  TrendingUp,
  Target,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Layers,
  MessageSquare,
  Sparkles,
  Globe,
  Shield,
  BookOpen,
  Lightbulb,
  Cog,
  Palette,
  Users as UsersIcon,
  DollarSign as DollarIcon,
  Target as TargetIcon,
  MessageSquare as MessageIcon,
  Download,
  Copy,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Check
} from "lucide-react";
import type {
  Call2Output,
  OfferFormData,
  OfferIntelligence,
} from "@/lib/offer-types";
import { parseCall1Output, parseCall2Output } from "@/lib/offer-parser";

// ─── Wizard step config ───────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { id: 1, label: "Upload", status: "done" as const },
  { id: 2, label: "Intelligence", status: "active" as const },
  { id: 3, label: "Copy", status: "pending" as const },
  { id: 4, label: "Build Pages", status: "pending" as const },
  { id: 5, label: "Publish", status: "pending" as const },
];

// ─── Section configuration ───────────────────────────────────────────────────

interface ReportSectionConfig {
  id: string;
  label: string;
  subheader: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  chartType?: "radar" | "bar" | "pie";
}

const SECTION_CONFIG: Record<string, ReportSectionConfig> = {
  OFFER_SCORE: {
    id: "OFFER_SCORE",
    label: "Offer Score",
    subheader: "A comprehensive metric evaluating market viability, audience clarity, and conversion readiness.",
    icon: <BarChart3 className="w-4 h-4" />,
    color: "text-foreground",
    chartType: "radar"
  },
  SCORE_SUMMARY: {
    id: "SCORE_SUMMARY",
    label: "Score Summary",
    subheader: "Detailed breakdown of the core metrics evaluating your offer's potential.",
    icon: <Target className="w-4 h-4" />,
    color: "text-foreground",
  },
  REVENUE_MODEL_ARCHITECTURE: {
    id: "REVENUE_MODEL_ARCHITECTURE",
    label: "Revenue Model",
    subheader: "Architectural blueprint detailing how profitability is structured and compounding avenues.",
    icon: <DollarSign className="w-4 h-4" />,
    color: "text-foreground",
  },
  PAIN_POINT_MAPPING: {
    id: "PAIN_POINT_MAPPING",
    label: "Pain Points",
    subheader: "Identification of the most critical friction points your audience is experiencing.",
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-foreground",
  },
  FUNNEL_STRUCTURE_BLUEPRINT: {
    id: "FUNNEL_STRUCTURE_BLUEPRINT",
    label: "Funnel Blueprint",
    subheader: "Step-by-step psychological layout mapped to funnel stages for maximum conversion efficiency.",
    icon: <Layers className="w-4 h-4" />,
    color: "text-foreground",
  },
  PRICING_STRATEGY: {
    id: "PRICING_STRATEGY",
    label: "Pricing Strategy",
    subheader: "Optimal price points, psychological thresholds, and elasticity simulation across tiers.",
    icon: <DollarIcon className="w-4 h-4" />,
    color: "text-foreground",
    chartType: "bar"
  },
  UPSELL_DOWNSELL_PATHS: {
    id: "UPSELL_DOWNSELL_PATHS",
    label: "Upsell Paths",
    subheader: "Logical expansions maximizing Average Order Value (AOV) post-initial purchase.",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "text-foreground",
  },
  STRATEGIC_BONUS_RECOMMENDATIONS: {
    id: "STRATEGIC_BONUS_RECOMMENDATIONS",
    label: "Bonus Stack",
    subheader: "High-perceived-value additions mitigating specific purchase objections.",
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-foreground",
  },
  DESIGN_INTELLIGENCE_RECOMMENDATION: {
    id: "DESIGN_INTELLIGENCE_RECOMMENDATION",
    label: "Design Intelligence",
    subheader: "Visual principles mapped uniquely to your demographic's trust factors.",
    icon: <Palette className="w-4 h-4" />,
    color: "text-foreground",
  },
  FUNNEL_HEALTH_SCORE: {
    id: "FUNNEL_HEALTH_SCORE",
    label: "Health Score",
    subheader: "Critical risk assessment defining potential leakage in the funnel.",
    icon: <Shield className="w-4 h-4" />,
    color: "text-foreground",
  },
  PLATFORM_PRIORITY_MATRIX: {
    id: "PLATFORM_PRIORITY_MATRIX",
    label: "Platform Priority",
    subheader: "Recommended budget allocation across high-leverage traffic channels.",
    icon: <Globe className="w-4 h-4" />,
    color: "text-foreground",
    chartType: "pie"
  },
  OFFER_POSITIONING_ANALYSIS: {
    id: "OFFER_POSITIONING_ANALYSIS",
    label: "Offer Positioning",
    subheader: "Differentiating context framing how your market perceives this offer vs alternatives.",
    icon: <TargetIcon className="w-4 h-4" />,
    color: "text-foreground",
    badge: "Opus"
  },
  TARGET_PERSONA_INTELLIGENCE: {
    id: "TARGET_PERSONA_INTELLIGENCE",
    label: "Target Persona",
    subheader: "Deep psychological profile and contextual awareness of your ideal customer.",
    icon: <UsersIcon className="w-4 h-4" />,
    color: "text-foreground",
    badge: "Opus"
  },
  CONVERSION_HOOK_LIBRARY: {
    id: "CONVERSION_HOOK_LIBRARY",
    label: "Conversion Hooks",
    subheader: "Validated, high-impact statements geared to arrest attention instantly.",
    icon: <MessageIcon className="w-4 h-4" />,
    color: "text-foreground",
    badge: "Opus"
  },
  MESSAGING_ANGLE_MATRIX: {
    id: "MESSAGING_ANGLE_MATRIX",
    label: "Messaging Matrix",
    subheader: "Combinatorial framework addressing unique desires and specific internal objections.",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "text-foreground",
    badge: "Opus"
  },
  PRODUCT_CORE_VALUE_PERCEPTION: {
    id: "PRODUCT_CORE_VALUE_PERCEPTION",
    label: "Value Perception",
    subheader: "Core transformational mechanics transitioning the prospect from state A to state B.",
    icon: <Lightbulb className="w-4 h-4" />,
    color: "text-brand-yellow",
    badge: "Opus"
  },
  REAL_WORLD_USE_CASE_SCENARIOS: {
    id: "REAL_WORLD_USE_CASE_SCENARIOS",
    label: "Use Cases",
    subheader: "Relatable operational implementations proving the offer's impact in context.",
    icon: <BookOpen className="w-4 h-4" />,
    color: "text-foreground",
    badge: "Opus"
  },
  MONETIZATION_STRATEGY_NARRATIVE: {
    id: "MONETIZATION_STRATEGY_NARRATIVE",
    label: "Monetization Strategy",
    subheader: "Synthesized executive directive binding acquisition, monetization, and scale.",
    icon: <Cog className="w-4 h-4" />,
    color: "text-foreground",
    badge: "Opus"
  },
};

// Map Call2 outputs into standard keys matching config
const CALL2_SECTION_MAP = {
  offer_positioning_analysis: "OFFER_POSITIONING_ANALYSIS",
  target_persona_intelligence: "TARGET_PERSONA_INTELLIGENCE",
  conversion_hook_library: "CONVERSION_HOOK_LIBRARY",
  messaging_angle_matrix: "MESSAGING_ANGLE_MATRIX",
  product_core_value_perception: "PRODUCT_CORE_VALUE_PERCEPTION",
  real_world_use_case_scenarios: "REAL_WORLD_USE_CASE_SCENARIOS",
  monetization_strategy_narrative: "MONETIZATION_STRATEGY_NARRATIVE",
};

// ─── Interactive UI Components ────────────────────────────────────────────────

function InteractiveCheckbox({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <div 
      className={cn(
        "flex items-start gap-3 my-2 cursor-pointer p-3 rounded-lg border transition-all",
        checked ? "bg-muted/10 border-border" : "bg-card border-transparent hover:bg-muted/30"
      )}
      onClick={(e) => {
        e.stopPropagation();
        setChecked(!checked);
      }}
    >
      <div 
        className={cn(
          "w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-all", 
          checked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground bg-transparent"
        )}
      >
        {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
      </div>
      <span className={cn("text-sm leading-relaxed", checked ? "line-through text-muted-foreground" : "text-foreground")}>
        {label}
      </span>
    </div>
  );
}

function EditableNarrativeText({
  text,
  onChange,
}: {
  text: string;
  onChange: (newText: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (!text) return <StreamingPlaceholder />;

  // Clean up any JSON codeblocks from view if they are just data payloads
  const viewText = text.replace(/```json[\s\S]*?```/g, '').trim();

  // If text is purely JSON object without backticks
  let isPureJson = false;
  try {
    if ((text.trim().startsWith('{') || text.trim().startsWith('['))) {
      JSON.parse(text.trim());
      isPureJson = true;
    }
  } catch(e) {}

  // If text is HTML from a previous Tiptap edit
  const isHtml = text.trim().startsWith('<') && text.trim().endsWith('>');

  let editorInitialContent = text;
  if (!isHtml && isEditing) {
    // If we're opening the editor to edit raw markdown, convert basic elements to HTML
    editorInitialContent = viewText
      .split('\n')
      .map(line => {
        if (!line.trim()) return '<p></p>';
        const l = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        if (l.startsWith('# ')) return `<h1>${l.substring(2)}</h1>`;
        if (l.startsWith('## ')) return `<h2>${l.substring(3)}</h2>`;
        if (l.startsWith('### ')) return `<h3>${l.substring(4)}</h3>`;
        return `<p>${l}</p>`;
      })
      .join('');
  }

  if (isEditing) {
    return (
      <div className="relative group rounded-xl border border-primary/30 p-2 bg-muted/10 transition-all">
        <div className="flex justify-end p-2 border-b border-border mb-4 bg-background rounded-t-lg">
          <Button 
            size="sm" 
            variant="default"
            className="h-8 gap-2"
            onClick={() => setIsEditing(false)}
          >
            <Check className="w-4 h-4" />
            Done Editing
          </Button>
        </div>
        <RichTextEditor
          content={editorInitialContent}
          onChange={onChange}
        />
      </div>
    );
  }

  if (isPureJson || !text) return <StreamingPlaceholder />;
  
  if (!viewText && !isEditing) {
     return (
       <div className="w-full mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
             + Add Narrative Analysis
          </Button>
       </div>
     );
  }

  return (
    <div 
      className="text-foreground text-[15px] leading-relaxed max-w-none p-4 -mx-4 rounded-xl transition-colors hover:bg-muted/30 cursor-text group relative space-y-4"
      onClick={() => setIsEditing(true)}
    >
      <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background border px-2 py-1 rounded text-xs text-muted-foreground shadow-sm z-10">
        Click anywhere to edit
      </div>
      
      {isHtml ? (
         <div dangerouslySetInnerHTML={{ __html: text }} />
      ) : (
         viewText.split("\n").map((line, i) => {
           if (!line.trim() || line.trim() === '---' || line.trim() === '##' || line.trim() === '***') return <div key={i} className="h-4" />;
           
           // Parse checkboxes
           const isChecklist = line.trim().match(/^(-\s+\[\s?\])|(^\d+\.\s+)/);
           if (isChecklist) {
             const cleanText = line.replace(/^(-\s+\[\s?\])|(^\d+\.\s+)/, "").trim();
             return <InteractiveCheckbox key={i} label={cleanText} />;
           }
           
           // Smart Badges for INTENSITY or STAGE keys
           const isIntensity = /INTENSITY:\s*(CRITICAL|HIGH|MEDIUM|LOW)/i.test(line);
           if (isIntensity) {
             const intensity = line.match(/INTENSITY:\s*(\w+)/i)?.[1].toUpperCase();
             const cleanText = line.replace(/INTENSITY:\s*\w+/i, "").trim();
             return (
               <div key={i} className="text-sm leading-relaxed mb-3 flex items-start gap-2">
                  <span
                     className={cn(
                       "text-[10px] font-bold px-1.5 py-0.5 rounded-sm border shrink-0 mt-0.5 uppercase tracking-wide",
                       intensity === "CRITICAL" && "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30",
                       intensity === "HIGH" && "bg-foreground/10 text-foreground border-foreground/20",
                       intensity === "MEDIUM" && "bg-muted text-muted-foreground border-border",
                       intensity === "LOW" && "bg-muted text-muted-foreground border-border",
                     )}
                   >
                     {intensity}
                   </span>
                   <span className="text-foreground">{cleanText}</span>
               </div>
             )
           }

           const isKey = /^[A-Z_\s]+:/.test(line.trim()) || /^STAGE:|^BONUS|^HOOK|^ANGLE/.test(line.trim());

           // Handle simple bold markup **bold**
           const renderLine = () => {
             return line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
               if (part.startsWith('**') && part.endsWith('**')) {
                 return <strong key={j} className="text-foreground">{part.slice(2, -2)}</strong>;
               }
               return <React.Fragment key={j}>{part}</React.Fragment>;
             });
           };

           return (
             <div
               key={i}
               className={cn(
                 "text-sm leading-relaxed mb-2 last:mb-0",
                 isKey ? "text-foreground font-semibold mt-4 first:mt-0" : "text-muted-foreground"
               )}
             >
               {renderLine()}
             </div>
           );
         })
      )}
    </div>
  );
}

function StreamingPlaceholder() {
  return (
    <div className="space-y-2 animate-pulse w-full max-w-3xl">
      <div className="h-3 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-5/6" />
      <div className="h-3 bg-muted rounded w-2/3" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type StreamPhase = "idle" | "call1" | "call2" | "done" | "error";

export default function IntelligencePage({
  params,
}: {
  params: Promise<{ funnelId: string }>;
}) {
  const { funnelId } = use(params);
  const router = useRouter();

  const [phase, setPhase] = useState<StreamPhase>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [funnelName, setFunnelName] = useState("");
  const [formData, setFormData] = useState<OfferFormData | null>(null);
  const [call1, setCall1] = useState<Record<string, string> | null>(null);
  const [call2, setCall2] = useState<Call2Output | null>(null);
  const [streamingText, setStreamingText] = useState("");
  
  // Navigation State
  const [activeSectionId, setActiveSectionId] = useState<string>("OFFER_SCORE");

  // ── Load & optionally stream ──────────────────────────────────────────────

  const streamCall1 = useCallback(
    async (fd: OfferFormData, existingCall1?: Record<string, string>) => {
      if (existingCall1) {
        setCall1(existingCall1);
        return existingCall1;
      }
      setPhase("call1");
      setStreamingText(""); 
      const res = await fetch("/api/offer-intelligence/call1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnelId, formData: fd }),
      });
      if (!res.ok || !res.body) throw new Error("Call 1 failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamingText(accumulated);
      }
      const parsed = parseCall1Output(accumulated);
      setCall1(parsed);
      setStreamingText("");
      return parsed;
    },
    [funnelId],
  );

  const streamCall2 = useCallback(
    async (fd: OfferFormData, c1: Record<string, string>, existingCall2?: Call2Output) => {
      if (existingCall2) {
        setCall2(existingCall2);
        return;
      }
      setPhase("call2");
      setStreamingText("");
      const res = await fetch("/api/offer-intelligence/call2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnelId, formData: fd, call1: c1 }),
      });
      if (!res.ok || !res.body) throw new Error("Call 2 failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamingText(accumulated);
        if (accumulated.length % 500 < 50) {
          setCall2(parseCall2Output(accumulated));
        }
      }
      setCall2(parseCall2Output(accumulated));
      setStreamingText("");
    },
    [funnelId],
  );

  const runAnalysis = useCallback(async () => {
    if (!formData) return;
    try {
      setErrorMsg("");
      const c1 = await streamCall1(formData, call1 ?? undefined);
      if (!c1 || Object.keys(c1).length === 0) {
        throw new Error("Structural analysis returned empty output.");
      }
      await streamCall2(formData, c1, call2 ?? undefined);
      setPhase("done");
    } catch (e: any) {
      setErrorMsg(e.message || "Analysis failed");
      setPhase("error");
    }
  }, [call1, call2, formData, streamCall1, streamCall2]);

  const updateSectionContent = useCallback(async (key: string, newText: string) => {
    // Determine if it's Call1 or Call2
    try {
      if (call1 && key in call1) {
        const updated = { ...call1, [key]: newText };
        setCall1(updated);
        await fetch(`/api/offer-data/${funnelId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intelligence: { call1: updated } }),
        });
      } else if (call2) {
        // Map from SECTION key back to call2 mapping
        const originalKey = Object.keys(CALL2_SECTION_MAP).find((k) => CALL2_SECTION_MAP[k as keyof typeof CALL2_SECTION_MAP] === key);
        if (originalKey) {
          const updated = { ...call2, [originalKey]: newText };
          setCall2(updated);
          await fetch(`/api/offer-data/${funnelId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ intelligence: { call2: updated } }),
          });
        }
      }
    } catch (e: any) {
      setErrorMsg("Failed to auto-save section");
    }
  }, [call1, call2, funnelId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: show toast notification here
  };

  const handlePrintPdf = () => {
    window.print();
  };

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`/api/offer-data/${funnelId}`);
        if (!res.ok) throw new Error("Funnel not found");
        const { funnel } = await res.json();

        const intelligence: OfferIntelligence = funnel.blocks?.intelligence || {};
        setFormData(intelligence.raw_input || null);
        setFunnelName(funnel.name || "Untitled Funnel");

        if (intelligence.call1) setCall1(intelligence.call1);
        if (intelligence.call2) setCall2(intelligence.call2);

        if (intelligence.call1_complete && intelligence.call2_complete) {
          setPhase("done");
        } else {
          setPhase("idle");
        }
      } catch (e: any) {
        setErrorMsg(e.message || "Something went wrong");
        setPhase("error");
      }
    }
    init();
  }, [funnelId]);

  // Derive consolidated list of available sections
  const availableSections = React.useMemo(() => {
    const list: string[] = [];
    if (call1) {
      list.push(...Object.keys(call1).filter(k => SECTION_CONFIG[k]));
    }
    if (call2) {
      list.push(...Object.values(CALL2_SECTION_MAP));
    }
    // Ensure activeSectionId is valid
    if (list.length > 0 && !list.includes(activeSectionId)) {
      setActiveSectionId(list[0]);
    }
    return list;
  }, [call1, call2, activeSectionId]);

  const activeIndex = availableSections.indexOf(activeSectionId);
  const prevSectionId = activeIndex > 0 ? availableSections[activeIndex - 1] : null;
  const nextSectionId = activeIndex < availableSections.length - 1 ? availableSections[activeIndex + 1] : null;

  // Active section data lookup
  let activeContent = "";
  if (call1 && activeSectionId in call1) {
    activeContent = call1[activeSectionId];
  } else if (call2) {
    const origKey = Object.keys(CALL2_SECTION_MAP).find(k => CALL2_SECTION_MAP[k as keyof typeof CALL2_SECTION_MAP] === activeSectionId);
    if (origKey && origKey in call2) {
      activeContent = call2[origKey as keyof Call2Output] || "";
    }
  }

  const activeConfig = SECTION_CONFIG[activeSectionId] || SECTION_CONFIG["OFFER_SCORE"];

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ marginLeft: "56px" }}>
        {/* Topbar */}
        <Topbar
          breadcrumbs={[
            { label: "Funnels", href: "/" },
            { label: funnelName || funnelId, href: `/intelligence/${funnelId}` },
            { label: "Intelligence Reports" },
          ]}
          steps={WIZARD_STEPS}
        >
          {phase !== "idle" && phase !== "done" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          
          <Button variant="outline" size="sm" onClick={handlePrintPdf} className="gap-2 print:hidden">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>

          <Button
            size="sm"
            disabled={availableSections.length === 0}
            onClick={() => router.push(`/copy/${funnelId}`)}
            className="gap-1.5 font-semibold print:hidden"
          >
            Generate Copy
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Topbar>

        {/* Hidden PDF Stacking Container for window.print() */}
        <div className="hidden print:block absolute inset-0 bg-white text-black p-8 z-50 overflow-visible h-auto max-w-none">
          <div className="mb-8 border-b pb-4">
            <h1 className="text-3xl font-bold">{funnelName || "Intelligence Report"}</h1>
            <p className="text-gray-500 mt-2">Comprehensive Funnel Architecture & Strategic Blueprint</p>
          </div>
          {availableSections.map(sectionId => {
            const config = SECTION_CONFIG[sectionId] || { label: sectionId, subheader: "" };
            let content = "";
            if (call1 && sectionId in call1) content = call1[sectionId];
            else if (call2) {
              const orig = Object.keys(CALL2_SECTION_MAP).find(k => CALL2_SECTION_MAP[k as keyof typeof CALL2_SECTION_MAP] === sectionId);
              if (orig) content = call2[orig as keyof Call2Output];
            }
            return (
              <div key={sectionId} className="page-break-after-always mb-12">
                <h2 className="text-xl font-bold mb-1 pb-1 border-b text-gray-800 flex items-center justify-between">
                  {config.label}
                  {config.badge && <span className="text-xs font-normal bg-gray-100 px-2 py-0.5 rounded-full">{config.badge}</span>}
                </h2>
                <p className="text-xs text-gray-500 mb-4">{config.subheader}</p>
                <div className="text-sm prose max-w-none">
                  {content.split("\n").filter(Boolean).map((line, i) => (
                    <p key={i} className="mb-2">{line.replace(/INTENSITY:\s*\w+/i, "")}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Interface Layout */}
        <div className="flex flex-1 overflow-hidden print:hidden">
          
          {/* Left Sidebar Sections Navigation */}
          <div className="w-64 shrink-0 border-r border-border bg-card/50 flex flex-col h-full hidden md:flex overflow-hidden">
              <div className="p-4 border-b border-border bg-card sticky top-0 z-10 flex-shrink-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Report Sections</div>
              </div>

             <nav className="p-2 overflow-y-auto space-y-0.5 flex-1 custom-scrollbar pb-6 text-sm">
                {availableSections.map((sid) => {
                  const cfg = SECTION_CONFIG[sid] || { label: sid, color: "text-muted-foreground", badge: "" };
                  const isActive = sid === activeSectionId;
                  return (
                    <button
                      key={sid}
                      onClick={() => setActiveSectionId(sid)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md transition-all text-left group",
                        isActive 
                          ? "bg-brand-yellow/10 text-brand-yellow font-medium" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                       <span className="truncate pr-2">{cfg.label}</span>
                       {(cfg.badge || isActive) && (
                         <div className="shrink-0 flex items-center gap-1.5">
                           {cfg.badge && !isActive && (
                             <span className="text-[9px] uppercase tracking-wider opacity-60 font-bold">{cfg.badge}</span>
                           )}
                           {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                         </div>
                       )}
                    </button>
                  );
                })}
             </nav>

             {/* Placeholder Advertisement Block */}
             <div className="p-3 shrink-0 mb-2">
                <div className="relative w-full h-[120px] rounded-xl overflow-hidden group cursor-pointer border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" 
                    alt="Advertisement"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 left-3 right-3 z-20">
                     <span className="text-[10px] font-black tracking-widest uppercase text-brand-yellow mb-1 block">OfferIQ Pro</span>
                     <p className="text-[11px] font-medium text-foreground leading-tight opacity-90 line-clamp-2">Unlock AI-driven split testing for your funnels.</p>
                  </div>
                </div>
             </div>
          </div>

          {/* Central Main Document */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-background">
             
             {!call1 || availableSections.length === 0 ? (
               <div className="flex items-center justify-center h-full p-8">
                 <Card className="max-w-md w-full border-border">
                    <CardContent className="p-8 text-center space-y-4">
                      {phase === "call1" || phase === "call2" ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                          <h2 className="text-xl font-semibold">Generating Intelligence...</h2>
                          <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-3 rounded text-left mt-4 max-h-32 overflow-y-auto w-full">
                            {streamingText || "Connecting to core AI processor..."}
                          </div>
                        </>
                      ) : (
                        <>
                          <Zap className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <h2 className="text-xl font-semibold">Start your intelligence analysis</h2>
                          <p className="text-sm text-muted-foreground">This generates structural and strategic intelligence for your offer.</p>
                          <Button size="lg" onClick={runAnalysis} className="w-full mt-4">Generate Report</Button>
                        </>
                      )}
                    </CardContent>
                 </Card>
               </div>
             ) : (
                <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10">
                   
                   {/* Section Header */}
                   <div className="mb-8 flex items-baseline justify-between gap-4">
                      <div className="flex items-baseline gap-3 flex-wrap">
                         <h1 className="text-3xl font-bold tracking-tight text-foreground">
                           {activeConfig.label}
                         </h1>
                         {activeConfig.badge && (
                           <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 translate-y-[-2px]">
                             {activeConfig.badge} Engine
                           </span>
                         )}
                         <p className="text-sm font-medium text-muted-foreground ml-2">
                           — {activeConfig.subheader}
                         </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(activeContent)} className="text-muted-foreground hover:text-foreground gap-2 shrink-0">
                        <Copy className="w-4 h-4" />
                        <span className="hidden lg:inline">Copy Text</span>
                      </Button>
                   </div>

                   {/* Dynamic Chart Integration */}
                   {activeConfig.chartType === "radar" && activeSectionId === "OFFER_SCORE" && (
                     <ScoreRadarChart content={activeContent} />
                   )}
                   {activeConfig.chartType === "bar" && activeSectionId === "PRICING_STRATEGY" && (
                     <PricingBarChart content={activeContent} />
                   )}
                   {activeConfig.chartType === "pie" && activeSectionId === "PLATFORM_PRIORITY_MATRIX" && (
                     <PlatformPieChart content={activeContent} />
                   )}

                   {/* Editable Markdown Body */}
                   <div className="min-h-[250px] mb-12">
                      <EditableNarrativeText 
                        text={activeContent} 
                        onChange={(newText) => updateSectionContent(activeSectionId, newText)} 
                      />
                   </div>

                   {/* Shadcn-style Footer Navigation */}
                   <div className="flex items-center justify-between border-t border-border pt-8 mt-12 pb-12">
                      {prevSectionId ? (
                        <Button 
                          variant="outline" 
                          className="h-12 px-6 gap-3 group"
                          onClick={() => setActiveSectionId(prevSectionId)}
                        >
                          <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          <div className="flex flex-col items-start">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Previous</span>
                            <span className="truncate max-w-[120px] sm:max-w-xs">{SECTION_CONFIG[prevSectionId]?.label}</span>
                          </div>
                        </Button>
                      ) : (
                        <div /> // Spacer
                      )}

                      {nextSectionId ? (
                        <Button 
                          variant="outline" 
                          className="h-12 px-6 gap-3 group bg-primary/5 hover:bg-primary/10"
                          onClick={() => setActiveSectionId(nextSectionId)}
                        >
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Next Section</span>
                            <span className="truncate max-w-[120px] sm:max-w-xs">{SECTION_CONFIG[nextSectionId]?.label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Button>
                      ) : (
                         <Button onClick={() => router.push(`/copy/${funnelId}`)} className="h-12 px-6">
                           Finish & Build Pages
                         </Button>
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
