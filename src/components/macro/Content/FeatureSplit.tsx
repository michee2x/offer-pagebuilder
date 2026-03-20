'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Server, Zap, ShieldCheck } from 'lucide-react';

export interface FeatureSplitContentItem {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface FeatureSplitProps {
  badgeText?: string;
  headline?: string;
  subheadline?: string;
  imageUrl?: string;
  imagePosition?: 'left' | 'right';
  contentItems?: FeatureSplitContentItem[];
  sectionId?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function FeatureSplit({
  badgeText = 'DATA INTEGRATION',
  headline = 'Stop jumping between data tools.',
  subheadline = 'Connect all your data sources into one unified dashboard without writing a single line of code.',
  imageUrl = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
  imagePosition = 'right',
  contentItems = [
    { id: '1', title: 'Connect Your Stack', description: 'Seamlessly link your favorite marketing, sales, and support tools with one click.', icon: <Server size={20} /> },
    { id: '2', title: 'Automated Sync', description: 'Say goodbye to manual exports. Data syncs in real-time, 24/7.', icon: <Zap size={20} /> },
    { id: '3', title: 'Privacy First', description: 'Your data is encrypted end-to-end and never sold to third parties.', icon: <ShieldCheck size={20} /> },
  ],
  sectionId = '',
  className = '',
  style = {},
  elementStyles = {},
}: FeatureSplitProps) {
  const isRight = imagePosition === 'right';

  return (
    <section
      id={sectionId || undefined}
      className={`w-full py-24 px-6 flex justify-center overflow-hidden scroll-mt-24 ${className}`}
      style={style}
    >
      <div className={`flex flex-col ${isRight ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center max-w-6xl w-full gap-16 lg:gap-24`}>
        
        {/* TEXT CONTENT / LEFT SIDE */}
        <motion.div 
          initial={{ opacity: 0, x: isRight ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-8 flex-1 max-w-xl"
        >
          {badgeText && (
            <div 
              className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold tracking-widest text-[#F2AE40] uppercase"
              style={elementStyles.badgeText}
            >
              {badgeText}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {headline && (
              <h2 
                className="text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]"
                style={elementStyles.headline}
              >
                {headline}
              </h2>
            )}
            {subheadline && (
              <p 
                className="text-lg text-white/50 leading-relaxed"
                style={elementStyles.subheadline}
              >
                {subheadline}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-8 w-full mt-4">
            {contentItems.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: idx * 0.1 + 0.3, duration: 0.5 }}
                className="flex gap-5 items-start"
              >
                {/* Icon Box */}
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#F2AE40]/10 text-[#F2AE40] shrink-0 border border-[#F2AE40]/20 shadow-[0_0_15px_rgba(242,174,64,0.1)]">
                  {item.icon || <Zap size={20} />}
                </div>
                
                {/* Text */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <h3 
                    className="text-xl font-semibold text-white tracking-tight"
                    style={elementStyles[`item_${idx}_title`]}
                  >
                    {item.title}
                  </h3>
                  <p 
                    className="text-base text-white/50 leading-relaxed"
                    style={elementStyles[`item_${idx}_description`]}
                  >
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* IMAGE / RIGHT SIDE */}
        <motion.div 
          initial={{ opacity: 0, x: isRight ? 40 : -40, scale: 0.95 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 w-full relative"
        >
          {/* Subtle background glow behind the image */}
          <div className="absolute inset-0 bg-[#F2AE40]/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div 
            className="w-full aspect-[4/3] max-h-[600px] md:max-h-[500px] rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 relative shadow-2xl"
            style={elementStyles.imageContainer}
          >
            <img 
              src={imageUrl} 
              alt={headline} 
              className="w-full h-full object-cover opacity-80 mix-blend-lighten"
              style={elementStyles.image}
            />
            {/* Edge fading gradient for premium feel */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0a]/80 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
