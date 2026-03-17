import React from 'react';
import { SystemIcon } from '../system/Icon';

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesSectionProps {
  sectionTitle: string;
  sectionSubtitle?: string;
  features: FeatureItem[];
}

export function FeaturesSection({ sectionTitle, sectionSubtitle, features = [] }: FeaturesSectionProps) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group animate-fade-in-up flex flex-col items-start"
              style={{ 
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
                animationDelay: `${(idx % 3) * 100 + 200}ms`
              }}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-opacity-80"
                style={{ 
                  backgroundColor: 'var(--theme-primary)', 
                  color: 'var(--theme-primary-fg)' 
                }}
              >
                <SystemIcon name={feature.icon} size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
