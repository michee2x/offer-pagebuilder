import React from 'react';
import { motion, Variants } from 'framer-motion';

export interface HeyMessageFeatureItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface HeyMessageFeaturesProps {
  badgeText?: string;
  headline?: string;
  features?: HeyMessageFeatureItem[];
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function HeyMessageFeatures({
  badgeText = 'Discover Power',
  headline = 'Harness invisible power to write faster, focus deeper, and save hours.',
  features = [
    {
      id: 'f1',
      title: 'Context Aware',
      description: 'Understands your whole project so it writes perfect, context-rich responses instantly.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'f2',
      title: 'Natural Responses',
      description: 'Reads and writes like a human, natively adapting to your precise brand voice.',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'f3',
      title: 'Brilliant Clarity',
      description: 'Breaks down complex problems into surprisingly clear and actionable steps.',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop',
    },
  ],
  className = '',
  style = {},
  elementStyles = {},
}: HeyMessageFeaturesProps) {
  // Stagger variants for the cards
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 20,
      },
    },
  };

  return (
    <section className={`w-full py-24 px-6 flex flex-col items-center ${className}`} style={style}>
      <div className="w-full max-w-5xl flex flex-col gap-12">
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4 max-w-xl"
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
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id || idx}
              variants={cardVariants}
              className="flex flex-col gap-5 group cursor-pointer"
            >
              {/* Image Container with precise styling mimicking HeyMessage */}
              <div
                className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-card border border-border/50 relative isolate"
                style={elementStyles[`feature_${idx}_imageWrap`]}
              >
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  src={feature.imageUrl}
                  alt={feature.title}
                  className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700"
                />
                {/* Subtle inner gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
              </div>

              {/* Text Block */}
              <div className="flex flex-col gap-2 px-1">
                <h3
                  className="text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary"
                  style={elementStyles[`feature_${idx}_title`]}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed text-muted-foreground"
                  style={elementStyles[`feature_${idx}_description`]}
                >
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
