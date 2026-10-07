import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Quick Start | OfferIQ Docs",
  description: "Get your first AI-generated offer system up and running in under 5 minutes.",
};

export default function QuickStartPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-semibold uppercase tracking-wider mb-5">
          Getting Started
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Quick Start</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          From zero to a fully generated offer system in under 5 minutes. Follow these steps exactly.
        </p>
      </div>

      {/* Prerequisites */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">Before you begin</h2>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] divide-y divide-white/[0.06]">
          {[
            { check: "✅", text: "An active OfferIQ account (free or paid)" },
            { check: "✅", text: "Your offer details ready: product name, price, audience, and key benefits" },
            { check: "", text: "Optional: An Anthropic or OpenAI API key if you're on the Unlimited (BYOK) plan" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3.5 text-sm text-white/60">
              <span className="text-base shrink-0 mt-0.5">{item.check}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
        <p className="text-white/40 text-sm mt-3">
          On the Unlimited plan and no API key yet?{" "}
          <Link href="/docs/byok" className="text-brand-blue hover:underline">
            Set up your API key first →
          </Link>
        </p>
      </section>

      {/* Steps */}
      <section className="mb-12 space-y-6">
        <h2 className="text-xl font-bold text-white mb-5">Step-by-step</h2>

        {[
          {
            n: "1",
            title: "Create a workspace",
            content: (
              <div className="space-y-3 text-white/60 text-sm leading-relaxed">
                <p>Workspaces organize your offers, funnels, and campaigns. Each client or product line gets its own workspace.</p>
                <ol className="space-y-2 list-decimal list-inside">
                  <li>From the dashboard, click <strong className="text-white/80">New Workspace</strong> in the sidebar.</li>
                  <li>Give it a name (e.g., &ldquo;Social Media Mastery Course&rdquo;).</li>
                  <li>Click <strong className="text-white/80">Create</strong>.</li>
                </ol>
              </div>
            ),
          },
          {
            n: "2",
            title: "Analyze your offer",
            content: (
              <div className="space-y-3 text-white/60 text-sm leading-relaxed">
                <p>Navigate to <strong className="text-white/80">Analyze</strong> in the sidebar. Fill in the offer form:</p>
                <ul className="space-y-1.5">
                  {[
                    "Product/service name",
                    "Price point (e.g., $497)",
                    "Target audience (be specific — the more detail, the better the intelligence)",
                    "3–5 key benefits",
                    "Your unique selling proposition (what makes this different)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-brand-blue mt-0.5">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>Click <strong className="text-white/80">Analyze My Offer</strong>. The AI runs two analysis phases (typically 30–60 seconds).</p>
              </div>
            ),
          },
          {
            n: "3",
            title: "Review the Intelligence Report",
            content: (
              <div className="space-y-3 text-white/60 text-sm leading-relaxed">
                <p>Your report is organized into three tabs:</p>
                <div className="space-y-2">
                  {[
                    { tab: "Structural Intelligence", desc: "Offer score, funnel blueprint, platform priority matrix" },
                    { tab: "Strategic Intelligence", desc: "Persona psychology, positioning analysis, conversion hook library" },
                    { tab: "Monetization Strategy", desc: "Product value perception, use case scenarios, master narrative" },
                  ].map((t) => (
                    <div key={t.tab} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-brand-blue font-mono text-xs mt-0.5 shrink-0">[tab]</span>
                      <div>
                        <p className="text-white/80 font-medium text-xs">{t.tab}</p>
                        <p className="text-white/50 text-xs mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p>Read through the report. You can <strong className="text-white/80">regenerate any section</strong> by hovering over a heading and clicking the refresh icon.</p>
              </div>
            ),
          },
          {
            n: "4",
            title: "Generate your system",
            content: (
              <div className="space-y-3 text-white/60 text-sm leading-relaxed">
                <p>At the bottom of the Intelligence Report, click <strong className="text-white/80">Generate Complete System</strong>. OfferIQ will simultaneously build:</p>
                <ul className="space-y-1.5">
                  {[
                    "Sales copy (headlines, body copy, CTAs)",
                    "Landing page(s)",
                    "Email sequence (welcome + nurture + sales)",
                    "Traffic intelligence report",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>You can pause at any step to make edits before continuing.</p>
              </div>
            ),
          },
          {
            n: "5",
            title: "Publish and launch",
            content: (
              <div className="space-y-3 text-white/60 text-sm leading-relaxed">
                <p>Once your system is generated:</p>
                <ol className="space-y-2 list-decimal list-inside">
                  <li>Open the <strong className="text-white/80">Page Builder</strong> to make visual edits and connect your domain.</li>
                  <li>Connect your email service (Mailchimp, ActiveCampaign, etc.) in <strong className="text-white/80">Settings → Integrations</strong>.</li>
                  <li>Connect Stripe for payment processing.</li>
                  <li>Click <strong className="text-white/80">Go Live</strong> from the launch checklist.</li>
                </ol>
                <div className="mt-3 p-3 rounded-lg bg-emerald-500/[0.07] border border-emerald-500/20">
                  <p className="text-emerald-400 text-xs font-medium">🎉 Average time from sign-up to first live funnel: 15 minutes.</p>
                </div>
              </div>
            ),
          },
        ].map((step) => (
          <div key={step.n} className="flex gap-5">
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center font-black text-black text-sm shadow-lg shadow-brand-blue/20">
                {step.n}
              </div>
              <div className="flex-1 w-px bg-white/[0.06]" />
            </div>
            <div className="flex-1 pb-6">
              <h3 className="text-white font-semibold text-base mb-3">{step.title}</h3>
              {step.content}
            </div>
          </div>
        ))}
      </section>

      {/* Next steps */}
      <section>
        <h2 className="text-xl font-bold text-white mb-5">Next steps</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Deep dive: Intelligence Report", href: "/docs/intelligence", desc: "Understand every section of your report" },
            { label: "Copy Engine guide", href: "/docs/copy-engine", desc: "Edit and regenerate your sales copy" },
            { label: "Page Builder guide", href: "/docs/page-builder", desc: "Build and publish landing pages" },
            { label: "BYOK API keys", href: "/docs/byok", desc: "Connect your Anthropic or OpenAI key" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{item.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-brand-blue transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
