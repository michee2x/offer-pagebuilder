"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  isLarge?: boolean;
}

export interface FeaturesSectionProps {
  badgeText?: string;
  title?: string;
  subtitle?: string;
  features?: FeatureCard[][];
  sectionId?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

const defaultFeatures: FeatureCard[][] = [
  [
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 3H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1m11 0h-5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1m0 11h-5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1M9 14H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Flexible Components",
      description:
        "Build layouts faster using modular, responsive and well-structured UI components that adapt to any use case.",
      image:
        "https://assets.prebuiltui.com/images/components/feature-sections/feature-workspace-img.png",
      imageAlt: "Feature workspace",
      isLarge: true,
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m9 12 2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Production-Ready Design",
      description:
        "Designed for real-world products, following best practices in accessibility and consistency. Seamlessly integrates into production workflows.",
      isLarge: false,
    },
  ],
  [
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.671 4.134a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.83A2.34 2.34 0 0 1 6.35 6.048a2.34 2.34 0 0 0 3.319-1.915"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Easy Customization",
      description:
        "Tokens, spacing and styles are easy to customization stays simple without breaking layouts. Quickly tailor components to match brand and design system.",
      isLarge: false,
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-2 8v4a2 2 0 0 0 2 2h4m6-4h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Built for Modern Teams",
      description:
        "Ideal for startups, agencies and developers building modern web apps. Supports collaboration and scalability.",
      image:
        "https://assets.prebuiltui.com/images/components/feature-sections/feature-minimal-office-img.png",
      imageAlt: "Feature office",
      isLarge: true,
    },
  ],
];

export function FeaturesSection({
  badgeText = "FEATURES",
  title = "All You Need to Build Fast",
  subtitle = "Carefully crafted components and patterns designed to scale with your product.",
  features = defaultFeatures,
  sectionId = "",
  className = "",
  style = {},
  elementStyles = {},
}: FeaturesSectionProps) {
  const normalizedFeatures = React.useMemo(() => {
    if (!features || !Array.isArray(features)) return [];
    if (features.length === 0) return [];
    if (Array.isArray(features[0])) return features as FeatureCard[][];
    
    // Fallback: AI sometimes generates a flat array instead of nested rows.
    const flat = features as unknown as FeatureCard[];
    const chunked: FeatureCard[][] = [];
    // Chunk into rows of 2
    for (let i = 0; i < flat.length; i += 2) {
      chunked.push(flat.slice(i, i + 2));
    }
    return chunked;
  }, [features]);

  return (
    <section
      id={sectionId || undefined}
      className={cn("w-full py-16 px-4 bg-muted/50", className)}
      style={style}
    >
      <div className="max-w-6xl mx-auto" style={elementStyles.container}>
        <div className="text-center mb-9" style={elementStyles.header}>
          <span
            className="inline-block text-xs text-foreground bg-background rounded-full px-6 py-2 font-medium"
            style={elementStyles.badge}
          >
            {badgeText}
          </span>
          <h2
            className="text-4xl md:text-[40px] font-medium text-foreground mt-6"
            style={elementStyles.title}
          >
            {title}
          </h2>
          <p
            className="text-base text-muted-foreground max-w-sm mx-auto mt-3"
            style={elementStyles.subtitle}
          >
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-5" style={elementStyles.featuresGrid}>
          {normalizedFeatures.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex flex-col md:flex-row gap-5"
              style={elementStyles.featureRow}
            >
              {row.map((feature, featureIndex) => (
                <div
                  key={featureIndex}
                  className={cn(
                    "bg-background rounded-xl hover:shadow-sm transition-all duration-300",
                    feature.isLarge
                      ? "md:h-60 p-5 flex flex-col md:flex-row gap-5"
                      : "px-6 py-6 md:pt-7",
                  )}
                  style={elementStyles.featureCard}
                >
                  {feature.isLarge && feature.image && (
                    <img
                      src={feature.image}
                      alt={feature.imageAlt || feature.title}
                      className="w-full h-48 md:h-full md:w-[45%] object-cover rounded-2xl"
                      style={elementStyles.featureImage}
                    />
                  )}

                  <div
                    className={cn(
                      "flex flex-col",
                      feature.isLarge ? "mt-2" : "",
                    )}
                  >
                    <div
                      className="size-11 bg-foreground rounded-lg flex items-center justify-center mb-5"
                      style={elementStyles.iconContainer}
                    >
                      <div
                        className="text-background"
                        style={elementStyles.icon}
                      >
                        {feature.icon}
                      </div>
                    </div>
                    <h3
                      className="text-sm font-medium text-foreground"
                      style={elementStyles.featureTitle}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={cn(
                        "text-sm text-muted-foreground mt-2.5",
                        feature.isLarge ? "text-sm/6" : "",
                      )}
                      style={elementStyles.featureDescription}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
