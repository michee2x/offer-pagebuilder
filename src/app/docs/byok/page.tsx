import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const metadata = {
  title: "API Keys (BYOK) | OfferIQ Docs",
  description: "How to connect your own Anthropic or OpenAI API key to OfferIQ's Unlimited plan.",
};

const PLATFORMS = [
  {
    name: "Anthropic (Claude)",
    emoji: "",
    color: "blue",
    prefix: "sk-ant-…",
    steps: [
      "Go to console.anthropic.com and sign in or create a free account.",
      'Navigate to Settings → API Keys and click "Create Key".',
      "Name it (e.g., OfferIQ) and copy the key — it starts with sk-ant-…",
      'In OfferIQ, open Settings → AI & Intelligence, paste it in the Anthropic API Key field, then click "Save Keys".',
    ],
    links: [
      { label: "Anthropic Console", url: "https://console.anthropic.com/settings/keys" },
      { label: "Official Docs", url: "https://docs.anthropic.com/en/api/getting-started" },
      { label: "Claude Pricing", url: "https://www.anthropic.com/pricing" },
    ],
    models: ["claude-sonnet-4-5 (Structural Analysis)", "claude-opus-4 (Strategic Analysis)"],
    note: "Claude is the primary AI for OfferIQ. If you only set one key, set this one.",
  },
  {
    name: "OpenAI (GPT-4)",
    emoji: "",
    color: "blue",
    prefix: "sk-…",
    steps: [
      "Go to platform.openai.com and sign in or create an account.",
      'Navigate to API Keys in the left sidebar and click "Create new secret key".',
      "Name it OfferIQ and copy the key — it starts with sk-…",
      'In OfferIQ, open Settings → AI & Intelligence, paste it in the OpenAI API Key field, then click "Save Keys".',
    ],
    links: [
      { label: "OpenAI Platform", url: "https://platform.openai.com/api-keys" },
      { label: "Official Docs", url: "https://platform.openai.com/docs/api-reference/authentication" },
      { label: "OpenAI Pricing", url: "https://openai.com/pricing" },
    ],
    models: ["gpt-4o (fallback / supplemental tasks)"],
    note: "Used as a fallback or for specific tasks where GPT-4 outperforms Claude.",
  },
];

export default function ByokPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/50 text-xs font-semibold uppercase tracking-wider mb-5">
          Workspace & Settings
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">API Keys (BYOK)</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          On the Unlimited plan, you use your own AI provider API keys instead of consuming monthly credits. This gives you unlimited generations at the cost of your actual API usage — typically far cheaper at scale.
        </p>
      </div>

      {/* What is BYOK */}
      <section className="mb-10">
        <div className="p-5 rounded-2xl border border-brand-blue/25 bg-brand-blue/10">
          <div className="flex items-start gap-4">
            <span className="text-2xl shrink-0">🔑</span>
            <div>
              <p className="text-brand-blue font-semibold mb-2">Bring Your Own Key (BYOK)</p>
              <p className="text-brand-blue/70 text-sm leading-relaxed">
                BYOK is exclusive to the <strong className="text-brand-blue">Unlimited plan</strong>. Instead of OfferIQ charging per AI generation, you pay your AI provider directly — you only pay for what you use. Most users spend $5–$40/month on AI API costs even with heavy usage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform setup */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Setting up your API keys</h2>
        <div className="space-y-6">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.name}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{platform.emoji}</span>
                  <div>
                    <p className="text-white font-semibold">{platform.name}</p>
                    <p className="text-white/35 text-xs font-mono mt-0.5">Key prefix: {platform.prefix}</p>
                  </div>
                </div>
                <Link
                  href="/settings?tab=ai"
                  className="text-xs text-brand-blue hover:text-brand-blue transition-colors"
                >
                  Add in Settings →
                </Link>
              </div>

              {/* Steps */}
              <div className="px-5 py-5">
                <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">Setup Steps</p>
                <ol className="space-y-3">
                  {platform.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/60">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Models used */}
              <div className="px-5 py-4 border-t border-white/[0.05] bg-white/[0.01]">
                <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-2">Models Used</p>
                {platform.models.map((model) => (
                  <p key={model} className="text-white/50 text-sm font-mono">• {model}</p>
                ))}
              </div>

              {/* Note */}
              <div className="px-5 py-3 border-t border-white/[0.05] bg-white/[0.01]">
                <p className="text-white/40 text-xs italic">{platform.note}</p>
              </div>

              {/* External links */}
              <div className="px-5 py-4 border-t border-white/[0.05] flex flex-wrap gap-2">
                {platform.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-white/70 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
                  >
                    {link.label} <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-5">Common questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "Do I need both keys?",
              a: "No. You only need the Anthropic key to use all core OfferIQ features — Claude is our primary AI. The OpenAI key is optional and used as a fallback for certain tasks.",
            },
            {
              q: "Are my API keys stored securely?",
              a: "Yes. Keys are encrypted at rest using AES-256 and are never logged or exposed in any response. They&apos;re only decrypted at the moment of an API call, then immediately discarded from memory.",
            },
            {
              q: "What will my API usage cost?",
              a: "This depends on how much you use OfferIQ. A full offer analysis + copy + pages + email sequence typically costs $0.50–$2.00 in API credits. Most active users spend $10–$40/month directly with Anthropic.",
            },
            {
              q: "Can I use a free-tier API key?",
              a: "Yes, but Anthropic and OpenAI free tiers have rate limits. If you hit rate limit errors, either upgrade your API plan or wait a few minutes and retry.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <p className="text-white font-semibold text-sm mb-2">{q}</p>
              <p className="text-white/55 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <Link href="/docs/workspaces" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Workspaces</Link>
        <Link href="/docs/agency" className="text-brand-blue hover:text-brand-blue text-sm font-medium transition-colors">Agency Features →</Link>
      </div>
    </article>
  );
}
