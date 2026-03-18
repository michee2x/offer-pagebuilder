'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { BuilderComponent } from './BuilderComponent';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ShadcnTheme } from '@/lib/themes';

export const CANVAS_ID = '__canvas__';

/**
 * Tailwind v4 generates utilities like bg-primary using var(--color-primary),
 * which maps from the @theme block: --color-primary: hsl(var(--primary)).
 *
 * To reliably override at runtime we need to inject TWO layers onto the canvas div:
 *   1. Raw HSL vars:     --primary: "43 89% 45%"
 *   2. Resolved tokens:  --color-primary: "hsl(43 89% 45%)"
 *
 * This ensures every Tailwind utility class (bg-primary, text-foreground, etc.)
 * picks up the right theme value regardless of which var() it reads internally.
 */
function buildThemeInlineVars(theme: ShadcnTheme): React.CSSProperties {
  const v = theme.vars;
  const hsl = (val: string) => `hsl(${val})`;

  const cssVars: Record<string, string> = {
    // ── Raw HSL vars (base layer used by shadcn components) ──────────────────
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

    // ── Resolved hsl() tokens (what Tailwind v4 @theme generates) ────────────
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

    // ── Resolved radius tokens (what Tailwind v4 @theme generates) ───────────
    '--radius-lg':                  v.radius,
    '--radius-md':                  `calc(${v.radius} - 2px)`,
    '--radius-sm':                  `calc(${v.radius} - 4px)`,

    // ── Typography ────────────────────────────────────────────────────────────
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
