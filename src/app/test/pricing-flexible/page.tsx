"use client";

import React from "react";
import { PricingFlexible } from "@/components/macro/Pricing";

const plans = [
  {
    id: "basic",
    name: "Basic",
    monthlyPrice: 10,
    annualPrice: 100,
    description: "For startups and small teams.",
    features: [
      { text: "Essential site setup support" },
      { text: "Access to basic UI templates" },
      { text: "Email support for minor updates" },
      { text: "Access to basic components" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 30,
    annualPrice: 300,
    description: "Perfect for growing businesses.",
    mostPopular: true,
    features: [
      { text: "Custom web page design up to 5 pages" },
      { text: "Access to basic UI templates" },
      { text: "Email support for minor updates" },
      { text: "Access to basic components" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 50,
    annualPrice: 500,
    description: "For scaling brands and teams.",
    features: [
      { text: "Full website redesign & development" },
      { text: "Advanced analytics insights" },
      { text: "Ongoing dedicated support" },
      { text: "Access to basic UI templates" },
    ],
  },
];

export default function PricingFlexibleTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <PricingFlexible plans={plans} />
    </div>
  );
}
