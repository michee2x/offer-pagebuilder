import { getSession } from '@/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, Plus } from 'lucide-react';

interface WorkspacePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  const session = await getSession();
  if (!session || !session.user?.id) {
    redirect('/login');
  }

  const supabase = createAdminClient();
  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select(
      `
        id,
        name,
        updated_at,
        builder_pages (
          id,
          name,
          updated_at,
          blocks
        )
      `,
    )
    .eq('id', workspaceId)
    .eq('user_id', session.user.id)
    .single();

  if (error || !workspace) {
    redirect('/');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ marginLeft: '56px' }}>
        <Topbar
          breadcrumbs={[
            { label: 'Workspaces', href: '/' },
            { label: workspace.name },
          ]}
        >
          <Link href={`/onboard?workspace=${workspace.id}`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Funnel
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
                      <h1 className="text-3xl font-semibold text-foreground">{workspace.name}</h1>
                      <p className="text-sm text-muted-foreground mt-1">
                        {workspace.builder_pages?.length || 0} funnels in this workspace
                      </p>
                    </div>
                  </div>
                </div>
                <Link href={`/onboard?workspace=${workspace.id}`}>
                  <Button variant="outline">Create Funnel</Button>
                </Link>
              </div>
            </div>

            {workspace.builder_pages && workspace.builder_pages.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {workspace.builder_pages.map((funnel: any) => (
                  <Card key={funnel.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>{funnel.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Updated {new Date(funnel.updated_at).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Link
                          href={
                            funnel.blocks?.intelligence?.call1_complete
                              ? `/intelligence/${funnel.id}`
                              : `/builder?id=${funnel.id}`
                          }
                        >
                          <Button className="w-full">Open Funnel</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No funnels have been created in this workspace yet.
                </p>
                <Link href={`/onboard?workspace=${workspace.id}`}>
                  <Button className="mt-4">Create first funnel</Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
