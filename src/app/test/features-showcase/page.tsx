"use client";

import React from "react";
import { FeaturesShowcase } from "@/components/macro/Features/FeaturesShowcase";

export default function FeaturesShowcaseTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <FeaturesShowcase />
      </div>
    </div>
  );
}
