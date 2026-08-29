export type ChangelogTag = "new" | "improved" | "fixed";

export interface ChangelogEntry {
  id: string;
  title: string;
  date: string; // ISO format YYYY-MM-DD
  tag: ChangelogTag;
  body: React.ReactNode;
}

export const changelogData: ChangelogEntry[] = [
  {
    id: "v1-0-0",
    title: "Welcome to OfferIQ",
    date: "2026-08-29",
    tag: "new",
    body: "OfferIQ is officially live! Turn any idea into a complete, revenue-ready offer. Generate strategy, copy, funnels, and traffic plans all in one session.",
  },
  {
    id: "ai-generation-speed",
    title: "Faster AI Offer Generation",
    date: "2026-08-20",
    tag: "improved",
    body: "We've optimized our AI pipelines. Building out a full sales funnel and strategy now completes 40% faster.",
  },
];
