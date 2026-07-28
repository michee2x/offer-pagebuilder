"use client";

import React, { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { CreditCard, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePaddle } from "@/components/PaddleProvider";

export function BillingSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const { openCheckout } = usePaddle();

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
      <div className="flex justify-center py-12">
        <Spinner size="md" />
      </div>
    );
  }

  const plan = userData?.plan || "free";
  const creditsRemaining = userData?.credits_remaining || 0;
  const creditsTotal = userData?.credits_total || 0;
  const status = userData?.subscription_status || "none";

  const getPlanBadge = () => {
    switch (plan) {
      case "agency":
        return { label: "Agency", icon: Crown, color: "text-brand-pink", bg: "bg-brand-pink/10" };
      case "growth":
        return { label: "Growth", icon: Zap, color: "text-brand-blue", bg: "bg-brand-blue/10" };
      case "starter":
        return { label: "Starter", icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-400/10" };
      default:
        return { label: "Free", icon: CreditCard, color: "text-slate-400", bg: "bg-slate-400/10" };
    }
  };

  const badge = getPlanBadge();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <div className="flex flex-col gap-1 mb-10">
          <h1 className="text-2xl font-bold text-white tracking-tight">Plan & Billing</h1>
          <p className="text-[#555] text-sm">Manage your subscription, credits, and billing details.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Current Plan Card */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-indigo opacity-50" />

            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[#999] text-xs font-semibold mb-1 uppercase tracking-wider">Current Plan</p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-white capitalize">{plan}</h2>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${badge.bg} ${badge.color}`}>
                      <badge.icon className="w-3.5 h-3.5" />
                      {status === "active" || status === "trialing" ? "Active" : status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <p className="text-[#bbb] text-sm">
                  You are currently on the <strong>{plan}</strong> plan.
                </p>
              </div>
            </div>

            <div>
              {plan === "free" ? (
                <Button
                  onClick={() => openCheckout(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER!, userData?.email, userData?.id)}
                  className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-black font-bold h-11"
                >
                  Upgrade Plan
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-white/10 hover:bg-white/5 text-white h-11"
                  onClick={() => {
                    // This could open Paddle customer portal via paddle.Checkout.open({ settings: { ... } }) or similar,
                    // or just show a coming soon toast for the portal
                    toast.info("Customer portal opening soon!");
                  }}
                >
                  Manage Subscription
                </Button>
              )}
            </div>
          </div>

          {/* Credits Card */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-[#999] text-xs font-semibold mb-1 uppercase tracking-wider">Available Credits</p>
              <div className="flex items-end gap-2 mb-6">
                <h2 className="text-4xl font-bold text-white">{creditsRemaining}</h2>
                <span className="text-[#666] mb-1 font-medium">/ {creditsTotal} this month</span>
              </div>

              <div className="w-full bg-white/5 rounded-full h-2 mb-2 overflow-hidden">
                <div
                  className="h-full bg-brand-yellow rounded-full transition-all duration-1000"
                  style={{ width: creditsTotal > 0 ? (creditsRemaining / creditsTotal) * 100 : 0 + '%' }}
                />
              </div>
              <p className="text-[10px] text-[#555] font-medium">
                Credits reset {userData?.credits_reset_at ? new Date(new Date(userData.credits_reset_at).setMonth(new Date(userData.credits_reset_at).getMonth() + 1)).toLocaleDateString() : 'monthly'}
              </p>
            </div>

            <div className="mt-8">
              <Button
                variant="outline"
                className="w-full bg-transparent border-white/10 hover:bg-white/5 text-white h-11"
                onClick={() => toast.info("Credit top-ups coming soon!")}
              >
                Buy Additional Credits
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
