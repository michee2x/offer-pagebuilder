'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { cn } from '@/lib/utils';
import {
  Plus, Target, CircleDollarSign, Rocket,
  HeartHandshake, Layout, Layers
} from 'lucide-react';

export function LeftPanel() {
  const { rootList, components, selectedId, setSelected, pages, activePagePath, switchPage } = useBuilderStore();

  return (
    /* Absolutely positioned over the canvas — icon strip always shows,
       expands and overlays on hover */
    <aside className="absolute left-0 top-0 h-full z-40 flex flex-col overflow-hidden group transition-[width] duration-200 ease-out w-14 hover:w-[240px] bg-card border-r border-border hover:shadow-[4px_0_24px_rgba(0,0,0,0.45)]">
      
      {/* Pages section */}
      <div className="border-b border-border overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-3 px-[14px] h-10 shrink-0">
          <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-150 min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Pages</span>
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">{Object.keys(pages || {}).length} active</span>
          </div>
        </div>

        <div className="flex flex-col pb-2">
          {Object.values(pages || {}).map((page: any) => {
            const isActive = activePagePath === page.path;
            const Icon = page.path === '/thank-you' ? HeartHandshake : Target;
            
            return (
              <div
                key={page.path}
                onClick={() => switchPage(page.path)}
                className={cn(
                  'flex items-center gap-3 px-[14px] h-9 cursor-pointer transition-colors whitespace-nowrap overflow-hidden',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive && 'text-primary')} />
                <div className="flex-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-150 min-w-0">
                  <span className="text-xs font-medium truncate">{page.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-2 shrink-0">{isActive ? `${rootList.length} secs` : `${page.rootList?.length || 0} secs`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sections list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
        {/* Section header */}
        <div className="flex items-center gap-3 px-[14px] h-10 shrink-0 border-b border-border/50">
          <Layout className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
            Lead Capture — {rootList.length} Sections
          </span>
        </div>

        <div className="flex flex-col py-1">
          {rootList.map((id, index) => {
            const comp = components[id];
            const isSelected = selectedId === id;
            return (
              <div
                key={id}
                onClick={() => {
                  setSelected(id);
                  const el = document.querySelector(`[data-component-id="${id}"]`);
                  if (el) {
                    // Try to scroll the canvas view, handling responsive iframe if needed
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className={cn(
                  'flex items-center gap-3 px-[14px] h-9 cursor-pointer transition-colors border-l-2 whitespace-nowrap overflow-hidden',
                  isSelected
                    ? 'bg-muted border-l-primary text-foreground'
                    : 'border-l-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <Layout className="w-3.5 h-3.5 shrink-0" />
                <div className="flex-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-150 min-w-0">
                  <span className="text-xs font-medium truncate">{comp?.type || 'Section'}</span>
                  <span className="text-[10px] text-muted-foreground/60 ml-2 shrink-0 font-mono">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Section footer */}
      <div
        className="border-t border-border px-[14px] h-11 flex items-center gap-3 cursor-pointer hover:bg-muted transition-colors shrink-0 whitespace-nowrap overflow-hidden"
        onClick={() => {
          const evt = new CustomEvent('OPEN_SECTION_MODAL', { detail: { index: rootList.length } });
          window.dispatchEvent(evt);
        }}
      >
        <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          Add Section
        </span>
      </div>
    </aside>
  );
}
