"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignPathSelectionProps {
  onSelect: (hasIdea: boolean) => void;
  selectedPath: boolean | null;
}

export function CampaignPathSelection({
  onSelect,
  selectedPath,
}: CampaignPathSelectionProps) {
  const paths = [
    {
      id: "yes",
      hasIdea: true,
      title: "I have an idea",
      description: "Validate your existing offer and build a strategy from it.",
      time: "5 MINS",
      icon: (
        <svg className="w-full h-full" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="10" width="54" height="42" rx="8" fill="#1a1a1a" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>
          <rect x="4" y="10" width="54" height="12" rx="8" fill="rgba(255,255,255,0.03)"/>
          <circle cx="12" cy="16" r="2" fill="#ef4444" opacity="0.5"/>
          <circle cx="18" cy="16" r="2" fill="#eab308" opacity="0.5"/>
          <circle cx="24" cy="16" r="2" fill="#22c55e" opacity="0.5"/>
          <rect x="12" y="30" width="24" height="2" rx="1" fill="rgba(255,255,255,0.05)"/>
          <rect x="12" y="36" width="18" height="2" rx="1" fill="rgba(255,255,255,0.05)"/>
          <circle cx="46" cy="40" r="10" fill="#FF9E2C" fillOpacity="0.1" stroke="#FF9E2C" strokeWidth="1.5"/>
          <path d="M42 40 L45 43 L50 38" stroke="#FF9E2C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "no",
      hasIdea: false,
      title: "I need an idea",
      description: "Generate a business idea first, then architect your strategy.",
      time: "2 MINS",
      icon: (
        <svg className="w-full h-full" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="31" cy="31" r="22" fill="#FF9E2C" fillOpacity="0.05" stroke="#FF9E2C" strokeWidth="1.5" strokeDasharray="4 4"/>
          <path d="M31 22 V40 M22 31 H40" stroke="#FF9E2C" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-[680px] mx-auto w-full relative z-10">
      <div className="mb-12">
        <h1 className="text-[28px] font-bold text-white tracking-tight mb-2">
          Start your Sales Intelligence Flow
        </h1>
        <p className="text-[14px] text-[#555] max-w-md leading-relaxed">
          Choose how you want to begin your campaign. Complete these steps to architect your high-converting offer.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {paths.map((path) => (
          <motion.div
            key={path.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(path.hasIdea)}
            className={cn(
              "relative flex flex-col p-8 rounded-2xl border transition-all cursor-pointer group",
              selectedPath === path.hasIdea
                ? "border-brand-yellow/40 bg-brand-yellow/[0.02] shadow-[0_20px_40px_rgba(255,158,44,0.05)]"
                : "border-white/10 bg-[#0a0a0a]/40 hover:border-white/20 hover:bg-[#0a0a0a]/60"
            )}
          >
            <div className="flex justify-between items-start mb-8">
              <div className={cn(
                "px-2.5 py-1 rounded text-[10px] font-bold tracking-[0.1em] uppercase",
                selectedPath === path.hasIdea ? "bg-brand-yellow text-black" : "text-[#444] bg-white/5 border border-white/5"
              )}>
                {path.time}
              </div>
              {selectedPath === path.hasIdea && (
                <div className="h-6 w-6 rounded-full bg-brand-yellow flex items-center justify-center text-black">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </div>
              )}
            </div>

            <div className="h-16 w-16 mb-8">
              {path.icon}
            </div>

            <div className="mt-auto">
              <h3 className="text-[17px] font-bold text-white mb-2 tracking-tight">
                {path.title}
              </h3>
              <p className="text-[13px] text-[#777] leading-relaxed">
                {path.description}
              </p>
            </div>

            {selectedPath === path.hasIdea && (
              <div className="absolute top-0 right-0 p-1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
