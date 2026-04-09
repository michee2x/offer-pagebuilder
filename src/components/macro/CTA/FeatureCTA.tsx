"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  hasAccent?: boolean;
}

export interface FeatureCTAProps {
  title?: string;
  subtitle?: string;
  features?: FeatureItem[];
  sectionId?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

const defaultFeatures: FeatureItem[] = [
  {
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 17 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="M8.25 15.75a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.598 3.066C10.665 6.104 6.75 7.08.938 7.454m14.625 1.429c-4.966-1.057-9.106.75-12.285 4.74"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.67 1.313c3.278 4.5 4.5 7.065 6 13.29"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "User-first design",
    description:
      "We design with real users in mind, focusing on clarity, usability and accessibility from day one.",
    hasAccent: false,
  },
  {
    icon: (
      <svg
        width="20"
        height="16"
        viewBox="0 0 20 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="M16.05.75H3.45a1.8 1.8 0 0 0-1.8 1.8v7.2a1.8 1.8 0 0 0 1.8 1.8h12.6a1.8 1.8 0 0 0 1.8-1.8v-7.2a1.8 1.8 0 0 0-1.8-1.8M.75 15.148h18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Fully responsive",
    description:
      "Interfaces that look and feel great on desktop, tablet and mobile, no compromises.",
    hasAccent: true,
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <g clipPath="url(#a)">
          <path
            d="M8 14.665A6.667 6.667 0 1 0 8 1.332a6.667 6.667 0 0 0 0 13.333"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 1.332a9.667 9.667 0 0 0 0 13.333A9.667 9.667 0 0 0 8 1.332M1.333 8h13.334"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="a">
            <path fill="transparent" d="M0 0h16v16H0z" />
          </clipPath>
        </defs>
      </svg>
    ),
    title: "Global-ready UX",
    description:
      "Clean files, clear specs and developer-friendly documentation - ready to build.",
    hasAccent: false,
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <g clipPath="url(#a)">
          <path
            d="M8.553 1.452a1.33 1.33 0 0 0-1.106 0l-5.714 2.6a.667.667 0 0 0 0 1.22l5.72 2.607a1.33 1.33 0 0 0 1.107 0l5.72-2.6a.667.667 0 0 0 0-1.22z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1.333 8a.67.67 0 0 0 .387.607l5.733 2.606a1.33 1.33 0 0 0 1.1 0l5.72-2.6A.67.67 0 0 0 14.667 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1.333 11.332a.67.67 0 0 0 .387.607l5.733 2.606a1.33 1.33 0 0 0 1.1 0l5.72-2.6a.67.67 0 0 0 .394-.613"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="a">
            <path fill="transparent" d="M0 0h16v16H0z" />
          </clipPath>
        </defs>
      </svg>
    ),
    title: "Scalable systems",
    description:
      "Consistent components, tokens and patterns built to grow with your product.",
    hasAccent: false,
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="M11.333 1.332 14 3.999l-2.667 2.666"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 7.333v-.666A2.667 2.667 0 0 1 4.667 4H14M4.667 14.665 2 12l2.667-2.667"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 8.668v.667A2.667 2.667 0 0 1 11.333 12H2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Easy to iterate",
    description:
      "Flexible designs that adapt quickly as your product, users and goals evolve.",
    hasAccent: false,
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="M2.667 9.334a.667.667 0 0 1-.52-1.087l6.6-6.8a.333.333 0 0 1 .573.307L8.04 5.767a.667.667 0 0 0 .627.9h4.666a.666.666 0 0 1 .52 1.087l-6.6 6.8a.334.334 0 0 1-.573-.307l1.28-4.013a.667.667 0 0 0-.627-.9z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Performance-aware",
    description:
      "Optimized layouts and interactions that support fast load times and smooth experiences.",
    hasAccent: false,
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <g clipPath="url(#a)">
          <path
            d="M9.8 4.201a.667.667 0 0 0 0 .933l1.067 1.067a.666.666 0 0 0 .933 0l2.07-2.07c.214-.215.576-.147.656.145A4 4 0 0 1 9.02 8.981l-5.273 5.274a1.414 1.414 0 0 1-2-2L7.021 6.98a4 4 0 0 1 4.704-5.506c.292.08.36.441.146.656z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="a">
            <path fill="transparent" d="M0 0h16v16H0z" />
          </clipPath>
        </defs>
      </svg>
    ),
    title: "Tool-friendly",
    description:
      "Designs built with localization, multiple languages and diverse audiences in mind.",
    hasAccent: false,
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="m10.667 12 4-4-4-4M5.333 4l-4 4 4 4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Dev-ready handoff",
    description:
      "From startups to enterprise, our designs integrate seamlessly with your existing workflows.",
    hasAccent: false,
  },
];

export function FeatureCTA({
  title = "Designed for real products",
  subtitle = "We create thoughtfully crafted experiences that serve real users while driving meaningful business outcomes.",
  features = defaultFeatures,
  sectionId = "",
  className = "",
  style = {},
  elementStyles = {},
}: FeatureCTAProps) {
  return (
    <section
      id={sectionId || undefined}
      className={cn(
        "w-full py-20 px-6 flex justify-center scroll-mt-24",
        className,
      )}
      style={style}
    >
      <div className="w-full max-w-6xl" style={elementStyles.container}>
        <div
          className="max-w-3xl mx-auto mb-10 text-center"
          style={elementStyles.heading}
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t border-l border-border rounded-4xl overflow-hidden"
          style={elementStyles.grid}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "relative group p-6 md:p-8 flex flex-col gap-4 border-r border-b border-border transition-colors duration-200 bg-background hover:bg-primary/5",
                index === 0 &&
                  "bg-linear-to-b from-background to-primary/10 hover:bg-primary/10",
              )}
              style={elementStyles.featureCard}
            >
              {feature.hasAccent && (
                <span
                  className="absolute inset-y-6 left-0 w-1.5 rounded-r-full bg-primary"
                  style={elementStyles.accentStripe}
                />
              )}

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3
                  className="text-base font-semibold text-foreground leading-snug"
                  style={elementStyles.featureTitle}
                >
                  {feature.title}
                </h3>
              </div>

              <p
                className="text-sm text-muted-foreground leading-relaxed"
                style={elementStyles.featureDescription}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
