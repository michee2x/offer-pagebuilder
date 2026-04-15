'use client';

import React from 'react';
import { Canvas } from '@/components/builder/Canvas';
import { RightPanel } from '@/components/builder/RightPanel';
import { ThemeSwitcher } from '@/components/builder/ThemeSwitcher';
import { SectionLibraryModal } from '@/components/builder/SectionLibraryModal';
import { AiStreamBoard } from '@/components/builder/AiStreamBoard';
import { useBuilderStore } from '@/store/builderStore';
import { Loader2, Wand2, Monitor, Tablet, Smartphone, Eye, Undo2, Redo2, Globe, Save, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { LeftPanel } from '@/components/builder/LeftPanel';
import { cn } from '@/lib/utils';

export default function BuilderPage() {
  const { 
    setFullState, components, rootList, 
    canvasStyle, deviceMode, setDeviceMode, isPreviewMode, setIsPreviewMode, 
    pageId, setPageId, theme, setTheme, hasUnsavedChanges, setHasUnsavedChanges,
    pages, activePagePath,
    funnelName, setFunnelName,
    undo, redo, past, future 
  } = useBuilderStore();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [streamText, setStreamText] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [hasIntelligence, setHasIntelligence] = React.useState(false);

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
                    if (data.page.name) setFunnelName(data.page.name);
                    const blocks = data.page.blocks;
                    let loadedPages = blocks.pages;
                    if (!loadedPages) {
                        loadedPages = { '/': { name: 'Lead Capture', path: '/', components: blocks.components || {}, rootList: blocks.rootList || [] } }
                    }
                    const defaultPages = {
                      '/': { name: 'Lead Capture', path: '/', components: {}, rootList: [] },
                      '/upsell': { name: 'Upsell', path: '/upsell', components: {}, rootList: [] },
                      '/downsell': { name: 'Downsell', path: '/downsell', components: {}, rootList: [] },
                      '/thankyou': { name: 'Thank You', path: '/thankyou', components: {}, rootList: [] },
                    };
                    loadedPages = { ...defaultPages, ...loadedPages };
                    
                    if (blocks.intelligence?.call1_complete) {
                      setHasIntelligence(true);
                    }
                    
                    const initialPage = loadedPages['/'] || Object.values(loadedPages)[0];
                    setFullState(initialPage.components, initialPage.rootList, loadedPages, initialPage.path);
                    if (blocks.canvasStyle) {
                        useBuilderStore.setState({ canvasStyle: blocks.canvasStyle });
                    }
                    if (data.page.blocks.theme) {
                        setTheme(data.page.blocks.theme);
                    }
                    
                    if (qs.get('autoGen') === 'true' && Object.keys(initialPage.components).length === 0) {
                        setTimeout(() => {
                           window.history.replaceState({}, '', `/builder?id=${editId}`);
                           document.getElementById('autoGenTrigger')?.click();
                        }, 500);
                    }
                }
            })
            .catch(err => console.error("Failed to fetch page:", err))
            .finally(() => setInitialLoading(false));
      } else {
          // Reset store for Create New Mode
          setPageId(null);
          setFullState({}, [], { '/': { name: 'Lead Capture', path: '/', components: {}, rootList: [] } }, '/');
          useBuilderStore.setState({ canvasStyle: {} });
          setInitialLoading(false);
      }
    }
  }, [setPageId, setFullState, setFunnelName, setTheme]);

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
        body: JSON.stringify({ offerContext, funnelId: pageId })
      });
      
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate');
      }

      setStreamText(''); // Reset visual stream board

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = '';
      let thinkingText = '';

      // Stream processor loop
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          // Extract everything inside <thinking>...</thinking> OR everything after <thinking> if it hasn't closed yet
          const thinkingMatch = accumulatedText.match(/<thinking>([\s\S]*?)(?:<\/thinking>|$)/);
          if (thinkingMatch) {
             thinkingText = thinkingMatch[1].trim();
             // Update the board UI
             setStreamText(thinkingText);
          }
        }
      }

      // Generation finished, parse the <json> block out
      const jsonMatch = accumulatedText.match(/<json>([\s\S]*?)<\/json>/);
      const rawJson = jsonMatch ? jsonMatch[1].trim() : accumulatedText.replace(/```(?:json)?\n?/g, '').replace(/```\n?/g, '').trim();

      const { pages: generatedPages } = JSON.parse(rawJson);
      
      const newPages: Record<string, any> = {};

      generatedPages.forEach((aiPage: any) => {
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

        const newRootList = flattenItems(aiPage.items, 'root');
        
        newPages[aiPage.path] = {
            name: aiPage.name,
            path: aiPage.path,
            components: newComponents,
            rootList: newRootList
        };
      });

      const initialPage = newPages['/'] || Object.values(newPages)[0];
      setFullState(initialPage.components, initialPage.rootList, newPages, initialPage.path);
      setHasUnsavedChanges(true); // Generation clears state, mark explicit unsaved 
      // Theme is NOT changed by generation — user keeps their chosen theme
      toast.success('Generated page successfully!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGenerating(false);
      setStreamText('');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      toast.loading('Saving draft...');
      
      const payload: any = { 
        name: funnelName,
        components, 
        rootList, 
        canvasStyle, 
        theme,
        pages: {
          ...pages,
          [activePagePath]: { ...pages[activePagePath], components, rootList }
        }
      };
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
      <button id="autoGenTrigger" hidden onClick={handleGeneratePage} />
      {/* Sidebar is fixed-positioned — renders itself, just mount it */}
      <Sidebar />

      {/* Main content offset by sidebar icon strip width (w-14 = 56px) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ marginLeft: '56px' }}>
        {/* Top Navigation Bar */}
        <Topbar 
          breadcrumbs={[
              { label: 'Workspace' },
              { label: 'Funnels', href: '/' },
              { label: (
                <div className="flex items-center gap-1.5 group relative">
                  <div className="absolute right-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-muted-foreground/60">
                    <Edit2 className="w-3 h-3" />
                  </div>
                  <input
                    type="text"
                    value={funnelName}
                    onChange={(e) => setFunnelName(e.target.value)}
                    className="bg-muted/40 hover:bg-muted focus:bg-muted/60 border border-border/50 hover:border-border focus:border-border focus:outline-none rounded-md transition-all px-3 py-1 pr-7 w-[220px] text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 shadow-sm"
                    placeholder="Enter funnel name..."
                  />
                </div>
              ) }
          ]}
          steps={hasIntelligence ? [
              { id: 1, label: 'Upload', status: 'done' },
              { id: 2, label: 'Intelligence', status: 'done' },
              { id: 3, label: 'Copy', status: 'done' },
              { id: 4, label: 'Build Pages', status: 'active' },
              { id: 5, label: 'Publish', status: 'pending' },
          ] : undefined}
        >
            <div className="flex items-center gap-1 ml-auto">
              
              {/* Device mode toggles */}
              <div className="flex items-center bg-muted/30 rounded-md border border-border mr-2 p-0.5">
                <button
                  type="button"
                  title="Desktop"
                  onClick={() => setDeviceMode('desktop')}
                  className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${deviceMode === 'desktop' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Tablet"
                  onClick={() => setDeviceMode('tablet')}
                  className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${deviceMode === 'tablet' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Tablet className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
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
              <button type="button" title="Undo" onClick={undo} disabled={past.length === 0} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <Undo2 className="h-4 w-4" />
              </button>
              <button type="button" title="Redo" onClick={redo} disabled={future.length === 0} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <Redo2 className="h-4 w-4" />
              </button>

              {/* Separator */}
              <div className="w-px h-5 bg-border mx-1" />

              {/* Theme Switcher */}
              <ThemeSwitcher />

              {/* Preview */}
              <button type="button" title="Preview page" onClick={() => setIsPreviewMode(true)} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Eye className="w-4 h-4" />
              </button>

              {/* AI Build */}
              <button type="button" title="AI Build: Generate page with AI" onClick={handleGeneratePage} disabled={isGenerating} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              </button>

              {/* Separator */}
              <div className="w-px h-5 bg-border mx-1" />

              {/* Save */}
              <button
                type="button"
                title={!pageId ? 'Save draft' : hasUnsavedChanges ? 'Save changes' : 'All changes saved'}
                onClick={handleSave}
                disabled={isSaving || (pageId !== null && !hasUnsavedChanges)}
                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed relative"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : hasUnsavedChanges ? <Save className="w-4 h-4 text-primary" /> : <Save className="w-4 h-4" />}
              </button>
              
              {/* Publish CTA — kept as a labeled button since it's the primary action */}
              <button
                type="button"
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
        <AiStreamBoard isOpen={isGenerating} thinkingText={streamText} />
      </div>
    </div>
  );
}
