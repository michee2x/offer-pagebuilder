import { NextResponse } from 'next/server';
import { getSession } from '@/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

// GET all templates
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    const supabase = await createClient();
    
    // We can use the regular client, but templates might be public anyway.
    let query = supabase
      .from('funnel_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('Templates API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create a new template (Admin only)
export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client to verify admin status
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
    const { name, description, category, tags, blocks } = payload;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data: template, error } = await supabaseAdmin
      .from('funnel_templates')
      .insert({
        name,
        description,
        category,
        tags: tags || [],
        blocks: blocks || {},
        created_by: session.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    console.error('Create template API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
