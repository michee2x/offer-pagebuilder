"use client";

import { useEffect } from "react";

export default function ClientDownloadRedirect({
  funnelId,
}: {
  funnelId?: string;
}) {
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const fileId = sp.get("fileId") || sp.get("id") || sp.get("file");
      if (!fileId) return;

      // If funnelId prop is missing or the string 'undefined', try to parse it from the path
      let resolvedFunnelId = funnelId;
      if (!resolvedFunnelId || resolvedFunnelId === "undefined") {
        const m = window.location.pathname.match(/\/funnels\/([^/]+)\//i);
        if (m && m[1]) resolvedFunnelId = decodeURIComponent(m[1]);
      }

      if (!resolvedFunnelId) {
        console.warn(
          "ClientDownloadRedirect: no funnelId available in prop or path",
        );
        return;
      }

      const url = `/api/blueprints/download?funnelId=${encodeURIComponent(
        resolvedFunnelId,
      )}&fileId=${encodeURIComponent(fileId)}`;
      window.location.href = url;
    } catch (e) {
      console.error("ClientDownloadRedirect error:", e);
    }
  }, [funnelId]);

  return null;
}
