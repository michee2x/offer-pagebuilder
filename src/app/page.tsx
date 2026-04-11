import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Layout, Folder, Trash2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { WorkspaceCard } from "@/components/WorkspaceCard";
import { WorkspaceCreateDialog } from "@/components/WorkspaceCreateDialog";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const supabase = createAdminClient();

  console.log("Home page loading workspaces for user:", session.user.id);
  const { data: workspaces, error: workspacesError } = await supabase
    .from("workspaces")
    .select(
      `
            id,
            name,
            created_at,
            builder_pages (
                id,
                name,
                updated_at,
                og_image_url,
                blocks
            )
        `,
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (workspacesError) {
    console.error("Home page workspace query error:", workspacesError);
  }

  const allWorkspaces = workspaces || [];
  console.log("Home page loaded workspaces count:", allWorkspaces.length);
  console.log("Home page workspaces payload:", allWorkspaces);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      {/* ml-14 offsets the fixed sidebar's icon strip */}
      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{ marginLeft: "56px" }}
      >
        <Topbar breadcrumbs={[{ label: "Workspaces" }]}>
          <button className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors relative">
            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary cursor-pointer">
            SC
          </div>
        </Topbar>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto flex flex-col space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-heading font-bold tracking-tight">
                  Your Workspaces
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Manage your workspaces and create new funnels.
                </p>
              </div>
              <WorkspaceCreateDialog />
            </div>

            {allWorkspaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-16 text-center bg-card shadow-sm">
                <Folder className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-base font-semibold text-foreground">
                  No workspaces yet
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                  Create your first workspace to start building funnels.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {allWorkspaces.map((workspace: any) => (
                  <WorkspaceCard key={workspace.id} workspace={workspace} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
