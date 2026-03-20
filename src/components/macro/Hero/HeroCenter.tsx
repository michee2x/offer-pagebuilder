import React from 'react';
import { Button, Badge } from '@/components/micro';
import { SystemIcon } from '../../system/Icon';
import { cn } from '@/lib/utils';

export interface HeroCenterProps {
  badgeText?: string;
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta?: string;
  imageUrl?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function HeroCenter({
  badgeText,
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  imageUrl,
  elementStyles = {},
}: HeroCenterProps) {
  return (
    <section className="relative w-full overflow-hidden py-24 lg:py-36 flex flex-col items-center justify-center text-center px-4 md:px-8 bg-background text-foreground border-b border-border">

      {/* Subtle gradient glow behind the hero */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/10 blur-[120px] rounded-full opacity-60" />
      </div>

      <div className="relative max-w-4xl mx-auto flex flex-col items-center z-10">

        {badgeText && (
          <div data-field="badgeText" style={elementStyles?.['badgeText']}>
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-xs font-semibold tracking-widest uppercase animate-fade-in-up">
              <SystemIcon name="Sparkles" size={12} />
              {badgeText}
            </Badge>
          </div>
        )}

        <h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] animate-fade-in-up"
          style={{ animationDelay: '100ms', ...elementStyles?.['headline'] }}
          data-field="headline"
        >
          {headline}
        </h1>

        <p
          className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-muted-foreground animate-fade-in-up"
          style={{ animationDelay: '200ms', ...elementStyles?.['subheadline'] }}
          data-field="subheadline"
        >
          {subheadline}
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 py-6 text-base font-bold shadow-lg hover:scale-[1.02] transition-transform"
            data-field="primaryCta"
            style={elementStyles?.['primaryCta']}
          >
            {primaryCta}
          </Button>

          {secondaryCta && (
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 py-6 text-base font-bold gap-2"
              data-field="secondaryCta"
              style={elementStyles?.['secondaryCta']}
            >
              <SystemIcon name="PlayCircle" size={20} />
              {secondaryCta}
            </Button>
          )}
        </div>
      </div>

      {imageUrl && (
        <div
          className="relative max-w-5xl mx-auto px-4 mt-20 animate-fade-in-up w-full"
          style={{ animationDelay: '400ms', ...elementStyles?.['imageUrl'] }}
          data-field="imageUrl"
        >
          <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-30 rounded-3xl scale-95" />
          <img
            src={imageUrl}
            alt="Hero visualization"
            className="relative z-10 w-full h-auto object-cover shadow-2xl border border-border rounded-2xl animate-float"
          />
        </div>
      )}
    </section>
  );
}
