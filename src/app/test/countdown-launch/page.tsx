"use client";

import React from "react";
import { CountdownLaunch } from "@/components/macro/Countdown/CountdownLaunch";

export default function CountdownLaunchTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-6xl">
        <CountdownLaunch />
      </div>
    </div>
  );
}
