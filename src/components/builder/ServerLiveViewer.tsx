import React from 'react';
import { COMPONENT_REGISTRY } from '@/config/components';
import { DynamicRunner } from '@/components/builder/DynamicRunner';

function buildThemeInlineVars(theme: any): React.CSSProperties {
  if (!theme || !theme.vars) return {};
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

    fontFamily: `"${theme.bodyFont}", sans-serif`,
  };

  return cssVars as React.CSSProperties;
}

function ServerComponentNode({ id, components }: { id: string, components: Record<string, any> }) {
  const component = components[id];
  if (!component) return null;
  const config = COMPONENT_REGISTRY[component.type as keyof typeof COMPONENT_REGISTRY];
  if (!config) return null;

  return config.render({
    ...component.props,
    isPreviewMode: true,
    children: component.childrenIds?.map((childId: string) => (
      <ServerComponentNode key={childId} id={childId} components={components} />
    )),
  });
}

export function ServerLiveViewer({ blocks }: { blocks: any }) {
  const components = blocks?.components || {};
  const rootList = blocks?.rootList || [];
  const theme = blocks?.theme;
  const pages = blocks?.pages || {};
  const activePagePath = blocks?.activePagePath || '/';
  
  const activePage = pages[activePagePath];
  const activeCode = activePage?.code;
  const compiledCode = activePage?.compiledCode;
  const staticHtml = activePage?.html;

  if (!staticHtml && !compiledCode && activeCode) {
    console.warn("⚠️ PERFORMANCE WARNING: `staticHtml` is missing for this page. The page will fall back to slow client-side Babel compilation, heavily delaying FCP. Please open this page in the Builder and click Save to generate the pure HTML.");
  }

  const canvasRootStyle: React.CSSProperties = {
    ...(theme ? buildThemeInlineVars(theme) : {}),
    ...(blocks?.canvasStyle || {}),
  };

  return (
    <div className="w-screen min-h-screen bg-background text-foreground flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />
      {theme?.googleFontsUrl && (
        <div dangerouslySetInnerHTML={{ __html: `
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
          <link rel="preload" as="style" href="${theme.googleFontsUrl}" />
          <link rel="stylesheet" href="${theme.googleFontsUrl}" media="print" onload="this.media='all'" />
          <noscript>
            <link rel="stylesheet" href="${theme.googleFontsUrl}" />
          </noscript>
        `}} />
      )}
      
      <div
        id="canvas-root"
        data-theme={theme?.id}
        className="bg-background transition-all duration-300 transform-gpu w-full h-full min-h-screen rounded-none overflow-x-hidden"
        style={canvasRootStyle}
      >
        <div className="h-auto min-h-screen w-full p-0 flex flex-col transition-all">
          {staticHtml ? (
            <div dangerouslySetInnerHTML={{ __html: staticHtml }} />
          ) : activeCode ? (
            <DynamicRunner code={activeCode} compiledCode={compiledCode} />
          ) : (
            <div className="flex flex-col">
              {rootList.map((id: string) => (
                <ServerComponentNode key={id} id={id} components={components} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
