"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CTAHeroProps {
  badgeText?: string;
  title?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  secondaryButtonSubtext?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  className?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function CTAHero({
  badgeText = "Welcome to PrebuiltUI",
  title = "Redefine your brand for a bold, future-ready presence.",
  primaryButtonText = "Get Started",
  secondaryButtonText = "Grab 15 minutes with us",
  secondaryButtonSubtext = "Available",
  avatarSrc = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
  avatarAlt = "Avatar",
  onPrimaryClick,
  onSecondaryClick,
  className,
  elementStyles = {},
}: CTAHeroProps) {
  return (
    <section
      className={cn("flex items-center justify-center p-4 py-20", className)}
      style={elementStyles.section}
    >
      <div
        className="relative w-full max-w-5xl bg-linear-to-bl from-primary to-primary/80 rounded-2xl border border-primary/50 px-6 py-16 pb-18 flex flex-col items-center text-center"
        style={elementStyles.container}
      >
        <div
          className="inline-block bg-background/10 backdrop-blur-md rounded-full px-6 py-2 mb-6"
          style={elementStyles.badge}
        >
          <span
            className="text-muted-foreground text-xs"
            style={elementStyles.badgeText}
          >
            {badgeText}
          </span>
        </div>

        <h1
          className="text-3xl md:text-[40px]/13 font-medium text-background mb-8 max-w-2xl leading-tight"
          style={elementStyles.title}
        >
          {title}
        </h1>

        <div
          className="flex flex-col sm:flex-row items-center gap-4"
          style={elementStyles.buttonContainer}
        >
          <button
            className="bg-background text-foreground rounded-full px-6 py-3.5 text-sm flex items-center gap-2 hover:bg-background/90 transition-all shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
            onClick={onPrimaryClick}
            style={elementStyles.primaryButton}
          >
            {primaryButtonText}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-4 h-4"
              style={elementStyles.primaryButtonIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>

          <button
            className="bg-background rounded-full p-1.5 pr-8 flex items-center gap-3 hover:bg-background/90 transition-all shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
            onClick={onSecondaryClick}
            style={elementStyles.secondaryButton}
          >
            <img
              src={avatarSrc}
              alt={avatarAlt}
              className="size-9 rounded-full object-cover"
              style={elementStyles.avatar}
            />
            <div
              className="text-left flex flex-col justify-center gap-0.5"
              style={elementStyles.secondaryButtonContent}
            >
              <span
                className="text-xs text-foreground leading-tight"
                style={elementStyles.secondaryButtonText}
              >
                {secondaryButtonText}
              </span>
              <span
                className="text-xs text-foreground font-medium leading-tight flex items-center gap-1"
                style={elementStyles.secondaryButtonSubtext}
              >
                {secondaryButtonSubtext}{" "}
                <span
                  className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"
                  style={elementStyles.availabilityIndicator}
                />
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
