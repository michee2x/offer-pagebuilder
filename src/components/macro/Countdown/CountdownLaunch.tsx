"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CountdownLaunchProps {
  badgeText?: string;
  headline?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  targetDate?: string | Date;
  leftGraphic?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

function getCountdown(target: Date) {
  const total = Math.max(target.getTime() - new Date().getTime(), 0);
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
  };
}

export function CountdownLaunch({
  badgeText = "Limited offer",
  headline = "Lifetime Access at Launch Pricing",
  description = "Join 1,847 founders who locked in lifetime access. Price increases permanently when timer hits zero.",
  buttonText = "Lock In Lifetime Access →",
  buttonHref = "#",
  targetDate = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 8 + 1000 * 60 * 60 * 14 + 1000 * 60 * 36,
  ),
  leftGraphic,
  className = "",
  style = {},
  elementStyles = {},
}: CountdownLaunchProps) {
  const deadline = useMemo(() => new Date(targetDate), [targetDate]);
  const [time, setTime] = useState(getCountdown(deadline));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(getCountdown(deadline));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  return (
    <section
      className={cn(
        "w-full rounded-4xl border border-border bg-card text-foreground shadow-2xl",
        className,
      )}
      style={style}
    >
      <div
        className="grid gap-8 md:grid-cols-2 lg:gap-10 p-6 sm:p-8 lg:p-10"
        style={elementStyles.container}
      >
        <div
          className="relative overflow-hidden rounded-[1.75rem] bg-linear-to-br from-primary/15 via-transparent to-background p-6 flex items-center justify-center"
          style={elementStyles.leftPanel}
        >
          {leftGraphic ? (
            leftGraphic
          ) : (
            <div className="flex h-56 w-full items-center justify-center rounded-3xl bg-slate-950/20 p-6">
              <Clock3 className="h-20 w-20 text-primary" />
            </div>
          )}
        </div>

        <div
          className="flex flex-col justify-center gap-6"
          style={elementStyles.rightPanel}
        >
          <span
            className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary"
            style={elementStyles.badge}
          >
            {badgeText}
          </span>

          <div className="space-y-4">
            <h2
              className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              style={elementStyles.headline}
            >
              {headline}
            </h2>
            <p
              className="text-sm leading-7 text-muted-foreground"
              style={elementStyles.description}
            >
              {description}
            </p>
          </div>

          <div
            className="grid grid-cols-3 gap-4"
            style={elementStyles.timerGrid}
          >
            <CountdownCard
              label="days"
              value={time.days}
              style={elementStyles.timerCard}
            />
            <CountdownCard
              label="hrs"
              value={time.hours}
              style={elementStyles.timerCard}
            />
            <CountdownCard
              label="min"
              value={time.minutes}
              style={elementStyles.timerCard}
            />
          </div>

          <a
            href={buttonHref}
            className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            style={elementStyles.button}
          >
            {buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}

function CountdownCard({
  label,
  value,
  style,
}: {
  label: string;
  value: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="rounded-3xl border border-border bg-background/70 py-6 text-center shadow-sm"
      style={style}
    >
      <div className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
