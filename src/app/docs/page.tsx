import Link from "next/link";
import { ExternalLink, Key, BookOpen, Zap, Shield, ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getSession } from "@/auth";

export const metadata = {
  title: "Documentation | OfferIQ",
  description:
    "Learn how to use OfferIQ, integrate your own API keys (BYOK), and get the most out of your plan.",
};

const PLATFORMS = [
  {
    name: "Anthropic (Claude)",
    logo: "🤖",
    steps: [
      "Go to console.anthropic.com and sign in or create a free account.",
      'Navigate to Settings → API Keys and click "Create Key".',
      "Copy your key — it starts with sk-ant-…",
      'In OfferIQ, open Settings → AI & Intelligence, paste it in the Anthropic API Key field, then click "Save Keys".',
    ],
    links: [
      { label: "Anthropic Console", url: "https://console.anthropic.com/settings/keys" },
      { label: "Official API Docs", url: "https://docs.anthropic.com/en/api/getting-started" },
      { label: "Claude Pricing", url: "https://www.anthropic.com/pricing" },
    ],
  },
  {
    name: "OpenAI (ChatGPT / GPT-4)",
    logo: "🧠",
    steps: [
      "Go to platform.openai.com and sign in or create an account.",
      'Navigate to API Keys in the left sidebar and click "Create new secret key".',
      "Give it a name (e.g., OfferIQ) and copy the key — it starts with sk-…",
      'In OfferIQ, open Settings → AI & Intelligence, paste it in the OpenAI API Key field, then click "Save Keys".',
    ],
    links: [
      { label: "OpenAI Platform", url: "https://platform.openai.com/api-keys" },
      { label: "Official API Docs", url: "https://platform.openai.com/docs/api-reference/authentication" },
      { label: "OpenAI Pricing", url: "https://openai.com/pricing" },
    ],
  },
];

const QUICK_LINKS = [
  {
    icon: Key,
    label: "Integrate API Key",
    href: "/settings?tab=ai",
    desc: "Connect your Anthropic or OpenAI key",
  },
  {
    icon: Zap,
    label: "Create an Offer",
    href: "/analyze",
    desc: "Start generating with AI",
  },
  {
    icon: Shield,
    label: "Billing & Plan",
    href: "/settings?tab=billing",
    desc: "Manage your subscription",
  },
  {
    icon: BookOpen,
    label: "Payments FAQ",
    href: "/docs/payments",
    desc: "Questions about billing & refunds",
  },
];

export default async function DocsPage() {
  const session = await getSession();

  const pageContent = (
    <div className="min-h-screen bg-[#030712]">
      {/* Hero */}
      <div className="border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-6 text-xs text-white/50 font-medium uppercase tracking-wider">
            <BookOpen className="w-3 h-3" /> Documentation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            OfferIQ Help Center
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            Guides, integration instructions, and everything you need to get the most out of OfferIQ.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">

        {/* Quick Links */}
        <section>
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_LINKS.map(({ icon: Icon, label, href, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 group-hover:text-white transition-colors shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* BYOK Guide */}
        <section id="byok">
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
                🔑
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Bring Your Own Key (BYOK)</h2>
                <p className="text-white/60 text-sm mt-1 leading-relaxed">
                  You&apos;re on the Unlimited plan, which means you use your own AI provider API keys
                  instead of monthly credits. Follow the steps below for your preferred platform.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {PLATFORMS.map((platform) => (
              <div
                key={platform.name}
                className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{platform.logo}</span>
                    <h3 className="text-white font-semibold">{platform.name}</h3>
                  </div>
                  <Link
                    href="/settings?tab=ai"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    Add key in Settings <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Steps */}
                <div className="px-6 py-5">
                  <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">
                    Setup Steps
                  </p>
                  <ol className="space-y-3">
                    {platform.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-white/70">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                          {i + 1}
                        </span>
                        <span className="pt-0.5 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* External links */}
                <div className="px-6 py-4 border-t border-white/5 flex flex-wrap gap-2">
                  {platform.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
                    >
                      {link.label} <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-white/30 text-sm">
            Can&apos;t find what you&apos;re looking for?{" "}
            <a href="mailto:support@ofiq.app" className="text-blue-400 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  // Authenticated users get the full Sidebar + Topbar layout
  if (session?.user) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#030712]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar breadcrumbs={[{ label: "Docs", href: "/docs" }]} />
          <main className="flex-1 overflow-y-auto pt-16">{pageContent}</main>
        </div>
      </div>
    );
  }

  // Public / unauthenticated visitors
  return pageContent;
}
