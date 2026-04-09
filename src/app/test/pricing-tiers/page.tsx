"use client";

import React from "react";
import { PricingTiers } from "@/components/macro/Pricing";

const tiers = [
  {
    id: "basic",
    name: "Basic",
    price: "$29",
    period: "/month",
    features: [
      { text: "Access to all basic courses" },
      { text: "Community support" },
      { text: "10 practice projects" },
      { text: "Course completion certificate" },
      { text: "Basic code review" },
    ],
    buttonText: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$79",
    period: "/month",
    popular: true,
    badgeText: "Most Popular",
    features: [
      { text: "Access to all Pro courses" },
      { text: "Priority community support" },
      { text: "30 practice projects" },
      { text: "Course completion certificate" },
      { text: "Advance code review" },
      { text: "1-on-1 mentoring sessions" },
      { text: "Job assistance" },
    ],
    buttonText: "Get Started",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$199",
    period: "/month",
    features: [
      { text: "Access to all courses" },
      { text: "Dedicated support" },
      { text: "Unlimited projects" },
      { text: "Course completion certificate" },
      { text: "Premium code review" },
      { text: "Weekly 1-on-1 mentoring" },
      { text: "Job guarantee" },
    ],
    buttonText: "Get Started",
  },
];

export default function PricingTiersTestPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <PricingTiers tiers={tiers} />
    </div>
  );
}
