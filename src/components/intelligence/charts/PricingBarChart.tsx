"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { useMemo } from "react";
import { Sparkles } from "lucide-react";

export function PricingBarChart({ content }: { content: string }) {
  // Parse 'content' for specific pricing recommendations
  // and dynamically generate price elasticity chart points
  const dynamicPricingData = useMemo(() => {
    // Attempt to extract the primary recommended price from the AI response
    // e.g. "RECOMMENDED PRICE: $1,497"
    const priceMatch = content.match(/\$?\d+(?:,\d+)?(?:\.\d+)?/); 
    const basePriceStr = priceMatch ? priceMatch[0].replace(/[^0-9.]/g, '') : "199";
    const basePrice = parseInt(basePriceStr, 10) || 199;

    // Generate elasticity curve around the base price
    const scales = [0.5, 0.8, 1, 1.5, 2.5];
    return scales.map((scale, index) => {
      const price = Math.round(basePrice * scale);
      // As price goes up, conversions drop
      const conversions = Math.round(1000 / scale);
      return {
        priceRaw: price,
        price: `$${price}`,
        conversions,
        revenue: price * conversions,
        isOptimal: index === 2 // Middle point is our target
      };
    });
  }, [content]);

  return (
    <div className="bg-[#050B15]/80 backdrop-blur-xl flex flex-col items-center justify-between gap-6 rounded-2xl border border-white/10 p-8 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center w-full justify-between relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Price Elasticity Simulation</h3>
          <p className="text-sm text-white/50">Estimated revenue across different structured price points</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400">
           <Sparkles className="w-4 h-4" />
           <span className="text-xs font-bold uppercase tracking-wider">Optimal Zone Highlighted</span>
        </div>
      </div>
      
      <div className="h-[280px] w-full mt-6 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dynamicPricingData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="50%" stopColor="#a855f7" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.8}/>
              </linearGradient>
              <linearGradient id="colorRevenueDim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="price" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500 }}
              tickFormatter={(value) => `$${value/1000}k`}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
              itemStyle={{ color: "#a855f7", fontWeight: "bold" }}
              formatter={(value: number, name: string) => [
                name === "revenue" ? `$${value.toLocaleString()}` : value, 
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Bar 
              dataKey="revenue" 
              radius={[6, 6, 0, 0]} 
            >
               {dynamicPricingData.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={entry.isOptimal ? "url(#colorRevenue)" : "url(#colorRevenueDim)"} />
               ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
