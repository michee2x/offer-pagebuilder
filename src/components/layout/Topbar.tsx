'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string | React.ReactNode;
  href?: string;
}

export interface WizardStep {
  id: number;
  label: string;
  status: 'done' | 'active' | 'pending';
}

interface TopbarProps {
  breadcrumbs: Breadcrumb[];
  steps?: WizardStep[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

import { useUIStore } from '@/store/uiStore';

export function Topbar({ breadcrumbs, steps, actions, children }: TopbarProps) {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <header className="h-14 bg-[#0a0a0a]/50 backdrop-blur-2xl border-b border-white/10 flex items-center px-3 gap-2 shrink-0 z-50 w-full relative overflow-hidden">
      {/* Menu Toggle — always visible, never shrinks */}
      <button 
        onClick={toggleSidebar}
        className="flex flex-col gap-1 px-2 py-3 cursor-pointer group shrink-0" 
        aria-label="Toggle Menu"
      >
        <span className="w-5 h-0.5 bg-muted-foreground group-hover:bg-foreground transition-colors rounded-full" />
        <span className="w-5 h-0.5 bg-muted-foreground group-hover:bg-foreground transition-colors rounded-full" />
        <span className="w-3 h-0.5 bg-muted-foreground group-hover:bg-foreground transition-colors rounded-full" />
      </button>

      <div className="w-px h-6 bg-border shrink-0" />

      {/* Breadcrumbs — clamps on small screens, last crumb (funnel name input) truncates first */}
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground min-w-0 overflow-hidden shrink">
        {breadcrumbs.map((bc, i) => (
          <React.Fragment key={i}>
            {bc.href ? (
              <Link
                href={bc.href}
                className={cn(
                  'hover:text-foreground transition-colors shrink-0 whitespace-nowrap',
                  // Hide non-last linked crumbs on very small screens
                  i < breadcrumbs.length - 2 ? 'hidden sm:inline' : ''
                )}
              >
                {bc.label}
              </Link>
            ) : (
              <span className="text-foreground min-w-0 overflow-hidden">{bc.label}</span>
            )}
            {i < breadcrumbs.length - 1 && (
              <span className={cn(
                'text-muted-foreground opacity-40 shrink-0',
                i < breadcrumbs.length - 2 ? 'hidden sm:inline' : ''
              )}>/</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Flexible spacer */}
      <div className="flex-1 min-w-0" />

      {/* Right Side Actions — never shrinks, always fully visible */}
      <div className={cn('flex items-center justify-end gap-1 shrink-0 h-full', steps ? '' : '')}>
        {actions}
        {children}
      </div>
    </header>
  );
}
