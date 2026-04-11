"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  value: number;
  className?: string;
}

export function ScoreBar({ label, value, className }: ScoreBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold">{value}/100</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}