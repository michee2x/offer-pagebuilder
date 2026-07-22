import { getSession } from "@/auth";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const supabase = await createClient();
  
  // Verify user is an admin
  const { data: userData } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  if (!userData?.is_admin) {
    if (process.env.NODE_ENV === "development") {
      // Automatically upgrade local dev users to admin for testing
      const { createAdminClient } = await import("@/utils/supabase/admin");
      const adminSupabase = createAdminClient();
      await adminSupabase.from("users").update({ is_admin: true }).eq("id", session.user.id);
    } else {
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col overflow-hidden relative">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[80px] right-[-480px] w-[994px] h-[800px] opacity-40" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgb(236, 72, 153) 0%, rgba(236, 72, 153, 0) 100%)', transform: 'rotate(-30deg)' }} />
        <div className="absolute top-[80px] left-[-480px] w-[994px] h-[800px] opacity-40" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgb(59, 130, 246) 0%, rgba(59, 130, 246, 0) 100%)', transform: 'rotate(30deg)' }} />
      </div>

      {/* Shared Admin Navigation */}
      <AdminNav />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
