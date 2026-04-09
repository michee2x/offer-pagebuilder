"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface PricingComparisonFeature {
  text: string;
}

export interface PricingHighlight {
  icon: React.ReactNode;
  text: string;
}

export interface PricingPlanDetailed {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  buttonText: string;
  features: PricingComparisonFeature[];
  highlighted?: boolean;
}

export interface PricingComparisonProps {
  title?: string;
  subtitle?: string;
  highlights?: PricingHighlight[];
  plans: PricingPlanDetailed[];
  className?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function PricingComparison({
  title = "OUR PRICING",
  subtitle = "Choose a plan that fits your goals and scale. Every plan includes powerful AI features, fast performance, and all the tools you need without limits.",
  highlights = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-sparkles size-5"
          aria-hidden="true"
        >
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
          <path d="M20 2v4"></path>
          <path d="M22 4h-4"></path>
          <circle cx="4" cy="20" r="2"></circle>
        </svg>
      ),
      text: "Advanced AI features included",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-zap size-5"
          aria-hidden="true"
        >
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
        </svg>
      ),
      text: "Lightning fast load speed always",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-shield-check size-5"
          aria-hidden="true"
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
      ),
      text: "Clear honest usage with limits",
    },
  ],
  plans,
  className,
  elementStyles = {},
}: PricingComparisonProps) {
  return (
    <section
      className={cn(
        "flex flex-col md:flex-row gap-14 items-start justify-between max-w-7xl mx-auto px-4",
        className,
      )}
      style={elementStyles.section}
    >
      <div className="max-w-sm" style={elementStyles.description}>
        <h3
          className="font-domine text-3xl text-foreground"
          style={elementStyles.title}
        >
          {title}
        </h3>
        <p
          className="mt-4 text-sm/6 text-muted-foreground"
          style={elementStyles.subtitle}
        >
          {subtitle}
        </p>
        <div className="mt-8 space-y-4" style={elementStyles.highlights}>
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-muted-foreground"
              style={elementStyles.highlight}
            >
              <div
                className="p-2.5 border border-border rounded-md"
                style={elementStyles.highlightIcon}
              >
                {highlight.icon}
              </div>
              <p>{highlight.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div
        className="grid grid-cols-1  lg:grid-cols-2 gap-10"
        style={elementStyles.plans}
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "group w-full max-w-85 rounded-xl p-6 pb-10 transition",
              plan.highlighted
                ? "bg-foreground text-background"
                : "bg-card border border-border text-card-foreground",
            )}
            style={elementStyles.card}
          >
            <div
              className="flex flex-col items-center justify-center text-center"
              style={elementStyles.planHeader}
            >
              <h3
                className="text-lg font-semibold"
                style={elementStyles.planName}
              >
                {plan.name}
              </h3>
              <p
                className={cn(
                  "text-sm",
                  plan.highlighted ? "text-muted" : "text-muted-foreground",
                )}
                style={elementStyles.planDescription}
              >
                {plan.description}
              </p>
              <p
                className="mt-4 text-2xl font-semibold"
                style={elementStyles.price}
              >
                {plan.price}{" "}
                <span
                  className={cn(
                    "text-sm font-normal",
                    plan.highlighted ? "text-muted" : "text-muted-foreground",
                  )}
                  style={elementStyles.period}
                >
                  {plan.period}
                </span>
              </p>
              <button
                className={cn(
                  "mt-4 w-full rounded-lg py-2.5 font-medium transition",
                  plan.highlighted
                    ? "bg-background text-foreground hover:opacity-90"
                    : "bg-muted text-foreground hover:bg-muted/80",
                )}
                style={elementStyles.button}
              >
                {plan.buttonText}
              </button>
            </div>
            <div className="mt-2 flex flex-col" style={elementStyles.features}>
              {plan.features.map((feature, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-2 py-3",
                    index < plan.features.length - 1 ? "border-b" : "",
                    plan.highlighted ? "border-border/20" : "border-border",
                  )}
                  style={elementStyles.feature}
                >
                  <div
                    className={cn(
                      "rounded-full p-1",
                      plan.highlighted ? "bg-background/10" : "bg-foreground",
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check size-3 text-background"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </div>
                  {feature.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
