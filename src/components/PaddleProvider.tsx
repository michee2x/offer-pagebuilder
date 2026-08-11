'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Paddle } from '@paddle/paddle-js';

interface PaddleContextValue {
  paddle: Paddle | null;
  openCheckout: (priceId: string, userEmail?: string, userId?: string) => void;
}

const PaddleContext = createContext<PaddleContextValue>({
  paddle: null,
  openCheckout: () => {},
});

export function usePaddle() {
  return useContext(PaddleContext);
}

export function PaddleProvider({ children }: { children: ReactNode }) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);

  useEffect(() => {
    async function initPaddle() {
      try {
        const { initializePaddle } = await import('@paddle/paddle-js');
        const env = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production';
        const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!;

        const paddleInstance = await initializePaddle({
          environment: env ?? 'sandbox',
          token,
          eventCallback(event) {
            if (event.name === 'checkout.completed') {
              // Redirect to success page after successful checkout
              window.location.href = '/subscribed';
            }
          },
        });

        if (paddleInstance) {
          setPaddle(paddleInstance);
        }
      } catch (err) {
        console.error('[paddle] Failed to initialize Paddle.js:', err);
      }
    }

    initPaddle();
  }, []);

  function openCheckout(priceId: string, userEmail?: string, userId?: string) {
    if (!paddle) {
      console.warn('[paddle] Paddle not initialized yet');
      return;
    }

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: userEmail ? { email: userEmail } : undefined,
      customData: userId ? { user_id: userId } : undefined,
      settings: {
        successUrl: `${window.location.origin}/subscribed`,
        displayMode: 'overlay',
        theme: 'light',
        locale: 'en',
      },
    });
  }

  return (
    <PaddleContext.Provider value={{ paddle, openCheckout }}>
      {children}
    </PaddleContext.Provider>
  );
}
