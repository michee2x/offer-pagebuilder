"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, Users, LayoutTemplate, 
  CreditCard, Magnet, Eye, ArrowUpRight, Globe
} from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      } else {
        toast.error("Failed to load statistics");
      }
    } catch (error) {
      console.error("Stats fetch error:", error);
      toast.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: "Total Revenue", value: stats?.revenue ? `$${stats.revenue.toLocaleString()}` : "$0", icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { title: "Total Purchases", value: stats?.purchases || 0, icon: BarChart3, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Total Funnels", value: stats?.funnels || 0, icon: LayoutTemplate, color: "text-purple-400", bg: "bg-purple-400/10" },
    { title: "Total Leads", value: stats?.leads || 0, icon: Magnet, color: "text-pink-400", bg: "bg-pink-400/10" },
    { title: "Page Views", value: stats?.pageViews?.toLocaleString() || 0, icon: Eye, color: "text-orange-400", bg: "bg-orange-400/10" },
    { title: "Total Users", value: stats?.users || 0, icon: Users, color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { title: "Workspaces", value: stats?.workspaces || 0, icon: Globe, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  ];

  if (loading) {
    return <div className="text-white/50 text-center py-20">Loading statistics...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-white/50 mt-1 text-sm">Global statistics across all workspaces and funnels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-[#131826] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors" />
            </div>
            <h3 className="text-white/50 font-medium text-sm mb-1">{card.title}</h3>
            <div className="text-3xl font-bold text-white tracking-tight">
              {card.value}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-[#131826] border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
         <BarChart3 className="w-12 h-12 text-white/10 mb-4" />
         <h3 className="text-white/70 font-medium">More analytics coming soon</h3>
         <p className="text-white/40 text-sm mt-2">Charts and historical data comparison will appear here.</p>
      </div>
    </div>
  );
}
