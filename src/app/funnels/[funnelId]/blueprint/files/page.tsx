import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { FunnelSidebar } from "@/components/layout/FunnelSidebar";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";

export default async function BlueprintFilesPage({
  params,
}: {
  params: Promise<{ funnelId: string }>;
}) {
  const { funnelId } = await params;
  const session = await getSession();
  console.log("[blueprint/files] loading funnel files", { funnelId, userId: session?.user?.id });
  if (!session?.user?.id) {
    console.warn("[blueprint/files] no active session, redirecting to login");
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
    console.warn("[blueprint/files] funnel missing or access denied", {
      funnelId,
      userId: session.user.id,
    });
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
                    All generated Lead Magnet and Bonus Stack blueprints are
                    stored here. Download any file or create a new blueprint
                    from the main screen.
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
                            Type
                          </th>
                          <th className="px-5 py-4 text-sm font-semibold text-white/60">
                            Created
                          </th>
                          <th className="px-5 py-4 text-sm font-semibold text-white/60">
                            File
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
                          return (
                            <tr
                              key={fileKey}
                              className="border-b border-white/10 last:border-none hover:bg-white/5"
                            >
                            <td className="px-5 py-4 align-top text-sm text-white">
                              {file.topic}
                            </td>
                            <td className="px-5 py-4 align-top text-sm text-white/80 capitalize">
                              {file.type || "lead"}
                            </td>
                            <td className="px-5 py-4 align-top text-sm text-white/70">
                              {file.createdAt
                                ? new Date(file.createdAt).toLocaleString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    },
                                  )
                                : "—"}
                            </td>
                            <td className="px-5 py-4 align-top text-sm text-white/70">
                              {file.fileName || "blueprint.pdf"}
                            </td>
                            <td className="px-5 py-4 align-top text-sm">
                              <Link
                                href={`/api/blueprints/download?funnelId=${encodeURIComponent(
                                  funnelId,
                                )}&fileId=${encodeURIComponent(downloadId)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-2xl border border-white/10 bg-brand-indigo/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-indigo/20"
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
