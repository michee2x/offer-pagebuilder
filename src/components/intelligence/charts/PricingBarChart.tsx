"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const MOCK_PRICING_DATA = [
  { price: "$99", conversions: 400, revenue: 39600 },
  { price: "$199", conversions: 300, revenue: 59700 },
  { price: "$299", conversions: 250, revenue: 74750 },
  { price: "$499", conversions: 120, revenue: 59880 },
  { price: "$999", conversions: 40, revenue: 39960 },
];

export function PricingBarChart({ content: _content }: { content: string }) {
  // Normally we would parse 'content' for specific pricing recommendations,
  // but for the visual UI simulation, we will display a mock price elasticity chart
  
  return (
    <div className="bg-card rounded-xl border p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Price Elasticity Simulation</h3>
          <p className="text-sm text-muted-foreground">Estimated revenue across different price points</p>
        </div>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_PRICING_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                name === "revenue" ? `$${value}` : value, 
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
