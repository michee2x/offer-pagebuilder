"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FeatureCardItem {
  image: string;
  title: string;
  description: string;
}

export interface FeaturesCardsProps {
  title?: string;
  subtitle?: string;
  features?: FeatureCardItem[];
  sectionId?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

const defaultFeatures: FeatureCardItem[] = [
  {
    image:
      "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-1.png",
    title: "Feedback analyser",
    description:
      "Get instant insights into your finances with live dashboards.",
  },
  {
    image:
      "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-2.png",
    title: "User management",
    description:
      "Get instant insights into your finances with live dashboards.",
  },
  {
    image:
      "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-3.png",
    title: "Better invoicing",
    description:
      "Get instant insights into your finances with live dashboards.",
  },
];

export function FeaturesCards({
  title = "Powerful Features",
  subtitle = "Everything you need to manage, track, and grow your finances, securely and efficiently.",
  features = defaultFeatures,
  sectionId = "",
  className = "",
  style = {},
  elementStyles = {},
}: FeaturesCardsProps) {
  return (
    <section
      id={sectionId || undefined}
      className={cn(
        "w-full py-16 px-4 bg-background text-foreground",
        className,
      )}
      style={style}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h2
            className="text-3xl font-semibold text-foreground mx-auto"
            style={elementStyles.title}
          >
            {title}
          </h2>
          <p
            className="text-sm text-muted-foreground text-center mt-2 max-w-md mx-auto"
            style={elementStyles.subtitle}
          >
            {subtitle}
          </p>
        </div>

        <div
          className="flex flex-wrap items-center justify-center gap-10 mt-16"
          style={elementStyles.cardGrid}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="w-full max-w-[20rem] hover:-translate-y-0.5 transition duration-300"
              style={elementStyles.card}
            >
              <img
                className="rounded-xl w-full h-auto"
                src={feature.image}
                alt={feature.title}
                style={elementStyles.image}
              />
              <h3
                className="text-base font-semibold text-foreground mt-4"
                style={elementStyles.cardTitle}
              >
                {feature.title}
              </h3>
              <p
                className="text-sm text-muted-foreground mt-1"
                style={elementStyles.cardDescription}
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
