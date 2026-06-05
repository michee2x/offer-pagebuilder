import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { FunnelSidebar } from "@/components/layout/FunnelSidebar";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, CheckCircle2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function BlueprintFilesPage({
  params,
}: {
  params: Promise<{ funnelId: string }>;
}) {
  const { funnelId } = await params;
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const supabase = createAdminClient();
  const { data: funnel } = await supabase
    .from("builder_pages")
    .select("id, name, blocks")
    .eq("id", funnelId)
    .eq("user_id", session.user.id)
    .single();

  if (!funnel) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#030712] text-center px-6">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-10">
          <h1 className="text-3xl font-black text-white mb-3">
            Blueprint files not found
          </h1>
          <p className="text-sm text-white/70 mb-6">
            We couldn&apos;t find this funnel or you don&apos;t have access to it.
            Please return to your workspace and try again.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-brand-indigo/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-indigo/20"
          >
            Back to workspace
          </Link>
        </div>
      </div>
    );
  }

  const blueprintFiles = Array.isArray(funnel.blocks?.blueprintFiles)
    ? funnel.blocks.blueprintFiles
    : [];
    
  const activeLeadMagnetFileId = funnel.blocks?.activeLeadMagnetFileId || null;

  async function setActiveLeadMagnet(formData: FormData) {
    "use server";
    const fileId = formData.get("fileId") as string;
    if (!fileId) return;
    
    const adminSupabase = createAdminClient();
    const { data: currentFunnel } = await adminSupabase
      .from("builder_pages")
      .select("blocks")
      .eq("id", funnelId)
      .single();
      
    if (currentFunnel?.blocks) {
      const newBlocks = { ...currentFunnel.blocks, activeLeadMagnetFileId: fileId };
      await adminSupabase.from("builder_pages").update({ blocks: newBlocks }).eq("id", funnelId);
      revalidatePath(`/funnels/${funnelId}/blueprint/files`);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] relative z-0">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Topbar
          breadcrumbs={[
            { label: "Workspaces", href: "/" },
            { label: funnel.name, href: `/funnels/${funnelId}` },
            { label: "Blueprint Files" },
          ]}
          actions={
            <Link
              href={`/funnels/${funnelId}/blueprint`}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
            >
              Back to Blueprint
            </Link>
          }
        />
        <div className="flex flex-1 overflow-hidden">
          <FunnelSidebar
            funnelId={funnelId}
            funnelName={funnel.name}
            collapsible
          />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-3xl font-black text-white">
                    Blueprint Files
                  </h1>
                  <p className="mt-2 text-sm text-white/60 max-w-2xl">
                    Select a blueprint below to act as the Active Lead Magnet for this funnel. 
                    When a user submits the Lead Capture Form, they will be emailed the active blueprint.
                  </p>
                </div>
                <Link href={`/funnels/${funnelId}/blueprint`}>
                  <Button size="lg" className="px-5 py-3">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Generate New Blueprint
                  </Button>
                </Link>
              </div>

              {blueprintFiles.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
                  <p className="text-lg font-semibold text-white">
                    No blueprint files found yet.
                  </p>
                  <p className="mt-2 text-sm text-white/50">
                    Generate a lead magnet or bonus blueprint from the Blueprint
                    page first.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <Link href={`/funnels/${funnelId}/blueprint`}>
                      <Button size="lg">Go to Blueprint</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/10 bg-[#0f1725]">
                          <th className="px-5 py-4 text-sm font-semibold text-white/60">
                            Topic
                          </th>
                          <th className="px-5 py-4 text-sm font-semibold text-white/60">
                            Created
                          </th>
                          <th className="px-5 py-4 text-sm font-semibold text-white/60">
                            Status
                          </th>
                          <th className="px-5 py-4 text-sm font-semibold text-white/60">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {blueprintFiles.map((file: any, index: number) => {
                          const fileKey = file.id || file.fileName || `blueprint-file-${index}`;
                          const downloadId = file.id || file.fileName;
                          const isActive = activeLeadMagnetFileId === downloadId;
                          
                          return (
                            <tr
                              key={fileKey}
                              className={`border-b border-white/10 last:border-none hover:bg-white/5 transition-colors ${isActive ? 'bg-brand-indigo/5' : ''}`}
                            >
                            <td className="px-5 py-4 align-middle text-sm text-white">
                              {file.topic}
                            </td>
                            <td className="px-5 py-4 align-middle text-sm text-white/70">
                              {file.createdAt
                                ? new Date(file.createdAt).toLocaleString(
                                    "en-US",
                                    { month: "short", day: "numeric", year: "numeric" }
                                  )
                                : "—"}
                            </td>
                            <td className="px-5 py-4 align-middle text-sm">
                              {isActive ? (
                                <div className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-400">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  Active Lead Magnet
                                </div>
                              ) : (
                                <form action={setActiveLeadMagnet}>
                                  <input type="hidden" name="fileId" value={downloadId} />
                                  <button type="submit" className="text-xs font-semibold text-white/50 hover:text-white transition underline decoration-white/20 underline-offset-4">
                                    Set as Active
                                  </button>
                                </form>
                              )}
                            </td>
                            <td className="px-5 py-4 align-middle text-sm">
                              <Link
                                href={`/api/blueprints/download?funnelId=${encodeURIComponent(
                                  funnelId,
                                )}&fileId=${encodeURIComponent(downloadId)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Link>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
