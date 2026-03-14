'use client';

import React from 'react';
import { Canvas } from '@/components/builder/Canvas';
import { RightPanel } from '@/components/builder/RightPanel';
import { useBuilderStore } from '@/store/builderStore';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Monitor, Tablet, Smartphone, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function BuilderPage() {
  const { addComponent, moveComponent, setFullState, components, rootList, deviceMode, setDeviceMode, isPreviewMode, setIsPreviewMode } = useBuilderStore();
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
      {!isPreviewMode && (
        <header className="h-14 border-b px-6 flex items-center justify-between shrink-0">
          <div className="font-semibold tracking-tight w-48">OfferIQ AI Builder</div>
          
          <div className="flex items-center bg-muted/50 p-1 rounded-md">
            <Button variant={deviceMode === 'desktop' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setDeviceMode('desktop')}><Monitor className="h-4 w-4" /></Button>
            <Button variant={deviceMode === 'tablet' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setDeviceMode('tablet')}><Tablet className="h-4 w-4" /></Button>
            <Button variant={deviceMode === 'mobile' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setDeviceMode('mobile')}><Smartphone className="h-4 w-4" /></Button>
          </div>

          <div className="flex gap-3 justify-end w-48">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGeneratePage} 
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4" />}
              Generate
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setIsPreviewMode(true)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button size="sm">Publish</Button>
          </div>
        </header>
      )}

      {/* Main Extensible Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        <Canvas />
        {!isPreviewMode && <RightPanel />}
      </div>
    </div>
  );
}
