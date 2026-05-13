"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Users, MousePointerClick, TrendingUp, TrendingDown, ArrowUpRight, Eye, UserCheck, Percent } from "lucide-react";
import Link from "next/link";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface DashboardData {
  pageViews:             number;
  uniqueVisitors:        number;
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
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between text-white/50">
        <p className="text-xs font-semibold">{label}</p>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <p className="text-2xl font-black text-white tabular-nums">{value}</p>
      <div className="flex items-center gap-2">
        {change !== undefined ? <ChangeChip pct={change} /> : (
          <span className="text-[10px] text-white/30">{sub}</span>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalyticsDashboard({ data, funnelId }: Props) {
  const hasViews = data.pageViews > 0;

  const conversionRate = data.uniqueVisitors > 0
    ? ((data.leadsCount / data.uniqueVisitors) * 100).toFixed(1)
    : "0.0";

  const maxCountry = Math.max(...data.countries.map(c => c.count), 1);

  const deviceData = [
    { name: "Desktop", count: data.desktopViews, fill: "#f5a623" },
    { name: "Mobile",  count: data.mobileViews,  fill: "#d1d5db" },
    { name: "Tablet",  count: data.tabletViews,  fill: "#374151" },
  ].filter(d => d.count > 0);

  // Funnel drop-off — relative to first step
  const firstStepViews = data.pageBreakdown[0]?.views ?? 1;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Top 4 metrics ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="7-Day Page Views"
          value={data.pageViews.toLocaleString()}
          icon={Eye}
          iconColor="text-brand-yellow"
          change={data.pageViewsChange}
        />
        <MetricCard
          label="Unique Visitors"
          value={data.uniqueVisitors.toLocaleString()}
          icon={Users}
          iconColor="text-white/60"
          change={data.uniqueVisitorsChange}
        />
        <MetricCard
          label="Today&apos;s Views"
          value={data.todayViews.toLocaleString()}
          icon={MousePointerClick}
          iconColor="text-amber-400"
          sub="refreshes every 60s"
        />
        <MetricCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          icon={Percent}
          iconColor="text-emerald-400"
          sub={`${data.leadsCount} leads / ${data.uniqueVisitors} visitors`}
        />
      </div>

      {/* ── Map + charts row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* World map */}
        <div className="xl:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 relative flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 z-10">
            <div>
              <p className="text-sm font-semibold text-white/90">Global Traffic Distribution</p>
              <p className="text-xs text-white/40">Last 7 days — hover to see density</p>
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
                        ? `rgba(245, 166, 35, ${Math.max(0.25, intensity)})`
                        : "#1a1a1a";
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          stroke="#0a0a0a"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover:   { fill: "#f5a623", outline: "none" },
                            pressed: { outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
            <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_0_60px_rgba(10,10,10,1)]" />
          </div>
          <div className="absolute bottom-6 right-6 text-right z-10">
            <p className="text-3xl font-black text-white">{data.pageViews.toLocaleString()}</p>
            <p className="text-xs text-white/40">Total Worldwide Hits</p>
          </div>
        </div>

        {/* Charts column */}
        <div className="flex flex-col gap-4">
          {/* Traffic quality donut */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col h-50">
            <p className="text-xs font-semibold text-white/80 mb-2">Traffic Quality</p>
            <div className="flex-1 relative">
              {hasViews ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.tiers} innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value" stroke="none">
                      {data.tiers.map((t, i) => <Cell key={i} fill={t.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" }} />
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
          <div className="bg-[#1B1D2C] border border-white/5 rounded-2xl p-4 flex flex-col h-50">
            <p className="text-xs font-semibold text-white/80 mb-2">Device Breakdown</p>
            <div className="flex-1 -ml-4">
              {hasViews && deviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deviceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" }} />
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
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5">
          <p className="text-sm font-semibold text-white mb-4">Traffic Blast</p>
          <div className="space-y-1">
            <div className="grid grid-cols-3 text-[10px] font-bold text-white/30 uppercase mb-2">
              <span>Location</span><span>Time</span><span className="text-right">Browser</span>
            </div>
            {data.recentTraffic.length > 0 ? data.recentTraffic.map((t, i) => (
              <div key={i} className="grid grid-cols-3 text-xs items-center text-white/70 py-1.5 border-b border-white/5 last:border-0 hover:bg-white/3 rounded px-1 -mx-1 transition-colors">
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
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5">
          <p className="text-sm font-semibold text-white mb-4">Funnel Drop-off</p>
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
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-brand-yellow/60 to-brand-yellow transition-all duration-700"
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
                      className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400"
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
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">Recent Leads</p>
            <Link
              href={`/funnels/${funnelId}/leads`}
              className="text-[10px] font-semibold text-brand-yellow hover:text-brand-yellow/80 transition-colors"
            >
              View all →
            </Link>
          </div>
          {data.recentLeads.length > 0 ? (
            <div className="flex flex-col gap-1 flex-1">
              {data.recentLeads.map((lead, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-brand-yellow/10 text-brand-yellow flex items-center justify-center text-[10px] font-black shrink-0 uppercase">
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
              ))}
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
