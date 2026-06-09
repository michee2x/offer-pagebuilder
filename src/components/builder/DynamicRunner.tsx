"use client";

import React, { useEffect, useState, useCallback } from "react";
import * as LucideIcons from "lucide-react";
import * as FramerMotion from "framer-motion";
import { useBuilderStore } from "@/store/builderStore";
import { MediaPickerModal, MediaType } from "./ImagePickerModal";

interface DynamicRunnerProps {
  code?: string;
  compiledCode?: string;
  editMode?: boolean;
}

// ─── Deterministic per-compilation counter ────────────────────────────────────
// Resets to 0 at the start of every Babel transform so the Nth JSX element
// always gets id "el_N" — making source-modification traversal reproducible.
let _ofiqCounter = 0;

function makeOfiqId(): string {
  return "el_" + (++_ofiqCounter).toString(36);
}

// ─── JSXElement visitor tag-name helper ───────────────────────────────────────
function getJsxTagName(node: any): string {
  const name = node.openingElement?.name;
  if (!name) return "";
  if (name.name) return name.name;
  if (name.property?.name) return name.property.name;
  return "";
}

// ─── Sandbox require mock ─────────────────────────────────────────────────────
const requireMock = (modName: string) => {
  if (modName === "react") return React;
  if (modName === "lucide-react") return LucideIcons;
  if (modName === "framer-motion" || modName === "motion") return FramerMotion;
  if (modName === "react-router-dom") {
    return {
      useNavigate: () => (path: string) => {
        if (typeof window !== "undefined" &&
          (window.location.pathname.startsWith("/p/") ||
           window.location.pathname.startsWith("/builder"))) {
          useBuilderStore.getState().switchPage(path);
        } else if (typeof window !== "undefined") {
          window.location.pathname = path;
        }
      },
      Link: ({ to, children, ...props }: any) =>
        React.createElement("a", {
          href: to,
          onClick: (e: any) => {
            e.preventDefault();
            if (typeof window !== "undefined" &&
              (window.location.pathname.startsWith("/p/") ||
               window.location.pathname.startsWith("/builder"))) {
              useBuilderStore.getState().switchPage(to);
            } else if (typeof window !== "undefined") {
              window.location.pathname = to;
            }
          },
          ...props,
        }, children),
    };
  }
  return {};
};

// ─── EditableText – inline click-to-edit wrapper ──────────────────────────────
const EditableText = ({
  ofiqId,
  childIndex,
  children,
}: {
  ofiqId: string;
  childIndex: number;
  children: React.ReactNode;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textVal =
    typeof children === "string" ? children : String(children ?? "");

  // In preview / live mode – render as plain text, zero visual overhead
  const canEdit =
    typeof window !== "undefined" &&
    (window as any).__ofiqEditMode === true;

  if (!canEdit) return <>{children}</>;

  if (isEditing) {
    return (
      <span
        contentEditable
        suppressContentEditableWarning
        autoFocus
        onFocus={(e) => {
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(e.target);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }}
        onBlur={(e) => {
          setIsEditing(false);
          const newT = e.target.innerText;
          if (newT !== textVal && typeof (window as any).__updateOfiqText === "function") {
            (window as any).__updateOfiqText(ofiqId, childIndex, newT);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); }
          if (e.key === "Escape") { e.currentTarget.innerText = textVal; e.currentTarget.blur(); }
        }}
        onClick={(e) => e.stopPropagation()}
        className="outline-none ring-2 ring-cyan-400 rounded bg-cyan-500/10 min-w-[4px] inline-block px-0.5"
        style={{ whiteSpace: "pre-wrap" }}
      >
        {textVal}
      </span>
    );
  }

  return (
    <span
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
      title="Click to edit"
      className="hover:ring-2 hover:ring-cyan-400/60 hover:rounded cursor-text transition-all duration-100"
      style={{ display: "inline" }}
    >
      {children}
    </span>
  );
};

// ─── Evaluate compiled JS, always injecting EditableText ─────────────────────
const evaluateCode = (jsCode: string): React.ComponentType => {
  const exportsObj: Record<string, any> = {};
  const moduleObj = { exports: exportsObj };
  // EditableText is passed as a 5th arg so the compiled bundle can reference it
  const fn = new Function("React", "require", "exports", "module", "EditableText", jsCode);
  fn(React, requireMock, exportsObj, moduleObj, EditableText);

  let R = exportsObj.default ?? moduleObj.exports?.default;
  if (!R && typeof moduleObj.exports === "function") R = moduleObj.exports;
  if (R && (typeof R === "function" || typeof R === "object")) return R;

  const target = typeof moduleObj.exports === "object" ? moduleObj.exports : exportsObj;
  for (const key of Object.keys(target)) {
    if (typeof target[key] === "function") return target[key];
  }
  throw new Error("No renderable export found in compiled code.");
};

// ─── Babel plugin: inject ofiq editor annotations (compile pass) ─────────────
function makeOfiqEditorPlugin(babel: any) {
  const t = babel.types;
  return {
    visitor: {
      JSXElement(path: any) {
        const tagName = getJsxTagName(path.node);
        if (tagName === "EditableText") return; // skip our own wrapper

        const id = makeOfiqId();

        // Wrap direct text children in <EditableText ofiqId={id} childIndex={i}>
        const newChildren: any[] = [];
        path.node.children.forEach((child: any, i: number) => {
          const isText =
            (child.type === "JSXText" && child.value.trim().length > 0) ||
            (child.type === "JSXExpressionContainer" &&
              child.expression.type === "StringLiteral");

          if (isText) {
            newChildren.push(
              t.jsxElement(
                t.jsxOpeningElement(t.jsxIdentifier("EditableText"), [
                  t.jsxAttribute(t.jsxIdentifier("ofiqId"), t.stringLiteral(id)),
                  t.jsxAttribute(t.jsxIdentifier("childIndex"), t.numericLiteral(i)),
                ]),
                t.jsxClosingElement(t.jsxIdentifier("EditableText")),
                [child],
                false
              )
            );
          } else {
            newChildren.push(child);
          }
        });
        path.node.children = newChildren;

        // Add data-ofiq-id to the DOM element for click-targeting
        path.node.openingElement.attributes.push(
          t.jSXAttribute(t.jSXIdentifier("data-ofiq-id"), t.stringLiteral(id))
        );
      },
    },
  };
}

// ─── Babel plugin: modify the Nth JSX element's text child (source pass) ──────
// We replay the SAME counter-based traversal order used during compilation.
// The Nth element visited (skipping EditableText nodes) is the one whose
// data-ofiq-id was "el_N" — so we can find and patch the source without
// data-ofiq-id ever appearing in the original source file.
function makeSourceModifierPlugin(
  babel: any,
  targetId: string,
  childIndex: number,
  newText: string
) {
  const t = babel.types;
  let visitCounter = 0;

  return {
    visitor: {
      JSXElement(path: any) {
        const tagName = getJsxTagName(path.node);
        if (tagName === "EditableText") return;

        const currentId = "el_" + (++visitCounter).toString(36);
        if (currentId !== targetId) return;

        // Found the matching element — patch the child at childIndex
        const child = path.node.children?.[childIndex];
        if (!child) return;

        if (child.type === "JSXText") {
          child.value = newText;
        } else if (
          child.type === "JSXExpressionContainer" &&
          child.expression.type === "StringLiteral"
        ) {
          child.expression.value = newText;
          child.expression.extra = {
            rawValue: newText,
            raw: JSON.stringify(newText),
          };
        } else {
          path.node.children[childIndex] = t.jsxExpressionContainer(
            t.stringLiteral(newText)
          );
        }
      },
    },
  };
}

// ─── Babel plugin: replace src of the Nth JSX element (source pass) ──────────
function makeMediaSrcModifierPlugin(
  babel: any,
  targetId: string,
  newSrc: string
) {
  const t = babel.types;
  let visitCounter = 0;

  return {
    visitor: {
      JSXElement(path: any) {
        const tagName = getJsxTagName(path.node);
        if (tagName === "EditableText") return;

        const currentId = "el_" + (++visitCounter).toString(36);
        if (currentId !== targetId) return;

        let srcFound = false;
        path.node.openingElement.attributes.forEach((attr: any) => {
          if (attr.type === "JSXAttribute" && attr.name?.name === "src") {
            attr.value = t.stringLiteral(newSrc);
            srcFound = true;
          }
        });
        if (!srcFound) {
          path.node.openingElement.attributes.push(
            t.jSXAttribute(t.jSXIdentifier("src"), t.stringLiteral(newSrc))
          );
        }
      },
    },
  };
}

// ─── Shared Babel transform options ───────────────────────────────────────────
function getBabelOpts(Babel: any, extraPlugin: any) {
  return {
    presets: ["env", "react"],
    plugins: [
      [
        Babel.availablePlugins["transform-typescript"],
        { isTSX: true, allExtensions: true },
      ],
      extraPlugin,
    ],
    filename: "generated-funnel.tsx",
    retainLines: true,
  };
}

// ─── Main DynamicRunner Component ─────────────────────────────────────────────
export function DynamicRunner({
  code,
  compiledCode,
  editMode = false,
}: DynamicRunnerProps) {
  const [babelLoaded, setBabelLoaded] = useState(false);
  const [comp, setComp] = useState<React.ComponentType | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // isBuilderMode = we have raw source to compile
  // Even if a compiledCode cache exists, builder mode is driven by `code` presence
  const isBuilderMode = !!code;

  const [mediaModal, setMediaModal] = useState<{
    isOpen: boolean;
    mediaType: MediaType;
    ofiqId: string;
  }>({ isOpen: false, mediaType: "image", ofiqId: "" });

  // ── Path A: pre-compiled code (live/preview viewer) ───────────────────────
  useEffect(() => {
    if (!compiledCode) return;
    try {
      setErr(null);
      setComp(() => evaluateCode(compiledCode));
    } catch (e: any) {
      console.error("[DynamicRunner] evaluateCode failed:", e);
      setErr(e.message || "Failed to evaluate pre-compiled component.");
    }
  }, [compiledCode]);

  // ── Path B: load Babel for builder mode ───────────────────────────────────
  useEffect(() => {
    if (!isBuilderMode) return;
    if ((window as any).Babel) { setBabelLoaded(true); return; }
    const s = document.createElement("script");
    s.src = "https://unpkg.com/@babel/standalone@7.24.0/babel.min.js";
    s.async = true;
    s.onload = () =>
      (window as any).Babel ? setBabelLoaded(true) : setErr("Babel failed to initialise.");
    s.onerror = () => setErr("Failed to load dynamic transpiler.");
    document.body.appendChild(s);
  }, [isBuilderMode]);

  // ── Path C: compile raw TSX and annotate with ofiq editor plugin ──────────
  useEffect(() => {
    if (!isBuilderMode || !babelLoaded || !code) return;

    try {
      setErr(null);

      // Strip page wrapper tags added by the AI if present
      let src = code
        .replace(/^<page\b[^>]*>\n?/i, "")
        .replace(/\n?<\/page>$/i, "")
        .trim();
      if (src.startsWith("{`")) {
        src = src.replace(/^{`\n?/, "").replace(/\n?`}$/, "").trim();
      }
      // Auto-add default export if missing
      if (!src.includes("export default") && !src.includes("module.exports")) {
        const m = [...src.matchAll(/function\s+(\w+)\s*\(/g)];
        if (m.length > 0) src += `\nexport default ${m[m.length - 1][1]};`;
      }

      const Babel = (window as any).Babel;

      // Reset counter so IDs are deterministic for this exact source
      _ofiqCounter = 0;

      const transpiled = Babel.transform(src, {
        presets: ["env", "react"],
        plugins: [
          [
            Babel.availablePlugins["transform-typescript"],
            { isTSX: true, allExtensions: true },
          ],
          () => makeOfiqEditorPlugin(Babel),
        ],
        filename: "generated-funnel.tsx",
      }).code;

      // Persist compiled output into store (for live-viewer / save)
      const store = useBuilderStore.getState();
      if (store.pages[store.activePagePath]?.compiledCode !== transpiled) {
        setTimeout(() => useBuilderStore.getState().updateCode(code, transpiled), 0);
      }

      setComp(() => evaluateCode(transpiled));
    } catch (e: any) {
      console.error("[DynamicRunner] Compilation failed:", e);
      setErr(e?.message || "Failed to transpile generated component.");
    }
  }, [code, babelLoaded, isBuilderMode]);

  // ── Wire edit-mode globals for EditableText ───────────────────────────────
  useEffect(() => {
    (window as any).__ofiqEditMode = editMode && isBuilderMode;

    if (editMode && isBuilderMode) {
      (window as any).__updateOfiqText = (
        ofiqId: string,
        childIndex: number,
        newText: string
      ) => {
        // Always read the latest source from the store (handles multiple edits)
        const storeState = useBuilderStore.getState();
        const currentCode =
          storeState.pages[storeState.activePagePath]?.code ?? code ?? "";
        if (!currentCode || !(window as any).Babel) return;

        const Babel = (window as any).Babel;
        let modifiedCode = currentCode;

        try {
          // Re-strip page wrapper before modifying
          let src = currentCode
            .replace(/^<page\b[^>]*>\n?/i, "")
            .replace(/\n?<\/page>$/i, "")
            .trim();

          const res = Babel.transform(src, {
            presets: ["react"],
            plugins: [
              [
                Babel.availablePlugins["transform-typescript"],
                { isTSX: true, allExtensions: true },
              ],
              () => makeSourceModifierPlugin(Babel, ofiqId, childIndex, newText),
            ],
            retainLines: true,
            filename: "generated-funnel.tsx",
          });
          if (res?.code) modifiedCode = res.code.replace(/;$/, "");
        } catch (e) {
          console.error("[DynamicRunner] Text source replacement failed:", e);
        }

        useBuilderStore.getState().updateCode(modifiedCode);
      };
    }

    return () => {
      delete (window as any).__updateOfiqText;
      delete (window as any).__ofiqEditMode;
    };
  }, [editMode, isBuilderMode, code]);

  // ── Click handler: open MediaPickerModal for img / video / iframe ─────────
  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode || !isBuilderMode) return;

      let el = e.target as HTMLElement | null;
      while (el && !el.getAttribute("data-ofiq-id")) el = el.parentElement;
      if (!el) return;

      const tagName = el.tagName.toLowerCase();
      if (tagName === "img" || tagName === "video" || tagName === "iframe") {
        e.preventDefault();
        e.stopPropagation();
        const mediaType: MediaType =
          tagName === "img" ? "image" : tagName === "video" ? "video" : "any";
        setMediaModal({ isOpen: true, mediaType, ofiqId: el.getAttribute("data-ofiq-id")! });
      }
    },
    [editMode, isBuilderMode]
  );

  // ── Media save handler ────────────────────────────────────────────────────
  const handleMediaSave = useCallback(
    (newSrc: string) => {
      if (!mediaModal.ofiqId) {
        setMediaModal((p) => ({ ...p, isOpen: false }));
        return;
      }

      const storeState = useBuilderStore.getState();
      const currentCode =
        storeState.pages[storeState.activePagePath]?.code ?? code ?? "";

      if (!currentCode || !(window as any).Babel) {
        setMediaModal((p) => ({ ...p, isOpen: false }));
        return;
      }

      const Babel = (window as any).Babel;
      let modifiedCode = currentCode;

      try {
        let src = currentCode
          .replace(/^<page\b[^>]*>\n?/i, "")
          .replace(/\n?<\/page>$/i, "")
          .trim();

        const res = Babel.transform(src, {
          presets: ["react"],
          plugins: [
            [
              Babel.availablePlugins["transform-typescript"],
              { isTSX: true, allExtensions: true },
            ],
            () => makeMediaSrcModifierPlugin(Babel, mediaModal.ofiqId, newSrc),
          ],
          retainLines: true,
          filename: "generated-funnel.tsx",
        });
        if (res?.code) modifiedCode = res.code.replace(/;$/, "");
      } catch (e) {
        console.error("[DynamicRunner] Media src replacement failed:", e);
      }

      useBuilderStore.getState().updateCode(modifiedCode);
      setMediaModal((p) => ({ ...p, isOpen: false }));
    },
    [code, mediaModal.ofiqId]
  );

  // ── Render ────────────────────────────────────────────────────────────────
  if (err) {
    return (
      <div className="p-8 border border-red-500/20 bg-red-500/5 text-red-400 rounded-2xl max-w-2xl mx-auto my-12 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <LucideIcons.AlertTriangle className="text-red-500 w-6 h-6" />
          <h4 className="font-bold text-lg">Dynamic Compiler Notice</h4>
        </div>
        <p className="text-sm opacity-80 mb-3">
          The engine encountered an issue in the generated page code. Ask the AI to correct it:
        </p>
        <pre className="text-xs font-mono bg-black/40 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {err}
        </pre>
      </div>
    );
  }

  if ((isBuilderMode && !babelLoaded) || !comp) {
    return (
      <div className="w-full h-screen flex items-center justify-center opacity-0 animate-[fadeIn_1s_ease-in-out_1s_forwards]">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
      </div>
    );
  }

  const PageComponent = comp;

  if (editMode && isBuilderMode) {
    return (
      <>
        <div
          className="w-full h-full min-h-screen"
          onClick={handleContainerClick}
          style={{ cursor: "default" }}
        >
          <PageComponent />
        </div>
        <MediaPickerModal
          open={mediaModal.isOpen}
          mediaType={mediaModal.mediaType}
          onSelect={handleMediaSave}
          onClose={() => setMediaModal((p) => ({ ...p, isOpen: false }))}
        />
      </>
    );
  }

  return (
    <div className="w-full h-full min-h-screen">
      <PageComponent />
    </div>
  );
}
