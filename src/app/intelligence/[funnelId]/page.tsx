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
import { FunnelSidebar } from "@/components/layout/FunnelSidebar";
import { FunnelHealthChart } from "@/components/intelligence/charts/FunnelHealthChart";
import { motion, AnimatePresence } from "framer-motion";
import { DesignPreviewCard } from "@/components/intelligence/charts/DesignPreviewCard";
import { DynamicChart } from "@/components/intelligence/DynamicChart";
import { InsightCard } from "@/components/intelligence/InsightCard";
import { ReferenceLink } from "@/components/intelligence/ReferenceLink";
import {
  Zap,
  ArrowRight,
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
  Check,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
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

// ─── Generation Overlay ───────────────────────────────────────────────────────

const GEN_STEPS = [
  "Analysing market context & structural foundations",
  "Scoring offer viability & revenue architecture",
  "Blueprinting funnel logic & upsell paths",
  "Extracting psychological hooks & persona intelligence",
  "Formulating messaging matrix & positioning",
  "Finalizing strategic recommendations",
];

function GenerationOverlay({
  visible,
  step,
}: {
  visible: boolean;
  step: number;
}) {
  if (!visible) return null;
  const currentStepText = GEN_STEPS[Math.min(step, GEN_STEPS.length - 1)];
  const progressPercent = Math.min(100, Math.round((step / GEN_STEPS.length) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden">
      {/* Decorative scanning line */}
      <motion.div 
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-yellow/30 to-transparent z-0 opacity-30"
      />
      
      <div className="w-full max-w-md mx-auto px-10 text-center flex flex-col items-center relative z-10">
        <div className="relative w-32 h-32 mb-10">
           {/* Outer rotating ring */}
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 rounded-full border border-brand-yellow/10 border-t-brand-yellow/50"
           />
           {/* Inner rotating ring */}
           <motion.div 
             animate={{ rotate: -360 }}
             transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
             className="absolute inset-4 rounded-full border border-brand-yellow/20 border-b-brand-yellow"
           />
           
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="flex flex-col items-center">
               <span className="text-3xl font-bold tracking-tighter text-white">{progressPercent}%</span>
               <span className="text-[10px] uppercase font-black tracking-widest text-brand-yellow/80">Sync</span>
             </div>
           </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tighter">
            Architecting <span className="text-brand-yellow">Sales Intelligence</span>
          </h2>
          <div className="h-6 overflow-hidden">
             <AnimatePresence mode="wait">
               <motion.p 
                 key={currentStepText}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="text-sm font-medium text-muted-foreground italic"
               >
                 {step >= GEN_STEPS.length ? "Finalizing rendering..." : currentStepText}
               </motion.p>
             </AnimatePresence>
          </div>
        </div>

        {/* Progress micro-bar */}
        <div className="w-full h-1 bg-white/5 rounded-full mt-12 overflow-hidden border border-white/5">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${progressPercent}%` }}
             className="h-full bg-gradient-to-r from-brand-yellow/40 to-brand-yellow"
           />
        </div>
      </div>
    </div>
  );
}

// ─── Section configuration ───────────────────────────────────────────────────

interface ReportSectionConfig {
  id: string;
  label: string;
  subheader: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  chartType?: "radar" | "bar" | "pie" | "design" | "gauge";
}

const SECTION_CONFIG: Record<string, ReportSectionConfig> = {
  OFFER_SCORE: {
    id: "OFFER_SCORE",
    label: "Intelligence Score",
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
    chartType: "design"
  },
  FUNNEL_HEALTH_SCORE: {
    id: "FUNNEL_HEALTH_SCORE",
    label: "Funnel Health",
    subheader: "Diagnostic assessment of architectural integrity, leakage points, and scaling readiness.",
    icon: <Shield className="w-4 h-4" />,
    color: "text-foreground",
    chartType: "gauge"
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
  },
  TARGET_PERSONA_INTELLIGENCE: {
    id: "TARGET_PERSONA_INTELLIGENCE",
    label: "Target Persona",
    subheader: "Deep psychological profile and contextual awareness of your ideal customer.",
    icon: <UsersIcon className="w-4 h-4" />,
    color: "text-foreground",
  },
  CONVERSION_HOOK_LIBRARY: {
    id: "CONVERSION_HOOK_LIBRARY",
    label: "Conversion Hooks",
    subheader: "Validated, high-impact statements geared to arrest attention instantly.",
    icon: <MessageIcon className="w-4 h-4" />,
    color: "text-foreground",
  },
  MESSAGING_ANGLE_MATRIX: {
    id: "MESSAGING_ANGLE_MATRIX",
    label: "Messaging Matrix",
    subheader: "Combinatorial framework addressing unique desires and specific internal objections.",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "text-foreground",
  },
  PRODUCT_CORE_VALUE_PERCEPTION: {
    id: "PRODUCT_CORE_VALUE_PERCEPTION",
    label: "Value Perception",
    subheader: "Core transformational mechanics transitioning the prospect from state A to state B.",
    icon: <Lightbulb className="w-4 h-4" />,
    color: "text-brand-yellow",
  },
  REAL_WORLD_USE_CASE_SCENARIOS: {
    id: "REAL_WORLD_USE_CASE_SCENARIOS",
    label: "Use Cases",
    subheader: "Relatable operational implementations proving the offer's impact in context.",
    icon: <BookOpen className="w-4 h-4" />,
    color: "text-foreground",
  },
  MONETIZATION_STRATEGY_NARRATIVE: {
    id: "MONETIZATION_STRATEGY_NARRATIVE",
    label: "Monetization Strategy",
    subheader: "Synthesized executive directive binding acquisition, monetization, and scale.",
    icon: <Cog className="w-4 h-4" />,
    color: "text-foreground",
  },
  TRAFFIC_INTELLIGENCE: {
    id: "TRAFFIC_INTELLIGENCE",
    label: "Traffic Acquisition",
    subheader: "Omnichannel ad copy matrix, search ads, UGC scripts, and launch checklists.",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "text-brand-yellow",
    badge: "Call 3",
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

  // Replace XML tags with special tokens to split the text, or just parse line by line if they are inline.
  // Since streaming might break tags, we use a custom renderer.
  const parseRichContent = (rawText: string) => {
    const blocks: React.ReactNode[] = [];
    let currentText = rawText;

    const chartRegex = /<Chart\s+type="([^"]+)"\s+data='([^']+)'(?:\s+title="([^"]*)")?(?:\s+summary="([^"]*)")?\s*\/>/i;
    const insightRegex = /<Insight\s+value="([^"]*)"(?:\s+title="([^"]*)")?>([\s\S]*?)<\/Insight>/i;
    const referenceRegex = /<Reference\s+url="([^"]+)"\s+domain="([^"]+)">([\s\S]*?)<\/Reference>/i;

    let matchCount = 0;
    while (currentText.length > 0 && matchCount < 100) {
      matchCount++;
      const cMatch = currentText.match(chartRegex);
      const iMatch = currentText.match(insightRegex);
      const rMatch = currentText.match(referenceRegex);

      const matches = [
        { match: cMatch, type: 'chart' },
        { match: iMatch, type: 'insight' },
        { match: rMatch, type: 'reference' }
      ].filter(m => m.match !== null);

      if (matches.length === 0) {
        blocks.push(<TextRenderer key={`text-${matchCount}`} text={currentText} />);
        break;
      }

      // Find the earliest match
      matches.sort((a, b) => a.match!.index! - b.match!.index!);
      const earliest = matches[0];
      const matchIndex = earliest.match!.index!;
      
      if (matchIndex > 0) {
        blocks.push(<TextRenderer key={`text-before-${matchCount}`} text={currentText.substring(0, matchIndex)} />);
      }

      const fullMatch = earliest.match![0];
      if (earliest.type === 'chart') {
        blocks.push(
          <DynamicChart 
            key={`chart-${matchCount}`} 
            type={earliest.match![1] as any} 
            data={earliest.match![2]} 
            title={earliest.match![3]} 
            summary={earliest.match![4]} 
          />
        );
      } else if (earliest.type === 'insight') {
        blocks.push(
          <InsightCard 
            key={`insight-${matchCount}`} 
            value={earliest.match![1]} 
            title={earliest.match![2] || "Key Insight"}
          >
            {earliest.match![3]}
          </InsightCard>
        );
      } else if (earliest.type === 'reference') {
        blocks.push(
          <ReferenceLink 
            key={`ref-${matchCount}`} 
            url={earliest.match![1]} 
            domain={earliest.match![2]} 
            title={earliest.match![3]} 
          />
        );
      }

      currentText = currentText.substring(matchIndex + fullMatch.length);
    }
    
    return blocks;
  };

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
      className="text-foreground text-[15px] leading-relaxed max-w-none p-4 -mx-4 rounded-xl transition-colors hover:bg-muted/10 group relative space-y-4"
    >
      <div 
        className="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background border px-3 py-1.5 rounded-lg text-xs text-muted-foreground shadow-sm z-10 cursor-pointer hover:bg-muted hover:text-foreground flex items-center gap-2"
        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
      >
        <Copy className="w-3.5 h-3.5" />
        Edit Section
      </div>
      
      {isHtml ? (
         <div dangerouslySetInnerHTML={{ __html: text }} />
      ) : (
         <div className="space-y-4">
           {parseRichContent(viewText)}
         </div>
      )}
    </div>
  );
}

function TextRenderer({ text }: { text: string }) {
  if (!text.trim()) return null;
  
  return (
    <>
      {text.split("\n").map((line, i) => {
           if (!line.trim() || line.trim() === '---' || line.trim() === '##' || line.trim() === '***') return <div key={i} className="h-4" />;
           
           // Clean up markdown checkboxes if they exist so it just looks like a bullet
           let processedLine = line;
           if (processedLine.trim().match(/^-\s+\[\s?\]/)) {
             processedLine = processedLine.replace(/^-\s+\[\s?\]/, "-");
           }
           
           // Smart Badges for INTENSITY or STAGE keys
           const isIntensity = /INTENSITY:\s*(CRITICAL|HIGH|MEDIUM|LOW)/i.test(processedLine);
           if (isIntensity) {
             const intensity = processedLine.match(/INTENSITY:\s*(\w+)/i)?.[1].toUpperCase();
             const cleanText = processedLine.replace(/INTENSITY:\s*\w+/i, "").trim();
             return (
               <div key={i} className="text-[15px] leading-relaxed mb-3 flex items-start gap-2">
                  <span
                     className={cn(
                       "text-[10px] font-bold px-1.5 py-0.5 rounded-sm border shrink-0 mt-0.5 uppercase tracking-wide",
                       intensity === "CRITICAL" && "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30",
                       intensity === "HIGH" && "bg-white/10 text-white border-white/20",
                       intensity === "MEDIUM" && "bg-white/5 text-white/60 border-white/10",
                       intensity === "LOW" && "bg-white/5 text-white/60 border-white/10",
                     )}
                   >
                     {intensity}
                   </span>
                   <span className="text-white/80 font-normal">{cleanText}</span>
               </div>
             )
           }

           // Handle simple bold markup **bold** and headers
           const renderLine = () => {
             let textLine = processedLine.trim();
             let headerClass = "";
             if (textLine.startsWith('###')) { textLine = textLine.replace(/^###\s*/, ''); headerClass = "text-lg font-bold text-white mt-4 mb-2"; }
             else if (textLine.startsWith('##')) { textLine = textLine.replace(/^##\s*/, ''); headerClass = "text-xl font-bold text-white mt-6 mb-2"; }
             else if (textLine.startsWith('#')) { textLine = textLine.replace(/^#\s*/, ''); headerClass = "text-2xl font-bold text-white mt-6 mb-3"; }
             
             let prefixNode = null;
             
             if (!headerClass) {
               // Extract keys like "VISUAL THEME:" or "HOOK 1 —" to bold just the prefix
               const keyRegex = /^([A-Z0-9_\s]+:|STAGE:|BONUS.*?:|HOOK.*?—|ANGLE.*?:)(.*)/;
               const match = textLine.match(keyRegex);
               if (match) {
                 prefixNode = <strong className="text-white font-semibold mr-1.5">{match[1]}</strong>;
                 textLine = match[2];
               }
             }

             const fragments = textLine.split(/(\*\*.*?\*\*)/g).map((part, j) => {
               if (part.startsWith('**') && part.endsWith('**')) {
                 return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
               }
               return <React.Fragment key={j}>{part}</React.Fragment>;
             });

             if (headerClass) return <div className={headerClass}>{fragments}</div>;
             
             return (
               <div className={prefixNode ? "mt-4" : ""}>
                 {prefixNode}
                 <span className="text-white/80 font-normal">{fragments}</span>
               </div>
             );
           };

           return (
             <div
               key={i}
               className="text-[15px] leading-relaxed mb-3 last:mb-0"
             >
               {renderLine()}
             </div>
           );
         })}
    </>
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
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [funnelName, setFunnelName] = useState("");
  const [formData, setFormData] = useState<OfferFormData | null>(null);
  const [call1, setCall1] = useState<Record<string, string> | null>(null);
  const [call2, setCall2] = useState<Call2Output | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [genStep, setGenStep] = useState(0);
  
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
    
    // Animate steps
    let step = 0;
    setGenStep(0);
    const interval = setInterval(() => {
      step = Math.min(step + 1, GEN_STEPS.length - 1);
      setGenStep(step);
    }, 6000);

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
    } finally {
      clearInterval(interval);
      setGenStep(GEN_STEPS.length);
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

  const isAutoRunTriggered = React.useRef(false);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
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
          // AUTO RUN MAGIC HERE
          if (intelligence.raw_input && !isAutoRunTriggered.current) {
             isAutoRunTriggered.current = true;
             // Delay just a bit so states have a chance to settle
             setTimeout(() => {
                const btn = document.getElementById("auto-run-btn");
                if (btn) btn.click();
             }, 100);
          }
        }
      } catch (e: any) {
        setErrorMsg(e.message || "Something went wrong");
        setPhase("error");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [funnelId]);

  // Derive consolidated list of available sections
  const availableSections = React.useMemo(() => {
    return [
      "OFFER_SCORE",
      "SCORE_SUMMARY",
      "REVENUE_MODEL_ARCHITECTURE",
      "PAIN_POINT_MAPPING",
      "FUNNEL_STRUCTURE_BLUEPRINT",
      "PRICING_STRATEGY",
      "UPSELL_DOWNSELL_PATHS",
      "STRATEGIC_BONUS_RECOMMENDATIONS",
      "DESIGN_INTELLIGENCE_RECOMMENDATION",
      "FUNNEL_HEALTH_SCORE",
      "PLATFORM_PRIORITY_MATRIX",
      "OFFER_POSITIONING_ANALYSIS",
      "TARGET_PERSONA_INTELLIGENCE",
      "CONVERSION_HOOK_LIBRARY",
      "MESSAGING_ANGLE_MATRIX",
      "PRODUCT_CORE_VALUE_PERCEPTION",
      "REAL_WORLD_USE_CASE_SCENARIOS",
      "MONETIZATION_STRATEGY_NARRATIVE",
      "TRAFFIC_INTELLIGENCE"
    ];
  }, []);

  useEffect(() => {
    if (availableSections.length > 0 && (!activeSectionId || !availableSections.includes(activeSectionId))) {
      setActiveSectionId(availableSections[0]);
    }
  }, [availableSections, activeSectionId]);

  useEffect(() => {
    if (activeSectionId === "TRAFFIC_INTELLIGENCE") {
      router.push(`/funnels/${funnelId}/traffic`);
    }
  }, [activeSectionId, funnelId, router]);

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

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar
            breadcrumbs={[
              { label: "Funnels", href: `/funnels/${funnelId}` },
              { label: funnelName || "Loading...", href: `/funnels/${funnelId}` },
              { label: "Sales Intelligence" },
            ]}
            steps={WIZARD_STEPS}
          />
          <div className="flex-1 flex items-center justify-center p-8 relative">
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-20">
              <div className="w-[500px] h-[500px] rounded-full border border-brand-yellow/10 animate-[spin_120s_linear_infinite]" />
              <div className="absolute w-[350px] h-[350px] rounded-full border border-blue-500/10 animate-[spin_60s_linear_infinite_reverse]" />
            </div>
            <div className="text-center space-y-4 relative z-10">
              <Spinner className="w-10 h-10 mx-auto text-brand-yellow" />
              <p className="text-sm text-white/40 tracking-widest uppercase font-semibold">
                Initializing Intelligence Suite...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <Topbar
          breadcrumbs={[
            { label: "Funnels", href: `/funnels/${funnelId}` },
            { label: funnelName || funnelId, href: `/funnels/${funnelId}` },
            { label: "Sales Intelligence" },
          ]}
          steps={WIZARD_STEPS}
        >
          {phase !== "idle" && phase !== "done" && <Spinner size="sm" />}
          
          <Button variant="outline" size="sm" onClick={handlePrintPdf} className="gap-2 print:hidden">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>

          <Button
            size="sm"
            disabled={availableSections.length === 0}
            onClick={() => router.push(`/funnels/${funnelId}/copy`)}
            className="gap-1.5 font-semibold print:hidden"
          >
            Generate Copy
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Topbar>

        {/* Hidden PDF Stacking Container for window.print() */}
        <div className="hidden print:block absolute inset-0 bg-white text-black p-8 z-50 overflow-visible h-auto max-w-none">
          <div className="mb-8 border-b pb-4">
            <h1 className="text-3xl font-bold">{funnelName || "Sales Intelligence"}</h1>
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
            if (!content) return null;
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
          
          {/* Funnel secondary sidebar (collapsible icon rail) */}
          <FunnelSidebar funnelId={funnelId} funnelName={funnelName || funnelId} collapsible />

          {/* Left Sidebar Sections Navigation */}
          <div className="w-64 shrink-0 border-r border-border bg-card flex flex-col h-full hidden md:flex overflow-hidden">
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
                          ? "bg-brand-yellow/10 text-brand-yellow font-semibold shadow-[inset_0_0_0_1px_rgba(245,166,35,0.1)]" 
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
          </div>

          {/* Central Main Document */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-transparent">

             {!call1 || availableSections.length === 0 ? (
               <div className="flex items-center justify-center h-full p-8 relative z-10">
                 <Card className="max-w-md w-full border-white/10 bg-[#0a0a0a]/60 backdrop-blur-xl">
                    <CardContent className="p-8 text-center space-y-4">
                      {phase === "error" ? (
                        <>
                          <Zap className="w-8 h-8 mx-auto text-destructive mb-2" />
                          <h2 className="text-xl font-semibold text-destructive">Analysis Failed</h2>
                          <p className="text-sm text-white/60">{errorMsg || "An error occurred while generating intelligence."}</p>
                          <Button size="lg" onClick={runAnalysis} className="w-full mt-4">Retry Analysis</Button>
                        </>
                      ) : (
                        <>
                          <Zap className="w-8 h-8 mx-auto text-brand-yellow/50 mb-2 animate-pulse" />
                          <h2 className="text-xl font-semibold text-white">Starting AI Analysis</h2>
                          <p className="text-sm text-white/60">Automatically synthesizing your intelligence profile...</p>
                          <Button id="auto-run-btn" size="lg" onClick={runAnalysis} className="w-full mt-4 hidden">Generate Report (Hidden Trigger)</Button>
                        </>
                      )}
                    </CardContent>
                 </Card>
               </div>
             ) : (
                <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10 pb-32 relative z-10">
                   
                   {/* Premium Glassmorphic Container for the Content */}
                   <div className="relative rounded-[2.5rem] bg-blue-600/[0.02] backdrop-blur-3xl border border-white/5 p-8 md:p-12 shadow-2xl">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-brand-yellow/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                     <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

                     {/* Section Header */}
                     <div className="mb-10 flex items-baseline justify-between gap-4 border-b border-white/10 pb-6">
                        <div className="flex items-baseline gap-3 flex-wrap">
                           <h1 className="text-3xl font-bold tracking-tight text-white">
                             {activeConfig.label}
                           </h1>
                            {activeConfig.badge && (
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border translate-y-[-2px] bg-brand-yellow/10 text-brand-yellow/80 border-brand-yellow/20"
                              )}>
                                {activeConfig.badge}
                              </span>
                            )}
                           <p className="text-sm font-medium text-white/50 ml-2">
                             — {activeConfig.subheader}
                           </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(activeContent)} className="text-white/50 hover:text-white hover:bg-white/5 gap-2 shrink-0">
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
                    {activeConfig.chartType === "design" && activeSectionId === "DESIGN_INTELLIGENCE_RECOMMENDATION" && (
                      <DesignPreviewCard content={activeContent} />
                    )}
                    {activeConfig.chartType === "gauge" && activeSectionId === "FUNNEL_HEALTH_SCORE" && (
                      <FunnelHealthChart content={activeContent} />
                    )}

                   {/* Editable Markdown Body */}
                   <div className="min-h-[250px] mb-12 relative z-10">
                      <EditableNarrativeText 
                        text={activeContent} 
                        onChange={(newText) => updateSectionContent(activeSectionId, newText)} 
                      />
                   </div>

                   {/* Shadcn-style Footer Navigation */}
                   <div className="flex items-center justify-between border-t border-white/10 pt-8 mt-12 mb-6">
                      {prevSectionId ? (
                        <Button 
                          variant="outline" 
                          className="h-12 px-6 gap-3 group border-white/10 bg-white/5 hover:bg-white/10 text-white"
                          onClick={() => setActiveSectionId(prevSectionId)}
                        >
                          <ChevronLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                          <div className="flex flex-col items-start">
                            <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Previous</span>
                            <span className="truncate max-w-[120px] sm:max-w-xs">{SECTION_CONFIG[prevSectionId]?.label}</span>
                          </div>
                        </Button>
                      ) : (
                        <div /> // Spacer
                      )}

                      {nextSectionId ? (
                        <Button 
                          variant="outline" 
                          className="h-12 px-6 gap-3 group bg-brand-yellow/10 hover:bg-brand-yellow/20 border-brand-yellow/20 text-brand-yellow"
                          onClick={() => setActiveSectionId(nextSectionId)}
                        >
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Next Section</span>
                            <span className="truncate max-w-[120px] sm:max-w-xs">{SECTION_CONFIG[nextSectionId]?.label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-colors" />
                        </Button>
                      ) : (
                         <Button onClick={() => router.push(`/copy/${funnelId}`)} className="h-12 px-6 bg-brand-yellow text-black hover:bg-brand-yellow/90">
                           Finish & Build Pages
                         </Button>
                      )}
                   </div>
                   </div> {/* End Glassmorphic Container */}
                </div>
             )}
          </div>
        </div>
      </div>



      <GenerationOverlay visible={phase === "call1" || phase === "call2"} step={genStep} />
    </div>
  );
}
