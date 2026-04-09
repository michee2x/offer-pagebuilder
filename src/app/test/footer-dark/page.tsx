"use client";

import React from "react";
import { FooterDark } from "@/components/macro/Footer";

export default function FooterDarkTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1">
        {/* Main content area - you can add content here */}
        <div className="h-96 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-foreground">Main Content</h1>
        </div>
      </div>
      <FooterDark />
    </div>
  );
}
