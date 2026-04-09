"use client";

import React from "react";
import { HeroRemoteCollab } from "@/components/macro/Hero";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Resources", href: "#resources" },
  { label: "Pricing", href: "#pricing" },
];

export default function HeroCollabTestPage() {
  return (
    <HeroRemoteCollab
      logoUrl="https://cdn.rareblocks.xyz/collection/celebration/images/hero/2/logo.svg"
      navItems={navItems}
      headlinePrefix="Collaborate remotely, with"
      headlineHighlight="Postcrafts."
      subheadline="Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat."
      primaryCtaText="Get Free Blueprint"
      primaryCtaHref="#start"
      secondaryLinkText="Watch webinar"
      secondaryLinkHref="#watch"
      heroImageUrl="https://cdn.rareblocks.xyz/collection/celebration/images/hero/2/hero-img.png"
    />
  );
}
