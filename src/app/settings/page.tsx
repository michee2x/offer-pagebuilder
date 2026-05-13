"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SettingsSidebar, SettingsTab } from "@/components/settings/SettingsSidebar";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { WorkspaceSettings } from "@/components/settings/WorkspaceSettings";
import { TeamSettings } from "@/components/settings/TeamSettings";
import { useSearchParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const workspaceId = searchParams.get("workspace");
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const res = await fetch("/api/workspaces");
        if (!res.ok) throw new Error("Failed to load workspaces");
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
        
        // If no workspace is selected, but we have some, pick the first one
        if (!workspaceId && data.workspaces?.length > 0) {
          router.replace(`/settings?workspace=${data.workspaces[0].id}`);
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load workspaces");
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkspaces();
  }, [workspaceId, router]);

  const activeWorkspace = workspaces.find((w) => w.id === workspaceId);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#0e0e0e] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0e0e0e]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1) }]} />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Settings Sub-nav */}
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-8 md:p-12">
            <div className="max-w-3xl mx-auto">
              {activeTab === "profile" && <ProfileSettings />}
              {activeTab === "workspace" && (
                <WorkspaceSettings 
                  workspace={activeWorkspace} 
                  onUpdate={(updated) => {
                    setWorkspaces(prev => prev.map(w => w.id === updated.id ? updated : w));
                  }}
                />
              )}
              {activeTab === "team" && <TeamSettings workspace={activeWorkspace} />}
              {["billing", "integrations", "notifications", "security"].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Coming Soon</h2>
                  <p className="text-[#555] text-sm max-w-xs">
                    This section is under development. We&apos;re building a premium experience for {activeTab}.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
