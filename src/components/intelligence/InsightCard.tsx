import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface InsightCardProps {
  title: string;
  value?: string;
  children: React.ReactNode;
  className?: string;
}

export function InsightCard({ title, value, children, className }: InsightCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-6 my-6 group pl-8",
        className
      )}
    >
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500" />
      
      <div className="absolute inset-0 bg-purple-600/[0.02] transition-colors duration-500 group-hover:bg-purple-600/[0.05]" />
      
      {/* Decorative gradient blur */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none transition-all duration-500 group-hover:bg-cyan-500/20" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none transition-all duration-500 group-hover:bg-purple-500/20" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
        {value && (
          <div className="shrink-0 flex flex-col items-start md:items-center justify-center min-w-[100px] border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6">
            <span className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-purple-500">
              {value}
            </span>
          </div>
        )}
        <div className="flex-1 space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
            {title}
          </h4>
          <div className="text-[15px] leading-relaxed text-white/90 font-medium">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
