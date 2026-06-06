"use client";

import React, { useEffect, useState, useRef } from "react";
import * as LucideIcons from "lucide-react";
import * as FramerMotion from "framer-motion";
import { useBuilderStore } from "@/store/builderStore";

interface DynamicRunnerProps {
  code?: string;
  compiledCode?: string;
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

export function DynamicRunner({ code, compiledCode }: DynamicRunnerProps) {
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
                openingEnd: path.node.openingElement.end,
                closingStart: path.node.closingElement ? path.node.closingElement.start : null,
                srcAttr: null as any,
                hasOnlyTextChildren: true
              };

              path.node.openingElement.attributes.forEach((attr: any) => {
                if (attr.type === 'JSXAttribute' && attr.name.name === 'src' && attr.value?.type === 'StringLiteral') {
                  info.srcAttr = { start: attr.value.start, end: attr.value.end, value: attr.value.value };
                }
              });

              path.node.children.forEach((child: any) => {
                if (child.type === 'JSXElement') {
                  info.hasOnlyTextChildren = false;
                }
              });

              astMap.set(id, info);
              
              path.node.openingElement.attributes.push(
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
        // Schedule update to avoid React render cycle warnings
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

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!isBuilderMode || !code) return;
    const target = e.target as HTMLElement;
    const id = target.getAttribute('data-ofiq-id');
    if (!id) return;
    
    const info = astMap.get(id);
    if (!info) return;

    if (target.tagName.toLowerCase() === 'img' || target.tagName.toLowerCase() === 'video' || target.tagName.toLowerCase() === 'iframe') {
      e.preventDefault();
      const currentSrc = target.getAttribute('src') || '';
      const newSrc = window.prompt("Enter new source URL:", currentSrc);
      if (newSrc !== null && info.srcAttr) {
        // Replace src attribute. Note: info.srcAttr.start and end include the quotes.
        // We replace inner content between the quotes.
        const start = info.srcAttr.start + 1;
        const end = info.srcAttr.end - 1;
        const newCode = code.substring(0, start) + newSrc + code.substring(end);
        useBuilderStore.getState().updateCode(newCode);
      }
    } else {
      // It's a text container
      if (info.hasOnlyTextChildren && info.closingStart && !target.isContentEditable) {
        e.preventDefault();
        target.contentEditable = "true";
        target.focus();
        
        // Ensure cursor is placed properly
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  };

  const handleContainerBlur = (e: React.FocusEvent) => {
    if (!isBuilderMode || !code) return;
    const target = e.target as HTMLElement;
    if (target.isContentEditable) {
      target.contentEditable = "false";
      const id = target.getAttribute('data-ofiq-id');
      if (!id) return;
      const info = astMap.get(id);
      
      if (info && info.hasOnlyTextChildren && info.closingStart) {
        const newText = target.innerText;
        const newCode = code.substring(0, info.openingEnd) + newText + code.substring(info.closingStart);
        useBuilderStore.getState().updateCode(newCode);
      }
    }
  };

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey === false) {
      const target = e.target as HTMLElement;
      if (target.isContentEditable) {
        e.preventDefault();
        target.blur();
      }
    }
  };

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
  return (
    <div 
      className="w-full h-full min-h-screen" 
      onClick={handleContainerClick}
      onBlur={handleContainerBlur}
      onKeyDown={handleContainerKeyDown}
    >
      <PageComponent />
    </div>
  );
}
