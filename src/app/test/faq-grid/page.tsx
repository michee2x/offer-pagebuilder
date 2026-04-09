"use client";

import React from "react";
import { FAQGrid } from "@/components/macro/FAQ";

const faqs = [
  {
    question: "What is included in the Starter plan?",
    answer:
      "The Starter plan includes access to all basic features, 5GB of storage, and email support. It's perfect for individuals and small projects.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Yes, we offer a 14-day free trial for all our plans. No credit card is required to start.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Absolutely! You can upgrade or downgrade your plan at any time from your account settings.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.",
  },
  {
    question: "How secure is my data?",
    answer:
      "We use industry-standard encryption and security protocols to ensure your data is safe and protected at all times.",
  },
  {
    question: "How does the 2% donation work?",
    answer:
      "We pledge to donate 2% of our annual revenue to environmental causes and non-profit organizations.",
  },
  {
    question: "Can I integrate this platform with other tools?",
    answer:
      "Yes, we offer seamless integration with popular tools like Slack, Trello, and Google Workspace.",
  },
  {
    question: "What makes your platform different?",
    answer:
      "Our platform is built with a focus on user experience, speed, and reliability, ensuring you get the best results with minimal effort.",
  },
];

export default function FAQGridTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <FAQGrid faqs={faqs} />
    </div>
  );
}
