"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "muted";
}

export function Spinner({ className, size = "md", color = "primary" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-2",
    xl: "h-16 w-16 border-3",
  };

  const colorClasses = {
    primary: "border-brand-yellow border-t-transparent",
    white: "border-white border-t-transparent",
    muted: "border-slate-500 border-t-transparent",
  };

  return (
    <div
      className={cn(
        "rounded-full animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}
