 import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Zap, Shield, Star, Check } from 'lucide-react';

export interface SplitContentItem {
  id: string;
  icon?: string;
  title: string;
  description: string;
}

export interface HeyMessageSplitProps {
  badgeText?: string;
  headline?: string;
  subheadline?: string;
  imageUrl?: string;
  imagePosition?: 'left' | 'right';
  contentItems?: SplitContentItem[];
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

// Minimal icon map for the default dummy data
const ICON_MAP: Record<string, any> = { Zap, Shield, Star, Check };

export function HeyMessageSplit({
  badgeText = 'FEATURES',
  headline = 'Different paths to explore all guided by one silent companion.',
  subheadline = '',
  imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
  imagePosition = 'left',
  contentItems = [
    { id: '1', title: '1 — Call', description: 'Just type a simple prompt and command the AI to begin.' },
    { id: '2', title: '2 — Execute', description: 'The invisible system runs deeply connected reasoning.' },
    { id: '3', title: '3 — Enhance', description: 'Get actionable clarity delivered instantly.' },
  ],
  className = '',
  style = {},
  elementStyles = {},
}: HeyMessageSplitProps) {
  const isRight = imagePosition === 'right';

  const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: isRight ? -20 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
    },
  };

  return (
    <section className={`w-full py-24 px-6 flex flex-col items-center ${className}`} style={style}>
      <div className="w-full max-w-5xl flex flex-col gap-16">
        {/* Header Block */}
        {(badgeText || headline) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4 max-w-2xl"
          >
            {badgeText && (
              <span
                className="text-xs font-semibold tracking-widest uppercase text-muted-foreground"
                style={elementStyles.badgeText}
              >
                {badgeText}
              </span>
            )}
            {headline && (
              <h2
                className="text-3xl md:text-5xl font-medium tracking-tight leading-[1.1]"
                style={elementStyles.headline}
              >
                {headline}
              </h2>
            )}
            {subheadline && (
              <p
                className="text-lg text-muted-foreground leading-relaxed mt-2"
                style={elementStyles.subheadline}
              >
                {subheadline}
              </p>
            )}
          </motion.div>
        )}

        {/* Split Grid area */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center ${isRight ? 'md:grid-flow-col-dense' : ''}`}>
          
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full aspect-[4/3] rounded-3xl overflow-hidden bg-card border border-border/50 relative shadow-2xl ${isRight ? 'md:col-start-2' : 'md:col-start-1'}`}
            style={elementStyles.imageWrap}
          >
            <img
              src={imageUrl}
              alt="Section feature"
              className="w-full h-full object-cover mix-blend-luminosity opacity-90 transition-all duration-[1.5s] ease-out hover:scale-105 hover:mix-blend-normal hover:opacity-100"
            />
          </motion.div>

          {/* Content Side */}
          <motion.div
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className={`flex flex-col gap-8 ${isRight ? 'md:col-start-1' : 'md:col-start-2'}`}
          >
            {contentItems.map((item, idx) => {
              const Icon = item.icon ? ICON_MAP[item.icon] : null;
              return (
                <motion.div
                  key={item.id || idx}
                  variants={itemVariants}
                  className="flex gap-4 group"
                >
                  {Icon && (
                    <div className="shrink-0 mt-1">
                      <Icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors duration-500" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <h3
                      className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary"
                      style={elementStyles[`item_${idx}_title`]}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-base text-muted-foreground leading-relaxed"
                      style={elementStyles[`item_${idx}_description`]}
                    >
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
