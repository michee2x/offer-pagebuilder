import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { FunnelSidebar } from "@/components/layout/FunnelSidebar";
import { AnalyticsDashboard } from "./AnalyticsDashboard";

interface Props {
  params: Promise<{ funnelId: string }>;
}

// ─── Page-path → human label ──────────────────────────────────────────────────
const PAGE_LABELS: Record<string, string> = {
  "/": "Lead Capture",
  "/upsell": "Upsell",
  "/downsell": "Downsell",
  "/thankyou": "Thank You",
};

// ─── PostHog HogQL helper ─────────────────────────────────────────────────────
async function fetchPostHogStats(pageId: string) {
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const pat = process.env.POSTHOG_PERSONAL_API_KEY;

  // The management/query API lives at us.posthog.com, NOT the ingest host us.i.posthog.com.
  // Derive by stripping the ".i." from the ingest host, or use a dedicated env var.
  const ingestHost =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  const apiHost =
    process.env.POSTHOG_API_HOST ??
    ingestHost.replace(
      /^(https?:\/\/)(\w+)\.i\.posthog\.com/,
      "$1$2.posthog.com",
    );

  console.log(
    "[posthog] config check — projectId:",
    projectId ? "✓" : "MISSING",
    "| pat:",
    pat ? `✓ (${pat.slice(0, 6)}...)` : "MISSING",
    "| apiHost:",
    apiHost,
  );

  if (!projectId || !pat) {
    console.error("[posthog] aborting — missing env vars");
    return null;
  }

  const run = async (label: string, query: string) => {
    try {
      const url = `${apiHost}/api/projects/${projectId}/query/`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(
          `[posthog:${label}] HTTP ${res.status} — ${body.slice(0, 300)}`,
        );
        return null;
      }
      const json = await res.json();
      console.log(
        `[posthog:${label}] rows returned: ${json?.results?.length ?? "null"}`,
      );
      return json;
    } catch (e) {
      console.error(`[posthog:${label}] fetch threw:`, e);
      return null;
    }
  };

  // All queries in parallel
  const [overview, geo, devices, recent, pages, momentum] = await Promise.all([
    // 1 — all-time totals + 7d rolling + prev 7d
    run(
      "overview",
      `
      SELECT
        count()                                                                                  AS views_total,
        uniq(distinct_id)                                                                        AS visitors_total,
        countIf(timestamp > now() - interval 7 day)                                              AS views_7d,
        uniqIf(distinct_id, timestamp > now() - interval 7 day)                                  AS visitors_7d,
        countIf(toDate(timestamp) = today())                                                      AS views_today,
        countIf(timestamp > now() - interval 14 day AND timestamp <= now() - interval 7 day)     AS views_prev7d,
        uniqIf(distinct_id, timestamp > now() - interval 14 day AND timestamp <= now() - interval 7 day) AS visitors_prev7d
      FROM events
      WHERE event = 'funnel_page_view'
        AND properties['funnel_id'] = '${pageId}'
    `,
    ),

    // 2 — geo breakdown (7d)
    run(
      "geo",
      `
      SELECT properties.$geoip_country_name, count()
      FROM events
      WHERE event = 'funnel_page_view'
        AND properties['funnel_id'] = '${pageId}'
        AND timestamp > now() - interval 7 day
        AND properties.$geoip_country_name IS NOT NULL
      GROUP BY properties.$geoip_country_name
      ORDER BY count() DESC
    `,
    ),

    // 3 — device types (7d)
    run(
      "devices",
      `
      SELECT properties.$device_type, count()
      FROM events
      WHERE event = 'funnel_page_view'
        AND properties['funnel_id'] = '${pageId}'
        AND timestamp > now() - interval 7 day
      GROUP BY properties.$device_type
    `,
    ),

    // 4 — recent 10 hits (all-time)
    run(
      "recent",
      `
      SELECT properties.$geoip_country_name, timestamp, properties.$browser
      FROM events
      WHERE event = 'funnel_page_view'
        AND properties['funnel_id'] = '${pageId}'
      ORDER BY timestamp DESC
      LIMIT 10
    `,
    ),

    // 5 — per-page breakdown (7d) — needs page_path in events
    run(
      "pages",
      `
      SELECT properties['page_path'], count(), uniq(distinct_id)
      FROM events
      WHERE event = 'funnel_page_view'
        AND properties['funnel_id'] = '${pageId}'
        AND timestamp > now() - interval 7 day
        AND properties['page_path'] IS NOT NULL
      GROUP BY properties['page_path']
      ORDER BY count() DESC
    `,
    ),

    // 6 — daily traffic (30d) for Momentum Chart
    run(
      "momentum",
      `
      SELECT toDate(timestamp) AS day, count() AS hits
      FROM events
      WHERE event = 'funnel_page_view'
        AND properties['funnel_id'] = '${pageId}'
        AND timestamp > now() - interval 30 day
      GROUP BY day
      ORDER BY day ASC
    `,
    ),
  ]);

  // Parse overview row
  const row = overview?.results?.[0] ?? [];
  const viewsTotal = Number(row[0] ?? 0);
  const visitorsTotal = Number(row[1] ?? 0);
  const views7d = Number(row[2] ?? 0);
  const visitors7d = Number(row[3] ?? 0);
  const viewsToday = Number(row[4] ?? 0);
  const viewsPrev7d = Number(row[5] ?? 0);
  const visitorsPrev7d = Number(row[6] ?? 0);

  // Parse geo
  const countries = (geo?.results ?? []).map((r: any[]) => ({
    country: String(r[0] ?? "Unknown"),
    count: Number(r[1] ?? 0),
  }));

  // Tier classification
  const T1 = new Set([
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "New Zealand",
  ]);
  const T2 = new Set([
    "Germany",
    "France",
    "Spain",
    "Italy",
    "Netherlands",
    "Sweden",
    "Switzerland",
    "Norway",
    "Denmark",
    "Belgium",
    "Austria",
    "Finland",
  ]);
  let tier1 = 0,
    tier2 = 0,
    tier3 = 0;
  for (const c of countries) {
    if (T1.has(c.country)) tier1 += c.count;
    else if (T2.has(c.country)) tier2 += c.count;
    else tier3 += c.count;
  }
  const tiers = [
    { name: "Tier 1", value: tier1, color: "#3b82f6" },
    { name: "Tier 2", value: tier2, color: "#8b5cf6" },
    { name: "Tier 3", value: tier3, color: "#10b981" },
  ].filter((t) => t.value > 0);

  // Parse devices — proper three-way split
  let desktopViews = 0,
    mobileViews = 0,
    tabletViews = 0;
  for (const r of devices?.results ?? []) {
    const t = String(r[0] ?? "").toLowerCase();
    const n = Number(r[1] ?? 0);
    if (t === "desktop") desktopViews += n;
    else if (t === "tablet") tabletViews += n;
    else if (t === "mobile" || t === "phone") mobileViews += n;
    // unknown/null ignored
  }

  // Recent traffic
  const recentTraffic = (recent?.results ?? []).map((r: any[]) => ({
    country: String(r[0] ?? "Unknown"),
    timestamp: String(r[1] ?? ""),
    browser: String(r[2] ?? "Web"),
  }));

  // Per-page breakdown in funnel order
  const PAGE_ORDER = ["/", "/upsell", "/downsell", "/thankyou"];
  const pageMap: Record<string, { views: number }> = {};
  for (const r of pages?.results ?? []) {
    const p = String(r[0] ?? "");
    if (p) pageMap[p] = { views: Number(r[1] ?? 0) };
  }
  const pageBreakdown = PAGE_ORDER.filter((p) => pageMap[p] !== undefined).map(
    (p) => ({
      path: p,
      label: PAGE_LABELS[p] ?? p,
      views: pageMap[p].views,
    }),
  );

  // Momentum chart (last 30 days)
  const momentumData = (momentum?.results ?? []).map((r: any[]) => ({
    date: String(r[0] ?? ""),
    hits: Number(r[1] ?? 0),
  }));

  return {
    viewsTotal,
    visitorsTotal,
    views7d,
    visitors7d,
    viewsToday,
    viewsPrev7d,
    visitorsPrev7d,
    countries,
    tiers: tiers.length
      ? tiers
      : [{ name: "No Data", value: 1, color: "#64748b" }],
    desktopViews,
    mobileViews,
    tabletViews,
    recentTraffic,
    pageBreakdown,
    momentumData,
  };
}

// ─── Percentage change helper ─────────────────────────────────────────────────
function pct(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function FunnelDashboardPage({ params }: Props) {
  const { funnelId } = await params;
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  const supabase = createAdminClient();

  const [{ data: funnel }, { data: leads }] = await Promise.all([
    supabase
      .from("builder_pages")
      .select("id, name, created_at")
      .eq("id", funnelId)
      .single(),
    supabase
      .from("leads")
      .select("id, name, email, created_at")
      .eq("funnel_id", funnelId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (!funnel) redirect("/");

  const { data: leadsTotal } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("funnel_id", funnelId);

  const leadsCount = (leadsTotal as any)?.count ?? leads?.length ?? 0;

  const analytics = await fetchPostHogStats(funnelId);

  const dashboardData = {
    pageViewsTotal: analytics?.viewsTotal ?? 0,
    uniqueVisitorsTotal: analytics?.visitorsTotal ?? 0,
    pageViews7d: analytics?.views7d ?? 0,
    uniqueVisitors7d: analytics?.visitors7d ?? 0,
    todayViews: analytics?.viewsToday ?? 0,
    prevPageViews: analytics?.viewsPrev7d ?? 0,
    prevUniqueVisitors: analytics?.visitorsPrev7d ?? 0,
    leadsCount,
    pageViewsChange: pct(analytics?.views7d ?? 0, analytics?.viewsPrev7d ?? 0),
    uniqueVisitorsChange: pct(
      analytics?.visitors7d ?? 0,
      analytics?.visitorsPrev7d ?? 0,
    ),
    desktopViews: analytics?.desktopViews ?? 0,
    mobileViews: analytics?.mobileViews ?? 0,
    tabletViews: analytics?.tabletViews ?? 0,
    tiers: analytics?.tiers ?? [
      { name: "No Data", value: 1, color: "#64748b" },
    ],
    countries: analytics?.countries ?? [],
    recentTraffic: analytics?.recentTraffic ?? [],
    pageBreakdown: analytics?.pageBreakdown ?? [],
    momentumData: analytics?.momentumData ?? [],
    recentLeads: (leads ?? []).map((l) => ({
      name: l.name,
      email: l.email,
      created_at: l.created_at,
    })),
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] relative z-0">
      {/* Background Elements (copied from home page) */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        {/* Radial - Pink */}
        <div
          className="absolute top-[80px] right-[-480px] w-[994px] h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, rgb(236, 72, 153) 0%, rgba(236, 72, 153, 0) 100%)',
            transform: 'rotate(-30deg)'
          }}
        />
        {/* Radial - Blue */}
        <div
          className="absolute top-[80px] left-[-480px] w-[994px] h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, rgb(59, 130, 246) 0%, rgba(59, 130, 246, 0) 100%)',
            transform: 'rotate(30deg)'
          }}
        />
        {/* Radial - Purple */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[522px] opacity-[0.36] z-[1]"
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, rgb(140, 22, 250) 0%, rgba(140, 22, 250, 0) 100%)'
          }}
        />
        {/* Bottom Gradient Overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[240px] z-[2] opacity-100"
          style={{
            background: 'linear-gradient(180deg, rgba(3, 7, 18, 0) 0%, rgb(3, 7, 18) 100%)'
          }}
        />
        {/* Noise Overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none z-[1]"
          style={{
            backgroundImage: 'url(https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '128px auto'
          }}
        />
      </div>

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Topbar
          breadcrumbs={[
            { label: "Workspaces", href: "/" },
            { label: funnel.name },
          ]}
        />
        <div className="flex flex-1 overflow-hidden">
          <FunnelSidebar funnelId={funnelId} funnelName={funnel.name} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent relative z-10">
            <div className="w-full max-w-7xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
                    {funnel.name}
                  </h1>
                  <p className="text-sm font-medium text-white/50 mt-1">
                    Created{" "}
                    {new Date(funnel.created_at).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="px-3 py-1 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-xs font-bold text-brand-blue flex items-center gap-2 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                  Live Tracking Active
                </div>
              </div>

              <AnalyticsDashboard data={dashboardData} funnelId={funnelId} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
