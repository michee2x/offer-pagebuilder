"use client";

import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";

import { useBuilderStore } from "@/store/builderStore";

interface Props {
  pageId: string;
  pagePath?: string; // e.g. "/", "/upsell", "/downsell", "/thankyou"
}

export function AnalyticsTracker({ pageId, pagePath }: Props) {
  const ph = usePostHog();
  const trackedPath = useRef<string | null>(null);
  
  // Read from builder store to support client-side routing in preview mode.
  // Fall back to prop if store is uninitialized.
  const storePath = useBuilderStore((s) => s.activePagePath);
  const currentPath = storePath || pagePath || "/";

  useEffect(() => {
    if (!ph || trackedPath.current === currentPath) return;
    trackedPath.current = currentPath;

    const payload = { funnel_id: pageId, page_path: currentPath };
    console.log(
      "[analytics] sending funnel_page_view",
      payload,
      "token=",
      ph?.config?.token,
    );

    ph.capture("funnel_page_view", payload);
  }, [pageId, currentPath, ph]);

  return null;
}
