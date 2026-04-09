"use client";

import React from "react";
import { FeatureCTA } from "@/components/macro/CTA/FeatureCTA";

export default function FeatureCTATestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <FeatureCTA />
      </div>
    </div>
  );
}
