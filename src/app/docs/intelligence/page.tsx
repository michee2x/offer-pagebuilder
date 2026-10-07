import Link from "next/link";

export const metadata = {
  title: "Intelligence Report | OfferIQ Docs",
  description: "A deep dive into the OfferIQ Intelligence Report — the AI-powered engine that drives your entire marketing system.",
};

export default function IntelligencePage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-semibold uppercase tracking-wider mb-5">
          Intelligence & Analysis
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Intelligence Report</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          The Intelligence Report is the brain of OfferIQ. It&apos;s not just a summary — it&apos;s a living document that drives every piece of copy, every page, and every email your system generates.
        </p>
      </div>

      {/* Three tabs */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Report structure</h2>
        <p className="text-white/60 leading-relaxed mb-6">
          The report is organized into three major tabs. Each serves a distinct strategic purpose.
        </p>
        <div className="space-y-5">
          {[
            {
              tab: "Structural Intelligence",
              color: "blue",
              icon: "",
              sections: [
                { name: "Offer Score", desc: "A 0–100 score across 6 dimensions (market viability, pricing fit, USP strength, etc.). Each dimension is individually scored with commentary." },
                { name: "Funnel Blueprint", desc: "The AI-recommended funnel structure for your offer type — number of steps, page types (opt-in, VSL, sales page, upsell), and sequencing logic." },
                { name: "Revenue Model Architecture", desc: "Pricing tier recommendations, potential upsell/downsell paths, and subscription vs. one-time analysis." },
                { name: "Platform Priority Matrix", desc: "Which traffic channels to prioritize (e.g., YouTube, Instagram Reels, Google Search, email list) ranked by audience fit and CAC efficiency." },
              ],
            },
            {
              tab: "Strategic Intelligence",
              color: "purple",
              icon: "",
              sections: [
                { name: "Persona Psychological Profile", desc: "A deep behavioral model of your ideal buyer: core fears, aspirations, objections, language patterns, and decision-making triggers." },
                { name: "Positioning Analysis", desc: "Where your offer sits in the competitive landscape and a repositioning strategy to maximize differentiation and perceived value." },
                { name: "Conversion Hook Library", desc: "10+ psychological hooks tailored to your audience — headlines, angles, and emotional triggers that will resonate most." },
                { name: "Messaging Angle Matrix", desc: "Multiple campaign angles to run across channels (e.g., 'transformation story', 'enemy angle', 'social proof angle'). Great for A/B testing." },
              ],
            },
            {
              tab: "Monetization Strategy",
              color: "green",
              icon: "💰",
              sections: [
                { name: "Core Value Perception", desc: "How your target audience perceives the value of what you offer — and how to frame your price to feel like a no-brainer." },
                { name: "Real-World Use Cases", desc: "Specific scenarios showing how a customer's life or business changes after buying. Used to write social proof and testimonial prompts." },
                { name: "Master Monetization Narrative", desc: "The complete through-line story that ties your offer's origin, the customer's problem, and the transformation together into a compelling arc." },
              ],
            },
          ].map(({ tab, color, icon, sections }) => (
            <div
              key={tab}
              className={`rounded-xl border overflow-hidden ${
                color === "blue"
                  ? "border-brand-blue/20 bg-brand-blue/10"
                  : color === "purple"
                  ? "border-purple-500/20 bg-purple-500/[0.04]"
                  : "border-emerald-500/20 bg-emerald-500/[0.04]"
              }`}
            >
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <h3
                  className={`font-bold text-base ${
                    color === "blue"
                      ? "text-brand-blue"
                      : color === "purple"
                      ? "text-purple-300"
                      : "text-emerald-300"
                  }`}
                >
                  {tab}
                </h3>
              </div>
              <div className="divide-y divide-white/[0.05]">
                {sections.map((s) => (
                  <div key={s.name} className="px-5 py-4">
                    <p className="text-white/80 font-semibold text-sm mb-1.5">{s.name}</p>
                    <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section regeneration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Regenerating sections</h2>
        <p className="text-white/60 leading-relaxed mb-4">
          Every heading in the Intelligence Report has an interactive hover state. You don&apos;t have to re-run the full analysis to update a single section.
        </p>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] divide-y divide-white/[0.06]">
          <div className="px-5 py-4">
            <p className="text-white/80 font-medium text-sm mb-1.5">How to regenerate a section</p>
            <ol className="space-y-2 text-sm text-white/55 list-decimal list-inside">
              <li>Hover over any section heading (e.g., &ldquo;Revenue Model&rdquo;).</li>
              <li>Click the <strong className="text-white/70">↺ Regenerate</strong> icon that appears to the right.</li>
              <li>The AI rewrites only that block — the rest of the report is untouched.</li>
              <li>New content streams in directly, replacing the old content seamlessly.</li>
            </ol>
          </div>
          <div className="px-5 py-4">
            <p className="text-white/80 font-medium text-sm mb-1.5">Info tooltips</p>
            <p className="text-sm text-white/55 leading-relaxed">
              Click the <strong className="text-white/70">ⓘ Info</strong> icon next to any heading to see a tooltip explaining the strategic purpose of that section and how it influences your generated content.
            </p>
          </div>
        </div>
      </section>

      {/* Theme Builder */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Theme Builder</h2>
        <p className="text-white/60 leading-relaxed mb-5">
          Inside the Intelligence Report, scroll down to find the <strong className="text-white/80">Theme Builder</strong> card. This lets you set the visual identity for your generated pages and emails.
        </p>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="divide-y divide-white/[0.06]">
            {[
              { feature: "Color Palette", desc: "Customize Background, Foreground, Primary, Secondary, Accent, and Border colors using interactive swatches." },
              { feature: "Typography", desc: "Choose from premium Google Fonts (Inter, Outfit, Playfair, DM Sans, and more). See changes render live on a typography preview." },
              { feature: "Auto-Tune Palette", desc: "Click Regenerate to instantly get a new cohesive color palette. Great for quickly exploring different brand feels." },
              { feature: "Auto-Save", desc: "All theme changes save automatically to your funnel's intelligence profile and are applied to all generated pages." },
            ].map((item) => (
              <div key={item.feature} className="px-5 py-4 flex items-start gap-4">
                <p className="text-white/80 font-medium text-sm w-36 shrink-0">{item.feature}</p>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Action buttons */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Action buttons</h2>
        <p className="text-white/60 leading-relaxed mb-5">
          At the bottom of your Intelligence Report, four action buttons let you launch into specific creation flows — each pre-loaded with the relevant intelligence from your report.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Generate Funnel", desc: "Uses the Funnel Blueprint to build your page structure and flow.", href: "/docs/funnels" },
            { label: "Create Sales Copy", desc: "Uses the conversion hooks and messaging angles to write persuasive copy.", href: "/docs/copy-engine" },
            { label: "Build Email Sequence", desc: "Uses persona psychology to write emails with the right tone and triggers.", href: "/docs/email-sequences" },
            { label: "Generate Traffic Intelligence", desc: "Uses the Platform Priority Matrix to build your traffic strategy.", href: "/docs/traffic-intelligence" },
          ].map((btn) => (
            <Link
              key={btn.label}
              href={btn.href}
              className="group p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
            >
              <p className="text-white font-medium text-sm mb-1.5">{btn.label}</p>
              <p className="text-white/45 text-xs leading-relaxed">{btn.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Nav */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link href="/docs/offer-analysis" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Offer Analysis</Link>
        <Link href="/docs/copy-engine" className="text-brand-blue hover:text-brand-blue text-sm font-medium transition-colors">Copy Engine →</Link>
      </div>
    </article>
  );
}
