"use client";

import React, { useState } from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ALL_SHADCN_THEME_IDS, SHADCN_THEMES, ShadcnTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";

function hsl(val: string) {
  return `hsl(${val})`;
}

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<ShadcnTheme>(
    SHADCN_THEMES[Object.keys(SHADCN_THEMES)[0]],
  );

  return (
    <div
      id="canvas-root"
      className="min-h-screen bg-background text-foreground transition-colors duration-200"
      style={
        {
          "--background": theme.vars.background,
          "--foreground": theme.vars.foreground,
          "--card": theme.vars.card,
          "--card-foreground": theme.vars["card-foreground"],
          "--popover": theme.vars.popover,
          "--popover-foreground": theme.vars["popover-foreground"],
          "--primary": theme.vars.primary,
          "--primary-foreground": theme.vars["primary-foreground"],
          "--secondary": theme.vars.secondary,
          "--secondary-foreground": theme.vars["secondary-foreground"],
          "--muted": theme.vars.muted,
          "--muted-foreground": theme.vars["muted-foreground"],
          "--accent": theme.vars.accent,
          "--accent-foreground": theme.vars["accent-foreground"],
          "--destructive": theme.vars.destructive,
          "--destructive-foreground": theme.vars["destructive-foreground"],
          "--border": theme.vars.border,
          "--input": theme.vars.input,
          "--ring": theme.vars.ring,
          "--radius": theme.vars.radius,
          "--color-background": hsl(theme.vars.background),
          "--color-foreground": hsl(theme.vars.foreground),
          "--color-card": hsl(theme.vars.card),
          "--color-card-foreground": hsl(theme.vars["card-foreground"]),
          "--color-popover": hsl(theme.vars.popover),
          "--color-popover-foreground": hsl(theme.vars["popover-foreground"]),
          "--color-primary": hsl(theme.vars.primary),
          "--color-primary-foreground": hsl(theme.vars["primary-foreground"]),
          "--color-secondary": hsl(theme.vars.secondary),
          "--color-secondary-foreground": hsl(
            theme.vars["secondary-foreground"],
          ),
          "--color-muted": hsl(theme.vars.muted),
          "--color-muted-foreground": hsl(theme.vars["muted-foreground"]),
          "--color-accent": hsl(theme.vars.accent),
          "--color-accent-foreground": hsl(theme.vars["accent-foreground"]),
          "--color-destructive": hsl(theme.vars.destructive),
          "--color-destructive-foreground": hsl(
            theme.vars["destructive-foreground"],
          ),
          "--color-border": hsl(theme.vars.border),
          "--color-input": hsl(theme.vars.input),
          "--color-ring": hsl(theme.vars.ring),
        } as React.CSSProperties
      }
    >
      {/* Theme Switcher - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-8 px-3 shadow-lg hover:shadow-xl transition-shadow"
            >
              {theme && (
                <span
                  className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: hsl(theme.vars.primary) }}
                />
              )}
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs font-medium truncate max-w-[120px]">
                {theme?.name ?? "Theme"}
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-72 p-3" side="bottom">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-0.5">
              Test Theme
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {ALL_SHADCN_THEME_IDS.map((id) => {
                const t = SHADCN_THEMES[id];
                const isActive = theme?.id === id;

                return (
                  <button
                    key={id}
                    onClick={() => setTheme(t)}
                    className={cn(
                      "relative flex flex-col gap-2 rounded-lg border p-2.5 text-left transition-all cursor-pointer",
                      "hover:border-primary/50 hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border",
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
      </div>

      {/* Page Content */}
      <main className="relative w-full">{children}</main>
    </div>
  );
}
