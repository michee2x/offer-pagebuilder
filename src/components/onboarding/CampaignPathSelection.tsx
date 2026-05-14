"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

import Image from "next/image";

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
      description: "Validate your existing offer and build a high-converting strategy from it.",
      time: "5 MINS",
      image: "/ofiq-imgs/idea-yes.png",
    },
    {
      id: "no",
      hasIdea: false,
      title: "I need an idea",
      description: "Generate a market-vetted business idea first, then architect your strategy.",
      time: "2 MINS",
      image: "/ofiq-imgs/idea-no.png",
    },
  ];

  return (
    <div className="max-w-[840px] mx-auto w-full relative z-10">
      <div className="relative group/container">
        <div className="px-8 py-8 md:px-12">
          <div className="mb-14 text-center">
            <h1 className="text-[36px] font-bold text-white tracking-tight mb-4 leading-tight">
              Start your <span className="text-[#f5a623]">Sales Intelligence</span> Flow
            </h1>
            <p className="text-[12.5px] text-white/80 font-light max-w-lg mx-auto leading-relaxed">
              Choose your path to begin. Complete these strategic steps to architect your high-converting offer.
            </p>
          </div>

          <div className="grid grid-cols-1 max-w-sm sm:max-w-full sm:grid-cols-2 gap-8">
            {paths.map((path) => (
              <motion.div
                key={path.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(path.hasIdea)}
                className={cn(
                  "relative flex flex-col p-0 overflow-hidden rounded-[2.5rem] border-4 transition-all duration-500 cursor-pointer group shadow-2xl bg-[#1F1F1E]/30",
                  selectedPath === path.hasIdea
                    ? "border-brand-yellow shadow-[0_30px_60px_rgba(245,166,35,0.25)]"
                    : "border-transparent"
                )}
              >
                {/* Premium Background Container */}
                <div className="absolute inset-0 bg-blue-600/[0.03] backdrop-blur-2xl rounded-[2.5rem] border border-blue-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] -z-10 transition-all duration-500 group-hover/container:border-blue-500/20 group-hover/container:bg-blue-600/[0.05]" />
                {/* Subtle Blue Glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none -z-10" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none -z-10" />

                {/* Image Section */}
                <div className="relative h-54 w-full overflow-hidden bg-transparent">
                  <Image
                    src={path.image}
                    alt={path.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* <div className="absolute inset-0 opacity-60" /> */}


                  {/* {selectedPath === path.hasIdea && (
                    <div className="absolute top-6 right-6 h-8 w-8 rounded-full bg-brand-yellow flex items-center justify-center text-black shadow-lg">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </div>
                  )} */}
                </div>

                {/* Content Section */}
                <div className="p-8 pt-6">
                  <h3 className="text-[22px] font-bold text-white mb-3 tracking-tight group-hover:text-brand-yellow transition-colors duration-300">
                    {path.title}
                  </h3>
                  <p className="text-[14px] text-white/80 leading-relaxed font-medium">
                    {path.description}
                  </p>
                </div>

                {selectedPath === path.hasIdea && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-brand-yellow" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
