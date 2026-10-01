import { useState, useEffect, useCallback } from 'react';

export type PlanName = 'free' | 'starter' | 'growth' | 'agency' | 'unlimited';
export type SubStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused' | 'none';

export interface PlanInfo {
  plan: PlanName;
  /** True when user is on the Unlimited (BYOK) plan */
  isUnlimited: boolean;
  status: SubStatus;
  /** True when subscription is active, trialing, or user is on unlimited plan */
  isActive: boolean;
  /** True when subscription has lapsed (past_due or canceled) and plan has been downgraded */
  isLapsed: boolean;
  /**
   * Credits remaining — always Infinity for unlimited users,
   * so downstream hasCredits checks are always true.
   */
  credits: number;
  /** Max workspaces allowed. Derived from plan unless admin has set workspace_limit. */
  workspaceLimit: number;
  canCustomDomain: boolean;
  canRemoveBranding: boolean;
  canAdvancedAnalytics: boolean;
  canPixelTracking: boolean;
  canAgencyDashboard: boolean;
  isAdmin: boolean;
  loading: boolean;
  /** Raw user row from /api/user */
  user: any | null;
  refresh: () => void;
}

/** Derives workspace limit from plan name */
function workspaceLimitFromPlan(plan: PlanName): number {
  switch (plan) {
    case 'unlimited': return 30; // same as agency — unlimited plan is for power users
    case 'agency':    return 30;
    case 'growth':    return 3;
    case 'starter':   return 1;
    case 'free':      return 1;
    default:          return 1;
  }
}

export function usePlan(): PlanInfo {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
      }
    } catch {
      // silently fail — stays null
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const plan: PlanName = (user?.plan as PlanName) || 'free';
  const isUnlimited = plan === 'unlimited';
  const status: SubStatus = (user?.subscription_status as SubStatus) || 'none';

  // Unlimited users are always considered active — they pay via their own API key
  const isActive = isUnlimited || status === 'active' || status === 'trialing';

  // Lapsed = had a Paddle subscription but it's now past_due/canceled AND plan reverted to free
  // Unlimited users can never lapse (they're not on Paddle billing)
  const isLapsed = !isUnlimited && (status === 'past_due' || status === 'canceled') && plan === 'free' && !!user?.paddle_customer_id;

  const isAdmin: boolean = user?.is_admin === true || user?.role === 'admin';

  // Workspace limit: prefer DB-level admin override, else derive from plan
  const workspaceLimit: number =
    typeof user?.workspace_limit === 'number' && user.workspace_limit > 0
      ? user.workspace_limit
      : workspaceLimitFromPlan(plan);

  // Feature gates — unlimited users get everything (they paid a premium one-time fee)
  const canCustomDomain      = isUnlimited || plan === 'growth' || plan === 'agency' || isAdmin;
  const canRemoveBranding    = isUnlimited || plan === 'growth' || plan === 'agency' || isAdmin;
  const canAdvancedAnalytics = isUnlimited || plan === 'growth' || plan === 'agency' || isAdmin;
  const canPixelTracking     = isUnlimited || plan === 'growth' || plan === 'agency' || isAdmin;
  const canAgencyDashboard   = isUnlimited || plan === 'agency' || isAdmin;

  return {
    plan,
    isUnlimited,
    status,
    isActive,
    isLapsed,
    // Unlimited users: expose Infinity so any `credits > 0` check passes naturally
    credits: isUnlimited ? Infinity : (user?.credits_remaining ?? 0),
    workspaceLimit,
    canCustomDomain,
    canRemoveBranding,
    canAdvancedAnalytics,
    canPixelTracking,
    canAgencyDashboard,
    isAdmin,
    loading,
    user,
    refresh: fetchUser,
  };
}
