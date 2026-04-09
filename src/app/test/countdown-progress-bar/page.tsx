"use client";

import React from "react";
import { CountdownProgressBar } from "@/components/macro/Countdown/CountdownProgressBar";

export default function CountdownProgressBarTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-4xl">
        <CountdownProgressBar />
      </div>
    </div>
  );
}
