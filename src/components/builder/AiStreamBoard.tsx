'use client';

import React, { useEffect, useRef } from 'react';
import { Bot, Sparkles, Loader2 } from 'lucide-react';

interface AiStreamBoardProps {
  isOpen: boolean;
  thinkingText: string;
}

export function AiStreamBoard({ isOpen, thinkingText }: AiStreamBoardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as text arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thinkingText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0f1115] border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-white/10 flex items-center px-4 bg-[#161920]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                OfferIQ Engine <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing Offer Strategy...
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div 
          ref={scrollRef}
          className="p-6 h-[400px] overflow-y-auto font-mono text-sm leading-relaxed text-emerald-400/90 whitespace-pre-wrap flex flex-col items-start gap-4"
        >
          {thinkingText.length === 0 ? (
            <div className="text-zinc-500 italic animate-pulse">Initializing inference engine...</div>
          ) : (
             <div className="w-full">
               <span className="text-zinc-500 select-none mr-2">{"❯"}</span>
               {thinkingText}
               <span className="animate-pulse ml-1 inline-block text-emerald-400 bg-emerald-400 w-2 h-4 align-middle" />
             </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="h-8 border-t border-white/10 bg-[#161920] px-4 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span>Model: claude-3-5-sonnet</span>
          <span>Status: Thinking & Blueprinting...</span>
        </div>
      </div>
    </div>
  );
}
