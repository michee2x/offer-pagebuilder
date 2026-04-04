'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Zap, ArrowRight, Loader2, Copy, RefreshCw, CheckCircle2,
  ChevronRight, Mail, LayoutTemplate, TrendingUp, Heart,
  FileText, Sparkles, AlertTriangle,
} from 'lucide-react';
import type { CopyOutput, PageCopy, EmailCopy } from '@/lib/offer-types';
import { parseCopyOutput } from '@/lib/offer-parser';
import { toast } from 'sonner';

// ─── Wizard step config ───────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { id: 1, label: 'Upload', status: 'done' as const },
  { id: 2, label: 'Intelligence', status: 'done' as const },
  { id: 3, label: 'Copy', status: 'active' as const },
  { id: 4, label: 'Build Pages', status: 'pending' as const },
  { id: 5, label: 'Publish', status: 'pending' as const },
];

// ─── Page nav config ──────────────────────────────────────────────────────────

type PageKey = 'lead_capture' | 'sales_page' | 'upsell' | 'thankyou' | 'email_sequence';

const PAGE_NAV: {
  key: PageKey;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { key: 'lead_capture', label: 'Lead Capture', icon: <Target className="w-3.5 h-3.5" />, color: 'text-sky-400' },
  { key: 'sales_page', label: 'Sales Page', icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'text-amber-400' },
  { key: 'upsell', label: 'Upsell Page', icon: <Zap className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
  { key: 'thankyou', label: 'Thank You', icon: <Heart className="w-3.5 h-3.5" />, color: 'text-rose-400' },
  { key: 'email_sequence', label: 'Email Sequence', icon: <Mail className="w-3.5 h-3.5" />, color: 'text-violet-400' },
];

// needed here due to module-level usage
function Target(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

// ─── Generation overlay ───────────────────────────────────────────────────────

const GEN_STEPS = [
  'Analysing offer & persona intelligence',
  'Writing lead capture page',
  'Writing sales page (full structure)',
  'Writing upsell + thank you pages',
  'Building 5-email nurture sequence',
  'Scoring copy quality metrics',
];

function GenerationOverlay({ visible, step }: { visible: boolean; step: number }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/97 backdrop-blur-md flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-5 animate-pulse">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1 tracking-tight">Writing Your Copy</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Opus is writing high-converting copy for all 5 pages using your intelligence report.
        </p>
        <div className="space-y-2 text-left">
          {GEN_STEPS.map((s, i) => {
            const isDone = i < step;
            const isActive = i === step;
            return (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-sm transition-all',
                  isDone && 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400',
                  isActive && 'bg-primary/5 border-primary/20 text-foreground',
                  !isDone && !isActive && 'bg-muted/30 border-border text-muted-foreground',
                )}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isActive ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span className="text-[10px] font-bold">{i + 1}</span>
                  )}
                </div>
                {s}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Score ring (SVG) ─────────────────────────────────────────────────────────

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#f59e0b' : '#f43f5e';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
    </svg>
  );
}

// ─── Copy block ───────────────────────────────────────────────────────────────

function CopyBlock({
  sectionLabel,
  content,
  onCopy,
}: {
  sectionLabel: string;
  content: string;
  onCopy: () => void;
}) {
  const [localContent, setLocalContent] = useState(content);
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden mb-3 hover:border-border/80 transition-colors">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-muted/20">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {sectionLabel.replace(/_/g, ' ')}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => {
              navigator.clipboard.writeText(ref.current?.innerText || localContent);
              toast.success('Copied!');
            }}
            className="h-6 px-2 rounded flex items-center gap-1 text-[11px] text-muted-foreground border border-border bg-background hover:text-foreground hover:border-border/80 transition-colors"
          >
            <Copy className="w-2.5 h-2.5" />
            Copy
          </button>
        </div>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={e => setLocalContent((e.target as HTMLDivElement).innerText)}
        className="px-4 py-3 text-sm text-muted-foreground leading-relaxed outline-none focus:bg-primary/[0.02] min-h-[60px] whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
      />
    </div>
  );
}

// ─── Email card ───────────────────────────────────────────────────────────────

function EmailCard({ email, index }: { email: EmailCopy; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden mb-3">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex flex-col items-center justify-center shrink-0">
          <span className="text-sm font-bold text-violet-400 leading-none">{email.day}</span>
          <span className="text-[9px] text-violet-400/70 font-bold">DAY</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{email.subject}</div>
          <div className="text-xs text-muted-foreground truncate">{email.preview}</div>
        </div>
        <ChevronRight className={cn('w-4 h-4 text-muted-foreground transition-transform shrink-0', open && 'rotate-90')} />
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3">
          <div className="mb-2 space-y-1">
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold">Subject:</span>{' '}
              <span
                contentEditable
                suppressContentEditableWarning
                className="outline-none focus:bg-primary/[0.02] rounded px-0.5"
              >
                {email.subject}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold">Preview:</span>{' '}
              <span
                contentEditable
                suppressContentEditableWarning
                className="outline-none focus:bg-primary/[0.02] rounded px-0.5"
              >
                {email.preview}
              </span>
            </div>
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap outline-none focus:bg-primary/[0.02] rounded p-1 min-h-[80px]"
            dangerouslySetInnerHTML={{ __html: email.body.replace(/\n/g, '<br>') }}
          />
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            <button
              onClick={() => navigator.clipboard.writeText(`Subject: ${email.subject}\nPreview: ${email.preview}\n\n${email.body}`).then(() => toast.success('Email copied!'))}
              className="h-6 px-2 rounded flex items-center gap-1 text-[11px] text-muted-foreground border border-border hover:text-foreground transition-colors"
            >
              <Copy className="w-2.5 h-2.5" /> Copy Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page workspace ───────────────────────────────────────────────────────────

function PageWorkspace({ pageCopy, pageLabel, badge }: { pageCopy: PageCopy; pageLabel: string; badge: string }) {
  if (!pageCopy?.sections?.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
      <AlertTriangle className="w-8 h-8 opacity-40" />
      <p className="text-sm">No copy sections generated for this page.</p>
    </div>
  );
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className={cn('inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1.5', badge)}>
            {pageLabel}
          </div>
          <h2 className="text-lg font-bold text-foreground">{pageLabel}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pageCopy.sections.length} sections · {pageCopy.word_count} words · Score {pageCopy.score}
          </p>
        </div>
        <button
          onClick={() => {
            const all = pageCopy.sections.map(s => `[${s.label}]\n${s.content}`).join('\n\n---\n\n');
            navigator.clipboard.writeText(all).then(() => toast.success('All copy copied!'));
          }}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-card border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Copy className="w-3 h-3" /> Copy All
        </button>
      </div>
      {pageCopy.sections.map(section => (
        <CopyBlock
          key={section.label}
          sectionLabel={section.label}
          content={section.content}
          onCopy={() => navigator.clipboard.writeText(section.content).then(() => toast.success('Copied!'))}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CopyPage({ params }: { params: Promise<{ funnelId: string }> }) {
  const { funnelId } = use(params);
  const router = useRouter();

  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [funnelName, setFunnelName] = useState('');
  const [copy, setCopy] = useState<CopyOutput | null>(null);
  const [activePage, setActivePage] = useState<PageKey>('lead_capture');

  // ── Load copy from DB or trigger generation ───────────────────────────────

  useEffect(() => {
    async function init() {
      const res = await fetch(`/api/offer-data/${funnelId}`);
      if (!res.ok) return;
      const { funnel } = await res.json();
      setFunnelName(funnel.name || 'Untitled Funnel');

      if (funnel.blocks?.copy_complete && funnel.blocks?.copy) {
        setCopy(funnel.blocks.copy);
      } else {
        // Trigger copy generation
        await generateCopy();
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnelId]);

  async function generateCopy() {
    setIsGenerating(true);

    // Animate steps
    let step = 0;
    const interval = setInterval(() => {
      step = Math.min(step + 1, GEN_STEPS.length - 1);
      setGenStep(step);
    }, 8000);

    try {
      const res = await fetch('/api/offer-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funnelId }),
      });
      if (!res.ok || !res.body) throw new Error('Copy generation failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }
      setCopy(parseCopyOutput(accumulated));
    } catch (e: any) {
      toast.error('Copy generation failed. Please try again.');
    } finally {
      clearInterval(interval);
      setGenStep(GEN_STEPS.length);
      setIsGenerating(false);
    }
  }

  // ── Active page copy ──────────────────────────────────────────────────────

  const PAGE_BADGES: Record<PageKey, string> = {
    lead_capture: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    sales_page: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    upsell: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    thankyou: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    email_sequence: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };

  const overallScore = copy
    ? Math.round(
        ([copy.lead_capture, copy.sales_page, copy.upsell, copy.thankyou]
          .reduce((a, p) => a + (p?.score || 0), 0)) / 4
      )
    : 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ marginLeft: '56px' }}>

        <Topbar
          breadcrumbs={[
            { label: 'Funnels', href: '/' },
            { label: funnelName || funnelId, href: `/intelligence/${funnelId}` },
            { label: 'Copy Engine' },
          ]}
          steps={WIZARD_STEPS}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={generateCopy}
            disabled={isGenerating}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isGenerating && 'animate-spin')} />
            Regenerate
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/builder?id=${funnelId}`)}
            className="gap-1.5 font-semibold"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            Build Pages
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Topbar>

        <div className="flex flex-1 overflow-hidden">

          {/* Left Copy Nav */}
          <div className="w-52 shrink-0 border-r border-border bg-card flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-bold text-foreground truncate">{funnelName || 'Copy Engine'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">5 pages</p>
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {PAGE_NAV.map(page => {
                const pageCopy = copy?.[page.key];
                const score = page.key !== 'email_sequence' ? (pageCopy as PageCopy)?.score : 0;
                const active = activePage === page.key;
                return (
                  <button
                    key={page.key}
                    onClick={() => setActivePage(page.key)}
                    className={cn(
                      'w-full flex flex-col gap-1.5 px-3 py-2.5 rounded-lg border text-left transition-all',
                      active
                        ? 'bg-primary/5 border-primary/20'
                        : 'border-transparent hover:bg-muted/40',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn(page.color)}>{page.icon}</span>
                      <span className={cn('text-xs font-semibold', active ? 'text-foreground' : 'text-muted-foreground')}>
                        {page.label}
                      </span>
                    </div>
                    {score > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', score >= 80 ? 'bg-emerald-500' : score >= 65 ? 'bg-amber-500' : 'bg-rose-500')}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className={cn('text-[10px] font-bold', active ? 'text-primary' : 'text-muted-foreground')}>{score}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main workspace */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-6">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm">Generating copy…</p>
                </div>
              ) : copy ? (
                activePage === 'email_sequence' ? (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/20 mb-1.5">
                          Email Sequence
                        </div>
                        <h2 className="text-lg font-bold text-foreground">5-Email Nurture Sequence</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {copy.email_sequence.length} emails · 14-day nurture
                        </p>
                      </div>
                    </div>
                    {copy.email_sequence.map((email, i) => (
                      <EmailCard key={i} email={email} index={i} />
                    ))}
                  </div>
                ) : (
                  <PageWorkspace
                    pageCopy={copy[activePage] as PageCopy}
                    pageLabel={PAGE_NAV.find(p => p.key === activePage)?.label || activePage}
                    badge={PAGE_BADGES[activePage]}
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                  <FileText className="w-8 h-8 opacity-40" />
                  <p className="text-sm">No copy yet.</p>
                  <Button size="sm" onClick={generateCopy} className="gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Copy
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-52 shrink-0 border-l border-border bg-card overflow-y-auto hidden xl:block">
            <div className="p-4 space-y-4">
              {/* Overall score ring */}
              {overallScore > 0 && (
                <div className="bg-muted/30 border border-border rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Overall Copy Score</p>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <ScoreRing score={overallScore} size={56} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-foreground">{overallScore}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">{overallScore >= 80 ? 'Strong' : overallScore >= 65 ? 'Good' : 'Needs Work'}</div>
                      <div className="text-[11px] text-muted-foreground">Avg across 4 pages</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page scores list */}
              {copy && (
                <div className="bg-muted/30 border border-border rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Page Scores</p>
                  <div className="space-y-2">
                    {PAGE_NAV.filter(p => p.key !== 'email_sequence').map(page => {
                      const score = (copy[page.key] as PageCopy)?.score || 0;
                      return (
                        <button
                          key={page.key}
                          onClick={() => setActivePage(page.key)}
                          className={cn(
                            'w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors text-xs',
                            activePage === page.key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
                          )}
                        >
                          <span>{page.label}</span>
                          <span className="font-bold">{score || '—'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Build Pages CTA */}
              <Button
                className="w-full gap-1.5 font-bold text-xs"
                size="sm"
                onClick={() => router.push(`/builder?id=${funnelId}`)}
              >
                Build Pages
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

        </div>
      </div>

      <GenerationOverlay visible={isGenerating} step={genStep} />
    </div>
  );
}
