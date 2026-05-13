"use client";

import { useState } from "react";
import Link from "next/link";
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

export function FunnelSidebar({ funnelId, funnelName, collapsible = false }: FunnelSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems: FunnelNavItem[] = [
    { label: "Overview",             href: `/funnels/${funnelId}`,                      icon: BarChart2  },
    { label: "Sales Intelligence",   href: `/funnels/${funnelId}/report`,               icon: Brain      },
    { label: "Sales Copy",           href: `/funnels/${funnelId}/copy`,                 icon: FileText   },
    { label: "Email Sequence",       href: `/funnels/${funnelId}/email`,                icon: Mail       },
    { label: "Leads",                href: `/funnels/${funnelId}/leads`,                icon: Users      },
    { label: "Traffic Intelligence", href: `/funnels/${funnelId}/traffic`,              icon: TrendingUp },
    { label: "Publish",              href: `/builder/publish?id=${funnelId}`,           icon: Globe      },
  ];

  if (collapsible) {
    const w = open ? EXPANDED : COLLAPSED;

    return (
      /*
        Outer div holds the collapsed footprint in the flex layout (never changes).
        Inner div is absolute so on hover it overlays the next sibling (report nav)
        rather than pushing it — same pattern the global Sidebar uses.
      */
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
            transition: "width 220ms ease, box-shadow 220ms ease",
            zIndex: 30,
            boxShadow: open ? "4px 0 24px rgba(0,0,0,0.45)" : "none",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
          className="bg-card border-r border-border"
        >
          {/* Back / funnel name */}
          <div className="px-2 py-3 border-b border-border flex-shrink-0">
            <Link
              href={`/funnels/${funnelId}`}
              title={funnelName}
              className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1.5 hover:bg-muted"
            >
              <div style={{ width: 32, height: 32, flexShrink: 0 }} className="flex items-center justify-center">
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
              <span
                style={{
                  opacity: open ? 1 : 0,
                  transition: "opacity 180ms ease",
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {funnelName}
              </span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-2 space-y-0.5" style={{ padding: "8px 6px" }}>
            {navItems.map((item) => {
              const itemPath = item.href.split('?')[0];
              const isActive =
                item.href === `/funnels/${funnelId}`
                  ? pathname === `/funnels/${funnelId}`
                  : itemPath === '/builder/publish'
                  ? pathname === '/builder/publish'
                  : pathname.startsWith(itemPath);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg transition-colors overflow-hidden",
                    isActive
                      ? "bg-primary/10 border border-primary/20 text-foreground"
                      : "border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  style={{ padding: "6px" }}
                >
                  <div
                    className={cn(
                      "rounded-md flex items-center justify-center transition-colors",
                      isActive ? "bg-foreground text-background" : ""
                    )}
                    style={{ width: 32, height: 32, flexShrink: 0 }}
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
          <div className="flex-shrink-0 border-t border-border" style={{ padding: 6 }}>
            <Link
              href={`/builder?id=${funnelId}`}
              title="Open Builder"
              className="flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 transition-opacity overflow-hidden"
              style={{ height: 36, padding: "0 6px" }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
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
                }}
              >
                Open Builder
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Full (non-collapsible) sidebar — funnel overview page ─────────────────

  return (
    <div className="w-[220px] flex-shrink-0 border-r border-border bg-card flex flex-col h-full overflow-hidden">
      <div className="px-4 py-4 border-b border-border">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-3 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Funnels
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-[10px] font-black uppercase">
              {funnelName.slice(0, 2)}
            </span>
          </div>
          <p className="text-sm font-bold text-foreground truncate">{funnelName}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map((item) => {
          const itemPath = item.href.split('?')[0];
          const isActive =
            item.href === `/funnels/${funnelId}`
              ? pathname === `/funnels/${funnelId}`
              : itemPath === '/builder/publish'
              ? pathname === '/builder/publish'
              : pathname.startsWith(itemPath);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all group/item",
                isActive
                  ? "bg-primary/10 border border-primary/20 text-foreground"
                  : "border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground group-hover/item:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold leading-tight">{item.label}</p>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Link
          href={`/builder?id=${funnelId}`}
          className="w-full h-9 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Hammer className="w-3.5 h-3.5" />
          Open Builder
        </Link>
      </div>
    </div>
  );
}
