"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Zap, Shield, BarChart2, Star, Check, ArrowRight, Globe, Lock, Rocket, Heart,
  Users, TrendingUp, Award, Target, Clock, ChevronRight, CheckCircle, XCircle,
  Sparkles, Layers, DollarSign, Mail, Phone, Play, Eye, Brain, Flame, Crown,
  Gem, Timer, AlertCircle, Lightbulb, ThumbsUp, MessageSquare, Share2, Settings,
  BarChart, PieChart, Activity, Briefcase, BookOpen, Code2, Database, Headphones,
  RefreshCw, Search, Send, ShoppingCart, Tag, Wifi,
  type LucideProps,
} from "lucide-react";
import type { Block, PageSectionProps, LeadCapturePopupBlock } from "@/lib/blocks";

// ─── Icon registry ────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Zap, Shield, BarChart2, Star, Check, ArrowRight, Globe, Lock, Rocket, Heart,
  Users, TrendingUp, Award, Target, Clock, ChevronRight, CheckCircle, XCircle,
  Sparkles, Layers, DollarSign, Mail, Phone, Play, Eye, Brain, Flame, Crown,
  Gem, Timer, AlertCircle, Lightbulb, ThumbsUp, MessageSquare, Share2, Settings,
  BarChart, PieChart, Activity, Briefcase, BookOpen, Code2, Database, Headphones,
  RefreshCw, Search, Send, ShoppingCart, Tag, Wifi,
};

const iconOf = (name?: string, size = 20): React.ReactNode => {
  const C = (name && ICON_MAP[name]) ?? Zap;
  return <C size={size} />;
};

// ─── Utility maps ─────────────────────────────────────────────────────────────

const GAP: Record<string, string> = { sm: "gap-3", md: "gap-6", lg: "gap-10" };
const SPACER_H: Record<string, string> = { sm: "h-8", md: "h-16", lg: "h-24" };
const FLEX_ALIGN: Record<string, string> = { start: "items-start", center: "items-center", end: "items-end" };
const FLEX_JUSTIFY: Record<string, string> = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" };
const TEXT_ALIGN: Record<string, string> = { left: "text-left", center: "text-center", right: "text-right" };

// ─── Countdown (needs state) ──────────────────────────────────────────────────

function CountdownDisplay({ targetHours, style = "minimal" }: { targetHours: number; style?: "minimal" | "bold" }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, targetHours * 3600));

  useEffect(() => {
    const id = setInterval(() => setRemaining(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (style === "bold") {
    return (
      <div className="flex items-center justify-center gap-4">
        {([{ v: h, l: "Hours" }, { v: m, l: "Mins" }, { v: s, l: "Secs" }] as const).map(({ v, l }) => (
          <div key={l} className="flex flex-col items-center gap-1">
            <div className="w-20 h-20 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-4xl font-black tabular-nums">
              {pad(v)}
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest opacity-60">{l}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <p className="font-mono text-3xl font-bold tabular-nums">
      {pad(h)}<span className="opacity-40 mx-1">:</span>{pad(m)}<span className="opacity-40 mx-1">:</span>{pad(s)}
    </p>
  );
}

// ─── Video embed URL normaliser ───────────────────────────────────────────────

function toEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`;
  const vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return `https://player.vimeo.com/video/${vi[1]}`;
  return null;
}

// ─── Lead capture popup (needs state) ────────────────────────────────────────

function LeadCapturePopupWidget({ block }: { block: LeadCapturePopupBlock }) {
  const [open, setOpen]           = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]           = useState(false);
  const [form, setForm]           = useState({ name: '', email: '', phone: '' });
  const [err, setErr]             = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:       form.name,
          email:      form.email,
          phone:      form.phone || undefined,
          domain:     typeof window !== 'undefined' ? window.location.hostname : '',
          sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/',
        }),
      });
      if (!res.ok) throw new Error('submit_failed');
      setDone(true);
    } catch {
      setErr('Something went wrong — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button
        size="lg"
        className="text-base font-semibold px-10 py-6 h-auto"
        onClick={() => setOpen(true)}
      >
        {block.triggerText}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="relative w-full max-w-md bg-card text-card-foreground rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
              aria-label="Close"
            >
              <XCircle size={18} />
            </button>

            {done ? (
              <div className="p-10 flex flex-col items-center gap-5 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{block.successTitle ?? "You're in!"}</h3>
                  <p className="text-sm opacity-70 leading-relaxed">
                    {block.successMessage ?? "Check your inbox — your blueprint is on its way."}
                  </p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <div className="p-8 flex flex-col gap-6">
                <div className="pr-8">
                  <h3 className="text-xl font-bold leading-snug">{block.headline}</h3>
                  {block.subheadline && (
                    <p className="text-sm opacity-70 mt-1.5 leading-relaxed">{block.subheadline}</p>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">First Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {block.collectPhone && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Phone (optional)</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="h-11 rounded-xl border bg-background px-4 text-sm outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  )}

                  {err && <p className="text-sm text-red-500 -mt-1">{err}</p>}

                  <Button
                    type="submit"
                    disabled={submitting}
                    size="lg"
                    className="w-full font-semibold mt-1"
                  >
                    {submitting ? 'Sending...' : block.submitText}
                  </Button>

                  <p className="text-center text-[10px] opacity-30 -mt-1">
                    We respect your privacy. No spam, ever.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Core block renderer ──────────────────────────────────────────────────────

function renderBlock(block: Block, key: string | number): React.ReactNode {
  const k = key;

  switch (block.type) {
    // ── Layout ────────────────────────────────────────────────────────────────

    case "Row":
      return (
        <div key={k} className={cn(
          "flex",
          block.wrap !== false && "flex-wrap",
          FLEX_ALIGN[block.align ?? "center"],
          FLEX_JUSTIFY[block.justify ?? "center"],
          GAP[block.gap ?? "md"],
        )}>
          {block.blocks.map((b, i) => renderBlock(b, `${k}-${i}`))}
        </div>
      );

    case "Col":
      return (
        <div key={k} className={cn(
          "flex flex-col",
          FLEX_ALIGN[block.align ?? "start"],
          GAP[block.gap ?? "md"],
        )}>
          {block.blocks.map((b, i) => renderBlock(b, `${k}-${i}`))}
        </div>
      );

    case "Grid":
      return (
        <div key={k} className={cn(
          "grid grid-cols-1",
          block.cols === 2 && "md:grid-cols-2",
          block.cols === 3 && "sm:grid-cols-2 lg:grid-cols-3",
          block.cols === 4 && "sm:grid-cols-2 lg:grid-cols-4",
          GAP[block.gap ?? "md"],
        )}>
          {block.blocks.map((b, i) => renderBlock(b, `${k}-${i}`))}
        </div>
      );

    case "Card":
      return (
        <div key={k} className={cn(
          "rounded-2xl border bg-card text-card-foreground p-6 flex flex-col gap-4",
          block.accent && "border-primary/40 bg-primary/5",
        )}>
          {block.blocks.map((b, i) => renderBlock(b, `${k}-${i}`))}
        </div>
      );

    // ── Typography ────────────────────────────────────────────────────────────

    case "H1":
      return (
        <h1 key={k} className={cn("text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]", TEXT_ALIGN[block.align ?? "left"])}>
          {block.text}
        </h1>
      );

    case "H2":
      return (
        <h2 key={k} className={cn("text-3xl md:text-4xl font-bold tracking-tight leading-tight", TEXT_ALIGN[block.align ?? "left"])}>
          {block.text}
        </h2>
      );

    case "H3":
      return (
        <h3 key={k} className={cn("text-2xl font-bold leading-snug", TEXT_ALIGN[block.align ?? "left"])}>
          {block.text}
        </h3>
      );

    case "H4":
      return (
        <h4 key={k} className={cn("text-xl font-semibold", TEXT_ALIGN[block.align ?? "left"])}>
          {block.text}
        </h4>
      );

    case "Paragraph": {
      const sizes = { sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl" };
      const weights = { normal: "font-normal", medium: "font-medium", semibold: "font-semibold" };
      return (
        <p key={k} className={cn(
          "leading-relaxed opacity-80",
          sizes[block.size ?? "base"],
          weights[block.weight ?? "normal"],
          TEXT_ALIGN[block.align ?? "left"],
        )}>
          {block.text}
        </p>
      );
    }

    case "Badge":
      return (
        <span key={k} className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase",
          block.variant === "outline" && "border border-current bg-transparent",
          block.variant === "secondary" && "bg-secondary text-secondary-foreground",
          (!block.variant || block.variant === "default") && "bg-primary/20 text-primary",
        )}>
          {block.text}
        </span>
      );

    case "Checklist":
      return (
        <ul key={k} className="flex flex-col gap-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
              <span className="text-base leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      );

    // ── UI atoms ──────────────────────────────────────────────────────────────

    case "Button":
      return (
        <Button
          key={k}
          variant={(block.variant as any) ?? "default"}
          size={(block.size as any) ?? "default"}
          className="text-base font-semibold px-8 py-5 h-auto"
          asChild
        >
          <a href={block.href}>
            {block.icon && <span className="mr-2 inline-flex">{iconOf(block.icon, 18)}</span>}
            {block.text}
          </a>
        </Button>
      );

    case "Divider":
      return <Separator key={k} className="opacity-20" />;

    case "Spacer":
      return <div key={k} className={SPACER_H[block.size ?? "md"]} aria-hidden />;

    case "Icon":
      return (
        <span key={k} className="inline-flex text-primary">
          {iconOf(block.name, block.size === "sm" ? 16 : block.size === "lg" ? 32 : 24)}
        </span>
      );

    // ── Composites ────────────────────────────────────────────────────────────

    case "NavBar":
      return (
        <nav key={k} className="w-full flex items-center justify-between gap-6 px-6 py-4 max-w-7xl mx-auto">
          <span className="font-bold text-xl shrink-0">{block.logo}</span>
          {block.links && block.links.length > 0 && (
            <div className="hidden md:flex items-center gap-6">
              {block.links.map((l, i) => (
                <a key={i} href={l.href} className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity">
                  {l.text}
                </a>
              ))}
            </div>
          )}
          {block.ctaText && (
            <Button asChild size="sm" className="shrink-0">
              <a href={block.ctaHref ?? "#"}>{block.ctaText}</a>
            </Button>
          )}
        </nav>
      );

    case "Footer":
      return (
        <footer key={k} className="w-full flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-8 max-w-7xl mx-auto">
          <span className="font-semibold">{block.logo}</span>
          {block.links && block.links.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {block.links.map((l, i) => (
                <a key={i} href={l.href} className="text-sm opacity-60 hover:opacity-90 transition-opacity">
                  {l.text}
                </a>
              ))}
            </div>
          )}
          <p className="text-sm opacity-50">{block.copy}</p>
        </footer>
      );

    case "FeatureItem":
      return (
        <div key={k} className="flex flex-col gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
            {iconOf(block.icon, 20)}
          </div>
          <h3 className="font-bold text-lg leading-snug">{block.title}</h3>
          <p className="text-sm leading-relaxed opacity-70">{block.description}</p>
        </div>
      );

    case "TestimonialCard": {
      const stars = Math.min(5, Math.max(1, block.stars ?? 5));
      return (
        <div key={k} className="rounded-2xl border bg-card text-card-foreground p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform">
          <div className="flex gap-1">
            {Array.from({ length: stars }).map((_, i) => (
              <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-sm leading-relaxed italic opacity-90">"{block.quote}"</p>
          <div className="flex items-center gap-3 mt-auto pt-2">
            <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
              {block.initials}
            </div>
            <div>
              <p className="font-semibold text-sm">{block.name}</p>
              <p className="text-xs opacity-50">{block.role}</p>
            </div>
          </div>
        </div>
      );
    }

    case "StatItem":
      return (
        <div key={k} className="flex flex-col items-center gap-2 text-center">
          {block.icon && (
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary mb-1">
              {iconOf(block.icon, 18)}
            </div>
          )}
          <span className="text-4xl md:text-5xl font-black tabular-nums">{block.value}</span>
          <span className="text-sm opacity-60 uppercase tracking-widest font-medium">{block.label}</span>
        </div>
      );

    case "PricingTier":
      return (
        <div key={k} className={cn(
          "relative rounded-2xl border p-8 flex flex-col gap-5",
          block.highlighted
            ? "border-primary bg-primary text-primary-foreground shadow-2xl scale-[1.03]"
            : "bg-card text-card-foreground",
        )}>
          {block.highlighted && (
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-background text-foreground rounded-full text-xs font-bold uppercase tracking-widest border shadow">
              Most Popular
            </span>
          )}
          <div>
            <h3 className="text-lg font-bold">{block.name}</h3>
            {block.description && <p className="text-sm opacity-70 mt-1">{block.description}</p>}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black">{block.price}</span>
            {block.period && <span className="opacity-60 text-sm">{block.period}</span>}
          </div>
          <ul className="flex flex-col gap-2.5 flex-1">
            {block.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <CheckCircle
                  size={16}
                  className={cn("mt-0.5 shrink-0", block.highlighted ? "text-primary-foreground/70" : "text-primary")}
                />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Button
            asChild
            variant={block.highlighted ? "secondary" : "default"}
            className="w-full font-semibold mt-2"
          >
            <a href={block.ctaHref}>{block.ctaText}</a>
          </Button>
        </div>
      );

    case "FAQList":
      return (
        <Accordion key={k} type="single" collapsible className="w-full">
          {block.items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-semibold text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed opacity-80">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );

    case "VideoEmbed": {
      const embedUrl = toEmbedUrl(block.url);
      if (!embedUrl) return null;
      return (
        <div key={k} className="w-full rounded-2xl overflow-hidden border shadow-xl aspect-video">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media"
            title="Embedded video"
          />
        </div>
      );
    }

    case "EmailCapture":
      return (
        <form
          key={k}
          onSubmit={e => e.preventDefault()}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
        >
          <input
            type="email"
            placeholder={block.placeholder ?? "Enter your email..."}
            className="flex-1 h-10 rounded-lg border bg-background px-4 text-sm outline-none focus:border-primary transition-colors"
          />
          <Button asChild type="submit">
            <a href={block.buttonHref ?? "#"}>{block.buttonText}</a>
          </Button>
        </form>
      );

    case "LeadCapturePopup":
      return <LeadCapturePopupWidget key={k} block={block} />;

    case "CountdownTimer":
      return (
        <div key={k} className="flex flex-col items-center gap-3">
          <CountdownDisplay targetHours={block.targetHours} style={block.style} />
          <p className="text-xs opacity-50 uppercase tracking-widest font-medium">Offer expires when timer hits zero</p>
        </div>
      );

    case "UpsellOffer":
      return (
        <div key={k} className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto text-center">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">{block.headline}</h1>
            {block.subheadline && (
              <p className="text-lg opacity-80 leading-relaxed">{block.subheadline}</p>
            )}
          </div>
          <div className="flex flex-col items-center gap-1">
            {block.originalPrice && (
              <p className="text-xl line-through opacity-40">{block.originalPrice}</p>
            )}
            <p className="text-5xl font-black text-primary">{block.price}</p>
          </div>
          <Button asChild size="lg" className="text-lg font-bold px-12 py-7 h-auto w-full max-w-sm">
            <a href={block.ctaHref}>{block.ctaText}</a>
          </Button>
          {block.declineText && (
            <a
              href={block.declineHref ?? "/downsell"}
              className="text-sm opacity-40 hover:opacity-70 underline underline-offset-4 transition-opacity"
            >
              {block.declineText}
            </a>
          )}
        </div>
      );

    case "DownsellOffer":
      return (
        <div key={k} className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto text-center">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">{block.headline}</h1>
            {block.subheadline && (
              <p className="text-lg opacity-80 leading-relaxed">{block.subheadline}</p>
            )}
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-5xl font-black text-primary">{block.price}</p>
            {block.paymentText && <p className="text-base opacity-60">{block.paymentText}</p>}
          </div>
          <Button asChild size="lg" className="text-lg font-bold px-12 py-7 h-auto w-full max-w-sm">
            <a href={block.ctaHref}>{block.ctaText}</a>
          </Button>
          {block.declineText && (
            <a
              href={block.declineHref ?? "#"}
              className="text-sm opacity-40 hover:opacity-70 underline underline-offset-4 transition-opacity"
            >
              {block.declineText}
            </a>
          )}
        </div>
      );

    case "ThankYouBlock":
      return (
        <div key={k} className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center">
            <CheckCircle size={40} />
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{block.headline}</h1>
            {block.subheadline && <p className="text-lg opacity-80">{block.subheadline}</p>}
          </div>
          {block.receiptAmount && (
            <div className="rounded-xl border bg-muted px-10 py-5 text-center">
              <p className="text-sm opacity-60 mb-1">Total Charged</p>
              <p className="text-3xl font-black">{block.receiptAmount}</p>
            </div>
          )}
          {block.steps && block.steps.length > 0 && (
            <ol className="flex flex-col gap-3 text-left w-full">
              {block.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-base leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          )}
          {block.ctaText && block.ctaHref && (
            <Button asChild size="lg" className="text-base font-semibold px-8 py-6 h-auto">
              <a href={block.ctaHref}>{block.ctaText}</a>
            </Button>
          )}
        </div>
      );

    default:
      return null;
  }
}

// ─── Theme / layout / padding maps ───────────────────────────────────────────

const THEME_CLS: Record<string, string> = {
  default: "bg-background text-foreground",
  muted:   "bg-muted text-foreground",
  primary: "bg-primary text-primary-foreground",
  card:    "bg-card text-card-foreground",
  dark:    "bg-zinc-950 text-zinc-50",
};

const PADDING_CLS: Record<string, string> = {
  none: "py-0",
  sm:   "py-8",
  md:   "py-16",
  lg:   "py-24",
  xl:   "py-32",
};

const LAYOUT_CLS: Record<string, string> = {
  center: "flex flex-col items-center text-center gap-8",
  left:   "flex flex-col items-start text-left gap-8",
  split:  "grid grid-cols-1 md:grid-cols-2 gap-12 items-center",
};

// ─── Public renderer ──────────────────────────────────────────────────────────

export function PageSectionRenderer({
  theme   = "default",
  layout  = "center",
  padding = "md",
  blocks  = [],
}: PageSectionProps) {
  return (
    <section className={cn("w-full", THEME_CLS[theme] ?? THEME_CLS.default, PADDING_CLS[padding] ?? PADDING_CLS.md)}>
      <div className={cn("w-full max-w-6xl mx-auto px-6", LAYOUT_CLS[layout] ?? LAYOUT_CLS.center)}>
        {blocks.map((block, i) => renderBlock(block, i))}
      </div>
    </section>
  );
}
