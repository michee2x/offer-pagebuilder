"use client";

import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";

export function AnalyticsTracker({ pageId }: { pageId: string }) {
  const ph = usePostHog();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !ph) return;
    tracked.current = true;
    ph.capture("funnel_page_view", { funnel_id: pageId });
  }, [pageId, ph]);

  return null;
}
