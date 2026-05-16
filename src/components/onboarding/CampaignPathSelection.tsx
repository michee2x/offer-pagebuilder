"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Lightbulb, Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Highlighter } from "@/components/ui/highlighter"

export type CampaignPathType = "idea" | "scratch" | "pdf" | "website" | null;

interface CampaignPathSelectionProps {
  onSelect: (path: CampaignPathType) => void;
  selectedPath: CampaignPathType;
}

const paths = [
  {
    id: "idea" as CampaignPathType,
    icon: Lightbulb,
    title: "I have an idea",
    image: "https://framerusercontent.com/images/ocTUXzjdGN7azeFQ4br4ScyHbYA.jpg?scale-down-to=1024&width=1440&height=1080",
    iconColor: "#f5a623",
  },
  {
    id: "scratch" as CampaignPathType,
    icon: Sparkles,
    title: "I need an idea",
    image: "https://framerusercontent.com/images/JHKo9Ag0unotBN7sVIks5pWsQg.webp?width=1600&height=1200",
    iconColor: "#818cf8",
  },
  {
    id: "pdf" as CampaignPathType,
    icon: FileText,
    title: "Upload a PDF",
    image: "https://framerusercontent.com/images/Gs177VTHhuZMszsLfkXbl7X30Cg.jpg?scale-down-to=1024&width=1440&height=1080",
    iconColor: "#4ade80",
  },
  {
    id: "website" as CampaignPathType,
    icon: Globe,
    title: "From a Website",
    image: "https://framerusercontent.com/images/5RoHhzBwXKlzmqGgZlmjqnERe5s.jpeg?scale-down-to=1024&width=1600&height=1200",
    iconColor: "#38bdf8",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function CampaignPathSelection({
  onSelect,
  selectedPath,
}: CampaignPathSelectionProps) {
  return (
    <div className="max-w-[840px] mx-auto w-full relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-14 text-center"
      >
        <h1 className="text-[56px] font-semibold text-white tracking-tight mb-3 leading-tight">
          Start The{" "}
          <br /> <Highlighter action="underline" color="#f5a623">
          Sales Intelligence
        </Highlighter> Flow
        </h1>
        <p className="text-[18px] text-white/60 font-light max-w-xl mx-auto leading-relaxed">
          All paths lead to a complete sales
          intelligence report.
        </p>
      </motion.div>

      {/* Galeree-style Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-14"
      >
        {paths.map((path) => {
          const isSelected = selectedPath === path.id;
          const Icon = path.icon;

          return (
            <motion.div
              key={path.id}
              variants={cardVariants}
              onClick={() => onSelect(path.id)}
              className="flex flex-col cursor-pointer group"
            >
              {/* Thumbnail Container (Gradient Border) */}
              <div
                className={cn(
                  "relative p-[1px] w-full aspect-[5/4] rounded-2xl bg-gradient-to-br transition-all duration-500",
                  isSelected
                    ? "from-[#f5a623] to-[#ff6b35] shadow-[0_0_40px_rgba(245,166,35,0.1)] scale-[1.02]"
                    : "from-white/10 via-white/5 to-transparent group-hover:from-white/20"
                )}
              >
                {/* Content Container */}
                <div className="bg-[#030712]/40 backdrop-blur-2xl relative flex items-center justify-center w-full h-full p-2 rounded-[inherit] overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src={path.image}
                      alt={path.title}
                      fill
                      className="object-cover rounded-lg transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                  </div>
                </div>

                {/* Floating Blur Wrapper (Logo/Icon) */}
                <div
                  className={cn(
                    "absolute -bottom-[20px] right-[16px] z-20 p-[10px] rounded-[12px] flex items-center justify-center transition-all duration-500 group-hover:-translate-y-1 shadow-2xl",
                    isSelected
                      ? "bg-white border-white"
                      : "bg-[#030712]/80 backdrop-blur-xl border border-white/10"
                  )}
                >
                  <div className={cn(
                    "flex p-1.5 rounded-md items-center justify-center transition-colors",
                    isSelected ? "bg-gradient-to-b from-[#f5a623] to-[#ff6b35]" : "bg-white/5"
                  )}>
                    <Icon
                      className={cn("w-4 h-4", isSelected ? "text-white" : "text-white/40")}
                    />
                  </div>
                </div>
              </div>

              {/* Card Title (Below Thumbnail) */}
              <div className="mt-4 px-1 flex items-center justify-between">
                <h3 className={cn(
                  "text-[15px] font-medium tracking-wide transition-colors",
                  isSelected ? "text-[#f5a623]" : "text-white group-hover:text-white/80"
                )}>
                  {path.title}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
