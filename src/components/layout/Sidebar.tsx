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
  LayoutTemplate,
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
  const { isSidebarOpen, setSidebarOpen, activeWorkspaceId, setActiveWorkspaceId } = useUIStore();

  const pathWorkspaceId = React.useMemo(() => {
    const parts = pathname?.split("/") || [];
    if (parts.length >= 3 && parts[1] === "workspaces") {
      return parts[2];
    }
    return null;
  }, [pathname]);

  React.useEffect(() => {
    if (pathWorkspaceId && pathWorkspaceId !== activeWorkspaceId) {
      setActiveWorkspaceId(pathWorkspaceId);
    }
  }, [pathWorkspaceId, activeWorkspaceId, setActiveWorkspaceId]);

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

  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        if (data.user?.is_admin) {
          setIsAdmin(true);
        }
      })
      .catch(err => console.error("Error fetching user status", err));
  }, []);

  const links: SidebarLink[] = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Workspaces", href: "/workspaces", icon: Filter },
    { label: "Templates", href: `/templates${activeWorkspaceId ? `?workspace=${activeWorkspaceId}` : ''}`, icon: LayoutTemplate },
  ];

  if (isAdmin) {
    links.push({ label: "Admin Dashboard", href: "/admin", icon: Zap });
  }

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
            className="fixed inset-0 bg-black/80 z-[60]"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[280px] bg-[#131826] border-r border-white/10 shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-14 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">
                  Offer<span className="text-brand-blue">IQ</span>
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
                  Workspace
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
                      "flex items-center gap-3 px-3 h-11 rounded-xl transition-all duration-300 group relative overflow-hidden",
                      active
                        ? "bg-gradient-to-r from-brand-blue to-brand-indigo text-white shadow-lg shadow-indigo-500/25"
                        : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0 z-10 transition-colors", active ? "text-white" : "text-slate-500 group-hover:text-white")} />
                    <span className="text-sm font-medium z-10">{item.label}</span>
                    {item.badge && (
                      <span className={cn("ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm", active ? "bg-white/20 text-white" : "bg-brand-pink text-white")}>
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
                    <p className="text-[10px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400 drop-shadow-md mb-1">OfferIQ Pro</p>
                    <h4 className="text-white font-bold text-sm leading-tight drop-shadow-md">Unlock AI Strategy & Custom Domains</h4>
                  </div>
                  <button className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:opacity-90 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)] text-[10px] font-bold py-1.5 px-3 rounded-full transition-opacity self-start">
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
