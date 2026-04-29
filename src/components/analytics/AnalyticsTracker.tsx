"use client";

import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";

interface Props {
  pageId: string;
  pagePath?: string; // e.g. "/", "/upsell", "/downsell", "/thankyou"
}

export function AnalyticsTracker({ pageId, pagePath = "/" }: Props) {
  const ph = usePostHog();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !ph) return;
    tracked.current = true;

    const payload = { funnel_id: pageId, page_path: pagePath };
    console.log(
      "[analytics] sending funnel_page_view",
      payload,
      "token=",
      ph?.config?.token,
    );

    ph.capture("funnel_page_view", payload);
  }, [pageId, pagePath, ph]);

  return null;
}
