"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface PricingFlexibleFeature {
  text: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: PricingFlexibleFeature[];
  mostPopular?: boolean;
}

export interface PricingFlexibleProps {
  plans: PricingPlan[];
  title?: string;
  subtitle?: string;
  monthlyLabel?: string;
  annualLabel?: string;
  buttonText?: string;
  className?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function PricingFlexible({
  plans,
  title = "Flexible Pricing Plans",
  subtitle = "Choose a plan that supports your business growth and digital goals.",
  monthlyLabel = "Monthly",
  annualLabel = "Annually",
  buttonText = "Get Started",
  className,
  elementStyles = {},
}: PricingFlexibleProps) {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section
      className={cn(
        "flex items-center justify-center flex-col py-20 px-4",
        className,
      )}
      style={elementStyles.section}
    >
      <h1
        className="font-medium text-4xl md:text-[52px] text-foreground text-center"
        style={elementStyles.title}
      >
        {title}
      </h1>
      <p
        className="text-base/7 text-muted-foreground max-w-sm text-center mt-4"
        style={elementStyles.subtitle}
      >
        {subtitle}
      </p>
      <div
        className="mt-6 flex bg-muted p-1.5 rounded-full"
        style={elementStyles.toggle}
      >
        <button
          onClick={() => setIsAnnual(false)}
          className={cn(
            "px-4 py-2 rounded-full text-xs cursor-pointer transition",
            !isAnnual
              ? "bg-foreground hover:bg-foreground/90 text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
          style={elementStyles.toggleButton}
        >
          {monthlyLabel}
        </button>
        <button
          onClick={() => setIsAnnual(true)}
          className={cn(
            "px-4 py-2 rounded-full text-xs cursor-pointer transition",
            isAnnual
              ? "bg-foreground hover:bg-foreground/90 text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
          style={elementStyles.toggleButton}
        >
          {annualLabel}
        </button>
      </div>
      <div
        className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        style={elementStyles.grid}
      >
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            className={cn(
              "border border-border rounded-2xl p-6 flex flex-col items-start max-w-md transition duration-300 hover:-translate-y-1",
              plan.mostPopular ? "bg-muted" : "bg-card",
            )}
            style={elementStyles.card}
          >
            <h1
              className="font-medium text-3xl text-foreground mt-1"
              style={elementStyles.planName}
            >
              {plan.name}
            </h1>
            <p
              className="text-sm text-muted-foreground mt-2"
              style={elementStyles.planDescription}
            >
              {plan.description}
            </p>
            <h1
              className="font-medium text-5xl text-foreground mt-6"
              style={elementStyles.price}
            >
              ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
            </h1>
            <button
              className={cn(
                "w-full px-4 py-3 rounded-full cursor-pointer text-sm mt-8 transition",
                plan.mostPopular
                  ? "bg-foreground hover:bg-foreground/90 text-background"
                  : "border border-border bg-muted hover:bg-muted/80 text-foreground",
              )}
              style={elementStyles.button}
            >
              {buttonText}
            </button>
            <div
              className="w-full mt-8 space-y-2.5 pb-4"
              style={elementStyles.features}
            >
              {plan.features.map((feature, featureIndex) => (
                <p
                  key={featureIndex}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                  style={elementStyles.feature}
                >
                  <span className="size-3 rounded-full bg-muted-foreground flex items-center justify-center shrink-0">
                    <span className="size-1.5 rounded-full bg-foreground" />
                  </span>
                  {feature.text}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
