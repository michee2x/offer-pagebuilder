"use client";

import React, { useState, useEffect, useCallback, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import {
  Mail,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Clock,
  Send,
  FileText,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  Eye,
  Code2,
  Type,
  ClipboardList,
  Monitor,
  Tablet,
  Smartphone,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  EmailCopy,
  FunnelEmailSequence,
  FunnelPageKey,
} from "@/lib/offer-types";
import { FUNNEL_PAGE_LABELS } from "@/lib/offer-types";
import { FunnelSidebar } from "@/components/layout/FunnelSidebar";
import { useCompletion } from "@ai-sdk/react";
import { OfferIQAgent } from "@/components/OfferIQAgent";
import {
  parseEmailSequenceV2,
  migrateFlatEmailSequence,
  clampEmailSequence,
} from "@/lib/offer-parser";
import {
  extractEmailSections,
  wrapPlainTextAsHtml,
  updateEmailHtml,
} from "@/lib/email-html-extractor";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_ICONS: Record<FunnelPageKey, LucideIcon> = {
  lead_capture: Mail,
  sales_page: ShoppingCart,
  upsell: ArrowUpRight,
  downsell: ArrowDownRight,
  thankyou: Heart,
};

const PAGE_ORDER: FunnelPageKey[] = [
  "lead_capture",
  "sales_page",
  "upsell",
  "downsell",
  "thankyou",
];

type CenterMode = "preview" | "copy";
type CopySubMode = "html" | "text";

// ─── Helper: get HTML for an email (handles legacy plain-text) ────────────────

function getEmailHtml(email: EmailCopy): string {
  if (email.html) return email.html;
  // Legacy fallback: wrap plain text in an HTML email template
  return wrapPlainTextAsHtml(
    email.subject,
    email.preview,
    email.body,
    email.cta,
  );
}

// ─── Helper: parse a single email from the regeneration API response ──────────

function parseEmailFromResponse(
  raw: string,
  dayFallback: number,
  pageKey: FunnelPageKey,
): EmailCopy | null {
  const subject = raw.match(/SUBJECT:\s*(.+)/i)?.[1]?.trim() ?? "";
  const preview = raw.match(/PREVIEW:\s*(.+)/i)?.[1]?.trim() ?? "";

  const htmlMatch = raw.match(/HTML:\s*([\s\S]*?<html[\s\S]*?<\/html>)/i);
  const html = htmlMatch?.[1]?.trim() ?? "";
  let body = "";
  let cta = "";

  if (html) {
    // Extract body text from HTML for text copy mode
    const bodyContent =
      html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
    let text = bodyContent.replace(
      /<div[^>]*display:\s*none[^>]*>[\s\S]*?<\/div>/gi,
      "",
    );
    text = text.replace(
      /<tr>\s*<td[^>]*border-top[^>]*>[\s\S]*?<\/td>\s*<\/tr>/gi,
      "",
    );
    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<\/p>/gi, "\n\n");
    text = text.replace(
      /<a\b[^>]*style="[^"]*background-color[^"]*"[^>]*>[\s\S]*?<\/a>/gi,
      "",
    );
    text = text.replace(/<[^>]+>/g, "");
    text = text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
    body = text.replace(/\n{3,}/g, "\n\n").trim();
    // Extract CTA
    const ctaMatch = html.match(
      /<a\b[^>]*style="[^"]*background-color[^"]*"[^>]*>([\s\S]*?)<\/a>/i,
    );
    cta = ctaMatch?.[1]?.replace(/<[^>]+>/g, "").trim() ?? "";
  }

  if (!subject && !html) return null;

  // Extract day from the response or fall back
  const dayMatch = raw.match(/EMAIL\s+\d+\s*(?:—|–|-)\s*DAY\s+(\d+)/i);
  const day = dayMatch ? parseInt(dayMatch[1], 10) : dayFallback;

  return {
    day,
    subject,
    preview,
    body,
    html: html || undefined,
    page: pageKey,
    cta: cta || undefined,
  };
}

// ─── Generation overlay ───────────────────────────────────────────────────────

function GenerationOverlay({
  visible,
  streamText,
}: {
  visible: boolean;
  streamText?: string;
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center h-[80vh]">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-8 h-8">
            <svg
              className="animate-spin w-full h-full text-foreground/80"
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
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Generating Email Sequences…
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Building per-page email sequences across your entire funnel
        </p>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  onGenerate,
  generating,
}: {
  onGenerate: () => void;
  generating: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 bg-transparent">
      <div className="w-16 h-16 rounded-2xl bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center mb-6">
        <Mail className="w-7 h-7 text-brand-blue" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">
        Ready to convert your leads into buyers?
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
        OfferIQ writes your complete email sequences from your offer's
        intelligence report. Every email matches the right moment in your
        buyer's journey.
      </p>
      <Button
        size="lg"
        onClick={onGenerate}
        disabled={generating}
        className="gap-2 font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.75)] transition-all border-0 duration-300"
      >
        {generating ? (
          <Spinner size="sm" color="white" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        Build My Email Sequences →
      </Button>
    </div>
  );
}

// ─── Left panel: Page-segmented email navigator ──────────────────────────────

function EmailNavigator({
  emailSequence,
  activePage,
  activeEmailIndex,
  onSelect,
}: {
  emailSequence: FunnelEmailSequence;
  activePage: FunnelPageKey | null;
  activeEmailIndex: number;
  onSelect: (page: FunnelPageKey, index: number) => void;
}) {
  const [expandedPages, setExpandedPages] = useState<Set<FunnelPageKey>>(
    new Set(Object.keys(emailSequence) as FunnelPageKey[]),
  );

  const togglePage = (page: FunnelPageKey) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const orderedPages = PAGE_ORDER.filter(
    (k) => emailSequence[k] && emailSequence[k]!.length > 0,
  );

  return (
    <div className="flex-1 overflow-y-auto py-2 px-2">
      {orderedPages.map((pageKey, pageIdx) => {
        const emails = emailSequence[pageKey] ?? [];
        const Icon = PAGE_ICONS[pageKey];
        const isExpanded = expandedPages.has(pageKey);
        const isActivePage = activePage === pageKey;

        return (
          <div key={pageKey} className="mb-1">
            {/* Page section header */}
            <button
              onClick={() => togglePage(pageKey)}
              className={`w-full text-left rounded-xl px-3 py-2.5 flex items-center gap-2.5 transition-all duration-300 group ${
                isActivePage
                  ? "bg-gradient-to-r from-brand-blue to-brand-indigo text-white shadow-lg shadow-indigo-500/25"
                  : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                  isActivePage
                    ? "text-white drop-shadow-sm"
                    : "bg-white/5 text-muted-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate">
                  {FUNNEL_PAGE_LABELS[pageKey]}
                </p>
                <p className="text-[9px] opacity-60">{emails.length} emails</p>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 flex-shrink-0 opacity-50" />
              ) : (
                <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-50" />
              )}
            </button>

            {/* Email list within page */}
            {isExpanded && (
              <div className="ml-3 pl-3 border-l border-border/50 mt-1 mb-2 space-y-0.5">
                {emails.map((email, emailIdx) => {
                  const isActive =
                    activePage === pageKey && activeEmailIndex === emailIdx;
                  return (
                    <button
                      key={emailIdx}
                      onClick={() => onSelect(pageKey, emailIdx)}
                      className={`w-full text-left rounded-lg px-2.5 py-2 transition-all duration-300 ${
                        isActive
                          ? "bg-white/5 border border-white/10 text-foreground"
                          : "border border-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded text-[10px] font-black flex items-center justify-center flex-shrink-0 transition-colors ${
                            isActive
                              ? "bg-brand-blue text-white"
                              : "bg-white/5 text-muted-foreground"
                          }`}
                        >
                          {emailIdx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold truncate leading-tight">
                            {email.subject || "Untitled"}
                          </p>
                          <p className="text-[9px] opacity-50 mt-0.5">
                            Day {email.day}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Progression arrow between page sections */}
            {pageIdx < orderedPages.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="w-px h-3 bg-border/60" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Mode toggle (Preview / Copy) ─────────────────────────────────────────────

function ModeToggle({
  mode,
  onChange,
}: {
  mode: CenterMode;
  onChange: (m: CenterMode) => void;
}) {
  return (
    <div className="flex items-center bg-muted/50 border border-border rounded-lg p-0.5">
      <button
        onClick={() => onChange("preview")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          mode === "preview"
            ? "bg-background text-foreground shadow-sm border border-border"
            : "text-muted-foreground hover:text-foreground border border-transparent"
        }`}
      >
        <Eye className="w-3 h-3" />
        Preview
      </button>
      <button
        onClick={() => onChange("copy")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          mode === "copy"
            ? "bg-background text-foreground shadow-sm border border-border"
            : "text-muted-foreground hover:text-foreground border border-transparent"
        }`}
      >
        <ClipboardList className="w-3 h-3" />
        Copy
      </button>
    </div>
  );
}

// ─── Copy sub-mode toggle (HTML / Text) ───────────────────────────────────────

function CopySubToggle({
  subMode,
  onChange,
}: {
  subMode: CopySubMode;
  onChange: (m: CopySubMode) => void;
}) {
  return (
    <div className="flex items-center bg-[#1a2035] border border-white/10 rounded-lg p-0.5">
      <button
        onClick={() => onChange("html")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          subMode === "html"
            ? "bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30"
            : "text-muted-foreground hover:text-foreground border border-transparent"
        }`}
      >
        <Code2 className="w-3 h-3" />
        HTML Code
      </button>
      <button
        onClick={() => onChange("text")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          subMode === "text"
            ? "bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30"
            : "text-muted-foreground hover:text-foreground border border-transparent"
        }`}
      >
        <Type className="w-3 h-3" />
        Text Fields
      </button>
    </div>
  );
}

// ─── Copyable field component ─────────────────────────────────────────────────

function CopyableField({
  label,
  value,
  multiline = false,
  onChange,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  onChange?: (val: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(`${label} copied!`);
  };

  if (value === undefined || value === null) return null;

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all opacity-0 group-hover:opacity-100 hover:bg-white/5 text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={Math.min(Math.max(value.split("\n").length, 4), 16)}
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-sm text-white/90 leading-relaxed outline-none resize-none cursor-text focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue/60 hover:bg-white/[0.04] transition-all"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-10 px-4 rounded-xl border border-white/10 bg-white/[0.02] text-sm font-semibold text-white outline-none cursor-text focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue/60 hover:bg-white/[0.04] transition-all"
        />
      )}
    </div>
  );
}

// ─── Center panel: HTML Preview (iframe) ──────────────────────────────────────

function EmailHtmlPreview({
  email,
  pageKey,
  emailIndex,
  totalInPage,
  isRegenerating,
  onRegenerate,
}: {
  email: EmailCopy;
  pageKey: FunnelPageKey;
  emailIndex: number;
  totalInPage: number;
  isRegenerating: boolean;
  onRegenerate: () => void;
}) {
  const html = getEmailHtml(email);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );

  const responsiveHtml = useMemo(() => {
    if (!html) return html;

    // Inject a responsive style block and viewport tag
    const responsiveStyles = `
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        /* Force responsiveness of email preview inside iframe */
        table {
          width: 100% !important;
          max-width: 600px !important;
        }
        /* Target specifically tables with width attribute = 600 */
        table[width="600"] {
          width: 100% !important;
          max-width: 600px !important;
        }
        /* Ensure images scale correctly */
        img {
          max-width: 100% !important;
          height: auto !important;
        }
        /* Mobile-friendly padding and typography */
        @media only screen and (max-width: 480px) {
          td {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .email-padding {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          h1, .email-heading {
            font-size: 18px !important;
          }
        }
      </style>
    `;

    // Try to inject into the head or prepend
    if (html.includes("</head>")) {
      return html.replace("</head>", `${responsiveStyles}</head>`);
    } else if (html.includes("<body>")) {
      return html.replace("<body>", `<body>${responsiveStyles}`);
    }
    return responsiveStyles + html;
  }, [html]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Inbox preview row */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
            How it looks in the inbox
          </p>
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden">
            <div className="px-5 py-4 flex items-start gap-4 cursor-default">
              <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-black">Y</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-foreground">
                    Your Name
                  </span>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">
                    Day {email.day}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                  {email.subject || "No subject"}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {email.preview ||
                    email.body?.substring(0, 100) ||
                    "No preview text"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Real HTML email render */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Rendered email
            </p>
            <div className="flex items-center gap-3">
              {/* Per-email Regenerate button */}
              <button
                type="button"
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="h-8 px-3 rounded-xl bg-[#131826]/80 hover:bg-[#1f2942]/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegenerating ? (
                  <Spinner size="xs" color="white" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {isRegenerating ? "Regenerating…" : "Regenerate"}
              </button>

              {/* Screens Switcher */}
              <div className="flex items-center bg-[#131826]/80 backdrop-blur-md border border-white/10 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  title="Desktop"
                  onClick={() => setDeviceMode("desktop")}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${deviceMode === "desktop" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Tablet"
                  onClick={() => setDeviceMode("tablet")}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${deviceMode === "tablet" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                >
                  <Tablet className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Mobile"
                  onClick={() => setDeviceMode("mobile")}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${deviceMode === "mobile" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div
            className={cn(
              "relative mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-300",
              deviceMode === "desktop"
                ? "w-full"
                : deviceMode === "tablet"
                  ? "max-w-[600px] w-full"
                  : "max-w-[375px] w-full",
            )}
          >
            <iframe
              srcDoc={responsiveHtml}
              sandbox="allow-same-origin"
              title={`Email preview: ${email.subject}`}
              className="w-full bg-white border-0"
              style={{ minHeight: "600px", height: "100%" }}
              onLoad={(e) => {
                // Auto-resize iframe to content height
                const iframe = e.target as HTMLIFrameElement;
                try {
                  const contentHeight =
                    iframe.contentDocument?.documentElement?.scrollHeight;
                  if (contentHeight) {
                    iframe.style.height = `${contentHeight + 20}px`;
                  }
                } catch {
                  // Silently fail if cross-origin issues
                }
              }}
            />

            {/* Blue regeneration loader overlay */}
            {isRegenerating && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Spinner size="md" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      Regenerating email…
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Creating a fresh version with a new angle
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 pb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground">
              Day {email.day}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <FileText className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground">
              {FUNNEL_PAGE_LABELS[pageKey]} · Email {emailIndex + 1} of{" "}
              {totalInPage}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Center panel: Copy mode (HTML code / Text fields) ────────────────────────

function EmailCopyPanel({
  email,
  pageKey,
  emailIndex,
  totalInPage,
  onUpdateEmail,
}: {
  email: EmailCopy;
  pageKey: FunnelPageKey;
  emailIndex: number;
  totalInPage: number;
  onUpdateEmail: (updated: EmailCopy) => void;
}) {
  const [subMode, setSubMode] = useState<CopySubMode>("html");
  const [copiedAll, setCopiedAll] = useState(false);

  const html = getEmailHtml(email);

  // Extract text sections from the HTML
  const extracted = useMemo(() => {
    if (typeof window === "undefined") return null;
    return extractEmailSections(html, email.subject);
  }, [html, email.subject]);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(html);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast.success("HTML code copied!");
  };

  const handleCopyAllText = () => {
    if (!extracted) return;
    navigator.clipboard.writeText(extracted.fullPlainText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast.success("All text copied!");
  };

  const handleFieldChange = (
    field: "subject" | "preview" | "heading" | "body" | "cta",
    newVal: string,
  ) => {
    const currentHtml = email.html || getEmailHtml(email);
    const updatedHtml = updateEmailHtml(currentHtml, field, newVal);

    const updatedEmail: EmailCopy = {
      ...email,
      html: updatedHtml,
      [field === "preview" ? "preview" : field]: newVal,
    };

    onUpdateEmail(updatedEmail);
  };

  const handleHtmlChange = (newHtml: string) => {
    const parsed = extractEmailSections(newHtml, email.subject);
    const updatedEmail: EmailCopy = {
      ...email,
      html: newHtml,
      subject: parsed.subject,
      preview: parsed.preheader,
      body: parsed.body,
      cta: parsed.cta || email.cta,
    };
    onUpdateEmail(updatedEmail);
  };

  const subjectVal = extracted?.subject ?? email.subject ?? "";
  const previewVal = extracted?.preheader ?? email.preview ?? "";
  const headingVal = extracted?.heading ?? "";
  const bodyVal = extracted?.body ?? email.body ?? "";
  const ctaVal = extracted?.cta ?? email.cta ?? "";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
        {/* Sub-mode toggle */}
        <div className="flex items-center justify-between">
          <CopySubToggle subMode={subMode} onChange={setSubMode} />
          <Button
            size="sm"
            variant="outline"
            className="gap-2 border-white/10 hover:bg-white/5 bg-transparent text-xs"
            onClick={subMode === "html" ? handleCopyHtml : handleCopyAllText}
          >
            {copiedAll ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copiedAll
              ? "Copied!"
              : subMode === "html"
                ? "Copy HTML"
                : "Copy All Text"}
          </Button>
        </div>

        {subMode === "html" ? (
          /* ── HTML Code view ── */
          <div className="relative group">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={handleCopyHtml}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-[10px] font-semibold text-white/70 hover:text-white hover:bg-white/15 transition-all"
              >
                {copiedAll ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copiedAll ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground ml-2">
                  email-{emailIndex + 1}.html (Editable)
                </span>
              </div>
              <textarea
                value={html}
                onChange={(e) => handleHtmlChange(e.target.value)}
                rows={24}
                className="w-full p-5 bg-[#0d1117] text-[13px] font-mono text-emerald-300/90 leading-relaxed custom-scrollbar outline-none resize-none border-0 focus:ring-0 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          /* ── Text Fields view ── */
          <div className="space-y-5">
            <CopyableField
              label="Subject Line"
              value={subjectVal}
              onChange={(val) => handleFieldChange("subject", val)}
            />
            <CopyableField
              label="Preview Text"
              value={previewVal}
              onChange={(val) => handleFieldChange("preview", val)}
            />
            {headingVal !== "" && (
              <CopyableField
                label="Heading"
                value={headingVal}
                onChange={(val) => handleFieldChange("heading", val)}
              />
            )}
            <CopyableField
              label="Email Body"
              value={bodyVal}
              multiline
              onChange={(val) => handleFieldChange("body", val)}
            />
            {ctaVal !== "" && (
              <CopyableField
                label="Call-to-Action"
                value={ctaVal}
                onChange={(val) => handleFieldChange("cta", val)}
              />
            )}

            {/* Copy all as text button */}
            <div className="pt-2 border-t border-white/5">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-white/10 hover:bg-white/5 bg-transparent w-full justify-center"
                onClick={handleCopyAllText}
              >
                {copiedAll ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedAll ? "Copied!" : "Copy All as Plain Text"}
              </Button>
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-3 pb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground">
              Day {email.day}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <FileText className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground">
              {FUNNEL_PAGE_LABELS[pageKey]} · Email {emailIndex + 1} of{" "}
              {totalInPage}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EmailSequencePage({
  params,
}: {
  params: Promise<{ funnelId: string }>;
}) {
  const { funnelId } = use(params);

  const [funnelName, setFunnelName] = useState("Your Funnel");
  const [emailSequence, setEmailSequence] = useState<FunnelEmailSequence>({});
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<FunnelPageKey | null>(null);
  const [activeEmailIndex, setActiveEmailIndex] = useState(0);
  const [centerMode, setCenterMode] = useState<CenterMode>("preview");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "unsaved" | "idle">("idle");
  const [regeneratingEmail, setRegeneratingEmail] = useState<{
    pageKey: FunnelPageKey;
    emailIndex: number;
  } | null>(null);

  const handleUpdateEmail = useCallback(
    (updatedEmail: EmailCopy) => {
      if (!activePage) return;
      setEmailSequence((prev) => {
        const pageEmails = prev[activePage] ?? [];
        const updatedEmails = [...pageEmails];
        updatedEmails[activeEmailIndex] = updatedEmail;
        return {
          ...prev,
          [activePage]: updatedEmails,
        };
      });
      setHasUnsavedChanges(true);
      setAutoSaveStatus("unsaved");
    },
    [activePage, activeEmailIndex],
  );

  const handleAddEmail = useCallback(
    (newEmail: EmailCopy) => {
      if (!activePage) return;
      setEmailSequence((prev) => {
        const pageEmails = prev[activePage] ?? [];
        const updatedEmails = [
          ...pageEmails,
          {
            ...newEmail,
            order: pageEmails.length + 1,
          },
        ];
        const updated = {
          ...prev,
          [activePage]: updatedEmails,
        };

        // Auto-save changes to the DB
        fetch(`/api/offer-data/${funnelId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blocks: { email_sequence_v2: updated } }),
        }).catch(() => {});

        return updated;
      });

      // Set active email to the newly added email
      setTimeout(() => {
        setEmailSequence((latest) => {
          const count = latest[activePage]?.length ?? 0;
          if (count > 0) {
            setActiveEmailIndex(count - 1);
          }
          return latest;
        });
      }, 50);
      toast.success("New email added to sequence!");
    },
    [activePage, funnelId],
  );

  const handleDeleteActiveEmail = useCallback(() => {
    if (!activePage) return;
    const pageEmails = emailSequence[activePage] ?? [];
    if (pageEmails.length <= 1) {
      toast.error("You must keep at least one email in the sequence.");
      return;
    }

    setEmailSequence((prev) => {
      const emails = prev[activePage] ?? [];
      const updatedEmails = emails.filter((_, idx) => idx !== activeEmailIndex);
      // Re-index their orders
      const reindexed = updatedEmails.map((email, idx) => ({
        ...email,
        order: idx + 1,
      }));
      const updated = {
        ...prev,
        [activePage]: reindexed,
      };

      // Auto-save changes to the DB
      fetch(`/api/offer-data/${funnelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: { email_sequence_v2: updated } }),
      }).catch(() => {});

      return updated;
    });

    // Clamp the active index so it stays in bounds
    setActiveEmailIndex((i) => Math.max(0, Math.min(pageEmails.length - 2, i)));
    toast.success("Email deleted from sequence.");
  }, [activePage, activeEmailIndex, emailSequence, funnelId]);

  const handleSave = async () => {
    setIsSaving(true);
    const saveToastId = toast.loading("Saving email sequence...");
    try {
      const res = await fetch(`/api/offer-data/${funnelId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blocks: {
            email_sequence_v2: emailSequence,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save email sequence");
      }

      setHasUnsavedChanges(false);
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus("idle"), 2000);
      toast.success("Email sequence saved successfully!", { id: saveToastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes", { id: saveToastId });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Debounced autosave ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!hasUnsavedChanges || Object.keys(emailSequence).length === 0) return;
    const timer = setTimeout(async () => {
      setAutoSaveStatus("saving");
      try {
        await fetch(`/api/offer-data/${funnelId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blocks: { email_sequence_v2: emailSequence } }),
        });
        setHasUnsavedChanges(false);
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      } catch {
        setAutoSaveStatus("unsaved");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [emailSequence, hasUnsavedChanges, funnelId]);

  const { completion, complete, isLoading } = useCompletion({
    api: `/api/generate-email-sequence/${funnelId}`,
    onFinish: async (prompt, completionText) => {
      const parsed = clampEmailSequence(parseEmailSequenceV2(completionText));
      if (Object.keys(parsed).length > 0) {
        setEmailSequence(parsed);
        setHasUnsavedChanges(false);
        const firstPage = PAGE_ORDER.find(
          (k) => parsed[k] && parsed[k]!.length > 0,
        );
        if (firstPage) {
          setActivePage(firstPage);
          setActiveEmailIndex(0);
        }
        toast.success("Email sequences generated!");
        return;
      }

      // Fallback: fetch from DB
      try {
        const r = await fetch(`/api/offer-data/${funnelId}`);
        const data = await r.json();
        const savedV2 = data.funnel?.blocks?.email_sequence_v2;
        const savedV1 = data.funnel?.blocks?.email_sequence;

        if (
          savedV2 &&
          typeof savedV2 === "object" &&
          Object.keys(savedV2).length > 0
        ) {
          setEmailSequence(clampEmailSequence(savedV2));
          setHasUnsavedChanges(false);
        } else if (savedV1 && Array.isArray(savedV1) && savedV1.length > 0) {
          setEmailSequence(
            clampEmailSequence(migrateFlatEmailSequence(savedV1)),
          );
          setHasUnsavedChanges(false);
        } else {
          toast.error("AI returned unparseable text. Please retry.");
        }
      } catch (e) {
        // quiet error
      }
    },
    onError: (e) => {
      toast.error(e.message || "Generation failed");
    },
  });

  // Load funnel data + existing emails
  useEffect(() => {
    fetch(`/api/offer-data/${funnelId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.funnel) {
          setFunnelName(data.funnel.name || "Your Funnel");

          const savedV2 = data.funnel.blocks?.email_sequence_v2;
          const savedV1 = data.funnel.blocks?.email_sequence;

          let seq: FunnelEmailSequence = {};

          if (
            savedV2 &&
            typeof savedV2 === "object" &&
            Object.keys(savedV2).length > 0
          ) {
            seq = clampEmailSequence(savedV2);
          } else if (savedV1 && Array.isArray(savedV1) && savedV1.length > 0) {
            seq = clampEmailSequence(migrateFlatEmailSequence(savedV1));
          }

          if (Object.keys(seq).length > 0) {
            setEmailSequence(seq);
            const firstPage = PAGE_ORDER.find(
              (k) => seq[k] && seq[k]!.length > 0,
            );
            if (firstPage) {
              setActivePage(firstPage);
              setActiveEmailIndex(0);
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [funnelId]);

  const handleGenerate = async () => {
    await complete("");
  };

  const handleRegenerateEmail = useCallback(async () => {
    if (!activePage) return;
    const pageEmails = emailSequence[activePage] ?? [];
    const currentEmail = pageEmails[activeEmailIndex] ?? null;
    if (!currentEmail) return;

    setRegeneratingEmail({ pageKey: activePage, emailIndex: activeEmailIndex });

    try {
      const res = await fetch(`/api/regenerate-single-email/${funnelId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageKey: activePage,
          emailIndex: activeEmailIndex,
          currentEmail,
          siblingEmails: pageEmails,
        }),
      });

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: "Regeneration failed" }));
        throw new Error(err.error || "Regeneration failed");
      }

      // Read the streamed response fully
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      // Parse the single email from the response
      const parsedEmail = parseEmailFromResponse(
        fullText,
        currentEmail.day,
        activePage,
      );

      if (parsedEmail) {
        // Update only this email in state
        setEmailSequence((prev) => {
          const emails = [...(prev[activePage] ?? [])];
          emails[activeEmailIndex] = {
            ...parsedEmail,
            order: activeEmailIndex + 1,
          };
          const updated = { ...prev, [activePage]: emails };

          // Also persist to DB
          fetch(`/api/offer-data/${funnelId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blocks: { email_sequence_v2: updated } }),
          }).catch(() => {});

          return updated;
        });
        setHasUnsavedChanges(false);
        toast.success("Email regenerated!");
      } else {
        toast.error("Could not parse the regenerated email. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to regenerate email");
    } finally {
      setRegeneratingEmail(null);
    }
  }, [activePage, activeEmailIndex, emailSequence, funnelId]);

  const handleSelectEmail = useCallback(
    (page: FunnelPageKey, index: number) => {
      setActivePage(page);
      setActiveEmailIndex(index);
    },
    [],
  );

  const handlePrevEmail = useCallback(() => {
    setActiveEmailIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNextEmail = useCallback(() => {
    if (!activePage) return;
    const pageEmails = emailSequence[activePage] ?? [];
    setActiveEmailIndex((i) => Math.min(pageEmails.length - 1, i + 1));
  }, [activePage, emailSequence]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#030712]">
        <Spinner size="md" color="muted" />
      </div>
    );
  }

  const hasEmails = Object.keys(emailSequence).length > 0;
  const activeEmails = activePage ? (emailSequence[activePage] ?? []) : [];
  const activeEmail = activeEmails[activeEmailIndex] ?? null;
  const isCurrentEmailRegenerating =
    regeneratingEmail !== null &&
    regeneratingEmail.pageKey === activePage &&
    regeneratingEmail.emailIndex === activeEmailIndex;

  const totalEmails = Object.values(emailSequence).reduce(
    (sum, arr) => sum + (arr?.length ?? 0),
    0,
  );

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

      <GenerationOverlay visible={isLoading} streamText={completion} />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Topbar
          breadcrumbs={[
            { label: "Funnels", href: `/funnels/${funnelId}` },
            { label: funnelName, href: "#" },
            { label: "Email Sequence" },
          ]}
          actions={
            hasEmails ? (
              <div className="flex items-center gap-2">
                {/* Autosave status indicator */}
                {autoSaveStatus !== "idle" && (
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                    autoSaveStatus === "saving" && "text-muted-foreground",
                    autoSaveStatus === "saved" && "text-emerald-400",
                    autoSaveStatus === "unsaved" && "text-amber-400",
                  )}>
                    {autoSaveStatus === "saving" && <Spinner size="xs" color="muted" />}
                    {autoSaveStatus === "saved" && <Check className="w-3 h-3" />}
                    {autoSaveStatus === "unsaved" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />}
                    {autoSaveStatus === "saving" ? "Saving…" : autoSaveStatus === "saved" ? "Saved" : "Unsaved changes"}
                  </div>
                )}
                {hasUnsavedChanges && (
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className="gap-1.5 font-semibold bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.75)] transition-all duration-300"
                  >
                    {isSaving ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Save Changes
                  </Button>
                )}
              </div>
            ) : undefined
          }
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Funnel secondary sidebar */}
          <FunnelSidebar
            funnelId={funnelId}
            funnelName={funnelName}
            collapsible
          />

          {/* Section A: Left panel — Page-segmented email navigator */}
          <div className="w-[240px] border-r border-white/10 bg-[#131826] flex flex-col overflow-hidden flex-shrink-0">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                ACTIVE OFFER
              </p>
              <div className="flex items-center gap-1.5 bg-muted/40 border border-border rounded-lg px-2.5 py-2">
                <Send className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate">
                  {funnelName}
                </span>
              </div>
              {hasEmails && (
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-semibold text-emerald-400">
                    {totalEmails} emails · {Object.keys(emailSequence).length}{" "}
                    pages
                  </span>
                </div>
              )}
            </div>

            {hasEmails ? (
              <EmailNavigator
                emailSequence={emailSequence}
                activePage={activePage}
                activeEmailIndex={activeEmailIndex}
                onSelect={handleSelectEmail}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center px-4">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Your email sequences will appear here once generated —
                  organised by funnel stage.
                </p>
              </div>
            )}
          </div>

          {/* Center panel — Preview / Copy with toggle */}
          <div className="flex-1 overflow-hidden bg-[#0b0f19] flex flex-col">
            {!hasEmails ? (
              <EmptyState onGenerate={handleGenerate} generating={isLoading} />
            ) : activeEmail && activePage ? (
              <>
                {/* Toolbar with mode toggle + email nav */}
                <div className="sticky top-0 z-10 bg-[#161e31] border-b border-white/10 px-6 py-2.5 flex items-center justify-between relative">
                  {/* Gradient accent stripe */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 via-fuchsia-500 via-pink-500 to-amber-400" />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-indigo/15 border border-brand-indigo/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                      {React.createElement(PAGE_ICONS[activePage], {
                        className: "w-4 h-4 text-brand-indigo drop-shadow-sm",
                      })}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-tight">
                        {FUNNEL_PAGE_LABELS[activePage]}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Email {activeEmailIndex + 1} of {activeEmails.length} ·
                        Day {activeEmail.day}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Email navigation */}
                    <div className="flex items-center gap-1">
                      <button
                        disabled={activeEmailIndex === 0}
                        onClick={handlePrevEmail}
                        className="w-7 h-7 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-muted-foreground"
                      >
                        ←
                      </button>
                      <button
                        disabled={activeEmailIndex === activeEmails.length - 1}
                        onClick={handleNextEmail}
                        className="w-7 h-7 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-muted-foreground"
                      >
                        →
                      </button>
                    </div>

                    {/* Mode toggle */}
                    <ModeToggle mode={centerMode} onChange={setCenterMode} />
                  </div>
                </div>

                {/* Content area — switches between preview and copy */}
                {centerMode === "preview" ? (
                  <EmailHtmlPreview
                    email={activeEmail}
                    pageKey={activePage}
                    emailIndex={activeEmailIndex}
                    totalInPage={activeEmails.length}
                    isRegenerating={isCurrentEmailRegenerating}
                    onRegenerate={handleRegenerateEmail}
                  />
                ) : (
                  <EmailCopyPanel
                    email={activeEmail}
                    pageKey={activePage}
                    emailIndex={activeEmailIndex}
                    totalInPage={activeEmails.length}
                    onUpdateEmail={handleUpdateEmail}
                  />
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Select an email to view
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasEmails && (
        <OfferIQAgent
          ability="email-sequence"
          funnelId={funnelId}
          funnelName={funnelName}
          activeEmail={activeEmail}
          activePage={activePage}
          activeEmailIndex={activeEmailIndex}
          emailSequence={emailSequence}
          onUpdateEmail={handleUpdateEmail}
          onAddEmail={handleAddEmail}
          onDeleteActiveEmail={handleDeleteActiveEmail}
        />
      )}
    </div>
  );
}
