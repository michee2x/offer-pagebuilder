import { getSession } from "@/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Folder, Plus } from "lucide-react";

interface WorkspacePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  const session = await getSession();
  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const supabase = createAdminClient();

  // Ensure user exists in users table
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", session.user.id)
    .maybeSingle();

  let userId = session.user.id;

  if (!existingUser) {
    // Get authenticated user data from Supabase Auth
    const { data: authUser } = await supabase.auth.getUser(session.user.id);

    // User doesn't exist in users table, create them
    const { data: newUser } = await supabase
      .from("users")
      .insert({
        id: session.user.id,
        email: authUser.user?.email || session.user.email || "",
        name: authUser.user?.user_metadata?.name || "",
        password: "", // Empty password for Supabase Auth users
      })
      .select("id")
      .single();

    if (newUser) {
      userId = newUser.id;
    }
  }

  let workspace = null;
  let error = null;

  const { data: ownerWorkspace, error: ownerError } = await supabase
    .from("workspaces")
    .select(
      `
        id,
        name,
        updated_at,
        builder_pages (
          id,
          name,
          updated_at,
          og_image_url,
          blocks
        )
      `,
    )
    .eq("user_id", userId)
    .eq("id", workspaceId)
    .maybeSingle();

  workspace = ownerWorkspace;
  error = ownerError;

  if (!workspace) {
    const { data: memberWorkspace, error: memberError } = await supabase
      .from("workspace_members")
      .select(
        `
          workspaces (
            id,
            name,
            updated_at,
            builder_pages (
              id,
              name,
              updated_at,
              og_image_url,
              blocks
            )
          )
        `,
      )
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .maybeSingle();

    workspace = memberWorkspace?.workspaces?.[0] || null;
    error = error || memberError;
  }

  if (error || !workspace) {
    redirect("/");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          breadcrumbs={[
            { label: "Workspaces", href: "/" },
            { label: workspace.name },
          ]}
        >
          <Link href={`/analyze?workspace=${workspace.id}`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Launch campaign
            </Button>
          </Link>
        </Topbar>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="rounded-3xl border border-border bg-card p-8">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Folder className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-semibold text-foreground">
                        {workspace.name}
                      </h1>
                      <p className="text-sm text-muted-foreground mt-1">
                        {workspace.builder_pages?.length || 0} campaigns in this
                        workspace
                      </p>
                    </div>
                  </div>
                </div>
                <Link href={`/analyze?workspace=${workspace.id}`}>
                  <Button variant="outline">Launch campaign</Button>
                </Link>
              </div>
            </div>

            {workspace.builder_pages && workspace.builder_pages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {workspace.builder_pages.map((funnel: any) => (
                  <a
                    href={`/funnels/${funnel.id}`}
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
              <div className="rounded-3xl border border-border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No campaigns have been created in this workspace yet.
                </p>
                <Link href={`/analyze?workspace=${workspace.id}`}>
                  <Button className="mt-4">Launch first campaign</Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
