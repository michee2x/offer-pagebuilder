"use client";

import React from "react";
import { motion } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";

export function OnboardingLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-12">
        {/* Glow effect */}
        <div className="absolute inset-0 blur-[60px] bg-brand-yellow/15 rounded-full animate-pulse"></div>
        
        {/* Spinner */}
        <div className="relative h-40 w-40 flex items-center justify-center">
          <Spinner size="xl" />
          <div className="absolute h-16 w-16 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center backdrop-blur-md shadow-2xl">
            <svg className="h-8 w-8 text-brand-yellow/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-w-[480px] mx-auto px-6">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[28px] font-bold text-white tracking-tight"
        >
          Architecting your Intelligence
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[15px] text-white/50 leading-relaxed"
        >
          Our AI is deep-diving into market data, competitor analysis, and psychographic mapping to build your high-converting strategy.
        </motion.p>
      </div>

      {/* Subtle progress bar instead of dots */}
      <div className="mt-12 w-48 h-[1px] bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-brand-yellow"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
}
