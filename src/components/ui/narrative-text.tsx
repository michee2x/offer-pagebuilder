"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface NarrativeTextProps {
  text: string;
  className?: string;
}

export function NarrativeText({ text, className }: NarrativeTextProps) {
  return (
    <div
      className={cn(
        "text-sm text-foreground leading-relaxed whitespace-pre-wrap",
        className,
      )}
    >
      {text}
    </div>
  );
}
