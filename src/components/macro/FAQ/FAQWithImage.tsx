"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQWithImageProps {
  faqs: FAQItem[];
  title?: string;
  subtitle?: string;
  badgeText?: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function FAQWithImage({
  faqs,
  title = "Looking for answer?",
  subtitle = "Ship Beautiful Frontends Without the Overhead — Customizable, Scalable and Developer-Friendly UI Components.",
  badgeText = "FAQ's",
  imageSrc = "https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&w=830&h=844&auto=format&fit=crop",
  imageAlt = "",
  className,
  elementStyles = {},
}: FAQWithImageProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "max-w-4xl mx-auto flex flex-col md:flex-row items-start justify-center gap-8 px-4 md:px-0",
        className,
      )}
      style={elementStyles.container}
    >
      <img
        className="max-w-sm w-full rounded-xl h-auto"
        src={imageSrc}
        alt={imageAlt}
        style={elementStyles.image}
      />
      <div className="flex-1" style={elementStyles.content}>
        <p
          className="text-primary text-sm font-medium"
          style={elementStyles.badge}
        >
          {badgeText}
        </p>
        <h1
          className="text-3xl font-semibold text-foreground"
          style={elementStyles.title}
        >
          {title}
        </h1>
        <p
          className="text-sm text-muted-foreground mt-2 pb-4"
          style={elementStyles.subtitle}
        >
          {subtitle}
        </p>
        {faqs.map((faq, index) => (
          <div
            className="border-b border-border py-4 cursor-pointer"
            key={index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            style={elementStyles.faqItem}
          >
            <div
              className="flex items-center justify-between"
              style={elementStyles.questionContainer}
            >
              <h3
                className="text-base font-medium text-foreground"
                style={elementStyles.question}
              >
                {faq.question}
              </h3>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(
                  "transition-all duration-500 ease-in-out",
                  openIndex === index ? "rotate-180" : "",
                )}
                style={elementStyles.arrow}
              >
                <path
                  d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                />
              </svg>
            </div>
            <p
              className={cn(
                "text-sm text-muted-foreground transition-all duration-500 ease-in-out max-w-md",
                openIndex === index
                  ? "opacity-100 max-h-[300px] translate-y-0 pt-4"
                  : "opacity-0 max-h-0 -translate-y-2",
              )}
              style={elementStyles.answer}
            >
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
