"use client"

import React, { useEffect, useState } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Canvas } from '@/components/builder/Canvas';

export function ViewerHydrator({ blocks }: { blocks: any }) {
  const { setFullState, setIsPreviewMode, setTheme } = useBuilderStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (blocks && blocks.components && blocks.rootList) {
      // 1. Hydrate the global Zustand store with the database JSON
      setFullState(blocks.components, blocks.rootList);
      
      // 2. Lock the builder into Preview Mode permanently for the Viewer
      setIsPreviewMode(true);
      
      // Restore canvas style
      if (blocks.canvasStyle) {
          useBuilderStore.setState({ canvasStyle: blocks.canvasStyle });
      }
      // Restore theme so published page matches what the user designed
      if (blocks.theme) {
          setTheme(blocks.theme);
      }

      queueMicrotask(() => setMounted(true));
    }
  }, [blocks, setFullState, setIsPreviewMode]);

  if (!mounted) {
      return null; // Avoid hydration mismatch
  }

  return (
      <div className="w-screen min-h-screen bg-background text-foreground flex flex-col">
          <Canvas isLiveViewer={true} />
      </div>
  );
}
