import { redirect } from "next/navigation";

interface BlueprintDownloadPageProps {
  params: { funnelId: string };
  searchParams: { fileId?: string };
}

export default function BlueprintDownloadPage({
  params,
  searchParams,
}: BlueprintDownloadPageProps) {
  const { funnelId } = params;
  const { fileId } = searchParams;

  if (!fileId) {
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

  redirect(
    `/api/blueprints/download?funnelId=${encodeURIComponent(
      funnelId,
    )}&fileId=${encodeURIComponent(fileId)}`,
  );
}
