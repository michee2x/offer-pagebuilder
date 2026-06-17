"use client";

import { PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Users, MousePointerClick, TrendingUp, TrendingDown, ArrowUpRight, Eye, UserCheck, Percent } from "lucide-react";
import Link from "next/link";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface DashboardData {
  pageViewsTotal:        number;
  uniqueVisitorsTotal:   number;
  pageViews7d:           number;
  uniqueVisitors7d:      number;
  todayViews:            number;
  prevPageViews:         number;
  prevUniqueVisitors:    number;
  leadsCount:            number;
  pageViewsChange:       number;
  uniqueVisitorsChange:  number;
  desktopViews:          number;
  mobileViews:           number;
  tabletViews:           number;
  tiers:                 { name: string; value: number; color: string }[];
  countries:             { country: string; count: number }[];
  recentTraffic:         { country: string; timestamp: string; browser: string }[];
  pageBreakdown:         { path: string; label: string; views: number }[];
  momentumData:          { date: string; hits: number }[];
  recentLeads:           { name: string; email: string; created_at: string }[];
}

interface Props {
  data:      DashboardData;
  funnelId:  string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ChangeChip({ pct }: { pct: number }) {
  if (pct === 0) return <span className="text-[10px] text-white/30">No change</span>;
  const up = pct > 0;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? "+" : ""}{pct}% vs prior 7d
    </span>
  );
}

function MetricCard({
  label, value, sub, icon: Icon, iconColor, change,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.FC<{ className?: string }>; iconColor: string;
  change?: number;
}) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300 shadow-2xl rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between text-white/60">
        <p className="text-xs font-semibold tracking-wide uppercase">{label}</p>
        <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-black text-white tabular-nums drop-shadow-sm">{value}</p>
      <div className="flex items-center gap-2">
        {change !== undefined ? <ChangeChip pct={change} /> : (
          <span className="text-[10px] text-white/30">{sub}</span>
        )}
      </div>
    </div>
  );
}

function MilestoneTracker({ current }: { current: number }) {
  const milestones = [100, 500, 1000, 5000, 10000, 50000, 100000, 1000000];
  const nextMilestone = milestones.find(m => m > current) || milestones[milestones.length - 1];
  const prevMilestone = milestones.slice().reverse().find(m => m <= current) || 0;
  
  const progress = Math.max(0, Math.min(100, ((current - prevMilestone) / (nextMilestone - prevMilestone)) * 100));

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 md:p-6 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500 shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 pl-2">
        <div>
          <p className="text-sm font-black text-white tracking-wide flex items-center gap-2">
            <span className="text-amber-400">🏆</span> Journey to {nextMilestone.toLocaleString()} Visitors
          </p>
          <p className="text-xs text-white/50 font-medium mt-1">
            You're currently at {current.toLocaleString()}. Keep pushing traffic!
          </p>
        </div>
        <div className="w-full md:w-1/2 flex items-center gap-3">
          <span className="text-xs font-bold text-white/40">{prevMilestone.toLocaleString()}</span>
          <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden shadow-inner border border-white/10 relative">
            <div 
              className="absolute top-0 left-0 bottom-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 shadow-[0_0_15px_rgba(253,224,71,0.5)] transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-amber-400">{nextMilestone.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalyticsDashboard({ data, funnelId }: Props) {
  const hasViews = data.pageViewsTotal > 0;

  const conversionRate = data.uniqueVisitorsTotal > 0
    ? ((data.leadsCount / data.uniqueVisitorsTotal) * 100).toFixed(1)
    : "0.0";

  const maxCountry = Math.max(...data.countries.map(c => c.count), 1);

  const deviceData = [
    { name: "Desktop", count: data.desktopViews, fill: "url(#desktopGrad)" },
    { name: "Mobile",  count: data.mobileViews,  fill: "url(#mobileGrad)" },
    { name: "Tablet",  count: data.tabletViews,  fill: "url(#tabletGrad)" },
  ].filter(d => d.count > 0);

  // Funnel drop-off — relative to first step
  const firstStepViews = data.pageBreakdown[0]?.views ?? 1;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Top 4 metrics ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="All-Time Page Views"
          value={data.pageViewsTotal.toLocaleString()}
          icon={Eye}
          iconColor="text-brand-indigo"
          change={data.pageViewsChange}
        />
        <MetricCard
          label="All-Time Visitors"
          value={data.uniqueVisitorsTotal.toLocaleString()}
          icon={Users}
          iconColor="text-brand-pink"
          change={data.uniqueVisitorsChange}
        />
        <MetricCard
          label="Today&apos;s Views"
          value={data.todayViews.toLocaleString()}
          icon={MousePointerClick}
          iconColor="text-brand-cyan"
          sub="refreshes every 60s"
        />
        <MetricCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          icon={Percent}
          iconColor="text-emerald-400"
          sub={`${data.leadsCount} leads / ${data.uniqueVisitorsTotal} visitors`}
        />
      </div>

      {/* ── Milestone Tracker ─────────────────────────────────────────────── */}
      <MilestoneTracker current={data.uniqueVisitorsTotal} />

      {/* ── Momentum Chart ────────────────────────────────────────────────── */}
      {data.momentumData.length > 0 && (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 relative flex flex-col overflow-hidden shadow-2xl hover:border-white/[0.12] transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue via-brand-indigo to-violet-500" />
          <div className="mb-6 flex justify-between items-end">
            <div>
              <p className="text-sm font-bold text-white tracking-wide">Traffic Momentum</p>
              <p className="text-xs text-white/50 font-medium">Last 30 Days</p>
            </div>
          </div>
          <div className="h-[250px] w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.momentumData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="momentumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => {
                    if (!val) return "";
                    const d = new Date(val);
                    return isNaN(d.getTime()) ? val : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }}
                />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "rgba(10, 10, 10, 0.9)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" }}
                  labelFormatter={(val) => {
                    if (!val) return "";
                    const d = new Date(val);
                    return isNaN(d.getTime()) ? val : d.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
                  }}
                />
                <Area type="monotone" dataKey="hits" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#momentumGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Map + charts row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* World map */}
        <div className="xl:col-span-2 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 relative flex flex-col overflow-hidden shadow-2xl hover:border-white/[0.12] transition-all duration-300">
          {/* Multi-stop gradient accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 via-pink-500 to-amber-400" />
          <div className="flex items-center justify-between mb-4 z-10">
            <div>
              <p className="text-sm font-bold text-white tracking-wide">Global Traffic Distribution</p>
              <p className="text-xs text-white/50 font-medium">Last 7 days — hover to see density</p>
            </div>
          </div>
          <div className="flex-1 w-full flex items-center justify-center -mt-6">
            <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={400}>
              <ZoomableGroup center={[0, 10]} zoom={1}>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      let name = geo.properties.name as string;
                      if (name === "United States of America") name = "United States";
                      const found = data.countries.find(c => c.country === name);
                      const intensity = found ? found.count / maxCountry : 0;
                      const fill = intensity > 0
                        ? `rgba(59, 130, 246, ${Math.max(0.45, intensity)})`
                        : "rgba(255, 255, 255, 0.03)";
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          stroke="rgba(255, 255, 255, 0.08)"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none", transition: "all 250ms" },
                            hover:   { fill: "#60a5fa", outline: "none", cursor: "pointer" },
                            pressed: { outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
            <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]" />
          </div>
          <div className="absolute bottom-6 right-6 text-right z-10">
            <p className="text-3xl font-black text-white">{data.pageViewsTotal.toLocaleString()}</p>
            <p className="text-xs text-white/40">Total Worldwide Hits</p>
          </div>
        </div>

        {/* Charts column */}
        <div className="flex flex-col gap-4">
          {/* Traffic quality donut */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 flex flex-col h-50 shadow-2xl hover:border-white/[0.12] transition-all duration-300">
            <p className="text-xs font-bold tracking-wide uppercase text-white/80 mb-2">Traffic Quality</p>
            <div className="flex-1 relative">
              {hasViews ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="tier1Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                      <linearGradient id="tier2Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6d28d9" />
                      </linearGradient>
                      <linearGradient id="tier3Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#047857" />
                      </linearGradient>
                    </defs>
                    <Pie data={data.tiers} innerRadius={40} outerRadius={55} paddingAngle={4} dataKey="value" stroke="none">
                      {data.tiers.map((t, i) => {
                        let fillVal = t.color;
                        if (t.name === "Tier 1") fillVal = "url(#tier1Grad)";
                        else if (t.name === "Tier 2") fillVal = "url(#tier2Grad)";
                        else if (t.name === "Tier 3") fillVal = "url(#tier3Grad)";
                        return <Cell key={i} fill={fillVal} />;
                      })}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "rgba(10, 10, 10, 0.9)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30">No data yet</div>
              )}
              {hasViews && (
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 flex flex-col gap-1.5">
                  {data.tiers.map(t => (
                    <div key={t.name} className="flex items-center gap-1 justify-end pr-3">
                      <span className="text-[9px] text-white/50">{t.name}</span>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Device bar chart */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 flex flex-col h-50 shadow-2xl hover:border-white/[0.12] transition-all duration-300">
            <p className="text-xs font-bold tracking-wide uppercase text-white/80 mb-2">Device Breakdown</p>
            <div className="flex-1 -ml-4">
              {hasViews && deviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deviceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="desktopGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                      <linearGradient id="mobileGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                      <linearGradient id="tabletGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f472b6" />
                        <stop offset="100%" stopColor="#db2777" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} contentStyle={{ backgroundColor: "rgba(10, 10, 10, 0.9)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {deviceData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 pl-6">No data yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom 3 panels ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Traffic blast */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] border-l-4 border-l-emerald-500 rounded-2xl p-5 shadow-2xl hover:border-white/[0.12] transition-all duration-300">
          <p className="text-sm font-bold tracking-wide text-white mb-4">Traffic Blast</p>
          <div className="space-y-1">
            <div className="grid grid-cols-3 text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-2">
              <span>Location</span><span>Time</span><span className="text-right">Browser</span>
            </div>
            {data.recentTraffic.length > 0 ? data.recentTraffic.map((t, i) => (
              <div key={i} className="grid grid-cols-3 text-xs items-center text-white/70 py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 rounded px-1 -mx-1 transition-colors">
                <span className="truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {t.country || "Unknown"}
                </span>
                <span className="text-white/40 tabular-nums">
                  {new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="text-right text-white/30 truncate">{t.browser || "Web"}</span>
              </div>
            )) : (
              <p className="text-[11px] text-white/25 py-4 text-center">No traffic recorded yet.</p>
            )}
          </div>
        </div>

        {/* Funnel step drop-off */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden shadow-2xl hover:border-white/[0.12] transition-all duration-300">
          {/* Gradient accent top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 via-pink-500 to-amber-400" />
          <p className="text-sm font-bold tracking-wide text-white mb-4">Funnel Drop-off</p>
          {data.pageBreakdown.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.pageBreakdown.map((step) => {
                const dropPct = Math.round((step.views / firstStepViews) * 100);
                return (
                  <div key={step.path} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70 font-medium">{step.label}</span>
                      <span className="text-white/40 tabular-nums">{step.views.toLocaleString()} <span className="text-white/25">({dropPct}%)</span></span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all duration-700"
                        style={{ width: `${dropPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {/* Leads as final conversion step */}
              {data.leadsCount > 0 && (
                <div className="flex flex-col gap-1 pt-1 border-t border-white/8">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-3 h-3" /> Leads Captured
                    </span>
                    <span className="text-emerald-400 tabular-nums font-semibold">
                      {data.leadsCount} <span className="text-white/25">({conversionRate}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${Math.min(parseFloat(conversionRate), 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
              <p className="text-[11px] text-white/25 leading-relaxed">
                Per-page data will appear here after your first visitors.<br />
                Make sure your funnel is published and live.
              </p>
            </div>
          )}
        </div>

        {/* Recent leads */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] border-l-4 border-l-violet-500 rounded-2xl p-5 flex flex-col shadow-2xl hover:border-white/[0.12] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold tracking-wide text-white">Recent Leads</p>
            <Link
              href={`/funnels/${funnelId}/leads`}
              className="text-[10px] font-bold tracking-wide text-brand-cyan hover:text-cyan-400 transition-colors uppercase"
            >
              View all →
            </Link>
          </div>
          {data.recentLeads.length > 0 ? (
            <div className="flex flex-col gap-1 flex-1">
              {data.recentLeads.map((lead, i) => {
                const avatarColors = [
                  'bg-blue-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-pink-500',
                  'bg-cyan-500', 'bg-indigo-500', 'bg-purple-500', 'bg-rose-500',
                ];
                const color = avatarColors[i % avatarColors.length];
                return (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-lg px-2 -mx-2 transition-colors">
                    <div className={`w-8 h-8 rounded-full ${color} text-white flex items-center justify-center text-[10px] font-black shrink-0 uppercase`}>
                      {lead.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/80 truncate">{lead.name}</p>
                      <p className="text-[10px] text-white/35 truncate">{lead.email}</p>
                    </div>
                    <span className="text-[10px] text-white/25 tabular-nums shrink-0">
                      {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-4">
              <ArrowUpRight className="w-6 h-6 text-white/15" />
              <p className="text-[11px] text-white/25 leading-relaxed">
                No leads yet.<br />Deploy your funnel and drive traffic to start capturing.
              </p>
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-white/30">Total captured</span>
            <span className="text-sm font-black text-white">{data.leadsCount}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
