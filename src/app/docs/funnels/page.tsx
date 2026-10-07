import Link from "next/link";

export const metadata = {
  title: "Funnel Management | OfferIQ Docs",
  description: "Learn how to create, manage, and launch complete funnel systems in OfferIQ.",
};

export default function FunnelsPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-5">
          Build
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Funnel Management</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          A funnel in OfferIQ is the container that holds everything about a single offer: the intelligence report, pages, copy, emails, and traffic strategy — all organized and connected.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What is a funnel?</h2>
        <p className="text-white/60 leading-relaxed mb-5">
          When you analyze an offer, OfferIQ creates a funnel for it inside your active workspace. Think of a funnel as a project folder that contains everything related to that specific offer:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: "🧠", label: "Intelligence Report", desc: "The AI analysis that drives everything" },
            { icon: "📄", label: "Landing Pages", desc: "All pages in the funnel sequence" },
            { icon: "✍️", label: "Sales Copy", desc: "Your complete copy document" },
            { icon: "📧", label: "Email Sequences", desc: "Welcome, nurture, and sales emails" },
            { icon: "📈", label: "Traffic Strategy", desc: "Platform recommendations & campaigns" },
            { icon: "📊", label: "Analytics", desc: "Lead data, conversions, and performance" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <span className="text-xl shrink-0">{item.icon}</span>
              <div>
                <p className="text-white font-medium text-sm">{item.label}</p>
                <p className="text-white/45 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Creating a funnel</h2>
        <p className="text-white/60 leading-relaxed mb-5">
          Funnels are created automatically when you run an offer analysis. But you can also start a new funnel manually:
        </p>
        <div className="space-y-3">
          {[
            'From the dashboard, click "New Funnel" in the top right.',
            'Give it a name and select the workspace it belongs to.',
            'Click "Create Funnel" — you\'ll be taken directly to the Offer Analysis form to start building intelligence.',
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
        <h2 className="text-2xl font-bold text-white mb-4">Funnel dashboard overview</h2>
        <p className="text-white/60 leading-relaxed mb-5">
          Inside each funnel, the left sidebar gives you access to every component. Here&apos;s what each section does:
        </p>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="divide-y divide-white/[0.05]">
            {[
              { nav: "Overview", desc: "Visual funnel flow with page thumbnails, conversion estimates, and system health indicators." },
              { nav: "Intelligence", desc: "Your full Intelligence Report — the source of truth for all generated content." },
              { nav: "Pages / Builder", desc: "Visual editor for all pages in the funnel. Add, remove, and reorder pages." },
              { nav: "Copy", desc: "Your full sales copy document with in-line editing and section regeneration." },
              { nav: "Email", desc: "All email sequences. View by sequence type or by individual email." },
              { nav: "Traffic", desc: "Your traffic intelligence report, platform strategy, and active campaigns." },
              { nav: "Analytics", desc: "Real-time metrics: visitors, opt-ins, sales, email performance." },
              { nav: "Settings", desc: "Funnel name, domain, integrations, and deletion." },
            ].map((item) => (
              <div key={item.nav} className="px-5 py-3.5 flex items-start gap-4">
                <p className="text-white/80 font-medium text-sm w-28 shrink-0">{item.nav}</p>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Archiving & deleting funnels</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
            <p className="text-white font-medium text-sm mb-1.5">Archive a funnel</p>
            <p className="text-white/55 text-sm">Removes it from your active dashboard view but preserves all data. Accessible from the Archived section in workspace settings.</p>
          </div>
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/[0.04]">
            <p className="text-red-400 font-medium text-sm mb-1.5">Delete a funnel</p>
            <p className="text-white/55 text-sm">Permanently deletes the funnel and all associated pages, copy, emails, and analytics. This cannot be undone. Published pages are taken offline immediately.</p>
          </div>
        </div>
      </section>

      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link href="/docs/page-builder" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Page Builder</Link>
        <Link href="/docs/traffic-intelligence" className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">Traffic Intelligence →</Link>
      </div>
    </article>
  );
}
