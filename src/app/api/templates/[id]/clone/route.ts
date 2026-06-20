import { NextResponse } from 'next/server';
import { getSession } from '@/auth';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const session = await getSession();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch the template
    const { data: template, error: fetchError } = await supabase
      .from('builder_pages')
      .select('*')
      .eq('id', id)
      .eq('is_template', true)
      .single();

    if (fetchError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // 2. Insert as a new regular builder_page for the user
    const { data: newFunnel, error: insertError } = await supabase
      .from('builder_pages')
      .insert({
        user_id: session.user.id,
        workspace_id: workspaceId,
        name: name || `${template.name} (Copy)`,
        blocks: template.blocks,
        is_template: false, // Ensure the clone is NOT a template
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, funnelId: newFunnel.id });
  } catch (error: any) {
    console.error('Error cloning template:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
