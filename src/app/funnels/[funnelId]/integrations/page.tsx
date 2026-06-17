import { redirect } from "next/navigation";
import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { FunnelSidebar } from "@/components/layout/FunnelSidebar";
import { IntegrationsClient } from "./IntegrationsClient";

interface Props {
  params: Promise<{ funnelId: string }>;
}

export default async function IntegrationsPage({ params }: Props) {
  const { funnelId } = await params;
  const session = await getSession();

  if (!session?.user?.id) redirect("/login");

  const supabase = createAdminClient();

  const { data: funnel } = await supabase
    .from("builder_pages")
    .select("id, name, blocks, subdomain")
    .eq("id", funnelId)
    .eq("user_id", session.user.id)
    .single();

  if (!funnel) redirect("/");

  const makeWebhookUrl = funnel.blocks?.integrations?.makeWebhookUrl || "";
  const zapierWebhookUrl = funnel.blocks?.integrations?.zapierWebhookUrl || "";
  const checkoutUrls = funnel.blocks?.integrations?.checkoutUrls || {};

  // Extract page paths from the funnel blocks for the checkout helper
  const pagePaths: string[] = funnel.blocks?.pages
    ? Object.keys(funnel.blocks.pages)
    : ["/"];
  const subdomain = (funnel as any).subdomain || "";

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] relative z-0">
      {/* Background Elements */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div
          className="absolute top-[80px] right-[-480px] w-[994px] h-[800px] opacity-40"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgb(236, 72, 153) 0%, rgba(236, 72, 153, 0) 100%)",
            transform: "rotate(-30deg)",
          }}
        />
        <div
          className="absolute top-[80px] left-[-480px] w-[994px] h-[800px] opacity-40"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgb(59, 130, 246) 0%, rgba(59, 130, 246, 0) 100%)",
            transform: "rotate(30deg)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[522px] opacity-[0.36] z-[1]"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgb(140, 22, 250) 0%, rgba(140, 22, 250, 0) 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[240px] z-[2] opacity-100"
          style={{
            background:
              "linear-gradient(180deg, rgba(3, 7, 18, 0) 0%, rgb(3, 7, 18) 100%)",
          }}
        />
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
            { label: "Integrations" },
          ]}
        />
        <div className="flex flex-1 overflow-hidden">
          <FunnelSidebar
            funnelId={funnelId}
            funnelName={funnel.name}
            collapsible
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent relative z-10">
            <IntegrationsClient 
              funnelId={funnelId} 
              initialMakeUrl={makeWebhookUrl}
              initialZapierUrl={zapierWebhookUrl}
              initialCheckoutUrls={checkoutUrls}
              subdomain={subdomain}
              pagePaths={pagePaths}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
