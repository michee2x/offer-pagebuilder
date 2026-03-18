'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { BuilderComponent } from './BuilderComponent';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ShadcnTheme } from '@/lib/themes';

export const CANVAS_ID = '__canvas__';

/**
 * Build an inline-style object that injects all shadcn CSS variables
 * directly onto the canvas container div. Inline style CSS custom properties
 * cascade reliably to all children, overriding the :root defaults in globals.css.
 */
function buildThemeInlineVars(theme: ShadcnTheme): React.CSSProperties {
  const cssVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme.vars)) {
    cssVars[`--${key}`] = value;
  }
  cssVars['font-family'] = `"${theme.bodyFont}", sans-serif`;
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

  const maxWidthClass =
    deviceMode === 'desktop'
      ? 'max-w-5xl'
      : deviceMode === 'tablet'
      ? 'max-w-[768px]'
      : 'max-w-[390px]';

  const previewOuterClasses = isPreviewMode
    ? 'bg-background'
    : 'bg-muted/20 py-8 px-4 md:px-8';
  const previewInnerClasses = isPreviewMode
    ? 'w-full min-h-screen max-w-none rounded-none'
    : `mx-auto shadow-sm border rounded-lg min-h-[800px] overflow-hidden ${maxWidthClass}`;
  const selectionRing =
    isCanvasSelected && !isPreviewMode ? 'ring-2 ring-blue-500 ring-offset-2' : '';

  // Merge theme CSS vars (inline) + canvasStyle overrides
  const canvasRootStyle: React.CSSProperties = {
    ...(theme ? buildThemeInlineVars(theme) : {}),
    ...(canvasStyle as React.CSSProperties),
  };

  return (
    <div
      className={`flex-1 overflow-y-auto ${previewOuterClasses} transition-all`}
      onClick={() => setSelected(null)}
    >
      {/* Animation keyframes — applied globally but harmless */}
      <style dangerouslySetInnerHTML={{
        __html: `
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
          /* Heading font scoped to canvas */
          #canvas-root h1, #canvas-root h2, #canvas-root h3,
          #canvas-root h4, #canvas-root h5, #canvas-root h6 {
            font-family: "${theme?.headingFont ?? 'inherit'}", sans-serif;
          }
        `
      }} />

      {/* Google Font for active theme */}
      {theme?.googleFontsUrl && (
        <link rel="stylesheet" href={theme.googleFontsUrl} />
      )}

      {/*
        #canvas-root receives ALL theme CSS vars as inline styles.
        Inline CSS custom properties cascade reliably to every child component,
        overriding the builder's :root defaults from globals.css.
        This keeps the sidebar unaffected while the canvas reflects the chosen theme.
      */}
      <div
        id="canvas-root"
        className={`bg-background transition-all duration-300 transform-gpu ${previewInnerClasses} ${selectionRing}`}
        style={canvasRootStyle}
        onClick={handleCanvasClick}
      >
        <div
          className={`h-full w-full ${
            isPreviewMode ? 'min-h-screen p-0' : 'min-h-[800px]'
          } flex flex-col transition-all`}
        >
          {rootList.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg border-muted p-12 text-center pointer-events-none m-8">
              <div>
                <h3 className="text-lg font-medium mb-1">Canvas is empty</h3>
                <p className="text-sm">Generate a page using AI to get started.</p>
              </div>
            </div>
          ) : (
            rootList.map((id) => <BuilderComponent key={id} id={id} />)
          )}
        </div>
      </div>

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
