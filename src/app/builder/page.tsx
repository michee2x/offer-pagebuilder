'use client';

import React from 'react';
import { Canvas } from '@/components/builder/Canvas';
import { RightPanel } from '@/components/builder/RightPanel';
import { useBuilderStore } from '@/store/builderStore';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Monitor, Tablet, Smartphone, Eye, Link as LinkIcon, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function BuilderPage() {
  const { addComponent, moveComponent, setFullState, components, rootList, canvasStyle, deviceMode, setDeviceMode, isPreviewMode, setIsPreviewMode } = useBuilderStore();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [publishedUrl, setPublishedUrl] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

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

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      toast.loading('Publishing page...');
      
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ components, rootList, canvasStyle })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish');
      }

      toast.dismiss();
      
      const url = `${window.location.origin}/p/${data.pageId}`;
      setPublishedUrl(url);
      
      toast.success('Published successfully!', {
        description: (
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-xs text-muted-foreground">Your page is now live at:</span>
            <a 
              href={url} 
              target="_blank" 
              rel="noreferrer" 
              className="font-mono text-xs text-blue-500 hover:underline break-all bg-muted/50 p-2 rounded"
            >
              {url}
            </a>
          </div>
        ),
        duration: 8000
      });

    } catch (e: any) {
      toast.dismiss();
      toast.error(e.message);
    } finally {
      setIsPublishing(false);
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

          <div className="flex gap-3 justify-end w-auto min-w-48 items-center">
            {publishedUrl && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2 border-green-500/30 text-green-600 hover:bg-green-500/10"
                  onClick={() => {
                      navigator.clipboard.writeText(publishedUrl);
                      setCopied(true);
                      toast.success('Link copied to clipboard');
                      setTimeout(() => setCopied(false), 2000);
                  }}
                >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    Copy Link
                </Button>
            )}
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
            <Button size="sm" onClick={handlePublish} disabled={isPublishing}>
                {isPublishing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Publish
            </Button>
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
