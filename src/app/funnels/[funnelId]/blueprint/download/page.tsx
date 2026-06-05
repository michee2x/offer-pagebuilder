import { redirect } from "next/navigation";
import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";

interface BlueprintDownloadPageProps {
  params: { funnelId: string };
  searchParams: { [key: string]: any };
}

export default async function BlueprintDownloadPage({
  params,
  searchParams,
}: BlueprintDownloadPageProps) {
  const { funnelId } = params;

  // Accept multiple query names for backwards compatibility
  const fileId = searchParams?.fileId || searchParams?.id || searchParams?.file || null;

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
        redirect(
          `/api/blueprints/download?funnelId=${encodeURIComponent(
            funnelId,
          )}&fileId=${encodeURIComponent(latest.id)}`,
        );
        return null;
      }
    }
  } catch (e) {
    // ignore and show fallback message below
    console.error("[blueprint/download] Could not fetch latest file:", e);
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-8">
      <div className="max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Missing download file ID</h1>
        <p className="text-sm text-white/70">
          Please return to the Blueprint page and select a file to download.
        </p>
      </div>
    </main>
  );
}
