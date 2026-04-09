"use client";

import React from "react";
import { HeroWithForm } from "@/components/macro/Hero";

const navItems = [
  { label: "Solutions", href: "#solutions" },
  { label: "Industries", href: "#industries" },
  { label: "Fees", href: "#fees" },
  { label: "About", href: "#about" },
];

const stats = [
  { number: "2943", label: "Cards\nDelivered" },
  { number: "$1M+", label: "Transaction\nCompleted" },
];

export default function HeroTestPage() {
  return (
    <HeroWithForm
      logoUrl="https://d33wubrfki0l68.cloudfront.net/682a555ec15382f2c6e7457ca1ef48d8dbb179ac/f8cd3/images/logo.svg"
      navItems={navItems}
      ctaButtonText="Create free account"
      headline="A special credit card made for Developers."
      subheadline="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vehicula massa in enim luctus. Rutrum arcu."
      emailPlaceholder="Enter email address"
      emailCta="Get Free Blueprint"
      stats={stats}
      heroImageUrl="https://d33wubrfki0l68.cloudfront.net/d6f1462500f7670e0db6b76b35054a081679a5a0/0ce15/images/hero/5.1/illustration.png"
    />
  );
}
