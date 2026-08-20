import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { FunnelSidebar } from "@/components/layout/FunnelSidebar";
import { Button } from "@/components/ui/button";
import {
  Download,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  XCircle,
  Mail,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Gift,
  Package,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { revalidatePath } from "next/cache";
import { AutoRefresh } from "@/components/AutoRefresh";

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
          <h1 className="text-3xl font-black text-white mb-3">Asset Bank not found</h1>
          <p className="text-sm text-white/70 mb-6">
            We couldn&apos;t find this funnel or you don&apos;t have access to it.
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

  const blueprintFiles: any[] = Array.isArray(funnel.blocks?.blueprintFiles)
    ? funnel.blocks.blueprintFiles
    : [];

  const activeLeadMagnetFileId = funnel.blocks?.activeLeadMagnetFileId || null;
  const activeProductSales = funnel.blocks?.activeProductFileId_sales || null;
  const activeProductUpsell = funnel.blocks?.activeProductFileId_upsell || null;
  const activeProductDownsell = funnel.blocks?.activeProductFileId_downsell || null;
  const isAnyGenerating = blueprintFiles.some((f: any) => f.status === "generating");

  // Partition files by type
  const leadMagnets = blueprintFiles.filter((f) => f.type === "lead");
  const bonuses = blueprintFiles.filter((f) => f.type === "bonus");
  const productsByPage = {
    sales: blueprintFiles.filter((f) => f.type === "product" && f.page === "sales"),
    upsell: blueprintFiles.filter((f) => f.type === "product" && f.page === "upsell"),
    downsell: blueprintFiles.filter((f) => f.type === "product" && f.page === "downsell"),
  };

  // Server Actions
  async function setActiveLeadMagnet(formData: FormData) {
    "use server";
    const fileId = formData.get("fileId") as string;
    if (!fileId) return;
    const admin = createAdminClient();
    const { data: cur } = await admin.from("builder_pages").select("blocks").eq("id", funnelId).single();
    if (cur?.blocks) {
      await admin.from("builder_pages").update({ blocks: { ...cur.blocks, activeLeadMagnetFileId: fileId } }).eq("id", funnelId);
      revalidatePath(`/funnels/${funnelId}/blueprint/files`);
    }
  }

  async function setActiveProduct(formData: FormData) {
    "use server";
    const fileId = formData.get("fileId") as string;
    const page = formData.get("page") as string;
    if (!fileId || !page) return;
    const admin = createAdminClient();
    const { data: cur } = await admin.from("builder_pages").select("blocks").eq("id", funnelId).single();
    if (cur?.blocks) {
      const key = `activeProductFileId_${page}`;
      await admin.from("builder_pages").update({ blocks: { ...cur.blocks, [key]: fileId } }).eq("id", funnelId);
      revalidatePath(`/funnels/${funnelId}/blueprint/files`);
    }
  }

  async function assignBonusToProduct(formData: FormData) {
    "use server";
    const bonusId = formData.get("bonusId") as string;
    const productId = formData.get("productId") as string;
    if (!bonusId) return;
    const admin = createAdminClient();
    const { data: cur } = await admin.from("builder_pages").select("blocks").eq("id", funnelId).single();
    if (cur?.blocks) {
      const files = (cur.blocks.blueprintFiles || []).map((f: any) =>
        f.id === bonusId ? { ...f, assignedProductId: productId || null } : f
      );
      await admin.from("builder_pages").update({ blocks: { ...cur.blocks, blueprintFiles: files } }).eq("id", funnelId);
      revalidatePath(`/funnels/${funnelId}/blueprint/files`);
    }
  }

  const allProducts = blueprintFiles.filter((f) => f.type === "product");

  const statusBadge = (file: any) => {
    if (file.status === "generating") return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
        <Loader2 className="w-3 h-3 animate-spin" /> Generating
      </span>
    );
    if (file.status === "failed") return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
        <XCircle className="w-3 h-3" /> Failed
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-400">
        <CheckCircle2 className="w-3 h-3" /> Ready
      </span>
    );
  };

  const downloadLink = (file: any) => {
    if (file.status !== "completed" && !file.url) return (
      <span className="text-xs text-white/20 italic">Not ready</span>
    );
    const fileId = file.id || file.fileName;
    return (
      <Link
        href={`/api/blueprints/download?funnelId=${encodeURIComponent(funnelId)}&fileId=${encodeURIComponent(fileId)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
      >
        <Download className="w-3.5 h-3.5 mr-1.5" /> Download
      </Link>
    );
  };

  const ProductCard = ({
    file,
    activeId,
    page,
  }: {
    file: any | null;
    activeId: string | null;
    page: "sales" | "upsell" | "downsell";
  }) => {
    if (!file) {
      return (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 flex items-center gap-3 text-white/30">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">No info product generated yet for this page.</p>
        </div>
      );
    }
    const isActive = activeId === file.id;
    return (
      <div className={`rounded-2xl border p-5 transition-all ${isActive ? "border-brand-indigo/40 bg-brand-indigo/5" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm leading-tight truncate">{file.topic}</p>
            {file.chapters && file.chapters.length > 0 && (
              <p className="text-xs text-white/40 mt-1">{file.chapters.length} chapters</p>
            )}
          </div>
          {statusBadge(file)}
        </div>
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          {downloadLink(file)}
          {!isActive && file.status === "completed" && (
            <form action={setActiveProduct}>
              <input type="hidden" name="fileId" value={file.id} />
              <input type="hidden" name="page" value={page} />
              <button type="submit" className="text-xs font-semibold text-white/50 hover:text-brand-indigo transition underline-offset-4 underline decoration-white/20">
                Set as Active
              </button>
            </form>
          )}
          {isActive && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-indigo">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] relative z-0">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Topbar
          breadcrumbs={[
            { label: "Workspaces", href: "/" },
            { label: funnel.name, href: `/funnels/${funnelId}` },
            { label: "Asset Bank — Files" },
          ]}
          actions={
            <Link
              href={`/funnels/${funnelId}/blueprint`}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Blueprint Architect
            </Link>
          }
        />

        {isAnyGenerating && <AutoRefresh interval={4000} />}

        <div className="flex flex-1 overflow-hidden">
          <FunnelSidebar funnelId={funnelId} funnelName={funnel.name} collapsible />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-5xl mx-auto space-y-10">

              {/* Header */}
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-3xl font-black text-white">Asset Bank</h1>
                  <p className="mt-2 text-sm text-white/50 max-w-2xl">
                    All generated info products, lead magnets, and bonuses for this funnel. Bonuses are sent to buyers only — not to free leads.
                  </p>
                </div>
                <Link href={`/funnels/${funnelId}/blueprint`}>
                  <Button size="lg" className="px-5 py-3">
                    <Package className="w-4 h-4 mr-2" />
                    Generate More
                  </Button>
                </Link>
              </div>

              {blueprintFiles.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
                  <Package className="w-10 h-10 text-white/20 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-white">No assets generated yet.</p>
                  <p className="mt-2 text-sm text-white/40">
                    Deploy your funnel and click &ldquo;Generate Info Products&rdquo; to auto-generate all 7 assets, or use the Blueprint Architect to generate individual assets.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <Link href={`/funnels/${funnelId}/blueprint`}>
                      <Button size="lg">Go to Blueprint Architect</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">

                  {/* ──────────────── SEGMENT 1: LEAD CAPTURE ──────────────── */}
                  <section>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Lead Capture</h2>
                        <p className="text-xs text-white/40">Sent free when a lead submits their email. No bonus included.</p>
                      </div>
                    </div>

                    {leadMagnets.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-white/30 text-sm flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 shrink-0" /> No lead magnet generated yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {leadMagnets.map((file) => {
                          const isActive = activeLeadMagnetFileId === file.id;
                          return (
                            <div
                              key={file.id}
                              className={`rounded-2xl border p-5 transition-all ${isActive ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <BookOpen className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                    <p className="font-semibold text-white text-sm truncate">{file.topic}</p>
                                  </div>
                                  <p className="text-xs text-white/40">Free · No bonus sent with this</p>
                                </div>
                                {statusBadge(file)}
                              </div>
                              <div className="mt-4 flex items-center gap-3 flex-wrap">
                                {downloadLink(file)}
                                {!isActive && file.status === "completed" && (
                                  <form action={setActiveLeadMagnet}>
                                    <input type="hidden" name="fileId" value={file.id} />
                                    <button type="submit" className="text-xs font-semibold text-white/50 hover:text-green-400 transition underline underline-offset-4 decoration-white/20">
                                      Set as Active Lead Magnet
                                    </button>
                                  </form>
                                )}
                                {isActive && (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Lead Magnet
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  {/* ──────────────── SEGMENT 2: SALES PAGE PRODUCTS ──────────────── */}
                  <section>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-brand-indigo" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Sales Page Info Products</h2>
                        <p className="text-xs text-white/40">Paid info products sold on each sales page. Bonuses are sent with these on purchase.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Sales */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <ShoppingCart className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-xs font-bold uppercase tracking-widest text-white/40">Sales Page</span>
                        </div>
                        {productsByPage.sales.length === 0
                          ? <ProductCard file={null} activeId={null} page="sales" />
                          : productsByPage.sales.map(f => <ProductCard key={f.id} file={f} activeId={activeProductSales} page="sales" />)
                        }
                      </div>
                      {/* Upsell */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-xs font-bold uppercase tracking-widest text-white/40">Upsell Page</span>
                        </div>
                        {productsByPage.upsell.length === 0
                          ? <ProductCard file={null} activeId={null} page="upsell" />
                          : productsByPage.upsell.map(f => <ProductCard key={f.id} file={f} activeId={activeProductUpsell} page="upsell" />)
                        }
                      </div>
                      {/* Downsell */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingDown className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-xs font-bold uppercase tracking-widest text-white/40">Downsell Page</span>
                        </div>
                        {productsByPage.downsell.length === 0
                          ? <ProductCard file={null} activeId={null} page="downsell" />
                          : productsByPage.downsell.map(f => <ProductCard key={f.id} file={f} activeId={activeProductDownsell} page="downsell" />)
                        }
                      </div>
                    </div>
                  </section>

                  {/* ──────────────── SEGMENT 3: BONUSES ──────────────── */}
                  <section>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Gift className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Bonuses</h2>
                        <p className="text-xs text-white/40">Sent to buyers along with the assigned info product. Assign each bonus to a specific product below.</p>
                      </div>
                    </div>

                    {bonuses.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-white/30 text-sm flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 shrink-0" /> No bonuses generated yet. Use the Blueprint Architect to generate one.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bonuses.map((bonus) => {
                          const assignedProduct = allProducts.find(p => p.id === bonus.assignedProductId);
                          return (
                            <div key={bonus.id} className="rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] p-5 transition-all">
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <p className="font-semibold text-white text-sm truncate">{bonus.topic}</p>
                                  </div>
                                  {assignedProduct ? (
                                    <p className="text-xs text-amber-400/70">
                                      Assigned to: <span className="font-semibold">{assignedProduct.topic}</span>
                                    </p>
                                  ) : (
                                    <p className="text-xs text-white/30 italic">Not assigned to any product yet</p>
                                  )}
                                </div>
                                {statusBadge(bonus)}
                              </div>
                              <div className="mt-4 flex items-center gap-3 flex-wrap">
                                {downloadLink(bonus)}
                                {/* Bonus assignment form */}
                                <form action={assignBonusToProduct} className="flex items-center gap-2">
                                  <input type="hidden" name="bonusId" value={bonus.id} />
                                  <select
                                    name="productId"
                                    defaultValue={bonus.assignedProductId || ""}
                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 focus:outline-none focus:border-brand-indigo/50 cursor-pointer"
                                  >
                                    <option value="">Unassigned</option>
                                    {allProducts.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.page ? `[${p.page.charAt(0).toUpperCase() + p.page.slice(1)}] ` : ""}{p.topic.length > 40 ? p.topic.slice(0, 40) + "…" : p.topic}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="submit"
                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
                                  >
                                    Save
                                  </button>
                                </form>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
