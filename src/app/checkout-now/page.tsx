'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePaddle } from '@/components/PaddleProvider';
import { createClient } from '@/utils/supabase/client';

function CheckoutNowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get('plan') ?? '';
  const { paddle } = usePaddle();

  // 'checking' → verifying subscription status server-side
  // 'clear'    → free to open Paddle checkout
  // 'blocked'  → already has active subscription
  // 'opening'  → Paddle overlay is opening
  // 'error'    → Paddle failed to open
  const [status, setStatus] = useState<'checking' | 'clear' | 'blocked' | 'opening' | 'error'>('checking');
  const [errorMsg, setErrorMsg] = useState('');

  // Phase 1: Check subscription status via server API (runs once on mount)
  useEffect(() => {
    if (!plan) {
      router.replace('/');
      return;
    }

    async function checkSubscription() {
      try {
        // Verify auth first
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.replace(`/login?plan=${plan}`);
          return;
        }

        // Call server-side API which uses service role key — bypasses RLS
        const res = await fetch('/api/user');
        if (!res.ok) {
          // Can't verify — let checkout proceed
          setStatus('clear');
          return;
        }

        const data = await res.json();
        const subStatus = data.user?.subscription_status;
        const currentPlan = data.user?.plan;

        if ((subStatus === 'active' || subStatus === 'trialing') && currentPlan && currentPlan !== 'free') {
          // User already has an active paid subscription
          setStatus('blocked');
          setTimeout(() => {
            router.push('/settings?tab=billing');
          }, 3000);
        } else {
          // Free to proceed with checkout
          setStatus('clear');
        }
      } catch {
        // On any error, allow checkout to proceed
        setStatus('clear');
      }
    }

    checkSubscription();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 2: Open Paddle checkout — only when status is 'clear' AND paddle is ready
  useEffect(() => {
    if (status !== 'clear' || !paddle || !plan) return;

    setStatus('opening');

    const openPaddle = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      try {
        paddle.Checkout.open({
          items: [{ priceId: plan, quantity: 1 }],
          customer: user?.email ? { email: user.email } : undefined,
          customData: user ? { user_id: user.id } : undefined,
          settings: {
            successUrl: `${window.location.origin}/subscribed`,
            displayMode: 'overlay',
            theme: 'dark',
            locale: 'en',
          },
        });
      } catch (err: any) {
        console.error('[checkout-now] Paddle.Checkout.open failed:', err);
        setStatus('error');
        setErrorMsg(err?.message ?? 'Failed to open checkout. Please try again.');
      }
    };

    openPaddle();
  }, [status, paddle, plan]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#08080D',
        color: '#F5F5F7',
        fontFamily: "'Host Grotesk', sans-serif",
        gap: '16px',
      }}
    >
      {status === 'blocked' ? (
        <>
          <div style={{ fontSize: '2rem' }}>🔒</div>
          <p style={{ color: '#a78bfa', maxWidth: 400, textAlign: 'center', fontWeight: 600 }}>
            You already have an active subscription.
          </p>
          <p style={{ color: '#A6A6B3', maxWidth: 400, textAlign: 'center', fontSize: 14 }}>
            Redirecting you to Billing Settings to manage your plan…
          </p>
          <button
            onClick={() => router.push('/settings?tab=billing')}
            style={{
              marginTop: 8,
              padding: '10px 28px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)',
              color: '#fff',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Go to Billing Settings
          </button>
        </>
      ) : status === 'error' ? (
        <>
          <div style={{ fontSize: '2rem' }}>⚠️</div>
          <p style={{ color: '#f87171', maxWidth: 400, textAlign: 'center' }}>{errorMsg}</p>
          <button
            onClick={() => router.push('/')}
            style={{
              marginTop: 8,
              padding: '10px 28px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)',
              color: '#fff',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Back to Home
          </button>
        </>
      ) : (
        <>
          {/* Spinner */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '3px solid rgba(139,92,246,0.2)',
              borderTopColor: '#8B5CF6',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#A6A6B3', fontSize: 15 }}>
            {status === 'checking'
              ? 'Verifying account…'
              : status === 'opening'
              ? 'Opening checkout…'
              : 'Preparing your checkout…'}
          </p>
        </>
      )}
    </div>
  );
}

export default function CheckoutNowPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutNowContent />
    </Suspense>
  );
}
