'use client';

import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { usePlan, PlanName } from '@/hooks/usePlan';
import { useRouter } from 'next/navigation';

const PLAN_ORDER: PlanName[] = ['free', 'starter', 'growth', 'agency'];

const PLAN_LABELS: Record<PlanName, string> = {
  free:    'Free',
  starter: 'Starter',
  growth:  'Growth',
  agency:  'Agency',
};

const PLAN_PRICES: Record<PlanName, string> = {
  free:    '',
  starter: '$39/mo',
  growth:  '$69/mo',
  agency:  '$179/mo',
};

interface PlanGateProps {
  /** The minimum plan required to access the children */
  requiredPlan: PlanName;
  /** Human-readable name of the gated feature (shown in the upgrade callout) */
  feature: string;
  /** Content to render when the user has access */
  children: React.ReactNode;
}

/**
 * Wrap any feature UI in <PlanGate> to automatically show an upgrade
 * prompt when the user's current plan is below `requiredPlan`.
 *
 * Admins always pass through regardless of plan.
 */
export function PlanGate({ requiredPlan, feature, children }: PlanGateProps) {
  const { plan, isAdmin, loading } = usePlan();
  const router = useRouter();

  if (loading) {
    return (
      <div className="h-24 rounded-xl bg-white/[0.02] border border-white/10 animate-pulse" />
    );
  }

  // Admins bypass all gates
  if (isAdmin) return <>{children}</>;

  const currentIdx  = PLAN_ORDER.indexOf(plan);
  const requiredIdx = PLAN_ORDER.indexOf(requiredPlan);
  const hasAccess   = currentIdx >= requiredIdx;

  if (hasAccess) return <>{children}</>;

  // — Show upgrade callout —
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.015] p-6 overflow-hidden">
      {/* Gradient shimmer */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)' }}
      />

      <div className="relative z-10 flex flex-col items-start gap-4">
        {/* Lock icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-400 mb-0.5">
              {PLAN_LABELS[requiredPlan]} Plan Feature
            </p>
            <h3 className="text-white font-semibold text-[15px] leading-tight">
              {feature}
            </h3>
          </div>
        </div>

        <div className="w-full">
          <p className="text-[#A6A6B3] text-[13px] leading-relaxed mb-4">
            Upgrade to the{' '}
            <span className="text-white font-medium">{PLAN_LABELS[requiredPlan]}</span> plan
            {PLAN_PRICES[requiredPlan] ? ` (${PLAN_PRICES[requiredPlan]})` : ''} to unlock this feature.
          </p>

          <button
            onClick={() => router.push('/settings?tab=billing')}
            className="w-full inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)' }}
          >
            Upgrade <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
