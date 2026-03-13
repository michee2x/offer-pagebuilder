'use client';

import React from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Palette } from '@/components/builder/Palette';
import { Canvas } from '@/components/builder/Canvas';
import { RightPanel } from '@/components/builder/RightPanel';
import { ComponentType, useBuilderStore } from '@/store/builderStore';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BuilderPage() {
  const { addComponent, moveComponent, setFullState, components, rootList } = useBuilderStore();
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Require a slight movement before dragging starts (prevents clicks from firing drags)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    // optional logic when drag begins
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // 1. Dropping from Palette to Canvas
    if (active.data.current?.type === 'palette-item' && over.id === 'canvas-root') {
      const componentType = active.data.current.componentType as ComponentType;
      addComponent(componentType); // Add to end of list
      return;
    }

    // 2. Reordering within the Canvas
    if (active.data.current?.type === 'canvas-item') {
      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId !== overId) {
        // Find index of the item we hovered over
        const overIndex = rootList.indexOf(overId);
        moveComponent(activeId, overIndex);
      }
    }
  };

  const handleGeneratePage = async () => {
    try {
      setIsGenerating(true);
      toast.info('Generating page from content doc...');
      
      const res = await fetch('/api/generate', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate');
      }

      const { items } = await res.json();
      
      // Transform array items into our Zustand state format
      const newComponents: Record<string, any> = {};
      const newRootList: string[] = [];

      items.forEach((item: any) => {
        newComponents[item.id] = {
           id: item.id,
           type: item.type,
           props: item.props,
           parentId: 'root'
        };
        newRootList.push(item.id);
      });

      setFullState(newComponents, newRootList);
      toast.success('Generated page successfully!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b px-6 flex items-center justify-between shrink-0">
        <h1 className="font-semibold tracking-tight">OfferIQ AI Builder</h1>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGeneratePage} 
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4" />}
            Generate from Doc
          </Button>
          <Button size="sm">Publish</Button>
        </div>
      </header>

      {/* Main Extensible Editor Area */}
      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          <Palette />
          <Canvas />
          <RightPanel />
        </div>
      </DndContext>
    </div>
  );
}
