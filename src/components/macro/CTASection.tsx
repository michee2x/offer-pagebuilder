import React from 'react';
import { Button } from '@/components/micro';

export interface CTASectionProps {
  headline: string;
  subheadline: string;
  buttonText: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function CTASection({
  headline,
  subheadline,
  buttonText,
  elementStyles = {},
}: CTASectionProps) {
  return (
    <section className="w-full py-32 px-4 md:px-8 text-center relative overflow-hidden bg-primary text-primary-foreground">

      {/* Decorative glow circles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-white/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-white/5 blur-[80px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 animate-fade-in-up">
        <h2
          className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
          data-field="headline"
          style={elementStyles?.['headline']}
        >
          {headline}
        </h2>

        <p
          className="text-xl md:text-2xl mb-12 opacity-85 max-w-2xl mx-auto leading-relaxed"
          data-field="subheadline"
          style={elementStyles?.['subheadline']}
        >
          {subheadline}
        </p>

        <Button
          size="lg"
          variant="secondary"
          className="px-10 py-7 text-xl font-bold hover:scale-105 transition-transform duration-300 shadow-2xl"
          data-field="buttonText"
          style={elementStyles?.['buttonText']}
        >
          {buttonText}
        </Button>
      </div>
    </section>
  );
}
