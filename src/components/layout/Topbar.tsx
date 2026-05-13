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
    <header className="h-14 bg-background border-b border-border flex items-center px-4 gap-4 shrink-0 z-50 w-full relative">
      {/* Menu Toggle */}
      <button 
        onClick={toggleSidebar}
        className="flex flex-col gap-1 px-2 py-3 cursor-pointer group" 
        aria-label="Toggle Menu"
      >
        <span className="w-5 h-0.5 bg-muted-foreground group-hover:bg-foreground transition-colors rounded-full" />
        <span className="w-5 h-0.5 bg-muted-foreground group-hover:bg-foreground transition-colors rounded-full" />
        <span className="w-3 h-0.5 bg-muted-foreground group-hover:bg-foreground transition-colors rounded-full" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground whitespace-nowrap overflow-hidden min-w-0 shrink">
        {breadcrumbs.map((bc, i) => (
          <React.Fragment key={i}>
            {bc.href ? (
              <Link href={bc.href} className="hover:text-foreground transition-colors shrink-0">
                {bc.label}
              </Link>
            ) : (
              <span className="text-foreground shrink-0">{bc.label}</span>
            )}
            {i < breadcrumbs.length - 1 && <span className="text-muted-foreground opacity-40 px-0.5 shrink-0">/</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Center Padding to keep right actions aligned */}
      <div className="flex-grow shrink min-w-10" />

      {/* Right Side Actions */}
      <div className={cn('flex items-center justify-end gap-2 shrink-0 h-full', steps ? 'flex-1' : '')}>
        {actions}
        {children}
      </div>
    </header>
  );
}
