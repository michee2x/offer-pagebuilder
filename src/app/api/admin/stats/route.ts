import { createAdminClient } from "@/utils/supabase/admin";
import { getSession } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Validate admin role
  const adminEmails = ["access@ofiq.com", "access@ofiq.app"];
  const { data: user } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  const isAdmin = user?.is_admin || adminEmails.includes(session.user.email ?? "");
  if (!isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Fetch counts in parallel
    const [
      { count: funnelsCount },
      { count: leadsCount },
      { count: usersCount },
      { count: workspacesCount },
      { data: purchasesData }
    ] = await Promise.all([
      supabase.from("builder_pages").select("id", { count: "exact", head: true }),
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("workspaces").select("id", { count: "exact", head: true }),
      supabase.from("purchases").select("amount")
    ]);

    const totalRevenue = (purchasesData || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalPurchases = purchasesData?.length || 0;

    // Let's also fetch PostHog stats if configured
    let totalPageViews = 0;
    const projectId = process.env.POSTHOG_PROJECT_ID;
    const pat = process.env.POSTHOG_PERSONAL_API_KEY;
    if (projectId && pat) {
      try {
        const ingestHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
        const apiHost = process.env.POSTHOG_API_HOST ?? ingestHost.replace(/^(https?:\/\/)(\w+)\.i\.posthog\.com/, "$1$2.posthog.com");
        
        const res = await fetch(`${apiHost}/api/projects/${projectId}/query/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${pat}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            query: { 
              kind: "HogQLQuery", 
              query: `SELECT count() FROM events WHERE event = 'funnel_page_view'` 
            } 
          }),
          cache: "no-store",
        });
        
        if (res.ok) {
          const json = await res.json();
          totalPageViews = Number(json?.results?.[0]?.[0] ?? 0);
        }
      } catch (e) {
        console.error("PostHog fetch error:", e);
      }
    }

    return Response.json({
      funnels: funnelsCount || 0,
      leads: leadsCount || 0,
      users: usersCount || 0,
      workspaces: workspacesCount || 0,
      purchases: totalPurchases,
      revenue: totalRevenue,
      pageViews: totalPageViews
    });
  } catch (error: any) {
    console.error("Failed to fetch admin stats:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
