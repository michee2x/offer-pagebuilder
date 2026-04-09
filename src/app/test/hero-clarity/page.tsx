"use client";

import React from "react";
import { HeroClarityBlog } from "@/components/macro/Hero";

const latestPicks = [
  {
    title: "How a visual artist redefines success in graphic design",
    href: "#",
    thumbnailUrl:
      "https://landingfoliocom.imgix.net/store/collection/clarity-blog/images/hero/1/thumbnail-1.png",
  },
  {
    title: "How a visual artist redefines success in graphic design",
    href: "#",
    thumbnailUrl:
      "https://landingfoliocom.imgix.net/store/collection/clarity-blog/images/hero/1/thumbnail-2.png",
  },
  {
    title: "How a visual artist redefines success in graphic design",
    href: "#",
    thumbnailUrl:
      "https://landingfoliocom.imgix.net/store/collection/clarity-blog/images/hero/1/thumbnail-3.png",
  },
];

export default function HeroClarityTestPage() {
  return (
    <HeroClarityBlog
      heroName="Brian Jones"
      heroTopic="NFTs"
      subheadline="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vehicula massa in enim luctus."
      primaryCtaText="Read Exclusive Blog"
      primaryCtaHref="#read"
      secondaryLinkText="Watch video"
      secondaryLinkHref="#watch"
      latestPicks={latestPicks}
      authorImageUrl="https://landingfoliocom.imgix.net/store/collection/clarity-blog/images/hero/1/author.png"
    />
  );
}
