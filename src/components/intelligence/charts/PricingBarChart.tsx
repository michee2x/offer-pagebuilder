"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo } from "react";

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
    return scales.map(scale => {
      const price = Math.round(basePrice * scale);
      // As price goes up, conversions drop
      const conversions = Math.round(1000 / scale);
      return {
        priceRaw: price,
        price: `$${price}`,
        conversions,
        revenue: price * conversions
      };
    });
  }, [content]);

  return (
    <div className="bg-card flex flex-col items-center justify-between gap-6 rounded-xl border p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center w-full justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Price Elasticity Simulation</h3>
          <p className="text-sm text-muted-foreground">Estimated revenue across different structured price points</p>
        </div>
      </div>
      
      <div className="h-[250px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dynamicPricingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" className="opacity-50" />
            <XAxis 
              dataKey="price" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(value) => `$${value/1000}k`}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
              contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number, name: string) => [
                name === "revenue" ? `$${value.toLocaleString()}` : value, 
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Bar 
              dataKey="revenue" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
