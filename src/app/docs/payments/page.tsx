import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Key,
  Webhook,
  Zap,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Payment Integration Guide | OfferIQ",
  description: "Learn how to connect Stripe, Paystack, and PayPal to accept payments on your OfferIQ funnels.",
};

export default function PaymentIntegrationGuidePage() {
  return (
    <div className="min-h-screen bg-[#08080D] text-[#A6A6B3] py-16 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#60A5FA] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <span className="text-xs font-mono text-white/40">Documentation · Payments</span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-[#131826] to-[#0e1118] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-indigo/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Step-by-step Setup Guide
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#F5F5F7] tracking-tight">
              Connecting Payment Gateways &amp; Webhooks
            </h1>
            <p className="text-base text-white/60 max-w-2xl leading-relaxed">
              Everything you need to connect Stripe, Paystack, or PayPal to your OfferIQ funnels and automatically process buyer payments and deliver digital products.
            </p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Stripe Setup", href: "#stripe", icon: "💳", color: "from-violet-500/20 to-indigo-500/20", border: "border-violet-500/20" },
            { title: "Paystack Setup", href: "#paystack", icon: "🏦", color: "from-teal-500/20 to-cyan-500/20", border: "border-teal-500/20" },
            { title: "PayPal Setup", href: "#paypal", icon: "🅿️", color: "from-blue-500/20 to-sky-500/20", border: "border-blue-500/20" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} border ${item.border} hover:border-white/30 transition-all flex items-center justify-between group`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-bold text-white text-sm">{item.title}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </a>
          ))}
        </div>

        {/* Main Content Sections */}
        <div className="space-y-16">
          {/* Section 1: Stripe */}
          <section id="stripe" className="bg-[#131826] border border-white/10 rounded-2xl p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-6">
              <span className="text-3xl">💳</span>
              <div>
                <h2 className="text-2xl font-bold text-white">Stripe Setup Guide</h2>
                <p className="text-xs text-white/50">Accept credit cards, Apple Pay, Google Pay worldwide.</p>
              </div>
            </div>

            <div className="space-y-6 text-sm leading-relaxed">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Option A: One-Click Quick Connect (Recommended)
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-white/70">
                  <li>In your funnel dashboard, go to <strong>Integrations</strong> ➔ <strong>Quick Connect</strong> tab.</li>
                  <li>Click <strong>Connect with Stripe</strong>.</li>
                  <li>Sign in to your Stripe account when redirected and click <strong>Connect</strong>.</li>
                  <li>You will automatically be redirected back to OfferIQ with your Stripe account connected!</li>
                </ol>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Key className="w-4 h-4 text-violet-400" /> Option B: Manual API Keys
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-white/70">
                  <li>Log in to your <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Stripe Dashboard ➔ Developers ➔ API Keys</a>.</li>
                  <li>Copy your <strong>Secret Key</strong> (<code className="bg-white/10 px-1 py-0.5 rounded">sk_live_...</code>) and <strong>Publishable Key</strong> (<code className="bg-white/10 px-1 py-0.5 rounded">pk_live_...</code>).</li>
                  <li>In OfferIQ, go to <strong>Integrations</strong> ➔ <strong>API Keys</strong> tab, expand Stripe, and paste both keys.</li>
                  <li>Toggle <strong>Live Mode</strong> ON and click <strong>Save API Keys</strong>.</li>
                </ol>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Webhook className="w-4 h-4 text-emerald-400" /> Stripe Webhook Setup
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-white/70">
                  <li>In OfferIQ ➔ <strong>Integrations</strong> ➔ <strong>External Checkouts</strong>, copy your Stripe Webhook Endpoint URL.</li>
                  <li>Go to <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Stripe Dashboard ➔ Developers ➔ Webhooks</a> and click <strong>Add Endpoint</strong>.</li>
                  <li>Paste the webhook URL into the <strong>Endpoint URL</strong> field.</li>
                  <li>Select events: <code className="bg-white/10 px-1 py-0.5 rounded">checkout.session.completed</code> and <code className="bg-white/10 px-1 py-0.5 rounded">invoice.paid</code>.</li>
                  <li>After saving, copy the <strong>Signing Secret</strong> (<code className="bg-white/10 px-1 py-0.5 rounded">whsec_...</code>) and paste it into OfferIQ to verify events.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Section 2: Paystack */}
          <section id="paystack" className="bg-[#131826] border border-white/10 rounded-2xl p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-6">
              <span className="text-3xl">🏦</span>
              <div>
                <h2 className="text-2xl font-bold text-white">Paystack Setup Guide</h2>
                <p className="text-xs text-white/50">Accept payments from African customers via local cards, bank transfers, &amp; mobile money.</p>
              </div>
            </div>

            <div className="space-y-6 text-sm leading-relaxed">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Key className="w-4 h-4 text-teal-400" /> Step 1: Obtain Paystack API Keys
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-white/70">
                  <li>Log in to your <a href="https://dashboard.paystack.com" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Paystack Dashboard</a>.</li>
                  <li>Click <strong>Settings</strong> (gear icon in left sidebar) ➔ <strong>API Keys &amp; Webhooks</strong> tab.</li>
                  <li>Make sure the toggle at top right is set to <strong>Live</strong>.</li>
                  <li>Copy your <strong>Live Secret Key</strong> (<code className="bg-white/10 px-1 py-0.5 rounded">sk_live_...</code>) and <strong>Live Public Key</strong> (<code className="bg-white/10 px-1 py-0.5 rounded">pk_live_...</code>).</li>
                </ol>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" /> Step 2: Add Keys to OfferIQ
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-white/70">
                  <li>In your OfferIQ funnel dashboard, navigate to <strong>Integrations</strong> ➔ <strong>API Keys</strong> tab.</li>
                  <li>Expand the <strong>Paystack</strong> gateway section.</li>
                  <li>Paste your <strong>Secret Key</strong> into the Secret Key input field.</li>
                  <li>Paste your <strong>Public Key</strong> into the Public Key input field.</li>
                  <li>Toggle <strong>Live Mode</strong> ON (green) and click <strong>Save API Keys</strong>.</li>
                </ol>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Webhook className="w-4 h-4 text-emerald-400" /> Step 3: Configure Paystack Webhook
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-white/70">
                  <li>In OfferIQ, copy your Paystack Webhook URL:
                    <div className="my-2 bg-black/50 border border-white/10 rounded-lg p-2.5 font-mono text-xs text-emerald-400">
                      https://yourdomain.com/api/webhooks/payments/paystack/[your-funnel-id]
                    </div>
                  </li>
                  <li>Go back to <a href="https://dashboard.paystack.com" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Paystack Dashboard ➔ Settings ➔ API Keys &amp; Webhooks</a>.</li>
                  <li>Find the input labeled <strong>Live Webhook URL</strong>.</li>
                  <li>Paste your OfferIQ Webhook URL into the <strong>Live Webhook URL</strong> field.</li>
                  <li>Click <strong>Save changes</strong> at the bottom of Paystack Settings.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Section 3: PayPal */}
          <section id="paypal" className="bg-[#131826] border border-white/10 rounded-2xl p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-6">
              <span className="text-3xl">🅿️</span>
              <div>
                <h2 className="text-2xl font-bold text-white">PayPal Setup Guide</h2>
                <p className="text-xs text-white/50">Accept PayPal balances and debit/credit card checkout.</p>
              </div>
            </div>

            <div className="space-y-6 text-sm leading-relaxed">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" /> Get PayPal Credentials
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-white/70">
                  <li>Log in to <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">PayPal Developer Portal</a>.</li>
                  <li>Go to <strong>Apps &amp; Credentials</strong> and switch mode to <strong>Live</strong>.</li>
                  <li>Create a new app or select an existing REST API app to view your <strong>Client ID</strong> and <strong>Secret Key</strong>.</li>
                  <li>In OfferIQ ➔ <strong>Integrations</strong> ➔ <strong>API Keys</strong>, paste your PayPal Client ID and Secret Key.</li>
                  <li>Click <strong>Save API Keys</strong>.</li>
                </ol>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Help Banner */}
        <div className="bg-gradient-to-r from-brand-blue/20 via-brand-indigo/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <p className="text-white font-bold text-base">Still need help setting up payments?</p>
              <p className="text-white/50 text-xs">Our AI support assistant is online 24/7 to answer setup questions.</p>
            </div>
          </div>
          <Link
            href="/funnels"
            className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all shrink-0"
          >
            Back to Funnels
          </Link>
        </div>
      </div>
    </div>
  );
}

