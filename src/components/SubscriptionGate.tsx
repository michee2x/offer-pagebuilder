'use client';

import React from 'react';
import { AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { usePlan } from '@/hooks/usePlan';

interface SubscriptionGateProps {
  children: React.ReactNode;
}

/**
 * Wraps protected page layouts. If the user's subscription has lapsed
 * (past_due or canceled), shows a full-screen "Subscription paused" banner.
 *
 * Admin users are always allowed through.
 * Users on an admin-assigned free plan (no paddle_customer_id) also pass through.
 */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { isLapsed, isAdmin, loading, status } = usePlan();

  // While loading, render children (avoid flash of the gate)
  if (loading) return <>{children}</>;

  // Admins and non-Paddle free users always get through
  if (isAdmin || !isLapsed) return <>{children}</>;

  const isPastDue = status === 'past_due';

  return (
    <div className="min-h-screen bg-[#08080D] flex items-center justify-center p-6">
      <div className="max-w-[480px] w-full text-center">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <AlertTriangle className="w-9 h-9 text-red-400" />
        </div>

        {/* Heading */}
        <h1 className="text-[28px] font-bold text-white tracking-tight mb-3">
          {isPastDue ? 'Payment Failed' : 'Subscription Ended'}
        </h1>

        <p className="text-[#A6A6B3] text-[15px] leading-relaxed mb-8">
          {isPastDue
            ? "We couldn't collect your payment. Your account has been paused. Please update your payment method to restore access."
            : 'Your subscription has been cancelled and your account is now paused. Reactivate to get back to building.'}
        </p>

        {/* CTA */}
        <a
          href="/settings?tab=billing"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-[15px] transition-all hover:opacity-90 hover:-translate-y-0.5 mb-4"
          style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)', boxShadow: '0 8px 30px -8px rgba(139,92,246,0.6)' }}
        >
          <RefreshCw className="w-4 h-4" />
          {isPastDue ? 'Update Payment Method' : 'Reactivate Subscription'}
          <ArrowRight className="w-4 h-4" />
        </a>

        <div className="mt-4 text-[13px] text-[#555]">
          Need help?{' '}
          <a href="mailto:help@ofiq.app" className="text-[#A6A6B3] hover:text-white transition-colors">
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
