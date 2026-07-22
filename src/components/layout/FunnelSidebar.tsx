"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FunnelSwitcher } from "./FunnelSwitcher";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Brain,
  FileText,
  Mail,
  TrendingUp,
  Users,
  Hammer,
  ArrowLeft,
  Globe,
  BookOpen,
  Plug,
  Package,
  ChevronDown,
  Webhook,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FunnelNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface FunnelSidebarProps {
  funnelId: string;
  funnelName: string;
  collapsible?: boolean;
}

const COLLAPSED = 56;
const EXPANDED = 220;

export function FunnelSidebar({
  funnelId,
  funnelName,
  collapsible = false,
}: FunnelSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSwitcherOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems: FunnelNavItem[] = [
    { label: "Overview", href: `/funnels/${funnelId}`, icon: BarChart2 },
    {
      label: "Offer Intelligence",
      href: `/funnels/${funnelId}/report`,
      icon: Brain,
    },
    { label: "Copy Engine", href: `/funnels/${funnelId}/copy`, icon: FileText },
    { label: "Email Sequence", href: `/funnels/${funnelId}/email`, icon: Mail },
    { label: "Leads", href: `/funnels/${funnelId}/leads`, icon: Users },
    {
      label: "Traffic Intelligence",
      href: `/funnels/${funnelId}/traffic`,
      icon: TrendingUp,
    },
    {
      label: "Asset Bank",
      href: `/funnels/${funnelId}/blueprint`,
      icon: BookOpen,
    },
    {
      label: "Products",
      href: `/funnels/${funnelId}/products`,
      icon: Package,
    },
    {
      label: "Integrations",
      href: `/funnels/${funnelId}/integrations`,
      icon: Plug,
    },
    {
      label: "Autoresponder",
      href: `/funnels/${funnelId}/autoresponder`,
      icon: Webhook,
    },
    {
      label: "Publish",
      href: `/builder/publish?id=${funnelId}`,
      icon: Globe,
    },
  ];

  if (collapsible) {
    const w = open ? EXPANDED : COLLAPSED;

    return (
      <div style={{ width: COLLAPSED, flexShrink: 0, position: "relative" }}>
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: w,
            transition: "width 240ms cubic-bezier(0.4,0,0.2,1), box-shadow 240ms ease",
            zIndex: 30,
            boxShadow: open ? "6px 0 32px rgba(0,0,0,0.55)" : "none",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
          className="bg-[#0e1118] border-r border-white/[0.07]"
        >
          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent flex-shrink-0" />

          {/* Funnel switcher trigger */}
          <div className="px-2 pt-3 pb-2 border-b border-white/[0.07] flex-shrink-0">
            <button
              onClick={() => setSwitcherOpen(true)}
              title={open ? "Switch Funnel (Ctrl+K)" : funnelName}
              className="w-full flex items-center justify-between text-white/40 hover:text-white/80 transition-colors rounded-xl p-1.5 hover:bg-white/[0.05] group/back"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  style={{ width: 32, height: 32, flexShrink: 0 }}
                  className="flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover/back:bg-white/[0.08] transition-all text-brand-blue"
                >
                  <span className="text-[10px] font-black uppercase text-white/80">{funnelName.slice(0,2)}</span>
                </div>
                <div
                  className="text-left min-w-0"
                  style={{
                    opacity: open ? 1 : 0,
                    transition: "opacity 160ms ease",
                    whiteSpace: "nowrap",
                    overflow: "hidden"
                  }}
                >
                  <div className="text-[11px] font-bold text-white tracking-wide truncate pr-2">{funnelName}</div>
                  <div className="text-[9px] text-white/40 flex items-center gap-1 mt-0.5"><kbd className="px-1 bg-white/10 rounded font-mono">⌘K</kbd> to switch</div>
                </div>
              </div>
              {open && <ChevronDown className="w-3.5 h-3.5 mr-1 shrink-0" />}
            </button>
          </div>

          {/* Nav */}
          <nav
            className="flex-1 overflow-y-auto scrollbar-hide"
            style={{ padding: "8px 6px" }}
          >
            {navItems.map((item) => {
              const itemPath = item.href.split("?")[0];
              const isActive =
                item.href === `/funnels/${funnelId}`
                  ? pathname === `/funnels/${funnelId}`
                  : itemPath === "/builder/publish"
                    ? pathname === "/builder/publish"
                    : pathname.startsWith(itemPath);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={!open ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl transition-all duration-200 overflow-hidden relative mb-0.5",
                    isActive
                      ? "bg-gradient-to-r from-brand-blue/90 to-brand-indigo/90 text-white shadow-[0_0_16px_rgba(99,102,241,0.25)]"
                      : "text-white/35 hover:text-white/80 hover:bg-white/[0.05]",
                  )}
                  style={{ padding: "6px" }}
                >
                  {/* Active left accent (only visible when collapsed) */}
                  {isActive && !open && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-indigo-400 to-blue-500 rounded-r-full" />
                  )}
                  <div
                    className={cn(
                      "rounded-lg flex items-center justify-center transition-all flex-shrink-0",
                      isActive
                        ? "bg-white/10 text-white"
                        : "bg-white/[0.04] text-white/40 border border-white/[0.06]",
                    )}
                    style={{ width: 32, height: 32 }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    style={{
                      opacity: open ? 1 : 0,
                      transition: "opacity 150ms ease",
                      whiteSpace: "nowrap",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Builder CTA */}
          <div
            className="flex-shrink-0 border-t border-white/[0.07]"
            style={{ padding: 6 }}
          >
            <Link
              href={`/builder?id=${funnelId}`}
              title={!open ? "Funnel Builder" : undefined}
              className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-indigo text-white shadow-[0_0_14px_rgba(99,102,241,0.35)] hover:shadow-[0_0_22px_rgba(99,102,241,0.55)] transition-all overflow-hidden"
              style={{ height: 40, padding: "0 6px" }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0 rounded-lg bg-white/10"
                style={{ width: 32, height: 32 }}
              >
                <Hammer className="w-3.5 h-3.5" />
              </div>
              <span
                style={{
                  opacity: open ? 1 : 0,
                  transition: "opacity 150ms ease",
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                }}
              >
                Funnel Builder
              </span>
            </Link>
          </div>
        </div>
        <FunnelSwitcher isOpen={switcherOpen} onClose={() => setSwitcherOpen(false)} />
      </div>
    );
  }

  // ─── Full (non-collapsible) sidebar — funnel overview page ─────────────────

  return (
    <div className="w-[220px] flex-shrink-0 border-r border-white/10 bg-[#131826] flex flex-col h-full overflow-hidden">
      <div className="absolute z-0 top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-brand-indigo to-transparent animate-pulse" />
      <div className="px-4 py-4 border-b border-white/10">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-3 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Funnels
        </Link>
        <button 
          onClick={() => setSwitcherOpen(true)}
          className="w-full flex items-center justify-between gap-2 p-1.5 -ml-1.5 rounded-xl hover:bg-white/5 transition-colors group text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-brand-blue flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.4)]">
              <span className="text-white text-[10px] font-black uppercase">
                {funnelName.slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0 truncate">
              <p className="text-sm font-bold text-white truncate">{funnelName}</p>
              <div className="text-[10px] text-white/40 mt-0.5">Switch Funnel (Cmd+K)</div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white/80 shrink-0" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems.map((item) => {
          const itemPath = item.href.split("?")[0];
          const isActive =
            item.href === `/funnels/${funnelId}`
              ? pathname === `/funnels/${funnelId}`
              : itemPath === "/builder/publish"
                ? pathname === "/builder/publish"
                : pathname.startsWith(itemPath);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-300 group/item relative overflow-hidden",
                isActive
                  ? "bg-gradient-to-r from-brand-blue to-brand-indigo text-white shadow-lg shadow-indigo-500/25"
                  : "border border-transparent text-muted-foreground hover:text-white hover:bg-white/5",
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors z-10",
                  isActive
                    ? "text-white"
                    : "bg-white/5 text-muted-foreground group-hover/item:text-white group-hover/item:bg-white/10",
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold leading-tight">{item.label}</p>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <Link
          href={`/builder?id=${funnelId}`}
          className="w-full h-9 bg-gradient-to-r from-brand-blue to-brand-indigo text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all"
        >
          <Hammer className="w-3.5 h-3.5" />
          Funnel Builder
        </Link>
      </div>
      <FunnelSwitcher isOpen={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </div>
  );
}
