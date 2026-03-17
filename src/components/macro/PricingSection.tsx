import React from 'react';
import { SystemIcon } from '../system/Icon';

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
}

export interface PricingSectionProps {
  sectionTitle: string;
  sectionSubtitle?: string;
  tiers: PricingTier[];
}

export function PricingSection({ sectionTitle, sectionSubtitle, tiers = [] }: PricingSectionProps) {
  return (
    <section 
      className="w-full py-24 px-4 md:px-8 border-b"
      style={{ 
        backgroundColor: 'var(--theme-bg)', 
        color: 'var(--theme-text)',
        borderColor: 'var(--theme-border)'
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{sectionTitle}</h2>
          {sectionSubtitle && (
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--theme-text-muted)' }}>
              {sectionSubtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8">
          {tiers.map((tier, idx) => (
            <div 
              key={idx}
              className={`flex-1 flex flex-col p-8 rounded-3xl border relative hover:shadow-2xl transition-all duration-300 animate-fade-in-up ${tier.isPopular ? 'scale-105 z-10' : 'z-0'}`}
              style={{ 
                backgroundColor: tier.isPopular ? 'var(--theme-surface)' : 'var(--theme-bg)',
                borderColor: tier.isPopular ? 'var(--theme-primary)' : 'var(--theme-border)',
                animationDelay: `${idx * 150}ms`
              }}
            >
              {tier.isPopular && (
                <div 
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-bold uppercase tracking-wider rounded-full shadow-md"
                  style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-fg)' }}
                >
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-semibold mb-2">{tier.name}</h3>
              <p className="mb-6 h-12" style={{ color: 'var(--theme-text-muted)' }}>{tier.description}</p>
              
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-bold">{tier.price}</span>
              </div>
              
              <ul className="flex-1 space-y-4 mb-8">
                {tier.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <SystemIcon name="CheckCircle2" size={20} style={{ color: 'var(--theme-primary)', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ color: 'var(--theme-text-muted)' }}>{feat}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className="w-full py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: tier.isPopular ? 'var(--theme-primary)' : 'var(--theme-surface)',
                  color: tier.isPopular ? 'var(--theme-primary-fg)' : 'var(--theme-text)',
                  border: tier.isPopular ? 'none' : '1px solid var(--theme-border)',
                  borderRadius: 'var(--theme-btn-radius)'
                }}
              >
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
