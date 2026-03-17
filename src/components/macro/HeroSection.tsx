import React from 'react';

export interface HeroSectionProps {
  badgeText?: string;
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta?: string;
  imageUrl?: string;
}

export function HeroSection({ 
  badgeText, 
  headline, 
  subheadline, 
  primaryCta, 
  secondaryCta, 
  imageUrl 
}: HeroSectionProps) {
  return (
    <section 
      className="relative w-full overflow-hidden py-24 lg:py-32 flex flex-col items-center justify-center text-center px-4 md:px-8 border-b"
      style={{ 
        backgroundColor: 'var(--theme-bg)', 
        color: 'var(--theme-text)',
        borderColor: 'var(--theme-border)'
      }}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center z-10">
        
        {badgeText && (
          <div 
            className="mb-8 px-4 py-1.5 text-sm font-semibold tracking-wide uppercase rounded-full animate-fade-in-up"
            style={{ 
              backgroundColor: 'var(--theme-surface)', 
              color: 'var(--theme-primary)',
              border: '1px solid var(--theme-border)'
            }}
          >
            {badgeText}
          </div>
        )}

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {headline}
        </h1>
        
        <p className="text-xl md:text-2xl mb-10 max-w-2xl animate-fade-in-up opacity-80" style={{ animationDelay: '200ms', color: 'var(--theme-text-muted)' }}>
          {subheadline}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <button 
            className="px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform duration-300 shadow-xl"
            style={{ 
              backgroundColor: 'var(--theme-primary)', 
              color: 'var(--theme-primary-fg)',
              borderRadius: 'var(--theme-btn-radius)'
            }}
          >
            {primaryCta}
          </button>
          
          {secondaryCta && (
            <button 
              className="px-8 py-4 text-lg font-semibold hover:opacity-80 transition-opacity duration-300"
              style={{ 
                backgroundColor: 'transparent',
                color: 'var(--theme-text)',
                border: '1px solid var(--theme-border)',
                borderRadius: 'var(--theme-btn-radius)'
              }}
            >
              {secondaryCta}
            </button>
          )}
        </div>
      </div>

      {imageUrl && (
        <div className="mt-16 relative w-full max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div 
            className="absolute inset-0 blur-3xl opacity-20 transform scale-95 origin-bottom"
            style={{ background: 'var(--theme-gradient)' }}
          />
          <img 
            src={imageUrl} 
            alt="Hero visualization" 
            className="relative z-10 w-full h-auto object-cover shadow-2xl border animate-float"
            style={{ 
              borderColor: 'var(--theme-border)',
              borderRadius: 'var(--theme-radius)' 
            }}
          />
        </div>
      )}
    </section>
  );
}
