'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface HeyMessageCTAProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonHref?: string;
  bgImageUrl?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function HeyMessageCTA({
  headline = 'Step into the future, guided by AI clarity',
  subheadline = 'Experience the invisible companion that writes, refines, and saves you hours.',
  buttonText = 'Try It Free',
  buttonHref = '#',
  bgImageUrl = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
  className = '',
  style = {},
  elementStyles = {},
}: HeyMessageCTAProps) {
  return (
    <section className={`w-full py-24 px-6 flex justify-center ${className}`} style={style}>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl relative overflow-hidden rounded-[2rem] border border-border/50 shadow-2xl flex flex-col items-start justify-center py-20 px-8 md:px-16"
        style={elementStyles.containerWrap}
      >
        {/* Background Image layer with subtle zoom in effect on mount */}
        <motion.div
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <img
            src={bgImageUrl}
            alt="CTA background"
            className="w-full h-full object-cover mix-blend-luminosity opacity-40"
          />
          {/* Subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </motion.div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col items-start max-w-xl gap-6">
          <h2
            className="text-3xl md:text-5xl font-medium tracking-tight text-foreground leading-[1.1]"
            style={elementStyles.headline}
          >
            {headline}
          </h2>
          <p
            className="text-lg text-muted-foreground leading-relaxed"
            style={elementStyles.subheadline}
          >
            {subheadline}
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            href={buttonHref}
            className="mt-4 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold tracking-wide shadow-lg hover:shadow-primary/25 transition-all"
            style={elementStyles.ctaButton}
          >
            {buttonText}
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
