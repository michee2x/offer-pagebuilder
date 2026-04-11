"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";
import {
  Zap,
  FileText,
  ArrowRight,
  Loader2,
  Edit,
  Save,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Layers,
  MessageSquare,
  Sparkles,
  Globe,
  Shield,
  BookOpen,
  Lightbulb,
  Cog,
  Palette,
  BarChart,
  Users as UsersIcon,
  DollarSign as DollarIcon,
  Target as TargetIcon,
  MessageSquare as MessageIcon,
  Palette as PaletteIcon,
  Shield as ShieldIcon,
  TrendingUp as TrendingIcon,
  RefreshCw,
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

const SECTION_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  OFFER_SCORE: {
    label: "Offer Score",
    icon: <BarChart3 className="w-4 h-4" />,
    color: "text-primary",
  },
  SCORE_SUMMARY: {
    label: "Score Summary",
    icon: <Target className="w-4 h-4" />,
    color: "text-primary",
  },
  REVENUE_MODEL_ARCHITECTURE: {
    label: "Revenue Model",
    icon: <DollarSign className="w-4 h-4" />,
    color: "text-emerald-500",
  },
  PAIN_POINT_MAPPING: {
    label: "Pain Points",
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-rose-500",
  },
  FUNNEL_STRUCTURE_BLUEPRINT: {
    label: "Funnel Blueprint",
    icon: <Layers className="w-4 h-4" />,
    color: "text-violet-500",
  },
  PRICING_STRATEGY: {
    label: "Pricing Strategy",
    icon: <DollarIcon className="w-4 h-4" />,
    color: "text-amber-500",
  },
  UPSELL_DOWNSELL_PATHS: {
    label: "Upsell Paths",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "text-emerald-500",
  },
  STRATEGIC_BONUS_RECOMMENDATIONS: {
    label: "Bonus Stack",
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-orange-500",
  },
  DESIGN_INTELLIGENCE_RECOMMENDATION: {
    label: "Design Intelligence",
    icon: <Palette className="w-4 h-4" />,
    color: "text-sky-500",
  },
  FUNNEL_HEALTH_SCORE: {
    label: "Health Score",
    icon: <Shield className="w-4 h-4" />,
    color: "text-primary",
  },
  PLATFORM_PRIORITY_MATRIX: {
    label: "Platform Priority",
    icon: <Globe className="w-4 h-4" />,
    color: "text-violet-500",
  },
  OFFER_POSITIONING_ANALYSIS: {
    label: "Offer Positioning",
    icon: <TargetIcon className="w-4 h-4" />,
    color: "text-primary",
  },
  TARGET_PERSONA_INTELLIGENCE: {
    label: "Target Persona",
    icon: <UsersIcon className="w-4 h-4" />,
    color: "text-blue-500",
  },
  CONVERSION_HOOK_LIBRARY: {
    label: "Conversion Hooks",
    icon: <MessageIcon className="w-4 h-4" />,
    color: "text-rose-500",
  },
  MESSAGING_ANGLE_MATRIX: {
    label: "Messaging Matrix",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "text-violet-500",
  },
  PRODUCT_CORE_VALUE_PERCEPTION: {
    label: "Value Perception",
    icon: <Lightbulb className="w-4 h-4" />,
    color: "text-amber-500",
  },
  REAL_WORLD_USE_CASE_SCENARIOS: {
    label: "Use Cases",
    icon: <BookOpen className="w-4 h-4" />,
    color: "text-green-500",
  },
  MONETIZATION_STRATEGY_NARRATIVE: {
    label: "Monetization Strategy",
    icon: <Cog className="w-4 h-4" />,
    color: "text-emerald-500",
  },
};

// ─── Small reusable UI ────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  label,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-foreground tracking-tight">
        {label}
      </h3>
      {badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
          {badge}
        </span>
      )}
    </div>
  );
}

function EditableNarrativeText({
  text,
  isEditing,
  onChange,
}: {
  text: string;
  isEditing: boolean;
  onChange: (newText: string) => void;
}) {
  if (isEditing) {
    return (
      <RichTextEditor
        content={text}
        onChange={onChange}
        placeholder="Edit this section..."
      />
    );
  }
  if (!text) return <StreamingPlaceholder />;
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      {text
        .split("\n")
        .filter(Boolean)
        .map((para, i) => (
          <p
            key={i}
            className="text-sm text-foreground leading-relaxed mb-2 last:mb-0"
          >
            {para}
          </p>
        ))}
    </div>
  );
}

function PreformattedSection({ text }: { text: string }) {
  if (!text) return <StreamingPlaceholder />;
  return (
    <div className="space-y-0.5">
      {text
        .split("\n")
        .filter((l) => l.trim())
        .map((line, i) => {
          const isKey =
            /^[A-Z_\s]+:/.test(line.trim()) ||
            /^\[\d+\]/.test(line.trim()) ||
            /^STAGE:|^BONUS|^HOOK|^ANGLE/.test(line.trim());
          const isIntensity = /INTENSITY:\s*(CRITICAL|HIGH|MEDIUM|LOW)/.test(
            line,
          );
          const intensity = isIntensity
            ? line.match(/INTENSITY:\s*(\w+)/)?.[1]
            : null;
          return (
            <div
              key={i}
              className={cn(
                "text-sm leading-relaxed",
                isKey
                  ? "text-foreground font-semibold mt-3 first:mt-0"
                  : "text-foreground",
              )}
            >
              {isIntensity && intensity && (
                <span
                  className={cn(
                    "text-[10px] font-bold mr-2 px-1.5 py-0.5 rounded-sm border",
                    intensity === "CRITICAL" &&
                      "bg-rose-500/10 text-rose-400 border-rose-500/20",
                    intensity === "HIGH" &&
                      "bg-amber-500/10 text-amber-400 border-amber-500/20",
                    intensity === "MEDIUM" &&
                      "bg-blue-500/10 text-blue-400 border-blue-500/20",
                    intensity === "LOW" &&
                      "bg-muted text-muted-foreground border-border",
                  )}
                >
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

function OfferScoreDisplay({ content }: { content: string }) {
  try {
    const scores = JSON.parse(content);
    return (
      <div className="space-y-3">
        <div className="text-2xl font-bold text-primary">
          {scores.overall}/100
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ScoreBar label="Market Viability" value={scores.market_viability} />
          <ScoreBar label="Audience Clarity" value={scores.audience_clarity} />
          <ScoreBar label="Offer Strength" value={scores.offer_strength} />
          <ScoreBar
            label="Price-Value Alignment"
            value={scores.price_value_alignment}
          />
          <ScoreBar label="Uniqueness" value={scores.uniqueness} />
          <ScoreBar label="Proof Strength" value={scores.proof_strength} />
          <ScoreBar
            label="Conversion Readiness"
            value={scores.conversion_readiness}
          />
        </div>
      </div>
    );
  } catch {
    return <div className="text-sm text-muted-foreground">{content}</div>;
  }
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
    1: "border-primary/30 bg-primary/5",
    2: "border-border bg-muted/20",
    3: "border-border bg-background",
  };
  const rankColors = {
    1: "bg-primary text-primary-foreground",
    2: "bg-muted text-muted-foreground",
    3: "bg-muted text-muted-foreground",
  };
  return (
    <div
      className={cn("rounded-xl border p-4 flex flex-col gap-3", colors[rank])}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={cn(
                "text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center",
                rankColors[rank],
              )}
            >
              {rank}
            </span>
            <span className="font-bold text-sm text-foreground">
              {platform}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{objective}</span>
        </div>
        <span className="text-lg font-bold text-foreground shrink-0">
          {allocation}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          CPL: <strong className="text-foreground">{cpl}</strong>
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {rationale}
      </p>
    </div>
  );
}

// ─── Divider with label ───────────────────────────────────────────────────────

function SectionDivider({
  label,
  color = "default",
}: {
  label: string;
  color?: "default" | "violet" | "amber";
}) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-border" />
      <span
        className={cn(
          "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border",
          color === "violet" &&
            "text-violet-400 bg-violet-500/10 border-violet-500/20",
          color === "amber" &&
            "text-amber-400 bg-amber-500/10 border-amber-500/20",
          color === "default" && "text-muted-foreground bg-muted border-border",
        )}
      >
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Streaming state machine ──────────────────────────────────────────────────

type StreamPhase = "idle" | "call1" | "call2" | "done" | "error";

// ─── Main Page ────────────────────────────────────────────────────────────────

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
  const [call1Data, setCall1Data] = useState<Record<string, string> | null>(
    null,
  );
  const [call1, setCall1] = useState<Record<string, string> | null>(null);
  const [call2, setCall2] = useState<Call2Output | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedCall1, setEditedCall1] = useState<Record<string, string> | null>(
    null,
  );

  const enterEditMode = useCallback(() => {
    setEditedCall1(call1 ? { ...call1 } : {});
    setIsEditing(true);
  }, [call1]);

  const cancelEdit = useCallback(() => {
    setEditedCall1(null);
    setIsEditing(false);
  }, []);

  // ── Load & optionally stream ──────────────────────────────────────────────

  const streamCall1 = useCallback(
    async (fd: OfferFormData, existingCall1?: Record<string, string>) => {
      if (existingCall1) {
        setCall1(existingCall1);
        return existingCall1;
      }
      setPhase("call1");
      setStreamingText(""); // Clear previous streaming text
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
        setStreamingText(accumulated); // Update streaming text in real-time
      }
      const parsed = parseCall1Output(accumulated);
      setCall1(parsed);
      setCall1Data(parsed);
      setStreamingText(""); // Clear streaming text when done
      return parsed;
    },
    [funnelId],
  );

  const streamCall2 = useCallback(
    async (
      fd: OfferFormData,
      c1: Record<string, string>,
      existingCall2?: Call2Output,
    ) => {
      if (existingCall2) {
        setCall2(existingCall2);
        return;
      }
      setPhase("call2");
      setStreamingText(""); // Clear previous streaming text
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
        setStreamingText(accumulated); // Update streaming text in real-time
        // Parse and update progressively every ~500 chars
        if (accumulated.length % 500 < 50) {
          setCall2(parseCall2Output(accumulated));
        }
      }
      setCall2(parseCall2Output(accumulated));
      setStreamingText(""); // Clear streaming text when done
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

  const saveEditedCall1 = useCallback(async () => {
    if (!editedCall1) return;
    try {
      const res = await fetch(`/api/offer-data/${funnelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intelligence: { call1: editedCall1 } }),
      });
      if (!res.ok) throw new Error("Save failed");
      setCall1(editedCall1);
      setCall1Data(editedCall1);
      setIsEditing(false);
    } catch (e: any) {
      setErrorMsg(e.message || "Save failed");
    }
  }, [editedCall1, funnelId]);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`/api/offer-data/${funnelId}`);
        if (!res.ok) throw new Error("Funnel not found");
        const { funnel } = await res.json();

        const intelligence: OfferIntelligence =
          funnel.blocks?.intelligence || {};
        const fd: OfferFormData = intelligence.raw_input;
        setFormData(fd);
        setFunnelName(funnel.name || "Untitled Funnel");

        if (intelligence.call1) {
          setCall1(intelligence.call1);
          setCall1Data(intelligence.call1);
        }

        if (intelligence.call2) {
          setCall2(intelligence.call2);
        }

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
  }, [funnelId, streamCall1, streamCall2]);

  // ── Phase indicator ───────────────────────────────────────────────────────

  const PhaseStatus = () => {
    if (phase === "done") return null;
    if (phase === "error")
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          {errorMsg}
        </div>
      );

    // Show streaming text if available
    if (streamingText) {
      return (
        <div className="px-4 py-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span className="text-xs font-medium text-primary">
              {phase === "call1"
                ? "AI Structural Analysis (Sonnet)"
                : "AI Strategic Analysis (Opus)"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground font-mono bg-background/50 p-2 rounded border max-h-32 overflow-y-auto">
            {streamingText}
          </div>
        </div>
      );
    }

    if (phase === "idle") return null;

    // Default loading state
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {phase === "call1"
          ? "Initializing structural analysis..."
          : phase === "call2"
            ? "Initializing strategic analysis..."
            : "Loading..."}
      </div>
    );
  };

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{ marginLeft: "56px" }}
      >
        {/* Topbar */}
        <Topbar
          breadcrumbs={[
            { label: "Funnels", href: "/" },
            {
              label: funnelName || funnelId,
              href: `/intelligence/${funnelId}`,
            },
            { label: "Intelligence" },
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
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    {funnelName || "—"}
                  </h1>
                  {formData && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.field_1_format} · {formData.field_4_price}{" "}
                      {formData.field_4_currency} ·{" "}
                      {formData.field_7_channels.join(", ")}
                    </p>
                  )}
                </div>
                {call1Data && Object.keys(call1Data).length > 0 && (
                  <div className="shrink-0 text-right">
                    <div className="text-3xl font-bold text-primary">
                      {Object.keys(call1Data).length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Intelligence Sections
                    </div>
                  </div>
                )}
              </div>

              {/* Report Content */}
              {!call1Data || Object.keys(call1Data).length === 0 ? (
                <Card className="border border-border bg-card p-6">
                  <CardContent className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        Start your intelligence analysis
                      </h2>
                      <p className="text-sm text-muted-foreground mt-2">
                        This page will stream the structural and strategic
                        intelligence for your offer in real time. Click the
                        button below to begin.
                      </p>
                    </div>
                    <Button size="lg" onClick={runAnalysis} className="w-full">
                      Analyze Offer
                    </Button>
                    {phase !== "idle" && phase !== "done" && (
                      <div className="text-xs text-muted-foreground">
                        Analysis is in progress — keep this page open and watch
                        the AI stream.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Edit Controls */}
                  <div className="flex justify-end gap-2">
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={enterEditMode}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Report
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEditedCall1}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </>
                    )}
                  </div>

                  <Accordion type="single" collapsible className="space-y-3">
                    {Object.entries(
                      isEditing ? editedCall1 || {} : call1Data,
                    ).map(([key, content], index) => {
                      const config = SECTION_CONFIG[key] || {
                        label: key.replace(/_/g, " "),
                        icon: <FileText className="w-4 h-4" />,
                        color: "text-muted-foreground",
                      };
                      return (
                        <AccordionItem
                          key={key}
                          value={key}
                          className="border border-border rounded-xl overflow-hidden"
                        >
                          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "p-2 rounded-lg bg-muted",
                                  config.color
                                    .replace("text-", "bg-")
                                    .replace("-500", "-500/10"),
                                )}
                              >
                                {config.icon}
                              </div>
                              <div className="text-left">
                                <h3 className="text-sm font-semibold text-foreground">
                                  {config.label}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  Section {index + 1} of{" "}
                                  {
                                    Object.keys(
                                      isEditing ? editedCall1 || {} : call1Data,
                                    ).length
                                  }
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6">
                            <Card className="border-0 shadow-none bg-transparent">
                              <CardContent className="p-0">
                                {key === "OFFER_SCORE" && !isEditing ? (
                                  <OfferScoreDisplay content={content} />
                                ) : (
                                  <EditableNarrativeText
                                    text={content}
                                    isEditing={isEditing}
                                    onChange={(newText) => {
                                      if (editedCall1) {
                                        setEditedCall1({
                                          ...editedCall1,
                                          [key]: newText,
                                        });
                                      }
                                    }}
                                  />
                                )}
                              </CardContent>
                            </Card>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>

                  {call2 ? (
                    <div className="space-y-2">
                      <Accordion
                        type="single"
                        collapsible
                        className="space-y-2"
                      >
                        <AccordionItem
                          value="offer-positioning"
                          className="border border-border rounded-lg"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                                <Layers className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                Offer Positioning Analysis
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <NarrativeText
                              text={call2.offer_positioning_analysis}
                            />
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                          value="target-persona"
                          className="border border-border rounded-lg"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                                <Users className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                Target Persona Intelligence
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <NarrativeText
                              text={call2.target_persona_intelligence}
                            />
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                          value="conversion-hooks"
                          className="border border-border rounded-lg"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                                <MessageSquare className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                Conversion Hook Library
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <PreformattedSection
                              text={call2.conversion_hook_library}
                            />
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                          value="messaging-angles"
                          className="border border-border rounded-lg"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                                <Lightbulb className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                Messaging Angle Matrix
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <PreformattedSection
                              text={call2.messaging_angle_matrix}
                            />
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                          value="product-core-value"
                          className="border border-border rounded-lg"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                                <TargetIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                Product Core Value Perception
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <NarrativeText
                              text={call2.product_core_value_perception}
                            />
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                          value="operator-scenarios"
                          className="border border-border rounded-lg"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                                <Users className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                Real-World Operator Scenarios
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <PreformattedSection
                              text={call2.real_world_use_case_scenarios}
                            />
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                          value="monetization-narrative"
                          className="border border-primary/20 bg-primary/[0.02] rounded-lg"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                <Sparkles className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                Monetization Strategy Narrative
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                Master Strategy
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <NarrativeText
                              text={call2.monetization_strategy_narrative}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  ) : (
                    call1Data &&
                    phase === "idle" && (
                      <Card className="border border-border p-6">
                        <CardContent className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Strategic intelligence is ready to generate
                            </h3>
                            <p className="text-sm text-muted-foreground mt-2">
                              You can now generate the full call2 strategy
                              report based on the structural analysis.
                            </p>
                          </div>
                          <Button
                            size="lg"
                            onClick={runAnalysis}
                            className="w-full"
                          >
                            Generate Strategic Intelligence
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  )}

                  {/* Next Steps */}
                  {call2 && (
                    <div className="mt-8 text-center">
                      <Card className="max-w-md mx-auto">
                        <CardContent className="p-6">
                          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <ArrowRight className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            Ready for Copy Generation
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Use this intelligence to generate high-converting
                            sales copy for your funnel pages.
                          </p>
                          <Button
                            onClick={() => router.push(`/copy/${funnelId}`)}
                            className="w-full"
                          >
                            Generate Sales Copy
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}

              {/* Loading state */}
              {phase === "call1" && !call1Data && (
                <div className="space-y-4">
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Generating Intelligence Report
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      AI is analyzing your offer and creating a comprehensive
                      revenue blueprint...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar — quick nav */}
          <div className="w-52 shrink-0 border-l border-border bg-card overflow-y-auto hidden xl:block">
            <div className="p-4 sticky top-0 bg-card border-b border-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Sections
              </p>
            </div>
            <nav className="p-2 space-y-0.5 text-xs">
              {[
                ["Offer Score", ""],
                ["Funnel Health", ""],
                ["Revenue Model", ""],
                ["Pain Points", ""],
                ["Funnel Blueprint", ""],
                ["Pricing", ""],
                ["Upsell Paths", ""],
                ["Bonuses", ""],
                ["Design", ""],
                ["Platforms", ""],
                ["Positioning", "Opus"],
                ["Persona", "Opus"],
                ["Hooks", "Opus"],
                ["Messaging", "Opus"],
                ["Value Perception", "Opus"],
                ["Scenarios", "Opus"],
                ["Strategy Narrative", "Opus"],
              ].map(([label, badge]) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <span>{label}</span>
                  {badge && (
                    <span className="text-[9px] text-violet-400 font-bold">
                      {badge}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
