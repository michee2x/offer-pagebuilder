"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Activity } from 'lucide-react';

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-brand-yellow";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-400/10 border-emerald-400/20";
    if (score >= 60) return "bg-brand-yellow/10 border-brand-yellow/20";
    if (score >= 40) return "bg-orange-400/10 border-orange-400/20";
    return "bg-red-400/10 border-red-400/20";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      {/* Main Score Gauge */}
      <Card className="lg:col-span-1 bg-[#050B15] border-white/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity className="w-24 h-24" />
        </div>
        <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
          <div className="relative w-32 h-32 mb-4">
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
               <circle
                 cx="50" cy="50" r="45"
                 fill="none"
                 stroke="currentColor"
                 strokeWidth="8"
                 className="text-white/5"
               />
               <motion.circle
                 cx="50" cy="50" r="45"
                 fill="none"
                 stroke="currentColor"
                 strokeWidth="8"
                 strokeDasharray="283"
                 initial={{ strokeDashoffset: 283 }}
                 animate={{ strokeDashoffset: 283 - (283 * data.score) / 100 }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className={getScoreColor(data.score)}
                 strokeLinecap="round"
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-4xl font-bold tracking-tighter">{data.score}</span>
               <span className="text-[10px] uppercase font-bold text-muted-foreground">Index</span>
             </div>
          </div>
          <h3 className="text-lg font-semibold mb-1">Health Score</h3>
          <p className="text-xs text-muted-foreground max-w-[180px]">
            Overall architectural integrity and conversion probability.
          </p>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Expected Conversion</span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-foreground">{data.cvr_cold_traffic}</span>
              <span className="text-xs text-muted-foreground">Cold Traffic</span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-lg font-semibold text-emerald-400">{data.cvr_warm_traffic}</span>
              <span className="text-xs text-muted-foreground">Warm Traffic</span>
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "65%" }}
              className="h-full bg-brand-yellow"
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Revenue Per Lead</span>
            <div className="text-2xl font-bold text-foreground">{data.revenue_per_lead_estimate}</div>
            <p className="text-xs text-muted-foreground mt-1 italic leading-tight">
               Estimated value based on current price & take-rates.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
             <div className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", data.validation_required_before_scaling ? "bg-red-400/10 text-red-400" : "bg-emerald-400/10 text-emerald-400")}>
               {data.validation_required_before_scaling ? "Validation Required" : "Ready to Scale"}
             </div>
          </div>
        </div>

        {/* Leakage Analysis */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-[#0F172A]/40 border border-blue-500/10 flex flex-col md:flex-row gap-6">
           <div className="flex-1">
             <div className="flex items-center gap-2 mb-3">
               <Shield className="w-4 h-4 text-blue-400" />
               <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Leakage Diagnosis</span>
             </div>
             <div className="space-y-3">
               <div>
                 <p className="text-[10px] uppercase text-muted-foreground font-bold">Primary Leak Point</p>
                 <p className="text-sm font-semibold">{data.primary_leakage_point}</p>
               </div>
               <div>
                 <p className="text-[10px] uppercase text-muted-foreground font-bold">Cause</p>
                 <p className="text-sm text-muted-foreground leading-snug">{data.primary_leakage_cause}</p>
               </div>
             </div>
           </div>
           <div className="flex-1 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
              <span className="text-[10px] uppercase text-muted-foreground font-bold mb-3 block">Top Priority Fixes</span>
              <ul className="space-y-2">
                {[data.fix_1, data.fix_2, data.fix_3].map((fix, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="w-4 h-4 rounded-full bg-brand-yellow/10 text-brand-yellow flex items-center justify-center shrink-0 text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-foreground/90">{fix}</span>
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
  return <div className={cn("rounded-2xl border bg-card", className)}>{children}</div>;
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
