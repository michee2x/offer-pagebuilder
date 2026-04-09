"use client";

import React from "react";
import { FeaturesCards } from "@/components/macro/Features/FeaturesCards";

export default function FeaturesCardsTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <FeaturesCards />
      </div>
    </div>
  );
}
