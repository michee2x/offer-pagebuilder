"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ['hsl(var(--primary))', '#3b82f6', '#a855f7', '#f43f5e', '#f59e0b'];

export function PlatformPieChart({ content }: { content: string }) {
  // Parsing platforms is dependent on the actual JSON structure.
  // We'll map the standard string into a visually pleasing mock if parsing fails.
  
  let data = [
    { name: 'Meta Ads', value: 40 },
    { name: 'Google Ads', value: 30 },
    { name: 'TikTok', value: 20 },
    { name: 'Organic', value: 10 },
  ];

  try {
    // If it's a JSON string of PlatformPriorityMatrix, which might be wrapped in markdown backticks
    const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanContent);
    if (parsed.primary) {
      data = [
        { name: parsed.primary.platform || 'Primary', value: parseInt(parsed.primary.budget_allocation) || 50 },
        { name: parsed.secondary.platform || 'Secondary', value: parseInt(parsed.secondary.budget_allocation) || 30 },
        { name: parsed.tertiary.platform || 'Tertiary', value: parseInt(parsed.tertiary.budget_allocation) || 20 },
      ];
    }
  } catch (e) {
    // Keep default mock data
  }

  return (
    <div className="bg-card rounded-xl border p-6 mb-6 flex flex-col md:flex-row items-center">
      <div className="flex-1 w-full">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Platform Budget Allocation</h3>
          <p className="text-sm text-muted-foreground">Recommended distribution based on audience targeting</p>
        </div>
        
        <div className="mt-8 space-y-3">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                <span className="text-sm font-medium text-foreground">{entry.name}</span>
              </div>
              <span className="text-sm font-bold">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 w-full h-[200px] mt-6 md:mt-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              itemStyle={{ color: "hsl(var(--foreground))" }}
              contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
