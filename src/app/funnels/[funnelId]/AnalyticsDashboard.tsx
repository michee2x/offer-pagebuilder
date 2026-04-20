"use client";

import React from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Users, MousePointerClick, ArrowUpRight } from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface AnalyticsDashboardProps {
  data: {
    pageViews: number;
    uniqueVisitors: number;
    desktopViews: number;
    mobileViews: number;
    tiers: { name: string; value: number; color: string }[];
    countries: { country: string; count: number }[];
    recentTraffic: { country: string; timestamp: string; browser: string }[];
  };
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  // Determine if there's any data at all
  const hasData = data.pageViews > 0;

  // Bar Chart Data
  const deviceData = [
    { name: "Desktop", count: data.desktopViews, fill: "#3b82f6" },
    { name: "Mobile", count: data.mobileViews, fill: "#8b5cf6" },
  ];

  // Map Data Logic
  const maxValue = Math.max(...data.countries.map(c => c.count), 1);
  const getCountryIntensity = (countryName: string) => {
    const found = data.countries.find(c => c.country === countryName);
    if (!found) return 0;
    return found.count / maxValue;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* BIG MAP AREA (Spans 2 cols) */}
        <div className="xl:col-span-2 bg-[#1B1D2C] border border-white/5 rounded-2xl p-6 relative flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 z-10">
            <div>
              <p className="text-sm font-semibold text-white/90">Global Traffic Distribution</p>
              <p className="text-xs text-white/50">Hover over countries to see density</p>
            </div>
          </div>
          
          <div className="flex-1 w-full flex items-center justify-center -mt-6">
            <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={400}>
              <ZoomableGroup center={[0, 10]} zoom={1}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const geoName = geo.properties.name;
                      // Mapping some discrepancies
                      let mappedName = geoName;
                      if (geoName === "United States of America") mappedName = "United States";
                      
                      const intensity = getCountryIntensity(mappedName);
                      // Base color vs active color
                      const baseColor = "#2A2D43";
                      // Interpolate towards a bright blue for high traffic
                      const activeColor = intensity > 0 ? `rgba(59, 130, 246, ${Math.max(0.3, intensity)})` : baseColor;

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={activeColor}
                          stroke="#1B1D2C"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { fill: "#60a5fa", outline: "none" },
                            pressed: { outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
            {/* Overlay Gradient to blend edges */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_0_60px_rgba(27,29,44,1)]"></div>
          </div>

          <div className="absolute bottom-6 right-6 text-right z-10">
            <p className="text-3xl font-black text-white">{data.pageViews}</p>
            <p className="text-xs text-white/50">Total Worldwide Hits</p>
          </div>
        </div>

        {/* METRICS & CHARTS AREA (Spans 1 col) */}
        <div className="flex flex-col gap-6">
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1B1D2C] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3 text-white/60">
                <p className="text-xs font-semibold">Today&apos;s Clicks</p>
                <MousePointerClick className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-black text-white">{data.pageViews}</p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium">
                <span className="text-emerald-400 flex items-center"><ArrowUpRight className="w-3 h-3"/> +12%</span>
                <span className="text-white/40">vs last 7d</span>
              </div>
            </div>

            <div className="bg-[#1B1D2C] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3 text-white/60">
                <p className="text-xs font-semibold">Unique Visitors</p>
                <Users className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-2xl font-black text-white">{data.uniqueVisitors}</p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium">
                <span className="text-emerald-400 flex items-center"><ArrowUpRight className="w-3 h-3"/> +5%</span>
                <span className="text-white/40">vs last 7d</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* Traffic Quality Donut */}
            <div className="bg-[#1B1D2C] border border-white/5 rounded-2xl p-4 flex flex-col h-[200px]">
              <p className="text-xs font-semibold text-white/80 mb-2">Traffic Quality</p>
              <div className="flex-1 relative">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.tiers}
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {data.tiers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1B1D2C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 text-center">No Data</div>
                )}
                {/* Custom Legend Layout */}
                {hasData && (
                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 flex flex-col gap-1.5">
                    {data.tiers.map(t => (
                      <div key={t.name} className="flex items-center gap-1 justify-end pr-3">
                        <span className="text-[9px] text-white/50">{t.name}</span>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }}></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop VS Mobile Bar */}
            <div className="bg-[#1B1D2C] border border-white/5 rounded-2xl p-4 flex flex-col h-[200px]">
              <p className="text-xs font-semibold text-white/80 mb-2">Desktop VS Mobile</p>
              <div className="flex-1 -ml-4">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deviceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                        contentStyle={{ backgroundColor: '#1B1D2C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 text-center pl-6">No Data</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM TABLES ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Table 1: Recent Traffic / Traffic Blast */}
        <div className="bg-[#1B1D2C] border border-white/5 rounded-2xl p-5">
          <p className="text-sm font-semibold text-white mb-4">Traffic Blast</p>
          <div className="space-y-3">
            <div className="grid grid-cols-3 text-[10px] font-bold text-white/40 uppercase mb-2">
              <span className="col-span-1">Location</span>
              <span className="col-span-1">Time</span>
              <span className="col-span-1 border-white/5 opacity-0">Browser</span>
            </div>
            {data.recentTraffic.length > 0 ? data.recentTraffic.map((t, idx) => (
              <div key={idx} className="grid grid-cols-3 text-xs items-center text-white/80 py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-md px-1 -mx-1 transition-colors">
                <span className="col-span-1 truncate flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {t.country || "Unknown"}
                </span>
                <span className="col-span-1 text-white/50 truncate">
                  {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="col-span-1 text-right text-white/40 truncate">
                  {t.browser || "Web"}
                </span>
              </div>
            )) : (
              <div className="text-xs text-white/30 py-4 text-center">No traffic recorded yet.</div>
            )}
          </div>
        </div>

        {/* Table 2: Special Offers Placeholder */}
        <div className="bg-[#1B1D2C] border border-white/5 rounded-2xl p-5">
          <p className="text-sm font-semibold text-white mb-4">Special Offers</p>
          <div className="space-y-3">
            <div className="grid grid-cols-3 text-[10px] font-bold text-white/40 uppercase mb-2">
              <span className="col-span-2">Offer Name</span>
              <span className="col-span-1 text-right">Clicks</span>
            </div>
            <div className="text-xs text-white/30 py-4 text-center">Awaiting conversion data...</div>
          </div>
        </div>

        {/* Table 3: Lead Steps Placeholder */}
        <div className="bg-[#1B1D2C] border border-white/5 rounded-2xl p-5">
          <p className="text-sm font-semibold text-white mb-4">Lead Steps</p>
          <div className="space-y-3">
            <div className="grid grid-cols-3 text-[10px] font-bold text-white/40 uppercase mb-2">
              <span className="col-span-2">Step</span>
              <span className="col-span-1 text-right">Drop-off</span>
            </div>
            <div className="text-xs text-white/30 py-4 text-center">Awaiting funnel progression...</div>
          </div>
        </div>
      </div>
    </div>
  );
}
