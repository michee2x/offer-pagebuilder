"use client";

import React from "react";
import { Button } from "@/components/micro";
import { DownloadCloud } from "lucide-react";

export interface HeroFeedbackAppProps {
  logoUrl?: string;
  navItems?: Array<{ label: string; href: string }>;
  headerCtaText?: string;
  headerCtaHref?: string;
  headlinePrefix: string;
  headlineHighlight: string;
  subheadline: string;
  primaryCtaText: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  avatars?: string[];
  teamCopy?: string;
  heroImageUrl?: string;
  backgroundPatternUrl?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function HeroFeedbackApp({
  logoUrl = "https://d33wubrfki0l68.cloudfront.net/682a555ec15382f2c6e7457ca1ef48d8dbb179ac/f8cd3/images/logo.svg",
  navItems = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Automation", href: "#automation" },
  ],
  headerCtaText,
  headerCtaHref = "#",
  headlinePrefix,
  headlineHighlight,
  subheadline,
  primaryCtaText,
  primaryCtaHref = "#",
  secondaryCtaText,
  secondaryCtaHref = "#",
  avatars = [
    "https://d33wubrfki0l68.cloudfront.net/3bfa6da479d6b9188c58f2d9a8d33350290ee2ef/301f1/images/hero/3/avatar-male.png",
    "https://d33wubrfki0l68.cloudfront.net/b52fa09a115db3a80ceb2d52c275fadbf84cf8fc/7fd8a/images/hero/3/avatar-female-1.png",
    "https://d33wubrfki0l68.cloudfront.net/8a2efb13f103a5ae2909e244380d73087a9c2fc4/31ed6/images/hero/3/avatar-female-2.png",
  ],
  teamCopy = "Join with 4600+ Developers and start getting feedbacks right now",
  heroImageUrl = "https://d33wubrfki0l68.cloudfront.net/29c501c64b21014b3f2e225abe02fe31fd8f3a5c/f866d/images/hero/3/illustration.png",
  backgroundPatternUrl = "https://d33wubrfki0l68.cloudfront.net/1e0fc04f38f5896d10ff66824a62e466839567f8/699b5/images/hero/3/background-pattern.png",
  elementStyles = {},
}: HeroFeedbackAppProps) {
  return (
    <div className="relative bg-background text-foreground">
      <div className="absolute bottom-0 right-0 overflow-hidden lg:inset-y-0">
        <img
          className="w-auto h-full"
          src={backgroundPatternUrl}
          alt="Background pattern"
        />
      </div>

      <header className="relative py-4 md:py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0" data-field="logo">
              <a
                href="#"
                title="Home"
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

            <div className="hidden lg:flex lg:ml-16 lg:items-center lg:justify-center lg:space-x-10">
              <div className="flex items-center space-x-12">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    title={item.label}
                    className="text-base font-medium text-foreground transition-all duration-200 rounded focus:outline-none hover:text-primary focus:ring-1 focus:ring-primary focus:ring-offset-2"
                    data-field={`nav-${item.label}`}
                    style={elementStyles?.[`nav-${item.label}`]}
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              {headerCtaText ? (
                <Button
                  asChild
                  size="lg"
                  className="px-6"
                  data-field="headerCta"
                  style={elementStyles?.["headerCta"]}
                >
                  <a
                    href={headerCtaHref}
                    title={headerCtaText}
                    className="inline-flex items-center justify-center px-5 py-2 text-base font-semibold text-foreground transition-all duration-200 border border-foreground rounded-xl bg-transparent hover:bg-foreground hover:text-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {headerCtaText}
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <section className="relative py-12 sm:py-16 lg:pt-20 lg:pb-36">
        <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 gap-y-8 lg:items-center lg:grid-cols-2 sm:gap-y-20 xl:grid-cols-5">
            <div className="text-center xl:col-span-2 lg:text-left md:px-16 lg:px-0">
              <div className="max-w-sm mx-auto sm:max-w-md md:max-w-full">
                <h1
                  className="text-3xl font-bold leading-tight text-foreground sm:text-3xl sm:leading-tight lg:text-5xl lg:leading-tight"
                  data-field="headline"
                  style={elementStyles?.["headline"]}
                >
                  {headlinePrefix}{" "}
                  <span
                    className="relative whitespace-nowrap text-foreground/50"
                    data-field="headlineHighlight"
                    style={elementStyles?.["headlineHighlight"]}
                  >
                    {headlineHighlight}
                  </span>
                </h1>

                <p
                  className="mt-8 text-lg text-muted-foreground"
                  data-field="subheadline"
                  style={elementStyles?.["subheadline"]}
                >
                  {subheadline}
                </p>

                <div className="mt-8 sm:flex sm:items-center sm:space-x-5 lg:mt-12">
                  <Button
                    asChild
                    size="lg"
                    className="px-8 text-foreground py-6 inline-flex items-center justify-center text-lg font-bold transition-all duration-200 rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    data-field="primaryCta"
                    style={elementStyles?.["primaryCta"]}
                  >
                    <a
                      href={primaryCtaHref}
                      title={primaryCtaText}
                      className="items-center justify-center px-8 py-4 text-lg"
                    >
                      <span className="text-transparent bg-clip-text bg-background">{primaryCtaText}</span>
                    </a>
                  </Button>

                  {secondaryCtaText ? (
                    <a
                      href={secondaryCtaHref}
                      title={secondaryCtaText}
                      className="inline-flex items-center justify-center px-4 py-3 mt-4 text-lg font-bold transition-all duration-200 rounded-xl text-foreground bg-muted/40 hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:mt-0"
                      data-field="secondaryCta"
                      style={elementStyles?.["secondaryCta"]}
                    >
                      <DownloadCloud className="w-5 h-5 mr-2" />
                      {secondaryCtaText}
                    </a>
                  ) : null}
                </div>

                <div className="mt-8 lg:mt-12 lg:flex lg:items-center">
                  <div className="flex justify-center flex-shrink-0 -space-x-4 overflow-hidden lg:justify-start">
                    {avatars.map((src, idx) => (
                      <img
                        key={idx}
                        className="inline-block rounded-full w-14 h-14 ring-2 ring-background"
                        src={src}
                        alt={`Avatar ${idx + 1}`}
                        data-field={`avatar-${idx}`}
                        style={elementStyles?.[`avatar-${idx}`]}
                      />
                    ))}
                  </div>

                  <p
                    className="mt-4 text-lg text-foreground lg:mt-0 lg:ml-4"
                    data-field="teamCopy"
                    style={elementStyles?.["teamCopy"]}
                  >
                    {teamCopy}
                  </p>
                </div>
              </div>
            </div>

            <div className="xl:col-span-3">
              <img
                className="w-full mx-auto scale-110"
                src={heroImageUrl}
                alt="App illustration"
                data-field="heroImage"
                style={elementStyles?.["heroImage"]}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
