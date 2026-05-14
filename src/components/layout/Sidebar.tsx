"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard,
  Filter,
  Mail,
  LineChart,
  PieChart,
  Settings,
  Zap,
  FileText,
  LogOut,
  Brain,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  const getFunnelId = () => {
    const parts = pathname?.split("/") || [];
    if (parts.length >= 3) {
      if (
        [
          "intelligence",
          "copy",
          "email-sequence",
          "traffic",
          "funnels",
        ].includes(parts[1])
      ) {
        return parts[2];
      }
    }
    return null;
  };

  const funnelId = getFunnelId();

  const links: SidebarLink[] = funnelId
    ? [
        { label: "Back to Workspaces", href: "/", icon: LayoutDashboard },
        {
          label: "Funnel Overview",
          href: `/funnels/${funnelId}`,
          icon: PieChart,
        },
        {
          label: "Page Builder",
          href: `/builder?id=${funnelId}`,
          icon: Filter,
        },
        {
          label: "Sales Copy",
          href: `/copy/${funnelId}`,
          icon: FileText,
        },
        {
          label: "Email Sequence",
          href: `/email-sequence/${funnelId}`,
          icon: Mail,
        },
        {
          label: "Traffic Intelligence",
          href: `/traffic/${funnelId}`,
          icon: LineChart,
        },
        { label: "Sales Intelligence", href: `/intelligence/${funnelId}`, icon: Brain },
      ]
    : [
        { label: "Dashboard", href: "/", icon: LayoutDashboard },
        { label: "Workspaces", href: "/workspaces", icon: Filter },
      ];

  const accountLinks: SidebarLink[] = [
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const accountActions = [
    {
      label: "Sign out",
      onClick: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Error signing out:", error.message);
        }
        router.push("/login");
      },
      icon: LogOut,
    },
  ];

  const isActive = (href: string) => {
    if (href === "#") return false;
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[280px] bg-[#0a0a0a]/70 backdrop-blur-3xl border-r border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-14 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-yellow flex items-center justify-center text-black">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">
                  Offer<span className="text-brand-yellow">IQ</span>
                </span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <nav className="flex-1 py-6 overflow-y-auto px-4 space-y-1">
              <div className="px-3 mb-2 flex items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  {funnelId ? "Funnel Menu" : "Workspace"}
                </span>
              </div>

              {links.map((item, i) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={i}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 h-11 rounded-xl transition-all group",
                      active
                        ? "bg-brand-yellow/10 text-brand-yellow"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0", active ? "text-brand-yellow" : "text-slate-500 group-hover:text-white")} />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-yellow text-black">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="pt-6 px-3 mb-2 flex items-center border-t border-white/5 mt-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Account
                </span>
              </div>

              {accountLinks.map((item, i) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={i}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 h-11 rounded-xl transition-all text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0 text-slate-500" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {accountActions.map((action, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    action.onClick();
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 h-11 w-full text-left rounded-xl transition-all text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <action.icon className="w-5 h-5 shrink-0 text-slate-500" />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </nav>

            {/* Footer / Pro Card */}
            <div className="p-4 mt-auto">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] group">
                <img
                  src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80&fit=crop"
                  alt="Pro background"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-yellow mb-1">OfferIQ Pro</p>
                    <h4 className="text-white font-bold text-sm leading-tight">Unlock AI Strategy & Custom Domains</h4>
                  </div>
                  <button className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold py-1.5 px-3 rounded-full border border-white/30 transition-colors self-start">
                    Upgrade Now →
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
