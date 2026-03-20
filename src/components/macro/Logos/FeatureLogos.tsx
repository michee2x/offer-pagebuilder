'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface FeatureLogosProps {
  headline?: string;
  logos?: { name: string; domain: string }[];
  sectionId?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function FeatureLogos({
  headline = 'TRUSTED BY INNOVATIVE TEAMS WORLDWIDE',
  logos = [
    { name: 'Stripe', domain: 'stripe.com' },
    { name: 'Linear', domain: 'linear.app' },
    { name: 'Vercel', domain: 'vercel.com' },
    { name: 'Notion', domain: 'notion.so' },
    { name: 'GitHub', domain: 'github.com' },
  ],
  sectionId = '',
  className = '',
  style = {},
  elementStyles = {},
}: FeatureLogosProps) {
  return (
    <section
      id={sectionId || undefined}
      className={`w-full py-16 px-6 flex flex-col items-center justify-center border-t border-b border-border bg-secondary/20 scroll-mt-24 ${className}`}
      style={style}
    >
      <div className="flex flex-col items-center max-w-5xl w-full gap-8">
        {headline && (
          <motion.h3 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            className="text-[10px] md:text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase text-center"
            style={elementStyles.headline}
          >
            {headline}
          </motion.h3>
        )}
        
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 w-full opacity-60 grayscale hover:grayscale-0 transition-all duration-1000">
          {logos.map((logo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group/logo cursor-pointer px-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              <span 
                className="text-2xl md:text-3xl font-black tracking-tighter text-foreground transition-colors group-hover/logo:text-primary uppercase"
                style={elementStyles[`logo_${idx}`]}
              >
                {logo.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
