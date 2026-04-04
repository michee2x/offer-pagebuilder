import React from 'react';
import { Button } from '@/components/micro';
import { SystemIcon } from '../../system/Icon';

export interface ThankYouHeroProps {
  headline: string;
  subheadline: string;
  receiptTotal?: string;
  nextStep1: string;
  nextStep2: string;
  nextStep3: string;
  primaryCta: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function ThankYouHero({
  headline,
  subheadline,
  receiptTotal,
  nextStep1,
  nextStep2,
  nextStep3,
  primaryCta,
  elementStyles = {},
}: ThankYouHeroProps) {
  return (
    <section className="relative w-full overflow-hidden py-20 lg:py-32 flex flex-col items-center justify-center text-center px-4 bg-background text-foreground border-b border-border">
      {/* Primary success glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full opacity-40" />
      </div>

      <div className="relative max-w-2xl mx-auto flex flex-col items-center z-10 w-full">
        {/* Success Icon Badge */}
        <div className="mb-6 animate-fade-in-up">
          <div className="w-20 h-20 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center text-primary shadow-xl shadow-primary/20">
            <SystemIcon name="Check" size={40} />
          </div>
        </div>

        <h1
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-[1.15] animate-fade-in-up text-foreground"
          style={{ animationDelay: '100ms', ...elementStyles?.['headline'] }}
          data-field="headline"
        >
          {headline}
        </h1>

        <p
          className="text-lg mb-10 text-primary font-semibold animate-fade-in-up"
          style={{ animationDelay: '200ms', ...elementStyles?.['subheadline'] }}
          data-field="subheadline"
        >
          {subheadline}
        </p>

        {/* Receipt Concept Box */}
        <div className="w-full bg-card border border-border rounded-2xl p-8 flex flex-col text-left animate-fade-in-up shadow-xl mb-8" style={{ animationDelay: '300ms' }}>
          
          <h3 className="text-xl font-bold border-b border-border pb-4 mb-6 text-foreground flex justify-between items-center">
            Next Steps
            {receiptTotal && (
               <span 
                 className="text-sm font-normal text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border"
                 data-field="receiptTotal"
                 style={elementStyles?.['receiptTotal']}
               >
                 Total Billed: <strong className="text-foreground">{receiptTotal}</strong>
               </span>
            )}
          </h3>

          <div className="flex flex-col gap-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 border border-primary/20">1</div>
              <p 
                 className="text-muted-foreground text-sm leading-relaxed font-medium"
                 data-field="nextStep1"
                 style={elementStyles?.['nextStep1']}
              >{nextStep1}</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 border border-primary/20">2</div>
              <p 
                 className="text-muted-foreground text-sm leading-relaxed font-medium"
                 data-field="nextStep2"
                 style={elementStyles?.['nextStep2']}
              >{nextStep2}</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 border border-primary/20">3</div>
              <p 
                 className="text-muted-foreground text-sm leading-relaxed font-medium"
                 data-field="nextStep3"
                 style={elementStyles?.['nextStep3']}
              >{nextStep3}</p>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] transition-transform shadow-xl shadow-primary/20 border-0"
            data-field="primaryCta"
            style={elementStyles?.['primaryCta']}
          >
            <SystemIcon name="ArrowRight" size={20} className="mr-2" />
            {primaryCta}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          Check your spam folder if you do not receive an email within 5 minutes.
        </p>
      </div>
    </section>
  );
}
