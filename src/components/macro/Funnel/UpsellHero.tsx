import React from 'react';
import { Button, Badge } from '@/components/micro';
import { SystemIcon } from '../../system/Icon';

export interface UpsellHeroProps {
  headline: string;
  subheadline: string;
  videoUrl?: string;
  price: string;
  originalPrice?: string;
  primaryCta: string;
  declineCta: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function UpsellHero({
  headline,
  subheadline,
  videoUrl,
  price,
  originalPrice,
  primaryCta,
  declineCta,
  elementStyles = {},
}: UpsellHeroProps) {
  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-24 flex flex-col items-center justify-center text-center px-4 bg-background text-foreground border-b border-border">
      {/* Intense gradient glow indicating urgency */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-destructive/10 blur-[120px] rounded-full opacity-50" />
      </div>

      <div className="relative max-w-4xl mx-auto flex flex-col items-center z-10 w-full">
        {/* Urgent Banner */}
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-sm mb-4 mx-auto w-fit shadow-xl shadow-destructive/20">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            Wait! Your Order Is Not Complete
          </div>
        </div>

        <h1
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] animate-fade-in-up uppercase text-foreground"
          style={{ animationDelay: '100ms', ...elementStyles?.['headline'] }}
          data-field="headline"
        >
          {headline}
        </h1>

        <p
          className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-muted-foreground animate-fade-in-up"
          style={{ animationDelay: '200ms', ...elementStyles?.['subheadline'] }}
          data-field="subheadline"
        >
          {subheadline}
        </p>

        {/* Pseudo Video Player Slot */}
        <div 
          className="w-full max-w-3xl aspect-[16/9] bg-secondary/30 border border-secondary p-2 rounded-2xl shadow-2xl mb-12 flex flex-col items-center justify-center relative overflow-hidden group animate-fade-in-up"
          style={{ animationDelay: '300ms', ...elementStyles?.['videoUrl'] }}
          data-field="videoUrl"
        >
          {videoUrl ? (
             <video src={videoUrl} controls className="w-full h-full object-cover rounded-xl" />
          ) : (
            <>
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-md border border-primary/30 text-primary group-hover:scale-110 transition-transform cursor-pointer shadow-xl">
                <SystemIcon name="Play" size={32} className="ml-2" />
              </div>
              <p className="mt-4 font-semibold text-muted-foreground">Click to watch this important message</p>
            </>
          )}
        </div>

        {/* Checkout / Upgrade Box */}
        <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-8 flex flex-col items-center animate-fade-in-up shadow-xl" style={{ animationDelay: '400ms' }}>
          
          <div className="flex items-end gap-3 mb-6">
             <span 
               className="text-5xl font-black text-foreground"
               data-field="price"
               style={elementStyles?.['price']}
             >
               {price}
             </span>
             {originalPrice && (
                <span 
                  className="text-xl line-through text-muted-foreground mb-1 font-semibold"
                  data-field="originalPrice"
                  style={elementStyles?.['originalPrice']}
                >
                  {originalPrice}
                </span>
             )}
          </div>

          <Button
            size="lg"
            className="w-full h-16 text-xl font-bold uppercase tracking-wide bg-primary text-primary-foreground hover:scale-[1.02] hover:bg-primary/90 transition-transform shadow-xl shadow-primary/25 border-0 mb-6"
            data-field="primaryCta"
            style={elementStyles?.['primaryCta']}
          >
            <SystemIcon name="CheckCircle" size={24} className="mr-2" />
            {primaryCta}
          </Button>

          <button 
            className="text-sm font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            data-field="declineCta"
            style={elementStyles?.['declineCta']}
          >
            {declineCta}
          </button>
        </div>
      </div>
    </section>
  );
}
