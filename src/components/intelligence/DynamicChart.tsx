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

const GRADIENT_CONTINUUM = [
  '#00f2fe', // Bright Cyan
  '#4facfe', // Light Blue
  '#5b86e5', // Royal Blue
  '#8e2de2', // Deep Purple
  '#a855f7', // Violet
  '#ec4899', // Pink
  '#ff0844', // Hot Red
  '#ffb199', // Peach
];

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

  // Handle case where AI outputs an object instead of an array
  if (parsedData && typeof parsedData === "object" && !Array.isArray(parsedData)) {
    parsedData = Object.entries(parsedData).map(([key, value]) => ({
      name: key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      value: Number(value) || 0
    }));
  }

  if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) return null;

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={parsedData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <defs>
                {GRADIENT_CONTINUUM.map((color, idx) => (
                  <linearGradient key={`barGrad${idx}`} id={`barGrad${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.2} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.05)", borderRadius: "12px", color: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                itemStyle={{ color: "#fff", fontWeight: "bold" }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {parsedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#barGrad${index % GRADIENT_CONTINUUM.length})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {GRADIENT_CONTINUUM.map((color, idx) => {
                  // Create a slightly shifted next color for a radial blend effect
                  const nextColor = GRADIENT_CONTINUUM[(idx + 1) % GRADIENT_CONTINUUM.length];
                  return (
                    <linearGradient key={`pieGrad${idx}`} id={`pieGrad${idx}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={nextColor} stopOpacity={0.8} />
                    </linearGradient>
                  );
                })}
              </defs>
              <Pie
                data={parsedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
                cornerRadius={4}
              >
                {parsedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#pieGrad${index % GRADIENT_CONTINUUM.length})`} />
                ))}
              </Pie>
              <Tooltip 
                itemStyle={{ color: "#fff", fontWeight: "bold" }}
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.05)", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
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
                  <stop offset="0%" stopColor="#00f2fe" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#8e2de2" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 500 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Value"
                dataKey="value"
                stroke="#00f2fe"
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
