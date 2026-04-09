"use client";

import React from "react";
import { CountdownAnnouncement } from "@/components/macro/Countdown/CountdownAnnouncement";

export default function CountdownAnnouncementTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <CountdownAnnouncement />
    </div>
  );
}
