"use client";

import React from "react";
import { Button } from "@/components/micro";

export interface HeroRemoteCollabProps {
  logoUrl?: string;
  navItems?: Array<{ label: string; href: string }>;
  headerCtaText?: string;
  headerCtaHref?: string;
  headlinePrefix: string;
  headlineHighlight: string;
  subheadline: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryLinkText?: string;
  secondaryLinkHref?: string;
  heroImageUrl?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function HeroRemoteCollab({
  logoUrl = "https://cdn.rareblocks.xyz/collection/celebration/images/hero/2/logo.svg",
  navItems = [],
  headerCtaText,
  headerCtaHref = "#",
  headlinePrefix,
  headlineHighlight,
  subheadline,
  primaryCtaText,
  primaryCtaHref = "#",
  secondaryLinkText,
  secondaryLinkHref = "#",
  heroImageUrl = "https://cdn.rareblocks.xyz/collection/celebration/images/hero/2/hero-img.png",
  elementStyles = {},
}: HeroRemoteCollabProps) {
  return (
    <div className="bg-gradient-to-b from-primary/10 to-background text-foreground">
      <header className="py-6 lg:py-8">
        <div className="px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex-shrink-0" data-field="logo">
              <a
                href="#"
                className="flex rounded outline-none focus:ring-1 focus:ring-primary focus:ring-offset-2"
              >
                <img
                  className="w-auto h-8"
                  src={logoUrl}
                  alt="Logo"
                  style={elementStyles?.["logo"]}
                />
              </a>
            </div>

            {navItems.length > 0 && (
              <button
                type="button"
                className="inline-flex p-1 text-foreground transition-all duration-200 border border-border lg:hidden focus:bg-muted/20 hover:bg-muted/20"
                aria-label="Toggle menu"
              >
                <svg
                  className="block w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}

            {navItems.length > 0 && (
              <div className="hidden ml-auto lg:flex lg:items-center lg:justify-center lg:space-x-10">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    title={item.label}
                    className="text-base font-semibold text-foreground transition-all duration-200 hover:text-primary"
                    data-field={`nav-${item.label}`}
                    style={elementStyles?.[`nav-${item.label}`]}
                  >
                    {item.label}
                  </a>
                ))}

                {headerCtaText ? (
                  <Button
                    asChild
                    size="lg"
                    className="px-6 font-semibold"
                    data-field="headerCta"
                    style={elementStyles?.["headerCta"]}
                  >
                    <a href={headerCtaHref}>{headerCtaText}</a>
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="py-10 sm:py-16 lg:py-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h1
                className="text-4xl font-bold text-foreground sm:text-6xl lg:text-7xl"
                data-field="headlinePrefix"
                style={elementStyles?.["headlinePrefix"]}
              >
                {headlinePrefix}
              </h1>
              <div className="relative inline-flex">
                <span className="absolute inset-x-0 bottom-0 border-b-[30px] border-primary/20" />
                <h2
                  className="relative text-4xl font-bold text-foreground sm:text-6xl lg:text-7xl"
                  data-field="headlineHighlight"
                  style={elementStyles?.["headlineHighlight"]}
                >
                  {headlineHighlight}
                </h2>
              </div>

              <p
                className="mt-8 text-base text-muted-foreground sm:text-xl"
                data-field="subheadline"
                style={elementStyles?.["subheadline"]}
              >
                {subheadline}
              </p>

              <div className="mt-10 sm:flex sm:items-center sm:space-x-8">
                <Button
                  asChild
                  size="lg"
                  className="inline-flex px-10 py-4 font-semibold"
                  data-field="primaryCta"
                  style={elementStyles?.["primaryCta"]}
                >
                  <a href={primaryCtaHref}>{primaryCtaText}</a>
                </Button>

                {secondaryLinkText ? (
                  <a
                    href={secondaryLinkHref}
                    title={secondaryLinkText}
                    className="inline-flex items-center mt-6 text-base font-semibold text-foreground transition-all duration-200 sm:mt-0 hover:text-primary"
                    data-field="secondaryLink"
                    style={elementStyles?.["secondaryLink"]}
                  >
                    <svg
                      className="w-10 h-10 mr-3"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        fill="currentColor"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {secondaryLinkText}
                  </a>
                ) : null}
              </div>
            </div>

            <div data-field="heroImage" style={elementStyles?.["heroImage"]}>
              <img
                className="w-full rounded-3xl shadow-2xl"
                src={heroImageUrl}
                alt="Hero illustration"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
