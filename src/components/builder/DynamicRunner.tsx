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

// ─── AST Component Wrapper for Text Editing ────────────────────────────────
const EditableText = ({ ofiqId, childIndex, children }: { ofiqId: string, childIndex: number, children: React.ReactNode }) => {
  const [isEditing, setIsEditing] = useState(false);
  // Flatten children to a string if possible, or just stringify
  const textVal = typeof children === 'string' ? children : String(children);
  const [text, setText] = useState(textVal);

  useEffect(() => {
    if (!isEditing) {
      setText(typeof children === 'string' ? children : String(children));
    }
  }, [children, isEditing]);

  if (isEditing) {
    return (
      <span
        contentEditable
        suppressContentEditableWarning
        autoFocus
        onFocus={(e) => {
          // Move cursor to end
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(e.target);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }}
        onBlur={(e) => {
          setIsEditing(false);
          const newT = e.target.innerText;
          if (newT !== textVal) {
             // Call a global handler injected by DynamicRunner
             if (typeof (window as any).__updateOfiqText === 'function') {
               (window as any).__updateOfiqText(ofiqId, childIndex, newT);
             }
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className="outline-none ring-2 ring-cyan-500 rounded bg-cyan-500/10 min-w-[10px] inline-block"
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
      className="hover:ring-2 hover:ring-cyan-500/50 hover:rounded cursor-text transition-all"
    >
      {children}
    </span>
  );
};

const evaluateCode = (jsCode: string) => {
  const exportsObj: Record<string, any> = {};
  const moduleObj = { exports: exportsObj };
  const evaluator = new Function("React", "require", "exports", "module", "EditableText", jsCode);
  evaluator(React, requireMock, exportsObj, moduleObj, EditableText);

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
              // Avoid processing the EditableText wrapper itself
              if (path.node.openingElement.name.name === 'EditableText') return;

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

              // Wrap text children in EditableText
              const newChildren: any[] = [];
              path.node.children.forEach((child: any, i: number) => {
                let isText = false;
                if (child.type === 'JSXText' && child.value.trim().length > 0) {
                  isText = true;
                } else if (child.type === 'JSXExpressionContainer' && child.expression.type === 'StringLiteral') {
                  isText = true;
                } else if (child.type === 'JSXElement') {
                  info.isLeaf = false;
                }

                if (isText) {
                  const editable = t.jsxElement(
                    t.jsxOpeningElement(t.jsxIdentifier('EditableText'), [
                      t.jsxAttribute(t.jsxIdentifier('ofiqId'), t.stringLiteral(id)),
                      t.jsxAttribute(t.jsxIdentifier('childIndex'), t.numericLiteral(i))
                    ]),
                    t.jsxClosingElement(t.jsxIdentifier('EditableText')),
                    [child] // keep original child
                  );
                  newChildren.push(editable);
                } else {
                  newChildren.push(child);
                }
              });

              path.node.children = newChildren;
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
  const replaceTextNodeInSource = useCallback((currentCode: string, targetId: string, childIndex: number, newText: string) => {
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
              // Replace ONLY the specific child with a new string literal
              if (path.node.children && path.node.children[childIndex]) {
                 path.node.children[childIndex] = t.jsxExpressionContainer(t.stringLiteral(newText));
              }
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
  
  // Inject the global update handler for EditableText components
  useEffect(() => {
    if (editMode && isBuilderMode && code) {
      (window as any).__updateOfiqText = (ofiqId: string, childIndex: number, newText: string) => {
        const newCode = replaceTextNodeInSource(code, ofiqId, childIndex, newText);
        useBuilderStore.getState().updateCode(newCode);
      };
    }
    return () => {
      delete (window as any).__updateOfiqText;
    };
  }, [editMode, isBuilderMode, code, replaceTextNodeInSource]);

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

    // Text editing is now handled natively by the EditableText component wrapper injected via Babel.
    // No manual contentEditable or focus hacking required here!
  }, [editMode, isBuilderMode, code]);

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
