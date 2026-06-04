"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FunnelSidebar } from "@/components/layout/FunnelSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { IntelligenceEditor } from "@/components/ui/intelligence-editor";
import { ThemeGroundUI } from "@/components/intelligence/ThemeGroundUI";
import { OfferIQAgent } from "@/components/OfferIQAgent";
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
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent z-0 opacity-30"
      />
      
      <div className="w-full max-w-md mx-auto px-10 text-center flex flex-col items-center relative z-10">
        <div className="relative w-32 h-32 mb-10">
           {/* Outer rotating ring */}
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 rounded-full border border-indigo-500/10 border-t-indigo-500/50"
           />
           {/* Inner rotating ring */}
           <motion.div 
             animate={{ rotate: -360 }}
             transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
             className="absolute inset-4 rounded-full border border-purple-500/20 border-b-purple-500"
           />
           
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="flex flex-col items-center">
               <span className="text-3xl font-bold tracking-tighter text-white">{progressPercent}%</span>
               <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Sync</span>
             </div>
           </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tighter">
            Architecting <span className="text-indigo-400">Sales Intelligence</span>
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
             className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
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
    color: "text-indigo-400",
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
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  
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

  const regenerateAnalysis = useCallback(async () => {
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
      // Force regeneration by passing undefined for existing calls
      const c1 = await streamCall1(formData, undefined);
      if (!c1 || Object.keys(c1).length === 0) {
        throw new Error("Structural analysis returned empty output.");
      }
      await streamCall2(formData, c1, undefined);
      setPhase("done");
    } catch (e: any) {
      setErrorMsg(e.message || "Analysis failed");
      setPhase("error");
    } finally {
      clearInterval(interval);
      setGenStep(GEN_STEPS.length);
    }
  }, [formData, streamCall1, streamCall2]);

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
        setWorkspaceId(funnel.workspace_id || null);

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
      "MONETIZATION_STRATEGY_NARRATIVE"
    ];
  }, []);

  useEffect(() => {
    if (availableSections.length > 0 && (!activeSectionId || !availableSections.includes(activeSectionId))) {
      setActiveSectionId(availableSections[0]);
    }
  }, [availableSections, activeSectionId]);



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
      <div className="flex h-screen overflow-hidden bg-[#030712]">
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
              <div className="w-[500px] h-[500px] rounded-full border border-indigo-500/10 animate-[spin_120s_linear_infinite]" />
              <div className="absolute w-[350px] h-[350px] rounded-full border border-blue-500/10 animate-[spin_60s_linear_infinite_reverse]" />
            </div>
            <div className="text-center space-y-4 relative z-10">
              <Spinner className="w-10 h-10 mx-auto text-indigo-500" />
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
    <div className="flex h-screen overflow-hidden bg-[#030712] relative z-0">
      {/* Background Elements (copied from home page) */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        {/* Radial - Pink */}
        <div
          className="absolute top-[80px] right-[-480px] w-[994px] h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, rgb(236, 72, 153) 0%, rgba(236, 72, 153, 0) 100%)',
            transform: 'rotate(-30deg)'
          }}
        />
        {/* Radial - Blue */}
        <div
          className="absolute top-[80px] left-[-480px] w-[994px] h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, rgb(59, 130, 246) 0%, rgba(59, 130, 246, 0) 100%)',
            transform: 'rotate(30deg)'
          }}
        />
        {/* Radial - Purple */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[522px] opacity-[0.36] z-[1]"
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, rgb(140, 22, 250) 0%, rgba(140, 22, 250, 0) 100%)'
          }}
        />
        {/* Bottom Gradient Overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[240px] z-[2] opacity-100"
          style={{
            background: 'linear-gradient(180deg, rgba(3, 7, 18, 0) 0%, rgb(3, 7, 18) 100%)'
          }}
        />
        {/* Noise Overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none z-[1]"
          style={{
            backgroundImage: 'url(https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '128px auto'
          }}
        />
      </div>

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 text-white">

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
          
          <Button variant="outline" size="sm" onClick={regenerateAnalysis} className="gap-2 print:hidden text-white bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all shadow-[0_0_10px_rgba(255,255,255,0.05)] hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]">
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Regenerate</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrintPdf} className="gap-2 print:hidden text-white bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all shadow-[0_0_10px_rgba(255,255,255,0.05)] hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>

          <Button
            size="sm"
            disabled={availableSections.length === 0}
            onClick={() => router.push(`/funnels/${funnelId}/copy`)}
            className="gap-1.5 font-semibold print:hidden bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.75)] border-transparent transition-all duration-300"
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

             <nav className="p-2 overflow-y-auto space-y-1 flex-1 custom-scrollbar pb-6 text-sm">
                {availableSections.map((sid) => {
                  const cfg = SECTION_CONFIG[sid] || { label: sid, color: "text-muted-foreground", badge: "" };
                  const isActive = sid === activeSectionId;
                  return (
                    <button
                      key={sid}
                      onClick={() => setActiveSectionId(sid)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left group relative overflow-hidden border",
                        isActive 
                          ? "bg-white/5 border-white/10 text-white shadow-lg" 
                          : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"
                      )}
                    >
                       {isActive && (
                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500" />
                       )}
                       <span className={cn("truncate pr-2 font-medium transition-colors", isActive && "text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 ml-1")}>{cfg.label}</span>
                       {(cfg.badge || isActive) && (
                         <div className="shrink-0 flex items-center gap-1.5 z-10 relative">
                           {cfg.badge && !isActive && (
                             <span className="text-[9px] uppercase tracking-wider opacity-60 font-bold">{cfg.badge}</span>
                           )}
                           {isActive && <ChevronRight className="w-4 h-4 text-pink-500" />}
                         </div>
                       )}
                    </button>
                  );
                })}
             </nav>
          </div>

          {/* Central Main Document */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-transparent">

             {!formData ? (
               <div className="flex items-center justify-center h-full p-8 relative z-10">
                 <Card className="max-w-xl w-full border-white/5 bg-[#0b0f19]/70 backdrop-blur-2xl rounded-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent pointer-events-none" />
                    <CardContent className="p-12 text-center space-y-6 relative z-10">
                      <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
                        <Sparkles className="w-8 h-8 text-indigo-400" />
                      </div>
                      
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Strategy Blueprint Not Found</h2>
                        <p className="text-[14px] text-white/50 leading-relaxed max-w-sm mx-auto font-light">
                          This campaign does not have any onboarding details yet. Let&apos;s configure your offer parameters to build a full sales intelligence report.
                        </p>
                      </div>

                      <Button 
                        size="lg" 
                        onClick={() => {
                          if (workspaceId) {
                            router.push(`/analyze?workspace=${workspaceId}`);
                          } else {
                            router.push('/');
                          }
                        }} 
                        className="w-full mt-4 h-12 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.75)] border-transparent transition-all duration-300"
                      >
                        Configure Campaign Strategy
                      </Button>
                    </CardContent>
                 </Card>
               </div>
             ) : !call1 || availableSections.length === 0 ? (
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
                          <div className="relative rounded-[2.5rem] bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.12] transition-all p-8 md:p-12 shadow-2xl">
                             <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                             <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                             {/* Section Header */}
                             <div className="mb-10 flex items-baseline justify-between gap-4 border-b border-white/10 pb-6">
                                <div className="flex items-baseline gap-3 flex-wrap">
                                   <h1 className="text-3xl font-bold tracking-tight text-white">
                                     {activeConfig.label}
                                   </h1>
                                    {activeConfig.badge && (
                                      <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border translate-y-[-2px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                      )}>
                                        {activeConfig.badge}
                                      </span>
                                    )}
                                </div>
                             </div>
                             <Zap className="w-8 h-8 mx-auto text-indigo-400/50 mb-2 animate-pulse" />
                             <h2 className="text-xl font-semibold text-white">Starting AI Analysis</h2>
                             <p className="text-sm text-white/60">Automatically synthesizing your intelligence profile...</p>
                             <Button id="auto-run-btn" size="lg" onClick={runAnalysis} className="w-full mt-4 hidden">Generate Report (Hidden Trigger)</Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                 </Card>
               </div>
             ) : (
                <div className={cn("mx-auto px-6 lg:px-12 py-10 pb-32 relative z-10", activeSectionId === 'DESIGN_INTELLIGENCE_RECOMMENDATION' ? 'max-w-7xl' : 'max-w-4xl')}>
                   
                   {/* Premium Glassmorphic Container for the Content */}
                   <div className="relative rounded-[2.5rem] bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.12] transition-all p-8 md:p-12 shadow-2xl">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-brand-yellow/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                     <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

                     {/* Section Header */}
                     <div className="mb-10 flex items-baseline justify-between gap-4 border-b border-white/10 pb-6 relative z-10">
                        <div className="flex items-baseline gap-3 flex-wrap">
                           <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50">
                             {activeConfig.label}
                           </h1>
                            {activeConfig.badge && (
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border translate-y-[-4px] shadow-lg",
                                "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/30 backdrop-blur-md"
                              )}>
                                {activeConfig.badge}
                              </span>
                            )}
                           <p className="text-sm font-medium text-white/50 ml-2">
                             — {activeConfig.subheader}
                           </p>
                        </div>
                         {activeSectionId !== 'DESIGN_INTELLIGENCE_RECOMMENDATION' && (
                           <Button variant="outline" size="sm" onClick={() => copyToClipboard(activeContent)} className="text-white hover:text-cyan-300 hover:bg-white/10 border-white/10 gap-2 shrink-0 rounded-xl transition-colors">
                             <Copy className="w-4 h-4" />
                             <span className="hidden lg:inline">Copy Text</span>
                           </Button>
                         )}
                     </div>



                   {/* Editable Content — Theme Ground or Markdown Body */}
                   <div className="min-h-[250px] mb-12 relative z-10">
                      {activeSectionId === 'DESIGN_INTELLIGENCE_RECOMMENDATION' ? (
                        <ThemeGroundUI
                          content={activeContent}
                          onChange={(newText) => updateSectionContent(activeSectionId, newText)}
                        />
                      ) : (
                        <IntelligenceEditor 
                          content={activeContent} 
                          onChange={(newText) => updateSectionContent(activeSectionId, newText)} 
                          isStreaming={phase === "call1" || phase === "call2"}
                        />
                      )}
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
                          className="h-12 px-6 gap-3 group bg-indigo-600 hover:bg-indigo-500 border-transparent text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.65)] transition-all duration-300"
                          onClick={() => setActiveSectionId(nextSectionId)}
                        >
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Next Section</span>
                            <span className="truncate max-w-[120px] sm:max-w-xs">{SECTION_CONFIG[nextSectionId]?.label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-colors" />
                        </Button>
                      ) : (
                         <Button onClick={() => router.push(`/copy/${funnelId}`)} className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.75)] border-transparent transition-all duration-300">
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

      <OfferIQAgent
        ability="intelligence"
        funnelId={funnelId}
        funnelName={funnelName || "Your Funnel"}
        activeSectionId={activeSectionId}
        activeSectionContent={activeContent}
        onUpdateIntelligenceSection={(sectionId, content) => {
          updateSectionContent(sectionId, content);
        }}
      />
    </div>
  );
}
