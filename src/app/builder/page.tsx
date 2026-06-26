"use client";

import React from "react";
import { Canvas } from "@/components/builder/Canvas";
import { SectionLibraryModal } from "@/components/builder/SectionLibraryModal";
import { AiStreamBoard } from "@/components/builder/AiStreamBoard";
import { OfferIQAgent } from '@/components/OfferIQAgent';
import { useBuilderStore } from "@/store/builderStore";
import {
  Wand2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Check,
  Undo2,
  Redo2,
  Globe,
  Save,
  Edit2,
  Sparkles,
  ArrowRight,
  Lock,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { LeftPanel } from "@/components/builder/LeftPanel";
import { convertDesignIntelligenceToTheme } from "@/lib/themes";

export default function BuilderPage() {
  const {
    setFullState,
    components,
    rootList,
    canvasStyle,
    deviceMode,
    setDeviceMode,
    isPreviewMode,
    setIsPreviewMode,
    pageId,
    setPageId,
    theme,
    setTheme,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    pages,
    activePagePath,
    funnelName,
    setFunnelName,
    undo,
    redo,
    past,
    future,
  } = useBuilderStore();
  const updateCode = useBuilderStore((s) => s.updateCode);
  const [isSaving, setIsSaving] = React.useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<"saved" | "saving" | "idle">("idle");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [streamText, setStreamText] = React.useState("");
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [, setPublishedUrl] = React.useState<string | null>(null);
  const [hasIntelligence, setHasIntelligence] = React.useState(false);
  const [hasCopy, setHasCopy] = React.useState<boolean | null>(null);
  const autoGenAttempted = React.useRef(false);

  // We need handleGeneratePage in scope for the useEffect, but it's defined later.
  // Instead of moving the huge function, we can just call it via a ref or wait.
  // Wait, if we just move handleGeneratePage up, it's huge.
  // Let's use a smaller function to trigger generation.
  // We can just set a state `triggerAutoGen` and watch for it further down.
  const [triggerAutoGen, setTriggerAutoGen] = React.useState(false);

  React.useEffect(() => {
    if (initialLoading || isGenerating || autoGenAttempted.current) return;
    if (typeof window !== "undefined") {
      const qs = new URLSearchParams(window.location.search);
      if (qs.get("autoGen") === "true") {
        autoGenAttempted.current = true;
        const url = new URL(window.location.href);
        url.searchParams.delete("autoGen");
        window.history.replaceState({}, "", url.toString());
        
        // Wait a small tick so the UI can settle
        setTimeout(() => {
          setTriggerAutoGen(true);
        }, 300);
      }
    }
  }, [initialLoading, isGenerating]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const qs = new URLSearchParams(window.location.search);
      const editId = qs.get("id");

      if (editId) {
        fetch(`/api/pages/${editId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.page && data.page.blocks) {
              setPageId(data.page.id);
              if (data.page.name) setFunnelName(data.page.name);
              const blocks = data.page.blocks;
              
              // Validate Copy Presence
              const copyData = blocks.copy;
              const hasCopyGenerated = !!(copyData && (blocks.copy_complete || copyData.lead_capture?.markdown || copyData.sales_page?.markdown));
              setHasCopy(hasCopyGenerated);

              let loadedPages = blocks.pages;
              if (blocks.generation?.status === "generating") {
                // Check if the generation is stale (>5 min) — treat as failed
                const STALE_MS = 5 * 60 * 1000;
                const genUpdated = blocks.generation?.updatedAt;
                const elapsed = genUpdated ? Date.now() - new Date(genUpdated).getTime() : Infinity;
                if (elapsed > STALE_MS) {
                  console.warn("[client] Stale generation detected on load (", Math.round(elapsed / 1000), "s old). Not entering polling mode.");
                  // Don't set isGenerating — let user retry manually
                } else {
                  setIsGenerating(true);
                }
              }
              if (!loadedPages) {
                loadedPages = {
                  "/": {
                    name: "Lead Capture",
                    path: "/",
                    components: blocks.components || {},
                    rootList: blocks.rootList || [],
                  },
                };
              }
              const defaultPages = {
                "/": {
                  name: "Sales Page",
                  path: "/",
                  components: {},
                  rootList: [],
                },
                "/upsell": {
                  name: "Upsell",
                  path: "/upsell",
                  components: {},
                  rootList: [],
                },
                "/downsell": {
                  name: "Downsell",
                  path: "/downsell",
                  components: {},
                  rootList: [],
                },
                "/thankyou": {
                  name: "Thank You",
                  path: "/thankyou",
                  components: {},
                  rootList: [],
                },
              };
              loadedPages = { ...defaultPages, ...loadedPages };

              if (blocks.intelligence?.call1_complete) {
                setHasIntelligence(true);
              }

              const initialPage =
                loadedPages["/"] || Object.values(loadedPages)[0];
              setFullState(
                initialPage.components,
                initialPage.rootList,
                loadedPages,
                initialPage.path,
              );
              if (blocks.canvasStyle) {
                useBuilderStore.setState({ canvasStyle: blocks.canvasStyle });
              }
              const designIntelRaw = blocks.intelligence?.call1?.DESIGN_INTELLIGENCE_RECOMMENDATION;
              let activeTheme = null;
              if (designIntelRaw) {
                try {
                  const parsedIntel = typeof designIntelRaw === 'string' ? JSON.parse(designIntelRaw) : designIntelRaw;
                  if (parsedIntel && parsedIntel.colors && parsedIntel.typography) {
                    activeTheme = convertDesignIntelligenceToTheme(parsedIntel);
                  }
                } catch (e) {
                  console.warn("Failed to parse design intelligence theme:", e);
                }
              }
              if (activeTheme) {
                setTheme(activeTheme);
              } else if (data.page.blocks.theme) {
                setTheme(data.page.blocks.theme);
              }
              if (data.page.custom_domain) {
                setPublishedUrl(`https://${data.page.custom_domain}`);
              } else if (data.page.subdomain) {
                const isLocal =
                  window.location.hostname === "localhost" ||
                  window.location.hostname === "127.0.0.1";
                const proto = isLocal ? "http://" : "https://";
                const base = isLocal ? window.location.host : "ofiq.app";
                setPublishedUrl(`${proto}${data.page.subdomain}.${base}`);
              } else {
                setPublishedUrl(null);
              }
            }
          })
          .catch((err) => {
            console.error("Failed to fetch page:", err);
            setHasCopy(false);
          })
          .finally(() => setInitialLoading(false));
      } else {
        // Reset store for Create New Mode
        setPageId(null);
        setFullState(
          {},
          [],
          {
            "/": {
              name: "Lead Capture",
              path: "/",
              components: {},
              rootList: [],
            },
          },
          "/",
        );
        useBuilderStore.setState({ canvasStyle: {} });
        setHasCopy(true); // default true for blank drafts
        setInitialLoading(false);
      }
    }
  }, [setPageId, setFullState, setFunnelName, setTheme, setInitialLoading]);

  React.useEffect(() => {
    if (!pageId || !isGenerating) return;

    let isSubscribed = true;
    const POLL_TIMEOUT_MS = 6 * 60 * 1000; // 6 minute max polling
    const pollStartTime = Date.now();

    const interval = setInterval(async () => {
      // Timeout guard — stop polling after 6 minutes
      if (Date.now() - pollStartTime > POLL_TIMEOUT_MS) {
        console.warn("[client] Polling timeout reached (6 min). Stopping.");
        clearInterval(interval);
        setIsGenerating(false);
        toast.dismiss();
        toast.error("Generation timed out. Please try again.");
        return;
      }

      try {
        const res = await fetch("/api/pages/" + pageId);
        if (!res.ok) return;
        const data = await res.json();

        if (!isSubscribed) return;

        const generation = data.page?.blocks?.generation;
        if (generation) {
          if (generation.status === "completed") {
            clearInterval(interval);
            const loadedPages = data.page.blocks.pages;
            if (loadedPages) {
              const defaultPages = {
                "/": { name: "Lead Capture", path: "/", components: {}, rootList: [] },
                "/sales": { name: "Sales Page", path: "/sales", components: {}, rootList: [] },
                "/upsell": { name: "Upsell", path: "/upsell", components: {}, rootList: [] },
                "/downsell": { name: "Downsell", path: "/downsell", components: {}, rootList: [] },
                "/thankyou": { name: "Thank You", path: "/thankyou", components: {}, rootList: [] },
              };
              const mergedPages = { ...defaultPages, ...loadedPages };
              const initialPage = mergedPages["/"] || Object.values(mergedPages)[0];

              setFullState(
                initialPage.components || {},
                initialPage.rootList || [],
                mergedPages,
                initialPage.path
              );
              if (data.page.blocks.canvasStyle) {
                useBuilderStore.setState({ canvasStyle: data.page.blocks.canvasStyle });
              }
              if (data.page.blocks.theme) {
                setTheme(data.page.blocks.theme);
              }
              setHasUnsavedChanges(false);
            }
            setIsGenerating(false);
            toast.dismiss();
            toast.success("AI Funnel generation completed successfully!");
          } else if (generation.status === "failed") {
            clearInterval(interval);
            setIsGenerating(false);
            toast.dismiss();
            toast.error(generation.error || "Generation failed on the server.");
          }
        }
      } catch (err) {
        console.error("Error polling generation status:", err);
      }
    }, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [pageId, isGenerating, setFullState, setTheme, setHasUnsavedChanges]);

  // ── Debounced autosave ───────────────────────────────────────────────────────

  React.useEffect(() => {
    if (!hasUnsavedChanges || !pageId || isGenerating || isSaving) return;
    const timer = setTimeout(async () => {
      setAutoSaveStatus("saving");
      try {
        const payload: any = {
          name: funnelName,
          components,
          rootList,
          canvasStyle,
          theme,
          pages: {
            ...pages,
            [activePagePath]: { ...pages[activePagePath], components, rootList },
          },
          pageId,
        };
        const res = await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setHasUnsavedChanges(false);
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
        } else {
          setAutoSaveStatus("idle");
        }
      } catch {
        setAutoSaveStatus("idle");
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, pageId, isGenerating, isSaving, funnelName, components, rootList, canvasStyle, theme, pages, activePagePath, setHasUnsavedChanges]);

  // No more DND sensors or event handlers needed

  const _autoSaveGeneratedPages = async (newPagesList: Record<string, any>, initialPage: any) => {
    try {
      setIsSaving(true);
      toast.loading("Saving draft to database...");

      const payload: any = {
        name: funnelName,
        components: initialPage.components || {},
        rootList: initialPage.rootList || [],
        canvasStyle,
        theme,
        pages: newPagesList,
      };
      if (pageId) payload.pageId = pageId;

      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (_parseError) {
        throw new Error(`Server error (${res.status}): Payload might be too large, or server crashed. ${text.substring(0, 50)}...`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to auto-save");
      }

      toast.dismiss();

      if (data.custom_domain || data.subdomain) {
        const isLocal =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";
        const proto = isLocal ? "http://" : "https://";
        const base = isLocal ? window.location.host : "ofiq.app";

        if (data.custom_domain) {
          setPublishedUrl(`https://${data.custom_domain}`);
        } else {
          setPublishedUrl(`${proto}${data.subdomain}.${base}`);
        }
      }
      if (data.pageId && data.pageId !== pageId) {
        setPageId(data.pageId);
        window.history.replaceState(null, "", "?id=" + data.pageId);
      }

      setHasUnsavedChanges(false);
      toast.success("Funnel saved and synced to database successfully!");
    } catch (e: any) {
      toast.dismiss();
      console.error("[client] Auto-save error:", e);
      toast.error("Pages rendered, but auto-save failed: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const createInitialDraft = async () => {
    toast.loading("Initializing new funnel draft...");
    const payload = {
      name: funnelName || "Untitled Funnel",
      components: {},
      rootList: [],
      canvasStyle: {},
      theme: theme || "light",
      pages: {
        "/": {
          name: "Lead Capture",
          path: "/",
          components: {},
          rootList: [],
        },
      },
    };

    const res = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Failed to parse init response: " + text);
    }

    if (!res.ok) {
      throw new Error(data.error || "Failed to initialize draft");
    }

    if (!data.pageId) {
      throw new Error("No pageId returned from publish endpoint");
    }

    setPageId(data.pageId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "?id=" + data.pageId);
    }
    toast.dismiss();
    return data.pageId;
  };

  const handleGeneratePage = async () => {
    let startedStream = false;
    try {
      setIsGenerating(true);

      let activeId = pageId;
      if (!activeId) {
        activeId = await createInitialDraft();
      }

      toast.info("Generating page from content doc...");

      const qs = new URLSearchParams(window.location.search);
      const offerContext = {
        niche: qs.get("niche"),
        audience: qs.get("audience"),
        tone: qs.get("tone"),
        productType: qs.get("productType"),
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerContext, funnelId: activeId }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text();
        let errMsg = "Failed to generate";
        try {
          errMsg = JSON.parse(errText).error || errMsg;
        } catch (e) {
          errMsg = `Server error (${res.status}): ${errText.substring(0, 50)}...`;
        }
        throw new Error(errMsg);
      }

      startedStream = true;
      setStreamText(""); // Reset visual stream board

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let sseBuffer = "";
      let rawSseText = "";
      let accumulatedText = "";
      let thinkingText = "";

      const processEventChunk = (chunk: string) => {
        const lines = chunk.split(/\r?\n/);
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const rawPayload = line.slice(5).trim();
          if (!rawPayload) continue;

          try {
            const event = JSON.parse(rawPayload);
            if (event.type === "text-delta") {
              // Accumulate text deltas incrementally as they arrive
              accumulatedText += String(event.data || "");
            } else if (event.type === "thinking") {
              thinkingText = String(event.data || "").trim();
              setStreamText(thinkingText);
            } else if (event.type === "complete") {
              // Complete event contains full text — only use if we haven't
              // accumulated anything from text-delta (backward compat)
              if (!accumulatedText.trim()) {
                accumulatedText = String(event.data || "");
              }
            } else if (event.type === "error") {
              console.error(
                "[client] Received generation error event:",
                event.data,
              );
            }
          } catch (eventParseError) {
            console.warn(
              "[client] Failed to parse SSE event payload:",
              eventParseError,
              "payload:",
              rawPayload,
            );
          }
        }
      };

      // Stream processor loop
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          rawSseText += chunk;
          sseBuffer += chunk;

          let boundaryIndex;
          while ((boundaryIndex = sseBuffer.indexOf("\n\n")) !== -1) {
            const eventChunk = sseBuffer.slice(0, boundaryIndex);
            sseBuffer = sseBuffer.slice(boundaryIndex + 2);
            processEventChunk(eventChunk);
          }
        }
      }

      if (sseBuffer.trim()) {
        processEventChunk(sseBuffer);
      }

      if (!accumulatedText.trim() && rawSseText.trim()) {
        // fallback: parse events from the complete raw SSE body if incremental parsing missed something
        const eventRegex = /^data:\s*({[\s\S]*?})$/gm;
        let match;
        while ((match = eventRegex.exec(rawSseText)) !== null) {
          try {
            const event = JSON.parse(match[1]);
            if (event.type === "text-delta") {
              accumulatedText += String(event.data || "");
            } else if (event.type === "thinking") {
              thinkingText = String(event.data || "").trim();
              setStreamText(thinkingText);
            } else if (event.type === "complete") {
              if (!accumulatedText.trim()) {
                accumulatedText = String(event.data || "");
              }
            }
          } catch (eventParseError) {
            console.warn(
              "[client] Fallback SSE event parse failed:",
              eventParseError,
              "payload:",
              match[1],
            );
          }
        }
      }

      // Generation finished, parse the XML <page> blocks out
      const newPages: Record<string, any> = {};
      const pageRegex = /<page\s+([^>]+)>([\s\S]*?)(?:<\/page>|$)/g;
      let match;
      let pageCount = 0;

      while ((match = pageRegex.exec(accumulatedText)) !== null) {
        const attrs = match[1];
        const pathMatch = attrs.match(/path=["']([^"']+)["']/i);
        const nameMatch = attrs.match(/name=["']([^"']+)["']/i);
        
        const path = pathMatch ? pathMatch[1] : `/${pageCount}`;
        const name = nameMatch ? nameMatch[1] : `Page ${pageCount + 1}`;
        let code = match[2].trim();
        
        // Strip markdown code block wrappers if the AI included them inside the page tags
        code = code.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
        // Remove rogue jsx literal string wrappers if hallucinated
        if (code.startsWith("{`")) {
          code = code.replace(/^{`\n?/, '').replace(/\n?`}$/, '').trim();
        }

        newPages[path] = {
          name,
          path,
          components: {},
          rootList: [],
          code,
        };
        pageCount++;
      }

      // Fallback: If no <page> tags were found, assume the AI just output TSX code directly
      if (pageCount === 0 && accumulatedText.trim()) {
        let code = accumulatedText.trim();
        
        // Extract code from inside markdown blocks if present, to avoid conversational filler text
        const codeBlockMatch = code.match(/```(?:tsx|jsx|js|ts)?\n([\s\S]*?)\n```/i);
        if (codeBlockMatch) {
          code = codeBlockMatch[1].trim();
        } else {
          // No markdown block found, just trim and hope there's no filler
          code = code.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
        }
        
        if (code.includes('import ') || code.includes('export default')) {
          newPages["/"] = {
            name: "Lead Capture",
            path: "/",
            components: {},
            rootList: [],
            code,
          };
          pageCount = 1;
          console.warn("[client] Fallback: parsed entire response as single page code");
        }
      }

      if (pageCount === 0) {
        console.error("[client] No <page> blocks matched. Raw output:", accumulatedText.substring(0, 1000));
        throw new Error("Failed to find any valid generated pages in the stream.");
      }

      const initialPage = newPages["/"] || Object.values(newPages)[0];
      console.log("[client] Processed newPages from XML stream:", newPages);
      
      // 0. Instant Backup to localStorage before any network/render issues
      try {
        localStorage.setItem("ofiq_generation_backup", JSON.stringify({ newPages, timestamp: Date.now() }));
      } catch (backupErr) {
        console.warn("Failed to backup to localStorage", backupErr);
      }

      // 1. Set local Zustand state to hot-render the pages inside the visual canvas!
      console.log("[client] Setting initialPage:", initialPage);
      setFullState(
        initialPage.components || {},
        initialPage.rootList || [],
        newPages,
        initialPage.path,
      );
      setHasUnsavedChanges(false);
      setIsGenerating(false);
      setStreamText("");
    } catch (e: any) {
      if (startedStream) {
        console.warn("[client] Stream reading interrupted, but generation is continuing on the server. Polling for results...");
        toast.info("Connection interrupted. Still generating in the background...");
      } else {
        toast.error(e.message);
        setIsGenerating(false);
        setStreamText("");
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      toast.loading("Saving draft...");

      const payload: any = {
        name: funnelName,
        components,
        rootList,
        canvasStyle,
        theme,
        pages: {
          ...pages,
          [activePagePath]: { ...pages[activePagePath], components, rootList },
        },
      };
      if (pageId) payload.pageId = pageId;

      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (_parseError) {
        throw new Error(`Server error (${res.status}): Payload might be too large, or server crashed. ${text.substring(0, 50)}...`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }

      toast.dismiss();

      // We only update published URL if the publish endpoint returns them,
      // otherwise it remains what it was (maybe they configured it on Deploy page)
      if (data.custom_domain || data.subdomain) {
        const isLocal =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";
        const proto = isLocal ? "http://" : "https://";
        const base = isLocal ? window.location.host : "ofiq.app";

        if (data.custom_domain) {
          setPublishedUrl(`https://${data.custom_domain}`);
        } else {
          setPublishedUrl(`${proto}${data.subdomain}.${base}`);
        }
      }
      setHasUnsavedChanges(false);

      if (data.pageId && data.pageId !== pageId) {
        setPageId(data.pageId);
        window.history.replaceState(null, "", "?id=" + data.pageId);
      }

      toast.success("Saved successfully!");
    } catch (e: any) {
      toast.dismiss();
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    if (triggerAutoGen) {
      setTriggerAutoGen(false);
      handleGeneratePage().catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerAutoGen]);

  if (initialLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }

  if (hasCopy === false) {
    const editId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("id") : null;
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f7f8fc] dark:bg-[#0a0a14] relative overflow-hidden font-sans">
        {/* Decorative Glow Blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#6c63ff]/10 blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full mx-4 p-8 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl relative z-10 text-center flex flex-col items-center">
          {/* Visual Indicator / Icon */}
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary ring-8 ring-primary/5 animate-pulse">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3 font-display">
            Sales Copy Required
          </h2>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            To build a high-converting funnel, our AI Page Builder requires your generated sales copy first. This ensures all visual sections, feature cards, and images map perfectly to your marketing messages.
          </p>

          <div className="w-full rounded-xl bg-muted/40 p-4 border border-border/30 text-left space-y-3 mb-8">
            <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
              <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Verbatim copywriting mapping (zero placeholders)</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
              <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>UI layouts custom-tailored to your copy length and structure</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
              <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Stock images and visual assets matched to your offer</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && (pageId || editId)) {
                window.location.href = `/copy/${pageId || editId}`;
              }
            }}
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/95 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/35 flex items-center justify-center gap-2 group animate-bounce"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            Generate Sales Copy First
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar is fixed-positioned — renders itself, just mount it */}
      {!isPreviewMode && <Sidebar />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        {!isPreviewMode && (
          <Topbar
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Funnels", href: pageId ? `/funnels/${pageId}` : "/" },
            {
              label: (
                <div className="flex items-center gap-1.5 group relative">
                  <div className="absolute right-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-muted-foreground/60">
                    <Edit2 className="w-3 h-3" />
                  </div>
                  <input
                    type="text"
                    value={funnelName}
                    onChange={(e) => setFunnelName(e.target.value)}
                    className="bg-muted/40 hover:bg-muted focus:bg-muted/60 border border-border/50 hover:border-border focus:border-border focus:outline-none rounded-md transition-all px-3 py-1 pr-7 w-[220px] text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 shadow-sm"
                    placeholder="Enter funnel name..."
                  />
                </div>
              ),
            },
          ]}
          steps={
            hasIntelligence
              ? [
                  { id: 1, label: "Upload", status: "done" },
                  { id: 2, label: "Intelligence", status: "done" },
                  { id: 3, label: "Copy", status: "done" },
                  { id: 4, label: "Build Pages", status: "active" },
                  { id: 5, label: "Publish", status: "pending" },
                ]
              : undefined
          }
        >
          <div className="flex items-center gap-1 ml-auto">
            {/* Device mode toggles */}
            <div className="flex items-center bg-muted/30 rounded-md border border-border mr-2 p-0.5">
              <button
                type="button"
                title="Desktop"
                onClick={() => setDeviceMode("desktop")}
                className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${deviceMode === "desktop" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Tablet"
                onClick={() => setDeviceMode("tablet")}
                className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${deviceMode === "tablet" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Tablet className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Mobile"
                onClick={() => setDeviceMode("mobile")}
                className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${deviceMode === "mobile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Separator */}
            <div className="w-px h-5 bg-border mx-1" />

            {/* Undo / Redo */}
            <button
              type="button"
              title="Undo"
              onClick={undo}
              disabled={past.length === 0}
              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Redo"
              onClick={redo}
              disabled={future.length === 0}
              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Redo2 className="h-4 w-4" />
            </button>

            {/* Separator */}
            <div className="w-px h-5 bg-border mx-1" />

            {/* Preview */}
            <button
              type="button"
              title="Preview page"
              onClick={() => setIsPreviewMode(true)}
              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* AI Build */}
            <button
              type="button"
              title="AI Build: Generate page with AI"
              onClick={handleGeneratePage}
              disabled={isGenerating}
              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Spinner size="sm" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
            </button>

            {/* Separator */}
            <div className="w-px h-5 bg-border mx-1" />

            {/* Autosave status */}
            {autoSaveStatus !== "idle" && (
              <span className={`text-xs font-semibold transition-all ${
                autoSaveStatus === "saving" ? "text-muted-foreground" : "text-emerald-500"
              }`}>
                {autoSaveStatus === "saving" ? "Saving…" : "✓ Saved"}
              </span>
            )}

            {/* Save */}
            <button
              type="button"
              title={
                !pageId
                  ? "Save draft"
                  : hasUnsavedChanges
                    ? "Save changes"
                    : "All changes saved"
              }
              onClick={handleSave}
              disabled={isSaving || (pageId !== null && !hasUnsavedChanges)}
              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed relative"
            >
              {isSaving ? (
                <Spinner size="sm" />
              ) : hasUnsavedChanges ? (
                <Save className="w-4 h-4 text-primary" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </button>

            {/* Publish CTA — kept as a labeled button since it's the primary action */}
            <button
              type="button"
              onClick={() => {
                if (!pageId) {
                  toast.error(
                    "Please save your draft first before publishing.",
                  );
                  return;
                }
                window.location.href = `/builder/publish?id=${pageId}`;
              }}
              className="ml-1 h-8 px-3 flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" /> Publish
            </button>
          </div>
        </Topbar>
        )}

        {/* Main Extensible Editor Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* LeftPanel is absolutely positioned — overlays the canvas */}
          {!isPreviewMode && <LeftPanel />}
          {/* Canvas fills full width — left padding reserves space for the icon strip */}
          <div className="flex-1 overflow-hidden h-full w-full">
            <Canvas checkoutUrls={undefined} />
          </div>
        </div>

        {/* Modals outside main flex flow */}
        <SectionLibraryModal />
        {/* OfferIQ Agent for builder editing */}
        <OfferIQAgent
          ability="builder"
          funnelId={pageId ?? 'new'}
          funnelName={funnelName}
          builderPages={pages}
          activeBuilderPagePath={activePagePath}
          onUpdateBuilderCode={(code) => updateCode(code)}
          onApplyBuilderState={(components, rootList) => setFullState(components, rootList, pages, activePagePath)}
        />
        <AiStreamBoard isOpen={isGenerating} thinkingText={streamText} />
      </div>
    </div>
  );
}
