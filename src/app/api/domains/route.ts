import { NextResponse } from 'next/server'
import { getSession } from '@/auth'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: Request) {
  try {
    const session = await getSession()

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pageId, subdomain, custom_domain } = await req.json()
    const userId = session.user.id

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const payload = {
        updated_at: new Date().toISOString()
    } as any;

    if (subdomain !== undefined) payload.subdomain = subdomain ? subdomain : null;
    if (custom_domain !== undefined) payload.custom_domain = custom_domain ? custom_domain : null;

    const { data: updatedPage, error } = await supabase
      .from('builder_pages')
      .update(payload)
      .eq('id', pageId)
      .eq('user_id', userId)
      .select('id, subdomain, custom_domain')
      .single()

    if (error) {
      if (error.code === '23505') {
          return NextResponse.json({ error: 'This domain or subdomain is already taken' }, { status: 400 })
      }
      throw new Error('Failed to update domain: ' + error.message)
    }

    return NextResponse.json({ success: true, page: updatedPage })

  } catch (error: any) {
    console.error('Domain update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
