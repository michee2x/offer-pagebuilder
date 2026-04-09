"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FooterCenteredProps {
  logoSrc?: string;
  logoAlt?: string;
  description?: string;
  copyrightText?: string;
  copyrightLink?: {
    text: string;
    href: string;
  };
  className?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function FooterCentered({
  logoSrc = "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/dummyLogo/prebuiltuiLogoSquareShapeDark.svg",
  logoAlt = "",
  description = "Empowering creators worldwide with the most advanced AI content creation tools. Transform your ideas into reality.",
  copyrightText = "©2025. All rights reserved.",
  copyrightLink = { text: "prebuiltui", href: "https://prebuiltui.com" },
  className,
  elementStyles = {},
}: FooterCenteredProps) {
  return (
    <footer
      className={cn(
        "w-full bg-linear-to-b from-muted/30 to-background text-foreground",
        className,
      )}
      style={elementStyles.container}
    >
      <div
        className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center"
        style={elementStyles.mainSection}
      >
        <div
          className="flex items-center space-x-3 mb-6"
          style={elementStyles.logoContainer}
        >
          <img
            alt={logoAlt}
            className="h-11"
            src={logoSrc}
            style={elementStyles.logo}
          />
        </div>
        <p
          className="text-center max-w-xl text-sm font-normal leading-relaxed"
          style={elementStyles.description}
        >
          {description}
        </p>
      </div>
      <div className="border-t border-border" style={elementStyles.divider}>
        <div
          className="max-w-7xl mx-auto px-6 py-6 text-center text-sm font-normal"
          style={elementStyles.copyrightSection}
        >
          <a
            href={copyrightLink.href}
            className="hover:underline"
            style={elementStyles.copyrightLink}
          >
            {copyrightLink.text}
          </a>{" "}
          {copyrightText}
        </div>
      </div>
    </footer>
  );
}
