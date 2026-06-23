"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  createContext,
  useRef,
} from "react";
import * as LucideIcons from "lucide-react";
import * as FramerMotion from "framer-motion";
import { useBuilderStore } from "@/store/builderStore";
import { MediaPickerModal, MediaType } from "./ImagePickerModal";

// ─── Edit-mode React Context ──────────────────────────────────────────────────
// Using a context eliminates the window-global timing race where useEffect
// sets __ofiqEditMode AFTER EditableText has already rendered, causing canEdit=false.
const EditModeCtx = createContext(false);

// ─── Deterministic per-compilation counter ────────────────────────────────────
// Reset to 0 before each Babel.transform call so the Nth JSXElement always
// gets id "el_N" — the source-modification pass replays the same counter order.
let _ofiqCounter = 0;

// ─── Require sandbox ──────────────────────────────────────────────────────────
const createRequireMock = (checkoutUrls?: Record<string, string>, activePagePath?: string) => (mod: string) => {
  if (mod === "react") return React;
  if (mod === "lucide-react") return LucideIcons;
  if (mod === "framer-motion" || mod === "motion") return FramerMotion;
  if (mod === "react-router-dom") {
    const go = (path: string) => {
      // External URL (e.g. Stripe Payment Link) — redirect to it
      if (path.startsWith("http://") || path.startsWith("https://")) {
        window.location.href = path;
        return;
      }
      
      // If we are navigating "forward" to buy, use the configured checkout URL instead!
      const isForwardNavigation = 
        !path.includes("declined=true") && (
          (activePagePath === "/" && path.includes("upsell")) ||
          (activePagePath === "/upsell" && path.includes("thankyou")) ||
          (activePagePath === "/downsell" && path.includes("thankyou"))
        );
        
      console.log("[DynamicRunner] go() intercepted", { activePagePath, path, isForwardNavigation, checkoutUrls });

      if (isForwardNavigation && checkoutUrls && activePagePath && checkoutUrls[activePagePath]) {
        console.log("[DynamicRunner] Redirecting to external checkout:", checkoutUrls[activePagePath]);
        window.location.href = checkoutUrls[activePagePath];
        return;
      }

      if (
        typeof window !== "undefined" &&
        (window.location.pathname.startsWith("/p/") ||
          window.location.pathname.startsWith("/builder"))
      ) {
        useBuilderStore.getState().switchPage(path);
      } else if (typeof window !== "undefined") {
        window.location.pathname = path;
      }
    };
    return {
      useNavigate: () => go,
      Link: ({ to, children, ...rest }: any) =>
        React.createElement(
          "a",
          { href: to, onClick: (e: any) => { e.preventDefault(); go(to); }, ...rest },
          children
        ),
    };
  }
  return {};
};

// ─── EditableText wrapper – injected by Babel plugin during compilation ───────
const EditableText = ({
  ofiqId,
  childIndex,
  children,
}: {
  ofiqId: string;
  childIndex: number;
  children: React.ReactNode;
}) => {
  // Read from context — guaranteed to be set before this renders because
  // DynamicRunner wraps PageComponent in <EditModeCtx.Provider value={...}>.
  const canEdit = useContext(EditModeCtx);
  const [isEditing, setIsEditing] = useState(false);

  const textVal =
    typeof children === "string" ? children : String(children ?? "");

  // In preview / live: render plain children, zero overhead
  if (!canEdit) return <>{children}</>;

  if (isEditing) {
    return (
      <span
        contentEditable
        suppressContentEditableWarning
        autoFocus
        onFocus={(e) => {
          // Move caret to end
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(e.target);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }}
        onBlur={(e) => {
          setIsEditing(false);
          const next = e.currentTarget.innerText;
          if (
            next !== textVal &&
            typeof (window as any).__updateOfiqText === "function"
          ) {
            (window as any).__updateOfiqText(ofiqId, childIndex, next);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            e.currentTarget.innerText = textVal;
            e.currentTarget.blur();
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className="outline-none ring-2 ring-cyan-400 rounded-sm bg-cyan-500/10 min-w-[4px] inline px-0.5"
        style={{ whiteSpace: "pre-wrap" }}
      >
        {textVal}
      </span>
    );
  }

  return (
    <span
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }}
      title="Click to edit text"
      className="hover:outline hover:outline-2 hover:outline-cyan-400/70 hover:outline-offset-1 hover:rounded-sm cursor-text transition-all duration-100"
      style={{ display: "inline" }}
    >
      {children}
    </span>
  );
};

// ─── Evaluate compiled JS – always injects EditableText into scope ────────────
const evaluateCode = (
  jsCode: string, 
  checkoutUrls?: Record<string, string>, 
  activePagePath?: string
): React.ComponentType => {
  const exportsObj: Record<string, any> = {};
  const moduleObj = { exports: exportsObj };
  const requireMock = createRequireMock(checkoutUrls, activePagePath);
  
  // 5th arg "EditableText" makes the compiled React.createElement(EditableText, …) resolve
  const fn = new Function(
    "React",
    "require",
    "exports",
    "module",
    "EditableText",
    jsCode
  );
  fn(React, requireMock, exportsObj, moduleObj, EditableText);

  let R = exportsObj.default ?? moduleObj.exports?.default;
  if (!R && typeof moduleObj.exports === "function") R = moduleObj.exports;
  if (R) return R;

  const target =
    typeof moduleObj.exports === "object" ? moduleObj.exports : exportsObj;
  for (const k of Object.keys(target)) {
    if (typeof target[k] === "function") return target[k];
  }
  throw new Error("No renderable export found.");
};

// ─── Babel plugin: annotate JSX with ofiq IDs + EditableText wrappers ────────
const ofiqEditorPlugin = (babel: any) => {
  const t = babel.types;
  return {
    visitor: {
      JSXElement(path: any) {
        // Skip our own wrapper
        const nameNode = path.node.openingElement?.name;
        const tag = nameNode?.name ?? nameNode?.property?.name ?? "";
        if (tag === "EditableText") return;

        const id = "el_" + (++_ofiqCounter).toString(36);

        // Wrap direct text children
        const newKids: any[] = [];
        path.node.children.forEach((child: any, i: number) => {
          const isText =
            (child.type === "JSXText" && child.value.trim().length > 0) ||
            (child.type === "JSXExpressionContainer" &&
              child.expression?.type === "StringLiteral");

          if (isText) {
            newKids.push(
              t.jsxElement(
                t.jsxOpeningElement(t.jsxIdentifier("EditableText"), [
                  t.jsxAttribute(
                    t.jsxIdentifier("ofiqId"),
                    t.stringLiteral(id)
                  ),
                  t.jsxAttribute(
                    t.jsxIdentifier("childIndex"),
                    t.jsxExpressionContainer(t.numericLiteral(i))
                  ),
                ]),
                t.jsxClosingElement(t.jsxIdentifier("EditableText")),
                [child],
                false
              )
            );
          } else {
            newKids.push(child);
          }
        });
        path.node.children = newKids;

        // Tag DOM element with the id so clicks can identify media elements
        path.node.openingElement.attributes.push(
          t.jSXAttribute(
            t.jSXIdentifier("data-ofiq-id"),
            t.stringLiteral(id)
          )
        );
      },
    },
  };
};

// ─── Babel plugin: patch the source text of a specific node ──────────────────
// Replays the same counter-based traversal order as ofiqEditorPlugin so we can
// locate the right JSXElement in the *original* source (which has no data-ofiq-id).
const makeTextPatchPlugin = (
  babel: any,
  targetId: string,
  childIndex: number,
  newText: string
) => {
  const t = babel.types;
  let cnt = 0;
  return {
    visitor: {
      JSXElement(path: any) {
        const nameNode = path.node.openingElement?.name;
        const tag = nameNode?.name ?? nameNode?.property?.name ?? "";
        if (tag === "EditableText") return;

        const id = "el_" + (++cnt).toString(36);
        if (id !== targetId) return;

        const child = path.node.children?.[childIndex];
        if (!child) return;

        if (child.type === "JSXText") {
          child.value = newText;
        } else if (
          child.type === "JSXExpressionContainer" &&
          child.expression?.type === "StringLiteral"
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
};

// ─── Babel plugin: replace src attr of a specific node ───────────────────────
const makeMediaPatchPlugin = (
  babel: any,
  targetId: string,
  newSrc: string
) => {
  const t = babel.types;
  let cnt = 0;
  return {
    visitor: {
      JSXElement(path: any) {
        const nameNode = path.node.openingElement?.name;
        const tag = nameNode?.name ?? nameNode?.property?.name ?? "";
        if (tag === "EditableText") return;

        const id = "el_" + (++cnt).toString(36);
        if (id !== targetId) return;

        let found = false;
        path.node.openingElement.attributes.forEach((attr: any) => {
          if (attr.type === "JSXAttribute" && attr.name?.name === "src") {
            attr.value = t.stringLiteral(newSrc);
            found = true;
          }
        });
        if (!found) {
          path.node.openingElement.attributes.push(
            t.jSXAttribute(t.jSXIdentifier("src"), t.stringLiteral(newSrc))
          );
        }
      },
    },
  };
};

// ─── Babel plugin: replace style.backgroundImage of a specific node ──────────
const makeBackgroundImagePatchPlugin = (
  babel: any,
  targetId: string,
  newSrc: string
) => {
  const t = babel.types;
  let cnt = 0;
  return {
    visitor: {
      JSXElement(path: any) {
        const nameNode = path.node.openingElement?.name;
        const tag = nameNode?.name ?? nameNode?.property?.name ?? "";
        if (tag === "EditableText") return;

        const id = "el_" + (++cnt).toString(36);
        if (id !== targetId) return;

        let patched = false;
        let styleAttrNode: any = null;

        path.node.openingElement.attributes.forEach((attr: any) => {
          if (attr.type === "JSXAttribute" && attr.name?.name === "style") {
            styleAttrNode = attr;
            if (attr.value?.type === "JSXExpressionContainer" && attr.value.expression.type === "ObjectExpression") {
              const props = attr.value.expression.properties;
              for (const prop of props) {
                if (
                  prop.type === "ObjectProperty" &&
                  (prop.key.name === "backgroundImage" || prop.key.value === "backgroundImage")
                ) {
                  prop.value = t.stringLiteral(`url('${newSrc}')`);
                  patched = true;
                }
              }
            }
          }
        });

        if (!patched) {
          // If style exists but no backgroundImage, append it.
          if (styleAttrNode && styleAttrNode.value?.type === "JSXExpressionContainer" && styleAttrNode.value.expression.type === "ObjectExpression") {
            styleAttrNode.value.expression.properties.push(
              t.objectProperty(t.identifier("backgroundImage"), t.stringLiteral(`url('${newSrc}')`))
            );
          } else if (!styleAttrNode) {
            // Inject a new style={{ backgroundImage: ... }} attribute
            path.node.openingElement.attributes.push(
              t.jSXAttribute(
                t.jSXIdentifier("style"),
                t.jSXExpressionContainer(
                  t.objectExpression([
                    t.objectProperty(t.identifier("backgroundImage"), t.stringLiteral(`url('${newSrc}')`))
                  ])
                )
              )
            );
          }
        }
      },
    },
  };
};

// ─── Shared Babel transform helper ───────────────────────────────────────────
function babelTransform(
  Babel: any,
  src: string,
  extraPlugin: any
): string | null {
  try {
    const res = Babel.transform(src, {
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
    });
    return res?.code ?? null;
  } catch (e) {
    console.error("[ofiq] babelTransform failed:", e);
    return null;
  }
}

// ─── Strip AI page wrapper tags from raw code ─────────────────────────────────
function cleanSource(code: string): string {
  let s = code
    .replace(/^<page\b[^>]*>\n?/i, "")
    .replace(/\n?<\/page>$/i, "")
    .trim();
  if (s.startsWith("{`")) s = s.replace(/^{`\n?/, "").replace(/\n?`}$/, "").trim();
  // Auto-add default export if missing
  if (!s.includes("export default") && !s.includes("module.exports")) {
    const m = [...s.matchAll(/function\s+(\w+)\s*\(/g)];
    if (m.length) s += `\nexport default ${m[m.length - 1][1]};`;
  }
  return s;
}

// ─── Main component ───────────────────────────────────────────────────────────
interface DynamicRunnerProps {
  code?: string;
  compiledCode?: string; // If provided, we skip Babel in the browser
  editMode?: boolean;
  checkoutUrls?: Record<string, string>;
  activePagePath?: string;
}

export function DynamicRunner({
  code,
  compiledCode,
  editMode = false,
  checkoutUrls,
  activePagePath,
}: DynamicRunnerProps) {
  const [babelLoaded, setBabelLoaded] = useState(false);
  const [comp, setComp] = useState<React.ComponentType | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const isBuilderMode = !!code; // builder = we have raw source to compile

  const [mediaModal, setMediaModal] = useState<{
    isOpen: boolean;
    mediaType: MediaType;
    ofiqId: string;
    patchMode: "src" | "backgroundImage";
  }>({ isOpen: false, mediaType: "image", ofiqId: "", patchMode: "src" });

  const [hoveredMedia, setHoveredMedia] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    ofiqId: string;
    type: "image" | "video" | "bg" | "icon";
    patchMode: "src" | "backgroundImage" | "none";
  } | null>(null);
  
  const hideMediaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── A: pre-compiled viewer path (live/preview, no edit) ───────────────────
  useEffect(() => {
    if (!compiledCode) return;
    try {
      _ofiqCounter = 0; // reset deterministic id counter
      const Comp = evaluateCode(compiledCode, checkoutUrls, activePagePath);
      setComp(() => Comp);
      setErr(null);
    } catch (e: any) {
      setErr(e.message || "Failed to evaluate compiled component.");
    }
  }, [compiledCode, checkoutUrls, activePagePath]);

  // ── B: load Babel for builder ─────────────────────────────────────────────
  useEffect(() => {
    if (!isBuilderMode) return;
    if ((window as any).Babel) { setBabelLoaded(true); return; }
    const s = document.createElement("script");
    s.src = "https://unpkg.com/@babel/standalone@7.24.0/babel.min.js";
    s.async = true;
    s.onload = () =>
      (window as any).Babel
        ? setBabelLoaded(true)
        : setErr("Babel failed to initialize.");
    s.onerror = () => setErr("Failed to load Babel transpiler.");
    document.body.appendChild(s);
  }, [isBuilderMode]);

  // ── C: compile TSX → annotated JS ─────────────────────────────────────────
  useEffect(() => {
    if (!isBuilderMode || !babelLoaded || !code) return;
    try {
      setErr(null);
      const Babel = (window as any).Babel;
      const src = cleanSource(code);

      _ofiqCounter = 0; // reset per-compilation

      const transpiled = Babel.transform(src, {
        presets: ["env", "react"],
        plugins: [
          [
            Babel.availablePlugins["transform-typescript"],
            { isTSX: true, allExtensions: true },
          ],
          ofiqEditorPlugin,
        ],
        filename: "generated-funnel.tsx",
      }).code;

      // Cache compiled output in store for live-viewer
      const store = useBuilderStore.getState();
      if (store.pages[store.activePagePath]?.compiledCode !== transpiled) {
        setTimeout(
          () => useBuilderStore.getState().updateCode(code, transpiled),
          0
        );
      }

      setComp(() => evaluateCode(transpiled, checkoutUrls, activePagePath));
    } catch (e: any) {
      console.error("[DynamicRunner] compile error:", e);
      setErr(e?.message || "Failed to compile page code.");
    }
  }, [code, babelLoaded, isBuilderMode, checkoutUrls, activePagePath]);

  // ── D: register text-update handler ──────────────────────────────────────
  useEffect(() => {
    if (!editMode || !isBuilderMode) return;

    (window as any).__updateOfiqText = (
      ofiqId: string,
      childIndex: number,
      newText: string
    ) => {
      const storeState = useBuilderStore.getState();
      const latestCode =
        storeState.pages[storeState.activePagePath]?.code ?? code ?? "";
      if (!latestCode || !(window as any).Babel) return;

      const Babel = (window as any).Babel;
      const src = cleanSource(latestCode);
      let patchedSrc = src;

      try {
        const res = Babel.transform(src, {
          presets: ["react"],
          plugins: [
            [
              Babel.availablePlugins["transform-typescript"],
              { isTSX: true, allExtensions: true },
            ],
            (b: any) => makeTextPatchPlugin(b, ofiqId, childIndex, newText),
          ],
          retainLines: true,
          filename: "generated-funnel.tsx",
        });
        if (res?.code) patchedSrc = res.code.replace(/;$/, "");
      } catch (e) {
        console.error("[ofiq] text patch failed:", e);
      }

      useBuilderStore.getState().updateCode(patchedSrc);
    };

    return () => {
      delete (window as any).__updateOfiqText;
    };
  }, [editMode, isBuilderMode, code]);

  // ── Hover handlers: overlay for image/video/bg/icons ──────────────────────
  const handleMediaHover = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode || !isBuilderMode) return;

      const target = e.target as HTMLElement;
      
      // Keep overlay alive if hovering over the overlay itself
      if (target.closest("[data-media-overlay]")) {
        if (hideMediaTimerRef.current) clearTimeout(hideMediaTimerRef.current);
        return;
      }

      // Walk up the DOM tree looking for an element with an interactive visual feature
      let el: HTMLElement | null = target;
      let foundType: "image" | "video" | "bg" | "icon" | null = null;
      let patchMode: "src" | "backgroundImage" | "none" = "none";
      let targetEl: HTMLElement | null = null;

      while (el && el !== e.currentTarget) {
        if (el.getAttribute("data-ofiq-id")) {
          const tag = el.tagName.toLowerCase();
          if (tag === "img") { foundType = "image"; patchMode = "src"; targetEl = el; break; }
          else if (tag === "video" || tag === "iframe") { foundType = "video"; patchMode = "src"; targetEl = el; break; }
          else if (tag === "svg") { foundType = "icon"; patchMode = "none"; targetEl = el; break; }
          else {
            const style = window.getComputedStyle(el);
            if (style.backgroundImage && style.backgroundImage !== "none" && style.backgroundImage.includes("url(")) {
              foundType = "bg"; patchMode = "backgroundImage"; targetEl = el; break;
            }
          }
        }
        el = el.parentElement as HTMLElement | null;
      }

      if (foundType && targetEl) {
        if (hideMediaTimerRef.current) clearTimeout(hideMediaTimerRef.current);
        const rect = targetEl.getBoundingClientRect();
        const containerRect = e.currentTarget.getBoundingClientRect();
        
        setHoveredMedia({
          top: rect.top - containerRect.top,
          left: rect.left - containerRect.left,
          width: rect.width,
          height: rect.height,
          ofiqId: targetEl.getAttribute("data-ofiq-id")!,
          type: foundType,
          patchMode,
        });
      }
    },
    [editMode, isBuilderMode]
  );

  const handleMediaHoverOut = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode || !isBuilderMode) return;
      const related = e.relatedTarget as HTMLElement | null;
      if (related?.closest("[data-media-overlay]")) return;
      
      hideMediaTimerRef.current = setTimeout(() => setHoveredMedia(null), 150);
    },
    [editMode, isBuilderMode]
  );

  // ── Click handler: open media picker for img/video/iframe/bg ──────────────
  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode || !isBuilderMode) return;

      let el: HTMLElement | null = e.target as HTMLElement | null;
      let mediaType: MediaType | null = null;
      let patchMode: "src" | "backgroundImage" = "src";
      let targetEl: HTMLElement | null = null;

      while (el && el !== e.currentTarget) {
        if (el.getAttribute("data-ofiq-id")) {
          const tag = el.tagName.toLowerCase();
          if (tag === "img") { mediaType = "image"; patchMode = "src"; targetEl = el; break; }
          else if (tag === "video" || tag === "iframe") { mediaType = "video"; patchMode = "src"; targetEl = el; break; }
          else if (tag === "svg") {
            // SVG icon found, stop traversal but don't open modal
            return;
          }
          else {
            const style = window.getComputedStyle(el);
            if (style.backgroundImage && style.backgroundImage !== "none" && style.backgroundImage.includes("url(")) {
              mediaType = "image"; patchMode = "backgroundImage"; targetEl = el; break;
            }
          }
        }
        el = el.parentElement;
      }

      if (mediaType && targetEl) {
        e.preventDefault();
        e.stopPropagation();
        setMediaModal({
          isOpen: true,
          mediaType,
          ofiqId: targetEl.getAttribute("data-ofiq-id")!,
          patchMode,
        });
        setHoveredMedia(null);
      }
    },
    [editMode, isBuilderMode]
  );

  // ── Media picker save ──────────────────────────────────────────────────────
  const handleMediaSave = useCallback(
    (newSrc: string) => {
      const storeState = useBuilderStore.getState();
      const latestCode =
        storeState.pages[storeState.activePagePath]?.code ?? code ?? "";

      if (!latestCode || !mediaModal.ofiqId || !(window as any).Babel) {
        setMediaModal((p) => ({ ...p, isOpen: false }));
        return;
      }

      const Babel = (window as any).Babel;
      const src = cleanSource(latestCode);
      let patchedSrc = src;

      try {
        const res = Babel.transform(src, {
          presets: ["react"],
          plugins: [
            [
              Babel.availablePlugins["transform-typescript"],
              { isTSX: true, allExtensions: true },
            ],
            mediaModal.patchMode === "backgroundImage" 
              ? (b: any) => makeBackgroundImagePatchPlugin(b, mediaModal.ofiqId, newSrc)
              : (b: any) => makeMediaPatchPlugin(b, mediaModal.ofiqId, newSrc),
          ],
          retainLines: true,
          filename: "generated-funnel.tsx",
        });
        if (res?.code) patchedSrc = res.code.replace(/;$/, "");
      } catch (e) {
        console.error("[ofiq] media patch failed:", e);
      }

      useBuilderStore.getState().updateCode(patchedSrc);
      setMediaModal((p) => ({ ...p, isOpen: false }));
    },
    [code, mediaModal.ofiqId]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  if (err) {
    return (
      <div className="p-8 border border-red-500/20 bg-red-500/5 text-red-400 rounded-2xl max-w-2xl mx-auto my-12">
        <div className="flex items-center gap-3 mb-4">
          <LucideIcons.AlertTriangle className="text-red-500 w-6 h-6" />
          <h4 className="font-bold text-lg">Page Code Error</h4>
        </div>
        <p className="text-sm opacity-80 mb-3">
          Ask the AI agent to fix this issue:
        </p>
        <pre className="text-xs font-mono bg-black/40 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
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
  const isEditActive = editMode && isBuilderMode;

  return (
    // EditModeCtx.Provider wraps PageComponent so EditableText.useContext()
    // always receives the correct value synchronously during render — no race.
    <EditModeCtx.Provider value={isEditActive}>
      <div
        className="w-full h-full min-h-screen relative"
        onClick={isEditActive ? handleContainerClick : undefined}
        onMouseOver={isEditActive ? handleMediaHover : undefined}
        onMouseOut={isEditActive ? handleMediaHoverOut : undefined}
        style={isEditActive ? { cursor: "default" } : undefined}
      >
        <PageComponent />
        
        {/* ── Hover Overlay ── */}
        {isEditActive && hoveredMedia && (
          <div
            data-media-overlay="true"
            className="absolute z-50 pointer-events-none"
            style={{
              top: hoveredMedia.top,
              left: hoveredMedia.left,
              width: hoveredMedia.width,
              height: hoveredMedia.height,
            }}
          >
            {/* Dim glass for regular images only. Do not dim entire background sections. */}
            <div className={`absolute inset-0 rounded-sm pointer-events-none ${hoveredMedia.type === 'image' || hoveredMedia.type === 'video' ? 'bg-black/30 backdrop-blur-[1.5px]' : ''}`} />

            {hoveredMedia.type === 'icon' ? (
              // Tooltip for icons
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-auto bg-[#111]/95 backdrop-blur-md text-white/90 text-[11px] px-3 py-1.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap z-50 flex items-center gap-1.5 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Optionally emit an event to open chat if feasible, otherwise keep instructions
                  setHoveredMedia(null);
                }}
              >
                <LucideIcons.Info className="w-3.5 h-3.5 text-brand-yellow" />
                This is an icon. Ask AI to replace it.
              </div>
            ) : hoveredMedia.type === 'bg' ? (
              // Replace button for BACKGROUND images (top right, no dimming)
              <div className="absolute top-4 right-4 z-50">
                <button
                  className="pointer-events-auto flex items-center gap-2 bg-[#111]/90 backdrop-blur-md text-white text-[12px] font-semibold px-4 py-2 rounded-xl border border-white/[0.15] shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-[#1a1a1a] hover:border-white/25 active:scale-95 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMediaModal({
                      isOpen: true,
                      mediaType: "image",
                      ofiqId: hoveredMedia.ofiqId,
                      patchMode: "backgroundImage",
                    });
                    setHoveredMedia(null);
                  }}
                >
                  <LucideIcons.ImageIcon className="w-3.5 h-3.5 text-brand-yellow" />
                  Replace Background
                </button>
              </div>
            ) : (
              // Replace button for standard images/videos (centered)
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  className="pointer-events-auto flex items-center gap-2 bg-[#111]/90 backdrop-blur-md text-white text-[12px] font-semibold px-4 py-2 rounded-xl border border-white/[0.15] shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-[#1a1a1a] hover:border-white/25 active:scale-95 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMediaModal({
                      isOpen: true,
                      mediaType: hoveredMedia.type === "video" ? "video" : "image",
                      ofiqId: hoveredMedia.ofiqId,
                      patchMode: "src",
                    });
                    setHoveredMedia(null);
                  }}
                >
                  <LucideIcons.ImageIcon className="w-3.5 h-3.5 text-brand-yellow" />
                  Replace {hoveredMedia.type === "video" ? "Video" : "Image"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {isEditActive && (
        <MediaPickerModal
          open={mediaModal.isOpen}
          mediaType={mediaModal.mediaType}
          onSelect={handleMediaSave}
          onClose={() => setMediaModal((p) => ({ ...p, isOpen: false }))}
        />
      )}
    </EditModeCtx.Provider>
  );
}
