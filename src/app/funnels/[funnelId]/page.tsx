import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { FunnelSidebar } from "@/components/layout/FunnelSidebar";

import { AnalyticsDashboard } from "./AnalyticsDashboard";

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

  // Helper to fetch aggregate analytics out of PostHog
  async function fetchPostHogStats(pageId: string) {
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const pat = process.env.POSTHOG_PERSONAL_API_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    if (!projectId || !pat) return null;

    try {
      const fetchHogQL = async (query: string) => {
        const res = await fetch(`${host}/api/projects/${projectId}/query/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" },
          body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
          next: { revalidate: 60 }
        });
        return res.ok ? await res.json() : null;
      };

      const [overview, geo, devices, recent] = await Promise.all([
        fetchHogQL(`SELECT count(), uniq(distinct_id) FROM events WHERE event = 'funnel_page_view' AND properties.funnel_id = '${pageId}' AND timestamp > now() - interval 7 day`),
        fetchHogQL(`SELECT properties.$geoip_country_name, count() FROM events WHERE event = 'funnel_page_view' AND properties.funnel_id = '${pageId}' AND timestamp > now() - interval 7 day AND properties.$geoip_country_name IS NOT NULL GROUP BY properties.$geoip_country_name ORDER BY count() DESC`),
        fetchHogQL(`SELECT properties.$device_type, count() FROM events WHERE event = 'funnel_page_view' AND properties.funnel_id = '${pageId}' AND timestamp > now() - interval 7 day GROUP BY properties.$device_type`),
        fetchHogQL(`SELECT properties.$geoip_country_name, timestamp, properties.$browser FROM events WHERE event = 'funnel_page_view' AND properties.funnel_id = '${pageId}' ORDER BY timestamp DESC LIMIT 10`)
      ]);

      const countries = (geo?.results || []).map((row: any) => ({
        country: row[0] || "Unknown",
        count: Number(row[1] || 0)
      }));

      return {
        pageViews: Number(overview?.results?.[0]?.[0] || 0),
        uniqueVisitors: Number(overview?.results?.[0]?.[1] || 0),
        countries,
        devices: (devices?.results || []).map((row: any) => ({ type: row[0], count: Number(row[1] || 0) })),
        recentTraffic: (recent?.results || []).map((row: any) => ({ country: row[0], timestamp: row[1], browser: row[2] }))
      };
    } catch {
      return null;
    }
  }

  const analytics = await fetchPostHogStats(funnelId);

  const pageViews = analytics?.pageViews || 0;
  const uniqueVisitors = analytics?.uniqueVisitors || 0;

  // Process Tiers
  // Tier 1: US, UK, CA, AU, NZ
  let tier1 = 0; let tier2 = 0; let tier3 = 0;
  const t1Countries = ["United States", "United Kingdom", "Canada", "Australia", "New Zealand"];
  const t2Countries = ["Germany", "France", "Spain", "Italy", "Netherlands", "Sweden", "Switzerland"];
  
  if (analytics?.countries) {
    for (const c of analytics.countries) {
      if (t1Countries.includes(c.country)) tier1 += c.count;
      else if (t2Countries.includes(c.country)) tier2 += c.count;
      else tier3 += c.count;
    }
  }
  const tiers = [
    { name: "Tier 1", value: tier1, color: "#3b82f6" },
    { name: "Tier 2", value: tier2, color: "#8b5cf6" },
    { name: "Tier 3", value: tier3, color: "#10b981" }
  ].filter(t => t.value > 0);
  
  
  const desktopViews = analytics?.devices.find((d: { type: string; count: number }) => typeof d.type === 'string' && d.type.toLowerCase() === 'desktop')?.count || 0;
  let mobileViews = 0;
  if (analytics?.devices) {
    analytics.devices.forEach((d: { type: string; count: number }) => {
       if (typeof d.type === 'string' && d.type.toLowerCase() !== 'desktop') mobileViews += d.count;
       else if (!d.type) mobileViews += d.count;
    });
  }

  const dashboardData = {
    pageViews,
    uniqueVisitors,
    desktopViews,
    mobileViews,
    tiers: tiers.length ? tiers : [{ name: "No Data", value: 1, color: "#64748b" }],
    countries: analytics?.countries || [],
    recentTraffic: analytics?.recentTraffic || []
  };

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
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0a0a0f]">
            <div className="w-full max-w-7xl mx-auto space-y-8">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-white/90">
                    {funnel.name}
                  </h1>
                  <p className="text-sm text-white/40 mt-1">
                    Created {new Date(funnel.created_at).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                     Live Tracking Active
                   </div>
                </div>
              </div>

              {/* DASHBOARD UI COMPONENT */}
              <AnalyticsDashboard data={dashboardData} />

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
