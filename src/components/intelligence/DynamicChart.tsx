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

const PIE_COLORS = ['hsl(var(--primary))', '#3b82f6', '#a855f7', '#f43f5e', '#f59e0b', '#10b981'];

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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {parsedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                itemStyle={{ color: "#fff" }}
                contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case "radar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={parsedData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.4}
              />
              <Tooltip 
                 contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 my-6", className)}>
      {title && (
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      )}
      
      <div className="h-[280px] w-full mt-4">
        {renderChart()}
      </div>

      {summary && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-sm text-white/80 leading-relaxed font-medium">
            <span className="text-brand-yellow font-bold mr-2">Key Insight:</span>
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}
