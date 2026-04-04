'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Zap, CheckCircle2, Loader2, Globe, FileText, Video, PenLine,
  ChevronRight, ArrowRight, X,
} from 'lucide-react';
import type { OfferFormData, TrafficChannel, OfferFormat, CurrencyCode } from '@/lib/offer-types';

// ─── Constants ───────────────────────────────────────────────────────────────

const OFFER_FORMATS: { value: OfferFormat; label: string }[] = [
  { value: 'course', label: 'Online Course' },
  { value: 'coaching', label: 'Coaching / Mentorship' },
  { value: 'consulting', label: 'Consulting / Done-For-You' },
  { value: 'agency', label: 'Agency / Service' },
  { value: 'ebook', label: 'Ebook / Digital Download' },
  { value: 'membership', label: 'Membership / Community' },
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'physical', label: 'Physical Product / E-commerce' },
  { value: 'affiliate', label: 'Affiliate / Lead Gen' },
  { value: 'local', label: 'Local Business' },
];

const CURRENCIES: CurrencyCode[] = ['USD', 'GBP', 'EUR', 'AUD', 'CAD', 'NZD', 'ZAR', 'INR', 'NGN', 'GHS'];

const TRAFFIC_CHANNELS: TrafficChannel[] = [
  'Meta Ads', 'Google Ads', 'YouTube Ads', 'TikTok Ads', 'LinkedIn Ads',
  'Email List', 'Organic Social', 'SEO / Blog', 'Podcast', "Haven't started yet",
];

const PROCESSING_STEPS = [
  { label: 'Extracting offer signals', sub: 'Parsing input for key conversion data' },
  { label: 'Mapping target persona', sub: 'Demographics & buying triggers' },
  { label: 'Analysing pain points & hooks', sub: 'Identifying conversion angles' },
  { label: 'Designing revenue architecture', sub: 'Pricing, upsells, funnel blueprint' },
  { label: 'Generating Traffic Intelligence', sub: 'Ad copy, scripts, media buying strategy' },
  { label: 'Calculating Funnel Health Score', sub: 'Leakage detection & optimisation map' },
];

const EMPTY_FORM: OfferFormData = {
  field_1_name: '', field_1_format: 'course',
  field_2_outcome: '', field_3_persona: '',
  field_4_price: '', field_4_currency: 'USD', field_4_upsell: '',
  field_5_proof: '', field_6_mechanism: '',
  field_7_channels: [], field_7_detail: '', field_8_challenge: '',
};

const WIZARD_STEPS = [
  { id: 1, label: 'Upload', status: 'active' as const },
  { id: 2, label: 'Intelligence', status: 'pending' as const },
  { id: 3, label: 'Copy', status: 'pending' as const },
  { id: 4, label: 'Build Pages', status: 'pending' as const },
  { id: 5, label: 'Publish', status: 'pending' as const },
];

// ─── Processing Overlay ───────────────────────────────────────────────────────

function ProcessingOverlay({
  visible,
  currentStep,
  progress,
}: {
  visible: boolean;
  currentStep: number;
  progress: number;
}) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-6">
        {/* Logo pulse */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse">
            <Zap className="w-6 h-6 text-primary" />
          </div>
        </div>

        <h2 className="text-center text-xl font-bold text-foreground mb-1 tracking-tight">
          Intelligence Engine Running
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Building your complete Revenue Blueprint…
        </p>

        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-xs text-muted-foreground mb-6">{progress}%</div>

        {/* Steps */}
        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-card">
          {PROCESSING_STEPS.map((step, i) => {
            const isDone = i < currentStep;
            const isRunning = i === currentStep;
            return (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 transition-colors',
                  isDone && 'bg-emerald-500/5',
                  isRunning && 'bg-primary/5',
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                    isDone && 'bg-emerald-500/15 text-emerald-400',
                    isRunning && 'bg-primary/15 text-primary',
                    !isDone && !isRunning && 'bg-muted text-muted-foreground',
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isRunning ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <span className="text-[10px] font-bold">{i + 1}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      isDone && 'text-emerald-400',
                      isRunning && 'text-foreground',
                      !isDone && !isRunning && 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{step.sub}</div>
                </div>
                {isDone && (
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">Done</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Input method tabs ────────────────────────────────────────────────────────

type InputMethod = 'manual' | 'url' | 'pdf' | 'video';

const INPUT_METHODS: { id: InputMethod; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'manual', label: 'Manual Entry', icon: <PenLine className="w-4 h-4" /> },
  { id: 'url', label: 'Website URL', icon: <Globe className="w-4 h-4" />, badge: 'Soon' },
  { id: 'pdf', label: 'PDF / Doc', icon: <FileText className="w-4 h-4" />, badge: 'Soon' },
  { id: 'video', label: 'Video URL', icon: <Video className="w-4 h-4" />, badge: 'Soon' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardPage() {
  const router = useRouter();
  const [method, setMethod] = useState<InputMethod>('manual');
  const [form, setForm] = useState<OfferFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof OfferFormData, string>>>({});

  // ── Helpers ──

  function set<K extends keyof OfferFormData>(key: K, value: OfferFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function toggleChannel(ch: TrafficChannel) {
    setForm(prev => {
      const has = prev.field_7_channels.includes(ch);
      return {
        ...prev,
        field_7_channels: has
          ? prev.field_7_channels.filter(c => c !== ch)
          : [...prev.field_7_channels, ch],
      };
    });
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.field_1_name.trim()) e.field_1_name = 'Required';
    if (!form.field_2_outcome.trim()) e.field_2_outcome = 'Required';
    if (!form.field_3_persona.trim()) e.field_3_persona = 'Required';
    if (!form.field_4_price.trim()) e.field_4_price = 'Required';
    if (!form.field_6_mechanism.trim()) e.field_6_mechanism = 'Required';
    if (form.field_7_channels.length === 0) e.field_7_channels = 'Select at least one channel';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ──

  async function handleSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);

    // Animate steps while the stream runs
    const stepDurations = [900, 1100, 1000, 1300, 1400, 800];
    let stepIdx = 0;
    let totalElapsed = 0;
    const totalTime = stepDurations.reduce((a, b) => a + b, 0);

    function advanceStep() {
      if (stepIdx >= PROCESSING_STEPS.length) return;
      const dur = stepDurations[stepIdx];
      totalElapsed += dur;
      const targetProgress = Math.round((totalElapsed / totalTime) * 90); // max 90% while streaming
      setProcessingStep(stepIdx);
      const start = Date.now();
      const prevProgress = progress;
      function tick() {
        const ratio = Math.min((Date.now() - start) / dur, 1);
        setProgress(Math.round(prevProgress + (targetProgress - prevProgress) * ratio));
        if (ratio < 1) requestAnimationFrame(tick);
        else {
          stepIdx++;
          if (stepIdx < PROCESSING_STEPS.length) setTimeout(advanceStep, 80);
        }
      }
      requestAnimationFrame(tick);
    }
    advanceStep();

    try {
      const res = await fetch('/api/offer-intelligence/call1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: form }),
      });

      const funnelId = res.headers.get('X-Funnel-Id');
      if (!funnelId) throw new Error('No funnel ID returned');

      // Drain the stream (progress bar will finish on redirect)
      if (res.body) {
        const reader = res.body.getReader();
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }

      setProgress(100);
      setProcessingStep(PROCESSING_STEPS.length);
      await new Promise(r => setTimeout(r, 600));
      router.push(`/intelligence/${funnelId}`);
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      setProcessingStep(0);
      setProgress(0);
    }
  }

  // ── Render ──

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ marginLeft: '56px' }}>
        <Topbar
          breadcrumbs={[{ label: 'Funnels', href: '/' }, { label: 'New Funnel' }]}
          steps={WIZARD_STEPS}
        />

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-10">

            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-xs font-semibold text-primary mb-3">
                <Zap className="w-3 h-3" />
                Step 1 — Upload Your Offer
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
                Tell us about your offer
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
                Give OfferIQ the signal it needs to build your Revenue Blueprint. The more specific you are, the sharper the intelligence.
              </p>
            </div>

            {/* Input method tabs */}
            <div className="grid grid-cols-4 gap-1 bg-card border border-border rounded-xl p-1 mb-6">
              {INPUT_METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => m.id === 'manual' && setMethod(m.id)}
                  disabled={m.id !== 'manual'}
                  className={cn(
                    'relative flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    method === m.id
                      ? 'bg-background text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed',
                  )}
                >
                  {m.icon}
                  <span className="hidden sm:inline">{m.label}</span>
                  {m.badge && (
                    <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-primary/10 text-primary px-1 rounded-sm border border-primary/20">
                      {m.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Form card */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-border">

                {/* Section 1: Core Offer */}
                <FormSection title="Core Offer" step="01">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Field label="Offer / Product Name" required error={errors.field_1_name}>
                        <Input
                          placeholder="e.g. The Corporate Exit Accelerator"
                          value={form.field_1_name}
                          onChange={e => set('field_1_name', e.target.value)}
                          className={errors.field_1_name ? 'border-destructive' : ''}
                        />
                      </Field>
                    </div>
                    <div className="col-span-2">
                      <Field label="Offer Format" required>
                        <Select
                          value={form.field_1_format}
                          onValueChange={v => set('field_1_format', v as OfferFormat)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {OFFER_FORMATS.map(f => (
                              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>
                </FormSection>

                {/* Section 2: Outcome */}
                <FormSection title="Outcome & Promise" step="02">
                  <Field
                    label="What does it do? What's the core outcome?"
                    required
                    hint="Be specific. Not 'helps people lose weight' — 'helps 40+ women lose 20lbs in 16 weeks without cutting carbs'."
                    error={errors.field_2_outcome}
                  >
                    <Textarea
                      placeholder="Describe the specific transformation or result your offer delivers…"
                      rows={3}
                      value={form.field_2_outcome}
                      onChange={e => set('field_2_outcome', e.target.value)}
                      className={cn('resize-none', errors.field_2_outcome && 'border-destructive')}
                    />
                  </Field>
                </FormSection>

                {/* Section 3: Persona */}
                <FormSection title="Ideal Buyer" step="03">
                  <Field
                    label="Who is this for? Describe your ideal buyer."
                    required
                    hint="Include: their job/situation, what they've tried, what keeps them stuck."
                    error={errors.field_3_persona}
                  >
                    <Textarea
                      placeholder="e.g. VP-level corporate professionals aged 38–52 who want to monetise their expertise as consultants…"
                      rows={3}
                      value={form.field_3_persona}
                      onChange={e => set('field_3_persona', e.target.value)}
                      className={cn('resize-none', errors.field_3_persona && 'border-destructive')}
                    />
                  </Field>
                </FormSection>

                {/* Section 4: Pricing */}
                <FormSection title="Pricing" step="04">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Field label="Price" required error={errors.field_4_price}>
                        <Input
                          placeholder="e.g. 997"
                          value={form.field_4_price}
                          onChange={e => set('field_4_price', e.target.value)}
                          className={errors.field_4_price ? 'border-destructive' : ''}
                        />
                      </Field>
                    </div>
                    <div>
                      <Field label="Currency">
                        <Select
                          value={form.field_4_currency}
                          onValueChange={v => set('field_4_currency', v as CurrencyCode)}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <div className="col-span-3">
                      <Field label="Upsell / Premium Tier" hint="Optional — if you have or plan one">
                        <Input
                          placeholder="e.g. VIP Day at $4,997 — hands-on implementation"
                          value={form.field_4_upsell}
                          onChange={e => set('field_4_upsell', e.target.value)}
                        />
                      </Field>
                    </div>
                  </div>
                </FormSection>

                {/* Section 5: Proof */}
                <FormSection title="Proof & Credibility" step="05">
                  <Field
                    label="What proof or credibility do you have?"
                    hint="Client results, case studies, credentials, platform size, years of experience. Leave empty if pre-launch."
                  >
                    <Textarea
                      placeholder="e.g. 47 clients. Average first client lands within 90 days. Jennifer K. made $12,500 on Day 47…"
                      rows={3}
                      value={form.field_5_proof}
                      onChange={e => set('field_5_proof', e.target.value)}
                      className="resize-none"
                    />
                  </Field>
                </FormSection>

                {/* Section 6: Mechanism */}
                <FormSection title="Unique Mechanism" step="06">
                  <Field
                    label="What's unique about HOW your offer delivers results?"
                    required
                    hint="The named system, framework, or approach that makes you different. Not 'coaching' — the specific thing you do."
                    error={errors.field_6_mechanism}
                  >
                    <Textarea
                      placeholder="e.g. The Expertise Extraction Framework — a 3-phase system that identifies your top 5 billable skill clusters and packages them into a $7,500+ consulting offer…"
                      rows={3}
                      value={form.field_6_mechanism}
                      onChange={e => set('field_6_mechanism', e.target.value)}
                      className={cn('resize-none', errors.field_6_mechanism && 'border-destructive')}
                    />
                  </Field>
                </FormSection>

                {/* Section 7: Traffic */}
                <FormSection title="Traffic & Acquisition" step="07">
                  <Field
                    label="Where will you drive traffic from?"
                    required
                    hint="Select all that apply."
                    error={errors.field_7_channels}
                  >
                    <div className="flex flex-wrap gap-2 mt-1">
                      {TRAFFIC_CHANNELS.map(ch => {
                        const active = form.field_7_channels.includes(ch);
                        return (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => toggleChannel(ch)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                              active
                                ? 'bg-primary/10 border-primary/40 text-primary'
                                : 'bg-background border-border text-muted-foreground hover:border-border/80 hover:text-foreground',
                            )}
                          >
                            {active && <X className="inline w-2.5 h-2.5 mr-1 -mt-0.5" />}
                            {ch}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <div className="mt-4">
                    <Field label="Traffic detail" hint="Any additional context on your current traffic situation.">
                      <Textarea
                        placeholder="e.g. Running $50/day Meta campaigns to a lead capture page. 3% opt-in rate, mostly 35–55 female audience…"
                        rows={2}
                        value={form.field_7_detail}
                        onChange={e => set('field_7_detail', e.target.value)}
                        className="resize-none"
                      />
                    </Field>
                  </div>
                </FormSection>

                {/* Section 8: Challenge */}
                <FormSection title="Primary Challenge" step="08">
                  <Field
                    label="What's the #1 challenge or goal right now?"
                    hint="This helps the intelligence engine prioritise the right strategies."
                  >
                    <Textarea
                      placeholder="e.g. Launching for the first time. Want to validate the offer before spending on ads…"
                      rows={2}
                      value={form.field_8_challenge}
                      onChange={e => set('field_8_challenge', e.target.value)}
                      className="resize-none"
                    />
                  </Field>
                </FormSection>

              </div>

              {/* Submit */}
              <div className="px-6 py-5 bg-muted/20 border-t border-border">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full h-12 text-sm font-bold gap-2 tracking-wide"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running Intelligence Engine…
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Build My Revenue Blueprint
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Takes ~60 seconds · Dual-AI analysis · Results saved to your workspace
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProcessingOverlay
        visible={isSubmitting}
        currentStep={processingStep}
        progress={progress}
      />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormSection({
  title,
  step,
  children,
}: {
  title: string;
  step: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 font-mono tracking-wider">
          {step}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </Label>
      {hint && <p className="text-xs text-muted-foreground/70 leading-relaxed -mt-0.5">{hint}</p>}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
