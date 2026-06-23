"use client";

import React, { useEffect, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ScoreRadarChart({ content }: { content: string }) {
  const parsedData = React.useMemo(() => {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const cleanContent = jsonMatch[0];
        const scores = JSON.parse(cleanContent);
        if (scores && (scores.overall !== undefined || scores.market_viability !== undefined)) {
          return {
            overall: scores.overall || Math.round(
              ((scores.market_viability || 0) +
               (scores.audience_clarity || 0) +
               (scores.offer_strength || 0) +
               (scores.price_value_alignment || 0) +
               (scores.uniqueness || 0) +
               (scores.proof_strength || 0) +
               (scores.conversion_readiness || 0)) / 7
            ),
            data: [
              { subject: 'Market Viability', A: scores.market_viability || 0, fullMark: 100 },
              { subject: 'Audience Clar.', A: scores.audience_clarity || 0, fullMark: 100 },
              { subject: 'Offer Strength', A: scores.offer_strength || 0, fullMark: 100 },
              { subject: 'Price-Value', A: scores.price_value_alignment || 0, fullMark: 100 },
              { subject: 'Uniqueness', A: scores.uniqueness || 0, fullMark: 100 },
              { subject: 'Proof Strength', A: scores.proof_strength || 0, fullMark: 100 },
              { subject: 'Conv. Ready', A: scores.conversion_readiness || 0, fullMark: 100 },
            ]
          };
        }
      }
    } catch (e) {
      // fallback
    }

    try {
      const chartMatch = content.match(/<chart[^>]*data=(['"])([\s\S]*?)\1/i);
      if (chartMatch) {
        const rawData = JSON.parse(chartMatch[2]);
        if (Array.isArray(rawData)) {
          const findVal = (names: string[]) => {
            const match = rawData.find((d: any) => d && d.name && names.some(n => d.name.toLowerCase().includes(n.toLowerCase())));
            return match ? Number(match.value) : 80;
          };
          const mv = findVal(['market', 'viability']);
          const ac = findVal(['audience', 'clar', 'hook']);
          const os = findVal(['offer', 'strength']);
          const pv = findVal(['price', 'elasticity', 'value']);
          const u = findVal(['uniqueness']);
          const ps = findVal(['proof', 'leverage', 'strength']);
          const cr = findVal(['conv', 'ready', 'readiness']);
          const overall = Math.round((mv + ac + os + pv + u + ps + cr) / 7);

          return {
            overall,
            data: [
              { subject: 'Market Viability', A: mv, fullMark: 100 },
              { subject: 'Audience Clar.', A: ac, fullMark: 100 },
              { subject: 'Offer Strength', A: os, fullMark: 100 },
              { subject: 'Price-Value', A: pv, fullMark: 100 },
              { subject: 'Uniqueness', A: u, fullMark: 100 },
              { subject: 'Proof Strength', A: ps, fullMark: 100 },
              { subject: 'Conv. Ready', A: cr, fullMark: 100 },
            ]
          };
        }
      }
    } catch (e) {
      // fallback
    }

    return {
      overall: 80,
      data: [
        { subject: 'Market Viability', A: 80, fullMark: 100 },
        { subject: 'Audience Clar.', A: 85, fullMark: 100 },
        { subject: 'Offer Strength', A: 80, fullMark: 100 },
        { subject: 'Price-Value', A: 75, fullMark: 100 },
        { subject: 'Uniqueness', A: 80, fullMark: 100 },
        { subject: 'Proof Strength', A: 70, fullMark: 100 },
        { subject: 'Conv. Ready', A: 80, fullMark: 100 },
      ]
    };
  }, [content]);

  const displayScore = parsedData?.overall || 0;

  if (!parsedData) {
    return <div className="text-sm text-muted-foreground p-4">Invalid score data</div>;
  }

  const { data, overall } = parsedData;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]";
    if (score >= 60) return "text-brand-yellow drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]";
    if (score >= 40) return "text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]";
    return "text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", bg: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" };
    if (score >= 60) return { label: "Good", bg: "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20" };
    if (score >= 40) return { label: "Needs Work", bg: "bg-orange-400/10 text-orange-400 border-orange-400/20" };
    return { label: "Critical", bg: "bg-red-400/10 text-red-400 border-red-400/20" };
  };

  const status = getScoreStatus(overall);

  return (
    <div className="bg-[#050B15]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
        <div className="w-full lg:w-1/3 flex flex-col items-center justify-center text-center">
          <div className="mb-4">
             <span className={cn("text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border", status.bg)}>
               {status.label}
             </span>
          </div>
          <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">Overall Score</h3>
          <div className={cn("text-7xl font-black tracking-tighter mb-8", getScoreColor(overall))}>
            {displayScore}
            <span className="text-2xl text-white/20 ml-1 font-bold">/100</span>
          </div>
          
          <div className="w-full space-y-3">
             {data.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                   <div className="flex justify-between text-xs">
                     <span className="text-white/70 font-medium">{item.subject}</span>
                     <span className="text-white font-bold">{item.A}</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${item.A}%` }}
                       transition={{ duration: 1, delay: idx * 0.1 }}
                       className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                     />
                   </div>
                </div>
             ))}
          </div>
        </div>
        
        <div className="w-full lg:w-2/3 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 500 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                itemStyle={{ color: "#06b6d4" }}
              />
              <Radar
                name="Score"
                dataKey="A"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#radarGradient)"
                fillOpacity={1}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
