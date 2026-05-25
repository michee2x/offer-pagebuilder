'use client';

import React, { useState, useEffect, useCallback, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import {
  Mail, Copy, Check, RefreshCw, Sparkles, ChevronDown, ChevronRight,
  Clock, Send, FileText, ShoppingCart, ArrowUpRight, ArrowDownRight, Heart,
  Eye, Code2, Type, ClipboardList,
  type LucideIcon,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { EmailCopy, FunnelEmailSequence, FunnelPageKey } from '@/lib/offer-types';
import { FUNNEL_PAGE_LABELS } from '@/lib/offer-types';
import { FunnelSidebar } from '@/components/layout/FunnelSidebar';
import { useCompletion } from '@ai-sdk/react';
import { parseEmailSequenceV2, migrateFlatEmailSequence } from '@/lib/offer-parser';
import { extractEmailSections, wrapPlainTextAsHtml } from '@/lib/email-html-extractor';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_ICONS: Record<FunnelPageKey, LucideIcon> = {
  lead_capture: Mail,
  sales_page: ShoppingCart,
  upsell: ArrowUpRight,
  downsell: ArrowDownRight,
  thankyou: Heart,
};

const PAGE_ORDER: FunnelPageKey[] = [
  'lead_capture',
  'sales_page',
  'upsell',
  'downsell',
  'thankyou',
];

type CenterMode = 'preview' | 'copy';
type CopySubMode = 'html' | 'text';

// ─── Helper: get HTML for an email (handles legacy plain-text) ────────────────

function getEmailHtml(email: EmailCopy): string {
  if (email.html) return email.html;
  // Legacy fallback: wrap plain text in an HTML email template
  return wrapPlainTextAsHtml(email.subject, email.preview, email.body, email.cta);
}

// ─── Generation overlay ───────────────────────────────────────────────────────

function GenerationOverlay({ visible, streamText }: { visible: boolean; streamText: string }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center h-[80vh]">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-8 h-8">
            <svg className="animate-spin w-full h-full text-foreground/80" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Generating Email Sequences…
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Building per-page email sequences across your entire funnel
        </p>

        <div className="flex-1 w-full bg-[#1e2433] border border-white/5 rounded-xl p-6 overflow-y-auto text-left shadow-2xl relative custom-scrollbar">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-brand-indigo to-transparent animate-pulse" />
          <pre className="text-sm font-mono text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
            {streamText || "Analysing offer intelligence…\nMapping funnel page sequence…\nCrafting email narratives…\n"}
            <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
          </pre>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onGenerate, generating }: { onGenerate: () => void; generating: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 bg-[#0b0f19]">
      <div className="w-16 h-16 rounded-2xl bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center mb-6">
        <Mail className="w-7 h-7 text-brand-blue" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">No email sequences yet</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
        Generate personalised email sequences for each page in your funnel — from lead nurture to post-purchase onboarding.
      </p>
      <Button
        size="lg"
        onClick={onGenerate}
        disabled={generating}
        className="gap-2 font-semibold bg-gradient-to-r from-brand-blue to-brand-indigo hover:opacity-90 text-white shadow-lg shadow-indigo-500/25 transition-opacity border-0"
      >
        {generating ? <Spinner size="sm" color="white" /> : <Sparkles className="w-4 h-4" />}
        Generate Email Sequences
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
    new Set(Object.keys(emailSequence) as FunnelPageKey[])
  );

  const togglePage = (page: FunnelPageKey) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const orderedPages = PAGE_ORDER.filter((k) => emailSequence[k] && emailSequence[k]!.length > 0);

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
                  ? 'bg-gradient-to-r from-brand-blue to-brand-indigo text-white shadow-lg shadow-indigo-500/25'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                  isActivePage ? 'text-white drop-shadow-sm' : 'bg-white/5 text-muted-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate">{FUNNEL_PAGE_LABELS[pageKey]}</p>
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
                  const isActive = activePage === pageKey && activeEmailIndex === emailIdx;
                  return (
                    <button
                      key={emailIdx}
                      onClick={() => onSelect(pageKey, emailIdx)}
                      className={`w-full text-left rounded-lg px-2.5 py-2 transition-all duration-300 ${
                        isActive
                          ? 'bg-white/5 border border-white/10 text-foreground'
                          : 'border border-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded text-[10px] font-black flex items-center justify-center flex-shrink-0 transition-colors ${
                            isActive ? 'bg-brand-blue text-white' : 'bg-white/5 text-muted-foreground'
                          }`}
                        >
                          {emailIdx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold truncate leading-tight">
                            {email.subject || 'Untitled'}
                          </p>
                          <p className="text-[9px] opacity-50 mt-0.5">Day {email.day}</p>
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

function ModeToggle({ mode, onChange }: { mode: CenterMode; onChange: (m: CenterMode) => void }) {
  return (
    <div className="flex items-center bg-muted/50 border border-border rounded-lg p-0.5">
      <button
        onClick={() => onChange('preview')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          mode === 'preview'
            ? 'bg-background text-foreground shadow-sm border border-border'
            : 'text-muted-foreground hover:text-foreground border border-transparent'
        }`}
      >
        <Eye className="w-3 h-3" />
        Preview
      </button>
      <button
        onClick={() => onChange('copy')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          mode === 'copy'
            ? 'bg-background text-foreground shadow-sm border border-border'
            : 'text-muted-foreground hover:text-foreground border border-transparent'
        }`}
      >
        <ClipboardList className="w-3 h-3" />
        Copy
      </button>
    </div>
  );
}

// ─── Copy sub-mode toggle (HTML / Text) ───────────────────────────────────────

function CopySubToggle({ subMode, onChange }: { subMode: CopySubMode; onChange: (m: CopySubMode) => void }) {
  return (
    <div className="flex items-center bg-[#1a2035] border border-white/10 rounded-lg p-0.5">
      <button
        onClick={() => onChange('html')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          subMode === 'html'
            ? 'bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30'
            : 'text-muted-foreground hover:text-foreground border border-transparent'
        }`}
      >
        <Code2 className="w-3 h-3" />
        HTML Code
      </button>
      <button
        onClick={() => onChange('text')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          subMode === 'text'
            ? 'bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30'
            : 'text-muted-foreground hover:text-foreground border border-transparent'
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
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(`${label} copied!`);
  };

  if (!value) return null;

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
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {multiline ? (
        <textarea
          readOnly
          value={value}
          rows={Math.min(Math.max(value.split('\n').length, 4), 16)}
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#1a2035] text-sm text-white/90 leading-relaxed outline-none resize-none cursor-text select-all focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue/60 transition-all"
        />
      ) : (
        <input
          readOnly
          type="text"
          value={value}
          className="w-full h-10 px-4 rounded-xl border border-white/10 bg-[#1a2035] text-sm font-semibold text-white outline-none cursor-text select-all focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue/60 transition-all"
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
}: {
  email: EmailCopy;
  pageKey: FunnelPageKey;
  emailIndex: number;
  totalInPage: number;
}) {
  const html = getEmailHtml(email);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Inbox preview row */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
            How it looks in the inbox
          </p>
          <div className="bg-[#161e31] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 flex items-start gap-4 cursor-default">
              <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-black">Y</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-foreground">Your Name</span>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">
                    Day {email.day}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                  {email.subject || 'No subject'}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {email.preview || email.body?.substring(0, 100) || 'No preview text'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Real HTML email render */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
            Rendered email
          </p>
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <iframe
              srcDoc={html}
              sandbox="allow-same-origin"
              title={`Email preview: ${email.subject}`}
              className="w-full bg-white border-0"
              style={{ minHeight: '600px', height: '100%' }}
              onLoad={(e) => {
                // Auto-resize iframe to content height
                const iframe = e.target as HTMLIFrameElement;
                try {
                  const contentHeight = iframe.contentDocument?.documentElement?.scrollHeight;
                  if (contentHeight) {
                    iframe.style.height = `${contentHeight + 20}px`;
                  }
                } catch {
                  // Silently fail if cross-origin issues
                }
              }}
            />
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 pb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground">Day {email.day}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <FileText className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground">
              {FUNNEL_PAGE_LABELS[pageKey]} · Email {emailIndex + 1} of {totalInPage}
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
}: {
  email: EmailCopy;
  pageKey: FunnelPageKey;
  emailIndex: number;
  totalInPage: number;
}) {
  const [subMode, setSubMode] = useState<CopySubMode>('html');
  const [copiedAll, setCopiedAll] = useState(false);

  const html = getEmailHtml(email);

  // Extract text sections from the HTML
  const extracted = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return extractEmailSections(html, email.subject);
  }, [html, email.subject]);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(html);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast.success('HTML code copied!');
  };

  const handleCopyAllText = () => {
    if (!extracted) return;
    navigator.clipboard.writeText(extracted.fullPlainText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast.success('All text copied!');
  };

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
            onClick={subMode === 'html' ? handleCopyHtml : handleCopyAllText}
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedAll ? 'Copied!' : subMode === 'html' ? 'Copy HTML' : 'Copy All Text'}
          </Button>
        </div>

        {subMode === 'html' ? (
          /* ── HTML Code view ── */
          <div className="relative group">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={handleCopyHtml}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-[10px] font-semibold text-white/70 hover:text-white hover:bg-white/15 transition-all"
              >
                {copiedAll ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedAll ? 'Copied' : 'Copy'}
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
                  email-{emailIndex + 1}.html
                </span>
              </div>
              <pre className="p-5 overflow-x-auto text-[13px] font-mono text-emerald-300/90 leading-relaxed custom-scrollbar">
                <code>{html}</code>
              </pre>
            </div>
          </div>
        ) : (
          /* ── Text Fields view ── */
          <div className="space-y-5">
            <CopyableField label="Subject Line" value={email.subject} />
            <CopyableField label="Preview Text" value={email.preview} />
            {extracted?.heading && (
              <CopyableField label="Heading" value={extracted.heading} />
            )}
            <CopyableField
              label="Email Body"
              value={extracted?.body || email.body}
              multiline
            />
            {(extracted?.cta || email.cta) && (
              <CopyableField label="Call-to-Action" value={extracted?.cta || email.cta || ''} />
            )}

            {/* Copy all as text button */}
            <div className="pt-2 border-t border-white/5">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-white/10 hover:bg-white/5 bg-transparent w-full justify-center"
                onClick={handleCopyAllText}
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedAll ? 'Copied!' : 'Copy All as Plain Text'}
              </Button>
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-3 pb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground">Day {email.day}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <FileText className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground">
              {FUNNEL_PAGE_LABELS[pageKey]} · Email {emailIndex + 1} of {totalInPage}
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
  const router = useRouter();

  const [funnelName, setFunnelName] = useState('Your Funnel');
  const [emailSequence, setEmailSequence] = useState<FunnelEmailSequence>({});
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<FunnelPageKey | null>(null);
  const [activeEmailIndex, setActiveEmailIndex] = useState(0);
  const [centerMode, setCenterMode] = useState<CenterMode>('preview');

  const { completion, complete, isLoading } = useCompletion({
    api: `/api/generate-email-sequence/${funnelId}`,
    onFinish: async (text) => {
      const parsed = parseEmailSequenceV2(text);
      if (Object.keys(parsed).length > 0) {
        setEmailSequence(parsed);
        const firstPage = PAGE_ORDER.find((k) => parsed[k] && parsed[k]!.length > 0);
        if (firstPage) {
          setActivePage(firstPage);
          setActiveEmailIndex(0);
        }
        toast.success('Email sequences generated!');
        return;
      }

      // Fallback: fetch from DB
      try {
        const r = await fetch(`/api/offer-data/${funnelId}`);
        const data = await r.json();
        const savedV2 = data.funnel?.blocks?.email_sequence_v2;
        const savedV1 = data.funnel?.blocks?.email_sequence;

        if (savedV2 && typeof savedV2 === 'object' && Object.keys(savedV2).length > 0) {
          setEmailSequence(savedV2);
        } else if (savedV1 && Array.isArray(savedV1) && savedV1.length > 0) {
          setEmailSequence(migrateFlatEmailSequence(savedV1));
        } else {
          toast.error('AI returned unparseable text. Please retry.');
        }
      } catch (e) {
        // quiet error
      }
    },
    onError: (e) => {
      toast.error(e.message || 'Generation failed');
    },
  });

  // Load funnel data + existing emails
  useEffect(() => {
    fetch(`/api/offer-data/${funnelId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.funnel) {
          setFunnelName(data.funnel.name || 'Your Funnel');

          const savedV2 = data.funnel.blocks?.email_sequence_v2;
          const savedV1 = data.funnel.blocks?.email_sequence;

          let seq: FunnelEmailSequence = {};

          if (savedV2 && typeof savedV2 === 'object' && Object.keys(savedV2).length > 0) {
            seq = savedV2;
          } else if (savedV1 && Array.isArray(savedV1) && savedV1.length > 0) {
            seq = migrateFlatEmailSequence(savedV1);
          }

          if (Object.keys(seq).length > 0) {
            setEmailSequence(seq);
            const firstPage = PAGE_ORDER.find((k) => seq[k] && seq[k]!.length > 0);
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
    await complete('');
  };

  const handleSelectEmail = useCallback((page: FunnelPageKey, index: number) => {
    setActivePage(page);
    setActiveEmailIndex(index);
  }, []);

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
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner size="md" color="muted" />
      </div>
    );
  }

  const hasEmails = Object.keys(emailSequence).length > 0;
  const activeEmails = activePage ? emailSequence[activePage] ?? [] : [];
  const activeEmail = activeEmails[activeEmailIndex] ?? null;

  const totalEmails = Object.values(emailSequence).reduce(
    (sum, arr) => sum + (arr?.length ?? 0),
    0
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <GenerationOverlay visible={isLoading} streamText={completion} />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          breadcrumbs={[
            { label: 'Funnels', href: `/funnels/${funnelId}` },
            { label: funnelName, href: '#' },
            { label: 'Email Sequence' },
          ]}
          actions={
            hasEmails ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerate}
                disabled={isLoading}
                className="gap-1.5 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </Button>
            ) : undefined
          }
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Funnel secondary sidebar */}
          <FunnelSidebar funnelId={funnelId} funnelName={funnelName} collapsible />

          {/* Section A: Left panel — Page-segmented email navigator */}
          <div className="w-[240px] border-r border-white/10 bg-[#131826] flex flex-col overflow-hidden flex-shrink-0">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Email Sequences
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
                    {totalEmails} emails · {Object.keys(emailSequence).length} pages
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
                  Generate your sequences to see the flow
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
                      {React.createElement(PAGE_ICONS[activePage], { className: 'w-4 h-4 text-brand-indigo drop-shadow-sm' })}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-tight">{FUNNEL_PAGE_LABELS[activePage]}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Email {activeEmailIndex + 1} of {activeEmails.length} · Day {activeEmail.day}
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
                {centerMode === 'preview' ? (
                  <EmailHtmlPreview
                    email={activeEmail}
                    pageKey={activePage}
                    emailIndex={activeEmailIndex}
                    totalInPage={activeEmails.length}
                  />
                ) : (
                  <EmailCopyPanel
                    email={activeEmail}
                    pageKey={activePage}
                    emailIndex={activeEmailIndex}
                    totalInPage={activeEmails.length}
                  />
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Select an email to view</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
