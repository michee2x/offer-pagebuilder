"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  User, 
  CreditCard, 
  Layout, 
  Users, 
  Puzzle, 
  Shield, 
  Bell, 
  Mail, 
  Cpu 
} from "lucide-react";

export type SettingsTab = 
  | "profile" 
  | "billing" 
  | "workspace" 
  | "team" 
  | "integrations" 
  | "security"
  | "notifications"
  | "email"
  | "ai";

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  const categories = [
    {
      label: "Account",
      items: [
        { id: "profile", label: "Profile", icon: User },
        { id: "billing", label: "Plan & Billing", icon: CreditCard },
      ]
    },
    {
      label: "Workspace",
      items: [
        { id: "workspace", label: "General", icon: Layout },
        { id: "team", label: "Team & Access", icon: Users },
        { id: "integrations", label: "Integrations", icon: Puzzle },
        { id: "security", label: "Security", icon: Shield },
      ]
    },
    {
      label: "Configuration",
      items: [
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "email", label: "Email Settings", icon: Mail },
        { id: "ai", label: "AI & Intelligence", icon: Cpu },
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-[#0c0c0c] hidden md:flex flex-col py-6 overflow-y-auto shrink-0">
      <div className="px-6 mb-8">
        <h2 className="text-sm font-bold text-white tracking-tight">Settings</h2>
      </div>
      
      <div className="px-4 space-y-8">
        {categories.map((cat) => (
          <div key={cat.label}>
            <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#555]">
              {cat.label}
            </h3>
            <div className="space-y-1">
              {cat.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id as SettingsTab)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition-all group",
                      isActive
                        ? "bg-brand-yellow/10 text-brand-yellow"
                        : "text-[#777] hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-brand-yellow" : "text-[#555] group-hover:text-white")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
