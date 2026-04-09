"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface Avatar {
  src: string;
  alt: string;
}

export interface CTAWithAvatarsProps {
  avatars?: Avatar[];
  rating?: number;
  ratingText?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

const defaultAvatars: Avatar[] = [
  {
    src: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
    alt: "avatar",
  },
  {
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
    alt: "avatar",
  },
  {
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop",
    alt: "avatar",
  },
];

const StarIcon = () => (
  <svg
    width="13"
    height="12"
    viewBox="0 0 13 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.85536 0.463527C6.00504 0.00287118 6.65674 0.00287028 6.80642 0.463526L7.82681 3.60397C7.89375 3.80998 8.08572 3.94946 8.30234 3.94946H11.6044C12.0888 3.94946 12.2901 4.56926 11.8983 4.85397L9.22687 6.79486C9.05162 6.92219 8.97829 7.14787 9.04523 7.35388L10.0656 10.4943C10.2153 10.955 9.68806 11.338 9.2962 11.0533L6.62478 9.11244C6.44954 8.98512 6.21224 8.98512 6.037 9.11244L3.36558 11.0533C2.97372 11.338 2.44648 10.955 2.59616 10.4943L3.61655 7.35388C3.68349 7.14787 3.61016 6.92219 3.43491 6.79486L0.763497 4.85397C0.37164 4.56927 0.573027 3.94946 1.05739 3.94946H4.35944C4.57606 3.94946 4.76803 3.80998 4.83497 3.60397L5.85536 0.463527Z"
      fill="#FF8F20"
    />
  </svg>
);

export function CTAWithAvatars({
  avatars = defaultAvatars,
  rating = 5,
  ratingText = "Used by 12k+ developers",
  title = "Ready to try-out this app?",
  subtitle = "Your next favourite tool is just one click away.",
  buttonText = "Get Started",
  onButtonClick,
  className,
  elementStyles = {},
}: CTAWithAvatarsProps) {
  return (
    <div
      className={cn(
        "max-w-5xl py-16 md:pl-24 md:w-full mx-2 md:mx-auto flex flex-col items-start justify-center text-left bg-linear-to-b from-primary/20 to-primary/5 rounded-2xl p-10 text-foreground border border-border",
        className,
      )}
      style={elementStyles.container}
    >
      <div
        className="flex items-center"
        style={elementStyles.testimonialContainer}
      >
        <div
          className="flex -space-x-3 pr-3"
          style={elementStyles.avatarsContainer}
        >
          {avatars.map((avatar, index) => (
            <img
              key={index}
              src={avatar.src}
              alt={avatar.alt}
              className="size-8 rounded-full hover:-translate-y-px transition"
              style={{
                ...elementStyles.avatar,
                zIndex: avatars.length - index,
              }}
            />
          ))}
        </div>
        <div style={elementStyles.ratingContainer}>
          <div
            className="flex items-center gap-px"
            style={elementStyles.starsContainer}
          >
            {Array.from({ length: rating }, (_, i) => (
              <StarIcon key={i} />
            ))}
          </div>
          <p
            className="text-sm text-muted-foreground"
            style={elementStyles.ratingText}
          >
            {ratingText}
          </p>
        </div>
      </div>
      <h1
        className="text-4xl md:text-[46px] md:leading-15 font-semibold mt-5 bg-linear-to-r from-foreground to-primary text-transparent bg-clip-text"
        style={elementStyles.title}
      >
        {title}
      </h1>
      <p
        className="bg-linear-to-r from-foreground to-primary text-transparent bg-clip-text text-lg"
        style={elementStyles.subtitle}
      >
        {subtitle}
      </p>
      <button
        className="px-12 py-2.5 text-primary-foreground border border-primary bg-primary hover:bg-primary/90 transition-all rounded-full text-sm mt-4"
        onClick={onButtonClick}
        style={elementStyles.button}
      >
        {buttonText}
      </button>
    </div>
  );
}
