"use client";

import React, { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import * as FramerMotion from "framer-motion";
import { useBuilderStore } from "@/store/builderStore";

interface DynamicRunnerProps {
  code: string;
}

export function DynamicRunner({ code }: DynamicRunnerProps) {
  const [babelLoaded, setBabelLoaded] = useState(false);
  const [comp, setComp] = useState<React.ComponentType | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // 1. Load Babel Standalone from CDN asynchronously
  useEffect(() => {
    const registerTsxPreset = (Babel: any) => {
      if (Babel && !Babel.availablePresets["typescript-tsx"]) {
        Babel.registerPreset("typescript-tsx", {
          presets: [
            [
              Babel.availablePresets["typescript"],
              { isTSX: true, allExtensions: true }
            ]
          ]
        });
      }
    };

    if ((window as any).Babel) {
      registerTsxPreset((window as any).Babel);
      setBabelLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/@babel/standalone@7.24.0/babel.min.js";
    script.async = true;
    script.onload = () => {
      const Babel = (window as any).Babel;
      if (Babel) {
        registerTsxPreset(Babel);
        setBabelLoaded(true);
      } else {
        setErr("Babel loaded but window.Babel is undefined.");
      }
    };
    script.onerror = () => setErr("Failed to load dynamic transpiler engine.");
    document.body.appendChild(script);

    return () => {
      // Keep Babel loaded globally for subsequent compilation cycles
    };
  }, []);

  // 2. Transpile and compile the TSX string whenever it changes
  useEffect(() => {
    if (!babelLoaded || !code) return;

    try {
      setErr(null);

      // Ensure the TSX code exports a default or named function component
      let cleanedCode = code;
      if (!cleanedCode.includes("export default") && !cleanedCode.includes("module.exports")) {
        // Fallback: Find the last function declaration name and append export default
        const funcMatches = [...cleanedCode.matchAll(/function\s+(\w+)\s*\(/g)];
        if (funcMatches.length > 0) {
          const lastFuncName = funcMatches[funcMatches.length - 1][1];
          cleanedCode += `\nexport default ${lastFuncName};`;
        }
      }

      // Transpile TSX to ES5 JavaScript
      const transpiled = (window as any).Babel.transform(cleanedCode, {
        presets: ["env", "react", "typescript-tsx"],
        filename: "generated-funnel.tsx",
      }).code;

      // Sandbox dynamic loader imports
      const requireMock = (modName: string) => {
        if (modName === "react") return React;
        if (modName === "lucide-react") return LucideIcons;
        if (modName === "framer-motion") return FramerMotion;
        if (modName === "motion") return FramerMotion;
        if (modName === "react-router-dom") {
          return {
            useNavigate: () => (path: string) => {
              if (
                window.location.pathname.startsWith("/p/") ||
                window.location.pathname.startsWith("/builder")
              ) {
                useBuilderStore.getState().switchPage(path);
              } else {
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
                      window.location.pathname.startsWith("/p/") ||
                      window.location.pathname.startsWith("/builder")
                    ) {
                      useBuilderStore.getState().switchPage(to);
                    } else {
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

      const exportsObj: Record<string, any> = {};
      const moduleObj = { exports: exportsObj };

      // Evaluate the transpiled script
      const evaluator = new Function(
        "React",
        "require",
        "exports",
        "module",
        transpiled
      );
      evaluator(React, requireMock, exportsObj, moduleObj);

      // Extract the renderable component
      let Renderable = exportsObj.default || moduleObj.exports.default;
      if (!Renderable && typeof moduleObj.exports === "function") {
        Renderable = moduleObj.exports;
      }

      if (Renderable && (typeof Renderable === "function" || typeof Renderable === "object")) {
        setComp(() => Renderable);
      } else {
        // Fallback: search for any exported function if default wasn't set properly
        let foundFunc: any = null;
        const targetObj = typeof moduleObj.exports === "object" ? moduleObj.exports : exportsObj;
        for (const key of Object.keys(targetObj)) {
          if (typeof targetObj[key] === "function") {
            foundFunc = targetObj[key];
            break;
          }
        }
        if (foundFunc) {
          setComp(() => foundFunc);
        } else {
          throw new Error(
            "No default export or renderable component function found in page code."
          );
        }
      }
    } catch (compileError: any) {
      console.error("[DynamicRunner] Compilation failed:", compileError);
      setErr(compileError?.message || "Failed to transpile generated component.");
    }
  }, [code, babelLoaded]);

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

  if (!babelLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-sm font-medium opacity-60 animate-pulse">
          Booting compiler engine...
        </p>
      </div>
    );
  }

  if (!comp) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-sm font-medium opacity-60 animate-pulse">
          Rendering dynamic premium canvas...
        </p>
      </div>
    );
  }

  const PageComponent = comp;
  return (
    <div className="w-full h-full min-h-screen">
      <PageComponent />
    </div>
  );
}
