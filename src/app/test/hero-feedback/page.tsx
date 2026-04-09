"use client";

import React from "react";
import { HeroFeedbackApp } from "@/components/macro/Hero";

export default function HeroFeedbackTestPage() {
  return (
    <HeroFeedbackApp
      headlinePrefix="Fast, clear, and "
      headlineHighlight="human-approved"
      subheadline="Generate actionable code reviews from experienced developers and ship your best work faster."
      primaryCtaText="Get feedback"
      primaryCtaHref="#feedback"
      secondaryCtaText="Download iOS App"
      secondaryCtaHref="#download"
    />
  );
}
