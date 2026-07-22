"use client";

import { useEffect, useState } from "react";
import {
  BarChart3, Users, LayoutTemplate,
  CreditCard, Magnet, Eye, Globe, TrendingUp
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
    {
      title: "Total Revenue",
      value: stats?.revenue ? `$${stats.revenue.toLocaleString()}` : "$0",
      icon: CreditCard,
      sub: "All-time earnings",
    },
    {
      title: "Total Purchases",
      value: stats?.purchases ?? 0,
      icon: TrendingUp,
      sub: "Completed transactions",
    },
    {
      title: "Total Funnels",
      value: stats?.funnels ?? 0,
      icon: LayoutTemplate,
      sub: "Published & drafts",
    },
    {
      title: "Total Leads",
      value: stats?.leads ?? 0,
      icon: Magnet,
      sub: "Captured across funnels",
    },
    {
      title: "Page Views",
      value: stats?.pageViews?.toLocaleString() ?? 0,
      icon: Eye,
      sub: "Funnel page impressions",
    },
    {
      title: "Total Users",
      value: stats?.users ?? 0,
      icon: Users,
      sub: "Registered accounts",
    },
    {
      title: "Workspaces",
      value: stats?.workspaces ?? 0,
      icon: Globe,
      sub: "Active workspaces",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Overview</h1>
        <p className="text-white/40 mt-1 text-sm">Global statistics across all workspaces and funnels.</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-[120px] rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="relative group rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-300"
              >
                {/* Subtle top shimmer line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="p-6">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-5 group-hover:bg-white/[0.10] transition-colors">
                    <Icon className="w-4 h-4 text-white/60" />
                  </div>

                  {/* Value */}
                  <div className="text-3xl font-black text-white tracking-tight tabular-nums">
                    {card.value}
                  </div>

                  {/* Title + sub */}
                  <div className="mt-1.5">
                    <p className="text-sm font-semibold text-white/70">{card.title}</p>
                    <p className="text-xs text-white/30 mt-0.5">{card.sub}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Coming soon chart area */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex flex-col items-center justify-center min-h-[260px] py-16">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
            <BarChart3 className="w-5 h-5 text-white/20" />
          </div>
          <h3 className="text-white/50 font-semibold text-sm">Analytics coming soon</h3>
          <p className="text-white/25 text-xs mt-1.5">Charts and historical comparisons will appear here.</p>
        </div>
      </div>
    </div>
  );
}
