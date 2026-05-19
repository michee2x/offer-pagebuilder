"use client";

import React from "react";
import { Canvas } from "@/components/builder/Canvas";
import { RightPanel } from "@/components/builder/RightPanel";
import { ThemeSwitcher } from "@/components/builder/ThemeSwitcher";
import { SectionLibraryModal } from "@/components/builder/SectionLibraryModal";
import { AiStreamBoard } from "@/components/builder/AiStreamBoard";
import { useBuilderStore } from "@/store/builderStore";
import {
  Wand2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Link as LinkIcon,
  Check,
  Undo2,
  Redo2,
  Plus,
  Globe,
  Save,
  Edit2,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { LeftPanel } from "@/components/builder/LeftPanel";

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
  const [isSaving, setIsSaving] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [streamText, setStreamText] = React.useState("");
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [publishedUrl, setPublishedUrl] = React.useState<string | null>(null);
  const [hasIntelligence, setHasIntelligence] = React.useState(false);

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
              let loadedPages = blocks.pages;
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
                  name: "Lead Capture",
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
              if (data.page.blocks.theme) {
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
          .catch((err) => console.error("Failed to fetch page:", err))
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
        setInitialLoading(false);
      }
    }
  }, [setPageId, setFullState, setFunnelName, setTheme, setInitialLoading]);

  // No more DND sensors or event handlers needed

  const autoSaveGeneratedPages = async (newPagesList: Record<string, any>, initialPage: any) => {
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
      } catch (parseError) {
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
      setHasUnsavedChanges(false);

      if (!pageId && data.pageId) {
        setPageId(data.pageId);
        window.history.replaceState(null, "", "?id=" + data.pageId);
      }

      toast.success("Funnel saved and synced to database successfully!");
    } catch (e: any) {
      toast.dismiss();
      console.error("[client] Auto-save error:", e);
      toast.error("Pages rendered, but auto-save failed: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePage = async () => {
    try {
      setIsGenerating(true);
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
        body: JSON.stringify({ offerContext, funnelId: pageId }),
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
            if (event.type === "thinking") {
              thinkingText = String(event.data || "").trim();
              setStreamText(thinkingText);
            } else if (event.type === "complete") {
              accumulatedText += String(event.data || "");
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
            if (event.type === "thinking") {
              thinkingText = String(event.data || "").trim();
              setStreamText(thinkingText);
            } else if (event.type === "complete") {
              accumulatedText += String(event.data || "");
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
      const pageRegex = /<page\s+path=["']([^"']+)["']\s+name=["']([^"']+)["']\s*>([\s\S]*?)<\/page>/g;
      let match;
      let pageCount = 0;

      while ((match = pageRegex.exec(accumulatedText)) !== null) {
        const path = match[1];
        const name = match[2];
        const code = match[3].trim();

        newPages[path] = {
          name,
          path,
          components: {},
          rootList: [],
          code,
        };
        pageCount++;
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

      // 1. Auto-save the new pages to database FIRST so refreshes or HMR doesn't clear them!
      await autoSaveGeneratedPages(newPages, initialPage);

      // 2. Set local Zustand state to hot-render the pages inside the visual canvas!
      console.log("[client] Setting initialPage:", initialPage);
      setFullState(
        initialPage.components,
        initialPage.rootList,
        newPages,
        initialPage.path,
      );
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGenerating(false);
      setStreamText("");
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
      } catch (parseError) {
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

      if (!pageId && data.pageId) {
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
            { label: "Workspace" },
            { label: "Funnels", href: "/" },
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

            {/* Theme Switcher */}
            <ThemeSwitcher />

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

            <Canvas />
          </div>
          {!isPreviewMode && <RightPanel />}
        </div>

        {/* Modals outside main flex flow */}
        <SectionLibraryModal />
        <AiStreamBoard isOpen={isGenerating} thinkingText={streamText} />
      </div>
    </div>
  );
}
