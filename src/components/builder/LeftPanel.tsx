'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { cn } from '@/lib/utils';
import {
  Plus, Target,
  HeartHandshake, Layout, Layers,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

export function LeftPanel() {
  const { rootList, components, selectedId, setSelected, pages, activePagePath, switchPage } = useBuilderStore();

  return (
    /* Absolutely positioned over the canvas — icon strip always shows,
       expands and overlays on hover */
    <aside className="absolute left-0 top-0 h-full z-40 flex flex-col overflow-hidden group/panel transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] w-[52px] hover:w-[220px] bg-[#0e1118]/95 border-r border-white/[0.07] backdrop-blur-sm hover:shadow-[6px_0_32px_rgba(0,0,0,0.55)]">

      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      {/* Pages section */}
      <div className="border-b border-white/[0.07] overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-3 px-[14px] h-10 shrink-0">
          <Layers className="w-4 h-4 text-white/30 shrink-0 transition-colors group-hover/panel:text-white/50" />
          <div className="flex-1 flex items-center justify-between opacity-0 group-hover/panel:opacity-100 transition-opacity duration-200 min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30 whitespace-nowrap">Pages</span>
            <span className="text-[9px] bg-white/10 text-white/40 px-1.5 py-0.5 rounded-full whitespace-nowrap font-medium">{Object.keys(pages || {}).length} active</span>
          </div>
        </div>

        <div className="flex flex-col pb-1.5">
          {Object.values(pages || {})
            .sort((a: any, b: any) => {
              const order = ["/", "/sales", "/upsell", "/downsell", "/thankyou", "/thank-you"];
              const indexA = order.indexOf(a.path);
              const indexB = order.indexOf(b.path);
              if (indexA !== -1 && indexB !== -1) return indexA - indexB;
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              return a.name.localeCompare(b.name);
            })
            .map((page: any) => {
            const isActive = activePagePath === page.path;
            let Icon = Target;
            if (page.path === '/upsell') Icon = ArrowUpRight;
            if (page.path === '/downsell') Icon = ArrowDownRight;
            if (page.path === '/thankyou' || page.path === '/thank-you') Icon = HeartHandshake;

            return (
              <div
                key={page.path}
                onClick={() => switchPage(page.path)}
                title={page.name}
                className={cn(
                  'relative flex items-center gap-3 px-[14px] h-9 cursor-pointer transition-all duration-200 whitespace-nowrap overflow-hidden',
                  isActive
                    ? 'bg-white/[0.06] text-white'
                    : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                )}
              >
                {/* Active left indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-indigo-400 to-blue-500 rounded-r-full" />
                )}
                <Icon className={cn('w-3.5 h-3.5 shrink-0 transition-colors', isActive ? 'text-indigo-400' : '')} />
                <div className="flex-1 flex items-center justify-between opacity-0 group-hover/panel:opacity-100 transition-opacity duration-200 min-w-0">
                  <span className="text-[11px] font-semibold truncate">{page.name}</span>
                  <span className="text-[9px] text-white/25 ml-2 shrink-0 tabular-nums">
                    {isActive ? `${rootList.length} secs` : `${page.rootList?.length || 0} secs`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sections list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
        {/* Section header */}
        <div className="flex items-center gap-3 px-[14px] h-9 shrink-0 border-b border-white/[0.06]">
          <Layout className="w-3.5 h-3.5 text-white/30 shrink-0 transition-colors group-hover/panel:text-white/50" />
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30 opacity-0 group-hover/panel:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {pages[activePagePath]?.name || 'Page'} — {rootList.length} Sections
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
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                title={comp?.type || 'Section'}
                className={cn(
                  'relative flex items-center gap-3 px-[14px] h-8 cursor-pointer transition-all duration-150 whitespace-nowrap overflow-hidden group/item',
                  isSelected
                    ? 'bg-white/[0.06] text-white'
                    : 'text-white/35 hover:bg-white/[0.03] hover:text-white/60'
                )}
              >
                {/* Selected left bar */}
                {isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gradient-to-b from-indigo-400 to-blue-500 rounded-r-full" />
                )}
                <Layout className="w-3 h-3 shrink-0" />
                <div className="flex-1 flex items-center justify-between opacity-0 group-hover/panel:opacity-100 transition-opacity duration-200 min-w-0">
                  <span className="text-[11px] font-medium truncate">{comp?.type || 'Section'}</span>
                  <span className="text-[9px] text-white/20 ml-2 shrink-0 font-mono tabular-nums">
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
        className="border-t border-white/[0.07] px-[14px] h-10 flex items-center gap-3 cursor-pointer hover:bg-white/[0.04] transition-all duration-200 shrink-0 whitespace-nowrap overflow-hidden group/add"
        onClick={() => {
          const evt = new CustomEvent('OPEN_SECTION_MODAL', { detail: { index: rootList.length } });
          window.dispatchEvent(evt);
        }}
      >
        <div className="w-4 h-4 shrink-0 flex items-center justify-center rounded-full border border-white/20 group-hover/add:border-indigo-500/60 group-hover/add:bg-indigo-500/10 transition-all duration-200">
          <Plus className="w-2.5 h-2.5 text-white/40 group-hover/add:text-indigo-400 transition-colors" />
        </div>
        <span className="text-[11px] font-semibold text-white/40 group-hover/add:text-white/70 opacity-0 group-hover/panel:opacity-100 transition-all duration-200">
          Add Section
        </span>
      </div>
    </aside>
  );
}
