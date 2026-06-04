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

    const blueprintUrl = data.blocks?.blueprintUrl;
    if (!blueprintUrl) {
      return NextResponse.json({ error: "No blueprint available" }, { status: 404 });
    }

    // Fetch the file from the storage URL and stream it back with attachment headers
    const upstream = await fetch(blueprintUrl);
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Failed to fetch blueprint file" }, { status: 502 });
    }

    // Derive filename from URL
    let filename = "blueprint.pdf";
    try {
      const p = new URL(blueprintUrl).pathname.split("/").pop();
      if (p) filename = decodeURIComponent(p);
    } catch {}

    const headers = new Headers(upstream.headers);
    // Force download
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    // Ensure content-type is set (fallback to pdf)
    if (!headers.get("content-type")) headers.set("Content-Type", "application/pdf");

    return new NextResponse(upstream.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
