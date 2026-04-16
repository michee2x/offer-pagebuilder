import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import {
  PieChart,
  LineChart,
  Mail,
  FileText,
  Activity,
  Globe,
  Settings,
  Layout,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    { label: "Total Views", value: "0", icon: Activity },
    { label: "Conversion Rate", value: "0%", icon: PieChart },
    { label: "Total Leads", value: "0", icon: Mail },
    { label: "Sales Generated", value: "$0", icon: LineChart },
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
        >
          <div className="flex items-center gap-2">
            <Link href={`/builder?id=${funnel.id}`}>
              <Button size="sm" variant="outline">
                <Layout className="w-4 h-4 mr-2" />
                Edit Page
              </Button>
            </Link>
          </div>
        </Topbar>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {funnel.name} - Overview
                </h1>
                <p className="text-muted-foreground mt-1">
                  Created {new Date(funnel.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-3">
                <Link href={`/intelligence/${funnel.id}`}>
                  <Button variant="secondary" className="gap-2">
                    <PieChart className="w-4 h-4" />
                    Sales Report
                  </Button>
                </Link>
                <Link href={`/builder?id=${funnel.id}`}>
                  <Button className="gap-2">
                    <Globe className="w-4 h-4" />
                    Open Builder
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3 text-muted-foreground font-medium">
                    <stat.icon className="w-5 h-5" />
                    {stat.label}
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions / Modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href={`/copy/${funnel.id}`} className="block group">
                <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-colors h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Sales Copy</h3>
                  <p className="text-muted-foreground text-sm flex-1">
                    Manage and edit the AI-generated sales copy for your funnel.
                  </p>
                </div>
              </Link>

              <Link href={`/email-sequence/${funnel.id}`} className="block group">
                <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-colors h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Email Sequence</h3>
                  <p className="text-muted-foreground text-sm flex-1">
                    Configure your automated follow-up emails and nurture sequences.
                  </p>
                </div>
              </Link>

              <Link href={`/traffic/${funnel.id}`} className="block group">
                <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-colors h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Traffic Intelligence</h3>
                  <p className="text-muted-foreground text-sm flex-1">
                    View ad creative ideas, audience targeting, and traffic strategies.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
