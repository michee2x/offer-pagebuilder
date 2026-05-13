'use client';

import { useEffect, useState } from 'react';
import { Check, Wand2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface AiStreamBoardProps {
  isOpen: boolean;
  thinkingText: string; // kept for API compatibility — not displayed
}

const STAGES = [
  { label: 'Analysing offer intelligence',  duration: 3_000  },
  { label: 'Composing section layouts',     duration: 9_000  },
  { label: 'Writing conversion copy',       duration: 20_000 },
  { label: 'Packaging all 4 funnel pages',  duration: Infinity },
] as const;

export function AiStreamBoard({ isOpen }: AiStreamBoardProps) {
  const [activeStage, setActiveStage] = useState(0);

  // Advance through stages on timers; reset when closed
  useEffect(() => {
    if (!isOpen) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;

    STAGES.slice(0, -1).forEach((stage, i) => {
      elapsed += stage.duration;
      timers.push(setTimeout(() => setActiveStage(i + 1), elapsed));
    });

    return () => {
      timers.forEach(clearTimeout);
      setActiveStage(0);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const progress = Math.min(
    ((activeStage + 0.5) / STAGES.length) * 100,
    90
  );

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Wand2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-none mb-1">Building Your Funnel</h3>
            <p className="text-xs text-muted-foreground">Claude is generating 4 high-converting pages</p>
          </div>
        </div>

        {/* Stage list */}
        <div className="px-6 pb-5 space-y-3">
          {STAGES.map((stage, i) => {
            const isDone    = i < activeStage;
            const isActive  = i === activeStage;
            const isPending = i > activeStage;

            return (
              <div key={stage.label} className="flex items-center gap-3">
                {/* Status icon */}
                <div className={[
                  'w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all duration-500',
                  isDone   && 'bg-primary/20 border-primary/40 text-primary',
                  isActive && 'border-primary bg-primary/10',
                  isPending && 'border-border',
                ].filter(Boolean).join(' ')}>
                  {isDone   && <Check className="w-3 h-3" />}
                  {isActive && <Spinner size="sm" />}
                </div>

                {/* Label */}
                <span className={[
                  'text-sm transition-colors duration-300',
                  isDone    && 'text-foreground/50',
                  isActive  && 'text-foreground font-medium',
                  isPending && 'text-muted-foreground/40',
                ].filter(Boolean).join(' ')}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar + footer */}
        <div className="border-t border-border">
          <div className="h-0.5 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="px-6 py-3 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>claude-sonnet-4-6</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Generating
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
