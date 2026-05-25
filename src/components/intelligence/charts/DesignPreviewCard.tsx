"use client";

import { useMemo, useState } from "react";
import { Copy, PlusSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DesignPreviewCard({ content }: { content: string }) {
  // Extract hex colors from string, or provide fallback
  const baseColors = useMemo(() => {
    const hexRegex = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/gi;
    const matches = content.match(hexRegex);
    if (matches && matches.length >= 3) {
      return matches.slice(0, 3);
    }
    // Fallback vibrant palette if AI didn't provide hex exacts
    return ["#06b6d4", "#a855f7", "#ec4899"];
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
      hslToHex(hue, 80, 50).toUpperCase(),
      hslToHex((hue + 60) % 360, 90, 55).toUpperCase(),
      hslToHex((hue + 180) % 360, 100, 60).toUpperCase(),
    ]);
  };

  return (
    <div className="bg-[#050B15]/80 backdrop-blur-xl flex flex-col md:flex-row gap-8 rounded-2xl border border-white/10 p-8 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
      
      {/* Interactive Palette */}
      <div className="flex-1 space-y-6 md:border-r border-white/10 md:pr-8 relative z-10">
        <div className="flex items-center justify-between">
           <div>
              <h3 className="text-xl font-bold text-white">Color Palette</h3>
              <p className="text-sm text-white/50 mt-1">Recommended structural colors</p>
           </div>
           <Button 
             variant="outline" 
             size="sm" 
             onClick={handleRandomize} 
             className="h-9 gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all hover:scale-105"
           >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Auto-Tune
           </Button>
        </div>

        <div className="flex gap-4 items-center mt-4">
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
                   className="absolute inset-x-0 top-0 w-full h-24 opacity-0 cursor-pointer z-10"
                   title="Click to change color"
                 />
                 
                 <div
                   className="h-24 w-full rounded-2xl shadow-lg border border-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl relative overflow-hidden"
                   style={{ backgroundColor: color }}
                 >
                   <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
                 
                 <div 
                   className="mt-3 text-center cursor-pointer bg-white/5 hover:bg-white/10 rounded-xl py-2 transition-all group-hover:-translate-y-1" 
                   onClick={() => handleCopyColor(color)}
                   title="Click to copy hex"
                 >
                    <span className="block text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1">{labels[idx]}</span>
                    <span className="block text-sm font-mono font-bold text-white">{color}</span>
                 </div>
               </div>
             )
           })}
        </div>
      </div>

      {/* Typography Preview */}
      <div className="flex-1 space-y-6 md:pl-4 relative z-10">
         <div>
            <h3 className="text-xl font-bold text-white">Typography Profile</h3>
            <p className="text-sm text-white/50 mt-1">Visual rhythm & hierarchy</p>
         </div>
         
         <div className="p-6 bg-[#0a0a0a]/50 rounded-2xl border border-white/10 space-y-4 relative overflow-hidden group hover:border-white/20 transition-colors">
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             
             <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
                  {fontFamily}
                </span>
             </div>
             <div className="relative z-10">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70" style={{ fontFamily: `"${fontFamily}", sans-serif` }}>
                  The Quick Brown Fox
                </h1>
                <p className="text-sm text-white/60 mt-3 leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                  Jumps over the lazy dog. Good design is obvious. Great design is transparent. Focus on readability and visual hierarchy.
                </p>
             </div>
             
             <div className="pt-4 flex gap-3 relative z-10 border-t border-white/5 mt-4">
                <span className="inline-flex px-2 py-1 rounded md flex items-center justify-center text-[10px] font-bold bg-white/10 text-white uppercase tracking-wider">Heading</span>
                <span className="inline-flex px-2 py-1 rounded md flex items-center justify-center text-[10px] font-bold bg-white/5 text-white/50 uppercase tracking-wider">Body Text</span>
             </div>
         </div>
      </div>
    </div>
  );
}
