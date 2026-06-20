import { NextResponse } from 'next/server';
import { getSession } from '@/auth';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(req: Request) {
  try {
    const session = await getSession();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');

    const supabase = createAdminClient();

    let query = supabase
      .from('builder_pages')
      .select('id, name, template_category, template_tags, updated_at, blocks')
      .eq('is_template', true)
      .order('updated_at', { ascending: false });

    if (category) {
      query = query.eq('template_category', category);
    }
    
    if (tag) {
      query = query.contains('template_tags', [tag]);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: templates, error } = await query;

    if (error) throw error;

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
