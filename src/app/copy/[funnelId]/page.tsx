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
  Timer,
  Users,
  Star,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type {
  CopyOutput,
  PageSpec,
  PageSection,
  PageElement,
  FunnelPageKey,
  PageElementType,
} from "@/lib/offer-types";
import { FUNNEL_PAGE_LABELS } from "@/lib/offer-types";
import { parseCopyOutput } from "@/lib/offer-parser";
import { toast } from "sonner";
import { FunnelSidebar } from "@/components/layout/FunnelSidebar";

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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function TrendDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" {...props}>
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

function GenerationOverlay({ visible, step }: { visible: boolean; step: number }) {
  if (!visible) return null;
  const pct = Math.min(100, Math.round((step / GEN_STEPS.length) * 100));
  const label = step >= GEN_STEPS.length ? "Finalizing…" : GEN_STEPS[Math.min(step, GEN_STEPS.length - 1)];
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center">
      <div className="w-full max-w-sm mx-auto px-6 text-center flex flex-col items-center">
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          <Spinner size="xl" className="absolute inset-0 h-full w-full border-4" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{pct}%</div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Designing Your Pages</h2>
        <div className="h-6 overflow-hidden">
          <p className="text-sm font-medium text-muted-foreground animate-pulse">{label}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  const color = score >= 80 ? "hsl(var(--foreground))" : score >= 65 ? "hsl(var(--brand-yellow))" : "hsl(var(--destructive))";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }} />
    </svg>
  );
}

// ─── Spacing map ──────────────────────────────────────────────────────────────

const SPACING: Record<string, string> = {
  none: "0px",
  xs: "12px",
  sm: "24px",
  md: "40px",
  lg: "64px",
  xl: "96px",
  "2xl": "128px",
};

// ─── Inline editable text ─────────────────────────────────────────────────────

function EditableText({
  value,
  onChange,
  className,
  as: Tag = "p",
  placeholder = "Click to edit…",
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  as?: "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "a" | "li";
  placeholder?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);

  const handleBlur = () => {
    setEditing(false);
    const text = ref.current?.innerText ?? "";
    if (text !== value) onChange(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (ref.current) ref.current.innerText = value;
      setEditing(false);
    }
  };

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setEditing(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        "outline-none cursor-text transition-all",
        editing
          ? "ring-2 ring-primary/40 ring-offset-2 rounded-sm bg-primary/5"
          : "hover:ring-1 hover:ring-border hover:ring-offset-1 hover:rounded-sm",
        !value && "text-muted-foreground/40 italic",
        className
      )}
      data-placeholder={!value ? placeholder : undefined}
    >
      {value}
    </Tag>
  );
}

// ─── Placeholder block ────────────────────────────────────────────────────────

function PlaceholderBlock({
  icon: Icon,
  label,
  aspect = "16:9",
  className,
}: {
  icon: React.ElementType;
  label: string;
  aspect?: string;
  className?: string;
}) {
  const aspectClass =
    aspect === "16:9" ? "aspect-video" :
      aspect === "9:16" ? "aspect-[9/16]" :
        aspect === "1:1" ? "aspect-square" :
          aspect === "4:3" ? "aspect-[4/3]" : "aspect-video";

  return (
    <div className={cn(
      "w-full rounded-xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-3 text-muted-foreground",
      aspectClass,
      className
    )}>
      <Icon className="w-8 h-8 opacity-30" />
      <span className="text-xs font-medium opacity-50">{label}</span>
    </div>
  );
}

// ─── Element renderer ─────────────────────────────────────────────────────────

function ElementRenderer({
  element,
  onUpdate,
}: {
  element: PageElement;
  onUpdate: (patch: Partial<PageElement>) => void;
}) {
  const align = element.align ?? "left";
  const alignClass =
    align === "center" ? "text-center items-center" :
      align === "right" ? "text-right items-end" : "text-left items-start";

  switch (element.type as PageElementType) {

    case "nav_logo":
      return (
        <div className={cn("flex", alignClass)}>
          <EditableText
            value={element.copy ?? ""}
            onChange={(v) => onUpdate({ copy: v })}
            className="text-lg font-bold text-foreground"
            as="span"
            placeholder="Logo / Brand name"
          />
        </div>
      );

    case "nav_links":
      return (
        <div className={cn("flex gap-6", alignClass)}>
          {(element.items ?? ["Home", "About", "Contact"]).map((item, i) => (
            <span key={i} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              {item}
            </span>
          ))}
        </div>
      );

    case "headline": {
      const sizeClass =
        element.size === "xl" ? "text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight" :
          element.size === "lg" ? "text-3xl md:text-4xl font-extrabold leading-tight" :
            element.size === "md" ? "text-2xl md:text-3xl font-bold leading-snug" :
              "text-xl md:text-2xl font-bold";
      return (
        <div className={cn("flex flex-col w-full", alignClass)}>
          <EditableText
            value={element.copy ?? ""}
            onChange={(v) => onUpdate({ copy: v })}
            className={cn(sizeClass, "text-foreground")}
            as="h1"
            placeholder="Your headline here"
          />
        </div>
      );
    }

    case "subheadline": {
      const sizeClass =
        element.size === "lg" ? "text-xl md:text-2xl font-semibold" :
          element.size === "sm" ? "text-base font-medium" :
            "text-lg md:text-xl font-semibold";
      return (
        <div className={cn("flex flex-col w-full", alignClass)}>
          <EditableText
            value={element.copy ?? ""}
            onChange={(v) => onUpdate({ copy: v })}
            className={cn(sizeClass, "text-muted-foreground leading-relaxed")}
            as="h2"
            placeholder="Supporting text here"
          />
        </div>
      );
    }

    case "body_text":
      return (
        <div className={cn("flex flex-col w-full", alignClass)}>
          <EditableText
            value={element.copy ?? ""}
            onChange={(v) => onUpdate({ copy: v })}
            className="text-base text-muted-foreground leading-relaxed max-w-prose"
            as="p"
            placeholder="Body text here"
          />
        </div>
      );

    case "bullet_list":
      return (
        <div className={cn("flex flex-col gap-2 w-full", alignClass)}>
          {(element.items ?? []).map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
              <span className="text-sm text-foreground leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      );

    case "icon_list":
      return (
        <div className={cn("flex flex-col gap-3 w-full", alignClass)}>
          {(element.items ?? []).map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-foreground/10 border border-border flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-foreground" />
              </span>
              <span className="text-sm text-foreground leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      );

    case "cta_button":
      return (
        <div className={cn("flex flex-col gap-1.5 w-full", alignClass)}>
          <div className={cn(
            "inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-base cursor-pointer select-none transition-all",
            element.variant === "secondary"
              ? "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80"
              : element.variant === "ghost"
                ? "text-foreground underline hover:no-underline"
                : "bg-foreground text-background hover:opacity-90"
          )}>
            <EditableText
              value={element.copy ?? ""}
              onChange={(v) => onUpdate({ copy: v })}
              className="text-inherit font-inherit"
              as="span"
              placeholder="Button label"
            />
          </div>
          {element.secondary_copy && (
            <EditableText
              value={element.secondary_copy}
              onChange={(v) => onUpdate({ secondary_copy: v })}
              className="text-xs text-muted-foreground"
              as="span"
              placeholder="Micro-copy beneath button"
            />
          )}
        </div>
      );

    case "video_placeholder":
      return (
        <PlaceholderBlock
          icon={Play}
          label={element.placeholder_label ?? "Video goes here"}
          aspect={element.placeholder_aspect ?? "16:9"}
        />
      );

    case "image_placeholder":
      return (
        <PlaceholderBlock
          icon={ImageIcon}
          label={element.placeholder_label ?? "Image goes here"}
          aspect={element.placeholder_aspect ?? "16:9"}
          className="min-h-[200px]"
        />
      );

    case "countdown_timer":
      return (
        <div className={cn("flex flex-col gap-2 w-full", alignClass)}>
          {element.copy && (
            <EditableText
              value={element.copy}
              onChange={(v) => onUpdate({ copy: v })}
              className="text-sm font-semibold text-muted-foreground uppercase tracking-wider"
              as="p"
              placeholder="Offer expires in:"
            />
          )}
          <div className="flex items-center gap-2">
            {["00", "23", "59", "47"].map((val, i, arr) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-14 h-14 rounded-lg bg-muted border border-border flex items-center justify-center text-xl font-black text-foreground font-mono">
                    {val}
                  </div>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                    {["Days", "Hrs", "Min", "Sec"][i]}
                  </span>
                </div>
                {i < arr.length - 1 && <span className="text-xl font-bold text-muted-foreground mb-4">:</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      );

    case "social_proof_bar":
      return (
        <div className={cn("flex items-center gap-3 py-2 px-4 rounded-full bg-muted/40 border border-border w-fit", alignClass.includes("center") ? "mx-auto" : "")}>
          <Users className="w-4 h-4 text-muted-foreground shrink-0" />
          <EditableText
            value={element.copy ?? ""}
            onChange={(v) => onUpdate({ copy: v })}
            className="text-sm font-medium text-foreground"
            as="span"
            placeholder="Social proof text here"
          />
        </div>
      );

    case "avatar_stack":
      return (
        <div className={cn("flex items-center gap-3", alignClass.includes("center") ? "justify-center" : "")}>
          <div className="flex -space-x-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-[10px] font-bold text-muted-foreground">{String.fromCharCode(65 + i)}</span>
              </div>
            ))}
          </div>
          <EditableText
            value={element.copy ?? ""}
            onChange={(v) => onUpdate({ copy: v })}
            className="text-sm font-medium text-foreground"
            as="span"
            placeholder="Join 12,400+ people…"
          />
        </div>
      );

    case "testimonial_card":
      return (
        <div className="rounded-xl border border-border bg-muted/20 p-5 flex flex-col gap-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-foreground text-foreground" />)}
          </div>
          <EditableText
            value={element.copy ?? ""}
            onChange={(v) => onUpdate({ copy: v })}
            className="text-sm text-foreground leading-relaxed italic"
            as="p"
            placeholder="The testimonial quote goes here"
          />
          <EditableText
            value={element.secondary_copy ?? ""}
            onChange={(v) => onUpdate({ secondary_copy: v })}
            className="text-xs font-semibold text-muted-foreground"
            as="span"
            placeholder="Name — Role or situation"
          />
        </div>
      );

    case "testimonial_grid":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {(element.items ?? []).map((item, i) => {
            const [quote, attribution] = item.split(" — ");
            return (
              <div key={i} className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col gap-2">
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-foreground text-foreground" />)}
                </div>
                <p className="text-sm text-foreground leading-relaxed italic">{quote}</p>
                {attribution && <span className="text-xs font-semibold text-muted-foreground">{attribution}</span>}
              </div>
            );
          })}
        </div>
      );

    case "price_block":
      return (
        <div className={cn("flex flex-col gap-2 w-full", alignClass)}>
          <div className="flex items-baseline gap-2">
            <EditableText
              value={element.copy ?? ""}
              onChange={(v) => onUpdate({ copy: v })}
              className="text-5xl font-black text-foreground"
              as="span"
              placeholder="$97"
            />
          </div>
          {element.secondary_copy && (
            <EditableText
              value={element.secondary_copy}
              onChange={(v) => onUpdate({ secondary_copy: v })}
              className="text-sm text-muted-foreground leading-relaxed"
              as="p"
              placeholder="Anchoring / framing text"
            />
          )}
        </div>
      );

    case "guarantee_badge":
      return (
        <div className="flex items-start gap-4 p-5 rounded-xl border border-border bg-muted/10">
          <div className="w-12 h-12 rounded-full bg-foreground/5 border border-border flex items-center justify-center shrink-0 text-lg">
            🛡️
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-foreground">Guarantee</span>
            <EditableText
              value={element.copy ?? ""}
              onChange={(v) => onUpdate({ copy: v })}
              className="text-sm text-muted-foreground leading-relaxed"
              as="p"
              placeholder="Your guarantee statement here"
            />
          </div>
        </div>
      );

    case "form_input":
      return (
        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
          <input
            type="email"
            placeholder={element.copy ?? "Enter your email"}
            className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            readOnly
          />
        </div>
      );

    case "divider":
      return <hr className="w-full border-border" />;

    case "step_indicator":
      return (
        <div className="flex flex-col sm:flex-row gap-6 w-full">
          {(element.items ?? []).map((step, i) => (
            <div key={i} className="flex items-start gap-3 flex-1">
              <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
          Unknown element: {element.type}
        </div>
      );
  }
}

// ─── Section renderer ─────────────────────────────────────────────────────────

function SectionRenderer({
  section,
  onUpdateElement,
}: {
  section: PageSection;
  onUpdateElement: (elementId: string, patch: Partial<PageElement>) => void;
}) {
  const pt = SPACING[section.padding_top] ?? "40px";
  const pb = SPACING[section.padding_bottom] ?? "40px";

  const bgClass =
    section.background === "muted" ? "bg-muted/30" :
      section.background === "dark" ? "bg-foreground text-background" :
        section.background === "brand" ? "bg-brand/10" :
          "bg-background";

  // Layout determines how elements are arranged
  const isGrid = section.layout === "two_column" || section.layout === "three_column";
  const isSplit = section.layout === "split_left" || section.layout === "split_right";
  const isCentered = section.layout === "centered";

  const gridClass =
    section.layout === "three_column" ? "grid-cols-1 md:grid-cols-3" :
      "grid-cols-1 md:grid-cols-2";

  return (
    <div
      className={cn("w-full relative group/section", bgClass)}
      style={{ paddingTop: pt, paddingBottom: pb }}
    >
      {/* Section label badge — visible on hover */}
      <div className="absolute top-2 left-2 opacity-0 group-hover/section:opacity-100 transition-opacity z-10">
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
          {section.label}
        </span>
      </div>

      <div className={cn(
        "mx-auto w-full",
        isCentered ? "max-w-2xl px-6 flex flex-col items-center gap-6" :
          isGrid ? "max-w-6xl px-6 grid gap-6" + " " + gridClass :
            isSplit ? "max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center" :
              "max-w-4xl px-6 flex flex-col gap-6"
      )}>
        {section.layout === "split_right"
          ? [...section.elements].reverse().map((el) => (
            <ElementRenderer
              key={el.id}
              element={el}
              onUpdate={(patch) => onUpdateElement(el.id, patch)}
            />
          ))
          : section.elements.map((el) => (
            <ElementRenderer
              key={el.id}
              element={el}
              onUpdate={(patch) => onUpdateElement(el.id, patch)}
            />
          ))
        }
      </div>
    </div>
  );
}

// ─── Page preview renderer ────────────────────────────────────────────────────

function PagePreview({
  pageSpec,
  onUpdateElement,
}: {
  pageSpec: PageSpec;
  onUpdateElement: (sectionId: string, elementId: string, patch: Partial<PageElement>) => void;
}) {
  return (
    <div className="w-full flex flex-col divide-y divide-border">
      {pageSpec.sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          onUpdateElement={(elementId, patch) => onUpdateElement(section.id, elementId, patch)}
        />
      ))}
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

  // ── Element update handler ──────────────────────────────────────────────────

  const handleUpdateElement = useCallback(
    (sectionId: string, elementId: string, patch: Partial<PageElement>) => {
      if (!copy || !activePage) return;
      setCopy((prev) => {
        if (!prev) return prev;
        const page = prev.pages[activePage];
        if (!page) return prev;

        const newSections = page.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;
          return {
            ...sec,
            elements: sec.elements.map((el) =>
              el.id === elementId ? { ...el, ...patch } : el
            ),
          };
        });

        return {
          ...prev,
          pages: {
            ...prev.pages,
            [activePage]: { ...page, sections: newSections },
          },
        };
      });
      setHasUnsavedChanges(true);
    },
    [copy, activePage]
  );

  // ── Derived ─────────────────────────────────────────────────────────────────

  const pageList: FunnelPageKey[] = copy?.declaration?.pages ?? [];

  const overallScore = copy
    ? Math.round(
      pageList.reduce((a, k) => a + (copy.pages[k]?.score ?? 0), 0) /
      Math.max(pageList.length, 1)
    )
    : 0;

  const activePageSpec = activePage ? copy?.pages[activePage] ?? null : null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
                "gap-1.5 text-xs transition-all",
                hasUnsavedChanges
                  ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 animate-pulse"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isSaving ? <Spinner size="sm" /> : hasUnsavedChanges ? <Save className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
              {hasUnsavedChanges ? "Save" : "Saved"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={generateCopy}
            disabled={isGenerating}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin")} />
            Regenerate
          </Button>

          <Button
            size="sm"
            onClick={() => router.push(`/builder?id=${funnelId}&autoGen=true`)}
            className="gap-1.5 font-semibold"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            Build Pages
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Topbar>

        <div className="flex flex-1 overflow-hidden">
          <FunnelSidebar funnelId={funnelId} funnelName={funnelName || funnelId} collapsible />

          {/* Page nav */}
          <div className="w-48 shrink-0 border-r border-border bg-card flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-bold text-foreground truncate">{funnelName || "Copy Engine"}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {pageList.length > 0 ? `${pageList.length} pages` : "Generating…"}
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
                      active ? "bg-muted border-border" : "border-transparent hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn(active ? "text-brand-yellow" : "text-muted-foreground group-hover:text-foreground")}>
                        {PAGE_ICONS[key]}
                      </span>
                      <span className={cn("text-xs font-semibold", active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                        {FUNNEL_PAGE_LABELS[key]}
                      </span>
                    </div>
                    {score > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              score >= 80 ? "bg-foreground" : score >= 65 ? "bg-brand-yellow" : "bg-destructive"
                            )}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className={cn("text-[10px] font-bold", active ? "text-foreground" : "text-muted-foreground")}>
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
          <div className="flex-1 flex flex-col overflow-hidden bg-muted/10">
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
                {/* Page chrome */}
                <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur-sm border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{FUNNEL_PAGE_LABELS[activePage]}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {activePageSpec.sections.length} sections · {activePageSpec.word_count} words
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Score:</span>
                    <span className="text-[10px] font-bold text-foreground">{activePageSpec.score}/100</span>
                    <span className="text-[10px] text-muted-foreground ml-2">Click any text to edit</span>
                  </div>
                </div>

                {/* Simulated browser frame */}
                <div className="max-w-4xl mx-auto my-6 rounded-xl border border-border shadow-sm overflow-hidden bg-background">
                  {/* Fake browser bar */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-border" />
                      <div className="w-3 h-3 rounded-full bg-border" />
                      <div className="w-3 h-3 rounded-full bg-border" />
                    </div>
                    <div className="flex-1 mx-3 px-3 py-1 rounded-md bg-background border border-border text-[10px] text-muted-foreground truncate">
                      yoursite.com/{activePage.replace("_", "-")}
                    </div>
                  </div>

                  {/* Actual page spec rendered */}
                  <PagePreview
                    pageSpec={activePageSpec}
                    onUpdateElement={handleUpdateElement}
                  />
                </div>
              </div>
            ) : copy && pageList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <FileText className="w-8 h-8 opacity-40" />
                <p className="text-sm">No pages were generated. Try regenerating.</p>
                <Button size="sm" onClick={generateCopy} className="gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </Button>
              </div>
            ) : !copy ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <FileText className="w-8 h-8 opacity-40" />
                <p className="text-sm">
                  {intelligenceComplete ? "No copy yet." : "Complete intelligence analysis first."}
                </p>
                {intelligenceComplete && (
                  <Button size="sm" onClick={generateCopy} className="gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Generate Pages
                  </Button>
                )}
                {!intelligenceComplete && (
                  <Button size="sm" onClick={() => router.push(`/intelligence/${funnelId}`)} className="gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5" /> Go to Intelligence
                  </Button>
                )}
              </div>
            ) : null}
          </div>

          {/* Right panel */}
          <div className="w-48 shrink-0 border-l border-border bg-card overflow-y-auto hidden xl:block">
            <div className="p-4 space-y-4">
              {overallScore > 0 && (
                <div className="bg-muted/30 border border-border rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Overall Score</p>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <ScoreRing score={overallScore} size={48} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-foreground">{overallScore}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-foreground">
                        {overallScore >= 80 ? "Strong" : overallScore >= 65 ? "Good" : "Needs Work"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Avg across pages</div>
                    </div>
                  </div>
                </div>
              )}

              {copy && pageList.length > 0 && (
                <div className="bg-muted/30 border border-border rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Page Scores</p>
                  <div className="space-y-2">
                    {pageList.map((key) => {
                      const score = copy.pages[key]?.score ?? 0;
                      return (
                        <button
                          key={key}
                          onClick={() => setActivePage(key)}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors text-xs",
                            activePage === key
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <span>{FUNNEL_PAGE_LABELS[key]}</span>
                          <span className="font-bold">{score || "—"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {copy && activePage && activePageSpec && (
                <div className="bg-muted/30 border border-border rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Active Page</p>
                  <p className="text-lg font-bold text-foreground">{activePageSpec.sections.length}</p>
                  <p className="text-[11px] text-muted-foreground">sections</p>
                  <p className="text-lg font-bold text-foreground mt-3">{activePageSpec.word_count}</p>
                  <p className="text-[11px] text-muted-foreground">words</p>
                </div>
              )}

              {copy?.declaration?.rationale && (
                <div className="bg-muted/30 border border-border rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Funnel Logic</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{copy.declaration.rationale}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <GenerationOverlay visible={isGenerating} step={genStep} />
    </div>
  );
}