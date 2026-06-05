import { createAdminClient } from "@/utils/supabase/admin";
import ClientDownloadRedirect from "@/components/blueprint/ClientDownloadRedirect";
import { DownloadCloud } from "lucide-react";

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
  const fileIdValue = sp?.fileId || sp?.id || sp?.file || null;
  const fileId = Array.isArray(fileIdValue) ? fileIdValue[0] : fileIdValue;

  let downloadUrl = null;

  if (fileId) {
    downloadUrl = `/api/blueprints/download?funnelId=${encodeURIComponent(
      funnelId,
    )}&fileId=${encodeURIComponent(fileId)}`;
  } else {
    // If no fileId in query, attempt to fetch the latest generated file for this funnel
    try {
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
            downloadUrl = `/api/blueprints/download?funnelId=${encodeURIComponent(
              funnelId,
            )}&fileId=${encodeURIComponent(latestFileId)}`;
          }
        }
      }
    } catch (e) {
      console.error("[blueprint/download] Could not fetch latest file:", e);
    }
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vh] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vh] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-xl w-full rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-10 text-center shadow-2xl">
        {downloadUrl ? (
          <>
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <DownloadCloud className="w-8 h-8 animate-bounce" />
            </div>
            <h1 className="text-3xl font-bold mb-4 tracking-tight">
              Downloading Blueprint...
            </h1>
            <p className="text-white/60 mb-8 text-lg">
              Your generated blueprint will automatically download in a moment.
            </p>
            <a
              href={downloadUrl}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium border border-white/10"
            >
              Click here if it doesn't start
            </a>
            {/* The client component triggers the automatic download */}
            <ClientDownloadRedirect downloadUrl={downloadUrl} />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">Missing File</h1>
            <p className="text-sm text-white/70 mb-8">
              Please return to the Blueprint page and select a file to download.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
