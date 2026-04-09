"use client";

import React from "react";
import { FeaturesSection } from "@/components/macro/Features/FeaturesSection";

export default function FeaturesSectionTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <FeaturesSection />
      </div>
    </div>
  );
}
