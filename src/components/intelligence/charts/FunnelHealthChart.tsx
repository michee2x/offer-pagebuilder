"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FunnelHealthData {
  score: number;
  cvr_cold_traffic: string;
  cvr_warm_traffic: string;
  revenue_per_lead_estimate: string;
  primary_leakage_point: string;
  primary_leakage_cause: string;
  fix_1: string;
  fix_2: string;
  fix_3: string;
  validation_required_before_scaling: boolean;
}

export function FunnelHealthChart({ content }: { content: string }) {
  let data: FunnelHealthData | null = null;
  try {
    data = JSON.parse(content);
  } catch (e) {
    return (
      <div className="p-6 border border-dashed rounded-xl bg-muted/5 text-muted-foreground text-center">
        Unable to render funnel health visualization.
      </div>
    );
  }

  if (!data) return null;

  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = data.score;
    if (start === end) {
      setDisplayScore(end);
      return;
    }
    let timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= end) clearInterval(timer);
    }, 1500 / end);
    return () => clearInterval(timer);
  }, [data.score]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 relative z-10">
      {/* Main Score Gauge */}
      <Card className="lg:col-span-1 bg-[#050B15]/80 backdrop-blur-xl border-t-[3px] border-t-cyan-400 border-white/10 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Activity className="w-32 h-32 text-cyan-400" />
        </div>
        <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full relative z-10">
          <div className="relative w-40 h-40 mb-6">
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
               <defs>
                 <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="#06b6d4" />
                   <stop offset="50%" stopColor="#a855f7" />
                   <stop offset="100%" stopColor="#ec4899" />
                 </linearGradient>
               </defs>
               <circle
                 cx="50" cy="50" r="45"
                 fill="none"
                 stroke="rgba(255,255,255,0.05)"
                 strokeWidth="6"
               />
               <motion.circle
                 cx="50" cy="50" r="45"
                 fill="none"
                 stroke="url(#healthGradient)"
                 strokeWidth="8"
                 strokeDasharray="283"
                 initial={{ strokeDashoffset: 283 }}
                 animate={{ strokeDashoffset: 283 - (283 * data.score) / 100 }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 strokeLinecap="round"
                 className="drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
                 {displayScore}
               </span>
               <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest mt-1">Health</span>
             </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Funnel Health Score</h3>
          <p className="text-sm text-white/50 max-w-[200px] leading-relaxed">
            Overall architectural integrity and conversion probability.
          </p>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-[#050B15]/80 backdrop-blur-xl border border-white/10 border-t-[3px] border-t-purple-500 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-5">
            <TrendingUp className="w-24 h-24 text-purple-500" />
          </div>
          <div className="relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400 mb-4 block">Expected Conversion</span>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-black text-white">{data.cvr_cold_traffic}</span>
              <span className="text-xs font-medium text-white/50">Cold Traffic</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-xl font-bold text-emerald-400">{data.cvr_warm_traffic}</span>
              <span className="text-xs font-medium text-white/50">Warm Traffic</span>
            </div>
          </div>
          <div className="mt-6 h-2 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "65%" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#050B15]/80 backdrop-blur-xl border border-white/10 border-t-[3px] border-t-amber-500 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-5">
            <Activity className="w-24 h-24 text-amber-500" />
          </div>
          <div className="relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-4 block">Revenue Per Lead</span>
            <div className="text-3xl font-black text-white mb-2">{data.revenue_per_lead_estimate}</div>
            <p className="text-xs text-white/50 leading-relaxed max-w-[80%]">
               Estimated value based on current price & take-rates.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 relative z-10">
             <div className={cn("px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider", 
               data.validation_required_before_scaling 
                 ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                 : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
             )}>
               {data.validation_required_before_scaling ? "Validation Required" : "Ready to Scale"}
             </div>
          </div>
        </div>

        {/* Leakage Analysis */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-[#050B15]/80 backdrop-blur-xl border border-white/10 border-t-[3px] border-t-pink-500 flex flex-col md:flex-row gap-8 relative overflow-hidden">
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500/5 blur-[60px] rounded-full pointer-events-none" />
           <div className="flex-1 relative z-10">
             <div className="flex items-center gap-2 mb-6">
               <div className="p-2 bg-pink-500/20 rounded-lg">
                 <Shield className="w-5 h-5 text-pink-400" />
               </div>
               <span className="text-sm font-bold uppercase tracking-wider text-white">Leakage Diagnosis</span>
             </div>
             <div className="space-y-5">
               <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                 <p className="text-[10px] uppercase text-pink-400 tracking-wider font-bold mb-1">Primary Leak Point</p>
                 <p className="text-base font-bold text-white">{data.primary_leakage_point}</p>
               </div>
               <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                 <p className="text-[10px] uppercase text-white/40 tracking-wider font-bold mb-1">Root Cause</p>
                 <p className="text-sm text-white/70 leading-relaxed">{data.primary_leakage_cause}</p>
               </div>
             </div>
           </div>
           <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8 relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] uppercase text-white/60 tracking-wider font-bold">Top Priority Fixes</span>
              </div>
              <ul className="space-y-4">
                {[data.fix_1, data.fix_2, data.fix_3].filter(Boolean).map((fix, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shrink-0 text-[11px] font-bold text-white shadow-lg shadow-pink-500/20">
                      {i + 1}
                    </span>
                    <span className="text-sm text-white/80 leading-relaxed pt-0.5">{fix}</span>
                  </li>
                ))}
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl", className)}>{children}</div>;
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
