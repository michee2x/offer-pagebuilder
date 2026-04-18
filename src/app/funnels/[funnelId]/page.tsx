import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { FunnelSidebar } from "@/components/layout/FunnelSidebar";
import {
  Activity,
  Globe,
  Eye,
  Users,
  TrendingUp,
  ArrowUpRight,
  Clock,
  MapPin,
} from "lucide-react";

interface FunnelDashboardPageProps {
  params: Promise<{
    funnelId: string;
  }>;
}

export default async function FunnelDashboardPage({ params }: FunnelDashboardPageProps) {
  const { funnelId } = await params;
  const session = await getSession();

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const supabase = createAdminClient();

  const { data: funnel, error } = await supabase
    .from("builder_pages")
    .select("id, name, created_at, updated_at, blocks, workspace_id, og_image_url")
    .eq("id", funnelId)
    .single();

  if (error || !funnel) {
    console.error("Funnel fetch error:", error);
    redirect("/");
  }

  const stats = [
    { label: "Page Views (7d)", value: "—", change: null, icon: Eye, color: "text-sky-400" },
    { label: "Unique Visitors", value: "—", change: null, icon: Users, color: "text-violet-400" },
    { label: "Conversion Rate", value: "—", change: null, icon: TrendingUp, color: "text-emerald-400" },
    { label: "Avg. Time on Page", value: "—", change: null, icon: Clock, color: "text-amber-400" },
  ];

  const topCountries = [
    { country: "United States", pct: 0 },
    { country: "United Kingdom", pct: 0 },
    { country: "Canada", pct: 0 },
    { country: "Australia", pct: 0 },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{ marginLeft: "56px" }}
      >
        <Topbar
          breadcrumbs={[
            { label: "Workspaces", href: "/" },
            { label: funnel.name },
          ]}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Funnel-specific sidebar */}
          <FunnelSidebar funnelId={funnelId} funnelName={funnel.name} />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-8 bg-background">
            <div className="max-w-5xl mx-auto space-y-8">

              {/* Header */}
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">
                  Funnel Overview
                </p>
                <h1 className="text-3xl font-black tracking-tight text-foreground">
                  {funnel.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Created {new Date(funnel.created_at).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className="text-3xl font-black text-foreground">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Analytics integration coming soon
                    </p>
                  </div>
                ))}
              </div>

              {/* Two-col layout: traffic + geography */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Traffic over time (placeholder) */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-bold text-foreground">Traffic Over Time</p>
                      <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </div>
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="h-32 flex items-end gap-1.5">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                        <div
                          className="bg-primary/10 border border-primary/10 rounded-sm"
                          style={{ height: `${16 + Math.random() * 10}px`, opacity: 0.5 }}
                        />
                        <p className="text-[9px] text-muted-foreground text-center">
                          {["M", "T", "W", "T", "F", "S", "S"][i]}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3 text-center">
                    Connect your analytics to see real data
                  </p>
                </div>

                {/* Top countries (placeholder) */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-bold text-foreground">Top Countries</p>
                      <p className="text-xs text-muted-foreground">By traffic source</p>
                    </div>
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    {topCountries.map((c) => (
                      <div key={c.country} className="flex items-center gap-3">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-foreground">{c.country}</p>
                            <p className="text-xs text-muted-foreground">—</p>
                          </div>
                          <div className="h-1 bg-muted rounded-full">
                            <div
                              className="h-full bg-primary/40 rounded-full"
                              style={{ width: "0%" }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-4 text-center">
                    Real geo-data requires analytics integration
                  </p>
                </div>
              </div>

              {/* Quick links */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Access</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "View Sales Report", href: `/funnels/${funnelId}/report`, color: "from-violet-500/10 to-violet-500/5 border-violet-500/20", accent: "text-violet-400" },
                    { label: "Edit Sales Copy", href: `/funnels/${funnelId}/copy`, color: "from-sky-500/10 to-sky-500/5 border-sky-500/20", accent: "text-sky-400" },
                    { label: "Email Sequence", href: `/funnels/${funnelId}/email`, color: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20", accent: "text-emerald-400" },
                    { label: "Traffic Intelligence", href: `/funnels/${funnelId}/traffic`, color: "from-amber-500/10 to-amber-500/5 border-amber-500/20", accent: "text-amber-400" },
                  ].map((q) => (
                    <a
                      key={q.label}
                      href={q.href}
                      className={`bg-gradient-to-br ${q.color} border rounded-2xl p-4 flex items-center justify-between group hover:scale-[1.02] transition-all`}
                    >
                      <p className={`text-xs font-bold ${q.accent}`}>{q.label}</p>
                      <ArrowUpRight className={`w-3.5 h-3.5 ${q.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
