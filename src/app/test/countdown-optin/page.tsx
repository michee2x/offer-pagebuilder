"use client";

import React from "react";
import { CountdownOptIn } from "@/components/macro/Countdown/CountdownOptIn";

export default function CountdownOptInTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-3xl">
        <CountdownOptIn />
      </div>
    </div>
  );
}
