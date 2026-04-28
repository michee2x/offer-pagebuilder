import { redirect }           from 'next/navigation';
import { getSession }         from '@/auth';
import { createAdminClient }  from '@/utils/supabase/admin';
import { Sidebar }            from '@/components/layout/Sidebar';
import { Topbar }             from '@/components/layout/Topbar';
import { FunnelSidebar }      from '@/components/layout/FunnelSidebar';
import { LeadsDashboard }     from './LeadsDashboard';

interface Props {
  params: Promise<{ funnelId: string }>;
}

export default async function LeadsPage({ params }: Props) {
  const { funnelId } = await params;
  const session = await getSession();

  if (!session?.user?.id) redirect('/login');

  const supabase = createAdminClient();

  const { data: funnel } = await supabase
    .from('builder_pages')
    .select('id, name')
    .eq('id', funnelId)
    .eq('user_id', session.user.id)
    .single();

  if (!funnel) redirect('/');

  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, email, phone, source_page, created_at')
    .eq('funnel_id', funnelId)
    .order('created_at', { ascending: false });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ marginLeft: '56px' }}>
        <Topbar
          breadcrumbs={[
            { label: 'Workspaces', href: '/' },
            { label: funnel.name, href: `/funnels/${funnelId}` },
            { label: 'Leads' },
          ]}
        />
        <div className="flex flex-1 overflow-hidden">
          <FunnelSidebar funnelId={funnelId} funnelName={funnel.name} collapsible />
          <LeadsDashboard leads={leads ?? []} funnelName={funnel.name} />
        </div>
      </div>
    </div>
  );
}
