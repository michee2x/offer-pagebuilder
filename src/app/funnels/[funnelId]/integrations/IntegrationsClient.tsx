"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { saveIntegrations, savePaymentIntegrations } from "./actions";
import { CreditCard, Copy, Check, ExternalLink, ArrowRight, Webhook, Zap, Eye, EyeOff, Shield, ShieldCheck, AlertTriangle, Key } from "lucide-react";

interface PaymentIntegration {
  gateway: string;
  credentials: any;
  is_live: boolean;
}

interface Props {
  funnelId: string;
  workspaceId: string;
  initialMakeUrl: string;
  initialZapierUrl: string;
  initialCheckoutUrls: Record<string, string>;
  initialPaymentIntegrations: PaymentIntegration[];
  subdomain: string;
  pagePaths: string[];
}

const PAGE_LABELS: Record<string, string> = {
  "/": "Sales Page",
  "/upsell": "Upsell Page",
  "/downsell": "Downsell Page",
  "/thankyou": "Thank You Page",
};

const GATEWAY_CONFIG: Record<string, {
  label: string;
  color: string;
  gradient: string;
  borderColor: string;
  icon: string;
  fields: { key: string; label: string; placeholder: string; required: boolean }[];
  description: string;
}> = {
  stripe: {
    label: "Stripe",
    color: "text-violet-400",
    gradient: "from-violet-500/20 to-indigo-500/20",
    borderColor: "border-violet-500/20",
    icon: "💳",
    description: "Accept credit cards, Apple Pay, Google Pay and more.",
    fields: [
      { key: "secretKey", label: "Secret Key", placeholder: "sk_live_... or sk_test_...", required: true },
      { key: "publishableKey", label: "Publishable Key", placeholder: "pk_live_... or pk_test_...", required: true },
      { key: "webhookSecret", label: "Webhook Signing Secret", placeholder: "whsec_...", required: false },
    ]
  },
  paypal: {
    label: "PayPal",
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-sky-500/20",
    borderColor: "border-blue-500/20",
    icon: "🅿️",
    description: "Accept PayPal payments and debit/credit cards.",
    fields: [
      { key: "clientId", label: "Client ID", placeholder: "Your PayPal Client ID", required: true },
      { key: "secretKey", label: "Secret Key", placeholder: "Your PayPal Secret Key", required: true },
      { key: "webhookId", label: "Webhook ID", placeholder: "Your PayPal Webhook ID", required: false },
    ]
  },
  paystack: {
    label: "Paystack",
    color: "text-teal-400",
    gradient: "from-teal-500/20 to-cyan-500/20",
    borderColor: "border-teal-500/20",
    icon: "🏦",
    description: "Accept payments from African customers via cards, bank transfers, and mobile money.",
    fields: [
      { key: "secretKey", label: "Secret Key", placeholder: "sk_live_... or sk_test_...", required: true },
    ]
  }
};

type Tab = "connect" | "apikeys" | "webhooks" | "checkouts";

export function IntegrationsClient({ funnelId, workspaceId, initialMakeUrl, initialZapierUrl, initialCheckoutUrls, initialPaymentIntegrations, subdomain, pagePaths }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("connect");
  const [makeUrl, setMakeUrl] = useState(initialMakeUrl);
  const [zapierUrl, setZapierUrl] = useState(initialZapierUrl);
  const [checkoutUrls, setCheckoutUrls] = useState<Record<string, string>>(initialCheckoutUrls || {});
  const [loading, setLoading] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  useEffect(() => {
    // Check if we just returned from Stripe Connect
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("stripe_connected") === "true") {
        toast.success("Successfully connected to Stripe!");
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Payment gateway state
  const buildInitialCredentials = () => {
    const creds: Record<string, any> = {};
    for (const gateway of Object.keys(GATEWAY_CONFIG)) {
      const existing = initialPaymentIntegrations.find(i => i.gateway === gateway);
      creds[gateway] = existing?.credentials || {};
    }
    return creds;
  };
  const buildInitialLiveStatus = () => {
    const statuses: Record<string, boolean> = {};
    for (const gateway of Object.keys(GATEWAY_CONFIG)) {
      const existing = initialPaymentIntegrations.find(i => i.gateway === gateway);
      statuses[gateway] = existing?.is_live || false;
    }
    return statuses;
  };

  const [gatewayCredentials, setGatewayCredentials] = useState<Record<string, any>>(buildInitialCredentials);
  const [gatewayLive, setGatewayLive] = useState<Record<string, boolean>>(buildInitialLiveStatus);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [expandedGateway, setExpandedGateway] = useState<string | null>(
    initialPaymentIntegrations.length > 0 ? initialPaymentIntegrations[0].gateway : "stripe"
  );
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setLoading(true);
      await saveIntegrations(funnelId, makeUrl, zapierUrl, checkoutUrls);
      toast.success("Integrations saved successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to save integrations");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayments = async () => {
    try {
      setPaymentLoading(true);
      const integrations = Object.entries(gatewayCredentials)
        .filter(([gateway, creds]) => {
          if (gateway === 'stripe') return !!creds.accountId || (!!creds.secretKey && !!creds.publishableKey);
          return Object.values(creds).some((v: any) => v && v.length > 0);
        })
        .map(([gateway, credentials]) => ({
          gateway,
          credentials,
          isLive: gatewayLive[gateway] || false,
        }));

      if (integrations.length === 0) {
        toast.error("Please configure at least one payment gateway.");
        return;
      }
      await savePaymentIntegrations(workspaceId, integrations);
      toast.success("Payment gateways saved successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to save payment gateways");
    } finally {
      setPaymentLoading(false);
    }
  };

  const toggleFieldVisibility = (fieldKey: string) => {
    setVisibleFields(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const handleCopyWebhookUrl = (gateway: string) => {
    const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/payments/${gateway}/${funnelId}`;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(gateway);
    toast.success("Webhook URL copied!");
    setTimeout(() => setCopiedWebhook(null), 2000);
  };

  const handleStripeConnect = () => {
    window.location.href = `/api/integrations/stripe/connect?workspaceId=${workspaceId}`;
  };

  const baseDomain = subdomain ? `${subdomain}.ofiq.app` : null;

  const buildUrl = (path: string) => {
    if (!baseDomain) return null;
    if (path === "/") return `https://${baseDomain}`;
    return `https://${baseDomain}${path}`;
  };

  const handleCopy = (path: string) => {
    const url = buildUrl(path);
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedPath(path);
    toast.success("URL copied to clipboard!");
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const flowOrder = ["/", "/upsell", "/downsell", "/thankyou"];
  const activePages = flowOrder.filter((p) => pagePaths.includes(p));

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "connect",
      label: "Quick Connect",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: "apikeys",
      label: "API Keys",
      icon: <Key className="w-4 h-4" />,
    },
    {
      id: "webhooks",
      label: "Webhooks",
      icon: <Webhook className="w-4 h-4" />,
    },
    {
      id: "checkouts",
      label: "External Checkouts",
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];

  const isGatewayConfigured = (gateway: string) => {
    const creds = gatewayCredentials[gateway] || {};
    if (creds.accountId) return true;
    const config = GATEWAY_CONFIG[gateway];
    return config.fields
      .filter(f => f.required)
      .every(f => creds[f.key] && creds[f.key].length > 0);
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Tab Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 bg-white/[0.03] border border-white/10 rounded-2xl p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-brand-blue to-brand-indigo text-white shadow-lg shadow-indigo-500/20"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Quick Connect Tab ──────────────────────────────────────────────── */}
      {activeTab === "connect" && (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="bg-[#131826] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-violet-500/5 opacity-50" />
            <div className="p-8 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-black text-white">Quick Connect</h2>
              </div>
              <p className="text-sm text-white/50 mt-2 leading-relaxed">
                Connect your payment accounts instantly with one click. No API keys needed &mdash; we handle everything securely via OAuth.
              </p>
            </div>
          </div>

          {/* Stripe Connect Card */}
          <div className={`bg-[#131826] border rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${
            gatewayCredentials.stripe?.accountId ? "border-emerald-500/20" : "border-white/10 hover:border-white/15"
          }`}>
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 text-xl">
                  💳
                </div>
                <div>
                  <p className="text-base font-bold text-white flex items-center gap-2">
                    Stripe
                    {gatewayCredentials.stripe?.accountId && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Connected
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">Connect via Stripe&apos;s secure OAuth flow. Recommended for most users.</p>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 border-t border-white/10 pt-5">
              <div className="py-6 flex flex-col items-center justify-center space-y-3 bg-black/20 rounded-xl border border-white/5">
                {gatewayCredentials.stripe?.accountId ? (
                  <>
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                      <ShieldCheck className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg">Stripe is Connected</h3>
                    <p className="text-white/40 text-sm text-center max-w-sm">
                      Your Stripe account is successfully linked via OAuth. Account ID: <span className="font-mono text-white/60 bg-white/10 px-1.5 py-0.5 rounded">{gatewayCredentials.stripe.accountId}</span>
                    </p>
                    <button
                      onClick={handleStripeConnect}
                      className="mt-2 px-5 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-sm rounded-xl transition-colors border border-white/10"
                    >
                      Reconnect Stripe
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center mb-2">
                      <CreditCard className="w-7 h-7 text-indigo-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg">Connect your Stripe Account</h3>
                    <p className="text-white/40 text-sm text-center max-w-sm mb-2">
                      Securely link your Stripe account with one click to automatically process payments on your funnels.
                    </p>
                    <button
                      onClick={handleStripeConnect}
                      className="px-6 py-2.5 bg-[#635BFF] hover:bg-[#524BDE] text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                    >
                      Connect with Stripe
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* PayPal Connect Card – Coming Soon */}
          <div className="bg-[#131826] border border-white/10 rounded-2xl overflow-hidden shadow-xl relative">
            <div className="absolute inset-0 bg-white/[0.01]" />
            <div className="p-5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-sky-500/20 border border-blue-500/20 text-xl opacity-50">
                  🅿️
                </div>
                <div>
                  <p className="text-base font-bold text-white/50 flex items-center gap-2">
                    PayPal
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/30 border border-white/10">
                      Coming Soon
                    </span>
                  </p>
                  <p className="text-xs text-white/30 mt-0.5">One-click PayPal business account connection via OAuth.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── API Keys Tab ───────────────────────────────────────────────────── */}
      {activeTab === "apikeys" && (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="bg-[#131826] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-teal-500/5 opacity-50" />
            <div className="p-8 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-teal-500/20 border border-violet-500/20">
                  <Key className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-2xl font-black text-white">API Keys</h2>
              </div>
              <p className="text-sm text-white/50 mt-2 leading-relaxed">
                Manually connect your payment processors by entering your API keys. Copy the webhook endpoint for each gateway and configure it in your provider&apos;s dashboard.
              </p>
            </div>
          </div>

          {/* Gateway Cards */}
          {Object.entries(GATEWAY_CONFIG).map(([gateway, config]) => {
            const isExpanded = expandedGateway === gateway;
            const creds = gatewayCredentials[gateway] || {};
            const hasApiKeys = config.fields.filter(f => f.required).every(f => creds[f.key] && creds[f.key].length > 0);
            const isLive = gatewayLive[gateway];

            return (
              <div
                key={gateway}
                className={`bg-[#131826] border rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${
                  isExpanded ? "border-white/20" : "border-white/10 hover:border-white/15"
                }`}
              >
                {/* Gateway Header */}
                <button
                  onClick={() => setExpandedGateway(isExpanded ? null : gateway)}
                  className="w-full p-5 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} border ${config.borderColor} text-xl`}>
                      {config.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-base font-bold text-white flex items-center gap-2">
                        {config.label}
                        {hasApiKeys && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isLive
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-400" : "bg-amber-400"}`} />
                            {isLive ? "Live" : "Test"}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">{config.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasApiKeys && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    <ArrowRight className={`w-4 h-4 text-white/30 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {/* Gateway Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Live/Test Toggle */}
                    <div className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {isLive ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Shield className="w-4 h-4 text-blue-400" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-white">
                            {isLive ? "Live Mode" : "Test Mode"}
                          </p>
                          <p className="text-[10px] text-white/30">
                            {isLive ? "Real transactions will be processed." : "Only test transactions will be processed."}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setGatewayLive(prev => ({ ...prev, [gateway]: !prev[gateway] }))}
                        className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                          isLive
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-500"
                            : "bg-white/10"
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                          isLive ? "translate-x-5" : ""
                        }`} />
                      </button>
                    </div>

                    {/* Credential Fields */}
                    {config.fields.map((field) => {
                      const fieldUniqueKey = `${gateway}-${field.key}`;
                      const isVisible = visibleFields[fieldUniqueKey];
                      return (
                        <div key={field.key} className="space-y-1.5">
                          <label className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                            {field.label}
                            {field.required && <span className="text-red-400">*</span>}
                          </label>
                          <div className="relative">
                            <input
                              type={isVisible ? "text" : "password"}
                              placeholder={field.placeholder}
                              value={gatewayCredentials[gateway]?.[field.key] || ""}
                              onChange={(e) =>
                                setGatewayCredentials(prev => ({
                                  ...prev,
                                  [gateway]: { ...prev[gateway], [field.key]: e.target.value }
                                }))
                              }
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => toggleFieldVisibility(fieldUniqueKey)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-all"
                            >
                              {isVisible ? (
                                <EyeOff className="w-4 h-4 text-white/30" />
                              ) : (
                                <Eye className="w-4 h-4 text-white/30" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Webhook URL */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-2">
                      <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Webhook Endpoint</p>
                      <p className="text-[11px] text-white/40 leading-relaxed">
                        Copy this URL and paste it into your {config.label} dashboard as the webhook endpoint.
                        {gateway === "stripe" && " Configure it to listen for `checkout.session.completed` events."}
                        {gateway === "paystack" && " Configure it to listen for `charge.success` events."}
                        {gateway === "paypal" && " Configure it to listen for `PAYMENT.CAPTURE.COMPLETED` events."}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 font-mono text-xs text-violet-400/80 truncate">
                          {typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/api/webhooks/payments/{gateway}/{funnelId}
                        </div>
                        <button
                          onClick={() => handleCopyWebhookUrl(gateway)}
                          className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/30 transition-all shrink-0"
                        >
                          {copiedWebhook === gateway ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/40" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSavePayments}
              disabled={paymentLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentLoading ? "Saving..." : "Save API Keys"}
            </button>
          </div>
        </div>
      )}

      {/* ── Webhook Integrations Tab ─────────────────────────────────────────── */}
      {activeTab === "webhooks" && (
        <div className="bg-[#131826] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-brand-indigo/5 opacity-50" />

          <div className="p-8 relative z-10 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-indigo/20 border border-brand-blue/20">
                <Webhook className="w-5 h-5 text-brand-blue" />
              </div>
              <h2 className="text-2xl font-black text-white">Webhook Integrations</h2>
            </div>
            <p className="text-sm text-white/50 mt-2">
              Connect your funnel to external autoresponders. When a lead is captured, we will send an HTTP POST request with the lead data to these Webhook URLs.
            </p>
          </div>

          <div className="p-8 relative z-10 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-white block">Make.com Webhook URL</label>
              <input
                type="url"
                placeholder="https://hook.us1.make.com/..."
                value={makeUrl}
                onChange={(e) => setMakeUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-white block">Zapier Webhook URL</label>
              <input
                type="url"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={zapierUrl}
                onChange={(e) => setZapierUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all"
              />
            </div>
          </div>

          <div className="p-6 bg-black/20 border-t border-white/10 relative z-10 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-blue to-brand-indigo hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Integrations"}
            </button>
          </div>
        </div>
      )}

      {/* ── External Checkouts Tab ───────────────────────────────────────────── */}
      {activeTab === "checkouts" && (
        <div className="bg-[#131826] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 opacity-50" />

          <div className="p-8 relative z-10 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
                <CreditCard className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black text-white">External Checkouts &amp; Redirects</h2>
            </div>
            <p className="text-sm text-white/50 mt-2">
              Use Stripe Payment Links, Paystack, Lemon Squeezy, or any payment gateway. Copy the redirect URLs below and paste them as your &quot;Success URL&quot; to route buyers through your funnel.
            </p>
          </div>

          <div className="p-8 relative z-10 space-y-6">
            {/* How it works */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5">
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">How It Works</p>
              <div className="flex flex-col gap-3">
                {[
                  { step: "1", text: "Create a payment link in Stripe, Paystack, or Lemon Squeezy for your product." },
                  { step: "2", text: "Set your Buy Button on the Sales Page to link to that payment URL." },
                  { step: "3", text: "In your payment gateway, set the \"Success Redirect URL\" to the next funnel step URL below." },
                  { step: "4", text: "After payment, the buyer is automatically sent to your Upsell or Thank You page!" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-black text-white">{item.step}</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* URL list & Checkout Link configuration */}
            {baseDomain ? (
              <div className="space-y-6">
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest border-b border-white/10 pb-2">Your Funnel Flow &amp; Checkouts</p>
                {activePages.map((path, i) => {
                  const url = buildUrl(path)!;
                  const label = PAGE_LABELS[path] || path;
                  const isCopied = copiedPath === path;
                  const isLast = i === activePages.length - 1;

                  return (
                    <div key={path}>
                      <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3 group hover:border-white/20 transition-all">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white/80 mb-1">{label}</p>
                          <p className="text-sm text-emerald-400/80 font-mono truncate">{url}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleCopy(path)}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all group/btn"
                            title="Copy Funnel URL"
                          >
                            {isCopied ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-white/40 group-hover/btn:text-white/70" />
                            )}
                          </button>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all group/btn"
                            title="Open Funnel step in new tab"
                          >
                            <ExternalLink className="w-4 h-4 text-white/40 group-hover/btn:text-white/70" />
                          </a>
                        </div>
                      </div>

                      {/* Checkout URL Input */}
                      <div className="mt-2 ml-4 pl-4 border-l-2 border-white/5">
                        <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-1">
                          Buy Button Checkout URL (Optional)
                        </label>
                        <input
                          type="url"
                          placeholder="e.g. https://buy.stripe.com/..."
                          value={checkoutUrls[path] || ""}
                          onChange={(e) => setCheckoutUrls({ ...checkoutUrls, [path]: e.target.value })}
                          className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
                        />
                        <p className="text-[10px] text-white/30 mt-1">
                          If set, any &quot;Buy&quot; button on this {label} will redirect to this URL.
                        </p>
                      </div>

                      {!isLast && (
                        <div className="flex justify-center py-3">
                          <ArrowRight className="w-4 h-4 text-white/15 rotate-90" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 text-center">
                <p className="text-sm text-amber-300 font-semibold mb-1">No Subdomain Set</p>
                <p className="text-xs text-white/50">
                  Publish your funnel first to generate a subdomain. Your redirect URLs will appear here automatically.
                </p>
              </div>
            )}

            {/* Pro tip */}
            {baseDomain && (
              <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-4 flex gap-3">
                <span className="text-lg shrink-0">💡</span>
                <p className="text-xs text-white/50 leading-relaxed">
                  <span className="font-bold text-white/70">Pro Tip:</span> In Stripe, go to your Payment Link → After Payment → select &quot;Don't show confirmation page&quot; → paste the Upsell URL. This creates a seamless flow where the buyer lands directly on your upsell page after purchase.
                </p>
              </div>
            )}

            {/* Save button for checkout URLs */}
            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Checkout URLs"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
