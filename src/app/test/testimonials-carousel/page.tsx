"use client";

import React from "react";
import { TestimonialsCarousel } from "@/components/macro/Testimonials";

const testimonials = [
  {
    text: "PrebuiltUI helped us move faster without sacrificing design quality. The components feel production-ready.",
    name: "Cristofer Levin",
    role: "Frontend engineer",
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
  },
  {
    text: "The attention to detail in PrebuiltUI is impressive. Saved me hours of repetitive work and time. Highly recommended.",
    name: "Rohan Mehta",
    role: "Startup founder",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
  },
  {
    text: "We were able ship faster using PrebuiltUI. The consistency across components made UI feel polished.",
    name: "Jason Kim",
    role: "Product designer",
    image:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
  },
  {
    text: "PrebuiltUI feels like it was built by people who actually ship products. Components are clean and easy to use.",
    name: "Alex Turner",
    role: "Full stack developer",
    image:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60",
  },
  {
    text: "PrebuiltUI helped us maintain design consistency across multiple projects. It's now a core part of design.",
    name: "Sofia Martinez",
    role: "UX designer",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    text: "Our team productivity improved noticeably after adopting PrebuiltUI. It reduced design handoff friction.",
    name: "Daniel Wong",
    role: "UI designer",
    image:
      "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/userImage/userImage1.png",
  },
];

export default function TestimonialsCarouselTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <TestimonialsCarousel testimonials={testimonials} />
    </div>
  );
}
