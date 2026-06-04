import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const workspace = url.searchParams.get("workspace");
    const offer = url.searchParams.get("offer");

    if (!workspace || !offer) {
      return NextResponse.json({ error: "Missing workspace or offer" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Try to find a builder_pages record matching workspace + name (offer slug/name)
    const { data: funnel, error } = await supabase
      .from("builder_pages")
      .select("id")
      .eq("workspace_id", workspace)
      .ilike("name", offer)
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!funnel || !funnel.id) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({ found: true, funnelId: funnel.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
