import Link from "next/link";

export const metadata = {
  title: "Templates & Blueprints | OfferIQ Docs",
  description: "Use pre-built funnel blueprints and page templates to accelerate your build in OfferIQ.",
};

export default function TemplatesPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-5">
          Build
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Templates & Blueprints</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          Blueprints are pre-built funnel structures for common offer types. Templates are pre-designed page layouts. Both are starting points — OfferIQ&apos;s AI populates them with your specific content.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Funnel Blueprints</h2>
        <p className="text-white/60 leading-relaxed mb-5">
          A blueprint defines the structure and sequence of pages in a funnel. Instead of building from scratch, you pick a blueprint that matches your offer type and the AI builds on top of it using your intelligence data.
        </p>
        <div className="space-y-3">
          {[
            { name: "Lead Magnet Funnel", pages: "Opt-in → Thank You → Email sequence", best: "Building an email list, free resource offers" },
            { name: "Webinar Funnel", pages: "Registration → Confirmation → Replay page", best: "Live or automated webinar offers" },
            { name: "Sales Page Funnel", pages: "Long-form sales page → Order form → Thank You", best: "Direct purchase, courses, consulting packages" },
            { name: "VSL Funnel", pages: "VSL page → Order form → Upsell → Thank You", best: "Video-first offers, higher-ticket products" },
            { name: "Product Launch Funnel", pages: "Opt-in → 4 content pages → Sales → Order → Upsell", best: "Launches with pre-launch content sequences" },
            { name: "Mini-Course Funnel", pages: "Opt-in → Lessons (3–5) → Upgrade offer", best: "Free-to-paid conversions, educational products" },
          ].map(({ name, pages, best }) => (
            <div key={name} className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-white font-semibold">{name}</p>
              </div>
              <p className="text-white/45 text-xs font-mono mb-2">{pages}</p>
              <p className="text-white/55 text-sm">Best for: {best}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Page Templates</h2>
        <p className="text-white/60 leading-relaxed mb-5">
          Inside the Page Builder, you can choose from a library of pre-designed page layouts. Each template is conversion-optimized and fully customizable. Your AI-generated copy is automatically inserted when you apply a template.
        </p>
        <div className="p-4 rounded-xl bg-brand-blue/10 border border-brand-blue/20">
          <p className="text-brand-blue text-sm font-medium mb-1">Pro tip</p>
          <p className="text-brand-blue/60 text-sm">
            The best template is whichever one your AI-generated Intelligence Report recommends in the Funnel Blueprint section. The blueprint already accounts for your audience&apos;s preferred consumption style.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">How to use a blueprint</h2>
        <div className="space-y-3">
          {[
            'From the funnel dashboard, click "Generate Funnel" (in your Intelligence Report).',
            "OfferIQ recommends a blueprint based on your offer type. Accept the recommendation or choose a different one.",
            "The AI generates all pages in the blueprint, pre-populated with your copy and styled with your Theme Builder settings.",
            "Open the Page Builder to review and edit each page individually.",
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

      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link href="/docs/funnels" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Funnel Management</Link>
        <Link href="/docs/traffic-intelligence" className="text-brand-blue hover:text-brand-blue text-sm font-medium transition-colors">Traffic Intelligence →</Link>
      </div>
    </article>
  );
}
