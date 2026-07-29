"use client";

import React, { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  CreditCard, Zap, Crown, Sprout, Check, X, ArrowUpRight,
  RefreshCw, LayoutTemplate, Globe, BarChart3, Code2, Headphones, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePaddle } from "@/components/PaddleProvider";
import { useRouter } from "next/navigation";

/* ─── Plan feature definitions ─────────────────────────────────── */
const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: "$39",
    period: "/mo",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgGlow: "bg-emerald-500/5",
    Icon: Sprout,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER,
    features: [
      { label: "5 offer credits / month", icon: Zap },
      { label: "1 Workspace", icon: LayoutTemplate },
      { label: "Full 4-Phase Engine (Strategy, Copy, Funnel, Traffic)", icon: Check },
      { label: "Asset Bank + Template Library", icon: Check },
      { label: "Email Engagement Sequences", icon: Check },
      { label: "OfferIQ subdomain publishing", icon: Globe },
      { label: "Payment & Autoresponder integration", icon: CreditCard },
      { label: "Standard support", icon: Headphones },
    ],
    locked: [
      "Remove OfferIQ branding",
      "Custom domain",
      "Advanced Analytics",
      "Pixel tracking",
      "Agency Dashboard",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    price: "$69",
    period: "/mo",
    color: "text-brand-blue",
    borderColor: "border-brand-blue/30",
    bgGlow: "bg-brand-blue/5",
    Icon: Zap,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_GROWTH,
    features: [
      { label: "Everything in Starter", icon: Check },
      { label: "10 offer credits / month", icon: Zap },
      { label: "3 Workspaces", icon: LayoutTemplate },
      { label: "Remove OfferIQ branding", icon: Check },
      { label: "Advanced Analytics dashboard", icon: BarChart3 },
      { label: "Custom domain connection", icon: Globe },
      { label: "Pixel tracking embed", icon: Code2 },
      { label: "Priority support", icon: Headphones },
    ],
    locked: [
      "Agency Dashboard",
      "30 client sub-accounts",
      "Agency Marketing Assets",
      "Done-For-You onboarding",
    ],
  },
  {
    key: "agency",
    name: "Agency",
    price: "$179",
    period: "/mo",
    color: "text-brand-pink",
    borderColor: "border-brand-pink/30",
    bgGlow: "bg-brand-pink/5",
    Icon: Crown,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY,
    features: [
      { label: "Everything in Growth", icon: Check },
      { label: "30 offer credits / month", icon: Zap },
      { label: "30 Workspaces", icon: LayoutTemplate },
      { label: "Agency Dashboard", icon: Users },
      { label: "30 client sub-accounts", icon: Users },
      { label: "Agency Marketing Assets", icon: Check },
      { label: "Done-For-You onboarding session", icon: Check },
      { label: "Dedicated priority support channel", icon: Headphones },
    ],
    locked: [],
  },
];

/* ─── Credit bar ─────────────────────────────────────────────────── */
function CreditBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const remaining = total - used;
  const color = pct > 80 ? "from-[#EF4444] to-[#F87171]" : pct > 50 ? "from-[#F59E0B] to-[#FCD34D]" : "from-[#8B5CF6] to-[#3B82F6]";

  return (
    <div className="flex items-center gap-3">
      <img src="/3d-icons/3dicons-3d-coin-dynamic-color.png" alt="Credits" className="w-9 h-9 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
      <div className="flex flex-col min-w-[120px]">
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-[12px] text-[#A6A6B3] font-medium uppercase tracking-wider">Credits</span>
          <span className="text-[13px] font-bold text-white">{remaining} left</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000`}
            style={{ width: `${pct}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export function BillingSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const { openCheckout } = usePaddle();
  const router = useRouter();

  useEffect(() => {
    async function fetchBilling() {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) throw new Error("Failed to load user billing info");
        const data = await res.json();
        setUserData(data.user);
      } catch (err) {
        console.error(err);
        toast.error("Could not load billing data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBilling();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="md" />
      </div>
    );
  }

  const currentPlan = (userData?.plan || "free").toLowerCase();
  const creditsRemaining = userData?.credits_remaining ?? 0;
  const creditsTotal = userData?.credits_total ?? 0;
  const creditsUsed = creditsTotal - creditsRemaining;
  const status = userData?.subscription_status || "none";
  const isActive = status === "active" || status === "trialing";
  const resetDate = userData?.credits_reset_at
    ? new Date(new Date(userData.credits_reset_at).setMonth(new Date(userData.credits_reset_at).getMonth() + 1)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const activePlan = PLANS.find((p) => p.key === currentPlan);

  const planOrder: Record<string, number> = { free: 0, starter: 1, growth: 2, agency: 3 };
  const currentPlanRank = planOrder[currentPlan] ?? 0;
  
  // Filter for plans strictly higher than the current plan
  const upgradePlans = PLANS.filter(plan => (planOrder[plan.key] ?? 0) > currentPlanRank);

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700 relative w-full pb-20">
      
      {/* Ambient background glow similar to welcome page */}
      <div aria-hidden="true" className="absolute rounded-full pointer-events-none z-0 w-[600px] h-[600px] -top-[100px] left-1/2 -translate-x-1/2 blur-[80px] opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.1) 40%, transparent 70%)' }} />

      {/* ── Current plan hero card ── */}
      <section className="relative z-10 w-full">
        <div className="flex flex-col gap-3 mb-10 items-center text-center">
          <h1 className="text-[30px] md:text-[34px] font-semibold text-[#F5F5F7] tracking-tight leading-tight">
            Manage Your <span style={{
                backgroundImage: 'linear-gradient(135deg, #18CCFC, #6344F5 32.5%, #AE48FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 20px rgba(99,68,245,0.3))'
              }}>Plan & Billing</span>
          </h1>
          <p className="text-[#A6A6B3] text-sm md:text-[15px] max-w-lg leading-relaxed">
            View your current usage, upgrade to unlock advanced features, and manage your billing settings.
          </p>
        </div>

        <div className="w-full rounded-[24px] relative p-[1px] group" style={{
          background: 'linear-gradient(180deg, rgba(139,92,246,0.3) 0%, rgba(255,255,255,0.02) 100%)',
          boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#8B5CF6]/10 to-transparent rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
          <div className="relative bg-[#0d0d12] rounded-[23px] p-8 md:p-10 overflow-hidden h-full flex flex-col border border-white/[0.04]">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-b from-[#3B82F6]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-between w-full">
              {/* Plan info */}
              <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto text-center sm:text-left">
                {activePlan ? (
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentPlan === 'agency' ? 'from-pink-500/20 to-purple-500/20' : 'from-blue-500/20 to-indigo-500/20'} border ${activePlan.borderColor} flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.15)] shrink-0`}>
                    <activePlan.Icon className={`w-6 h-6 ${activePlan.color}`} />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6 text-white/40" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-3 mb-1 justify-center sm:justify-start">
                    <h2 className={`text-2xl font-bold tracking-tight capitalize text-white`}>
                      {currentPlan}
                    </h2>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-[#A6A6B3] border border-white/10"
                    }`}>
                      {isActive ? (status === "trialing" ? "Trial" : "Active") : "Inactive"}
                    </span>
                  </div>
                  {activePlan && (
                    <p className="text-[#A6A6B3] text-sm font-medium flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-white font-bold">{activePlan.price}</span><span>{activePlan.period}</span>
                      {resetDate && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/20"></span>
                          <span>Resets {resetDate}</span>
                        </>
                      )}
                    </p>
                  )}
                  {currentPlan === "free" && !isActive && (
                    <p className="text-[#A6A6B3] text-sm mt-1">Upgrade your plan below to unlock full access.</p>
                  )}
                </div>
              </div>

              {/* Credits and Action Row */}
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                {creditsTotal > 0 && (
                  <CreditBar used={creditsUsed} total={creditsTotal} />
                )}
                {isActive && upgradePlans.length > 0 && (
                  <button
                    className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-[13.5px] font-bold text-white transition-all duration-300 hover:scale-[1.05] shadow-[0_0_16px_rgba(139,92,246,0.4)] hover:shadow-[0_0_24px_rgba(139,92,246,0.6)] shrink-0"
                    style={{ background: 'linear-gradient(135deg, #18CCFC, #6344F5 32.5%, #AE48FF)' }}
                    onClick={() => {
                      document.getElementById('upgrade-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade Now
                  </button>
                )}
              </div>
            </div>

            {/* Features you have access to */}
            {activePlan && activePlan.features.length > 0 && (
              <div className="relative z-10 mt-8 pt-8 border-t border-white/[0.06] w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3">
                  {activePlan.features.map(({ label }) => (
                    <div key={label} className="flex items-start gap-2.5 text-[13px] text-[#A6A6B3]">
                      <Check className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: label }} className="leading-snug" />
                    </div>
                  ))}
                  {activePlan.locked.length > 0 && activePlan.locked.map((label) => (
                    <div key={label} className="flex items-start gap-2.5 text-[13px] text-white/20">
                      <X className="w-3.5 h-3.5 mt-0.5 text-white/10 shrink-0" />
                      <span className="leading-snug">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Upgrade options ── */}
      {upgradePlans.length > 0 && (
        <section id="upgrade-section" className="relative z-10 w-full mt-24">
          <div className="flex flex-col items-center text-center gap-2 w-full max-w-2xl mx-auto mb-10">
            <div className="flex items-center gap-2 font-mono text-[11.5px] tracking-[0.14em] uppercase text-[#A78BFA] mb-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'linear-gradient(135deg,#8B5CF6 0%,#3B82F6 100%)', boxShadow: '0 0 10px rgba(139,92,246,0.5)' }}></span>
              {currentPlan === "free" ? "Choose Your Path" : "Level Up Your Agency"}
            </div>
            <h2 className="text-[26px] md:text-[30px] font-semibold text-[#F5F5F7] tracking-tight leading-tight">
              {currentPlan === "free" ? "Select a plan to start building." : "Unlock more power and capacity."}
            </h2>
          </div>

          <div className={`grid grid-cols-1 ${upgradePlans.length === 3 ? "md:grid-cols-3" : upgradePlans.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" : "max-w-md mx-auto"} gap-6`}>
            {upgradePlans.map((plan) => {
              const isAgency = plan.key === "agency";
              return (
                <div
                  key={plan.key}
                  className="relative flex flex-col p-8 rounded-[24px] transition-all duration-500 group overflow-hidden bg-white/[0.03] border border-white/[0.08] hover:border-[#8B5CF6]/40 hover:-translate-y-1"
                  style={{ boxShadow: '0 20px 40px -20px rgba(0,0,0,0.3)' }}
                >
                  {/* Hover ambient glow */}
                  <div className={`absolute top-0 right-0 w-32 h-32 ${isAgency ? 'bg-pink-500/20' : 'bg-blue-500/20'} rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}></div>
                  
                  <div className="relative z-10 flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isAgency ? 'from-pink-500/20 to-purple-500/20' : 'from-blue-500/20 to-indigo-500/20'} border ${isAgency ? 'border-pink-500/30' : 'border-blue-500/30'} flex items-center justify-center`}>
                        <plan.Icon className={`w-5 h-5 ${plan.color}`} />
                      </div>
                      <span className={`text-[17px] font-bold ${plan.color}`}>{plan.name}</span>
                    </div>
                  </div>

                  <div className="relative z-10 mb-8 pb-6 border-b border-white/[0.06]">
                    <div className="flex items-end gap-1">
                      <span className="text-[40px] font-extrabold text-white leading-none tracking-tight">{plan.price}</span>
                      <span className="text-[#A6A6B3] text-[15px] font-medium mb-1">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="relative z-10 space-y-3.5 flex-1 mb-8">
                    {plan.features.slice(0, 5).map(({ label }) => (
                      <li key={label} className="flex items-start gap-3 text-[14px] text-[#A6A6B3] leading-snug">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span dangerouslySetInnerHTML={{ __html: label }} />
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="flex items-center gap-3 text-[14px] text-white/40 italic pl-1">
                        <span className="w-4 text-center text-xs">+</span>
                        <span>{plan.features.length - 5} more advanced features</span>
                      </li>
                    )}
                  </ul>

                  <button
                    className={`relative z-10 w-full h-12 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] border-0 text-white ${
                      isAgency
                        ? "bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:shadow-[0_0_24px_rgba(236,72,153,0.4)]"
                        : "bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:shadow-[0_0_24px_rgba(59,130,246,0.4)]"
                    }`}
                    onClick={() => {
                      if (isActive) {
                        toast.info("To upgrade, contact support or manage your subscription via the customer portal.");
                      } else if (plan.priceId) {
                        router.push(`/checkout-now?plan=${plan.priceId}`);
                      } else {
                        toast.error("Plan not available");
                      }
                    }}
                  >
                    {isActive ? "Upgrade Plan" : "Start Your $1 Trial"}
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-[13px] text-[#6B6B7B] mt-8 font-mono tracking-wide">
            $1 for your first 7 days, then billed monthly. Cancel anytime. 30-day money-back guarantee.
          </p>
        </section>
      )}

    </div>
  );
}
