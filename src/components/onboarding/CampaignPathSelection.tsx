"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { FileText, Lightbulb, Sparkles, Globe, Compass, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Highlighter } from "@/components/ui/highlighter";

export type CampaignPathType = "idea" | "scratch" | "pdf" | "website" | "parent_has_idea" | null;

interface CampaignPathSelectionProps {
  step: "path" | "idea_subpath";
  onSelect: (path: CampaignPathType) => void;
  selectedPath: CampaignPathType;
}

const parentPaths = [
  {
    id: "parent_has_idea" as CampaignPathType,
    icon: Lightbulb,
    title: "Analyse & Build My Offer →",
    description: "I have an offer or idea — build me the complete intelligence report, copy, and funnel.",
    image: "https://framerusercontent.com/images/ocTUXzjdGN7azeFQ4br4ScyHbYA.jpg?scale-down-to=1024&width=1440&height=1080",
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    shadow: "shadow-[0_0_50px_rgba(59,130,246,0.15)]",
  },
  {
    id: "scratch" as CampaignPathType,
    icon: Compass,
    title: "Build an Offer for Me →",
    description: "I don't have an offer yet — show me validated ideas I can deploy and start selling immediately.",
    image: "https://framerusercontent.com/images/JHKo9Ag0unotBN7sVIks5pWsQg.webp?width=1600&height=1200",
    gradient: "from-violet-500 via-purple-500 to-pink-500",
    shadow: "shadow-[0_0_50px_rgba(168,85,247,0.15)]",
  },
];

const subPaths = [
  {
    id: "idea" as CampaignPathType,
    icon: Lightbulb,
    title: "Describe Your Offer",
    description: "Answer a few questions. OfferIQ uses your answers to build the complete intelligence report — no technical knowledge needed.",
    image: "https://framerusercontent.com/images/ocTUXzjdGN7azeFQ4br4ScyHbYA.jpg?scale-down-to=1024&width=1440&height=1080",
    gradient: "from-blue-500 to-indigo-500",
    shadow: "shadow-[0_0_30px_rgba(59,130,246,0.1)]",
  },
  {
    id: "website" as CampaignPathType,
    icon: Globe,
    title: "From a Website",
    description: "Paste any live URL - your own sales page or a competitor's offer. OfferIQ reads it and builds your intelligence report from what it finds.",
    image: "https://framerusercontent.com/images/5RoHhzBwXKlzmqGgZlmjqnERe5s.jpeg?scale-down-to=1024&width=1600&height=1200",
    gradient: "from-indigo-500 to-cyan-500",
    shadow: "shadow-[0_0_30px_rgba(99,102,241,0.1)]",
  },
  {
    id: "pdf" as CampaignPathType,
    icon: FileText,
    title: "Upload a DOC/PDF",
    description: "Upload a pitch doc, offer summary or any file that describes your offer. OfferIQ extracts what it needs and builds from there.",
    image: "https://framerusercontent.com/images/Gs177VTHhuZMszsLfkXbl7X30Cg.jpg?scale-down-to=1024&width=1440&height=1080",
    gradient: "from-violet-500 to-pink-500",
    shadow: "shadow-[0_0_30px_rgba(168,85,247,0.1)]",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function CampaignPathSelection({
  step,
  onSelect,
  selectedPath,
}: CampaignPathSelectionProps) {
  const currentPaths = step === "path" ? parentPaths : subPaths;

  return (
    <div className="max-w-[900px] mx-auto w-full relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-14 text-center"
      >
        <h1 className="text-[44px] md:text-[56px] font-semibold text-white tracking-tight mb-4 leading-tight">
          {step === "path" ? (
            <>
              How Do You <br />
              <Highlighter action="underline" color="#818cf8">
                Want to Start?
              </Highlighter>
            </>
          ) : (
            <>
              Give OfferIQ <br />
              <Highlighter action="underline" color="#a855f7">
                Your Offer Details
              </Highlighter>
            </>
          )}
        </h1>
        <p className="text-[17px] md:text-[18px] text-white/50 font-light max-w-xl mx-auto leading-relaxed">
          {step === "path" ? (
            "Tell us where you're starting from. OfferIQ does the rest."
          ) : (
            "Choose how you want to share your offer with OfferIQ. We'll do the rest."
          )}
        </p>
      </motion.div>

      {/* Grid container with glassmorphic cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={cn(
          "grid gap-x-8 gap-y-12",
          step === "path" ? "grid-cols-1 sm:grid-cols-2 max-w-[760px] mx-auto" : "grid-cols-1 sm:grid-cols-3"
        )}
      >
        {currentPaths.map((path) => {
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
                    ? cn("bg-gradient-to-br scale-[1.02]", path.gradient, path.shadow)
                    : "from-white/10 via-white/5 to-transparent group-hover:from-white/20"
                )}
              >
                {/* Content Container */}
                <div className="bg-[#0b0f19]/70 backdrop-blur-2xl relative flex items-center justify-center w-full h-full p-1.5 rounded-[inherit] overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src={path.image}
                      alt={path.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                      className="object-cover rounded-xl transition-all duration-700 opacity-90 group-hover:opacity-100 group-hover:scale-[1.04] filter saturate-[0.85] group-hover:saturate-100"
                    />
                  </div>
                </div>

                {/* Floating Blur Wrapper (Logo/Icon) */}
                <div
                  className={cn(
                    "absolute -bottom-[20px] right-[16px] z-20 p-[10px] rounded-[12px] flex items-center justify-center transition-all duration-500 group-hover:-translate-y-1 shadow-2xl",
                    isSelected
                      ? "bg-white border-white"
                      : "bg-[#0b0f19]/90 backdrop-blur-xl border border-white/10"
                  )}
                >
                  <div
                    className={cn(
                      "flex p-1.5 rounded-md items-center justify-center transition-all",
                      isSelected ? cn("bg-gradient-to-b text-white", path.gradient) : "bg-white/5 text-white/40"
                    )}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                </div>
              </div>

              {/* Card Title & Description */}
              <div className="mt-5 px-1">
                <div className="flex items-center justify-between mb-1.5">
                  <h3
                    className={cn(
                      "text-[16px] font-semibold tracking-wide transition-colors",
                      isSelected ? "text-white" : "text-white/90 group-hover:text-white"
                    )}
                  >
                    {path.title}
                  </h3>
                  {step === "path" && (
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                  )}
                </div>
                <p className="text-[13px] text-white/40 leading-relaxed font-light group-hover:text-white/50 transition-colors">
                  {path.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
