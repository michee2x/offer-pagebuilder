"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CountdownOptInProps {
  title?: string;
  subtitle?: string;
  callout?: string;
  buttonText?: string;
  inputPlaceholder?: string;
  targetDate?: string | Date;
  onSubmit?: (email: string) => void;
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

export function CountdownOptIn({
  title = "Get Instant Access Before Timer Expires",
  subtitle = "Download our $497 funnel template collection for free",
  callout = "Offer expires in:",
  buttonText = "Get Access →",
  inputPlaceholder = "Enter your email address",
  targetDate = new Date(Date.now() + 1000 * 60 * 15),
  onSubmit,
  className = "",
  style = {},
  elementStyles = {},
}: CountdownOptInProps) {
  const deadline = useMemo(() => new Date(targetDate), [targetDate]);
  const [time, setTime] = useState(getTimeRemaining(deadline));
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(getTimeRemaining(deadline));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    onSubmit?.(email.trim());
  };

  return (
    <section
      className={cn(
        "w-full rounded-[2rem] border border-border bg-card/80 px-6 py-8 shadow-xl backdrop-blur-xl",
        className,
      )}
      style={style}
    >
      <div
        className="max-w-xl mx-auto text-center"
        style={elementStyles.container}
      >
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg"
          style={elementStyles.iconWrapper}
        >
          <Mail
            className="h-6 w-6 text-background"
            style={elementStyles.icon}
          />
        </div>

        <h2
          className="mt-6 text-3xl font-semibold tracking-tight text-foreground"
          style={elementStyles.title}
        >
          {title}
        </h2>

        <p
          className="mt-3 text-sm text-muted-foreground"
          style={elementStyles.subtitle}
        >
          {subtitle}
        </p>

        <div
          className="mt-8 rounded-3xl border border-border bg-muted/70 px-6 py-6"
          style={elementStyles.timerCard}
        >
          <p
            className="text-sm uppercase tracking-[0.24em] text-muted-foreground"
            style={elementStyles.callout}
          >
            {callout}
          </p>
          <div
            className="mt-4 flex items-center justify-center gap-3 text-center text-4xl font-bold text-foreground sm:text-5xl"
            style={elementStyles.timer}
          >
            <span>{String(time.minutes).padStart(2, "0")}m</span>
            <span>{String(time.seconds).padStart(2, "0")}s</span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto]"
          style={elementStyles.form}
        >
          <label className="sr-only" htmlFor="countdown-email">
            Email
          </label>
          <input
            id="countdown-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={inputPlaceholder}
            className="min-w-0 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            style={elementStyles.input}
          />
          <button
            type="submit"
            className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            style={elementStyles.submitButton}
          >
            {buttonText}
          </button>
        </form>

        {submitted && (
          <p
            className="mt-4 text-sm text-primary text-center"
            style={elementStyles.thankYou}
          >
            Thanks! We’ll email you the access details.
          </p>
        )}
      </div>
    </section>
  );
}
