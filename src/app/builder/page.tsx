'use client';

import React from 'react';
import { Canvas } from '@/components/builder/Canvas';
import { RightPanel } from '@/components/builder/RightPanel';
import { ComponentType, useBuilderStore } from '@/store/builderStore';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BuilderPage() {
  const { addComponent, moveComponent, setFullState, components, rootList } = useBuilderStore();
  const [isGenerating, setIsGenerating] = React.useState(false);

  // No more DND sensors or event handlers needed

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
      
      // Transform nested tree items into our flat Zustand state format
      const newComponents: Record<string, any> = {};

      const flattenItems = (itemList: any[], parentId: string): string[] => {
        const ids: string[] = [];
        if (!Array.isArray(itemList)) return ids;
        
        itemList.forEach((item) => {
          const compId = String(item.id);
          ids.push(compId);
          
          let childrenIds: string[] = [];
          if (item.children && Array.isArray(item.children)) {
            childrenIds = flattenItems(item.children, compId);
          }

          newComponents[compId] = {
             id: compId,
             type: item.type,
             props: item.props || {},
             parentId,
             childrenIds
          };
        });
        return ids;
      };

      const newRootList = flattenItems(items, 'root');
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
      <div className="flex flex-1 overflow-hidden">
        <Canvas />
        <RightPanel />
      </div>
    </div>
  );
}
