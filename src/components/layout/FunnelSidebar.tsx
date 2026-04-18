"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Brain,
  FileText,
  Mail,
  TrendingUp,
  Hammer,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FunnelNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

interface FunnelSidebarProps {
  funnelId: string;
  funnelName: string;
}

export function FunnelSidebar({ funnelId, funnelName }: FunnelSidebarProps) {
  const pathname = usePathname();

  const navItems: FunnelNavItem[] = [
    {
      label: "Overview",
      href: `/funnels/${funnelId}`,
      icon: <BarChart2 className="w-4 h-4" />,
      description: "Analytics & metrics",
    },
    {
      label: "Sales Report",
      href: `/funnels/${funnelId}/report`,
      icon: <Brain className="w-4 h-4" />,
      description: "Offer intelligence",
    },
    {
      label: "Sales Copy",
      href: `/funnels/${funnelId}/copy`,
      icon: <FileText className="w-4 h-4" />,
      description: "AI-generated copy",
    },
    {
      label: "Email Sequence",
      href: `/funnels/${funnelId}/email`,
      icon: <Mail className="w-4 h-4" />,
      description: "Nurture automation",
    },
    {
      label: "Traffic Intelligence",
      href: `/funnels/${funnelId}/traffic`,
      icon: <TrendingUp className="w-4 h-4" />,
      description: "Platform & ad strategy",
    },
  ];

  return (
    <div className="w-[220px] flex-shrink-0 border-r border-border bg-card flex flex-col h-full overflow-hidden">
      {/* Header */}
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

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === `/funnels/${funnelId}`
              ? pathname === `/funnels/${funnelId}`
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all group",
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
                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                )}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight">{item.label}</p>
                <p className="text-[10px] text-muted-foreground/70 leading-tight">
                  {item.description}
                </p>
              </div>
              {isActive && (
                <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Builder CTA */}
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
