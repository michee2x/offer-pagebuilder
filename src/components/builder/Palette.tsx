'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ComponentType } from '@/store/builderStore';
import { COMPONENT_REGISTRY } from '@/config/components';
import { GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function Palette() {
  const componentTypes = Object.keys(COMPONENT_REGISTRY) as ComponentType[];

  return (
    <div className="w-64 border-r bg-background p-4 flex flex-col gap-4 overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold mb-1">Components</h2>
        <p className="text-sm text-muted-foreground mb-4">Drag elements to the canvas</p>
      </div>
      
      <div className="flex flex-col gap-2">
        {componentTypes.map((type) => (
          <DraggablePaletteItem key={type} type={type} />
        ))}
      </div>
    </div>
  );
}

function DraggablePaletteItem({ type }: { type: ComponentType }) {
  const config = COMPONENT_REGISTRY[type];
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: {
      type: 'palette-item',
      componentType: type,
    },
  });

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 flex items-center gap-3 cursor-grab hover:border-primary transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium text-sm">{config.label}</span>
    </Card>
  );
}
