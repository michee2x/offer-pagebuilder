"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterDarkProps {
  copyrightText?: string;
  links?: FooterLink[];
  className?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

const defaultLinks: FooterLink[] = [
  { label: "Contact Us", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Trademark Policy", href: "#" },
];

export function FooterDark({
  copyrightText = "Copyright © 2025 PrebuiltUI. All rights reserved.",
  links = defaultLinks,
  className,
  elementStyles = {},
}: FooterDarkProps) {
  return (
    <footer
      className={cn(
        "flex flex-col md:flex-row gap-3 items-center justify-around w-full py-4 text-sm bg-muted text-muted-foreground",
        className,
      )}
      style={elementStyles.container}
    >
      <p className="text-center md:text-left" style={elementStyles.copyright}>
        {copyrightText}
      </p>
      <div
        className="flex items-center gap-4"
        style={elementStyles.linksContainer}
      >
        {links.map((link, index) => (
          <React.Fragment key={link.href}>
            <a
              href={link.href}
              className="hover:text-foreground transition-all"
              style={elementStyles.link}
            >
              {link.label}
            </a>
            {index < links.length - 1 && (
              <div
                className="h-8 w-px bg-border"
                style={elementStyles.separator}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </footer>
  );
}
