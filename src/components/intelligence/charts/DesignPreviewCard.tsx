"use client";

import { useMemo, useState } from "react";
import { Copy, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DesignPreviewCard({ content }: { content: string }) {
  // Extract hex colors from string, or provide fallback
  const baseColors = useMemo(() => {
    const hexRegex = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/gi;
    const matches = content.match(hexRegex);
    if (matches && matches.length >= 3) {
      return matches.slice(0, 3);
    }
    // Fallback vibrant palette if AI didn't provide hex exacts
    return ["#1E3A8A", "#F59E0B", "#E11D48"];
  }, [content]);

  const [colors, setColors] = useState<string[]>(baseColors);

  // Extract Typography font
  const fontMatch = content.match(/(?:TYPOGRAPHY(?: DIRECTION)?:\s*)([a-zA-Z\s]+?)(?:\s+(?:for|with|and|,))/i);
  const fontFamily = fontMatch ? fontMatch[1].trim() : "Inter";

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
  };

  const handleRandomize = () => {
    // Generate a set of vibrant hex colors
    const hue = Math.floor(Math.random() * 360);
    const p = `hsl(${hue}, 80%, 50%)`;
    const s = `hsl(${(hue + 120) % 360}, 80%, 50%)`;
    const a = `hsl(${(hue + 240) % 360}, 80%, 50%)`;

    // Quick fn to convert HSL to HEX to keep hex format
    const hslToHex = (h: number, s: number, l: number) => {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };

    setColors([
      hslToHex(hue, 80, 45).toUpperCase(),
      hslToHex((hue + 45) % 360, 90, 55).toUpperCase(),
      hslToHex((hue + 180) % 360, 100, 60).toUpperCase(),
    ]);
  };

  return (
    <div className="bg-card flex flex-col md:flex-row gap-6 rounded-xl border p-6 mb-6">
      
      {/* Interactive Palette */}
      <div className="flex-1 space-y-4 border-r border-border/50 pr-6">
        <div className="flex items-center justify-between">
           <div>
              <h3 className="text-lg font-semibold text-foreground">Color Palette</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Recommended structural colors</p>
           </div>
           <Button variant="outline" size="sm" onClick={handleRandomize} className="h-8 gap-2 border-dashed">
              <PlusSquare className="w-3.5 h-3.5" />
              Customize
           </Button>
        </div>

        <div className="flex gap-4 items-center mt-2">
           {colors.map((color, idx) => {
             const labels = ["Primary", "Secondary", "Accent"];
             return (
               <div key={idx} className="flex-1 group relative">
                 {/* Invisible Color Picker Overlay */}
                 <input 
                   type="color" 
                   value={color}
                   onChange={(e) => {
                     const newColors = [...colors];
                     newColors[idx] = e.target.value.toUpperCase();
                     setColors(newColors);
                   }}
                   className="absolute inset-x-0 top-0 w-full h-16 opacity-0 cursor-pointer z-10"
                   title="Click to change color"
                 />
                 
                 <div
                   className="h-16 w-full rounded-lg shadow-sm border border-white/10 transition-transform group-hover:scale-105"
                   style={{ backgroundColor: color }}
                 />
                 
                 <div 
                   className="mt-2 text-center cursor-pointer hover:bg-white/5 rounded py-1 transition-colors" 
                   onClick={() => handleCopyColor(color)}
                   title="Click to copy hex"
                 >
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground">{labels[idx]}</span>
                    <span className="block text-xs font-mono mt-0.5 text-foreground group-hover:text-primary">{color}</span>
                 </div>
               </div>
             )
           })}
        </div>
      </div>

      {/* Typography Preview */}
      <div className="flex-1 space-y-4 pl-0 md:pl-2">
         <div>
            <h3 className="text-lg font-semibold text-foreground">Typography Profile</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Visual rhythm & hierarchy</p>
         </div>
         
         <div className="p-4 bg-muted/40 rounded-lg border border-border/50 space-y-3">
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-muted-foreground">{fontFamily}</span>
             </div>
             <div>
                <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: `"${fontFamily}", sans-serif` }}>
                  The Quick Brown Fox
                </h1>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2" style={{ fontFamily: "Inter, sans-serif" }}>
                  Jumps over the lazy dog. Good design is obvious. Great design is transparent.
                </p>
             </div>
             
             <div className="pt-2 flex gap-2">
                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">Heading</span>
                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase">Body Text</span>
             </div>
         </div>
      </div>
    </div>
  );
}
