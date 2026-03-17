import React from 'react';

export interface CTASectionProps {
  headline: string;
  subheadline: string;
  buttonText: string;
}

export function CTASection({ headline, subheadline, buttonText }: CTASectionProps) {
  return (
    <section 
      className="w-full py-32 px-4 md:px-8 text-center relative overflow-hidden"
      style={{ 
        background: 'var(--theme-gradient)', 
        color: 'var(--theme-primary-fg)'
      }}
    >
      <div className="max-w-4xl mx-auto relative z-10 animate-fade-in-up">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
          {headline}
        </h2>
        <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto">
          {subheadline}
        </p>
        <button 
          className="px-10 py-5 text-xl font-bold hover:scale-105 transition-transform duration-300 shadow-2xl"
          style={{ 
            backgroundColor: 'var(--theme-background, #ffffff)', 
            color: 'var(--theme-primary, #000000)',
            borderRadius: 'var(--theme-btn-radius)'
          }}
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
}
