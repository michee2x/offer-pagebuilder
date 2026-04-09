"use client";

import React from "react";
import { TestimonialsGrid } from "@/components/macro/Testimonials";

const testimonials = [
  {
    id: 1,
    text: "If you're using Tailwind CSS, PrebuiltUI is a must have. It dramatically speeds up development while keeping the UI clean and modern.",
    name: "Alex Morgan",
    role: "Founder - Lumens",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
  },
  {
    id: 2,
    text: "PrebuiltUI has completely changed how I build interfaces. Most recommended components and templates.",
    name: "Sarah Collins",
    role: "Tech Lead - You Inc.",
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
  },
  {
    id: 3,
    text: "PrebuiltUI templates are the most useful product for UI engineers. Saving me hours on every saas project.",
    name: "Emily Carter",
    role: "UI Engineer - Meta",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
  },
  {
    id: 4,
    text: "PrebuiltUI allows me to focus on building features instead of writing CSS. Everything looks premium right out of the box.",
    name: "Ryan Collins",
    role: "Co-founder - Unique",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
  },
];

export default function TestimonialsGridTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <TestimonialsGrid testimonials={testimonials} />
    </div>
  );
}
