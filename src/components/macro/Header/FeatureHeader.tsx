'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Menu, X, ArrowRight } from 'lucide-react';

export interface FeatureHeaderProps {
  logoText?: string;
  links?: { label: string; href: string }[];
  ctaText?: string;
  ctaHref?: string;
  sectionId?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function FeatureHeader({
  logoText = 'Feature',
  links = [
    { label: 'Features', href: '#features' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Blog', href: '#blog' },
  ],
  ctaText = 'Get Feature',
  ctaHref = '#',
  sectionId = 'header',
  className = '',
  style = {},
  elementStyles = {},
}: FeatureHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      id={sectionId}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 transition-all duration-300 ${className}`} 
      style={style}
    >
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`flex items-center justify-between w-full max-w-7xl rounded-2xl px-5 py-3 md:py-4 transition-all duration-500 border ${
          isScrolled 
            ? 'bg-background/80 backdrop-blur-xl border-border shadow-lg' 
            : 'bg-transparent border-transparent'
        }`}
        style={elementStyles.navContainer}
      >
        {/* LOGO */}
        <a href="#" className="flex items-center gap-2 group z-10 transition-opacity hover:opacity-80">
          <div
            className="flex items-center justify-center p-1.5 rounded bg-foreground text-background shrink-0"
            style={elementStyles.logoIcon}
          >
            <Ghost size={16} strokeWidth={2.5} />
          </div>
          <span 
            className="font-bold tracking-tight text-lg text-foreground"
            style={elementStyles.logoText}
          >
            {logoText}
          </span>
        </a>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-1 bg-secondary/50 rounded-full px-2 py-1 border border-border/50 z-[9999] relative pointer-events-auto">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onClick={(e) => {
                if (link.href.startsWith('#')) {
                  e.preventDefault();
                  const target = document.querySelector(link.href);
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-1.5 rounded-full transition-colors hover:bg-secondary cursor-pointer relative z-[9999]"
              style={{ ...elementStyles[`link_${idx}`], cursor: 'pointer', pointerEvents: 'auto' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA & MOBILE MENU */}
        <div className="flex items-center gap-4 z-10">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={ctaHref}
            className="hidden sm:flex items-center gap-2 justify-center px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold tracking-wide shadow-sm hover:shadow-md transition-shadow"
            style={elementStyles.ctaButton}
          >
            {ctaText}
            <ArrowRight size={14} className="opacity-70" />
          </motion.a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-20 left-4 right-4 bg-background border border-border shadow-2xl rounded-2xl p-6 flex flex-col gap-4 md:hidden z-40"
          >
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (link.href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(link.href);
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="text-base font-medium text-muted-foreground hover:text-foreground py-2 cursor-pointer"
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
              >
                {link.label}
              </a>
            ))}
            <a
              href={ctaHref}
              className="mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              {ctaText}
              <ArrowRight size={16} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
