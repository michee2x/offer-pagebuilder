"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { useBuilderStore } from "@/store/builderStore";
import { COMPONENT_REGISTRY, ComponentType } from "@/config/components";
import { SECTION_SKELETONS } from "./SectionSkeletons";
import { LayoutTemplate, PlusCircle, X } from "lucide-react";

// Category definitions
const CATEGORIES = {
  "All Sections": "all",
  Headers: "headers",
  Heroes: "heroes",
  Features: "features",
  Content: "content",
  FAQ: "faq",
  CTA: "cta",
  Pricing: "pricing",
  Footer: "footer",
  Countdown: "countdown",
  Testimonials: "testimonials",
  Funnel: "funnel",
} as const;

// Component categorization logic
const getComponentCategory = (type: string): string => {
  if (type.includes("Header")) return "headers";
  if (type.includes("Hero") || type.includes("hero")) return "heroes";
  if (type.includes("Features")) return "features";
  if (type.includes("Split") || type.includes("Content")) return "content";
  if (type.includes("FAQ")) return "faq";
  if (type.includes("CTA")) return "cta";
  if (type.includes("Pricing") || type.includes("Cards")) return "pricing";
  if (type.includes("Footer")) return "footer";
  if (type.includes("Countdown")) return "countdown";
  if (type.includes("Testimonials")) return "testimonials";
  if (
    type.includes("Upsell") ||
    type.includes("Downsell") ||
    type.includes("ThankYou")
  )
    return "funnel";
  return "all";
};

// ─── Card — purely a static skeleton, ZERO live component rendering ─────────
const SectionCard = memo(function SectionCard({
  type,
  conf,
  onInsert,
}: {
  type: string;
  conf: (typeof COMPONENT_REGISTRY)[ComponentType];
  onInsert: () => void;
}) {
  const skeleton = SECTION_SKELETONS[type as ComponentType];

  return (
    <div
      onClick={onInsert}
      className="group relative border border-border/50 bg-background rounded-xl p-3 cursor-pointer hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all overflow-hidden flex flex-col"
    >
      {/* Skeleton preview */}
      <div className="aspect-[16/9] w-full bg-background rounded-lg mb-3 flex flex-col relative overflow-hidden border border-border/30 group-hover:border-blue-500/20 transition-colors">
        <div className="absolute inset-0 overflow-hidden">
          {skeleton ?? (
            // Generic fallback if no skeleton defined
            <div className="flex flex-col gap-2 p-3">
              <div className="h-3 w-1/3 rounded bg-muted-foreground/15" />
              <div className="h-3 w-2/3 rounded bg-muted-foreground/10" />
              <div className="h-16 w-full rounded-lg bg-muted-foreground/8 mt-1" />
            </div>
          )}
        </div>

        {/* Hover-insert CTA overlay */}
        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform duration-200">
            <PlusCircle className="w-4 h-4" /> Insert
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {conf.label}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {conf.semantic?.purpose}
        </p>
      </div>
    </div>
  );
});

// ─── Custom Modal Component ─────────────────────────────────────────────────
const CustomModal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-[95vw] max-w-5xl bg-background border border-border/50 shadow-2xl rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// ─── Main modal ─────────────────────────────────────────────────────────────
export function SectionLibraryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { addComponent } = useBuilderStore();

  useEffect(() => {
    const handleOpen = (e: any) => {
      setInsertIndex(e.detail?.index ?? 0);
      setIsOpen(true);
    };
    window.addEventListener("OPEN_SECTION_MODAL", handleOpen);
    return () => window.removeEventListener("OPEN_SECTION_MODAL", handleOpen);
  }, []);

  const macroComponents = Object.entries(COMPONENT_REGISTRY).filter(
    ([type, conf]) =>
      conf.semantic &&
      !type.startsWith("HeyMessage") &&
      !type.includes("Logos"),
  );

  const filteredComponents =
    selectedCategory === "all"
      ? macroComponents
      : macroComponents.filter(
          ([type]) => getComponentCategory(type) === selectedCategory,
        );

  const handleInsert = useCallback(
    (type: string) => {
      addComponent(type as ComponentType, "root", insertIndex);
      setIsOpen(false);
    },
    [addComponent, insertIndex],
  );

  const handleCategoryClick = (categoryKey: string) => {
    setSelectedCategory(CATEGORIES[categoryKey as keyof typeof CATEGORIES]);
  };

  return (
    <CustomModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      {/* Close Button */}
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted/80 bg-background/50 backdrop-blur-md text-muted-foreground hover:text-foreground transition-all z-[100] border border-border/50 shadow-sm focus:outline-none"
      >
        <span className="sr-only">Close</span>
        <X className="w-4 h-4" />
      </button>

      <div className="flex h-[80vh] max-h-[800px]">
        {/* Sidebar */}
        <div className="w-52 border-r border-border/50 bg-muted/20 p-4 shrink-0 flex flex-col gap-1.5 overflow-y-auto">
          <h2 className="font-semibold px-2 mb-4 text-sm flex items-center gap-2 text-foreground">
            <LayoutTemplate className="w-4 h-4 text-blue-500" /> Block Library
          </h2>
          {Object.keys(CATEGORIES).map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => handleCategoryClick(label)}
              className={`text-left px-3 py-2 text-sm rounded-md font-medium transition-colors ${
                CATEGORIES[label as keyof typeof CATEGORIES] ===
                selectedCategory
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid — pure static DOM, silky smooth scrolling */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="mb-5">
            <h1 className="text-xl font-bold tracking-tight">
              Choose a section
            </h1>
            <p className="text-sm text-muted-foreground">
              Click any block to insert it into your page.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredComponents.map(([type, conf]) => (
              <SectionCard
                key={type}
                type={type}
                conf={conf as any}
                onInsert={() => handleInsert(type)}
              />
            ))}
          </div>
        </div>
      </div>
    </CustomModal>
  );
}
