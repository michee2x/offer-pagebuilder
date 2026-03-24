'use client';

import React from 'react';
import { Canvas } from '@/components/builder/Canvas';
import { RightPanel } from '@/components/builder/RightPanel';
import { ThemeSwitcher } from '@/components/builder/ThemeSwitcher';
import { SectionLibraryModal } from '@/components/builder/SectionLibraryModal';
import { useBuilderStore } from '@/store/builderStore';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Monitor, Tablet, Smartphone, Eye, Link as LinkIcon, Check, Undo2, Redo2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function BuilderPage() {
  const { 
    addComponent, moveComponent, setFullState, components, rootList, 
    canvasStyle, deviceMode, setDeviceMode, isPreviewMode, setIsPreviewMode, 
    pageId, setPageId, theme, setTheme, hasUnsavedChanges, setHasUnsavedChanges,
    undo, redo, past, future 
  } = useBuilderStore();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [publishedUrl, setPublishedUrl] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const qs = new URLSearchParams(window.location.search);
      const editId = qs.get('id');
      
      if (editId) {
          fetch(`/api/pages/${editId}`)
            .then(res => res.json())
            .then(data => {
                if (data.page && data.page.blocks) {
                    setPageId(data.page.id);
                    setFullState(data.page.blocks.components, data.page.blocks.rootList);
                    if (data.page.blocks.canvasStyle) {
                        useBuilderStore.setState({ canvasStyle: data.page.blocks.canvasStyle });
                    }
                    if (data.page.blocks.theme) {
                        setTheme(data.page.blocks.theme);
                    }
                    setPublishedUrl(`${window.location.origin}/p/${data.page.id}`);
                }
            })
            .catch(err => console.error("Failed to fetch page:", err))
            .finally(() => setInitialLoading(false));
      } else {
          // Reset store for Create New Mode
          setPageId(null);
          setFullState({}, []);
          useBuilderStore.setState({ canvasStyle: {} });
          setInitialLoading(false);
      }
    }
  }, [setPageId, setFullState]);

  // No more DND sensors or event handlers needed

  const handleGeneratePage = async () => {
    try {
      setIsGenerating(true);
      toast.info('Generating page from content doc...');
      
      const qs = new URLSearchParams(window.location.search);
      const offerContext = {
        niche: qs.get('niche'),
        audience: qs.get('audience'),
        tone: qs.get('tone'),
        productType: qs.get('productType'),
      };

      const res = await fetch('/api/generate', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerContext })
      });
      
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
      setHasUnsavedChanges(true); // Generation clears state, mark explicit unsaved 
      // Theme is NOT changed by generation — user keeps their chosen theme
      toast.success('Generated page successfully!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      toast.loading('Saving draft...');
      
      const payload: any = { components, rootList, canvasStyle, theme };
      if (pageId) payload.pageId = pageId;

      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      toast.dismiss();
      
      const url = `${window.location.origin}/p/${data.pageId}`;
      setPublishedUrl(url);
      setHasUnsavedChanges(false);
      
      if (!pageId && data.pageId) {
          setPageId(data.pageId);
      }
      
      toast.success('Saved successfully!');

    } catch (e: any) {
      toast.dismiss();
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (initialLoading) {
      return (
          <div className="flex h-screen w-screen items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-4">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
                 <p className="text-sm text-muted-foreground animate-pulse">Loading workspace...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Navigation Bar */}
      {!isPreviewMode && (
        <header className="h-14 border-b px-6 flex items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-4 w-auto min-w-48">
            <div className="font-semibold tracking-tight">OfferIQ AI Builder</div>
            {theme && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-muted/50 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                {theme.name}
              </div>
            )}
            <div className="flex items-center gap-1 border-l pl-4 ml-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={past.length === 0} title="Undo">
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={future.length === 0} title="Redo">
                <Redo2 className="h-4 w-4" />
              </Button>
              <div className="w-px h-4 bg-border mx-2"></div>
              <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={() => window.dispatchEvent(new CustomEvent('OPEN_SECTION_MODAL', { detail: { index: rootList.length } }))}>
                <Plus className="h-4 w-4" /> Add Section
              </Button>
            </div>
          </div>
          
          {/* Device mode toggles (centered, flex-1 forces it into the middle) */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center bg-muted/50 p-1 rounded-md">
              <Button variant={deviceMode === 'desktop' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setDeviceMode('desktop')}><Monitor className="h-4 w-4" /></Button>
              <Button variant={deviceMode === 'tablet' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setDeviceMode('tablet')}><Tablet className="h-4 w-4" /></Button>
              <Button variant={deviceMode === 'mobile' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setDeviceMode('mobile')}><Smartphone className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="flex gap-3 justify-end w-auto min-w-48 items-center">
            {/* Theme Switcher — always accessible */}
            <ThemeSwitcher />

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
            <Button 
                size="sm" 
                variant="outline"
                onClick={handleSave} 
                disabled={isSaving || (pageId !== null && !hasUnsavedChanges)}
            >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {!pageId ? 'Save Draft' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
            </Button>
            <Button 
                size="sm" 
                onClick={() => {
                  if (!pageId) {
                    toast.error('Please save your draft first before deploying.');
                    return;
                  }
                  window.location.href = `/builder/publish?id=${pageId}`;
                }} 
            >
                Deploy
            </Button>
          </div>
        </header>
      )}

      {/* Main Extensible Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        <Canvas />
        {!isPreviewMode && <RightPanel />}
      </div>
      
      {/* Modals outside main flex flow */}
      <SectionLibraryModal />
    </div>
  );
}
