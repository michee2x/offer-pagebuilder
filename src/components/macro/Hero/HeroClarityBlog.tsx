"use client";

import React from "react";
import { Button } from "@/components/micro";
import { PlayCircle, Zap } from "lucide-react";

export interface HeroClarityBlogProps {
  logoUrl?: string;
  navItems?: Array<{ label: string; href: string }>;
  joinListText?: string;
  heroName: string;
  heroTopic: string;
  subheadline: string;
  primaryCtaText: string;
  primaryCtaHref?: string;
  secondaryLinkText?: string;
  secondaryLinkHref?: string;
  latestPicksTitle?: string;
  latestPicks?: Array<{ title: string; href: string; thumbnailUrl: string }>;
  authorImageUrl?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function HeroClarityBlog({
  logoUrl = "https://landingfoliocom.imgix.net/store/collection/clarity-blog/images/logo.svg",
  navItems = [
    { label: "Services", href: "#services" },
    { label: "Latest Collections", href: "#collections" },
    { label: "Blog", href: "#blog" },
  ],
  joinListText = "Join Email List",
  heroName,
  heroTopic,
  subheadline,
  primaryCtaText,
  primaryCtaHref = "#",
  secondaryLinkText,
  secondaryLinkHref = "#",
  latestPicksTitle = "Latest Picks",
  latestPicks = [],
  authorImageUrl = "https://landingfoliocom.imgix.net/store/collection/clarity-blog/images/hero/1/author.png",
  elementStyles = {},
}: HeroClarityBlogProps) {
  return (
    <div className="bg-background text-foreground">
      <header className="py-4 bg-background sm:py-5">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            <div className="flex shrink-0" data-field="logo">
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

            <div className="hidden md:flex md:items-center md:justify-center md:space-x-10">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  title={item.label}
                  className="text-xs font-bold tracking-widest uppercase text-foreground transition-all duration-200 hover:text-primary"
                  data-field={`nav-${item.label}`}
                  style={elementStyles?.[`nav-${item.label}`]}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex">
              <Button
                asChild
                size="lg"
                className="px-6"
                data-field="joinListCta"
                style={elementStyles?.["joinListCta"]}
              >
                <a
                  href="#"
                  title={joinListText}
                  className="inline-flex items-center justify-center px-6 py-2 text-base font-semibold text-muted-foreground bg-primary rounded-lg transition-all duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {joinListText}
                </a>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <section className="pt-12 bg-gradient-to-b from-muted/10 via-background to-muted/10">
        <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid max-w-md grid-cols-1 mx-auto gap-x-6 gap-y-8 lg:grid-cols-12 lg:max-w-none">
            <div className="self-center lg:col-span-4">
              <h1
                className="text-3xl font-bold text-foreground sm:text-4xl xl:text-5xl"
                data-field="headline"
              >
                Hey 👋 I am {heroName}, writing on {heroTopic}.
              </h1>

              <p
                className="mt-5 text-base font-normal leading-7 text-muted-foreground"
                data-field="subheadline"
                style={elementStyles?.["subheadline"]}
              >
                {subheadline}
              </p>

              <div className="relative inline-flex mt-9 group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-70 blur-lg transition duration-1000 group-hover:opacity-100" />

                <Button
                  asChild
                  size="lg"
                  className="relative px-8 py-3.5 font-semibold"
                  data-field="primaryCta"
                  style={elementStyles?.["primaryCta"]}
                >
                  <a
                    href={primaryCtaHref}
                    title={primaryCtaText}
                    className="inline-flex items-center justify-center px-8 py-6.5 text-base font-semibold text-muted-foreground bg-primary rounded-xl transition-all duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {primaryCtaText}
                  </a>
                </Button>
              </div>

              {secondaryLinkText ? (
                <div className="mt-6">
                  <a
                    href={secondaryLinkHref}
                    title={secondaryLinkText}
                    className="inline-flex border-primary border px-8 py-3 rounded-xl items-center text-base font-semibold text-foreground transition-all duration-200 hover:text-primary"
                    data-field="secondaryLink"
                    style={elementStyles?.["secondaryLink"]}
                  >
                    <PlayCircle className="w-5 h-5 mr-3 text-primary" />
                    {secondaryLinkText}
                  </a>
                </div>
              ) : null}
            </div>

            <div className="self-end lg:order-last lg:col-span-3">
              <div
                className="flex items-center text-xs font-bold tracking-widest uppercase text-muted-foreground"
                data-field="latestPicksLabel"
              >
                <Zap className="w-4 h-4 mr-2 text-primary" />
                {latestPicksTitle}
              </div>

              <div className="mt-6 space-y-6 lg:space-y-8">
                {latestPicks.map((item, index) => (
                  <div key={index} className="relative overflow-hidden">
                    <div className="flex items-start lg:items-center">
                      <img
                        className="object-cover w-12 h-12 rounded-lg shrink-0"
                        src={item.thumbnailUrl}
                        alt=""
                      />
                      <p className="ml-5 text-base font-bold leading-6 text-foreground">
                        <a
                          href={item.href}
                          title={item.title}
                          className="transition-colors duration-200 hover:text-primary"
                        >
                          {item.title}
                          <span
                            className="absolute inset-0"
                            aria-hidden="true"
                          />
                        </a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="self-end lg:col-span-5"
              data-field="authorImage"
              style={elementStyles?.["authorImage"]}
            >
              <img
                className="w-full mx-auto rounded-3xl"
                src={authorImageUrl}
                alt="Author"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
