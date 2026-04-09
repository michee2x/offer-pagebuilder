"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQGridProps {
  faqs: FAQItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function FAQGrid({
  faqs,
  title = "Most asked FAQ's",
  subtitle = "We're here to help you and solve doubts. Find answers to the most common questions below.",
  className,
  elementStyles = {},
}: FAQGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className={cn(
        "w-full flex flex-col items-center justify-center py-16 px-4",
        className,
      )}
      style={elementStyles.container}
    >
      <div className="w-full max-w-5xl" style={elementStyles.content}>
        <div className="mb-10" style={elementStyles.header}>
          <h2
            className="text-3xl font-semibold text-foreground text-center md:text-start mb-4"
            style={elementStyles.title}
          >
            {title}
          </h2>
          <p
            className="text-muted-foreground max-w-104 text-sm text-center md:text-start mx-auto md:mx-0"
            style={elementStyles.subtitle}
          >
            {subtitle}
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"
          style={elementStyles.grid}
        >
          {faqs.map((faq, index) => (
            <div
              key={index}
              onClick={() => toggleFAQ(index)}
              className={cn(
                "bg-muted p-3.5 rounded-lg cursor-pointer transition-all duration-300 border border-border hover:bg-muted/80",
                openIndex === index ? "row-span-2" : "",
              )}
              style={elementStyles.faqItem}
            >
              <div
                className="flex items-center justify-between"
                style={elementStyles.questionContainer}
              >
                <span
                  className="text-sm font-medium text-foreground"
                  style={elementStyles.question}
                >
                  {faq.question}
                </span>
                <div
                  className={cn(
                    "text-muted-foreground p-1 rounded transition-colors",
                    openIndex === index
                      ? "bg-muted-foreground/20 text-muted-foreground"
                      : "hover:bg-muted-foreground/10 hover:text-muted-foreground",
                  )}
                  style={elementStyles.iconContainer}
                >
                  {openIndex === index ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-minus"
                      style={elementStyles.icon}
                    >
                      <path d="M5 12h14" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-plus"
                      style={elementStyles.icon}
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                  )}
                </div>
              </div>
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  openIndex === index
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0",
                )}
                style={elementStyles.answerContainer}
              >
                <div
                  className="overflow-hidden"
                  style={elementStyles.answerWrapper}
                >
                  <p
                    className="text-sm text-muted-foreground leading-relaxed"
                    style={elementStyles.answer}
                  >
                    {faq.answer}
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
