'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export interface FeatureFAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FeatureFAQProps {
  headline?: string;
  faqs?: FeatureFAQItem[];
  sectionId?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function FeatureFAQ({
  headline = 'Any questions?',
  faqs = [
    { id: '1', question: 'How long does setup take?', answer: 'Setup takes less than 5 minutes. Connect your data source, map your fields automatically, and your dashboards are generated instantly without engineering help.' },
    { id: '2', question: 'Do I need to know SQL?', answer: 'Not at all. Our natural language interface lets you query data and build reports using plain English.' },
    { id: '3', question: 'Is my data secure?', answer: 'Yes. We use SOC2 Type II compliant providers, AES-256 encryption at rest, and never use your private data to train public AI models.' },
    { id: '4', question: 'Can I export my reports?', answer: 'You can export any dashboard or report as PDF, PNG, or raw CSV data. You can also schedule automated email reports for stakeholders.' },
    { id: '5', question: 'What integrations do you support?', answer: 'We natively support Postgres, MySQL, Snowflake, BigQuery, Stripe, HubSpot, and 150+ other primary data sources.' },
  ],
  sectionId = '',
  className = '',
  style = {},
  elementStyles = {},
}: FeatureFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id={sectionId || undefined}
      className={`w-full py-24 px-6 flex justify-center scroll-mt-24 ${className}`}
      style={style}
    >
      <div className="flex flex-col md:flex-row max-w-5xl w-full gap-16 lg:gap-32">
        
        {/* Left Side: Headline */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 md:max-w-xs"
        >
          {headline && (
            <h2 
              className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]"
              style={elementStyles.headline}
            >
              {headline}
            </h2>
          )}
        </motion.div>

        {/* Right Side: Accordion */}
        <div className="flex-[2] flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div 
                key={faq.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="flex flex-col border-b border-border last:border-0"
                style={elementStyles[`faq_${idx}_container`]}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="flex items-center justify-between w-full py-6 text-left focus:outline-none group/faq"
                >
                  <span 
                    className="text-lg md:text-xl font-medium text-foreground/90 group-hover/faq:text-primary transition-colors pr-8"
                    style={elementStyles[`faq_${idx}_question`]}
                  >
                    {faq.question}
                  </span>
                  <div className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`}>
                    {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p 
                        className="pb-8 text-muted-foreground leading-relaxed text-base md:text-lg"
                        style={elementStyles[`faq_${idx}_answer`]}
                      >
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
