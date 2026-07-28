'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { usePaddle } from '@/components/PaddleProvider';

function CheckoutNowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get('plan') ?? '';
  const { paddle } = usePaddle();
  const [status, setStatus] = useState<'loading' | 'opening' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!plan) {
      // No plan — go to dashboard
      router.replace('/');
      return;
    }

    async function startCheckout() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Not authenticated — send them to login preserving the plan
        router.replace(`/login?plan=${plan}`);
        return;
      }

      // Wait for Paddle to initialise (it loads asynchronously)
      if (!paddle) {
        setStatus('loading');
        return; // useEffect will re-run when paddle becomes available
      }

      setStatus('opening');

      try {
        paddle.Checkout.open({
          items: [{ priceId: plan, quantity: 1 }],
          customer: user.email ? { email: user.email } : undefined,
          customData: { user_id: user.id },
          settings: {
            successUrl: `${window.location.origin}/workspaces?subscribed=1`,
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
    }

    startCheckout();
    // Re-run when paddle initialises
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paddle, plan]);

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
      {status === 'error' ? (
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
            {status === 'loading' ? 'Preparing your checkout…' : 'Opening checkout…'}
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
