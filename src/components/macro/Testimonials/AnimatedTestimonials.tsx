"use client";

import React from "react";
import {
  AnimatedTestimonials,
  type Testimonial,
} from "@/components/ui/animated-testimonials";
import { cn } from "@/lib/utils";

export interface AnimatedTestimonialsMacroProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  className?: string;
  elementStyles?: Record<string, React.CSSProperties>;
}

export function AnimatedTestimonialsMacro({
  testimonials,
  autoplay = false,
  className,
  elementStyles = {},
}: AnimatedTestimonialsMacroProps) {
  return (
    <section
      className={cn("py-16 px-4 md:px-8", className)}
      style={elementStyles.section}
    >
      <AnimatedTestimonials
        testimonials={testimonials}
        autoplay={autoplay}
        elementStyles={elementStyles}
      />
    </section>
  );
}
