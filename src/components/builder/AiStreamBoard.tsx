'use client';

import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

interface AiStreamBoardProps {
  isOpen: boolean;
  thinkingText: string;
}

export function AiStreamBoard({ isOpen, thinkingText }: AiStreamBoardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as text streams in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thinkingText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-xl mx-4 bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 flex items-center gap-4 bg-muted/20 border-b border-border/50">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">AI Architect is working</h3>
            <p className="text-sm text-muted-foreground">Generating high-converting sections tailored to your offer</p>
          </div>
        </div>

        {/* Stream Area */}
        <div 
          ref={scrollRef}
          className="p-8 h-[320px] overflow-y-auto text-[15px] leading-relaxed text-muted-foreground/90 font-sans custom-scrollbar bg-background relative"
        >
          {/* Top mask for smooth scrolling fade effect */}
          <div className="sticky top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none -mt-8" />
          
          {thinkingText ? (
            <div className="whitespace-pre-wrap pb-4">{thinkingText}</div>
          ) : (
            <div className="flex items-center gap-3 text-muted-foreground/50 h-full justify-center">
              <span className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <span>Analyzing context...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

