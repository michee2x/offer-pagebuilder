'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Filter, Mail, LineChart,
  Globe, PieChart, Settings, Zap, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const getFunnelId = () => {
    if (pathname === '/builder' || pathname?.startsWith('/builder/')) {
      // In a client component we could use searchParams, but let's just 
      // rely on it if we can extract it. Since we don't have useSearchParams
      // here to keep it simple, we might not show funnel sidebar on '/builder?id='
      // without converting it or using window.location.
      // We will add logic for paths we know.
      return null;
    }
    const parts = pathname?.split('/') || [];
    if (parts.length >= 3) {
      if (['intelligence', 'copy', 'email-sequence', 'traffic', 'funnels'].includes(parts[1])) {
        return parts[2];
      }
    }
    return null;
  };

  const funnelId = getFunnelId();

  const links = funnelId ? [
    { label: 'Back to Workspaces', href: '/', icon: LayoutDashboard },
    { label: 'Funnel Overview', href: `/funnels/${funnelId}`, icon: PieChart },
    { label: 'Page Builder', href: `/builder?id=${funnelId}`, icon: Filter },
    { label: 'Sales Copy', href: `/copy/${funnelId}`, icon: FileText || Filter },
    { label: 'Email Sequence', href: `/email-sequence/${funnelId}`, icon: Mail },
    { label: 'Traffic Intelligence', href: `/traffic/${funnelId}`, icon: LineChart },
    { label: 'Sales Report', href: `/intelligence/${funnelId}`, icon: Zap },
  ] : [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Funnels', href: '/', icon: Filter, badge: 7 },
    { label: 'Email Campaigns', href: '#', icon: Mail },
    { label: 'Traffic Intelligence', href: '#', icon: LineChart },
    { label: 'Publish & Deploy', href: '/builder/publish', icon: Globe },
    { label: 'Analytics', href: '#', icon: PieChart },
  ];

  const accountLinks = [{ label: 'Settings', href: '#', icon: Settings }];

  const isActive = (href: string) => {
    if (href === '#') return false;
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    /* Fixed overlay sidebar — icon strip always shows (w-14), 
       expands to w-56 on hover and floats OVER the canvas */
    <aside className="fixed left-0 top-0 h-full z-50 flex flex-col overflow-hidden group transition-[width] duration-200 ease-out w-14 hover:w-56 bg-background border-r border-border hover:shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      
      {/* Logo */}
      <div className="flex items-center gap-3 px-[14px] h-14 shrink-0 overflow-hidden text-foreground hover:bg-muted cursor-pointer">
        <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Zap className="w-3.5 h-3.5" />
        </div>
        <span className="font-bold text-base tracking-tight whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          Offer<span className="text-primary">IQ</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden flex flex-col gap-0.5">
        <div className="h-5 px-[18px] mb-1 flex items-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
            {funnelId ? 'Funnel Menu' : 'Workspace'}
          </span>
        </div>

        {links.map((item, i) => {
          const active = isActive(item.href);
          return (
            <Link
              key={i}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-[14px] h-9 overflow-hidden whitespace-nowrap transition-colors',
                active
                  ? 'text-foreground bg-muted'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', active && 'text-primary')} />
              <div className="flex-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-150 min-w-0">
                <span className="text-sm font-medium truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        <div className="h-5 px-[18px] mt-4 mb-1 flex items-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
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
                'flex items-center gap-3 px-[14px] h-9 overflow-hidden whitespace-nowrap transition-colors',
                active
                  ? 'text-foreground bg-muted'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border shrink-0">
        <div className="flex items-center gap-3 px-[10px] py-1.5 rounded-md cursor-pointer overflow-hidden hover:bg-muted transition-colors">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
            SC
          </div>
          <div className="flex flex-col min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">Sarah Chen</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
