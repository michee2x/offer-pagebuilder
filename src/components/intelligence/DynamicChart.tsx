"use client";

import React from "react";
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartDataPoint {
  name: string;
  value: number;
}

interface DynamicChartProps {
  type: "bar" | "pie" | "radar";
  data: ChartDataPoint[] | string;
  title?: string;
  summary?: string;
  className?: string;
}

const PIE_COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#f5a623', '#10b981', '#3b82f6'];

export function DynamicChart({ type, data, title, summary, className }: DynamicChartProps) {
  let parsedData: ChartDataPoint[] = [];

  if (typeof data === "string") {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse chart data", e);
      return null;
    }
  } else {
    parsedData = data;
  }

  if (!parsedData || parsedData.length === 0) return null;

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={parsedData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                itemStyle={{ color: "#06b6d4", fontWeight: "bold" }}
              />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={parsedData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {parsedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                itemStyle={{ color: "#fff", fontWeight: "bold" }}
                contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case "radar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={parsedData}>
              <defs>
                <linearGradient id="radarDynGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Value"
                dataKey="value"
                stroke="#a855f7"
                strokeWidth={2}
                fill="url(#radarDynGradient)"
                fillOpacity={1}
              />
              <Tooltip 
                 contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                 itemStyle={{ color: "#a855f7", fontWeight: "bold" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("bg-[#050B15]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 my-6 relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        {title && (
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        )}
        
        <div className="h-[280px] w-full mt-6">
          {renderChart()}
        </div>

        {summary && (
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-sm text-white/80 leading-relaxed font-medium">
              <span className="text-cyan-400 font-bold mr-2 uppercase tracking-wider text-[11px]">Key Insight:</span>
              <br />
              {summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
