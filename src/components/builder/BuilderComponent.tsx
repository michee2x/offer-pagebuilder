'use client';

import React from 'react';
import { useBuilderStore, ComponentInstance } from '@/store/builderStore';
import { COMPONENT_REGISTRY } from '@/config/components';

interface BuilderComponentProps {
  id: string;
}

export function BuilderComponent({ id }: BuilderComponentProps) {
  const { components, selectedId, setSelected, isPreviewMode } = useBuilderStore();
  
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
        setSelected(id);
      }}
    >
      <div 
        className={`w-full transition-all ${!isPreviewMode ? 'border-2 border-transparent hover:border-blue-300' : ''} ${isSelected ? '!border-blue-500 rounded relative z-10' : ''}`}
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
        
        {isSelected && !isPreviewMode && (
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-t z-20 pointer-events-auto">
            {config.label}
          </div>
        )}
      </div>
    </div>
  );
}
