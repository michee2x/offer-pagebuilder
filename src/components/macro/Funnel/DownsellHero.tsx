import React from 'react';
import { Button } from '@/components/micro';
import { SystemIcon } from '../../system/Icon';

export interface DownsellHeroProps {
  headline: string;
  subheadline: string;
  price: string;
  originalPrice?: string;
  paymentPlanText?: string;
  primaryCta: string;
  declineCta: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function DownsellHero({
  headline,
  subheadline,
  price,
  originalPrice,
  paymentPlanText,
  primaryCta,
  declineCta,
  elementStyles = {},
}: DownsellHeroProps) {
  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-24 flex flex-col items-center justify-center text-center px-4 bg-background text-foreground border-b border-border">
      {/* Subtle primary glow for a "second chance" feel */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 blur-[120px] rounded-full opacity-50" />
      </div>

      <div className="relative max-w-3xl mx-auto flex flex-col items-center z-10 w-full">
        {/* Hold On Banner */}
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-sm mb-4 mx-auto w-fit shadow-xl shadow-primary/20">
            <SystemIcon name="Target" size={16} />
            Let's Make This Easier
          </div>
        </div>

        <h1
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-[1.15] animate-fade-in-up uppercase text-foreground"
          style={{ animationDelay: '100ms', ...elementStyles?.['headline'] }}
          data-field="headline"
        >
          {headline}
        </h1>

        <p
          className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-muted-foreground animate-fade-in-up"
          style={{ animationDelay: '200ms', ...elementStyles?.['subheadline'] }}
          data-field="subheadline"
        >
          {subheadline}
        </p>

        {/* Payment Plan / Downsell Box */}
        <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-8 flex flex-col items-center animate-fade-in-up shadow-xl" style={{ animationDelay: '300ms' }}>
          
          <div className="flex flex-col items-center gap-1 mb-6">
             <div className="flex items-end gap-3 justify-center">
                 <span 
                   className="text-6xl font-black text-foreground leading-none"
                   data-field="price"
                   style={elementStyles?.['price']}
                 >
                   {price}
                 </span>
             </div>
             {originalPrice && (
                <span 
                  className="text-base line-through text-muted-foreground font-semibold mt-2"
                  data-field="originalPrice"
                  style={elementStyles?.['originalPrice']}
                >
                  Normally {originalPrice}
                </span>
             )}
             {paymentPlanText && (
                <span 
                  className="text-sm font-semibold text-primary mt-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20"
                  data-field="paymentPlanText"
                  style={elementStyles?.['paymentPlanText']}
                >
                  {paymentPlanText}
                </span>
             )}
          </div>

          <Button
            size="lg"
            className="w-full h-16 text-xl font-bold uppercase tracking-wide bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-[1.02] transition-transform shadow-xl shadow-secondary/15 border border-border mb-6"
            data-field="primaryCta"
            style={elementStyles?.['primaryCta']}
          >
            <SystemIcon name="CheckCircle" size={24} className="mr-2 text-primary" />
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
