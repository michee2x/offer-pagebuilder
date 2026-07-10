import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ProductsClient } from "./ProductsClient";
import { getUser } from "@/auth";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ funnelId: string }>;
}) {
  const { funnelId } = await params;
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: funnel, error: funnelError } = await supabase
    .from("funnels")
    .select("workspace_id, name")
    .eq("id", funnelId)
    .single();

  if (funnelError || !funnel) {
    notFound();
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("funnel_id", funnelId)
    .order("created_at", { ascending: true });

  if (productsError) {
    console.error("Error fetching products:", productsError);
  }

  return <ProductsClient funnelId={funnelId} initialProducts={products || []} />;
}
