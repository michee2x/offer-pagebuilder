'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

export default function SubscribedSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Fire confetti on load
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8B5CF6', '#3B82F6', '#10B981']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8B5CF6', '#3B82F6', '#10B981']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Countdown timer for auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/workspaces');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08080D] relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-8">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
          Payment Successful!
        </h1>
        
        <p className="text-white/60 text-sm leading-relaxed mb-8">
          Welcome aboard! Your subscription is now active. We're setting up your workspace environment.
        </p>

        <div className="space-y-4">
          <Button 
            onClick={() => router.push('/workspaces')}
            className="w-full h-12 bg-gradient-to-r from-brand-blue to-brand-indigo hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-[0_8px_24px_rgba(59,130,246,0.25)] flex items-center justify-center gap-2 border-0"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-xs text-white/40 font-medium">
            Redirecting automatically in {countdown}s...
          </p>
        </div>
      </div>
    </div>
  );
}
