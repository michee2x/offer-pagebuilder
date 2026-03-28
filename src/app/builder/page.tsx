'use client';

import React from 'react';
import { Canvas } from '@/components/builder/Canvas';
import { RightPanel } from '@/components/builder/RightPanel';
import { ThemeSwitcher } from '@/components/builder/ThemeSwitcher';
import { SectionLibraryModal } from '@/components/builder/SectionLibraryModal';
import { useBuilderStore } from '@/store/builderStore';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Monitor, Tablet, Smartphone, Eye, Link as LinkIcon, Check, Undo2, Redo2, Plus, Globe, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { LeftPanel } from '@/components/builder/LeftPanel';
import { cn } from '@/lib/utils';

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
                    if (data.page.custom_domain) {
                        setPublishedUrl(`https://${data.page.custom_domain}`);
                    } else if (data.page.subdomain) {
                        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                        const proto = isLocal ? 'http://' : 'https://';
                        const base = isLocal ? window.location.host : 'ofiq.app';
                        setPublishedUrl(`${proto}${data.page.subdomain}.${base}`);
                    } else {
                        setPublishedUrl(null);
                    }
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
      
      // We only update published URL if the publish endpoint returns them, 
      // otherwise it remains what it was (maybe they configured it on Deploy page)
      if (data.custom_domain || data.subdomain) {
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const proto = isLocal ? 'http://' : 'https://';
          const base = isLocal ? window.location.host : 'ofiq.app';
          
          if (data.custom_domain) {
              setPublishedUrl(`https://${data.custom_domain}`);
          } else {
              setPublishedUrl(`${proto}${data.subdomain}.${base}`);
          }
      }
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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar is fixed-positioned — renders itself, just mount it */}
      <Sidebar />

      {/* Main content offset by sidebar icon strip width (w-14 = 56px) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ marginLeft: '56px' }}>
        {/* Top Navigation Bar */}
        <Topbar 
          breadcrumbs={[
              { label: 'Workspace' },
              { label: 'Funnels', href: '/' },
              { label: 'Copy Engine', href: '#' },
              { label: 'Page Builder' }
          ]}
          steps={[
              { id: 1, label: 'Upload', status: 'done' },
              { id: 2, label: 'Intelligence', status: 'done' },
              { id: 3, label: 'Copy', status: 'done' },
              { id: 4, label: 'Build Pages', status: 'active' },
              { id: 5, label: 'Publish', status: 'pending' },
          ]}
        >
            <div className="flex items-center gap-1 ml-auto">
              {/* Device mode toggles */}
              <div className="flex items-center bg-muted/30 rounded-md border border-border mr-2 p-0.5">
                <button
                  title="Desktop"
                  onClick={() => setDeviceMode('desktop')}
                  className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${deviceMode === 'desktop' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  title="Tablet"
                  onClick={() => setDeviceMode('tablet')}
                  className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${deviceMode === 'tablet' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Tablet className="h-3.5 w-3.5" />
                </button>
                <button
                  title="Mobile"
                  onClick={() => setDeviceMode('mobile')}
                  className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${deviceMode === 'mobile' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Separator */}
              <div className="w-px h-5 bg-border mx-1" />

              {/* Undo / Redo */}
              <button title="Undo" onClick={undo} disabled={past.length === 0} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <Undo2 className="h-4 w-4" />
              </button>
              <button title="Redo" onClick={redo} disabled={future.length === 0} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <Redo2 className="h-4 w-4" />
              </button>

              {/* Separator */}
              <div className="w-px h-5 bg-border mx-1" />

              {/* Theme Switcher */}
              <ThemeSwitcher />

              {/* Preview */}
              <button title="Preview page" onClick={() => setIsPreviewMode(true)} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Eye className="w-4 h-4" />
              </button>

              {/* AI Build */}
              <button title="AI Build: Generate page with AI" onClick={handleGeneratePage} disabled={isGenerating} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              </button>

              {/* Separator */}
              <div className="w-px h-5 bg-border mx-1" />

              {/* Save */}
              <button
                title={!pageId ? 'Save draft' : hasUnsavedChanges ? 'Save changes' : 'All changes saved'}
                onClick={handleSave}
                disabled={isSaving || (pageId !== null && !hasUnsavedChanges)}
                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed relative"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : hasUnsavedChanges ? <Save className="w-4 h-4 text-primary" /> : <Save className="w-4 h-4" />}
              </button>
              
              {/* Publish CTA — kept as a labeled button since it's the primary action */}
              <button
                onClick={() => {
                  if (!pageId) {
                    toast.error('Please save your draft first before publishing.');
                    return;
                  }
                  window.location.href = `/builder/publish?id=${pageId}`;
                }}
                className="ml-1 h-8 px-3 flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" /> Publish
              </button>
            </div>
        </Topbar>
  
        {/* Main Extensible Editor Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* LeftPanel is absolutely positioned — overlays the canvas */}
          {!isPreviewMode && <LeftPanel />}
          {/* Canvas fills full width — left padding reserves space for the icon strip */}
          <div className={cn('flex-1 overflow-hidden', !isPreviewMode && 'pl-14')}>
            <Canvas />
          </div>
          {!isPreviewMode && <RightPanel />}
        </div>
        
        {/* Modals outside main flex flow */}
        <SectionLibraryModal />
      </div>
    </div>
  );
}
