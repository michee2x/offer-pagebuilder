import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OfferIQ — Turn Any Idea Into A Complete, Sellable Offer",
  description:
    "Stop guessing what to sell, what to charge, and what to say. Give OfferIQ an idea, a URL, or an existing offer — get back a full Intelligence Report, matched copy, and a live payment-ready funnel. $49 one-time.",
  openGraph: {
    title: "OfferIQ — Turn Any Idea Into A Complete, Sellable Offer",
    description:
      "Strategy, copy, live funnel, and traffic plan — in one session. Benchmarked against 35,000+ real offers. $49 one-time.",
    type: "website",
    url: "https://useofferiq.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "OfferIQ — Turn Any Idea Into A Complete, Sellable Offer",
    description:
      "Strategy, copy, live funnel, and traffic plan — in one session. $49 one-time.",
  },
};

export default function JVZooLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
