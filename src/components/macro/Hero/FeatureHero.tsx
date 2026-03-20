'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export interface FeatureHeroProps {
  badgeText?: string;
  headline?: string;
  subheadline?: string;
  primaryCta?: string;
  secondaryCta?: string;
  dashboardImageUrl?: string;
  sectionId?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function FeatureHero({
  badgeText = 'NEW FEATURE',
  headline = 'Turn data into decisions',
  subheadline = 'We make data accessible and actionable for teams of all sizes without complex technical setup.',
  primaryCta = 'Get Feature',
  secondaryCta = 'Watch promo',
  // A glowing dashboard placeholder from Unsplash that fits dark mode
  dashboardImageUrl = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
  sectionId = '',
  className = '',
  style = {},
  elementStyles = {},
}: FeatureHeroProps) {
  // Animation spring matching Framer
  const springConfig = { type: 'spring' as const, stiffness: 100, damping: 20 };

  return (
    <section 
      id={sectionId || undefined} 
      className={`relative w-full min-h-[90vh] flex flex-col items-center pt-32 md:pt-48 pb-16 px-6 overflow-hidden scroll-mt-24 ${className}`} 
      style={style}
    >
      {/* Background glowing orb */}
      <div 
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" 
        style={elementStyles.bgGlow}
      />

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center gap-8">
        
        {/* Badge & Typography Block */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.1 }}
          className="flex flex-col items-center gap-6 max-w-3xl"
        >
          {badgeText && (
            <div 
              className="px-4 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium tracking-wide text-muted-foreground"
              style={elementStyles.badgeText}
            >
              {badgeText}
            </div>
          )}
          
          <h1 
            className="text-5xl md:text-7xl lg:text-[80px] font-bold tracking-tight leading-[1.05] text-foreground"
            style={elementStyles.headline}
          >
            {/* The 'into decisions' part in the template image often has a slightly dimmed/gradient feel */}
            {headline}
          </h1>
          
          <p 
            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl"
            style={elementStyles.subheadline}
          >
            {subheadline}
          </p>
        </motion.div>

        {/* CTA Block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-2"
        >
          {primaryCta && (
            <motion.a 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#" 
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 transition-shadow hover:shadow-xl hover:shadow-primary/30"
              style={elementStyles.primaryCta}
            >
              {primaryCta}
              <ArrowRight size={16} className="opacity-80" />
            </motion.a>
          )}
          
          {secondaryCta && (
            <motion.a 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#" 
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-secondary text-foreground border border-border font-medium text-sm hover:bg-secondary/80 transition-colors"
              style={elementStyles.secondaryCta}
            >
              <div className="flex items-center justify-center p-1 rounded-full bg-foreground/10">
                <Play size={12} fill="currentColor" />
              </div>
              {secondaryCta}
            </motion.a>
          )}
        </motion.div>

        {/* Dashboard Graphic Container */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.3 }}
          className="w-full mt-16 md:mt-24 relative p-2 md:p-4 rounded-3xl md:rounded-[40px] bg-secondary border border-border shadow-2xl"
          style={elementStyles.dashboardContainer}
        >
          {/* Inner image container */}
          <div className="w-full aspect-video rounded-2xl md:rounded-[32px] overflow-hidden bg-background relative">
            <img 
              src={dashboardImageUrl} 
              alt="Dashboard Preview" 
              className="w-full h-full object-cover opacity-90"
              style={elementStyles.dashboardImage}
            />
            {/* Top gradient overlay to blend harsh images into the theme */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none opacity-80" />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
