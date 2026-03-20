'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface FeatureBlogItem {
  id: string;
  category: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
}

export interface FeatureBlogProps {
  badgeText?: string;
  headline?: string;
  subheadline?: string;
  articles?: FeatureBlogItem[];
  sectionId?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function FeatureBlog({
  badgeText = 'FEATURE INSIGHTS',
  headline = 'Learn to make better decisions',
  subheadline = 'Explore our industry research, platform updates, and best practices for scaling operations.',
  articles = [
    {
      id: '1',
      category: 'Guides',
      title: 'How to set KPIs that accurately reflect true product value',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
      linkUrl: '#'
    },
    {
      id: '2',
      category: 'Strategy',
      title: 'Navigating the gap between data collection and execution',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop',
      linkUrl: '#'
    },
    {
      id: '3',
      category: 'Product',
      title: 'Creating a dashboard ecosystem that your team actually uses',
      imageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=600&auto=format&fit=crop',
      linkUrl: '#'
    }
  ],
  sectionId = '',
  className = '',
  style = {},
  elementStyles = {},
}: FeatureBlogProps) {
  return (
    <section
      id={sectionId || undefined}
      className={`w-full py-24 px-6 flex flex-col items-center scroll-mt-24 ${className}`}
      style={style}
    >
      <div className="flex flex-col items-center max-w-6xl w-full gap-16">
        
        {/* Header Block */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-center justify-between w-full gap-8"
        >
          <div className="flex flex-col gap-4 max-w-2xl text-left">
            {badgeText && (
              <span 
                className="text-[11px] font-bold tracking-widest text-[#F2AE40] uppercase"
                style={elementStyles.badgeText}
              >
                {badgeText}
              </span>
            )}
            {headline && (
              <h2 
                className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]"
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
          
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#"
            className="px-6 py-3 rounded-full border border-white/20 text-sm font-semibold text-white/90 hover:bg-white/5 transition-colors whitespace-nowrap hidden md:block"
          >
            View all articles
          </motion.a>
        </motion.div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {articles.map((article, idx) => (
            <motion.a
              key={article.id}
              href={article.linkUrl}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="group flex flex-col gap-6 cursor-pointer"
              style={elementStyles[`article_${idx}`]}
            >
              {/* Image Container with Hover Scaling */}
              <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-white/5 border border-white/10 relative">
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                  style={elementStyles[`article_${idx}_image`]}
                />
              </div>

              {/* Text Block */}
              <div className="flex flex-col gap-3 px-2">
                <span 
                  className="text-sm font-semibold text-[#F2AE40]"
                  style={elementStyles[`article_${idx}_category`]}
                >
                  {article.category}
                </span>
                <h3 
                  className="text-xl md:text-2xl font-bold text-white leading-[1.3] group-hover:text-white/80 transition-colors"
                  style={elementStyles[`article_${idx}_title`]}
                >
                  {article.title}
                </h3>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Mobile View All Button */}
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="#"
          className="mt-4 px-8 py-3.5 rounded-full border border-white/20 text-sm font-semibold text-white/90 hover:bg-white/5 transition-colors md:hidden w-full text-center"
        >
          View all articles
        </motion.a>

      </div>
    </section>
  );
}
