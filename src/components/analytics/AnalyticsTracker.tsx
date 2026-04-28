"use client";

import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";

interface Props {
  pageId:   string;
  pagePath?: string; // e.g. "/", "/upsell", "/downsell", "/thankyou"
}

export function AnalyticsTracker({ pageId, pagePath = "/" }: Props) {
  const ph      = usePostHog();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !ph) return;
    tracked.current = true;
    ph.capture("funnel_page_view", { funnel_id: pageId, page_path: pagePath });
    console.log("[analytics] funnel_page_view fired", { funnel_id: pageId, page_path: pagePath });
  }, [pageId, pagePath, ph]);

  return null;
}
