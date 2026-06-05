import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import ClientDownloadRedirect from "@/components/blueprint/ClientDownloadRedirect";

interface BlueprintDownloadPageProps {
  params: Promise<{ funnelId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlueprintDownloadPage({
  params,
  searchParams,
}: BlueprintDownloadPageProps) {
  const { funnelId } = await params;
  const sp = await searchParams;

  // Accept multiple query names for backwards compatibility
  const fileId =
    sp?.fileId || sp?.id || sp?.file || null;

  if (fileId) {
    redirect(
      `/api/blueprints/download?funnelId=${encodeURIComponent(
        funnelId,
      )}&fileId=${encodeURIComponent(fileId)}`,
    );
    return null;
  }

  // If no fileId in query, attempt to fetch the latest generated file for this funnel
  try {
    // Use admin client so we can read funnel blocks server-side
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("builder_pages")
      .select("blocks")
      .eq("id", funnelId)
      .single();

    if (!error && data) {
      const blueprintFiles = Array.isArray(data.blocks?.blueprintFiles)
        ? data.blocks.blueprintFiles
        : [];
      if (blueprintFiles.length > 0) {
        const latest = blueprintFiles[blueprintFiles.length - 1];
        const latestFileId = latest.id || latest.fileName;
        if (latestFileId) {
          redirect(
            `/api/blueprints/download?funnelId=${encodeURIComponent(
              funnelId,
            )}&fileId=${encodeURIComponent(latestFileId)}`,
          );
          return null;
        }
      }
    }
  } catch (e) {
    // ignore and show fallback message below
    console.error("[blueprint/download] Could not fetch latest file:", e);
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-8">
      {/* Client-side redirect fallback (handles cases where server searchParams are missing) */}
      <ClientDownloadRedirect funnelId={funnelId} />
      <div className="max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Missing download file ID</h1>
        <p className="text-sm text-white/70">
          Please return to the Blueprint page and select a file to download.
        </p>
      </div>
    </main>
  );
}
