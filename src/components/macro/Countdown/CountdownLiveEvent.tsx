"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface CountdownLiveEventProps {
  badgeText?: string;
  headline?: string;
  subtitle?: string;
  eventDateText?: string;
  buttonText?: string;
  buttonHref?: string;
  targetDate?: string | Date;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

function getTimeRemaining(target: Date) {
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

export function CountdownLiveEvent({
  badgeText = "LIVE EVENT",
  headline = "Free Masterclass: 7-Figure Funnel Secrets",
  subtitle = "Join 2,847 founders learning our proven framework",
  eventDateText = "Thursday, April 10th • 2:00 PM EST",
  buttonText = "Save My Seat (Free) →",
  buttonHref = "#",
  targetDate = new Date(
    Date.now() +
      1000 * 60 * 60 * 24 * 2 +
      1000 * 60 * 60 * 14 +
      1000 * 60 * 36 +
      1000 * 20,
  ),
  className = "",
  style = {},
  elementStyles = {},
}: CountdownLiveEventProps) {
  const deadline = useMemo(() => new Date(targetDate), [targetDate]);
  const [time, setTime] = useState(getTimeRemaining(deadline));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(getTimeRemaining(deadline));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  return (
    <section
      className={cn(
        "w-full rounded-4xl border border-border bg-card shadow-2xl",
        className,
      )}
      style={style}
    >
      <div
        className="relative overflow-hidden rounded-4xl px-6 py-8 sm:px-10 sm:py-10"
        style={elementStyles.container}
      >
        <div
          className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-60"
          aria-hidden="true"
        />
        <div className="relative flex flex-col items-center gap-8 text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary"
            style={elementStyles.badge}
          >
            <span
              className="h-2 w-2 rounded-full bg-red-500"
              style={elementStyles.badgeDot}
            />
            {badgeText}
          </span>

          <div className="space-y-3">
            <h2
              className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              style={elementStyles.headline}
            >
              {headline}
            </h2>
            <p
              className="max-w-2xl text-sm text-muted-foreground sm:text-base"
              style={elementStyles.subtitle}
            >
              {subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <CountdownCard
              label="days"
              value={time.days}
              style={elementStyles.countdownCard}
            />
            <CountdownCard
              label="hours"
              value={time.hours}
              style={elementStyles.countdownCard}
            />
            <CountdownCard
              label="minutes"
              value={time.minutes}
              style={elementStyles.countdownCard}
            />
            <CountdownCard
              label="seconds"
              value={time.seconds}
              style={elementStyles.countdownCard}
            />
          </div>

          <div
            className="mt-2 rounded-3xl border border-border bg-background/50 px-6 py-4 text-sm text-muted-foreground"
            style={elementStyles.eventDate}
          >
            {eventDateText}
          </div>

          <a
            href={buttonHref}
            className="inline-flex w-full max-w-xs items-center justify-center rounded-2xl bg-linear-to-r from-primary to-secondary px-6 py-4 text-sm font-semibold text-primary-foreground shadow-lg transition hover:from-primary/90 hover:to-secondary/90"
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
      className="rounded-3xl border border-border bg-background/80 px-4 py-5 text-center shadow-sm"
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
