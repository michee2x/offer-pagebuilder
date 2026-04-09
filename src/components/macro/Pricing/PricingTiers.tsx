"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface PricingTiersFeature {
  text: string;
}

export interface PricingTiersTier {
  id: string;
  name: string;
  price: string;
  period: string;
  features: PricingTiersFeature[];
  buttonText: string;
  popular?: boolean;
  badgeText?: string;
}

export interface PricingTiersProps {
  tiers: PricingTiersTier[];
  className?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function PricingTiers({
  tiers,
  className,
  elementStyles = {},
}: PricingTiersProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-6",
        className,
      )}
      style={elementStyles.container}
    >
      {tiers.map((tier) => (
        <div
          key={tier.id}
          className={cn(
            "w-72 text-center p-6 rounded-lg relative",
            tier.popular
              ? "bg-primary text-primary-foreground border border-primary/30"
              : "bg-card text-card-foreground border border-border",
            tier.popular ? "pb-14" : "pb-16",
          )}
          style={elementStyles.card}
        >
          {tier.popular && tier.badgeText && (
            <p
              className="absolute px-3 text-sm -top-3.5 left-3.5 py-1 bg-primary-foreground text-primary rounded-full font-medium"
              style={elementStyles.badge}
            >
              {tier.badgeText}
            </p>
          )}
          <p
            className={cn("font-semibold", tier.popular ? "pt-2" : "")}
            style={elementStyles.name}
          >
            {tier.name}
          </p>
          <h1 className="text-3xl font-semibold" style={elementStyles.price}>
            {tier.price}
            <span
              className={cn(
                "text-sm font-normal",
                tier.popular
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground",
              )}
              style={elementStyles.period}
            >
              {tier.period}
            </span>
          </h1>
          <ul
            className={cn(
              "list-none text-sm mt-6 space-y-1",
              tier.popular
                ? "text-primary-foreground"
                : "text-muted-foreground",
            )}
            style={elementStyles.features}
          >
            {tier.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center gap-2"
                style={elementStyles.feature}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={
                    tier.popular ? "text-primary-foreground" : "text-primary"
                  }
                >
                  <path
                    d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z"
                    fill="currentColor"
                  />
                </svg>
                <p>{feature.text}</p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={cn(
              "text-sm w-full py-2 rounded font-medium mt-7 transition-all",
              tier.popular
                ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
            style={elementStyles.button}
          >
            {tier.buttonText}
          </button>
        </div>
      ))}
    </div>
  );
}
