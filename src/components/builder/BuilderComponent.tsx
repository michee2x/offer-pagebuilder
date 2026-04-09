"use client";

import React from "react";
import { useBuilderStore } from "@/store/builderStore";
import { COMPONENT_REGISTRY } from "@/config/components";
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Edit2,
  Bot,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { findImagePropMatch, ImagePropMatch } from "@/lib/findImageProp";
import { ImagePickerModal } from "./ImagePickerModal";

interface BuilderComponentProps {
  id: string;
}

interface HoveredImgData {
  top: number;
  left: number;
  width: number;
  height: number;
  src: string;
}

export function BuilderComponent({ id }: BuilderComponentProps) {
  const {
    components,
    rootList,
    selectedId,
    selectedField,
    setSelected,
    isPreviewMode,
    removeComponent,
    moveComponent,
    duplicateComponent,
    updateProps,
  } = useBuilderStore();

  const component = components[id];
  if (!component) return null;

  const config = COMPONENT_REGISTRY[component.type];
  if (!config) return null; // Skip components not in registry

  const isSelected = selectedId === id && !isPreviewMode;
  const isHeader = component.type.includes("Header");
  const currentIndex = rootList.indexOf(id);

  // ── Image replacement state ─────────────────────────────────────────────────
  const contentRef = React.useRef<HTMLDivElement>(null);
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Store prop match at hover time so it survives mouseout when dialog opens
  const pendingMatchRef = React.useRef<ImagePropMatch>(null);

  const [hoveredImg, setHoveredImg] = React.useState<HoveredImgData | null>(
    null,
  );
  const [pickerOpen, setPickerOpen] = React.useState(false);

  React.useEffect(() => {
    if (isPreviewMode || !contentRef.current) return;
    const container = contentRef.current;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== "IMG") return;
      const img = target as HTMLImageElement;

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

      const imgRect = img.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Compute prop match RIGHT NOW while we know which image is being hovered
      pendingMatchRef.current = findImagePropMatch(component.props, img.src);

      setHoveredImg({
        top: imgRect.top - containerRect.top,
        left: imgRect.left - containerRect.left,
        width: imgRect.width,
        height: imgRect.height,
        src: img.src,
      });
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== "IMG") return;

      // If the cursor is moving INTO our overlay button, don't hide
      const related = e.relatedTarget as HTMLElement | null;
      if (related?.closest("[data-img-replace-btn]")) return;

      // Otherwise schedule hide with a short grace period
      hideTimerRef.current = setTimeout(() => setHoveredImg(null), 200);
    };

    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mouseout", handleMouseOut);

    return () => {
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mouseout", handleMouseOut);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
    // Re-attach if props change (prop keys might change after AI edit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPreviewMode, component.props]);

  // ── When picker selects a URL ───────────────────────────────────────────────
  const handleImageSelected = (url: string) => {
    const match = pendingMatchRef.current;

    if (match) {
      if (match.type === "direct") {
        updateProps(id, { [match.key]: url });
      } else {
        // Nested array: rebuild the array with the updated item
        const newArray = match.fullArray.map((item, i) =>
          i === match.index ? { ...item, [match.nestedKey]: url } : item,
        );
        updateProps(id, { [match.key]: newArray });
      }
    } else {
      // ── Fallback: Component schema inference ──────────────────────────────
      // If the component was saved in the store without a default image prop,
      // the string match fails. We can infer the correct prop directly from the schema.
      const imageFields = Object.entries(config.fields)
        .filter(([_, field]) => field?.type === "image")
        .map(([key]) => key);

      if (imageFields.length === 1) {
        // Unambiguous: The component only has 1 image property (e.g. 'imageUrl')
        updateProps(id, { [imageFields[0]]: url });
      } else if ("src" in component.props || config.fields["src"]) {
        // Fallback to updating 'src' if it exists
        updateProps(id, { src: url });
      } else {
        toast.error(
          "Could not locate the exact image prop for this component.",
        );
        return; // Don't show success toast
      }
    }

    setPickerOpen(false);
    setHoveredImg(null);
    toast.success("Image updated!");
  };

  return (
    <>
      <div
        data-component-id={id}
        className={`relative group ${isHeader ? "z-[100]" : "z-0"} peer`}
        onClick={(e) => {
          if (isPreviewMode) return;
          e.stopPropagation();
          const fieldTarget = (e.target as HTMLElement).closest("[data-field]");
          setSelected(id, fieldTarget?.getAttribute("data-field") ?? null);
        }}
      >
        <div
          className={`w-full transition-all relative ${
            !isPreviewMode
              ? "border-2 border-transparent hover:border-blue-400/60"
              : ""
          } ${isSelected && !selectedField ? "!border-blue-500 rounded z-10" : ""} ${
            isSelected && selectedField
              ? "!border-blue-300 border-dashed rounded z-10"
              : ""
          }`}
        >
          {/* ── Section toolbar (hover) ─────────────────────────────────── */}
          {!isPreviewMode && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 rounded">
              {/* Top-left badge */}
              <div className="absolute top-2.5 left-2.5 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                <span className="text-[10px]">📍</span>{" "}
                {config?.label || component.type}
              </div>

              {/* Top-right action buttons */}
              <div className="absolute top-2.5 right-2.5 flex gap-1 pointer-events-auto">
                {currentIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveComponent(id, currentIndex - 1);
                    }}
                    className="w-[28px] h-[28px] rounded-md bg-slate-900/95 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-500/15 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                )}
                {currentIndex < rootList.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveComponent(id, currentIndex + 1);
                    }}
                    className="w-[28px] h-[28px] rounded-md bg-slate-900/95 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-500/15 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateComponent(id);
                  }}
                  className="w-[28px] h-[28px] rounded-md bg-slate-900/95 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
                  title="Duplicate"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(id);
                  }}
                  className="w-[28px] h-[28px] rounded-md bg-slate-900/95 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:bg-amber-500/15 hover:text-amber-400 hover:border-amber-500/30 transition-all"
                  title="Edit Properties"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeComponent(id);
                  }}
                  className="w-[28px] h-[28px] rounded-md bg-slate-900/95 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom-center AI button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(id);
                }}
                className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-blue-600 border border-violet-400/40 rounded-full px-3.5 py-1 text-[11px] font-bold text-white flex items-center gap-1.5 z-30 whitespace-nowrap shadow-[0_4px_18px_rgba(139,92,246,0.4)] pointer-events-auto hover:scale-105 transition-transform backdrop-blur-sm"
              >
                <Bot className="w-3.5 h-3.5" /> ✨ Edit with AI
              </button>
            </div>
          )}

          {/* ── Rendered component ──────────────────────────────────────── */}
          <div
            ref={contentRef}
            className={`relative ${isHeader ? "z-[100]" : "z-10"}`}
          >
            {config.render({
              ...component.props,
              isPreviewMode,
              children: component.childrenIds?.map((childId: string) => (
                <BuilderComponent key={childId} id={childId} />
              )),
            })}

            {/* ── Image replacement overlay ─────────────────────────── */}
            {!isPreviewMode && hoveredImg && (
              <div
                className="absolute z-40 pointer-events-none"
                style={{
                  top: hoveredImg.top,
                  left: hoveredImg.left,
                  width: hoveredImg.width,
                  height: hoveredImg.height,
                }}
              >
                {/* Dim glass */}
                <div className="absolute inset-0 bg-black/30 rounded-sm backdrop-blur-[1.5px]" />

                {/* Small camera badge top-right */}
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15">
                  <ImageIcon className="w-3 h-3 text-white/70" />
                </div>

                {/* Centred CTA — pointer-events-auto so it receives clicks */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    data-img-replace-btn="true"
                    className="pointer-events-auto flex items-center gap-2 bg-[#111]/90 backdrop-blur-md text-white text-[12px] font-semibold px-4 py-2 rounded-xl border border-white/[0.15] shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-[#1a1a1a] hover:border-white/25 active:scale-95 transition-all"
                    onMouseEnter={() => {
                      // Keep hoveredImg alive while cursor is on this button
                      if (hideTimerRef.current)
                        clearTimeout(hideTimerRef.current);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPickerOpen(true);
                    }}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                    Replace Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Selected field highlight */}
          {isSelected && selectedField && !isPreviewMode && (
            <style>{`
              [data-field="${selectedField}"] {
                outline: 2px solid #3b82f6 !important;
                outline-offset: 4px;
                border-radius: 4px;
                position: relative;
                z-index: 50;
                transition: outline 0.1s ease-in-out;
              }
            `}</style>
          )}
        </div>
      </div>

      {/* Image picker modal — rendered outside the component wrapper to avoid z-index issues */}
      <ImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleImageSelected}
      />
    </>
  );
}
