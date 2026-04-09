"use client";

import React from "react";
import { TestimonialsCards } from "@/components/macro/Testimonials";

const testimonials = [
  {
    id: 1,
    text: "Radiant made undercutting all of our competitors an absolute breeze.",
    name: "Richard Nelson",
    role: "CTO, Slack",
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
  },
  {
    id: 2,
    text: "This platform helped us launch our product twice as fast as expected.",
    name: "Ava Johnson",
    role: "Product Manager",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
  },
  {
    id: 3,
    text: "Incredible support and a fantastic experience from start to finish.",
    name: "Liam Carter",
    role: "CEO, BrightTech",
    image:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
  },
  {
    id: 4,
    text: "Our team's productivity skyrocketed after switching to this solution.",
    name: "Sophia Lee",
    role: "Engineering Lead",
    image:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60",
  },
  {
    id: 5,
    text: "A seamless integration that saved us countless developer hours.",
    name: "Noah Patel",
    role: "CTO, DevWorks",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    id: 6,
    text: "The user experience is outstanding and setup was a breeze.",
    name: "Oliver Brooks",
    role: "Marketing Director",
    image:
      "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/userImage/userImage1.png",
  },
];

export default function TestimonialsCardsTestPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <TestimonialsCards testimonials={testimonials} />
    </div>
  );
}
