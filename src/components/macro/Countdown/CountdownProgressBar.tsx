"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface CountdownProgressBarProps {
  title?: string;
  subtitle?: string;
  eventLabel?: string;
  startDate?: string | Date;
  targetDate?: string | Date;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

function getCountdownValues(start: Date, target: Date) {
  const now = new Date();
  const totalDuration = Math.max(target.getTime() - start.getTime(), 0);
  const remainingMs = Math.max(target.getTime() - now.getTime(), 0);
  const elapsedMs = Math.min(
    Math.max(now.getTime() - start.getTime(), 0),
    totalDuration,
  );

  const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);
  const seconds = Math.floor((remainingMs / 1000) % 60);

  const remainingPercentage =
    totalDuration > 0
      ? Math.max(0, Math.min(100, (remainingMs / totalDuration) * 100))
      : 0;

  return {
    remainingMs,
    hours,
    minutes,
    seconds,
    remainingPercentage,
    totalDuration,
    elapsedMs,
  };
}

export function CountdownProgressBar({
  title = "Early Bird Pricing Active",
  subtitle = "Price returns to $297 when timer expires",
  eventLabel = "4h 23m remaining",
  startDate = new Date(),
  targetDate = new Date(Date.now() + 1000 * 60 * 60 * 4 + 1000 * 60 * 23),
  className = "",
  style = {},
  elementStyles = {},
}: CountdownProgressBarProps) {
  const start = useMemo(() => new Date(startDate), [startDate]);
  const target = useMemo(() => new Date(targetDate), [targetDate]);
  const [countdown, setCountdown] = useState(() =>
    getCountdownValues(start, target),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdown(getCountdownValues(start, target));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [start, target]);

  const progressWidth = `${countdown.remainingPercentage}%`;
  const progressLabel = `${String(countdown.hours).padStart(2, "0")}h ${String(countdown.minutes).padStart(2, "0")}m remaining`;

  return (
    <section
      className={cn(
        "w-full rounded-3xl border border-border bg-card/90 p-6 shadow-2xl",
        className,
      )}
      style={style}
    >
      <div className="flex flex-col gap-6" style={elementStyles.container}>
        <div
          className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
          style={elementStyles.header}
        >
          <div className="space-y-2" style={elementStyles.titleGroup}>
            <h2
              className="text-xl font-semibold text-foreground"
              style={elementStyles.title}
            >
              {title}
            </h2>
            <p
              className="text-sm text-muted-foreground"
              style={elementStyles.subtitle}
            >
              {subtitle}
            </p>
          </div>
          <p
            className="text-lg font-semibold text-primary sm:text-xl"
            style={elementStyles.eventLabel}
          >
            {progressLabel}
          </p>
        </div>

        <div
          className="rounded-3xl border border-border bg-background/40 p-4"
          style={elementStyles.progressPanel}
        >
          <div
            className="mb-4 flex items-center justify-between text-sm text-muted-foreground"
            style={elementStyles.progressHeader}
          >
            <span>{eventLabel}</span>
            <span>{countdown.remainingPercentage.toFixed(0)}%</span>
          </div>
          <div
            className="h-3 rounded-full bg-muted/30 overflow-hidden"
            style={elementStyles.progressTrack}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: progressWidth, ...elementStyles.progressFill }}
            />
          </div>
        </div>

        <div
          className="text-center text-sm text-muted-foreground"
          style={elementStyles.footerText}
        >
          {countdown.remainingMs <= 0
            ? "Offer expired."
            : "Price returns to $297 when timer expires"}
        </div>
      </div>
    </section>
  );
}
