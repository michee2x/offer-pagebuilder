import Link from "next/link";

export const metadata = {
  title: "Copy Engine | OfferIQ Docs",
  description: "Learn how to use OfferIQ's Copy Engine to generate, edit, and regenerate conversion-focused sales copy.",
};

export default function CopyEnginePage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-5">
          Copy & Content
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Copy Engine</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          AI-written sales copy that&apos;s rooted in your Intelligence Report. Every headline, hook, and call-to-action is derived from the pain points, messaging angles, and conversion hooks the AI identified for your specific audience.
        </p>
      </div>

      {/* What is it */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What the Copy Engine generates</h2>
        <p className="text-white/60 leading-relaxed mb-5">
          The Copy Engine creates a complete sales document for your offer — not a generic template, but copy woven from your actual intelligence data. You get a full, scrollable document that includes:
        </p>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="divide-y divide-white/[0.05]">
            {[
              { section: "Hero headline + subheadline", desc: "A primary headline using the highest-scoring hook from your conversion library, with a subheadline that reinforces the core transformation." },
              { section: "Problem agitation block", desc: "Three to five paragraphs that articulate your audience's pain points with precision — in the language they use to describe it themselves." },
              { section: "Solution introduction", desc: "The bridge from problem to your offer, positioning you as the only logical next step." },
              { section: "Benefits breakdown", desc: "Each key benefit reframed as a customer outcome, not a feature list." },
              { section: "Social proof section", desc: "Placeholder testimonial blocks and proof elements structured around your ideal testimonial type." },
              { section: "Objection handling", desc: "Pre-emptive answers to the top objections your audience has, derived from the persona psychological profile." },
              { section: "Pricing & offer stack", desc: "Your price point framed using the value stacking and anchoring strategies from the Monetization Strategy tab." },
              { section: "Call-to-action blocks", desc: "Three to five CTAs placed at psychologically optimal points throughout the document." },
              { section: "FAQ section", desc: "AI-generated FAQs addressing the specific questions your audience asks before buying." },
            ].map((item) => (
              <div key={item.section} className="px-5 py-4 flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-2" />
                <div>
                  <p className="text-white/80 font-medium text-sm mb-1">{item.section}</p>
                  <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The editor */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">The copy editor</h2>
        <p className="text-white/60 leading-relaxed mb-5">
          Your copy loads into a rich text editor (powered by Tiptap) that feels like a premium writing app. You can edit any text directly — click any sentence and start typing.
        </p>
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
            <p className="text-white font-semibold mb-3">Section-level regeneration</p>
            <p className="text-white/55 text-sm leading-relaxed">
              Hover over any section heading to reveal the <strong className="text-white/70">↺ Regenerate</strong> button. Clicking it replaces just that section with a fresh AI-written version — without touching the rest of your document. This is the fastest way to A/B test different angles.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
            <p className="text-white font-semibold mb-3">Custom components in the editor</p>
            <p className="text-white/55 text-sm leading-relaxed mb-3">
              The copy editor supports special embedded components that the AI can inject into the document:
            </p>
            <div className="space-y-2">
              {[
                { tag: "<insight>", desc: "A highlighted callout box used to emphasize a key insight or statistic." },
                { tag: "<reference>", desc: "A footnote-style reference block citing market data or social proof." },
              ].map((c) => (
                <div key={c.tag} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <code className="text-blue-400 font-mono text-xs shrink-0 mt-0.5">{c.tag}</code>
                  <p className="text-white/50 text-sm">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to use */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Generating copy from scratch</h2>
        <div className="space-y-3">
          {[
            "Open your funnel from the dashboard.",
            'Navigate to the Copy tab in the left sidebar, or click "Create Sales Copy" from your Intelligence Report.',
            "If copy hasn't been generated yet, click Generate Copy. The AI will stream the full document in real time.",
            "Once complete, read through the document and make direct edits using the rich text editor.",
            "Hover over any section to regenerate just that part.",
            "Use the Export button (top right) to copy the entire document as plain text or Markdown.",
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

      {/* Tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Getting the best results</h2>
        <div className="space-y-3">
          {[
            {
              title: "High-quality intelligence = high-quality copy",
              desc: "Copy quality is directly proportional to how specific your offer analysis inputs were. If headlines feel generic, go back to Offer Analysis and add more detail to your audience and USP fields.",
            },
            {
              title: "Use the messaging angle matrix",
              desc: "Your Intelligence Report's Messaging Angle Matrix lists multiple campaign angles. Regenerate your Hero section multiple times to explore different angles, then keep the one that resonates most.",
            },
            {
              title: "Don't over-edit before testing",
              desc: "The AI copy is built on conversion psychology. Trust it and run traffic before rewriting from scratch. Edit, yes — but test before you gut it.",
            },
          ].map((tip) => (
            <div key={tip.title} className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <p className="text-white font-semibold text-sm mb-2">{tip.title}</p>
              <p className="text-white/55 text-sm leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nav */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link href="/docs/intelligence" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Intelligence Report</Link>
        <Link href="/docs/email-sequences" className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">Email Sequences →</Link>
      </div>
    </article>
  );
}
