'use client';

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
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

      {/* Center: 5-Step Wizard Indicator (only when steps are provided) */}
      {steps && steps.length > 0 ? (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0">
          {steps.map((step, i) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-1.5">
                {/* Bubble */}
                <div
                  className={cn(
                    'w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-200 shrink-0',
                    step.status === 'done' && 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
                    step.status === 'active' && 'bg-primary border-primary text-primary-foreground',
                    step.status === 'pending' && 'border-border text-muted-foreground',
                  )}
                >
                  {step.status === 'done' ? (
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  ) : (
                    step.id
                  )}
                </div>
                {/* Label */}
                <span
                  className={cn(
                    'text-[10.5px] font-semibold whitespace-nowrap',
                    step.status === 'done' && 'text-emerald-400',
                    step.status === 'active' && 'text-foreground',
                    step.status === 'pending' && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="w-5 h-px bg-border mx-1.5 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="flex-grow shrink min-w-10" />
      )}

      {/* Right Side Actions */}
      <div className={cn('flex items-center justify-end gap-2 shrink-0 h-full', steps ? 'flex-1' : '')}>
        {children}
      </div>
    </header>
  );
}
