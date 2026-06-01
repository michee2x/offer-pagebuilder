"use client";

import React, { useEffect, useState, use, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Zap,
  ArrowRight,
  RefreshCw,
  LayoutTemplate,
  TrendingUp,
  Heart,
  FileText,
  Sparkles,
  Save,
  Check,
  Play,
  Image as ImageIcon,
  Users,
  Star,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { CopyOutput, FunnelPageKey } from "@/lib/offer-types";
import { FUNNEL_PAGE_LABELS } from "@/lib/offer-types";
import { parseCopyOutput } from "@/lib/offer-parser";
import { toast } from "sonner";
import { FunnelSidebar } from "@/components/layout/FunnelSidebar";
import { DocEditor } from "@/components/copy/DocEditor";
import { OfferIQAgent } from "@/components/OfferIQAgent";

// ─── Wizard steps ─────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { id: 1, label: "Upload", status: "done" as const },
  { id: 2, label: "Intelligence", status: "done" as const },
  { id: 3, label: "Copy", status: "active" as const },
  { id: 4, label: "Build Pages", status: "pending" as const },
  { id: 5, label: "Publish", status: "pending" as const },
];

// ─── Page nav icons ───────────────────────────────────────────────────────────

function Target(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function TrendDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

const PAGE_ICONS: Record<FunnelPageKey, React.ReactNode> = {
  lead_capture: <Target className="w-3.5 h-3.5" />,
  sales_page: <TrendingUp className="w-3.5 h-3.5" />,
  upsell: <Zap className="w-3.5 h-3.5" />,
  downsell: <TrendDown className="w-3.5 h-3.5" />,
  thankyou: <Heart className="w-3.5 h-3.5" />,
};

// ─── Generation overlay ───────────────────────────────────────────────────────

const GEN_STEPS = [
  "Analysing offer & persona intelligence",
  "Deciding funnel page architecture",
  "Designing section layouts",
  "Writing conversion copy",
  "Finalizing page spec",
];

function GenerationOverlay({
  visible,
  step,
}: {
  visible: boolean;
  step: number;
}) {
  if (!visible) return null;
  const pct = Math.min(100, Math.round((step / GEN_STEPS.length) * 100));
  const label =
    step >= GEN_STEPS.length
      ? "Finalizing…"
      : GEN_STEPS[Math.min(step, GEN_STEPS.length - 1)];
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center">
      <div className="w-full max-w-sm mx-auto px-6 text-center flex flex-col items-center">
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          <Spinner
            size="xl"
            className="absolute inset-0 h-full w-full border-4"
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
            {pct}%
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
          Designing Your Pages
        </h2>
        <div className="h-6 overflow-hidden">
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CopyPage({
  params,
}: {
  params: Promise<{ funnelId: string }>;
}) {
  const { funnelId } = use(params);
  const router = useRouter();

  const [isInitializing, setIsInitializing] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingSection, setIsRegeneratingSection] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [funnelName, setFunnelName] = useState("");
  const [copy, setCopy] = useState<CopyOutput | null>(null);
  const [activePage, setActivePage] = useState<FunnelPageKey | null>(null);
  const [intelligenceComplete, setIntelligenceComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ── Load ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function init() {
      const res = await fetch(`/api/offer-data/${funnelId}`);
      if (!res.ok) return;
      const { funnel } = await res.json();
      setFunnelName(funnel.name || "Untitled Funnel");

      if (funnel.blocks?.copy_complete && funnel.blocks?.copy) {
        const loaded: CopyOutput = funnel.blocks.copy;
        setCopy(loaded);
        setActivePage(loaded.declaration?.pages?.[0] ?? null);
      }

      const intelligence = funnel.blocks?.intelligence;
      const isComplete = !!intelligence && Object.keys(intelligence).length > 0;
      setIntelligenceComplete(isComplete);

      if (!funnel.blocks?.copy_complete && isComplete) {
        generateCopy().catch(console.error);
      }
      setIsInitializing(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnelId]);

  // ── Auto-save ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!hasUnsavedChanges || !copy) return;
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/offer-data/${funnelId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blocks: { copy } }),
        });
        setHasUnsavedChanges(false);
      } catch (e) {
        console.error("Auto-save error:", e);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [copy, hasUnsavedChanges, funnelId]);

  // ── Generate ────────────────────────────────────────────────────────────────

  async function generateCopy() {
    setIsGenerating(true);
    setHasUnsavedChanges(false);

    let step = 0;
    const interval = setInterval(() => {
      step = Math.min(step + 1, GEN_STEPS.length - 1);
      setGenStep(step);
    }, 9000);

    try {
      const res = await fetch("/api/offer-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnelId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }

      const parsed = parseCopyOutput(accumulated);
      setCopy(parsed);
      setActivePage(parsed.declaration.pages[0] ?? null);
    } catch (e: any) {
      toast.error(`Generation failed: ${e.message}`);
    } finally {
      clearInterval(interval);
      setGenStep(GEN_STEPS.length);
      setIsGenerating(false);
    }
  }

  // ── Save ────────────────────────────────────────────────────────────────────

  async function handleSaveCopy() {
    if (!copy) return;
    setIsSaving(true);
    toast.loading("Saving…");
    try {
      const res = await fetch(`/api/offer-data/${funnelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: { copy } }),
      });
      if (!res.ok) throw new Error(res.statusText);
      setHasUnsavedChanges(false);
      toast.dismiss();
      toast.success("Saved!");
    } catch (e: any) {
      toast.dismiss();
      toast.error(e.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Editor update handler ───────────────────────────────────────────────────

  const handleUpdateDoc = useCallback(
    (html: string) => {
      if (!copy || !activePage) return;
      setCopy((prev) => {
        if (!prev) return prev;
        const page = prev.pages[activePage];
        if (!page) return prev;

        return {
          ...prev,
          pages: {
            ...prev.pages,
            [activePage]: { ...page, html },
          },
        };
      });
      setHasUnsavedChanges(true);
    },
    [copy, activePage],
  );

  // ── Agent copy update handler ───────────────────────────────────────────────

  const handleUpdateCopyPage = useCallback(
    (page: FunnelPageKey, html: string) => {
      if (!copy) return;
      setCopy((prev) => {
        if (!prev) return prev;
        const pageData = prev.pages[page];
        if (!pageData) return prev;

        return {
          ...prev,
          pages: {
            ...prev.pages,
            [page]: { ...pageData, html },
          },
        };
      });
      setHasUnsavedChanges(true);
    },
    [copy],
  );

  // ── Regenerate single section ────────────────────────────────────────────────

  const handleRegenerateSection = useCallback(async () => {
    if (!copy || !activePage) return;
    setIsRegeneratingSection(true);
    try {
      const res = await fetch("/api/regenerate-section-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funnelId,
          pageKey: activePage,
          currentCopy: copy.pages[activePage],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }

      // Parse the regenerated section copy (expect HTML + metadata)
      const lines = accumulated.trim().split("\n");
      const htmlMatch = accumulated.match(/<html[\s\S]*<\/html>/i);
      const html = htmlMatch ? htmlMatch[0] : accumulated;

      if (html) {
        setCopy((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pages: {
              ...prev.pages,
              [activePage]: {
                ...prev.pages[activePage],
                html,
              },
            },
          };
        });
        setHasUnsavedChanges(true);
        toast.success(`${FUNNEL_PAGE_LABELS[activePage]} regenerated!`);
      }
    } catch (e: any) {
      toast.error(`Regeneration failed: ${e.message}`);
    } finally {
      setIsRegeneratingSection(false);
    }
  }, [funnelId, copy, activePage]);

  // ── Derived ─────────────────────────────────────────────────────────────────

  const pageList: FunnelPageKey[] = copy?.declaration?.pages ?? [];

  const overallScore = copy
    ? Math.round(
        pageList.reduce((a, k) => a + (copy.pages[k]?.score ?? 0), 0) /
          Math.max(pageList.length, 1),
      )
    : 0;

  const activePageSpec = activePage ? (copy?.pages[activePage] ?? null) : null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] relative z-0">
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

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Topbar
          breadcrumbs={[
            { label: "Funnels", href: `/funnels/${funnelId}` },
            { label: funnelName || funnelId, href: `/funnels/${funnelId}` },
            { label: "Copy Engine" },
          ]}
          steps={WIZARD_STEPS}
        >
          {copy && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveCopy}
              disabled={isSaving}
              className={cn(
                "gap-1.5 text-xs transition-all border-transparent",
                hasUnsavedChanges
                  ? "bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.65)]"
                  : "text-muted-foreground hover:text-foreground bg-white/5 border border-white/10",
              )}
            >
              {isSaving ? (
                <Spinner size="sm" />
              ) : hasUnsavedChanges ? (
                <Save className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              {hasUnsavedChanges ? "Save" : "Saved"}
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => router.push(`/builder?id=${funnelId}&autoGen=true`)}
            className="gap-1.5 font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.75)] border-transparent transition-all duration-300"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            Build Pages
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Topbar>

        <div className="flex flex-1 overflow-hidden">
          <FunnelSidebar
            funnelId={funnelId}
            funnelName={funnelName || funnelId}
            collapsible
          />

          {/* Page nav */}
          <div className="w-48 shrink-0 border-r border-border bg-card flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-bold text-foreground truncate">
                {funnelName || "Copy Engine"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {pageList.length > 0
                  ? `${pageList.length} pages`
                  : "Generating…"}
              </p>
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {pageList.map((key) => {
                const page = copy?.pages[key];
                const score = page?.score ?? 0;
                const active = activePage === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActivePage(key)}
                    className={cn(
                      "w-full flex flex-col gap-1.5 px-3 py-2.5 rounded-lg border text-left transition-all group",
                      active
                        ? "bg-muted border-border"
                        : "border-transparent hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          active
                            ? "text-brand-yellow"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      >
                        {PAGE_ICONS[key]}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          active
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      >
                        {FUNNEL_PAGE_LABELS[key]}
                      </span>
                    </div>
                    {score > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              score >= 80
                                ? "bg-foreground"
                                : score >= 65
                                  ? "bg-brand-yellow"
                                  : "bg-destructive",
                            )}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-[10px] font-bold",
                            active
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {score}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main canvas — spatial page preview */}
          <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
            {isInitializing ? (
              <div className="flex-1 flex items-center justify-center">
                <Spinner size="md" color="muted" />
              </div>
            ) : isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Spinner size="lg" />
                <p className="text-sm">Designing your pages…</p>
              </div>
            ) : copy && activePage && activePageSpec ? (
              <div className="flex-1 overflow-y-auto">
                {/* Editor container */}
                <div className="flex-1 bg-background h-full overflow-hidden">
                  <DocEditor
                    html={activePageSpec.html || ""}
                    onChange={handleUpdateDoc}
                    onRegenerate={handleRegenerateSection}
                    isRegenerating={isRegeneratingSection}
                  />
                </div>
              </div>
            ) : copy && pageList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <FileText className="w-8 h-8 opacity-40" />
                <p className="text-sm">
                  No pages were generated. Try regenerating.
                </p>
                <Button size="sm" onClick={generateCopy} className="gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </Button>
              </div>
            ) : !copy ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <FileText className="w-8 h-8 opacity-40" />
                <p className="text-sm">
                  {intelligenceComplete
                    ? "No copy yet."
                    : "Complete intelligence analysis first."}
                </p>
                {intelligenceComplete && (
                  <Button size="sm" onClick={generateCopy} className="gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Generate Pages
                  </Button>
                )}
                {!intelligenceComplete && (
                  <Button
                    size="sm"
                    onClick={() => router.push(`/intelligence/${funnelId}`)}
                    className="gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5" /> Go to Intelligence
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* OfferIQ Agent for copy editing */}
      {copy && activePage && (
        <OfferIQAgent
          ability="copy"
          funnelId={funnelId}
          funnelName={funnelName}
          copy={copy}
          activeCopyPage={activePage}
          onUpdateCopyPage={handleUpdateCopyPage}
        />
      )}

      <GenerationOverlay visible={isGenerating} step={genStep} />
    </div>
  );
}
