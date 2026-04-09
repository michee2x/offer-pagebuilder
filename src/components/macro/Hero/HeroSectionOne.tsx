"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface HeroSectionOneProps {
  navbarBrand?: string;
  navbarBrandLogo?: React.ReactNode;
  navbarLoginText?: string;
  headline?: string;
  subtitle?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  imageUrl?: string;
  imageAlt?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  onNavbarLoginClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  elementStyles?: Record<string, React.CSSProperties>;
}

function Navbar({
  brand = "Your Brand",
  brandLogo,
  loginText = "Login",
  onLoginClick,
  elementStyles = {},
}: {
  brand: string;
  brandLogo?: React.ReactNode;
  loginText: string;
  onLoginClick?: () => void;
  elementStyles?: Record<string, React.CSSProperties>;
}) {
  return (
    <nav
      className="flex w-full items-center justify-between border-t border-b border-border px-4 py-4"
      style={elementStyles.navbar}
    >
      <div className="flex items-center gap-2">
        {brandLogo ? (
          <div style={elementStyles.navbarLogo}>{brandLogo}</div>
        ) : (
          <div
            className="size-7 rounded-full bg-gradient-to-br from-primary to-secondary"
            style={elementStyles.navbarLogoBg}
          />
        )}
        <h1
          className="text-base font-bold md:text-2xl text-foreground"
          style={elementStyles.navbarBrand}
        >
          {brand}
        </h1>
      </div>
      <button
        onClick={onLoginClick}
        className="w-24 transform rounded-lg bg-foreground px-6 py-2 font-medium text-background transition-all duration-300 hover:-translate-y-0.5 hover:bg-foreground/90 md:w-32"
        style={elementStyles.navbarButton}
      >
        {loginText}
      </button>
    </nav>
  );
}

export function HeroSectionOne({
  navbarBrand = "Your Brand",
  navbarBrandLogo,
  navbarLoginText = "Login",
  headline = "Launch your website in hours, not days",
  subtitle = "With AI, you can launch your website in hours, not days. Try our best in class, state of the art, cutting edge AI tools to get your website up.",
  primaryButtonText = "Explore Now",
  secondaryButtonText = "Contact Support",
  imageUrl = "https://assets.aceternity.com/pro/aceternity-landing.webp",
  imageAlt = "Landing page preview",
  onPrimaryClick,
  onSecondaryClick,
  onNavbarLoginClick,
  className = "",
  style = {},
  elementStyles = {},
}: HeroSectionOneProps) {
  return (
    <div
      className={cn(
        "relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center bg-background text-foreground",
        className,
      )}
      style={style}
    >
      <Navbar
        brand={navbarBrand}
        brandLogo={navbarBrandLogo}
        loginText={navbarLoginText}
        onLoginClick={onNavbarLoginClick}
        elementStyles={elementStyles.navbar ? { ...elementStyles } : {}}
      />

      {/* Left accent line */}
      <div
        className="absolute inset-y-0 left-0 h-full w-px bg-border/50"
        style={elementStyles.leftAccent}
      >
        <div
          className="absolute top-0 h-40 w-px bg-linear-to-b from-transparent via-primary to-transparent"
          style={elementStyles.leftAccentGradient}
        />
      </div>

      {/* Right accent line */}
      <div
        className="absolute inset-y-0 right-0 h-full w-px bg-border/50"
        style={elementStyles.rightAccent}
      >
        <div
          className="absolute h-40 w-px bg-linear-to-b from-transparent via-primary to-transparent"
          style={elementStyles.rightAccentGradient}
        />
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute inset-x-0 bottom-0 h-px w-full bg-border/50"
        style={elementStyles.bottomAccent}
      >
        <div
          className="absolute mx-auto h-px w-40 bg-linear-to-r from-transparent via-primary to-transparent"
          style={elementStyles.bottomAccentGradient}
        />
      </div>

      <div className="px-4 py-10 md:py-20" style={elementStyles.heroContent}>
        {/* Animated Headline */}
        <h1
          className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-foreground md:text-4xl lg:text-7xl"
          style={elementStyles.headline}
        >
          {headline.split(" ").map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
              className="mr-2 inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Animated Subtitle */}
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-muted-foreground"
          style={elementStyles.subtitle}
        >
          {subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
          style={elementStyles.buttonContainer}
        >
          <button
            onClick={onPrimaryClick}
            className="transform rounded-lg bg-foreground px-6 py-2 font-medium text-background transition-all duration-300 hover:-translate-y-0.5 hover:bg-foreground/90 w-60"
            style={elementStyles.primaryButton}
          >
            {primaryButtonText}
          </button>
          <button
            onClick={onSecondaryClick}
            className="transform rounded-lg border border-border bg-background px-6 py-2 font-medium text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-muted w-60"
            style={elementStyles.secondaryButton}
          >
            {secondaryButtonText}
          </button>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 1.2,
          }}
          className="relative z-10 mt-20 rounded-3xl border border-border bg-card p-4 shadow-md"
          style={elementStyles.imageContainer}
        >
          <div
            className="w-full overflow-hidden rounded-xl border border-border"
            style={elementStyles.imageBorder}
          >
            <img
              src={imageUrl}
              alt={imageAlt}
              className="aspect-[16/9] h-auto w-full object-cover"
              style={elementStyles.image}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
