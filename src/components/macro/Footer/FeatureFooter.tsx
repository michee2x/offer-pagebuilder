'use client';

import React from 'react';
import { Ghost } from 'lucide-react';

export interface FeatureFooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface FeatureFooterProps {
  logoText?: string;
  description?: string;
  columns?: FeatureFooterColumn[];
  copyright?: string;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function FeatureFooter({
  logoText = 'Feature',
  description = 'Data decisions, un-complicated. Proudly built for modern teams everywhere.',
  columns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#' },
        { label: 'Integrations', href: '#' },
        { label: 'Pricing', href: '#' },
        { label: 'Changelog', href: '#' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Contact', href: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Cookie Policy', href: '#' }
      ]
    }
  ],
  copyright = '© 2024 Feature Inc. All rights reserved.',
  className = '',
  style = {},
  elementStyles = {},
}: FeatureFooterProps) {
  return (
    <footer 
      className={`w-full bg-background border-t border-border pt-20 pb-12 px-6 flex justify-center text-muted-foreground ${className}`}
      style={style}
    >
      <div className="max-w-6xl w-full flex flex-col gap-16">
        
        {/* Top Split */}
        <div className="flex flex-col md:flex-row justify-between gap-16">
          
          {/* Left Brand */}
          <div className="flex flex-col gap-6 max-w-xs">
            <a href="#" className="flex items-center gap-2 group transition-opacity hover:opacity-80 w-fit">
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
            <p 
              className="text-sm leading-relaxed text-muted-foreground"
              style={elementStyles.description}
            >
              {description}
            </p>
          </div>

          {/* Right Columns Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
            {columns.map((col, idx) => (
              <div key={idx} className="flex flex-col gap-5">
                <span 
                  className="font-semibold text-foreground tracking-tight"
                  style={elementStyles[`col_${idx}_title`]}
                >
                  {col.title}
                </span>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a 
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        style={elementStyles[`col_${idx}_link_${lIdx}`]}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="flex items-center justify-between border-t border-border pt-8 w-full text-xs text-muted-foreground/50">
          <span style={elementStyles.copyright}>{copyright}</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
