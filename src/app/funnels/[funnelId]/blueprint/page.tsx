import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { FunnelSidebar } from "@/components/layout/FunnelSidebar";
import { BlueprintDashboard } from "./BlueprintDashboard";

interface Props {
  params: Promise<{ funnelId: string }>;
}

export default async function BlueprintPage({ params }: Props) {
  const { funnelId } = await params;
  const session = await getSession();

  if (!session?.user?.id) redirect("/login");

  const supabase = createAdminClient();

  const { data: funnel } = await supabase
    .from("builder_pages")
    .select("id, name, blocks")
    .eq("id", funnelId)
    .eq("user_id", session.user.id)
    .single();

  if (!funnel) redirect("/");

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] relative z-0">
      {/* Background Elements (copied from home page) */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        {/* Radial - Pink */}
        <div
          className="absolute top-[80px] right-[-480px] w-[994px] h-[800px] opacity-40"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgb(236, 72, 153) 0%, rgba(236, 72, 153, 0) 100%)",
            transform: "rotate(-30deg)",
          }}
        />
        {/* Radial - Blue */}
        <div
          className="absolute top-[80px] left-[-480px] w-[994px] h-[800px] opacity-40"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgb(59, 130, 246) 0%, rgba(59, 130, 246, 0) 100%)",
            transform: "rotate(30deg)",
          }}
        />
        {/* Radial - Purple */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[522px] opacity-[0.36] z-[1]"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgb(140, 22, 250) 0%, rgba(140, 22, 250, 0) 100%)",
          }}
        />
        {/* Bottom Gradient Overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[240px] z-[2] opacity-100"
          style={{
            background:
              "linear-gradient(180deg, rgba(3, 7, 18, 0) 0%, rgb(3, 7, 18) 100%)",
          }}
        />
        {/* Noise Overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none z-[1]"
          style={{
            backgroundImage:
              "url(https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png)",
            backgroundRepeat: "repeat",
            backgroundSize: "128px auto",
          }}
        />
      </div>

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Topbar
          breadcrumbs={[
            { label: "Workspaces", href: "/" },
            { label: funnel.name, href: `/funnels/${funnelId}` },
            { label: "Lead Magnet Blueprint" },
          ]}
          actions={
            <Link
              href={`/funnels/${funnelId}/blueprint/files`}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
            >
              View Files
            </Link>
          }
        />
        <div className="flex flex-1 overflow-hidden">
          <FunnelSidebar
            funnelId={funnelId}
            funnelName={funnel.name}
            collapsible
          />
          <BlueprintDashboard
            funnelId={funnelId}
            funnelName={funnel.name}
            initialBlocks={funnel.blocks}
          />
        </div>
      </div>
    </div>
  );
}
