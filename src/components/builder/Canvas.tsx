'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { BuilderComponent } from './BuilderComponent';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { ShadcnTheme } from '@/lib/themes';
import { ResponsiveIframe } from './ResponsiveIframe';

export const CANVAS_ID = '__canvas__';

function buildThemeInlineVars(theme: ShadcnTheme): React.CSSProperties {
  const v = theme.vars;
  const hsl = (val: string) => `hsl(${val})`;

  const cssVars: Record<string, string> = {
    '--background':            v.background,
    '--foreground':            v.foreground,
    '--card':                  v.card,
    '--card-foreground':       v['card-foreground'],
    '--popover':               v.popover,
    '--popover-foreground':    v['popover-foreground'],
    '--primary':               v.primary,
    '--primary-foreground':    v['primary-foreground'],
    '--secondary':             v.secondary,
    '--secondary-foreground':  v['secondary-foreground'],
    '--muted':                 v.muted,
    '--muted-foreground':      v['muted-foreground'],
    '--accent':                v.accent,
    '--accent-foreground':     v['accent-foreground'],
    '--destructive':           v.destructive,
    '--destructive-foreground': v['destructive-foreground'],
    '--border':                v.border,
    '--input':                 v.input,
    '--ring':                  v.ring,
    '--radius':                v.radius,

    '--color-background':           hsl(v.background),
    '--color-foreground':           hsl(v.foreground),
    '--color-card':                 hsl(v.card),
    '--color-card-foreground':      hsl(v['card-foreground']),
    '--color-popover':              hsl(v.popover),
    '--color-popover-foreground':   hsl(v['popover-foreground']),
    '--color-primary':              hsl(v.primary),
    '--color-primary-foreground':   hsl(v['primary-foreground']),
    '--color-secondary':            hsl(v.secondary),
    '--color-secondary-foreground': hsl(v['secondary-foreground']),
    '--color-muted':                hsl(v.muted),
    '--color-muted-foreground':     hsl(v['muted-foreground']),
    '--color-accent':               hsl(v.accent),
    '--color-accent-foreground':    hsl(v['accent-foreground']),
    '--color-destructive':          hsl(v.destructive),
    '--color-destructive-foreground': hsl(v['destructive-foreground']),
    '--color-border':               hsl(v.border),
    '--color-input':                hsl(v.input),
    '--color-ring':                 hsl(v.ring),

    '--radius-lg':                  v.radius,
    '--radius-md':                  `calc(${v.radius} - 2px)`,
    '--radius-sm':                  `calc(${v.radius} - 4px)`,

    'font-family': `"${theme.bodyFont}", sans-serif`,
  };

  return cssVars as React.CSSProperties;
}

export function Canvas({ isLiveViewer = false }: { isLiveViewer?: boolean }) {
  const {
    rootList,
    setSelected,
    selectedId,
    canvasStyle,
    deviceMode,
    isPreviewMode,
    setIsPreviewMode,
    theme,
  } = useBuilderStore();
  
  const isCanvasSelected = selectedId === CANVAS_ID;

  const handleCanvasClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(CANVAS_ID);
  };

  const dispatchSectionModal = (index: number) => {
    const evt = new CustomEvent('OPEN_SECTION_MODAL', { detail: { index } });
    (window.parent || window).dispatchEvent(evt);
  };

  const maxWidthClass =
    deviceMode === 'desktop'
      ? 'max-w-5xl'
      : deviceMode === 'tablet'
      ? 'max-w-[768px]'
      : 'max-w-[390px]';

  const previewOuterClasses = isPreviewMode
    ? 'bg-background'
    : 'bg-muted/20 py-8 px-4 md:px-8';
    
  // If we are in iframe mode, the inner classes on the canvas root should be flush
  const previewInnerClasses = isPreviewMode
    ? 'w-full min-h-screen max-w-none rounded-none'
    : `mx-auto shadow-sm border rounded-lg min-h-[800px] overflow-hidden ${maxWidthClass}`;
    
  const selectionRing =
    isCanvasSelected && !isPreviewMode ? 'ring-2 ring-blue-500 ring-offset-2' : '';

  const canvasRootStyle: React.CSSProperties = {
    ...(theme ? buildThemeInlineVars(theme) : {}),
    ...(canvasStyle as React.CSSProperties),
  };

  const isIframeMode = deviceMode !== 'desktop';

  // The actual scrollable content block that gets injected into the normal tree OR the iframe portal
  const canvasContent = (
      <div
        id="canvas-root"
        data-theme={theme?.id}
        className={`bg-background transition-all duration-300 transform-gpu ${isIframeMode ? 'w-full h-full min-h-screen rounded-none overflow-x-hidden' : previewInnerClasses} ${!isIframeMode ? selectionRing : ''}`}
        style={canvasRootStyle}
        onClick={handleCanvasClick}
      >
        <div
          className={`h-full w-full ${
            isPreviewMode ? 'min-h-screen p-0' : 'min-h-[800px]'
          } flex flex-col transition-all`}
        >
          {rootList.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg border-muted p-12 text-center my-8 mx-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Canvas is empty</h3>
                <Button onClick={() => dispatchSectionModal(0)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Section
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {!isPreviewMode && rootList.length > 0 && (
                <div 
                  className="h-8 flex items-center justify-center relative opacity-0 hover:opacity-100 peer-hover:opacity-100 transition-opacity z-[90] cursor-pointer"
                  onClick={() => dispatchSectionModal(0)}
                >
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-blue-500/35"></div>
                  <button className="relative z-10 bg-blue-500 rounded-full px-3.5 py-1 text-[11px] font-bold text-white flex items-center gap-1.5 transition-all hover:bg-blue-600 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)]">
                    <Plus className="w-3.5 h-3.5" /> Insert Section
                  </button>
                </div>
              )}
              {rootList.map((id, idx) => (
                <React.Fragment key={id}>
                  <BuilderComponent id={id} />
                  {!isPreviewMode && (
                    <div 
                      className="h-8 flex items-center justify-center relative opacity-0 hover:opacity-100 peer-hover:opacity-100 transition-opacity z-[90] cursor-pointer"
                      onClick={() => dispatchSectionModal(idx + 1)}
                    >
                      <div className="absolute left-0 right-0 top-1/2 h-px bg-blue-500/35"></div>
                      <button className="relative z-10 bg-blue-500 rounded-full px-3.5 py-1 text-[11px] font-bold text-white flex items-center gap-1.5 transition-all hover:bg-blue-600 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)]">
                        <Plus className="w-3.5 h-3.5" /> Insert Section
                      </button>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
  );

  const themeHtmlString = `
    <style>
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50%       { transform: translateY(-10px); }
      }
      .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
      .animate-float       { animation: float 3s ease-in-out infinite; }
      #canvas-root h1, #canvas-root h2, #canvas-root h3,
      #canvas-root h4, #canvas-root h5, #canvas-root h6 {
        font-family: "${theme?.headingFont ?? 'inherit'}", sans-serif;
      }
    </style>
    ${theme?.googleFontsUrl ? `<link rel="stylesheet" href="${theme.googleFontsUrl}" />` : ''}
  `;

  return (
    <div
      className={`flex-1 overflow-y-auto ${previewOuterClasses} transition-all`}
      onClick={() => setSelected(null)}
    >
      <style dangerouslySetInnerHTML={{ __html: themeHtmlString.replace(/<style>|<\/style>|<link.*?>/g, '') }} />
      {theme?.googleFontsUrl && (
        <link rel="stylesheet" href={theme.googleFontsUrl} />
      )}

      {!isIframeMode ? (
        canvasContent
      ) : (
        <div 
          className={`mx-auto shadow-sm border rounded-[2.5rem] overflow-hidden bg-background relative ${maxWidthClass} ${selectionRing}`} 
          style={{ 
            height: deviceMode === 'mobile' ? '844px' : '1024px', 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '12px',
            borderWidth: '8px', 
            borderColor: '#334155' // Slate-700 phone border simulation
          }}
        >
          {/* Simulated phone/tablet notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 h-6 w-32 bg-[#334155] rounded-b-xl z-50 shadow-inner"></div>
          
          <ResponsiveIframe 
            className="w-full h-full border-none bg-background rounded-[1.8rem] overflow-hidden" 
            themeHtml={themeHtmlString}
          >
            {canvasContent}
          </ResponsiveIframe>
        </div>
      )}

      {isPreviewMode && !isLiveViewer && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            variant="secondary"
            onClick={() => setIsPreviewMode(false)}
            className="shadow-lg border"
          >
            <X className="w-4 h-4 mr-2" />
            Exit Preview
          </Button>
        </div>
      )}
    </div>
  );
}
