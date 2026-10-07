import Link from "next/link";

export const metadata = {
  title: "Agency Features | OfferIQ Docs",
  description: "Learn how to use OfferIQ's agency mode to manage multiple clients and sub-accounts.",
};

export default function AgencyPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-5">
          Workspace & Settings · Pro Feature
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Agency Features</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          Run a marketing agency or manage offers for multiple clients? OfferIQ&apos;s Agency Mode lets you create and manage sub-accounts — each with their own isolated workspace, branding, and offer systems.
        </p>
      </div>

      {/* What is agency mode */}
      <section className="mb-12">
        <div className="p-5 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] mb-8">
          <p className="text-amber-300 font-semibold mb-2">Who this is for</p>
          <p className="text-amber-200/70 text-sm leading-relaxed">
            Agency Mode is designed for freelancers, marketing agencies, and consultants who build and manage offer systems for multiple clients. Each client gets their own isolated account — they can log in, see their data, and collaborate, without ever seeing your other clients&apos; work.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">How sub-accounts work</h2>
        <div className="space-y-3">
          {[
            { title: "One master account", desc: "Your agency account (the owner) manages billing, plan limits, and sub-account creation." },
            { title: "Isolated sub-accounts", desc: "Each client gets their own login, their own workspace(s), and sees only their data. They cannot see each other." },
            { title: "Shared plan quota", desc: "Your plan's workspace and generation limits are shared across all sub-accounts. The Unlimited (BYOK) plan is recommended for agencies." },
            { title: "Full OfferIQ access", desc: "Sub-account users get the full OfferIQ product — offer analysis, copy engine, page builder, email sequences, and traffic intelligence." },
          ].map((item) => (
            <div key={item.title} className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <p className="text-white font-semibold text-sm mb-2">{item.title}</p>
              <p className="text-white/55 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Creating sub-accounts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Creating a sub-account</h2>
        <div className="space-y-3">
          {[
            'Navigate to Settings → Agency in the sidebar.',
            'Click "Add Sub-Account".',
            "Enter the client's name and email address.",
            "OfferIQ sends them an invitation email with a secure setup link.",
            "Once they set a password, their account is live and linked to yours.",
            "You can view, manage, and switch into any sub-account from the Agency dashboard.",
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

      {/* Managing clients */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Managing client accounts</h2>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="divide-y divide-white/[0.05]">
            {[
              { action: "Switch into a client account", desc: "From Agency dashboard → click the client → click 'Enter Account'. You&apos;ll see their workspace exactly as they do." },
              { action: "Revoke access", desc: "Click the three-dot menu on a sub-account → Revoke Access. Their login will stop working immediately. Their data is retained." },
              { action: "Delete a sub-account", desc: "Permanently removes the account and all associated data. This cannot be undone. The client is notified via email." },
              { action: "Transfer ownership", desc: "Sub-accounts can be detached and transferred to a standalone plan if a client wants to manage their own billing." },
            ].map((item) => (
              <div key={item.action} className="px-5 py-4">
                <p className="text-white/80 font-medium text-sm mb-1.5">{item.action}</p>
                <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Billing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Billing for agencies</h2>
        <div className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
          <p className="text-white/60 text-sm leading-relaxed">
            You pay a single subscription that covers all your sub-accounts. The <strong className="text-white/80">Unlimited (BYOK)</strong> plan is strongly recommended for agencies — unlimited workspaces, unlimited generations, and your AI API costs are separate from your OfferIQ subscription. Most agencies bill AI API usage through to clients or absorb it as part of their retainer.
          </p>
          <Link href="/docs/billing" className="inline-block mt-3 text-amber-400 hover:text-amber-300 text-sm transition-colors">
            See plan comparison →
          </Link>
        </div>
      </section>

      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link href="/docs/byok" className="text-white/40 hover:text-white/70 text-sm transition-colors">← API Keys (BYOK)</Link>
        <Link href="/docs/billing" className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">Billing & Plans →</Link>
      </div>
    </article>
  );
}
