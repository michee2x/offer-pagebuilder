import { useState, useEffect, useCallback } from 'react';

export function useCredits() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.user && typeof data.user.credits_remaining === 'number') {
        setCredits(data.user.credits_remaining);
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
    loading,
    refreshCredits: fetchCredits,
    hasCredits: credits !== null && credits > 0,
  };
}
