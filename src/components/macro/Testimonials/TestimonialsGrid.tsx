"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TestimonialItem {
  id: number;
  text: string;
  name: string;
  role: string;
  image: string;
}

export interface TestimonialsGridProps {
  testimonials: TestimonialItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function TestimonialsGrid({
  testimonials,
  title = "Our Testimonials",
  subtitle = "See what our customers are saying as they build and launch projects at lightning speed.",
  className,
  elementStyles = {},
}: TestimonialsGridProps) {
  return (
    <section
      className={cn(
        "py-16 px-4 md:px-8 flex items-center justify-center bg-background",
        className,
      )}
      style={elementStyles.section}
    >
      <div className="max-w-6xl w-full">
        <div className="mb-12" style={elementStyles.header}>
          <h1
            className="text-4xl font-medium text-foreground text-center md:text-start mb-4"
            style={elementStyles.title}
          >
            {title}
          </h1>
          <p
            className="text-muted-foreground text-sm/6 text-center md:text-start mx-auto md:mx-0 max-w-md"
            style={elementStyles.subtitle}
          >
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={cn(
                "border border-border rounded-2xl p-6 hover:border-border/80 transition-colors bg-card",
                index === 0
                  ? "md:col-span-2"
                  : index === 1
                    ? "md:col-span-1"
                    : index === 2
                      ? "md:col-span-1"
                      : "md:col-span-2",
              )}
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
                      className="lucide lucide-star text-transparent fill-[#FF8F20]"
                      aria-hidden="true"
                    >
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                    </svg>
                  ))}
              </div>

              <p
                className={cn(
                  "text-muted-foreground text-sm leading-relaxed",
                  index === 0 || index === 3 ? "max-w-xl mb-14" : "mb-8",
                )}
                style={elementStyles.text}
              >
                {testimonial.text}
              </p>

              <div
                className="flex items-center gap-3"
                style={elementStyles.author}
              >
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex flex-col gap-1">
                  <h3
                    className="text-foreground text-sm font-medium"
                    style={elementStyles.authorName}
                  >
                    {testimonial.name}
                  </h3>
                  <p
                    className="text-muted-foreground text-sm"
                    style={elementStyles.authorRole}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
