import React from 'react';
import { motion } from 'framer-motion';
import { Ghost, Twitter, Linkedin, Github } from 'lucide-react';

export interface FooterLink {
  label: string;
  href: string;
}

export interface HeyMessageFooterProps {
  logoText?: string;
  description?: string;
  copyright?: string;
  socialLinks?: FooterLink[];
  navLinks?: FooterLink[];
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function HeyMessageFooter({
  logoText = 'HeyMessage',
  description = 'Treat your company’s data like it’s your own. Secure, fast, and completely invisible.',
  copyright = '© 2026 HeyMessage Studio. All rights reserved.',
  socialLinks = [
    { label: 'Twitter', href: '#' },
    { label: 'LinkedIn', href: '#' },
    { label: 'GitHub', href: '#' },
  ],
  navLinks = [
    { label: 'Product', href: '#' },
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'FAQ', href: '#' },
  ],
  className = '',
  style = {},
  elementStyles = {},
}: HeyMessageFooterProps) {
  // Map labels to icons broadly
  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('twitter') || l.includes('x')) return <Twitter size={18} />;
    if (l.includes('link')) return <Linkedin size={18} />;
    if (l.includes('git')) return <Github size={18} />;
    return null;
  };

  return (
    <footer className={`w-full pt-20 pb-10 px-6 flex justify-center border-t border-border/20 ${className}`} style={style}>
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between gap-16 md:gap-8">
        
        {/* Left Side: Brand & Social */}
        <div className="flex flex-col gap-6 max-w-sm">
          <a href="#" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: -10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex items-center justify-center p-1.5 rounded-lg bg-primary text-primary-foreground"
              style={elementStyles.logoIcon}
            >
              <Ghost size={20} strokeWidth={2.5} />
            </motion.div>
            <span 
              className="font-bold tracking-tight text-xl text-foreground"
              style={elementStyles.logoText}
            >
              {logoText}
            </span>
          </a>
          
          <p className="text-sm text-muted-foreground leading-relaxed pr-8" style={elementStyles.description}>
            {description}
          </p>

          <div className="flex items-center gap-4 mt-2">
            {socialLinks.map((link, idx) => (
              <a 
                key={idx} 
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={link.label}
              >
                {getIcon(link.label) || <span className="text-sm">{link.label}</span>}
              </a>
            ))}
          </div>

          <p className="text-xs text-muted-foreground/60 mt-8" style={elementStyles.copyright}>
            {copyright}
          </p>
        </div>

        {/* Right Side: Navigation Links */}
        <div className="flex flex-col gap-4 min-w-[150px]">
          <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase mb-2">Navigation</h4>
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
              style={elementStyles[`navLink_${idx}`]}
            >
              {link.label}
            </a>
          ))}
        </div>

      </div>
    </footer>
  );
}
