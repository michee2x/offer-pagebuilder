import { createAdminClient } from "@/utils/supabase/admin";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: page } = await supabase
    .from("builder_pages")
    .select("name")
    .eq("id", id)
    .single();
  return { title: page ? `Your Purchase - ${page.name}` : "Product Delivery" };
}

export default async function DeliveryPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: page, error } = await supabase
    .from("builder_pages")
    .select("id, name, blocks")
    .eq("id", id)
    .single();

  if (error || !page) return notFound();

  const blueprintFiles: { name: string; url: string; type: string }[] =
    Array.isArray((page.blocks as any)?.blueprintFiles)
      ? (page.blocks as any).blueprintFiles
      : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #09090b 0%, #0f0f23 50%, #09090b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          width: "100%",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "1.5rem",
          padding: "2.5rem",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Success Icon */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              fontSize: "2rem",
              marginBottom: "1rem",
              boxShadow: "0 0 30px rgba(16,185,129,0.3)",
            }}
          >
            ✓
          </div>
          <h1 style={{ color: "white", fontSize: "1.75rem", fontWeight: 900, margin: 0 }}>
            Thank you for your purchase!
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            {page.name}
          </p>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "1.5rem 0" }} />

        {blueprintFiles.length > 0 ? (
          <>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", marginBottom: "1rem" }}>
              Your product{blueprintFiles.length > 1 ? "s are" : " is"} ready. Click below to download:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {blueprintFiles.map((file, i) => (
                <a
                  key={i}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem 1.25rem",
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    borderRadius: "0.875rem",
                    textDecoration: "none",
                    color: "white",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>
                    {file.type?.includes("pdf") ? "📄" : file.type?.includes("video") ? "🎬" : "📦"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: "white" }}>
                      {file.name}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                      Click to download
                    </p>
                  </div>
                  <span style={{ color: "rgba(99,102,241,0.8)", fontSize: "1.25rem" }}>↓</span>
                </a>
              ))}
            </div>
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "1rem",
              border: "1px dashed rgba(255,255,255,0.1)",
            }}
          >
            <p style={{ fontSize: "2rem", margin: "0 0 0.5rem" }}>📦</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", margin: 0 }}>
              Your access has been granted. Check your email for delivery details and next steps.
            </p>
          </div>
        )}

        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem", textAlign: "center", marginTop: "2rem", marginBottom: 0 }}>
          Powered by OfferIQ • If you have issues, contact the seller.
        </p>
      </div>
    </div>
  );
}
