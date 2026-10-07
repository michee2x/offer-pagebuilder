import Link from "next/link";

export const metadata = {
  title: "Plans & Pricing | OfferIQ Docs",
  description: "Compare OfferIQ plans, understand what's included, and learn how to upgrade or manage your subscription.",
};

export default function BillingPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/50 text-xs font-semibold uppercase tracking-wider mb-5">
          Billing
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Plans & Pricing</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          OfferIQ offers three plans designed for different stages of growth — from solo creators to agencies running dozens of client funnels.
        </p>
      </div>

      {/* Plan comparison */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Plan comparison</h2>
        <div className="space-y-4">
          {[
            {
              name: "Starter",
              price: "Free",
              color: "white",
              highlight: false,
              desc: "Get familiar with OfferIQ. Build one offer and see the full intelligence report before committing.",
              features: [
                "1 workspace",
                "1 offer analysis",
                "Full intelligence report",
                "Copy Engine (limited exports)",
                "1 landing page",
                "Community support",
              ],
              cta: "Start free",
              href: "/signup",
            },
            {
              name: "Pro",
              price: "$79/mo",
              color: "blue",
              highlight: true,
              desc: "For serious creators and small businesses ready to build and launch complete funnel systems.",
              features: [
                "5 workspaces",
                "Unlimited offer analyses",
                "Full intelligence reports",
                "Copy Engine (unlimited exports)",
                "Page Builder (unlimited pages)",
                "Email sequence generator",
                "Traffic intelligence",
                "Custom domain connections",
                "Analytics dashboard",
                "Priority email support",
              ],
              cta: "Get Pro",
              href: "/checkout-now",
            },
            {
              name: "Unlimited (BYOK)",
              price: "$197/mo",
              color: "purple",
              highlight: false,
              desc: "For power users and agencies who want unlimited everything with their own AI API keys.",
              features: [
                "Everything in Pro",
                "Unlimited workspaces",
                "BYOK — use your own AI API keys",
                "Agency sub-accounts",
                "White-label options",
                "Unlimited team seats",
                "AppSumo LTD compatible",
                "Dedicated account support",
              ],
              cta: "Get Unlimited",
              href: "/checkout-now",
            },
          ].map(({ name, price, color, highlight, desc, features, cta, href }) => (
            <div
              key={name}
              className={`rounded-2xl border p-6 ${
                highlight
                  ? "border-brand-blue/40 bg-brand-blue/[0.06]"
                  : "border-white/[0.08] bg-white/[0.02]"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-bold text-lg">{name}</p>
                    {highlight && (
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-brand-blue/20 text-brand-blue border border-brand-blue/30">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed max-w-sm">{desc}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p
                    className={`text-2xl font-bold ${
                      color === "blue"
                        ? "text-brand-blue"
                        : color === "purple"
                        ? "text-purple-400"
                        : "text-white"
                    }`}
                  >
                    {price}
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 mb-5">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/55">
                    <span
                      className={
                        color === "blue"
                          ? "text-brand-blue"
                          : color === "purple"
                          ? "text-purple-400"
                          : "text-emerald-400"
                      }
                    >
                      ✓
                    </span>
                    {f}
                  </div>
                ))}
              </div>
              <Link
                href={href}
                className={`inline-flex items-center px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  highlight
                    ? "bg-gradient-to-r from-brand-blue to-brand-purple text-black hover:opacity-90"
                    : "border border-white/10 text-white/70 hover:border-white/20 hover:text-white"
                }`}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Managing subscription */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Managing your subscription</h2>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="divide-y divide-white/[0.05]">
            {[
              { action: "Upgrade your plan", how: "Settings → Billing → Upgrade. Takes effect immediately. You're billed the prorated difference." },
              { action: "Downgrade your plan", how: "Settings → Billing → Change Plan. Takes effect at the end of your current billing period." },
              { action: "Cancel your subscription", how: "Settings → Billing → Cancel. Access continues until the end of your paid period. Your data is preserved." },
              { action: "Update payment method", how: "Settings → Billing → Payment Methods. All billing is processed via Stripe." },
              { action: "View invoices", how: "Settings → Billing → Invoice History. Download PDF invoices for any past payment." },
            ].map((item) => (
              <div key={item.action} className="px-5 py-4 flex items-start gap-4">
                <p className="text-white/80 font-medium text-sm w-44 shrink-0">{item.action}</p>
                <p className="text-white/50 text-sm leading-relaxed">{item.how}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AppSumo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">AppSumo Lifetime Deal</h2>
        <p className="text-white/60 leading-relaxed mb-4">
          If you purchased OfferIQ through AppSumo, your license is automatically applied to your account at signup. Use the same email address you used on AppSumo.
        </p>
        <div className="p-4 rounded-xl bg-blue-500/[0.07] border border-blue-500/20">
          <p className="text-blue-300 text-sm">
            Having trouble with your AppSumo license?{" "}
            <a href="mailto:support@ofiq.app" className="underline hover:text-blue-200">
              Contact support
            </a>{" "}
            with your AppSumo order number and email.
          </p>
        </div>
      </section>

      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link href="/docs/agency" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Agency Features</Link>
        <Link href="/docs/payments" className="text-brand-blue hover:text-brand-blue text-sm font-medium transition-colors">Payments FAQ →</Link>
      </div>
    </article>
  );
}
