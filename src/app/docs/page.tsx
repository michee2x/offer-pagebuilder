import Link from "next/link";
import { ArrowRight, Zap, Brain, FileText, Mail, BarChart2, Globe } from "lucide-react";

export const metadata = {
  title: "Introduction | OfferIQ Docs",
  description:
    "Learn how OfferIQ turns any idea into a complete, revenue-ready offer — strategy, copy, funnel, and traffic plan built in one session.",
};

const FEATURES = [
  {
    icon: Brain,
    color: "amber",
    title: "Offer Analysis & Intelligence",
    desc: "Input your offer details and receive a deep AI-generated intelligence report covering market positioning, persona psychology, offer scoring, and conversion hooks.",
    href: "/docs/offer-analysis",
  },
  {
    icon: FileText,
    color: "blue",
    title: "Copy Engine",
    desc: "Generate conversion-focused sales copy driven by your intelligence report. Every word is rooted in the pain points and messaging angles the AI discovered.",
    href: "/docs/copy-engine",
  },
  {
    icon: Globe,
    color: "purple",
    title: "Page Builder",
    desc: "Build high-converting landing pages and sales pages visually. No code needed — publish directly to your custom domain.",
    href: "/docs/page-builder",
  },
  {
    icon: Mail,
    color: "green",
    title: "Email Sequences",
    desc: "AI-written email sequences tuned to your audience's psychology. Welcome flows, nurture sequences, and sales campaigns all in one place.",
    href: "/docs/email-sequences",
  },
  {
    icon: Zap,
    color: "orange",
    title: "Traffic Intelligence",
    desc: "Get an AI-generated traffic strategy with platform priorities, budget allocation, and campaign recommendations tailored to your offer.",
    href: "/docs/traffic-intelligence",
  },
  {
    icon: BarChart2,
    color: "cyan",
    title: "Analytics & Tracking",
    desc: "Monitor funnel performance, email open rates, lead capture, and campaign ROI from a single live dashboard.",
    href: "/docs/analytics",
  },
];

const colorMap: Record<string, string> = {
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
};

const STEPS = [
  {
    n: "1",
    title: "Analyze your offer",
    desc: "Enter your product name, price, audience, and key benefits. OfferIQ's AI runs a deep structural and strategic analysis.",
    href: "/docs/offer-analysis",
  },
  {
    n: "2",
    title: "Review the Intelligence Report",
    desc: "Read your offer score, funnel blueprint, persona psychology, and messaging angle matrix. Everything downstream is powered by this.",
    href: "/docs/intelligence",
  },
  {
    n: "3",
    title: "Generate your system",
    desc: "With one click, AI creates your sales copy, landing pages, email sequence, and traffic strategy — simultaneously.",
    href: "/docs/copy-engine",
  },
  {
    n: "4",
    title: "Customize & publish",
    desc: "Make quick edits in the Page Builder and Copy Engine. Connect your domain and email service, then go live.",
    href: "/docs/page-builder",
  },
];

export default function DocsIndexPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 py-12 md:py-16">

      {/* Page header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-5">
          Getting Started
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
          Welcome to OfferIQ
        </h1>
        <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
          OfferIQ turns any idea into a complete, revenue-ready offer — strategy, copy, funnel, and traffic plan built in one session. This guide will show you exactly how everything works.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href="/docs/quickstart"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Quick Start (5 min) <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/docs/offer-analysis"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 font-medium text-sm hover:border-white/20 hover:text-white transition-all"
          >
            Start with Offer Analysis
          </Link>
        </div>
      </div>

      {/* What is OfferIQ */}
      <section className="mb-14">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7">
          <h2 className="text-xl font-bold text-white mb-3">What is OfferIQ?</h2>
          <p className="text-white/60 leading-relaxed mb-4">
            OfferIQ is an AI-first marketing platform that does the heavy lifting of offer creation for you. Instead of starting with a blank canvas, you start with a deep <strong className="text-white/80">Intelligence Report</strong> — a comprehensive AI analysis of your offer, your audience, and your market.
          </p>
          <p className="text-white/60 leading-relaxed mb-4">
            That intelligence report then drives everything else: the sales copy it writes, the funnel structure it recommends, the email sequences it builds, and the traffic strategy it generates. Everything is connected and purposeful.
          </p>
          <div className="mt-5 p-4 rounded-xl bg-amber-500/[0.07] border border-amber-500/20">
            <p className="text-amber-300 text-sm font-medium">
              💡 The core idea: AI handles 80% of the work. You control the key decisions.
            </p>
          </div>
        </div>
      </section>

      {/* The 4-step flow */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-white mb-2">How it works</h2>
        <p className="text-white/50 mb-7">Four phases take you from offer idea to live marketing system.</p>
        <div className="space-y-4">
          {STEPS.map((step) => (
            <Link
              key={step.n}
              href={step.href}
              className="group flex items-start gap-5 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
            >
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-black text-sm shadow-lg shadow-amber-500/20">
                {step.n}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-base mb-1">{step.title}</p>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-amber-400 shrink-0 mt-1 transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-white mb-2">Explore all features</h2>
        <p className="text-white/50 mb-7">Everything OfferIQ can do, documented in detail.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, color, title, desc, href }) => (
            <Link
              key={href}
              href={href}
              className="group p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-white font-semibold mb-2">{title}</p>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Help */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-white font-semibold mb-1">Need help?</p>
          <p className="text-white/50 text-sm">
            Can&apos;t find what you&apos;re looking for? Our team responds within a few hours.
          </p>
        </div>
        <a
          href="mailto:support@ofiq.app"
          className="shrink-0 px-4 py-2 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:border-white/20 hover:text-white transition-all"
        >
          support@ofiq.app
        </a>
      </div>
    </article>
  );
}
