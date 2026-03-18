'use client';

import React from 'react';
import { Palette, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/store/builderStore';
import { ALL_SHADCN_THEME_IDS, SHADCN_THEMES } from '@/lib/themes';
import { cn } from '@/lib/utils';

function hsl(val: string) {
  return `hsl(${val})`;
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useBuilderStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-8 px-3"
        >
          {/* Live colour dot showing the active theme's primary */}
          {theme && (
            <span
              className="w-3 h-3 rounded-full border border-white/20 shrink-0"
              style={{ backgroundColor: hsl(theme.vars.primary) }}
            />
          )}
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs font-medium">
            {theme?.name ?? 'Theme'}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-72 p-3"
        side="bottom"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-0.5">
          Page Theme
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ALL_SHADCN_THEME_IDS.map((id) => {
            const t = SHADCN_THEMES[id];
            const isActive = theme?.id === id;

            return (
              <button
                key={id}
                onClick={() => setTheme(t)}
                className={cn(
                  'relative flex flex-col gap-2 rounded-lg border p-2.5 text-left transition-all cursor-pointer',
                  'hover:border-primary/50 hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border'
                )}
              >
                {/* Colour strip */}
                <div className="flex gap-1 h-6 w-full rounded overflow-hidden">
                  <div
                    className="flex-1"
                    style={{ backgroundColor: hsl(t.vars.background) }}
                  />
                  <div
                    className="w-4"
                    style={{ backgroundColor: hsl(t.vars.primary) }}
                  />
                  <div
                    className="w-4"
                    style={{ backgroundColor: hsl(t.vars.secondary) }}
                  />
                </div>

                {/* Name row */}
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="text-[11px] font-semibold leading-none truncate">
                    {t.name}
                  </span>
                  {isActive && (
                    <Check className="w-3 h-3 text-primary shrink-0" />
                  )}
                </div>

                <span className="text-[10px] text-muted-foreground capitalize leading-none">
                  {t.category}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
