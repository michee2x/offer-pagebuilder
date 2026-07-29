import { useState, useEffect, useCallback } from 'react';

export type PlanName = 'free' | 'starter' | 'growth' | 'agency';
export type SubStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused' | 'none';

export interface PlanInfo {
  plan: PlanName;
  status: SubStatus;
  /** True when subscription is active or in trial */
  isActive: boolean;
  /** True when subscription has lapsed (past_due or canceled) and plan has been downgraded */
  isLapsed: boolean;
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
    case 'agency':  return 30;
    case 'growth':  return 3;
    case 'starter': return 1;
    case 'free':    return 1;
    default:        return 1;
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
  const status: SubStatus = (user?.subscription_status as SubStatus) || 'none';
  const isActive = status === 'active' || status === 'trialing';
  // Lapsed = had a subscription but it's now past_due/canceled AND plan reverted to free
  const isLapsed = (status === 'past_due' || status === 'canceled') && plan === 'free' && !!user?.paddle_customer_id;
  const isAdmin: boolean = user?.is_admin === true || user?.role === 'admin';

  // Workspace limit: prefer the DB-level admin override, else derive from plan
  const workspaceLimit: number =
    typeof user?.workspace_limit === 'number' && user.workspace_limit > 0
      ? user.workspace_limit
      : workspaceLimitFromPlan(plan);

  // Feature gates
  const canCustomDomain       = plan === 'growth' || plan === 'agency' || isAdmin;
  const canRemoveBranding     = plan === 'growth' || plan === 'agency' || isAdmin;
  const canAdvancedAnalytics  = plan === 'growth' || plan === 'agency' || isAdmin;
  const canPixelTracking      = plan === 'growth' || plan === 'agency' || isAdmin;
  const canAgencyDashboard    = plan === 'agency' || isAdmin;

  return {
    plan,
    status,
    isActive,
    isLapsed,
    credits: user?.credits_remaining ?? 0,
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
