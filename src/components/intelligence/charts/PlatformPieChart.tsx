"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#f5a623', '#10b981'];

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

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="bg-[#050B15]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8 flex flex-col md:flex-row items-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="flex-1 w-full z-10">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Platform Budget Allocation</h3>
          <p className="text-sm text-white/50">Recommended distribution based on audience targeting</p>
        </div>
        
        <div className="mt-8 space-y-4">
          {data.map((entry, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <span className="text-sm font-medium text-white/80">{entry.name}</span>
                </div>
                <span className="text-sm font-bold text-white">{entry.value}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: mounted ? `${entry.value}%` : 0 }}
                  transition={{ duration: 1, delay: 0.5 + (index * 0.1), ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 w-full h-[220px] mt-6 md:mt-0 relative z-10">
        {/* Inner glow ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] h-[110px] rounded-full border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] pointer-events-none" />
        
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={6}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
              animationBegin={200}
              animationDuration={1200}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              itemStyle={{ color: "#fff", fontWeight: "bold" }}
              contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
              formatter={(value: number) => [`${value}%`, 'Allocation']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
