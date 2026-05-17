import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Folder } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/CampaignCard";

export default async function DashboardPage(props: {
  searchParams: Promise<{ workspace?: string }>;
}) {
  const { workspace } = await props.searchParams;

  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") || undefined;
  const host = requestHeaders.get("host");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
    : host?.includes("localhost")
      ? `http://${host}`
      : host
        ? `https://${host}`
        : "http://localhost:3000";

  const response = await fetch(new URL("/api/workspaces", baseUrl), {
    method: "GET",
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });

  if (response.status === 401) {
    redirect("/login");
  }

  const result = await response.json();
  const allWorkspaces = response.ok ? result.workspaces || [] : [];
  const error = response.ok
    ? null
    : result.error || new Error("Failed to load workspaces");

  if (error) {
    console.error("Dashboard workspace query error:", error);
  }

  const activeWorkspaceId =
    workspace ||
    (allWorkspaces && allWorkspaces.length > 0 ? allWorkspaces[0].id : null);
  const activeWorkspace = allWorkspaces?.find(
    (w: any) => w.id === activeWorkspaceId,
  );

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center overflow-hidden relative">
      {/* Gallereee Background Elements (Exact Framer Styles) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
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
      <div className="flex-1 w-full flex flex-col min-w-0 overflow-hidden relative z-10">
        <Topbar breadcrumbs={[{ label: "Workspaces" }]}>
          <WorkspaceSwitcher
            workspaces={allWorkspaces}
            activeId={activeWorkspaceId}
          />
        </Topbar>

        <main className="flex-1 overflow-y-auto pt-24 pb-12 px-6 md:px-12">
          {/* Gallereee Hero Section */}
          <div className="max-w-[1200px] mx-auto text-center mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-8">
              <span className="bg-blue-500 text-[10px] font-bold px-1.5 py-0.5 rounded text-white uppercase tracking-wider">New</span>
              <span className="text-[13px] text-white/70">Campaign Intelligence module</span>
            </div>

            <h1 className="text-[56px] md:text-[72px] font-bold text-white tracking-tight mb-6 leading-[1.1]">
              The directory & <br />campaigns system
            </h1>

            <p className="text-[18px] md:text-[20px] text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Build your own curation campaign system with offeriq.
              Manage your campaigns and intelligence reports from one central dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {activeWorkspace ? (
                <a
                  href={"/onboard?workspace=" + activeWorkspace.id}
                  className="h-14 px-8 rounded-full bg-white text-black font-bold flex items-center justify-center gap-2 transition-all hover:bg-white/90 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                >
                  Launch campaign <span className="text-xl">↗</span>
                </a>
              ) : (
                <Link href="/onboard">
                  <Button className="h-14 px-8 rounded-full bg-white text-black font-bold hover:bg-white/90">Create workspace</Button>
                </Link>
              )}
              <button className="h-14 px-8 rounded-full bg-white/[0.03] border border-white/10 text-white font-medium hover:bg-white/[0.08] transition-all">
                Submit website
              </button>
            </div>
          </div>

          <div className="max-w-[1200px] mx-auto">
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 mb-12">
                Failed to load workspaces. {error.message || "Please refresh the page."}
              </div>
            )}

            {!activeWorkspace ? (
              <div className="flex flex-col items-center justify-center border border-white/10 rounded-2xl p-16 text-center bg-white/[0.02] backdrop-blur-sm">
                <Folder className="w-10 h-10 text-white/20 mb-4" />
                <h3 className="text-xl font-bold text-white">No workspaces yet</h3>
                <p className="text-white/50 mt-1 mb-8">Create your first workspace to start managing campaigns.</p>
                <Link href="/onboard">
                  <Button size="lg" className="h-12 px-8 rounded-full">Create workspace</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Latest</h2>
                </div>

                {activeWorkspace.builder_pages &&
                  activeWorkspace.builder_pages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {activeWorkspace.builder_pages.map((funnel: any) => (
                      <CampaignCard key={funnel.id} funnel={funnel} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed">
                    <img
                      src="https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=2070&auto=format&fit=crop"
                      className="w-48 h-48 object-cover rounded-2xl opacity-20 mb-6 grayscale"
                      alt="No campaigns"
                    />
                    <p className="text-white/40 text-[15px]">No campaigns in this workspace yet.</p>
                    <a
                      href={"/onboard?workspace=" + activeWorkspace.id}
                      className="text-white font-semibold mt-4 hover:underline transition-all"
                    >
                      Launch your first campaign
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
