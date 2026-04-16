'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import {
  Mail, Zap, Loader2, Copy, Check, RefreshCw, ChevronDown, ChevronUp,
  Clock, Eye, MousePointer, DollarSign, AlertTriangle, Sparkles, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { EmailCopy } from '@/lib/offer-types';

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
            Generating Email Sequence...
          </h2>
        </div>
        
        <div className="flex-1 w-full bg-card/50 border border-border rounded-xl p-6 overflow-y-auto text-left shadow-2xl relative custom-scrollbar">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse" />
          <pre className="text-sm font-mono text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
            {streamText || "Analysing offer intelligence...\nLoading persona profiles...\nConnecting neural pathways...\n"}
            <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
          </pre>
        </div>
      </div>
    </div>
  );
}

// ─── Trigger node ─────────────────────────────────────────────────────────────

function TriggerNode({ funnelName }: { funnelName: string }) {
  return (
    <div className="w-[420px] bg-card border border-emerald-500/25 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-[0_0_0_4px_rgba(16,185,129,0.06)] mb-0 relative z-10">
      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
        <Zap className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground leading-tight">Trigger: Lead Opts In</p>
        <p className="text-xs text-muted-foreground mt-0.5">Via Lead Capture page · {funnelName}</p>
      </div>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
    </div>
  );
}

// ─── Connector ────────────────────────────────────────────────────────────────

function Connector({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center my-0 relative z-0">
      <div className="w-px bg-gradient-to-b from-border to-border/40 h-7 relative">
        {label && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-card border border-border rounded-md px-2 py-0.5 text-[10px] font-bold text-muted-foreground shadow-sm">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Email step card ──────────────────────────────────────────────────────────

function EmailCard({
  email,
  index,
  isActive,
  onClick,
}: {
  email: EmailCopy;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`Subject: ${email.subject}\nPreview: ${email.preview}\n\n${email.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Email copied!');
  };

  return (
    <div
      onClick={onClick}
      className={`w-[420px] bg-card border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 relative z-10
        ${isActive
          ? 'border-primary/50 shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] translate-y-[-2px]'
          : 'border-border hover:border-border/80 hover:shadow-lg hover:translate-y-[-2px]'
        }`}
    >
      {/* Header */}
      <div className={`px-4 py-2.5 flex items-center gap-3 border-b border-border ${isActive ? 'bg-primary/[0.04]' : 'bg-muted/30'}`}>
        <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-background border border-border flex-shrink-0">
          <span className="text-sm font-black text-foreground leading-none">{email.day}</span>
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Day</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground truncate">{email.subject}</p>
          <p className="text-[11px] text-muted-foreground truncate">{email.preview}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="w-7 h-7 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
            className="w-7 h-7 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors"
          >
            {open ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Preview body */}
      {!open && (
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {email.body}
          </p>
        </div>
      )}

      {/* Expanded body */}
      {open && (
        <div className="px-4 py-3">
          <p className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">
            {email.body}
          </p>
        </div>
      )}

      {/* Metrics strip (placeholder — real metrics come from email platform) */}
      <div className="grid grid-cols-4 border-t border-border">
        {[
          { icon: Eye, label: 'Opens', color: 'text-emerald-400' },
          { icon: MousePointer, label: 'Clicks', color: 'text-sky-400' },
          { icon: AlertTriangle, label: 'Unsub', color: 'text-muted-foreground' },
          { icon: DollarSign, label: 'Revenue', color: 'text-amber-400' },
        ].map((m) => (
          <div key={m.label} className="flex flex-col items-center py-2 border-r border-border last:border-r-0">
            <m.icon className={`w-3 h-3 ${m.color} mb-0.5`} />
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide">{m.label}</span>
            <span className="text-[11px] font-bold text-muted-foreground">—</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onGenerate, generating }: { onGenerate: () => void; generating: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-6">
      <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-6">
        <Mail className="w-7 h-7 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">No email sequence yet</h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
        Generate a personalised 5-email nurture sequence built from your offer intelligence, persona data, and proven hooks.
      </p>
      <Button
        size="lg"
        onClick={onGenerate}
        disabled={generating}
        className="gap-2 font-semibold"
      >
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Generate Email Sequence
      </Button>
    </div>
  );
}

import { useCompletion } from '@ai-sdk/react';
import { parseEmailSequence } from '@/lib/offer-parser';

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EmailSequencePage({
  params,
}: {
  params: Promise<{ funnelId: string }>;
}) {
  const { funnelId } = use(params);
  const router = useRouter();

  const [funnelName, setFunnelName] = useState('Your Funnel');
  const [emails, setEmails] = useState<EmailCopy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const { completion, complete, isLoading } = useCompletion({
    api: `/api/generate-email-sequence/${funnelId}`,
    onFinish: async (text) => {
      // Direct parse for instant UI update
      const parsed = parseEmailSequence(text);
      if (parsed.length > 0) {
        setEmails(parsed);
        toast.success('Email sequence generated!');
        return;
      }

      // Sync/Fallback check
      try {
        const r = await fetch(`/api/offer-data/${funnelId}`);
        const data = await r.json();
        const saved = data.funnel?.blocks?.email_sequence;
        if (saved && Array.isArray(saved) && saved.length > 0) {
          setEmails(saved);
        } else {
          toast.error('AI returned unparseable text. Please retry.');
        }
      } catch (e) {
        // quiet error
      }
    },
    onError: (e) => {
      toast.error(e.message || 'Generation failed');
    }
  });

  // Load funnel data + existing emails
  useEffect(() => {
    fetch(`/api/offer-data/${funnelId}`)
      .then(r => r.json())
      .then(data => {
        if (data.funnel) {
          setFunnelName(data.funnel.name || 'Your Funnel');
          const saved = data.funnel.blocks?.email_sequence;
          if (saved && Array.isArray(saved) && saved.length > 0) {
            setEmails(saved);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [funnelId]);

  const handleGenerate = async () => {
    await complete("");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasCopy = emails.length > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <GenerationOverlay visible={isLoading} streamText={completion} />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ marginLeft: '56px' }}>
        <Topbar
          breadcrumbs={[
            { label: 'Funnels', href: '/' },
            { label: funnelName, href: '#' },
            { label: 'Email Sequence' },
          ]}
          actions={
            hasCopy ? (
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
          {/* Left panel */}
          <div className="w-[230px] border-r border-border bg-card flex flex-col overflow-hidden flex-shrink-0">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Email Sequence</p>
              <div className="flex items-center gap-1.5 bg-muted/40 border border-border rounded-lg px-2.5 py-2">
                <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate">{funnelName}</span>
              </div>
              {hasCopy && (
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-semibold text-emerald-400">{emails.length} emails · Ready</span>
                </div>
              )}
            </div>

            {hasCopy && (
              <div className="flex-1 overflow-y-auto py-2 px-2">
                {emails.map((email, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-full text-left rounded-xl px-3 py-2.5 mb-1 border transition-all ${
                      activeIndex === i
                        ? 'bg-primary/10 border-primary/30 text-foreground'
                        : 'border-transparent hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black flex-shrink-0 ${activeIndex === i ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">Day {email.day}</p>
                        <p className="text-[10px] truncate opacity-70">{email.subject.substring(0, 28)}…</p>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Key projections */}
                <div className="mt-4 mx-1 pt-4 border-t border-border">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Benchmarks</p>
                  {[
                    { label: 'Avg Open Rate', value: '42–58%' },
                    { label: 'Avg Click Rate', value: '8–14%' },
                    { label: 'Unsub Rate', value: '<0.5%' },
                    { label: 'Sequence Days', value: `Day 1–${emails[emails.length - 1]?.day ?? 12}` },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between text-[11px] mb-1.5">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-bold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasCopy && (
              <div className="flex-1 flex items-center justify-center px-4">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Generate your sequence to see the flow
                </p>
              </div>
            )}
          </div>

          {/* Center: sequence flow canvas */}
          <div className="flex-1 overflow-y-auto bg-background relative">
            {/* Subtle dot grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {!hasCopy ? (
              <EmptyState onGenerate={handleGenerate} generating={isLoading} />
            ) : (
              <div className="flex flex-col items-center py-8 pb-20 relative z-10">
                <TriggerNode funnelName={funnelName} />
                {emails.map((email, i) => (
                  <React.Fragment key={i}>
                    <Connector label={i === 0 ? 'Immediate' : `+${email.day - emails[i - 1].day} day${email.day - emails[i - 1].day !== 1 ? 's' : ''}`} />
                    <EmailCard
                      email={email}
                      index={i}
                      isActive={activeIndex === i}
                      onClick={() => setActiveIndex(i)}
                    />
                  </React.Fragment>
                ))}
                <Connector />
                <div className="w-[420px] bg-card border border-border rounded-2xl px-4 py-3 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground">Sequence Complete</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Tag: sequence-complete</span>
                </div>

                {/* Add step dashed button */}
                <Connector />
                <button
                  onClick={() => toast.info('Custom email steps coming soon')}
                  className="w-[420px] h-10 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
                >
                  + Add Email Step
                </button>
              </div>
            )}
          </div>

          {/* Right panel: active email preview */}
          {hasCopy && emails[activeIndex] && (
            <div className="w-[300px] border-l border-border bg-card overflow-y-auto flex-shrink-0">
              <div className="border-b border-border px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Preview</p>
                <p className="text-sm font-bold text-foreground mt-1 line-clamp-2">{emails[activeIndex].subject}</p>
              </div>

              {/* Email preview card */}
              <div className="p-4 space-y-3">
                <div className="bg-background border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted/50 px-3 py-2.5 border-b border-border">
                    <p className="text-[11px] text-muted-foreground">From: <span className="text-foreground font-semibold">Your Name</span></p>
                    <p className="text-[12px] font-bold text-foreground mt-0.5">{emails[activeIndex].subject}</p>
                  </div>
                  <div className="px-3 py-3">
                    <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                      {emails[activeIndex].body.substring(0, 300)}{emails[activeIndex].body.length > 300 ? '…' : ''}
                    </p>
                    <button className="mt-3 bg-amber-400 text-black font-bold text-xs px-4 py-2 rounded-lg">
                      {/* CTA from body — generic */}
                      View Now →
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Day Tag</p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border text-xs font-bold text-foreground">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    Day {emails[activeIndex].day}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Preview Text</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{emails[activeIndex].preview}</p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(`Subject: ${emails[activeIndex].subject}\nPreview: ${emails[activeIndex].preview}\n\n${emails[activeIndex].body}`);
                    toast.success('Email copied!');
                  }}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Full Email
                </Button>
              </div>

              {/* Navigation */}
              <div className="px-4 pb-4 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex(i => Math.max(0, i - 1))}
                  className="flex-1 text-xs h-8"
                >
                  ← Prev
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={activeIndex === emails.length - 1}
                  onClick={() => setActiveIndex(i => Math.min(emails.length - 1, i + 1))}
                  className="flex-1 text-xs h-8"
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
