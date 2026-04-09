"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TestimonialCarouselItem {
  text: string;
  name: string;
  role: string;
  image: string;
}

export interface TestimonialsCarouselProps {
  testimonials: TestimonialCarouselItem[];
  title?: string;
  subtitle?: string;
  badgeText?: string;
  className?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function TestimonialsCarousel({
  testimonials,
  title = "What people are saying",
  subtitle = "Real feedback from founders, developers and teams building production-ready products.",
  badgeText = "Loved by clients",
  className,
  elementStyles = {},
}: TestimonialsCarouselProps) {
  const rows = [
    { start: 0, end: 3, className: "animate-scroll" },
    { start: 3, end: 6, className: "animate-scroll-reverse" },
  ];

  const renderCard = (testimonial: TestimonialCarouselItem, index: number) => (
    <div
      key={index}
      className="bg-card border border-border hover:border-border/80 rounded-xl p-4 shrink-0 w-[350px] transition-colors"
      style={elementStyles.card}
    >
      <div className="flex mb-4" style={elementStyles.stars}>
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-star text-transparent fill-muted-foreground"
              aria-hidden="true"
            >
              <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
            </svg>
          ))}
      </div>
      <p
        className="text-muted-foreground text-sm mb-6"
        style={elementStyles.text}
      >
        {testimonial.text}
      </p>
      <div className="flex items-center gap-3" style={elementStyles.author}>
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-11 h-11 rounded-full object-cover"
        />
        <div>
          <p
            className="font-medium text-foreground text-sm"
            style={elementStyles.authorName}
          >
            {testimonial.name}
          </p>
          <p
            className="text-muted-foreground text-sm"
            style={elementStyles.authorRole}
          >
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section
      className={cn("bg-muted/30 py-16 px-4", className)}
      style={elementStyles.section}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8" style={elementStyles.header}>
          <div
            className="inline-block bg-muted border border-border rounded-full px-4 py-1 mb-3"
            style={elementStyles.badge}
          >
            <span className="text-xs text-muted-foreground">{badgeText}</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-medium text-foreground mb-4"
            style={elementStyles.title}
          >
            {title}
          </h2>
          <p
            className="text-muted-foreground text-sm max-w-96 mx-auto"
            style={elementStyles.subtitle}
          >
            {subtitle}
          </p>
        </div>

        <div className="space-y-6" style={elementStyles.grid}>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none"></div>

              <div className={`flex gap-6 ${row.className}`}>
                {[
                  ...testimonials.slice(row.start, row.end),
                  ...testimonials.slice(row.start, row.end),
                ].map((testimonial, index) => renderCard(testimonial, index))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          @keyframes scrollReverse {
            0% {
              transform: translateX(-50%);
            }
            100% {
              transform: translateX(0);
            }
          }
          .animate-scroll {
            animation: scroll 15s linear infinite;
          }
          .animate-scroll-reverse {
            animation: scrollReverse 15s linear infinite;
          }
        `}
      </style>
    </section>
  );
}
