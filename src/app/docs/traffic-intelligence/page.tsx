import Link from "next/link";

export const metadata = {
  title: "Traffic Intelligence | OfferIQ Docs",
  description: "Learn how OfferIQ generates a tailored traffic strategy based on your offer and market data.",
};

export default function TrafficIntelligencePage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-5">
          Traffic & Growth
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Traffic Intelligence</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          A tailored traffic strategy built around your offer, your audience, and your budget. No generic advice — every recommendation is derived from the Platform Priority Matrix in your Intelligence Report.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What Traffic Intelligence generates</h2>
        <div className="space-y-3">
          {[
            { section: "Platform Priority Matrix", desc: "Ranks traffic sources (Meta Ads, Google Search, YouTube, TikTok, organic SEO, email, etc.) by fit for your specific offer and audience. Tells you exactly where to start and why." },
            { section: "Budget Allocation Plan", desc: "Given your stated ad budget, OfferIQ recommends how to split it across channels during testing phase vs. scaling phase." },
            { section: "Campaign Angle Recommendations", desc: "Specific ad angles pulled from your Intelligence Report's Messaging Angle Matrix — ready to hand to a copywriter or use as ad creative briefs." },
            { section: "Targeting Recommendations", desc: "Suggested audience segments, interest stacks, and lookalike strategies for paid platforms." },
            { section: "Content Calendar (Organic)", desc: "If your budget favors organic traffic, OfferIQ generates a 30-day content calendar with topic ideas, posting cadence, and platform-specific format guidance." },
          ].map((item) => (
            <div key={item.section} className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <p className="text-white font-semibold text-sm mb-2">{item.section}</p>
              <p className="text-white/55 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Generating your traffic strategy</h2>
        <div className="space-y-3">
          {[
            'From your Intelligence Report, click "Generate Traffic Intelligence" — or navigate to Traffic Intelligence in the sidebar.',
            "Enter your monthly ad budget (can be $0 for organic-only strategies).",
            "Review the Platform Priority Matrix. The top-ranked platforms are your immediate focus.",
            "Read each channel's recommended strategy, including what ad formats to use, what audiences to target, and what angles to run.",
            'Click "Create Campaign" to start building a campaign for a specific platform.',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-7 h-7 shrink-0 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                {i + 1}
              </div>
              <p className="text-white/60 text-sm leading-relaxed pt-1">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Platform guidance</h2>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="divide-y divide-white/[0.05]">
            {[
              { platform: "Meta Ads", best: "B2C offers, impulse purchases, broad audiences, lifestyle and transformation offers" },
              { platform: "Google Search", best: "High-intent purchases, problem-aware audiences, professional services" },
              { platform: "YouTube Ads", best: "Complex offers requiring education, high-ticket products, VSL-style content" },
              { platform: "TikTok / Reels", best: "Younger demographics, viral product potential, lower-priced front-end offers" },
              { platform: "Organic SEO", best: "Long-term plays, low-competition niches, educational content-driven funnels" },
              { platform: "Email / Partnerships", best: "Offers with proven conversion rates, audiences with existing email lists" },
            ].map((item) => (
              <div key={item.platform} className="px-5 py-3.5 flex items-start gap-4">
                <p className="text-white/80 font-medium text-sm w-32 shrink-0">{item.platform}</p>
                <p className="text-white/50 text-sm leading-relaxed">{item.best}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/35 text-xs mt-3">OfferIQ's AI ranks and weights these for your specific offer — the above is general guidance only.</p>
      </section>

      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link href="/docs/funnels" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Funnel Management</Link>
        <Link href="/docs/analytics" className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">Analytics →</Link>
      </div>
    </article>
  );
}
