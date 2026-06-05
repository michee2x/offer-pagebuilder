import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const funnelId = url.searchParams.get("funnelId");
    if (!funnelId) {
      return NextResponse.json({ error: "Missing funnelId" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("builder_pages")
      .select("blocks")
      .eq("id", funnelId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
    }

    const blueprintFiles = Array.isArray(data.blocks?.blueprintFiles)
      ? data.blocks.blueprintFiles
      : [];

    return NextResponse.json({ success: true, blueprintFiles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
