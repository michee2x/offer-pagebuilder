"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "blue" | "white" | "muted";
}

/**
 * Primary app loader — the mini blue spinning ring.
 * Used everywhere a loading indicator is needed, except for
 * dedicated full-screen generation loading boards (page generation,
 * email sequence generation, etc.) which have their own branded screens.
 *
 * Usage:
 *   <Spinner />                        — centered, medium, blue
 *   <Spinner size="sm" />              — small (e.g. inside buttons)
 *   <Spinner size="sm" color="white" /> — white variant for dark buttons
 *   <Spinner size="lg" />              — large (e.g. page-level loading)
 */
export function Spinner({ className, size = "md", color = "blue" }: SpinnerProps) {
  const sizeClasses = {
    xs: "h-3 w-3 border-[1.5px]",
    sm: "h-4 w-4 border-2",
    md: "h-10 w-10 border-4",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4",
  };

  const colorClasses = {
    blue: "border-brand-blue/30 border-t-brand-blue",
    white: "border-white/30 border-t-white",
    muted: "border-white/10 border-t-white/30",
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

/**
 * Full-screen centered loader — wraps <Spinner> in a centered container.
 * Use for page-level loading states (replaces the old manual spinner + text patterns).
 */
export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center", className)}>
      <Spinner size="md" color="blue" />
    </div>
  );
}
