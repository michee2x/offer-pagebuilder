'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export interface FeatureCTAProps {
  badgeText?: string;
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonHref?: string;
  imageUrl?: string;
  sectionId?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function FeatureCTA({
  badgeText = 'READY TO START?',
  headline = 'Ready to make better decisions with your data?',
  subheadline = 'Join thousands of data-driven teams who use our platform to uncover growth previously hidden in their data.',
  buttonText = 'Get Feature',
  buttonHref = '#',
  imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
  sectionId = '',
  className = '',
  style = {},
  elementStyles = {},
}: FeatureCTAProps) {
  return (
    <section
      id={sectionId || undefined}
      className={`w-full py-16 px-6 flex justify-center scroll-mt-24 ${className}`}
      style={style}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
        className="relative w-full max-w-6xl rounded-[3rem] overflow-hidden bg-card border border-primary/20 flex flex-col md:flex-row items-center isolate shadow-sm"
        style={elementStyles.container}
      >
        {/* Abstract Glow in CTA Block */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none -z-10" />

        {/* Left Text Side */}
        <div className="flex flex-col items-start gap-6 p-12 md:p-16 lg:p-24 flex-1 w-full z-10">
          {badgeText && (
            <span 
              className="px-3 py-1 rounded border border-primary/30 text-primary text-[10px] uppercase font-bold tracking-widest bg-primary/5"
              style={elementStyles.badgeText}
            >
              {badgeText}
            </span>
          )}
          {headline && (
            <h2 
              className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1] max-w-lg"
              style={elementStyles.headline}
            >
              {headline}
            </h2>
          )}
          {subheadline && (
            <p 
              className="text-lg text-muted-foreground leading-relaxed max-w-md"
              style={elementStyles.subheadline}
            >
              {subheadline}
            </p>
          )}

          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={buttonHref}
            className="mt-4 flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold tracking-wide shadow-md hover:shadow-lg transition-shadow"
            style={elementStyles.button}
          >
            {buttonText}
            <ArrowRight size={18} className="opacity-80" />
          </motion.a>
        </div>

        {/* Right Graphic Side */}
        <div className="w-full md:w-1/2 h-64 md:h-full min-h-[400px] relative overflow-hidden hidden md:block border-l border-border bg-secondary">
          <img 
            src={imageUrl} 
            alt="CTA Graphic" 
            className="w-full h-full object-cover mix-blend-luminosity opacity-40 hover:opacity-70 hover:mix-blend-normal transition-all duration-1000 scale-105"
            style={elementStyles.image}
          />
          {/* Internal fade to black on the left edge so it blends into the text area */}
          <div className="absolute inset-0 bg-gradient-to-r from-card via-transparent to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </section>
  );
}
