'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { BuilderComponent } from './BuilderComponent';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export const CANVAS_ID = '__canvas__';

export function Canvas() {
  const { rootList, setSelected, selectedId, canvasStyle, deviceMode, isPreviewMode, setIsPreviewMode } = useBuilderStore();
  const isCanvasSelected = selectedId === CANVAS_ID;

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only select the canvas if the click target IS the page div, not a child component
    e.stopPropagation();
    setSelected(CANVAS_ID);
  };

  // Determine responsive container widths
  const maxWidthClass = deviceMode === 'desktop' ? 'max-w-5xl' : deviceMode === 'tablet' ? 'max-w-[768px]' : 'max-w-[390px]';
  
  // Clean, full bleed styling versus bordered builder box styling
  const previewOuterClasses = isPreviewMode ? 'bg-background' : 'bg-muted/20 py-8 px-4 md:px-8';
  const previewInnerClasses = isPreviewMode ? 'w-full min-h-screen max-w-none rounded-none' : `mx-auto shadow-sm border rounded-lg min-h-[800px] overflow-hidden ${maxWidthClass}`;
  const selectionRing = isCanvasSelected && !isPreviewMode ? 'ring-2 ring-blue-500 ring-offset-2' : '';

  return (
    <div
      className={`flex-1 overflow-y-auto ${previewOuterClasses} transition-all`}
      onClick={() => setSelected(null)} // clicking the gray outer area deselects everything
    >
      {/* Inner page div — clicking selects the canvas */}
      <div
        className={`bg-background transition-all duration-300 transform-gpu ${previewInnerClasses} ${selectionRing}`}
        style={canvasStyle as React.CSSProperties}
        onClick={handleCanvasClick}
      >
        <div
          className={`h-full w-full ${isPreviewMode ? 'min-h-screen p-0' : 'min-h-[800px] p-8'} flex flex-col gap-4 transition-all`}
        >
            {rootList.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg border-muted p-12 text-center pointer-events-none">
                <div>
                  <h3 className="text-lg font-medium mb-1">Canvas is empty</h3>
                  <p className="text-sm">Generate a page using AI to get started.</p>
                </div>
              </div>
            ) : (
              rootList.map((id) => (
                <BuilderComponent key={id} id={id} />
              ))
            )}
        </div>
      </div>
      
      {/* Floating Exit Preview Action */}
      {isPreviewMode && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button variant="secondary" onClick={() => setIsPreviewMode(false)} className="shadow-lg border">
            <X className="w-4 h-4 mr-2" />
            Exit Preview
          </Button>
        </div>
      )}
    </div>
  );
}
