"use client";

import React from "react";
import { CountdownLiveEvent } from "@/components/macro/Countdown/CountdownLiveEvent";

export default function CountdownLiveEventTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-5xl">
        <CountdownLiveEvent />
      </div>
    </div>
  );
}
