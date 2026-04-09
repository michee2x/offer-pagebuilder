"use client";

import React from "react";
import { Button } from "@/components/micro";

export interface HeroWithFormProps {
  logoUrl?: string;
  navItems?: Array<{ label: string; href: string }>;
  ctaButtonText?: string;
  headline: string;
  subheadline: string;
  emailPlaceholder?: string;
  emailCta?: string;
  stats?: Array<{ number: string; label: string }>;
  heroImageUrl?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function HeroWithForm({
  logoUrl = "https://d33wubrfki0l68.cloudfront.net/682a555ec15382f2c6e7457ca1ef48d8dbb179ac/f8cd3/images/logo.svg",
  navItems = [],
  ctaButtonText,
  headline,
  subheadline,
  emailPlaceholder = "Enter email address",
  emailCta = "Get Free Blueprint",
  stats = [
    { number: "2943", label: "Cards\nDelivered" },
    { number: "$1M+", label: "Transaction\nCompleted" },
  ],
  heroImageUrl = "https://d33wubrfki0l68.cloudfront.net/d6f1462500f7670e0db6b76b35054a081679a5a0/0ce15/images/hero/5.1/illustration.png",
  elementStyles = {},
}: HeroWithFormProps) {
  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="py-4 md:py-6 border-b border-border">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a
                href="#"
                title="Home"
                className="flex rounded outline-none focus:ring-1 focus:ring-primary focus:ring-offset-2"
                data-field="logo"
              >
                <img
                  className="w-auto h-8"
                  src={logoUrl}
                  alt="Logo"
                  style={elementStyles?.["logo"]}
                />
              </a>
            </div>

            {/* Mobile Menu Button */}
            {navItems.length > 0 && (
              <div className="flex lg:hidden">
                <button
                  type="button"
                  className="text-foreground hover:text-primary transition-colors"
                  aria-label="Toggle menu"
                >
                  <svg
                    className="w-7 h-7"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Desktop Navigation */}
            {navItems.length > 0 && (
              <div className="hidden lg:flex lg:ml-10 xl:ml-16 lg:items-center lg:justify-center lg:space-x-8 xl:space-x-16">
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
            )}

            {/* Desktop Actions */}
            <div className="hidden lg:ml-auto lg:flex lg:items-center lg:space-x-8 xl:space-x-10">
              {ctaButtonText && (
                <Button
                  size="lg"
                  className="px-6 font-bold"
                  data-field="headerCta"
                  style={elementStyles?.["headerCta"]}
                >
                  {ctaButtonText}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-12 sm:pb-16 lg:pt-8">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid max-w-lg grid-cols-1 mx-auto lg:max-w-full lg:items-center lg:grid-cols-2 gap-y-12 lg:gap-x-16">
            {/* Left Content */}
            <div>
              <div className="text-center lg:text-left">
                {/* Headline */}
                <h1
                  className="text-4xl font-bold leading-tight text-foreground sm:text-5xl sm:leading-tight lg:leading-tight lg:text-6xl"
                  data-field="headline"
                  style={elementStyles?.["headline"]}
                >
                  {headline}
                </h1>

                {/* Subheadline */}
                <p
                  className="mt-2 text-lg text-muted-foreground sm:mt-8"
                  data-field="subheadline"
                  style={elementStyles?.["subheadline"]}
                >
                  {subheadline}
                </p>

                {/* Email Form */}
                <form
                  action="#"
                  method="POST"
                  className="mt-8 sm:mt-10"
                  data-field="emailForm"
                  style={elementStyles?.["emailForm"]}
                >
                  <div className="relative p-2 sm:border sm:border-border bg-card group sm:rounded-xl sm:focus-within:ring-1 sm:focus-within:ring-primary sm:focus-within:border-primary">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder={emailPlaceholder}
                      className="block w-full px-4 py-4 text-foreground placeholder-muted-foreground bg-transparent border border-border outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-xl sm:border-none sm:focus:ring-0 sm:focus:border-transparent"
                      required
                      data-field="emailInput"
                      style={elementStyles?.["emailInput"]}
                    />
                    <div className="mt-4 sm:mt-0 sm:absolute sm:inset-y-0 sm:right-0 sm:flex sm:items-center sm:pr-2">
                      <Button
                        type="submit"
                        size="lg"
                        className="inline-flex px-8 font-bold"
                        data-field="emailCta"
                        style={elementStyles?.["emailCta"]}
                      >
                        {emailCta}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Stats Section */}
              {stats.length > 0 && (
                <div
                  className="flex flex-col sm:flex-row items-center justify-center mt-10 space-y-6 sm:space-y-0 sm:space-x-6 lg:justify-start sm:space-x-8"
                  data-field="stats"
                  style={elementStyles?.["stats"]}
                >
                  {stats.map((stat, idx) => (
                    <React.Fragment key={idx}>
                      <div
                        className="flex items-center"
                        data-field={`stat-${idx}`}
                        style={elementStyles?.[`stat-${idx}`]}
                      >
                        <p
                          className="text-3xl font-bold text-foreground sm:text-4xl"
                          data-field={`stat-number-${idx}`}
                        >
                          {stat.number}
                        </p>
                        <p className="ml-3 text-sm text-muted-foreground font-medium whitespace-pre-line">
                          {stat.label}
                        </p>
                      </div>

                      {idx < stats.length - 1 && (
                        <div className="hidden sm:block">
                          <svg
                            className="text-muted-foreground/40"
                            width="16"
                            height="39"
                            viewBox="0 0 16 39"
                            fill="none"
                            stroke="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <line
                              x1="0.72265"
                              y1="10.584"
                              x2="15.7226"
                              y2="0.583975"
                            />
                            <line
                              x1="0.72265"
                              y1="17.584"
                              x2="15.7226"
                              y2="7.58398"
                            />
                            <line
                              x1="0.72265"
                              y1="24.584"
                              x2="15.7226"
                              y2="14.584"
                            />
                            <line
                              x1="0.72265"
                              y1="31.584"
                              x2="15.7226"
                              y2="21.584"
                            />
                            <line
                              x1="0.72265"
                              y1="38.584"
                              x2="15.7226"
                              y2="28.584"
                            />
                          </svg>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Right Image */}
            <div data-field="heroImage" style={elementStyles?.["heroImage"]}>
              <img
                className="w-full rounded-lg shadow-lg"
                src={heroImageUrl}
                alt="Hero visualization"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
