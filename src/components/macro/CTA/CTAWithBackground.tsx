"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CTAWithBackgroundProps {
  title?: string;
  highlightText?: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  backgroundImageUrl?: string;
  className?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function CTAWithBackground({
  title = "Build website",
  highlightText = "without writing Code",
  subtitle = "Create high-quality landing pages and websites faster using ready-made, customizable components.",
  buttonText = "Get templates for free",
  buttonHref = "#",
  backgroundImageUrl = "https://assets.prebuiltui.com/images/components/cta/cta-grid-bg.png",
  className,
  elementStyles = {},
}: CTAWithBackgroundProps) {
  return (
    <section
      className={cn("bg-background py-16 px-4", className)}
      style={elementStyles.section}
    >
      <div
        className="max-w-5xl mx-auto bg-linear-to-b from-muted/50 to-muted/20 border border-border rounded-[20px] px-8 py-12 md:py-20 bg-cover bg-center bg-no-repeat"
        style={{
          ...elementStyles.container,
          backgroundImage: `url(${backgroundImageUrl})`,
        }}
      >
        <div className="text-center" style={elementStyles.content}>
          <h1
            className="text-3xl md:text-5xl/14 leading-tight font-semibold tracking-tighter max-w-xl mx-auto mb-4"
            style={elementStyles.title}
          >
            {title}{" "}
            <span className="bg-linear-to-r from-primary to-muted-foreground bg-clip-text text-transparent">
              {highlightText}
            </span>
          </h1>
          <p
            className="text-sm text-muted-foreground max-w-md mx-auto mb-8"
            style={elementStyles.subtitle}
          >
            {subtitle}
          </p>
          <a
            href={buttonHref}
            className="bg-linear-to-b from-foreground to-muted-foreground text-background text-sm px-6 py-3 rounded-lg border border-border inline-flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer group"
            style={elementStyles.button}
          >
            <div className="relative overflow-hidden">
              <span className="block transition-transform duration-200 group-hover:-translate-y-full">
                {buttonText}
              </span>
              <span className="absolute top-0 left-0 block transition-transform duration-200 group-hover:translate-y-0 translate-y-full">
                {buttonText}
              </span>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={elementStyles.buttonIcon}
            >
              <path
                d="m5.833 14.168 8.334-8.333m0 8.333V5.835H5.833"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
