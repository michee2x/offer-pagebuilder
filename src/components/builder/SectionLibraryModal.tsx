'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { useBuilderStore } from '@/store/builderStore';
import { COMPONENT_REGISTRY, ComponentType } from '@/config/components';
import { LayoutTemplate, PlusCircle, X } from 'lucide-react';

export function SectionLibraryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number>(0);
  const { addComponent } = useBuilderStore();

  useEffect(() => {
    const handleOpen = (e: any) => {
      setInsertIndex(e.detail?.index ?? 0);
      setIsOpen(true);
    };
    window.addEventListener('OPEN_SECTION_MODAL', handleOpen);
    return () => window.removeEventListener('OPEN_SECTION_MODAL', handleOpen);
  }, []);

  const macroComponents = Object.entries(COMPONENT_REGISTRY).filter(([_, conf]) => conf.semantic);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent showCloseButton={false} className="w-[95vw] max-w-5xl sm:max-w-5xl md:max-w-5xl lg:max-w-5xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl sm:rounded-2xl">
        <DialogClose className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted/80 bg-background/50 backdrop-blur-md text-muted-foreground hover:text-foreground transition-all z-[100] border border-border/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <span className="sr-only">Close</span>
          <X className="w-4 h-4" />
        </DialogClose>
        
        <div className="flex h-[80vh] max-h-[800px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-border/50 bg-muted/20 p-4 shrink-0 flex flex-col gap-2">
            <h2 className="font-semibold px-2 mb-4 text-sm flex items-center gap-2 text-foreground">
              <LayoutTemplate className="w-4 h-4 text-blue-500" /> Block Library
            </h2>
            <button className="text-left px-3 py-2 text-sm rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
              All Sections
            </button>
            <button className="text-left px-3 py-2 text-sm rounded-md hover:bg-muted/50 text-muted-foreground font-medium transition-colors">
              Headers
            </button>
            <button className="text-left px-3 py-2 text-sm rounded-md hover:bg-muted/50 text-muted-foreground font-medium transition-colors">
              Heroes
            </button>
            <button className="text-left px-3 py-2 text-sm rounded-md hover:bg-muted/50 text-muted-foreground font-medium transition-colors">
              Features
            </button>
            <button className="text-left px-3 py-2 text-sm rounded-md hover:bg-muted/50 text-muted-foreground font-medium transition-colors">
              Social Proof
            </button>
            <button className="text-left px-3 py-2 text-sm rounded-md hover:bg-muted/50 text-muted-foreground font-medium transition-colors">
              Conversion
            </button>
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="mb-6">
              <h1 className="text-xl font-bold tracking-tight">Choose a section</h1>
              <p className="text-sm text-muted-foreground">Select a pre-designed block to insert into your page.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {macroComponents.map(([type, conf]) => (
                <div 
                  key={type}
                  onClick={() => {
                    addComponent(type as ComponentType, 'root', insertIndex);
                    setIsOpen(false);
                  }}
                  className="group relative border border-border/50 bg-background rounded-xl p-4 cursor-pointer hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all overflow-hidden flex flex-col"
                >
                  {/* Block Mini-Preview */}
                  <div className="aspect-[16/9] w-full bg-slate-100 dark:bg-slate-900 rounded-lg mb-4 flex items-start justify-start relative overflow-hidden group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 transition-colors border border-border/30">
                    <div 
                      className="absolute top-0 left-0 origin-top-left pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity"
                      style={{ 
                        width: '1024px', 
                        // Assuming the card width is roughly ~320px in this setup (minus padding), scale 0.31 works well to fit 1024px
                        transform: 'scale(0.31)',
                      }}
                    >
                      {/* Fake preview context wrapper to isolate styles */}
                      <div className="w-full h-full pointer-events-none pt-4 bg-background">
                        {conf.render({ ...conf.defaultProps, isPreviewMode: true })}
                      </div>
                    </div>

                    {/* Hover Add Overlay */}
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[1px]">
                      <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <PlusCircle className="w-4 h-4" /> Insert
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h3 className="font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{conf.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{conf.semantic?.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
