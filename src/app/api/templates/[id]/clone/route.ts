import { NextResponse } from 'next/server';
import { getSession } from '@/auth';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getSession();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { workspaceId, name } = payload; // Optional workspaceId and custom name

    const supabaseAdmin = createAdminClient();

    // Fetch the template
    const { data: template, error: templateError } = await supabaseAdmin
      .from('funnel_templates')
      .select('name, blocks')
      .eq('id', id)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create a new builder_pages record
    const newFunnelName = name || `${template.name} (Clone)`;
    const funnelData: any = {
      name: newFunnelName,
      user_id: session.user.id,
      blocks: template.blocks || {},
    };

    if (workspaceId) {
      funnelData.workspace_id = workspaceId;
    }

    const { data: newFunnel, error: insertError } = await supabaseAdmin
      .from('builder_pages')
      .insert(funnelData)
      .select('id')
      .single();

    if (insertError || !newFunnel) {
      console.error('Error creating funnel from template:', insertError);
      return NextResponse.json({ error: 'Failed to create funnel from template' }, { status: 500 });
    }

    return NextResponse.json({ success: true, funnelId: newFunnel.id });
  } catch (error: any) {
    console.error('Template Clone error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
