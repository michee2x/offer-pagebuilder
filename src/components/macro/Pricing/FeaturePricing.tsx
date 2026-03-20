'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface FeaturePricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
}

export interface FeaturePricingProps {
  badgeText?: string;
  headline?: string;
  subheadline?: string;
  tiers?: FeaturePricingTier[];
  sectionId?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function FeaturePricing({
  badgeText = 'PRICING',
  headline = 'What will it cost?',
  subheadline = 'Simple, transparent pricing for teams of all sizes.',
  tiers = [
    {
      name: 'Starter',
      price: '$50',
      description: 'Everything you need to kickstart your data journey.',
      features: ['Up to 10k monthly events', '3 team members', 'Basic AI analysis', 'Standard integrations', 'Community support'],
      buttonText: 'Start Free Trial'
    },
    {
      name: 'Professional',
      price: '$75',
      description: 'Advanced analytics for growing businesses.',
      features: ['Up to 100k monthly events', '10 team members', 'Advanced AI tracking', 'Custom integrations', 'Priority support', 'Predictive modeling'],
      buttonText: 'Start Free Trial',
      isPopular: true
    },
    {
      name: 'Enterprise',
      price: '$150',
      description: 'Dedicated infrastructure for ultimate scale.',
      features: ['Unlimited events', 'Unlimited members', 'Custom AI models', 'White-glove setup', '24/7 phone support', 'SLA guarantee'],
      buttonText: 'Contact Sales'
    }
  ],
  sectionId = '',
  className = '',
  style = {},
  elementStyles = {},
}: FeaturePricingProps) {
  return (
    <section 
      id={sectionId || undefined}
      className={`relative w-full py-24 px-6 flex flex-col items-center scroll-mt-24 ${className}`}
      style={style}
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center gap-16">
        
        {/* Header Block */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center gap-4 max-w-2xl"
        >
          {badgeText && (
            <div 
              className="px-4 py-1.5 rounded-full bg-secondary border border-border text-[11px] font-bold tracking-widest text-primary uppercase mb-2"
              style={elementStyles.badgeText}
            >
              {badgeText}
            </div>
          )}
          {headline && (
            <h2 
              className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]"
              style={elementStyles.headline}
            >
              {headline}
            </h2>
          )}
          {subheadline && (
            <p 
              className="text-lg text-muted-foreground leading-relaxed"
              style={elementStyles.subheadline}
            >
              {subheadline}
            </p>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-center">
          {tiers.map((tier, idx) => {
            const isPopular = tier.isPopular;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ 
                  duration: 0.6, 
                  delay: idx * 0.15, 
                  type: 'spring', 
                  stiffness: 100, 
                  damping: 20 
                }}
                className={`relative flex flex-col p-8 rounded-[2rem] border transition-all duration-300 h-full ${
                  isPopular 
                    ? 'bg-card border-primary/50 shadow-lg shadow-primary/10 scale-100 md:scale-105 z-10' 
                    : 'bg-background border-border hover:border-border/80'
                }`}
                style={elementStyles[`tier_${idx}`]}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold tracking-wider uppercase shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="flex flex-col gap-6 flex-1">
                  <div className="flex flex-col gap-2 border-b border-border pb-6">
                    <h3 
                      className="text-xl font-semibold text-foreground/90"
                      style={elementStyles[`tier_${idx}_name`]}
                    >
                      {tier.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span 
                        className="text-5xl font-bold text-foreground tracking-tight"
                        style={elementStyles[`tier_${idx}_price`]}
                      >
                        {tier.price}
                      </span>
                      <span className="text-muted-foreground font-medium">/mo</span>
                    </div>
                    <p 
                      className="text-sm text-muted-foreground mt-2"
                      style={elementStyles[`tier_${idx}_description`]}
                    >
                      {tier.description}
                    </p>
                  </div>

                  <ul className="flex flex-col gap-3 py-2 flex-1">
                    {tier.features.map((feature: any, fIdx: number) => {
                      const featText = typeof feature === 'string' ? feature : feature.text;
                      const isIncluded = typeof feature === 'object' && 'included' in feature ? feature.included !== false : true;

                      return (
                        <li key={fIdx} className={`flex items-start gap-3 text-sm ${isIncluded ? 'text-foreground/80' : 'text-muted-foreground/50 line-through'}`}>
                          <div className={`mt-0.5 rounded-full p-0.5 ${isPopular && isIncluded ? 'text-primary' : 'text-muted-foreground'}`}>
                            <Check size={14} strokeWidth={3} className={isIncluded ? 'opacity-100' : 'opacity-0'} />
                          </div>
                          <span style={elementStyles[`tier_${idx}_feat_${fIdx}`]}>{featText}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="#"
                    className={`w-full py-4 rounded-xl flex items-center justify-center font-semibold text-sm transition-colors ${
                      isPopular 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md' 
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                    style={elementStyles[`tier_${idx}_button`]}
                  >
                    {tier.buttonText || (tier as any).ctaText || 'Get Started'}
                  </motion.a>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
