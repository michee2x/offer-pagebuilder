"use client";

import React from "react";
import { PricingComparison } from "@/components/macro/Pricing";

const plans = [
  {
    id: "pro",
    name: "Pro Plan",
    description: "Perfect for medium business and personal use",
    price: "$49",
    period: "/month",
    buttonText: "Get Started",
    features: [
      { text: "Enjoy unlimited AI task usage" },
      { text: "Integrate API for smooth workflow" },
      { text: "Create text and image outputs" },
      { text: "Get priority chat and email help" },
      { text: "View detailed analytics and reports" },
    ],
  },
  {
    id: "custom",
    name: "Custom Plan",
    description: "Perfect for organizations and personal use",
    price: "$149",
    period: "/month",
    buttonText: "Contact Sales",
    highlighted: true,
    features: [
      { text: "Build fully customized AI models" },
      { text: "Manage teams with shared access" },
      { text: "Get a dedicated account manager" },
      { text: "Integrate private APIs securely" },
      { text: "Guaranteed uptime with support" },
      { text: "Customize pricing and features" },
    ],
  },
];

export default function PricingComparisonTestPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <PricingComparison plans={plans} />
    </div>
  );
}
