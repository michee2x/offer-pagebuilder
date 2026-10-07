import Link from "next/link";

export const metadata = {
  title: "Core Concepts | OfferIQ Docs",
  description: "Understand the key mental models behind OfferIQ — how everything fits together.",
};

export default function ConceptsPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-semibold uppercase tracking-wider mb-5">
          Getting Started
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Core Concepts</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          Before diving into specific features, here are the key ideas that make OfferIQ different from other marketing tools — and why the workflow is designed the way it is.
        </p>
      </div>

      <div className="space-y-8">
        {[
          {
            title: "1. Intelligence First",
            body: `Most funnel builders start with a template. OfferIQ starts with intelligence.

Before any page is built or any email is written, the AI runs a deep analysis of your offer, your market, and your audience. This analysis becomes the "source of truth" that every other piece of content references.

This means your sales copy isn't generic — it's built from the specific psychological profile of your buyer. Your email sequence isn't templated — it's paced around the emotional triggers your audience actually responds to.`,
          },
          {
            title: "2. Workspaces → Funnels → Components",
            body: `OfferIQ uses a three-level hierarchy:

Workspaces: The top level. Each workspace represents a business, brand, or client. Think of it as a separate account within your account.

Funnels: Inside a workspace, each funnel is one offer system. A funnel contains the intelligence report, all pages, all copy, all emails, and all traffic strategy for a single offer.

Components: Inside a funnel, you work with individual components — the Copy Engine, Page Builder, Email Sequences, and Traffic Intelligence. Each component draws from the same intelligence report.`,
          },
          {
            title: "3. The Intelligence Report drives everything",
            body: `The Intelligence Report is not a summary you read and then set aside. It is an active data source.

When you generate copy, the AI reads your Conversion Hook Library and Messaging Angle Matrix to write headlines. When it builds your email sequence, it references the Persona Psychological Profile to set the tone and pacing. When it recommends traffic channels, it uses the Platform Priority Matrix.

If something in your generated content feels off, go back to the Intelligence Report first — the fix is usually there.`,
          },
          {
            title: "4. Generate, then customize",
            body: `OfferIQ's philosophy is: generate first, customize second.

Don't try to manually craft every headline before generating. Let the AI produce a first draft based on your intelligence data, then refine. The AI's first pass, informed by your specific data, will almost always be more effective than starting from a blank page.

Section-level regeneration exists precisely for this — you can keep 90% of what was generated and regenerate just the pieces that don't feel right.`,
          },
          {
            title: "5. Credits vs. BYOK",
            body: `OfferIQ has two operating modes depending on your plan:

Credit-based (Starter & Pro): Each AI generation (analysis, copy, email, etc.) consumes credits from your monthly allowance. Credits reset at the start of each billing cycle.

BYOK — Bring Your Own Key (Unlimited): You connect your own Anthropic or OpenAI API keys. There are no credit limits — you pay your AI provider directly for usage. This is far more cost-effective at scale.`,
          },
        ].map(({ title, body }) => (
          <div key={title} className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <h2 className="text-white font-bold text-xl mb-4">{title}</h2>
            <div className="space-y-3">
              {body.split("\n\n").map((para, i) => (
                <p key={i} className={`text-sm leading-relaxed ${para.includes(":") && para.length < 60 ? "text-white/80 font-medium" : "text-white/55"}`}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link href="/docs/quickstart" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Quick Start</Link>
        <Link href="/docs/offer-analysis" className="text-brand-blue hover:text-brand-blue text-sm font-medium transition-colors">Offer Analysis →</Link>
      </div>
    </article>
  );
}
