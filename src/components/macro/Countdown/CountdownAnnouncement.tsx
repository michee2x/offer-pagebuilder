"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface CountdownAnnouncementProps {
  title?: string;
  message?: string;
  buttonText?: string;
  buttonHref?: string;
  targetDate?: string | Date;
  showClose?: boolean;
  onClose?: () => void;
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

export function CountdownAnnouncement({
  title = "30% off PRO ends soon",
  message = "Lock in your annual plan today.",
  buttonText = "Shop now",
  buttonHref = "#",
  targetDate = new Date(Date.now() + 1000 * 60 * 60 * 8.5),
  showClose = true,
  onClose,
  className = "",
  style = {},
  elementStyles = {},
}: CountdownAnnouncementProps) {
  const deadline = useMemo(() => new Date(targetDate), [targetDate]);
  const [time, setTime] = useState(getTimeRemaining(deadline));
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (time.total <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setTime(getTimeRemaining(deadline));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [deadline, time.total]);

  if (isClosed) return null;

  return (
    <section
      className={cn(
        "w-full overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg",
        className,
      )}
      style={style}
    >
      <div
        className="relative flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between"
        style={elementStyles.container}
      >
        <div
          className="flex flex-col gap-2 text-center lg:text-left"
          style={elementStyles.content}
        >
          <p
            className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground/90"
            style={elementStyles.subtitle}
          >
            {title}
          </p>
          <div
            className="flex flex-col gap-1 text-sm text-primary-foreground/90 sm:flex-row sm:items-center sm:gap-3"
            style={elementStyles.messageRow}
          >
            <span>{message}</span>
            <span className="hidden sm:inline">•</span>
            <span className="font-medium">Limited time offer</span>
          </div>
        </div>

        <div
          className="flex flex-col items-center gap-3 sm:flex-row sm:items-center"
          style={elementStyles.actions}
        >
          <div
            className="flex items-center gap-2 rounded-3xl bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-inner backdrop-blur-sm"
            style={elementStyles.timerGroup}
          >
            <CountdownDigit
              label="hrs"
              value={time.hours}
              style={elementStyles.timerDigit}
            />
            <CountdownDigit
              label="mins"
              value={time.minutes}
              style={elementStyles.timerDigit}
            />
            <CountdownDigit
              label="secs"
              value={time.seconds}
              style={elementStyles.timerDigit}
            />
          </div>

          <a
            href={buttonHref}
            className="inline-flex items-center justify-center rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-background/90"
            style={elementStyles.button}
          >
            {buttonText}
          </a>
        </div>

        {showClose && (
          <button
            type="button"
            onClick={() => {
              setIsClosed(true);
              onClose?.();
            }}
            className="absolute top-3 right-3 rounded-full p-2 text-primary-foreground/80 transition hover:bg-white/10 hover:text-primary-foreground"
            style={elementStyles.closeButton}
            aria-label="Close announcement"
          >
            <span className="block h-4 w-4 leading-none">×</span>
          </button>
        )}
      </div>
    </section>
  );
}

function CountdownDigit({
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
      className="flex flex-col items-center rounded-2xl bg-white/15 px-3 py-2 text-center"
      style={style}
    >
      <span className="text-base font-bold tabular-nums text-white">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/75">
        {label}
      </span>
    </div>
  );
}
