import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { Folder } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";

export default async function DashboardPage(props: {
  searchParams: Promise<{ workspace?: string }>;
}) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const { workspace } = await props.searchParams;

  const supabase = createAdminClient();
  const { data: allWorkspaces = [], error } = await supabase
    .from("workspaces")
    .select(
      `
      id,
      name,
      domain,
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

  if (error) {
    console.error("Dashboard workspace query error:", error);
  }

  const activeWorkspaceId =
    workspace ||
    (allWorkspaces && allWorkspaces.length > 0 ? allWorkspaces[0].id : null);
  const activeWorkspace = allWorkspaces?.find(
    (w: any) => w.id === activeWorkspaceId,
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{ marginLeft: "56px" }}
      >
        <Topbar breadcrumbs={[{ label: "Workspaces" }]}>
          <WorkspaceSwitcher
            workspaces={allWorkspaces}
            activeId={activeWorkspaceId}
          />
        </Topbar>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1600px] mx-auto flex flex-col space-y-12">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-heading font-bold tracking-tight">
                  Your Growth Suite
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Manage campaigns, email sequences, traffic intelligence, sales
                  copy, and growth reporting from one central workspace.
                </p>
              </div>
              {activeWorkspace ? (
                <a
                  href={"/onboard?workspace=" + activeWorkspace.id}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Launch new campaign
                </a>
              ) : null}
            </div>

            {!activeWorkspace ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-16 text-center bg-card shadow-sm">
                <Folder className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-base font-semibold text-foreground">
                  No workspaces yet
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                  Create your first workspace to start managing campaigns.
                </p>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="flex items-center border-b border-border pb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Folder className="w-5 h-5 text-primary" />
                    Campaigns
                  </h2>
                </div>

                {activeWorkspace.builder_pages &&
                activeWorkspace.builder_pages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activeWorkspace.builder_pages.map((funnel: any) => (
                      <a
                        href={"/funnels/" + funnel.id}
                        key={funnel.id}
                        className="group block h-full"
                      >
                        <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg h-full flex flex-col relative">
                          <div className="aspect-[16/10] bg-muted/20 relative overflow-hidden border-b border-border">
                            {funnel.og_image_url ? (
                              <img
                                src={funnel.og_image_url}
                                alt={funnel.name}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground opacity-30">
                                <svg
                                  width="40"
                                  height="40"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                >
                                  <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                    ry="2"
                                  />
                                  <line x1="3" y1="9" x2="21" y2="9" />
                                  <line x1="9" y1="21" x2="9" y2="9" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="p-4 flex flex-col border-t border-border/50 bg-background/50">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {funnel.name}
                            </h3>
                            <span className="text-xs text-muted-foreground mt-1">
                              Updated{" "}
                              {new Date(funnel.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground bg-muted/10 p-10 rounded-xl border border-dashed border-border text-center">
                    <p>No campaigns in this workspace yet.</p>
                    <a
                      href={"/onboard?workspace=" + activeWorkspace.id}
                      className="text-primary hover:underline mt-2 inline-block"
                    >
                      Launch your first campaign
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
