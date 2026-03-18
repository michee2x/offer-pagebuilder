'use client';

import React from 'react';
import { useBuilderStore, ComponentInstance } from '@/store/builderStore';
import { COMPONENT_REGISTRY } from '@/config/components';

interface BuilderComponentProps {
  id: string;
}

export function BuilderComponent({ id }: BuilderComponentProps) {
  const { components, selectedId, selectedField, setSelected, isPreviewMode } = useBuilderStore();
  
  const component = components[id];
  if (!component) return null;

  const config = COMPONENT_REGISTRY[component.type];
  const isSelected = selectedId === id && !isPreviewMode;

  return (
    <div
      className="relative group"
      onClick={(e) => {
        if (isPreviewMode) return;
        e.stopPropagation();
        
        // Find if the user clicked inside a specifically tagged field (e.g. data-field="headline")
        const fieldTarget = (e.target as HTMLElement).closest('[data-field]');
        const fieldKey = fieldTarget ? fieldTarget.getAttribute('data-field') : null;
        
        setSelected(id, fieldKey);
      }}
    >
      <div 
        className={`w-full transition-all ${!isPreviewMode ? 'border-2 border-transparent hover:border-blue-300' : ''} ${isSelected && !selectedField ? '!border-blue-500 rounded relative z-10' : ''} ${isSelected && selectedField ? '!border-blue-300 border-dashed rounded relative z-10' : ''}`}
      >
        <div className="relative z-10">
          {config.render({
            ...component.props,
            isPreviewMode,
            children: component.childrenIds?.map((childId: string) => (
              <BuilderComponent key={childId} id={childId} />
            ))
          })}
        </div>
        
        {isSelected && !selectedField && !isPreviewMode && (
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-t z-20 pointer-events-auto">
            {config.label}
          </div>
        )}

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
