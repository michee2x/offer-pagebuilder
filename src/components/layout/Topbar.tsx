'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface Step {
  id: number;
  label: string;
  status: 'done' | 'active' | 'pending';
}

interface TopbarProps {
  breadcrumbs: Breadcrumb[];
  steps?: Step[]; // kept for API compatibility, but will not render to keep center empty
  children?: React.ReactNode;
}

export function Topbar({ breadcrumbs, children }: TopbarProps) {
  return (
    <header className="h-14 bg-background border-b border-border flex items-center px-6 gap-4 shrink-0 z-10 w-full relative">
      {/* Breadcrumbs */}
      <div className="flex flex-1 items-center gap-2 text-xs font-medium text-muted-foreground whitespace-nowrap overflow-hidden">
        {breadcrumbs.map((bc, i) => (
          <React.Fragment key={i}>
            {bc.href ? (
              <Link href={bc.href} className="hover:text-foreground transition-colors">
                {bc.label}
              </Link>
            ) : (
              <span className="text-foreground">{bc.label}</span>
            )}
            {i < breadcrumbs.length - 1 && <span className="text-muted-foreground opacity-50 px-0.5">/</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="flex-grow shrink min-w-10"></div>

      {/* Right Side Actions injected by the specific Page */}
      <div className="flex-1 flex items-center justify-end gap-2 shrink-0 h-full">
        {children}
      </div>
    </header>
  );
}
