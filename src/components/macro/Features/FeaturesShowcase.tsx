"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export interface FeatureShowcaseItem {
  title: string;
  description: string;
  image: string;
  alt: string;
  hasTrending?: boolean;
  trendingPercentage?: string;
  imageClass?: string;
}

export interface FeaturesShowcaseProps {
  badgeText?: string;
  title?: string;
  subtitle?: string;
  features?: FeatureShowcaseItem[];
  sectionId?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

const defaultFeatures: FeatureShowcaseItem[] = [
  {
    title: "Grow Your Traffic",
    description:
      "Boost your website traffic, sales, visits and overall product revenue.",
    image:
      "https://assets.prebuiltui.com/images/components/feature-sections/features-graphs-image.png",
    alt: "graph",
    hasTrending: true,
    trendingPercentage: "45%",
    imageClass: "max-w-56",
  },
  {
    title: "Team-Friendly Structure",
    description:
      "Organize components, variants and layouts that works perfectly for teams.",
    image:
      "https://assets.prebuiltui.com/images/components/feature-sections/features-dash-img.png",
    alt: "dash",
    hasTrending: false,
  },
  {
    title: "Seamless Integration",
    description:
      "Works effortlessly with React, Next.js, Vue and modern technologies.",
    image:
      "https://assets.prebuiltui.com/images/components/feature-sections/features-social-image.png",
    alt: "socialCircle",
    hasTrending: false,
    imageClass: "max-w-60",
  },
];

export function FeaturesShowcase({
  badgeText = "Our core features",
  title = "Every product needs consistency.",
  subtitle = "Our Tailwind CSS components help you ship beautiful interfaces without reinventing the wheel.",
  features = defaultFeatures,
  sectionId = "",
  className = "",
  style = {},
  elementStyles = {},
}: FeaturesShowcaseProps) {
  return (
    <section
      id={sectionId || undefined}
      className={cn(
        "w-full py-16 px-4 bg-background text-foreground",
        className,
      )}
      style={style}
    >
      <div
        className="flex items-center flex-col justify-center text-center"
        style={elementStyles.container}
      >
        {/* Badge */}
        {badgeText && (
          <button
            className="bg-muted text-muted-foreground text-sm px-6 py-2.5 rounded-full font-medium transition-colors hover:bg-muted/80"
            style={elementStyles.badge}
          >
            {badgeText}
          </button>
        )}

        {/* Heading */}
        <h2
          className="text-foreground font-medium text-4xl md:text-[40px] mt-6 max-w-4xl"
          style={elementStyles.title}
        >
          {title}
        </h2>

        {/* Subtitle */}
        <p
          className="text-base text-muted-foreground max-w-lg mt-2"
          style={elementStyles.subtitle}
        >
          {subtitle}
        </p>

        {/* Features Grid */}
        <div
          className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10"
          style={elementStyles.grid}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl hover:-translate-y-3 transition duration-300 p-6 flex flex-col h-full"
              style={elementStyles.card}
            >
              {/* Trending Badge */}
              {feature.hasTrending && (
                <div
                  className="bg-secondary px-2 py-1 rounded-full flex items-center gap-1.5 w-fit ml-auto mb-4"
                  style={elementStyles.trendingBadge}
                >
                  <TrendingUp
                    className="w-4 h-4 text-green-500"
                    style={elementStyles.trendingIcon}
                  />
                  <p
                    className="text-xs text-foreground font-medium"
                    style={elementStyles.trendingText}
                  >
                    {feature.trendingPercentage || "↑ Up"}
                  </p>
                </div>
              )}

              {/* Image Container */}
              <div
                className="flex-1 flex items-center justify-center py-6"
                style={elementStyles.imageContainer}
              >
                <img
                  className={cn("w-full object-contain", feature.imageClass)}
                  src={feature.image}
                  alt={feature.alt}
                  style={elementStyles.image}
                />
              </div>

              {/* Title */}
              <h3
                className="text-base font-medium text-foreground mt-8 text-left"
                style={elementStyles.cardTitle}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className="text-sm text-muted-foreground mt-2 text-left max-w-2xl"
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
