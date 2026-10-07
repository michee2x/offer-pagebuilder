import Link from "next/link";

export const metadata = {
  title: "Analytics & Tracking | OfferIQ Docs",
  description: "Monitor funnel performance, leads, email metrics, and campaign ROI in OfferIQ's analytics dashboard.",
};

export default function AnalyticsPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-5">
          Traffic & Growth
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Analytics & Tracking</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          Monitor the real-time performance of every component in your funnel — from page visits to email open rates to actual sales — from a single dashboard.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What you can track</h2>
        <div className="space-y-3">
          {[
            { category: "Page Analytics", metrics: ["Unique visitors", "Page views", "Time on page", "Bounce rate", "CTA click-through rate"] },
            { category: "Lead Capture", metrics: ["Total leads collected", "Opt-in rate (visitors → leads)", "Lead source breakdown", "Lead capture by day/week"] },
            { category: "Email Performance", metrics: ["Open rate per email", "Click rate per email", "Unsubscribe rate", "Sequence completion rate"] },
            { category: "Sales & Revenue", metrics: ["Total sales", "Revenue by product", "Conversion rate (leads → buyers)", "Average order value"] },
          ].map(({ category, metrics }) => (
            <div key={category} className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <p className="text-white font-semibold text-sm mb-3">{category}</p>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {metrics.map((m) => (
                  <div key={m} className="flex items-center gap-2 text-sm text-white/50">
                    <span className="text-cyan-400">·</span>
                    {m}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Setting up tracking</h2>
        <p className="text-white/60 leading-relaxed mb-5">
          OfferIQ automatically tracks visitors and events on any page published through the Page Builder. For leads and sales, you&apos;ll need to connect your integrations:
        </p>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="divide-y divide-white/[0.05]">
            {[
              { item: "Page view tracking", how: "Automatic. No setup needed for pages hosted on OfferIQ or your connected domain." },
              { item: "Lead tracking", how: "Connect your email service provider in Settings → Integrations. Opt-ins are synced automatically." },
              { item: "Sales tracking", how: "Connect Stripe in Settings → Integrations. Each payment is recorded with the lead's email and funnel source." },
              { item: "UTM parameters", how: "Append UTM tags to your funnel URLs. OfferIQ parses and displays source breakdown in the analytics dashboard." },
            ].map((item) => (
              <div key={item.item} className="px-5 py-4 flex items-start gap-4">
                <p className="text-white/80 font-medium text-sm w-36 shrink-0">{item.item}</p>
                <p className="text-white/50 text-sm leading-relaxed">{item.how}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Accessing analytics</h2>
        <p className="text-white/60 leading-relaxed">
          Navigate to any funnel and click <strong className="text-white/80">Analytics</strong> in the funnel sidebar. The dashboard shows a 7-day overview by default. Use the date picker to change the range. All metrics update in real time.
        </p>
      </section>

      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link href="/docs/traffic-intelligence" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Traffic Intelligence</Link>
        <Link href="/docs/workspaces" className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">Workspaces →</Link>
      </div>
    </article>
  );
}
