"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import * as LucideIcons from "lucide-react";
import * as FramerMotion from "framer-motion";
import { useBuilderStore } from "@/store/builderStore";
import { MediaPickerModal, MediaType } from "./ImagePickerModal";

interface DynamicRunnerProps {
  code?: string;
  compiledCode?: string;
  editMode?: boolean; // true = builder edit mode, false/undefined = preview/live
}

// Global map to store AST node locations for the current rendered code
const astMap = new Map<string, any>();

// Sandbox dynamic loader imports
const requireMock = (modName: string) => {
  if (modName === "react") return React;
  if (modName === "lucide-react") return LucideIcons;
  if (modName === "framer-motion" || modName === "motion") return FramerMotion;
  if (modName === "react-router-dom") {
    return {
      useNavigate: () => (path: string) => {
        if (
          typeof window !== "undefined" &&
          (window.location.pathname.startsWith("/p/") ||
          window.location.pathname.startsWith("/builder"))
        ) {
          useBuilderStore.getState().switchPage(path);
        } else if (typeof window !== "undefined") {
          window.location.pathname = path;
        }
      },
      Link: ({ to, children, ...props }: any) => {
        return React.createElement(
          "a",
          {
            href: to,
            onClick: (e: any) => {
              e.preventDefault();
              if (
                typeof window !== "undefined" &&
                (window.location.pathname.startsWith("/p/") ||
                window.location.pathname.startsWith("/builder"))
              ) {
                useBuilderStore.getState().switchPage(to);
              } else if (typeof window !== "undefined") {
                window.location.pathname = to;
              }
            },
            ...props
          },
          children
        );
      }
    };
  }
  return {};
};

const evaluateCode = (jsCode: string) => {
  const exportsObj: Record<string, any> = {};
  const moduleObj = { exports: exportsObj };
  const evaluator = new Function("React", "require", "exports", "module", jsCode);
  evaluator(React, requireMock, exportsObj, moduleObj);

  let Renderable = exportsObj.default || moduleObj.exports.default;
  if (!Renderable && typeof moduleObj.exports === "function") {
    Renderable = moduleObj.exports;
  }

  if (Renderable && (typeof Renderable === "function" || typeof Renderable === "object")) {
    return Renderable;
  } else {
    let foundFunc: any = null;
    const targetObj = typeof moduleObj.exports === "object" ? moduleObj.exports : exportsObj;
    for (const key of Object.keys(targetObj)) {
      if (typeof targetObj[key] === "function") {
        foundFunc = targetObj[key];
        break;
      }
    }
    if (foundFunc) return foundFunc;
    throw new Error("No default export or renderable component function found.");
  }
};


// ─── Main DynamicRunner Component ────────────────────────────────────────────
export function DynamicRunner({ code, compiledCode, editMode = false }: DynamicRunnerProps) {
  const [babelLoaded, setBabelLoaded] = useState(false);
  const [comp, setComp] = useState<React.ComponentType | null>(() => {
    if (compiledCode) {
      try {
        return evaluateCode(compiledCode);
      } catch (e: any) {
        console.error("SSR evaluation failed:", e);
        return null;
      }
    }
    return null;
  });
  const [err, setErr] = useState<string | null>(null);
  const isBuilderMode = !compiledCode && !!code;

  // Media edit modal state
  const [mediaModal, setMediaModal] = useState<{
    isOpen: boolean;
    mediaType: MediaType;
    ofiqId: string;
  }>({ isOpen: false, mediaType: "image", ofiqId: "" });

  // 1. If compiledCode is provided, just run it instantly!
  useEffect(() => {
    if (!compiledCode) return;
    try {
      setErr(null);
      const Renderable = evaluateCode(compiledCode);
      setComp(() => Renderable);
    } catch (e: any) {
      console.error("[DynamicRunner] Failed to evaluate compiledCode:", e);
      setErr(e.message || "Failed to evaluate pre-compiled component.");
    }
  }, [compiledCode]);

  // 2. Load Babel only if we are in builder mode (no compiledCode)
  useEffect(() => {
    if (!isBuilderMode) return;
    if ((window as any).Babel) {
      setBabelLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/@babel/standalone@7.24.0/babel.min.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).Babel) setBabelLoaded(true);
      else setErr("Babel loaded but window.Babel is undefined.");
    };
    script.onerror = () => setErr("Failed to load dynamic transpiler engine.");
    document.body.appendChild(script);
  }, [isBuilderMode]);

  // 3. Transpile TSX if in builder mode
  useEffect(() => {
    if (!isBuilderMode || !babelLoaded || !code) return;

    try {
      setErr(null);
      let cleanedCode = code;
      cleanedCode = cleanedCode.replace(/^<page\b[^>]*>\n?/i, '').replace(/\n?<\/page>$/i, '').trim();
      if (cleanedCode.startsWith("{`")) {
        cleanedCode = cleanedCode.replace(/^{`\n?/, '').replace(/\n?`}$/, '').trim();
      }
      if (!cleanedCode.includes("export default") && !cleanedCode.includes("module.exports")) {
        const funcMatches = [...cleanedCode.matchAll(/function\s+(\w+)\s*\(/g)];
        if (funcMatches.length > 0) {
          const lastFuncName = funcMatches[funcMatches.length - 1][1];
          cleanedCode += `\nexport default ${lastFuncName};`;
        }
      }

      astMap.clear();

      const Babel = (window as any).Babel;
      
      const ofiqEditorPlugin = function(babel: any) {
        const t = babel.types;
        return {
          visitor: {
            JSXElement(path: any) {
              const id = 'el_' + Math.random().toString(36).substring(2, 11);
              
              const info = {
                tagName: '',
                isLeaf: true
              };

              // Get the tag name
              const opening = path.node.openingElement;
              if (opening.name && opening.name.name) {
                info.tagName = opening.name.name.toLowerCase();
              }

              path.node.children.forEach((child: any) => {
                if (child.type === 'JSXElement') {
                  info.isLeaf = false;
                }
              });

              astMap.set(id, info);
              
              opening.attributes.push(
                t.jSXAttribute(t.jSXIdentifier('data-ofiq-id'), t.stringLiteral(id))
              );
            }
          }
        };
      };

      const transpiled = Babel.transform(cleanedCode, {
        presets: ["env", "react"],
        plugins: [
          [Babel.availablePlugins["transform-typescript"], { isTSX: true, allExtensions: true }],
          ofiqEditorPlugin
        ],
        filename: "generated-funnel.tsx",
      }).code;

      const store = useBuilderStore.getState();
      const activePagePath = store.activePagePath;
      const currentCompiled = store.pages[activePagePath]?.compiledCode;
      
      if (currentCompiled !== transpiled) {
        setTimeout(() => {
          useBuilderStore.getState().updateCode(code, transpiled);
        }, 0);
      }

      const Renderable = evaluateCode(transpiled);
      setComp(() => Renderable);
    } catch (compileError: any) {
      console.error("[DynamicRunner] Compilation failed:", compileError);
      setErr(compileError?.message || "Failed to transpile generated component.");
    }
  }, [code, babelLoaded, isBuilderMode]);

  // ─── Re-parse helpers for exact source updates ────────────────────────────
  const replaceTextInSource = useCallback((currentCode: string, targetId: string, newText: string) => {
    if (!(window as any).Babel) return currentCode;
    const Babel = (window as any).Babel;
    let modifiedCode = currentCode;

    const modifierPlugin = function(babel: any) {
      const t = babel.types;
      return {
        visitor: {
          JSXElement(path: any) {
            const hasMatch = path.node.openingElement.attributes.some((attr: any) => 
              attr.type === 'JSXAttribute' && 
              attr.name.name === 'data-ofiq-id' && 
              attr.value?.value === targetId
            );

            if (hasMatch) {
              // Replace all children with a single text node or expression container if it has quotes
              // Simple heuristic: just wrap in JSXText. Since Babel generates the string, we might need to handle escaping.
              // A safer way is to use a JSXExpressionContainer with a string literal if there are special characters.
              path.node.children = [t.jsxExpressionContainer(t.stringLiteral(newText))];
            }
          }
        }
      };
    };

    try {
      // We parse the code, modify the AST, and generate back
      const res = Babel.transform(currentCode, {
        presets: ["react"],
        plugins: [
          [Babel.availablePlugins["transform-typescript"], { isTSX: true, allExtensions: true }],
          modifierPlugin
        ],
        retainLines: true, // try to keep original formatting
      });
      
      if (res && res.code) {
        // Babel might add semicolons or change some formatting, but it preserves functionality
        modifiedCode = res.code.replace(/;$/, ''); // strip trailing semicolon if added
      }
    } catch (e) {
      console.error("Failed to replace text in source via AST", e);
    }
    
    return modifiedCode;
  }, []);

  const replaceMediaSrcInSource = useCallback((currentCode: string, targetId: string, newSrc: string) => {
    if (!(window as any).Babel) return currentCode;
    const Babel = (window as any).Babel;
    let modifiedCode = currentCode;

    const modifierPlugin = function(babel: any) {
      const t = babel.types;
      return {
        visitor: {
          JSXElement(path: any) {
            const hasMatch = path.node.openingElement.attributes.some((attr: any) => 
              attr.type === 'JSXAttribute' && 
              attr.name.name === 'data-ofiq-id' && 
              attr.value?.value === targetId
            );

            if (hasMatch) {
              let srcFound = false;
              path.node.openingElement.attributes.forEach((attr: any) => {
                if (attr.type === 'JSXAttribute' && attr.name.name === 'src') {
                  attr.value = t.stringLiteral(newSrc);
                  srcFound = true;
                }
              });
              
              // If src didn't exist, add it
              if (!srcFound) {
                path.node.openingElement.attributes.push(
                  t.jSXAttribute(t.jSXIdentifier('src'), t.stringLiteral(newSrc))
                );
              }
            }
          }
        }
      };
    };

    try {
      const res = Babel.transform(currentCode, {
        presets: ["react"],
        plugins: [
          [Babel.availablePlugins["transform-typescript"], { isTSX: true, allExtensions: true }],
          modifierPlugin
        ],
        retainLines: true,
      });
      if (res && res.code) {
        modifiedCode = res.code.replace(/;$/, '');
      }
    } catch (e) {
      console.error("Failed to replace media src in source via AST", e);
    }
    
    return modifiedCode;
  }, []);

  // ─── Edit Mode Handlers ─────────────────────────────────────────────────
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    // Only handle clicks in edit mode within the builder
    if (!editMode || !isBuilderMode || !code) return;
    
    const target = e.target as HTMLElement;
    // Walk up to find the element with data-ofiq-id
    let el: HTMLElement | null = target;
    while (el && !el.getAttribute('data-ofiq-id')) {
      el = el.parentElement;
    }
    if (!el) return;

    const id = el.getAttribute('data-ofiq-id')!;
    const info = astMap.get(id);
    if (!info) return;

    const tagName = el.tagName.toLowerCase();

    // Media elements: open the URL editor modal
    if (tagName === 'img' || tagName === 'video' || tagName === 'iframe') {
      e.preventDefault();
      e.stopPropagation();
      const mediaType = tagName === "img" ? "image" : tagName === "video" ? "video" : "any";
      setMediaModal({
        isOpen: true,
        mediaType,
        ofiqId: id,
      });
      return;
    }

    // Text elements: make them contentEditable if they are text tags or leaf nodes
    // This allows editing headings like `<h1>Text <span ...>highlight</span></h1>`
    const textTags = ['h1','h2','h3','h4','h5','h6','p','span','a','button','li','label','strong','em','blockquote'];
    const isTextNode = textTags.includes(tagName) || info.isLeaf;

    if (isTextNode && !el.isContentEditable) {
      e.preventDefault();
      e.stopPropagation();
      el.contentEditable = "true";
      el.style.outline = "2px solid rgba(6, 182, 212, 0.5)";
      el.style.outlineOffset = "2px";
      el.style.borderRadius = "4px";
      el.focus();
      
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [editMode, isBuilderMode, code]);

  const handleContainerBlur = useCallback((e: React.FocusEvent) => {
    if (!editMode || !isBuilderMode || !code) return;
    const target = e.target as HTMLElement;
    if (target.isContentEditable) {
      target.contentEditable = "false";
      target.style.outline = "";
      target.style.outlineOffset = "";
      target.style.borderRadius = "";
      const id = target.getAttribute('data-ofiq-id');
      if (!id) return;
      const info = astMap.get(id);
      
      const tagName = target.tagName.toLowerCase();
      const textTags = ['h1','h2','h3','h4','h5','h6','p','span','a','button','li','label','strong','em','blockquote'];
      const isTextNode = textTags.includes(tagName) || (info && info.isLeaf);
      
      if (isTextNode) {
        const newText = target.innerText;
        const newCode = replaceTextInSource(code, id, newText);
        useBuilderStore.getState().updateCode(newCode);
      }
    }
  }, [editMode, isBuilderMode, code]);

  const handleContainerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!editMode) return;
    if (e.key === 'Enter' && e.shiftKey === false) {
      const target = e.target as HTMLElement;
      if (target.isContentEditable) {
        e.preventDefault();
        target.blur();
      }
    }
  }, [editMode]);

  const handleMediaSave = useCallback((newSrc: string) => {
    if (!code || !mediaModal.ofiqId) {
      setMediaModal(prev => ({ ...prev, isOpen: false }));
      return;
    }
    const newCode = replaceMediaSrcInSource(code, mediaModal.ofiqId, newSrc);
    useBuilderStore.getState().updateCode(newCode);
    setMediaModal(prev => ({ ...prev, isOpen: false }));
  }, [code, mediaModal.ofiqId, replaceMediaSrcInSource]);

  // ─── Render ──────────────────────────────────────────────────────────────
  if (err) {
    return (
      <div className="p-8 border border-red-500/20 bg-red-500/5 text-red-400 rounded-2xl max-w-2xl mx-auto my-12 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <LucideIcons.AlertTriangle className="text-red-500 w-6 h-6" />
          <h4 className="font-bold text-lg">Dynamic Compiler Notice</h4>
        </div>
        <p className="text-sm opacity-80 mb-3">
          The engine encountered a syntax or mapping issue in the generated page code. Let the AI know to correct this:
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

  // In edit mode: attach click/blur/keydown handlers for inline editing
  // In preview/live mode: render cleanly without any edit handlers
  if (editMode && isBuilderMode) {
    return (
      <>
        <div 
          className="w-full h-full min-h-screen" 
          onClick={handleContainerClick}
          onBlurCapture={handleContainerBlur}
          onKeyDown={handleContainerKeyDown}
          style={{ cursor: "default" }}
        >
          <PageComponent />
        </div>
        <MediaPickerModal
          open={mediaModal.isOpen}
          mediaType={mediaModal.mediaType}
          onSelect={handleMediaSave}
          onClose={() => setMediaModal(prev => ({ ...prev, isOpen: false }))}
        />
      </>
    );
  }

  // Preview / live mode — no edit handlers, elements behave normally
  return (
    <div className="w-full h-full min-h-screen">
      <PageComponent />
    </div>
  );
}
