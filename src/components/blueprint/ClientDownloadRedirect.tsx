"use client";

import { useEffect, useRef } from "react";

export default function ClientDownloadRedirect({
  funnelId,
  downloadUrl,
}: {
  funnelId?: string;
  downloadUrl?: string;
}) {
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    try {
      if (downloadUrl) {
        window.location.href = downloadUrl;
        return;
      }

      // Fallback
      const sp = new URLSearchParams(window.location.search);
      const fileId = sp.get("fileId") || sp.get("id") || sp.get("file");
      if (!fileId) return;

      let resolvedFunnelId = funnelId;
      if (!resolvedFunnelId || resolvedFunnelId === "undefined") {
        const m = window.location.pathname.match(/\/funnels\/([^/]+)\//i);
        if (m && m[1]) resolvedFunnelId = decodeURIComponent(m[1]);
      }

      if (!resolvedFunnelId) return;

      const url = `/api/blueprints/download?funnelId=${encodeURIComponent(
        resolvedFunnelId,
      )}&fileId=${encodeURIComponent(fileId)}`;
      window.location.href = url;
    } catch (e) {
      console.error("ClientDownloadRedirect error:", e);
    }
  }, [funnelId, downloadUrl]);

  return null;
}
