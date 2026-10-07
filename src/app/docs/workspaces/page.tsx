import Link from "next/link";

export const metadata = {
  title: "Workspaces | OfferIQ Docs",
  description: "Understand how OfferIQ workspaces work and how to organize your offers, funnels, and campaigns.",
};

export default function WorkspacesPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/50 text-xs font-semibold uppercase tracking-wider mb-5">
          Workspace & Settings
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Workspaces</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          Workspaces are isolated environments for each of your offers, businesses, or clients. Everything — funnels, pages, emails, copy, and analytics — lives inside a workspace.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What&apos;s inside a workspace</h2>
        <p className="text-white/60 leading-relaxed mb-5">Each workspace contains its own:</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Offer analyses & intelligence reports",
            "Funnels & page structure",
            "Generated landing pages",
            "Sales copy documents",
            "Email sequences",
            "Traffic intelligence reports",
            "Analytics & lead data",
            "Campaign tracking",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <span className="text-amber-400 text-sm">✓</span>
              <p className="text-white/60 text-sm">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Creating a workspace</h2>
        <div className="space-y-3">
          {[
            "From the dashboard, click the workspace name in the top-left corner to open the Workspace Switcher.",
            'Click "New Workspace".',
            "Enter a name (e.g., the product name or client name). This is for your reference only — visitors never see it.",
            'Click "Create". You\'re immediately switched into the new workspace.',
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
        <h2 className="text-2xl font-bold text-white mb-4">Workspace limits by plan</h2>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="grid grid-cols-4 text-xs font-semibold text-white/30 uppercase tracking-widest px-5 py-3 border-b border-white/[0.06]">
            <span>Plan</span>
            <span>Workspaces</span>
            <span>Funnels/WS</span>
            <span>Team seats</span>
          </div>
          {[
            { plan: "Starter", ws: "1", funnels: "3", seats: "1" },
            { plan: "Pro", ws: "5", funnels: "Unlimited", seats: "3" },
            { plan: "Unlimited (BYOK)", ws: "Unlimited", funnels: "Unlimited", seats: "Unlimited" },
          ].map(({ plan, ws, funnels, seats }) => (
            <div key={plan} className="grid grid-cols-4 px-5 py-3.5 border-b border-white/[0.04] last:border-0">
              <span className="text-white/80 font-medium text-sm">{plan}</span>
              <span className="text-white/55 text-sm">{ws}</span>
              <span className="text-white/55 text-sm">{funnels}</span>
              <span className="text-white/55 text-sm">{seats}</span>
            </div>
          ))}
        </div>
        <p className="text-white/35 text-xs mt-3">
          Need more?{" "}
          <Link href="/docs/billing" className="text-amber-400 hover:underline">
            See all plan details →
          </Link>
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Switching workspaces</h2>
        <p className="text-white/60 leading-relaxed">
          Click the workspace name in the top-left of the sidebar to open the Workspace Switcher. All your workspaces are listed there. Click any to switch instantly — no page reload needed.
        </p>
      </section>

      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link href="/docs/analytics" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Analytics</Link>
        <Link href="/docs/byok" className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">API Keys (BYOK) →</Link>
      </div>
    </article>
  );
}
