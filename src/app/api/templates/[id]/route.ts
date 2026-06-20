import { NextResponse } from 'next/server';
import { getSession } from '@/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const supabase = await createClient();

    const { data: template, error } = await supabase
      .from('funnel_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('Template GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getSession();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    
    // Check if user is admin
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (!userRecord?.is_admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const payload = await req.json();
    const { name, description, category, tags, blocks, is_active } = payload;

    const updates: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (blocks !== undefined) updates.blocks = blocks;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data: template, error } = await supabaseAdmin
      .from('funnel_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('Template PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getSession();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    
    // Check if user is admin
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (!userRecord?.is_admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('funnel_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template:', error);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Template DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
