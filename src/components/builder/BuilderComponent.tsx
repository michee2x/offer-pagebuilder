'use client';

import React from 'react';
import { useBuilderStore, ComponentInstance } from '@/store/builderStore';
import { COMPONENT_REGISTRY } from '@/config/components';
import { ArrowUp, ArrowDown, Copy, Trash2, Edit2, Bot } from 'lucide-react';

interface BuilderComponentProps {
  id: string;
}

export function BuilderComponent({ id }: BuilderComponentProps) {
  const { components, rootList, selectedId, selectedField, setSelected, isPreviewMode, removeComponent, moveComponent, duplicateComponent } = useBuilderStore();
  
  const component = components[id];
  if (!component) return null;

  const config = COMPONENT_REGISTRY[component.type];
  const isSelected = selectedId === id && !isPreviewMode;
  const isHeader = component.type.includes('Header');
  const currentIndex = rootList.indexOf(id);

  return (
    <div
      className={`relative group ${isHeader ? 'z-[100]' : 'z-0'} peer`}
      onClick={(e) => {
        if (isPreviewMode) return;
        e.stopPropagation();
        
        const fieldTarget = (e.target as HTMLElement).closest('[data-field]');
        const fieldKey = fieldTarget ? fieldTarget.getAttribute('data-field') : null;
        
        setSelected(id, fieldKey);
      }}
    >
      <div 
        className={`w-full transition-all relative ${!isPreviewMode ? 'border-2 border-transparent hover:border-blue-400/60' : ''} ${isSelected && !selectedField ? '!border-blue-500 rounded z-10 box-shadow-[0_0_0_4px_rgba(59,130,246,0.12)]' : ''} ${isSelected && selectedField ? '!border-blue-300 border-dashed rounded z-10' : ''}`}
      >
        {/* Hover Overlay Toolbar */}
        {!isPreviewMode && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 rounded">
            {/* Top-left Badge */}
            <div className="absolute top-2.5 left-2.5 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 shadow-sm whitespace-nowrap">
              <span className="text-[10px]">📍</span> {config.label}
            </div>

            {/* Top-right Actions */}
            <div className="absolute top-2.5 right-2.5 flex gap-1 pointer-events-auto">
              {currentIndex > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); moveComponent(id, currentIndex - 1); }}
                  className="w-[28px] h-[28px] rounded-md bg-slate-900/95 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-500/15 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              )}
              {currentIndex < rootList.length - 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); moveComponent(id, currentIndex + 1); }}
                  className="w-[28px] h-[28px] rounded-md bg-slate-900/95 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-500/15 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); duplicateComponent(id); }}
                className="w-[28px] h-[28px] rounded-md bg-slate-900/95 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
                title="Duplicate"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelected(id); }}
                className="w-[28px] h-[28px] rounded-md bg-slate-900/95 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:bg-amber-500/15 hover:text-amber-400 hover:border-amber-500/30 transition-all"
                title="Edit Properties"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); removeComponent(id); }}
                className="w-[28px] h-[28px] rounded-md bg-slate-900/95 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom-center AI Button */}
            <button
              onClick={(e) => { e.stopPropagation(); setSelected(id); /* AI auto-focus is implicitly in RightPanel */ }}
              className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-blue-600 border border-violet-400/40 rounded-full px-3.5 py-1 text-[11px] font-bold text-white flex items-center gap-1.5 z-30 whitespace-nowrap shadow-[0_4px_18px_rgba(139,92,246,0.4)] pointer-events-auto hover:scale-105 transition-transform backdrop-blur-sm"
            >
              <Bot className="w-3.5 h-3.5" /> ✨ Edit with AI
            </button>
          </div>
        )}

        <div className={`relative ${isHeader ? 'z-[100]' : 'z-10'}`}>
          {config.render({
            ...component.props,
            isPreviewMode,
            children: component.childrenIds?.map((childId: string) => (
              <BuilderComponent key={childId} id={childId} />
            ))
          })}
        </div>
        
        {/* Dynamic scoped CSS to highlight ONLY the selected nested field */}
        {isSelected && selectedField && !isPreviewMode && (
          <style>{`
            [data-field="${selectedField}"] {
              outline: 2px solid #3b82f6 !important;
              outline-offset: 4px;
              border-radius: 4px;
              position: relative;
              z-index: 50;
              transition: outline 0.1s ease-in-out;
            }
          `}</style>
        )}
      </div>
    </div>
  );
}
