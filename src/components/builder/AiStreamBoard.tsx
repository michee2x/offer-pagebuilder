'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2, Brain, Zap, FileText } from 'lucide-react';

interface AiStreamBoardProps {
  isOpen: boolean;
  thinkingText: string;
}

const BUILD_STEPS = [
  { icon: Brain, label: 'Analysing offer strategy' },
  { icon: Zap, label: 'Selecting optimal components' },
  { icon: FileText, label: 'Writing conversion copy' },
  { icon: Sparkles, label: 'Assembling page structure' },
];

export function AiStreamBoard({ isOpen, thinkingText }: AiStreamBoardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Auto-scroll to bottom as text arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thinkingText]);

  // Cycle through build steps to give progress feel
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setActiveStep(s => (s + 1) % BUILD_STEPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Compute a rough word count progress
  const wordCount = thinkingText.split(/\s+/).filter(Boolean).length;
  const progress = Math.min(100, Math.round((wordCount / 400) * 100));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-foreground/8 border border-border flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">Building Your Funnel</h3>
              <p className="text-xs text-muted-foreground">OfferIQ is strategising and writing your copy</p>
            </div>
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin flex-shrink-0" />
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-all duration-1000"
              style={{ width: `${Math.max(4, progress)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-right font-mono">{progress}% complete</p>
        </div>

        {/* Build steps */}
        <div className="px-6 py-4 border-b border-border grid grid-cols-2 gap-2">
          {BUILD_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isDone = i < activeStep;
            const isActive = i === activeStep;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all text-xs font-medium border
                  ${isActive ? 'bg-foreground/5 border-border text-foreground' : isDone ? 'border-transparent text-muted-foreground' : 'border-transparent text-muted-foreground/40'}`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-foreground' : isDone ? 'text-muted-foreground' : 'text-muted-foreground/30'}`} />
                <span className="leading-tight">{step.label}</span>
                {isDone && <span className="ml-auto text-[9px] font-bold text-muted-foreground">✓</span>}
                {isActive && <Loader2 className="w-2.5 h-2.5 ml-auto animate-spin text-muted-foreground" />}
              </div>
            );
          })}
        </div>

        {/* Thinking stream — clean, no green */}
        <div
          ref={scrollRef}
          className="px-6 py-4 h-[180px] overflow-y-auto text-xs text-muted-foreground leading-relaxed font-mono whitespace-pre-wrap"
        >
          {thinkingText.length === 0 ? (
            <p className="animate-pulse text-muted-foreground/50">Initialising strategy engine…</p>
          ) : (
            <p>{thinkingText}<span className="inline-block w-1.5 h-3.5 bg-foreground/50 align-middle ml-0.5 animate-pulse" /></p>
          )}
        </div>

        {/* Footer */}
        <div className="h-8 border-t border-border bg-muted/20 px-6 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <span>OfferIQ Engine · claude-3-5-sonnet</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Generating
          </span>
        </div>
      </div>
    </div>
  );
}
