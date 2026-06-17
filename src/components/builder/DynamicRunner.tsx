"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  createContext,
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
        (activePagePath === "/" && path.includes("upsell")) ||
        (activePagePath === "/upsell" && path.includes("thankyou")) ||
        (activePagePath === "/downsell" && path.includes("thankyou"));
        
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
  }>({ isOpen: false, mediaType: "image", ofiqId: "" });

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

  // ── Click handler: open media picker for img/video/iframe ─────────────────
  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode || !isBuilderMode) return;

      let el = e.target as HTMLElement | null;
      while (el && !el.getAttribute("data-ofiq-id")) el = el.parentElement;
      if (!el) return;

      const tag = el.tagName.toLowerCase();
      if (tag === "img" || tag === "video" || tag === "iframe") {
        e.preventDefault();
        e.stopPropagation();
        const mediaType: MediaType =
          tag === "img" ? "image" : tag === "video" ? "video" : "any";
        setMediaModal({
          isOpen: true,
          mediaType,
          ofiqId: el.getAttribute("data-ofiq-id")!,
        });
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
            (b: any) => makeMediaPatchPlugin(b, mediaModal.ofiqId, newSrc),
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
        className="w-full h-full min-h-screen"
        onClick={isEditActive ? handleContainerClick : undefined}
        style={isEditActive ? { cursor: "default" } : undefined}
      >
        <PageComponent />
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
