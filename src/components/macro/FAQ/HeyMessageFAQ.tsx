'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface HeyMessageFAQProps {
  badgeText?: string;
  headline?: string;
  faqs?: FAQItem[];
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function HeyMessageFAQ({
  badgeText = 'FAQ',
  headline = 'Your questions, answered with clarity',
  faqs = [
    { id: '1', question: 'How do you protect my privacy?', answer: 'We ensure all data is fully encrypted and never stored beyond your active session without consent.' },
    { id: '2', question: 'Is there a limit on usage?', answer: 'Our standard tier includes unlimited casual usage with a generous fair-use cap for high-volume power users.' },
    { id: '3', question: 'Do I need to install anything?', answer: 'No, everything is web-based. Simply log in and access your workspace from any secure browser.' },
    { id: '4', question: 'Can I cancel my subscription?', answer: 'Yes, your subscription can be paused or cancelled at any time directly through your billing portal.' },
  ],
  className = '',
  style = {},
  elementStyles = {},
}: HeyMessageFAQProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className={`w-full py-24 px-6 flex flex-col items-center ${className}`} style={style}>
      <div className="w-full max-w-5xl flex flex-col gap-12">
        {/* Header Block */}
        {(badgeText || headline) && (
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
        )}

        {/* FAQ Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4"
        >
          {faqs.map((faq, idx) => {
            const isOpen = openId === (faq.id || idx.toString());
            return (
              <div 
                key={faq.id || idx}
                className="border-b border-border/40 py-4 flex flex-col"
              >
                <button
                  onClick={() => toggle(faq.id || idx.toString())}
                  className="w-full flex items-center justify-between text-left py-2 group outline-none"
                >
                  <span
                    className="text-base font-medium text-foreground transition-colors group-hover:text-primary pr-8"
                    style={elementStyles[`faq_${idx}_question`]}
                  >
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors"
                  >
                    <Plus size={18} />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                      className="overflow-hidden"
                    >
                      <p
                        className="text-sm text-muted-foreground leading-relaxed pt-2 pb-4 pr-12"
                        style={elementStyles[`faq_${idx}_answer`]}
                      >
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
