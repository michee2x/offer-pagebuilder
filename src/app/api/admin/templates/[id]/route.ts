import { NextResponse } from 'next/server';
import { getSession } from '@/auth';
import { createAdminClient } from '@/utils/supabase/admin';

async function verifyAdmin(session: any, supabase: any) {
  if (!session || !session.user?.id) return false;
  const { data: user } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();
  return user?.is_admin === true;
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const session = await getSession();
    const supabase = createAdminClient();

    if (!(await verifyAdmin(session, supabase))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { is_template, template_category, template_tags } = body;

    const { data: template, error } = await supabase
      .from('builder_pages')
      .update({
        is_template,
        template_category,
        template_tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('Error updating template status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const session = await getSession();
    const supabase = createAdminClient();

    if (!(await verifyAdmin(session, supabase))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Unmark as template
    const { error } = await supabase
      .from('builder_pages')
      .update({
        is_template: false,
        template_category: null,
        template_tags: '{}',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error unmarking template:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
