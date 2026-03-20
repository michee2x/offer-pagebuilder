import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Menu, X } from 'lucide-react';

export interface HeyMessageHeaderProps {
  logoText?: string;
  links?: { label: string; href: string }[];
  ctaText?: string;
  ctaHref?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function HeyMessageHeader({
  logoText = 'HeyMessage',
  links = [
    { label: 'About', href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  ctaText = 'Get Started',
  ctaHref = '#',
  className = '',
  style = {},
  elementStyles = {},
}: HeyMessageHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerSpring = {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Quintic ease out
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 transition-all duration-300 ${className}`}
      style={style}
    >
      <motion.nav
        layout
        transition={headerSpring}
        className={`flex items-center justify-between w-full max-w-5xl rounded-full border px-6 py-3 md:py-4 transition-all duration-500 will-change-transform ${
          isScrolled 
            ? 'bg-background/80 backdrop-blur-xl border-border/50 shadow-lg' 
            : 'bg-transparent border-transparent'
        }`}
        style={elementStyles.navContainer}
      >
        {/* LOGO */}
        <a href="#" className="flex items-center gap-2 group z-10">
          <motion.div
            whileHover={{ rotate: -10, scale: 1.1 }}
            transition={headerSpring}
            className="flex items-center justify-center p-1.5 rounded-lg bg-primary text-primary-foreground"
            style={elementStyles.logoIcon}
          >
            <Ghost size={18} strokeWidth={2.5} />
          </motion.div>
          <span 
            className="font-bold tracking-tight text-lg"
            style={elementStyles.logoText}
          >
            {logoText}
          </span>
        </a>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-1.5">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-full transition-colors hover:bg-muted/50"
              style={elementStyles[`link_${idx}`]}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA & MOBILE MENU */}
        <div className="flex items-center gap-3 z-10">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={headerSpring}
            href={ctaHref}
            className="hidden sm:flex items-center justify-center px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold tracking-wide shadow-sm hover:shadow-primary/20 transition-all"
            style={elementStyles.ctaButton}
          >
            {ctaText}
          </motion.a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={headerSpring}
            className="absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-6 flex flex-col gap-4 md:hidden"
          >
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-foreground py-2 border-b border-border/50 last:border-0"
              >
                {link.label}
              </a>
            ))}
            <a
              href={ctaHref}
              className="mt-4 flex items-center justify-center w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              {ctaText}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
