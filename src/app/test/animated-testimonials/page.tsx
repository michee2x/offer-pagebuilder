"use client";

import React from "react";
import { AnimatedTestimonialsMacro } from "@/components/macro/Testimonials/AnimatedTestimonials";

const testimonials = [
  {
    quote:
      "If you're using Tailwind CSS, PrebuiltUI is a must have. It dramatically speeds up development while keeping the UI clean and modern.",
    name: "Alex Morgan",
    designation: "Founder - Lumens",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
  },
  {
    quote:
      "PrebuiltUI has completely changed how I build interfaces. Most recommended components and templates.",
    name: "Sarah Collins",
    designation: "Tech Lead - You Inc.",
    src: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
  },
  {
    quote:
      "PrebuiltUI templates are the most useful product for UI engineers. Saving me hours on every saas project.",
    name: "Emily Carter",
    designation: "UI Engineer - Meta",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
  },
  {
    quote:
      "PrebuiltUI allows me to focus on building features instead of writing CSS. Everything looks premium right out of the box.",
    name: "Ryan Collins",
    designation: "Co-founder - Unique",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
  },
];

export default function AnimatedTestimonialsTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedTestimonialsMacro testimonials={testimonials} autoplay={true} />
    </div>
  );
}
