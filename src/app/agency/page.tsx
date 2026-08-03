"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AgencySettings } from "@/components/settings/AgencySettings";

export default function AgencyPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar breadcrumbs={[{ label: "Agency Account" }]} />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-8 md:p-12">
            <div className="max-w-3xl mx-auto">
              <AgencySettings />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
