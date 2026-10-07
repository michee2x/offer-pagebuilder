import Link from "next/link";

export const metadata = {
  title: "Offer Analysis | OfferIQ Docs",
  description: "Learn how to use OfferIQ's Offer Analysis to get a deep AI intelligence report on your product or service.",
};

export default function OfferAnalysisPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-5">
          Intelligence & Analysis
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Offer Analysis</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          The foundation of everything in OfferIQ. Before any page gets built or email gets written, AI runs a deep structural and strategic analysis of your offer.
        </p>
      </div>

      {/* What gets analyzed */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What you&apos;ll need</h2>
        <p className="text-white/60 leading-relaxed mb-5">
          Navigate to <strong className="text-white/80">Analyze</strong> in the sidebar. You&apos;ll be prompted to fill in the Offer Details form:
        </p>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden mb-5">
          <div className="px-5 py-3 border-b border-white/[0.06] text-xs font-semibold text-white/30 uppercase tracking-widest">
            Offer Details Form
          </div>
          <div className="divide-y divide-white/[0.05]">
            {[
              { field: "Product / Service Name", tip: "The exact name of what you're selling. E.g. 'Social Media Mastery Course'" },
              { field: "Price Point", tip: "Your selling price. E.g. $497 one-time or $97/month. Be specific." },
              { field: "Target Audience", tip: "Who buys this? The more specific, the better. E.g. 'Female entrepreneurs aged 25–40 selling online services.'" },
              { field: "Key Benefits (3–5)", tip: "What transformation does the customer get? Focus on outcomes, not features." },
              { field: "Unique Selling Proposition", tip: "What makes this different from everything else on the market?" },
            ].map((item) => (
              <div key={item.field} className="px-5 py-4">
                <p className="text-white/80 font-medium text-sm mb-1">{item.field}</p>
                <p className="text-white/45 text-xs leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-blue-500/[0.07] border border-blue-500/20">
          <p className="text-blue-300 text-sm font-medium mb-1">💡 Pro tip: Be specific</p>
          <p className="text-blue-200/60 text-sm leading-relaxed">
            The quality of your intelligence report scales directly with the quality of your inputs. Don&apos;t say &ldquo;business owners&rdquo; — say &ldquo;solo service providers making $5k–$15k/month who want to productize their expertise.&rdquo;
          </p>
        </div>
      </section>

      {/* Analysis phases */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What happens during analysis</h2>
        <p className="text-white/60 leading-relaxed mb-6">
          After you click <strong className="text-white/80">Analyze My Offer</strong>, OfferIQ runs two sequential AI analysis phases, each powered by a different model optimized for that task:
        </p>
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-xs font-bold text-amber-400">1</div>
              <p className="text-white font-semibold">Phase 1 — Structural Intelligence</p>
              <span className="ml-auto text-[10px] text-white/30 font-mono">Claude Sonnet</span>
            </div>
            <ul className="space-y-1.5 text-sm text-white/55">
              {[
                "Offer scoring across 6 dimensions (market viability, audience clarity, pricing fit, USP strength, benefit clarity, scalability)",
                "Funnel structure blueprint — the recommended sequence of pages and touchpoints",
                "Revenue model architecture — pricing tier recommendations",
                "Platform priority matrix — which channels to focus on first",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 shrink-0 mt-0.5">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-xs font-bold text-purple-400">2</div>
              <p className="text-white font-semibold">Phase 2 — Strategic Intelligence</p>
              <span className="ml-auto text-[10px] text-white/30 font-mono">Claude Opus</span>
            </div>
            <ul className="space-y-1.5 text-sm text-white/55">
              {[
                "Persona psychological profile — deep behavioral and motivational analysis of your ideal buyer",
                "Positioning analysis — where you sit in the market and how to reposition for maximum impact",
                "Conversion hook library — 10+ psychological triggers specific to your audience",
                "Messaging angle matrix — multiple campaign angles to test",
                "Master monetization narrative — the through-line story that sells your offer",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-purple-400 shrink-0 mt-0.5">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-white/40 text-sm mt-4">Analysis typically takes 30–90 seconds depending on your plan and API availability.</p>
      </section>

      {/* Offer score */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Understanding your Offer Score</h2>
        <p className="text-white/60 leading-relaxed mb-5">
          Every offer receives a score from 0–100 across six dimensions. This isn&apos;t vanity — it tells you exactly where to strengthen your offer before you invest in traffic.
        </p>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] text-xs font-semibold text-white/30 uppercase tracking-widest">Score Breakdown</div>
          <div className="divide-y divide-white/[0.05]">
            {[
              { dim: "Market Viability", desc: "Is there proven demand? Are people already buying similar things?" },
              { dim: "Audience Clarity", desc: "How well-defined is your target customer? Vague audiences = poor conversion." },
              { dim: "Pricing Fit", desc: "Does your price match the perceived value and what this audience typically pays?" },
              { dim: "USP Strength", desc: "How differentiated are you? A weak USP means competing on price." },
              { dim: "Benefit Clarity", desc: "Are the outcomes of your offer immediately obvious and compelling?" },
              { dim: "Scalability", desc: "Can this offer scale without proportionally increasing your time?" },
            ].map((item) => (
              <div key={item.dim} className="px-5 py-3.5 flex items-start gap-4">
                <p className="text-white/80 font-medium text-sm w-36 shrink-0">{item.dim}</p>
                <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-amber-500/[0.07] border border-amber-500/20">
          <p className="text-amber-300 text-sm">
            <strong>Score 70+:</strong> Strong offer, ready to generate and launch. &nbsp;
            <strong>Score 50–69:</strong> Viable but review the weak dimensions first. &nbsp;
            <strong>Below 50:</strong> Revisit your offer fundamentals before spending on traffic.
          </p>
        </div>
      </section>

      {/* Next */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link href="/docs/quickstart" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Quick Start</Link>
        <Link href="/docs/intelligence" className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">Intelligence Report →</Link>
      </div>
    </article>
  );
}
