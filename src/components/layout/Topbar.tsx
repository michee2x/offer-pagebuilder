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
  children?: React.ReactNode;
}

export function Topbar({ breadcrumbs, steps, children }: TopbarProps) {
  return (
    <header className="h-14 bg-background border-b border-border flex items-center px-6 gap-4 shrink-0 z-10 w-full relative">
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
        {children}
      </div>
    </header>
  );
}
