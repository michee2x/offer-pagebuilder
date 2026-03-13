'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBuilderStore } from '@/store/builderStore';
import { BuilderComponent } from './BuilderComponent';

export const CANVAS_ID = '__canvas__';

export function Canvas() {
  const { rootList, setSelected, selectedId, canvasStyle } = useBuilderStore();
  const isCanvasSelected = selectedId === CANVAS_ID;

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
    data: { type: 'canvas' },
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only select the canvas if the click target IS the page div, not a child component
    e.stopPropagation();
    setSelected(CANVAS_ID);
  };

  return (
    <div
      className="flex-1 bg-muted/20 p-8 overflow-y-auto"
      onClick={() => setSelected(null)} // clicking the gray outer area deselects everything
    >
      {/* Inner page div — clicking selects the canvas */}
      <div
        className={`max-w-4xl mx-auto bg-background min-h-[800px] shadow-sm border rounded-lg overflow-hidden transition-all duration-150 ${
          isCanvasSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
        }`}
        style={canvasStyle as React.CSSProperties}
        onClick={handleCanvasClick}
      >
        <div
          ref={setNodeRef}
          className={`h-full w-full min-h-[800px] p-8 flex flex-col gap-4 transition-colors ${isOver ? 'bg-muted/10' : ''}`}
        >
          <SortableContext items={rootList} strategy={verticalListSortingStrategy}>
            {rootList.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg border-muted p-12 text-center pointer-events-none">
                <div>
                  <h3 className="text-lg font-medium mb-1">Canvas is empty</h3>
                  <p className="text-sm">Drag components from the palette to start building.</p>
                </div>
              </div>
            ) : (
              rootList.map((id) => (
                <BuilderComponent key={id} id={id} />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
