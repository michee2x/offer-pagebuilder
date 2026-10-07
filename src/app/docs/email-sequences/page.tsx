import Link from "next/link";

export const metadata = {
  title: "Email Sequences | OfferIQ Docs",
  description: "Learn how OfferIQ generates and manages AI-written email sequences tuned to your audience's psychology.",
};

export default function EmailSequencesPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold uppercase tracking-wider mb-5">
          Copy & Content
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Email Sequences</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          AI-generated email sequences written in the voice your audience trusts and triggered at the moments they&apos;re most receptive. Every email is informed by the persona psychology in your Intelligence Report.
        </p>
      </div>

      {/* Sequence types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Sequence types</h2>
        <p className="text-white/60 leading-relaxed mb-6">
          OfferIQ generates different sequence types depending on where the subscriber is in your funnel:
        </p>
        <div className="space-y-3">
          {[
            {
              type: "Welcome Sequence",
              emails: "3–5 emails",
              color: "blue",
              desc: "Sent immediately after a subscriber opts in. Sets expectations, builds trust, tells your origin story, and transitions into your first soft pitch. Typically sent over days 1–5.",
            },
            {
              type: "Nurture Sequence",
              emails: "5–7 emails",
              color: "blue",
              desc: "Long-form value emails that educate and position you as the authority. Each email addresses a specific pain point and subtly links back to your offer as the solution.",
            },
            {
              type: "Sales Sequence",
              emails: "5–7 emails",
              color: "orange",
              desc: "The conversion push. Opens with a big promise, builds urgency through social proof and scarcity, handles objections, and closes with a deadline-driven CTA.",
            },
            {
              type: "Re-engagement Sequence",
              emails: "3 emails",
              color: "purple",
              desc: "Sent to cold subscribers or leads who didn't convert. Designed to reignite interest or trigger an unsubscribe — keeping your list healthy and engaged.",
            },
          ].map(({ type, emails, color, desc }) => (
            <div
              key={type}
              className={`p-5 rounded-xl border ${
                color === "blue" ? "border-brand-blue/20 bg-brand-blue/10" :
                color === "blue" ? "border-blue-500/20 bg-blue-500/[0.04]" :
                color === "orange" ? "border-brand-purple/20 bg-brand-purple/[0.04]" :
                "border-purple-500/20 bg-purple-500/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3 mb-2.5">
                <p className="text-white font-semibold">{type}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                  color === "blue" ? "bg-brand-blue/15 text-brand-blue border-brand-blue/25" :
                  color === "blue" ? "bg-blue-500/15 text-blue-400 border-blue-500/25" :
                  color === "orange" ? "bg-brand-purple/15 text-orange-400 border-brand-purple/25" :
                  "bg-purple-500/15 text-purple-400 border-purple-500/25"
                }`}>{emails}</span>
              </div>
              <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Generating sequences */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Generating your sequence</h2>
        <div className="space-y-3">
          {[
            'From your funnel dashboard, click "Build Email Sequence" — or navigate to Email Sequences in the sidebar.',
            "Select the sequence type you want to generate (Welcome, Nurture, Sales, or Re-engagement).",
            "Review the AI-suggested send schedule. You can adjust the timing between emails.",
            "Click Generate. The AI writes all emails in the sequence simultaneously, streaming them in.",
            "Review each email. Every subject line, preview text, and body is fully editable.",
            "To regenerate a single email, hover over it and click the ↺ Regenerate button.",
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

      {/* Anatomy of each email */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Anatomy of each generated email</h2>
        <p className="text-white/60 leading-relaxed mb-5">Each email in your sequence includes:</p>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="divide-y divide-white/[0.05]">
            {[
              { field: "Subject line", desc: "A/B testable — each email gets a primary subject and an alternative." },
              { field: "Preview text", desc: "The 80–100 character snippet shown in email clients after the subject line." },
              { field: "Opening hook", desc: "The first line — designed to be impossible to ignore." },
              { field: "Body copy", desc: "The main content, calibrated to the sequence type (value-heavy for nurture, urgency-driven for sales)." },
              { field: "CTA", desc: "A single, clear call-to-action — linked to your offer page or the next step in the funnel." },
              { field: "P.S. line", desc: "A post-script that reinforces the CTA or adds a second emotional trigger." },
            ].map((item) => (
              <div key={item.field} className="px-5 py-3.5 flex items-start gap-4">
                <p className="text-white/80 font-medium text-sm w-28 shrink-0">{item.field}</p>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Sending your emails</h2>
        <p className="text-white/60 leading-relaxed mb-5">
          OfferIQ generates and manages your email copy. To actually send emails to your list, connect your email service provider via <strong className="text-white/80">Settings → Integrations</strong>.
        </p>
        <div className="p-4 rounded-xl bg-brand-blue/10 border border-brand-blue/20">
          <p className="text-brand-blue text-sm font-medium mb-1">Supported email providers</p>
          <p className="text-brand-blue/60 text-sm">Mailchimp, ActiveCampaign, ConvertKit, and more via Zapier integration. Direct API integrations are being added regularly — check Settings → Integrations for the current list.</p>
        </div>
      </section>

      {/* Nav */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link href="/docs/copy-engine" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Copy Engine</Link>
        <Link href="/docs/page-builder" className="text-brand-blue hover:text-brand-blue text-sm font-medium transition-colors">Page Builder →</Link>
      </div>
    </article>
  );
}
