"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

interface NavSection {
  title: string;
  icon: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    title: "Getting Started",
    icon: "🚀",
    items: [
      { label: "Introduction", href: "/docs" },
      { label: "Quick Start", href: "/docs/quickstart" },
      { label: "Core Concepts", href: "/docs/concepts" },
    ],
  },
  {
    title: "Intelligence & Analysis",
    icon: "🧠",
    items: [
      { label: "Offer Analysis", href: "/docs/offer-analysis" },
      { label: "Intelligence Report", href: "/docs/intelligence" },
    ],
  },
  {
    title: "Copy & Content",
    icon: "✍️",
    items: [
      { label: "Copy Engine", href: "/docs/copy-engine" },
      { label: "Email Sequences", href: "/docs/email-sequences" },
    ],
  },
  {
    title: "Build",
    icon: "🏗️",
    items: [
      { label: "Page Builder", href: "/docs/page-builder" },
      { label: "Funnel Management", href: "/docs/funnels" },
      { label: "Templates & Blueprints", href: "/docs/templates" },
    ],
  },
  {
    title: "Traffic & Growth",
    icon: "📈",
    items: [
      { label: "Traffic Intelligence", href: "/docs/traffic-intelligence" },
      { label: "Analytics & Tracking", href: "/docs/analytics" },
    ],
  },
  {
    title: "Workspace & Settings",
    icon: "⚙️",
    items: [
      { label: "Workspaces", href: "/docs/workspaces" },
      { label: "API Keys (BYOK)", href: "/docs/byok" },
      { label: "Agency Features", href: "/docs/agency", badge: "Pro" },
    ],
  },
  {
    title: "Billing",
    icon: "💳",
    items: [
      { label: "Plans & Pricing", href: "/docs/billing" },
      { label: "Payments FAQ", href: "/docs/payments" },
    ],
  },
];

function SectionGroup({
  section,
  pathname,
  defaultOpen,
}: {
  section: NavSection;
  pathname: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30 hover:text-white/50 transition-colors"
      >
        <span className="text-base">{section.icon}</span>
        <span className="flex-1 text-left">{section.title}</span>
        {open ? (
          <ChevronDown className="w-3 h-3 shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 shrink-0" />
        )}
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5">
          {section.items.map((item) => {
            const isActive =
              item.href === "/docs"
                ? pathname === "/docs"
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 mx-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 font-medium"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-amber-400 rounded-r-full" />
                )}
                <span className="flex-1 pl-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DocsSidebar() {
  const pathname = usePathname();

  const activeSectionIndex = NAV.findIndex((s) =>
    s.items.some(
      (item) =>
        pathname === item.href ||
        (item.href !== "/docs" && pathname.startsWith(item.href))
    )
  );

  return (
    <nav className="w-64 shrink-0 flex flex-col h-full border-r border-white/[0.06] bg-[#07080f]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/docs" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <span className="text-xs font-black text-black">IQ</span>
          </div>
          <div className="leading-none">
            <span className="text-white font-bold text-sm block">OfferIQ</span>
            <span className="text-white/30 text-[11px]">Documentation</span>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-4 px-1">
        {NAV.map((section, i) => (
          <SectionGroup
            key={section.title}
            section={section}
            pathname={pathname}
            defaultOpen={i === 0 || i === activeSectionIndex}
          />
        ))}
      </div>

      {/* Footer links */}
      <div className="px-4 py-4 border-t border-white/[0.06] space-y-2">
        <a
          href="mailto:support@ofiq.app"
          className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          <span>💬</span>
          <span>Contact support</span>
        </a>
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          <span>↩</span>
          <span>Back to app</span>
        </Link>
      </div>
    </nav>
  );
}
