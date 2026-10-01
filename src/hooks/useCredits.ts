import { useState, useEffect, useCallback } from 'react';

export function useCredits() {
  const [credits, setCredits] = useState<number | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.user) {
        const plan = data.user.plan;
        if (plan === 'unlimited') {
          // BYOK users have no credit concept — treat as always having credits
          setIsUnlimited(true);
          setCredits(Infinity);
        } else if (typeof data.user.credits_remaining === 'number') {
          setIsUnlimited(false);
          setCredits(data.user.credits_remaining);
        }
      }
    } catch (e) {
      console.error('Failed to fetch credits', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    isUnlimited,
    loading,
    refreshCredits: fetchCredits,
    // Always true for unlimited users; true for others when credits > 0
    hasCredits: isUnlimited || (credits !== null && credits > 0),
  };
}
